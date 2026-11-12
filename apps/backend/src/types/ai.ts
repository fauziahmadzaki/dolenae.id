import type { z } from "zod";
import type { Difficulty } from "../db/models";
import type {
  aiItinerarySchema,
} from "../schemas/ai.schema";
import type {
  testAiSchema,
  updateAiSettingsSchema,
} from "../schemas/ai-admin.schema";

export type AiItineraryBody = z.infer<typeof aiItinerarySchema>;
export type UpdateAiSettingsBody = z.infer<typeof updateAiSettingsSchema>;
export type TestAiBody = z.infer<typeof testAiSchema>;

// --- Domain & engine payloads ---------------------------------------------

export type AiEngine = "gemini" | "deterministic";

export interface AiPreferenceInput {
  /** Destinations explicitly picked by the user; order is preserved. */
  destinationIds?: string[];
  originProvince?: string;
  rawText?: string;
  regions?: string[];
  activities?: string[];
  terrains?: string[];
  difficulty?: Difficulty;
  durationDays?: number;
  budgetPerPerson?: number;
  needsAccommodation?: boolean;
  needsTransport?: boolean;
  note?: string;
}

export interface AiContextDestination {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  images: string[];
  province: string | null;
  regency: string | null;
  difficulty: Difficulty;
  elevationMeters: number | null;
  entryFee: number | null;
  bestSeason: string[];
  guideRequired: boolean;
  facilities: string[];
  description: string | null;
  categories: string[];
}

export interface AiContextSupport {
  id: string;
  destinationId: string;
  name: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  priceLabel: string | null;
  locationLabel: string | null;
  verified: boolean;
}

export interface AiContextRoute {
  id: string;
  destinationId: string;
  name: string;
  surface: string;
  status: string;
  totalDistanceKm: number;
  totalGainMeters: number;
  estimatedDurationMinutes: number;
}

export interface AiContext {
  preference: AiPreferenceInput;
  destinations: AiContextDestination[];
  supports: AiContextSupport[];
  routes: AiContextRoute[];
  /** Human-readable filters that were relaxed because no result matched. */
  relaxed: string[];
  /** False when a significant keyword in rawText is absent from the catalog. */
  queryMatched: boolean;
  unmatchedTerms: string[];
  /** Requested destination IDs that are not published or no longer exist. */
  invalidDestinationIds: string[];
}

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

export type AiChecklistCategory =
  | "perlengkapan"
  | "kesehatan"
  | "konservasi"
  | "administrasi"
  | "biaya";

export interface AiChecklistItem {
  name: string;
  category: AiChecklistCategory;
  /** Estimated cost per person in rupiah; null when no reliable estimate. */
  estimatedCost: number | null;
  note?: string;
  isRequired: boolean;
  /** Marks a set of mutually exclusive options, e.g. flight vs ferry. */
  alternativeGroup?: string;
  /** Whether this alternative is selected for the cost total. */
  selected?: boolean;
}

export interface AiItineraryPayload {
  itinerary: {
    title: string;
    summary: string;
    days: AiItineraryDay[];
  };
  briefing: AiBriefing;
  /** Legacy string-only checklist kept for older clients. */
  checklist: string[];
  checklistItems: AiChecklistItem[];
  sources: AiSource[];
  engine: AiEngine;
  model?: string | null;
  /** Optional user-facing notice, e.g. the requested place is not in the catalog. */
  notice?: string;
  /** Card-ready destination summaries for the mobile result screen. */
  recommendations?: AiRecommendationCard[];
}
