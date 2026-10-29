import { createHash } from "node:crypto";
import { loadEnv } from "../../config/env";
import { aiRepository } from "../../repositories/ai.repository";
import { AppError } from "../../utils/errors";
import { generateWithGemini } from "./gemini.service";
import { buildDeterministicItinerary } from "./itinerary.service";
import { aiRetrieval, type AiPreferenceInput } from "./retrieval.service";
import type { AiItineraryPayload } from "./types";

const hashInput = (input: AiPreferenceInput): string =>
  createHash("sha256")
    .update(JSON.stringify(input, Object.keys(input).sort()))
    .digest("hex");

export const aiService = {
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

    // Gemini is optional: without a key or on any failure we fall back to the
    // deterministic builder so the endpoint always answers.
    let result = await generateWithGemini(context, input);
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
