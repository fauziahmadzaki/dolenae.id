import { z } from "zod";
import type {
  AiChecklistCategory,
  AiChecklistItem,
  AiContext,
  AiItineraryPayload,
  AiSource,
} from "../../types/ai";
import { checklistUtil } from "./ChecklistUtil";

const CHECKLIST_CATEGORIES: AiChecklistCategory[] = [
  "perlengkapan",
  "kesehatan",
  "konservasi",
  "administrasi",
  "biaya",
];

const itemSchema = z.object({
  destinationId: z.string().nullable().optional(),
  destinationName: z.string().trim().min(1).max(160),
  routeId: z.string().nullable().optional(),
  supportIds: z.array(z.string()).max(10).optional(),
  activity: z.string().trim().min(1).max(160),
  startTime: z.string().trim().max(20).optional(),
  costEstimate: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(800).optional(),
});

const payloadSchema = z.object({
  itinerary: z.object({
    title: z.string().trim().min(1).max(160),
    summary: z.string().trim().min(1).max(1500),
    days: z
      .array(
        z.object({
          day: z.number().int().min(1).max(7),
          title: z.string().trim().min(1).max(160),
          items: z.array(itemSchema).min(1).max(6),
        }),
      )
      .min(1)
      .max(7),
  }),
  briefing: z.object({
    grounded: z.array(z.string().max(600)).max(20),
    general: z.array(z.string().max(600)).max(20),
    warnings: z.array(z.string().max(600)).max(20),
  }),
  checklist: z.array(z.string().max(160)).max(30).default([]),
  checklistItems: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(160),
        category: z.string().max(40).optional(),
        estimatedCost: z.union([z.number(), z.string()]).optional().nullable(),
        note: z.string().trim().max(300).optional(),
        isRequired: z.boolean().optional(),
        alternativeGroup: z.string().trim().max(80).optional(),
        selected: z.boolean().optional(),
      }),
    )
    .max(40)
    .optional(),
});

type RawChecklistItem = {
  name: string;
  category?: string;
  estimatedCost?: number | string | null;
  note?: string;
  isRequired?: boolean;
  alternativeGroup?: string;
  selected?: boolean;
};

class AiPayloadValidator {
  private normalizeChecklistCategory(value: string): AiChecklistCategory {
    const normalized = value.trim().toLowerCase();
    return CHECKLIST_CATEGORIES.includes(normalized as AiChecklistCategory)
      ? (normalized as AiChecklistCategory)
      : checklistUtil.inferCategory(value);
  }

  private parseEstimatedCost(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(0, Math.round(value));
    }
    if (typeof value === "string") {
      const digits = value.replace(/\D/g, "");
      if (!digits) return null;
      return Math.max(0, Number.parseInt(digits, 10));
    }
    return null;
  }

  private normalizeChecklistItems(parsed: {
    checklist: string[];
    checklistItems?: RawChecklistItem[];
  }): AiChecklistItem[] {
    const source: RawChecklistItem[] =
      parsed.checklistItems && parsed.checklistItems.length > 0
        ? parsed.checklistItems
        : parsed.checklist.map((name) => ({
            name,
            isRequired: true,
          }));
    const seen = new Set<string>();
    const items: AiChecklistItem[] = [];

    for (const item of source) {
      const name = item.name.trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) continue;
      seen.add(key);
      items.push({
        name,
        category: item.category
          ? this.normalizeChecklistCategory(item.category)
          : checklistUtil.inferCategory(name),
        estimatedCost: this.parseEstimatedCost(item.estimatedCost),
        note: item.note?.trim() || undefined,
        isRequired: item.isRequired ?? true,
        alternativeGroup: item.alternativeGroup?.trim() || undefined,
        selected: item.selected,
      });
    }

    // Only one option per alternative group may be counted.
    const groups = new Map<string, AiChecklistItem[]>();
    for (const item of items) {
      if (!item.alternativeGroup) continue;
      const group = groups.get(item.alternativeGroup) ?? [];
      group.push(item);
      groups.set(item.alternativeGroup, group);
    }
    for (const group of groups.values()) {
      const selected = group.filter((item) => item.selected !== false);
      if (selected.length > 1) {
        for (const item of selected.slice(1)) item.selected = false;
      } else if (selected.length === 0) {
        group[0]!.selected = true;
      }
    }

    return items;
  }

  /**
   * Validate an LLM payload and remove any IDs that were not part of the
   * retrieved context (anti-hallucination).
   */
  validate(
    raw: unknown,
    context: AiContext,
    engine: AiItineraryPayload["engine"],
    model?: string | null,
  ): AiItineraryPayload | null {
    const parsed = payloadSchema.safeParse(raw);
    if (!parsed.success) return null;

    const destinationById = new Map(
      context.destinations.map((destination) => [destination.id, destination]),
    );
    const routeById = new Map(context.routes.map((route) => [route.id, route]));
    const supportById = new Map(
      context.supports.map((support) => [support.id, support]),
    );

    const hasExplicitDestinations =
      (context.preference.destinationIds?.length ?? 0) > 0;
    const rawDays = [...parsed.data.itinerary.days].sort((a, b) => a.day - b.day);
    const expectedDays = context.preference.durationDays
      ? Math.min(Math.max(context.preference.durationDays, 1), 7)
      : null;

    // Require consecutive day numbers 1..N with zero duplicates or gaps,
    // and match requested durationDays when specified.
    if (expectedDays != null && rawDays.length !== expectedDays) {
      return null;
    }
    for (let i = 0; i < rawDays.length; i += 1) {
      if (rawDays[i]!.day !== i + 1) {
        return null;
      }
    }

    const sources = new Map<string, AiSource>();
    const addSource = (source: AiSource) =>
      sources.set(`${source.type}:${source.id}`, source);

    let hasBrokenExplicitItem = false;
    const days = rawDays.map((day) => ({
      ...day,
      items: day.items.map((item) => {
        const rawDestId = item.destinationId?.trim() || null;
        const destination = rawDestId
          ? destinationById.get(rawDestId)
          : undefined;
        if (rawDestId && !destination && hasExplicitDestinations) {
          hasBrokenExplicitItem = true;
        }
        const destinationId = destination?.id ?? null;

        // Never attach catalog routeId/supportIds to an unverified stop.
        const route =
          destinationId && item.routeId
            ? routeById.get(item.routeId)
            : undefined;
        const routeId =
          route && route.destinationId === destinationId ? route.id : null;

        if (destination) {
          addSource({
            type: "destination",
            id: destination.id,
            label: destination.name,
          });
        }
        if (route && routeId) {
          addSource({ type: "route", id: route.id, label: route.name });
        }
        const supportIds = destinationId
          ? (item.supportIds ?? []).filter((id) => {
              const support = supportById.get(id);
              return Boolean(support) && support!.destinationId === destinationId;
            })
          : [];
        for (const id of supportIds) {
          const support = supportById.get(id)!;
          addSource({ type: "support", id: support.id, label: support.name });
        }

        return {
          ...item,
          destinationId,
          destinationName: destination?.name ?? "Destinasi rekomendasi",
          routeId,
          supportIds,
        };
      }),
    }));

    if (hasBrokenExplicitItem) return null;
    if (days.every((day) => day.items.length === 0)) return null;

    // When retrieval found real destinations, reject an itinerary that ignores
    // all of them. The deterministic builder is better than invented stops.
    const grounded = days.some((day) =>
      day.items.some((item) => item.destinationId !== null),
    );
    if (context.destinations.length > 0 && !grounded) return null;

    // Explicitly selected destinations are a hard requirement. If the model
    // drops one, fall back to the deterministic builder which schedules all.
    if (hasExplicitDestinations) {
      const usedIds = new Set(
        days
          .flatMap((day) => day.items.map((item) => item.destinationId))
          .filter((id): id is string => Boolean(id)),
      );
      const missing = context.destinations.some(
        (destination) => !usedIds.has(destination.id),
      );
      if (missing) return null;
    }

    // Build briefing.grounded strictly from verified catalog records (never
    // trust freeform LLM prose under "DARI DATA DOLENAE").
    const verifiedGrounded: string[] = [];
    for (const source of sources.values()) {
      if (source.type === "destination") {
        const dest = destinationById.get(source.id);
        if (dest) {
          const season =
            dest.bestSeason.length > 0
              ? `, musim terbaik: ${dest.bestSeason.join(", ")}`
              : "";
          verifiedGrounded.push(
            `${dest.name} (${dest.province}, tingkat ${dest.difficulty}${season}).`,
          );
        }
      } else if (source.type === "route") {
        const route = routeById.get(source.id);
        if (route) {
          verifiedGrounded.push(
            `Jalur ${route.name}: ${route.totalDistanceKm} km, +${route.totalGainMeters} m, ±${route.estimatedDurationMinutes} menit.`,
          );
        }
      } else if (source.type === "support") {
        const support = supportById.get(source.id);
        if (support) {
          verifiedGrounded.push(
            `Fasilitas ${support.name} (${support.category}${support.priceMin != null ? `, mulai Rp${support.priceMin.toLocaleString("id-ID")}` : ""}).`,
          );
        }
      }
    }

    const checklistItems = this.normalizeChecklistItems(parsed.data);

    return {
      itinerary: {
        ...parsed.data.itinerary,
        days,
      },
      briefing: {
        grounded: verifiedGrounded,
        general: parsed.data.briefing.general,
        warnings: parsed.data.briefing.warnings,
      },
      checklist: checklistItems.map((item) => item.name),
      checklistItems,
      sources: [...sources.values()],
      engine,
      model: model ?? null,
    };
  }
}

export const aiPayloadValidator = new AiPayloadValidator();

