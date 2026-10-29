import { createHash } from "node:crypto";
import { loadEnv } from "../../config/env";
import { aiRepository } from "../../repositories/ai.repository";
import { AppError } from "../../utils/errors";
import { destinationService } from "../destination.service";
import { generateWithGemini } from "./gemini.service";
import { buildDeterministicItinerary } from "./itinerary.service";
import { aiRetrieval, type AiPreferenceInput } from "./retrieval.service";
import type { AiItineraryPayload, AiOptions } from "./types";

const hashInput = (input: AiPreferenceInput): string =>
  createHash("sha256")
    .update(JSON.stringify(input, Object.keys(input).sort()))
    .digest("hex");

export const aiService = {
  /** Preference options derived from destinations currently in the catalog. */
  async getOptions(): Promise<AiOptions> {
    const list = await destinationService.list({
      page: 1,
      limit: 100,
      sort: "name",
      order: "asc",
      status: "published",
    });

    const regions = new Set<string>();
    const activities = new Set<string>();
    const terrains = new Set<string>();

    for (const destination of list.items) {
      if (destination.location.province) {
        regions.add(destination.location.province);
      }
      for (const activity of destination.activities) activities.add(activity);
      for (const terrain of destination.terrain) terrains.add(terrain);
    }

    const sorted = (values: Set<string>) =>
      [...values].sort((a, b) => a.localeCompare(b));

    return {
      regions: sorted(regions),
      activities: sorted(activities),
      terrains: sorted(terrains),
      difficulties: [
        { label: "Ramah pemula", value: "ramah-pemula" },
        { label: "Menengah", value: "menengah" },
        { label: "Sulit", value: "sulit" },
      ],
      durations: [1, 2, 3, 4, 5, 6, 7],
    };
  },

  async generate(
    userId: string,
    input: AiPreferenceInput,
  ): Promise<AiItineraryPayload> {
    const env = loadEnv();
    const cacheSince = new Date(
      Date.now() - env.AI_CACHE_TTL_HOURS * 60 * 60 * 1000,
    );
    const requestHash = hashInput(input);

    const cached = await aiRepository.findRecent(
      userId,
      requestHash,
      cacheSince,
    );
    if (cached) {
      return cached.resultJson as AiItineraryPayload;
    }

    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const usage = await aiRepository.countSince(userId, dayStart);
    if (usage >= env.AI_DAILY_LIMIT) {
      throw new AppError(
        429,
        "AI_RATE_LIMITED",
        `Batas harian AI tercapai (${env.AI_DAILY_LIMIT}/hari). Coba lagi besok.`,
      );
    }

    const startedAt = Date.now();
    const context = await aiRetrieval.build(input);

    // Gemini is optional. Skip it entirely when retrieval found no destination,
    // otherwise the model tends to invent generic ungrounded stops.
    let result =
      context.destinations.length > 0
        ? await generateWithGemini(context, input)
        : null;
    if (!result) {
      result = buildDeterministicItinerary(context, input);
    }

    const latencyMs = Date.now() - startedAt;

    await aiRepository
      .save({
        userId,
        requestHash,
        request: input,
        result,
        model: result.model ?? env.AI_MODEL,
        engine: result.engine,
        latencyMs,
        status: result.engine === "gemini" ? "ok" : "fallback",
      })
      .catch(() => undefined);

    return result;
  },
};
