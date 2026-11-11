import { createHash } from "node:crypto";
import { AppConfig } from "../../config/AppConfig";
import { aiRepository } from "../../repositories/ai.repository";
import { AppError } from "../../utils/errors";
import { destinationService } from "../destination.service";
import { generateWithGemini } from "./gemini.service";
import {
  buildDeterministicChecklist,
  buildDeterministicItinerary,
  buildRecommendationCards,
} from "./itinerary.service";
import { aiRetrieval, type AiContext, type AiPreferenceInput } from "./retrieval.service";
import type {
  AiChecklistItem,
  AiItineraryPayload,
  AiOptions,
} from "./types";

const normalizeProvinceName = (value?: string | null): string =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^provinsi\s+/, "")
    .replace(/^dki\s+/, "jakarta ")
    .replace(/^di\s+/, "yogyakarta ")
    .trim();

function needsInterprovinceTransport(
  context: AiContext,
  input: AiPreferenceInput,
): boolean {
  const origin = normalizeProvinceName(input.originProvince);
  if (!origin) return false;
  return context.destinations.some((destination) => {
    const province = normalizeProvinceName(destination.province);
    return province.length > 0 && province !== origin;
  });
}

function mergeChecklistItems(
  primary: AiChecklistItem[],
  fallback: AiChecklistItem[],
): AiChecklistItem[] {
  const seen = new Set<string>();
  const merged: AiChecklistItem[] = [];
  for (const item of [...primary, ...fallback]) {
    const key = item.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

const hashInput = (input: AiPreferenceInput): string =>
  createHash("sha256")
    // Bump when the prompt/retrieval contract changes so older cached rows do
    // not bypass new grounding/notice rules.
    .update("ai-v6:")
    .update(JSON.stringify(input, Object.keys(input).sort()))
    .digest("hex");

/** Add a consistent "not found in catalog" notice to any engine result. */
export function attachQueryNotice(
  result: AiItineraryPayload,
  context: AiContext,
): AiItineraryPayload {
  const warnings = [...result.briefing.warnings];
  let notice = result.notice;

  if (context.invalidDestinationIds.length > 0) {
    warnings.unshift(
      `${context.invalidDestinationIds.length} destinasi pilihan tidak ditemukan di katalog dan dilewati.`,
    );
  }

  if (!context.queryMatched) {
    const terms = context.unmatchedTerms.join(", ");
    const label = terms ? ` (${terms})` : "";
    const hasAlternatives = context.destinations.length > 0;
    notice = hasAlternatives
      ? `Maaf, destinasi yang kamu cari${label} belum ada di Dolenae. Berikut rekomendasi alternatif yang paling sesuai dengan preferensimu.`
      : `Maaf, destinasi yang kamu cari${label} belum ada di Dolenae dan belum ada alternatif yang cocok. Coba longgarkan preferensimu.`;
    warnings.unshift(
      hasAlternatives
        ? `Kata kunci "${terms}" belum ada di data destinasi; itinerary memakai alternatif terdekat.`
        : `Kata kunci "${terms}" belum ada di data destinasi dan tidak ada alternatif yang cocok.`,
    );
  }

  return {
    ...result,
    notice,
    briefing: {
      ...result.briefing,
      warnings: [...new Set(warnings)],
    },
  };
}

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
    options: { refresh?: boolean } = {},
  ): Promise<AiItineraryPayload> {
    const config = AppConfig.load();
    const cacheSince = new Date(
      Date.now() - config.aiCacheTtlHours * 60 * 60 * 1000,
    );
    const requestHash = hashInput(input);

    if (!options.refresh) {
      const cached = await aiRepository.findRecent(
        userId,
        requestHash,
        cacheSince,
      );
      if (cached) {
        return cached.resultJson as AiItineraryPayload;
      }
    }

    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const usage = await aiRepository.countSince(userId, dayStart);
    if (usage >= config.aiDailyLimit) {
      throw new AppError(
        429,
        "AI_RATE_LIMITED",
        `Batas harian AI tercapai (${config.aiDailyLimit}/hari). Coba lagi besok.`,
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
    result = attachQueryNotice(result, context);

    // Keep the AI checklist useful even when the model returns only a few
    // items. The deterministic list fills the gaps without touching the
    // model's itinerary.
    const originDiff = needsInterprovinceTransport(context, input);
    const hasInterprovinceAlternatives = result.checklistItems.some(
      (item) =>
        item.alternativeGroup === "transport-antarprovinsi" ||
        /pesawat|kapal laut/i.test(item.name),
    );
    if (
      context.destinations.length > 0 &&
      (result.checklistItems.length < 12 ||
        (originDiff && !hasInterprovinceAlternatives))
    ) {
      const requestedDays = Math.min(
        Math.max(input.durationDays ?? 2, 1),
        7,
      );
      const fallback = buildDeterministicChecklist(
        context,
        input,
        context.destinations,
        requestedDays,
      );
      const additions =
        result.checklistItems.length < 12
          ? fallback
          : fallback.filter(
              (item) =>
                item.alternativeGroup === "transport-antarprovinsi",
            );
      const checklistItems = mergeChecklistItems(
        result.checklistItems,
        additions,
      );
      result = {
        ...result,
        checklistItems,
        checklist: checklistItems.map((item) => item.name),
      };
    }

    result = {
      ...result,
      recommendations: buildRecommendationCards(context, result),
    };

    const latencyMs = Date.now() - startedAt;

    await aiRepository
      .save({
        userId,
        requestHash,
        request: input,
        result,
        model: result.model ?? config.aiModel,
        engine: result.engine,
        latencyMs,
        status: result.engine === "gemini" ? "ok" : "fallback",
      })
      .catch(() => undefined);

    return result;
  },
};
