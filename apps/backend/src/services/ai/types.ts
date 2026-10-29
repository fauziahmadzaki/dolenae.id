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
}
