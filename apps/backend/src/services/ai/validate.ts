import { z } from "zod";
import type { AiContext } from "./retrieval.service";
import type { AiItineraryPayload, AiSource } from "./types";

const itemSchema = z.object({
  destinationId: z.string().nullable().optional(),
  destinationName: z.string().trim().min(1).max(160),
  routeId: z.string().nullable().optional(),
  supportIds: z.array(z.string()).max(10).optional(),
  activity: z.string().trim().min(1).max(160),
  startTime: z.string().trim().max(20).optional(),
  costEstimate: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(600).optional(),
});

const payloadSchema = z.object({
  itinerary: z.object({
    title: z.string().trim().min(1).max(160),
    summary: z.string().trim().min(1).max(1000),
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
});

/**
 * Validate an LLM payload and remove any IDs that were not part of the
 * retrieved context (anti-hallucination).
 */
export function validateAiPayload(
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

  const sources = new Map<string, AiSource>();
  const addSource = (source: AiSource) =>
    sources.set(`${source.type}:${source.id}`, source);

  const days = parsed.data.itinerary.days.map((day) => ({
    ...day,
    items: day.items.map((item) => {
      const destination = item.destinationId
        ? destinationById.get(item.destinationId)
        : undefined;
      const destinationId = destination?.id ?? null;
      const route = item.routeId ? routeById.get(item.routeId) : undefined;
      const routeId =
        route && (!destinationId || route.destinationId === destinationId)
          ? route.id
          : null;

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
      const supportIds = (item.supportIds ?? []).filter((id) => {
        const support = supportById.get(id);
        return Boolean(support) && (!destinationId || support!.destinationId === destinationId);
      });
      for (const id of supportIds) {
        const support = supportById.get(id)!;
        addSource({ type: "support", id: support.id, label: support.name });
      }

      return {
        ...item,
        destinationId,
        destinationName: destination?.name ?? item.destinationName,
        routeId,
        supportIds,
      };
    }),
  }));

  if (days.every((day) => day.items.length === 0)) return null;

  // When retrieval found real destinations, reject an itinerary that ignores
  // all of them. The deterministic builder is better than invented stops.
  const grounded = days.some((day) =>
    day.items.some((item) => item.destinationId !== null),
  );
  if (context.destinations.length > 0 && !grounded) return null;

  return {
    itinerary: {
      ...parsed.data.itinerary,
      days,
    },
    briefing: parsed.data.briefing,
    checklist: parsed.data.checklist,
    sources: [...sources.values()],
    engine,
    model: model ?? null,
  };
}
