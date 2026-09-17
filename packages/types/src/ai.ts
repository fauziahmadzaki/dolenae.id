import type { ISODateString } from "./common";
import type { Destination } from "./destination";

export interface Preference {
  regions?: string[];
  activities?: string[];
  terrains?: string[];
  difficulty?: string;
  pricePref?: "ekonomis" | "menengah" | "premium";
  durationDays?: number;
  season?: string;
  budgetPerPerson?: number;
  needsAccommodation?: boolean;
  needsTransport?: boolean;
  rawText?: string;
}

export interface RuleScore {
  destinationId: string;
  score: number;
  reasons: string[];
}

export type RecommendationKind = "rule-based" | "llm";

export interface RecommendationResult {
  kind: RecommendationKind;
  engine?: string;
  generatedAt: ISODateString;
  input: Preference;
  scores: RuleScore[];
  destinations: Destination[];
  summary: string;
  relatedChecklist?: string[];
}

export interface RecommendationContext {
  preferences: Preference;
  availableDestinations: Destination[];
  limit?: number;
}