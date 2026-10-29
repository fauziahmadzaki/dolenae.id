import type { Difficulty } from "../../db/schema";

export type AiEngine = "gemini" | "deterministic";

export interface AiItineraryItem {
  destinationId: string | null;
  destinationName: string;
  routeId: string | null;
  activity: string;
  startTime?: string;
  costEstimate?: string;
  notes?: string;
}

export interface AiItineraryDay {
  day: number;
  title: string;
  items: AiItineraryItem[];
}

export interface AiBriefing {
  grounded: string[];
  general: string[];
  warnings: string[];
}

export interface AiSource {
  type: "destination" | "route" | "support";
  id: string;
  label: string;
}

export interface AiOption {
  label: string;
  value: string;
}

export interface AiOptions {
  regions: string[];
  activities: string[];
  terrains: string[];
  difficulties: AiOption[];
  durations: number[];
}

export interface AiRecommendationCard {
  destinationId: string;
  name: string;
  slug: string;
  tagline: string | null;
  province: string | null;
  regency: string | null;
  elevationMeters: number | null;
  entryFee: number | null;
  difficulty: Difficulty;
  images: string[];
  score: number;
  rank: number;
  reasons: string[];
}

export interface AiItineraryPayload {
  itinerary: {
    title: string;
    summary: string;
    days: AiItineraryDay[];
  };
  briefing: AiBriefing;
  checklist: string[];
  sources: AiSource[];
  engine: AiEngine;
  model?: string | null;
  /** Optional user-facing notice, e.g. the requested place is not in the catalog. */
  notice?: string;
  /** Card-ready destination summaries for the mobile result screen. */
  recommendations?: AiRecommendationCard[];
}
