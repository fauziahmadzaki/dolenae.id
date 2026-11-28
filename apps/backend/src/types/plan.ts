import type { z } from "zod";
import type { NewTripPlanRow } from "../db/models";
import type {
  createPlanSchema,
  planClientIdParamsSchema,
  planIdParamsSchema,
  updatePlanSchema,
} from "../schemas/plan.schema";

export type TripPlanEngine = "draft" | "gemini" | "deterministic";

export type TripPlanChecklistCategory =
  | "perlengkapan"
  | "kesehatan"
  | "konservasi"
  | "administrasi"
  | "biaya";

export interface TripPlanBriefing {
  grounded: string[];
  general: string[];
  warnings: string[];
}

export interface TripPlanDayItem {
  destinationId?: string | null;
  destinationName: string;
  routeId?: string | null;
  supportIds?: string[];
  activity: string;
  startTime?: string;
  costEstimate?: string;
  notes?: string;
}

export interface TripPlanDay {
  day: number;
  title: string;
  items: TripPlanDayItem[];
}

export interface TripPlanSource {
  type: "destination" | "route" | "support";
  id: string;
  label: string;
}

export interface TripPlanChecklistItem {
  id?: string;
  name: string;
  category: TripPlanChecklistCategory;
  isRequired: boolean;
  isCompleted?: boolean;
  isOwned?: boolean;
  estimatedCost?: number | null;
  note?: string;
  alternativeGroup?: string;
}

export interface PublicTripPlan {
  id: string;
  userId: string;
  clientId: string | null;
  title: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  totalBudget: number;
  originProvince: string;
  note: string;
  summary: string;
  engine: TripPlanEngine;
  notice: string | null;
  aiWarning: string | null;
  destinationIds: string[];
  briefing: TripPlanBriefing;
  days: TripPlanDay[];
  sources: TripPlanSource[];
  checklist: TripPlanChecklistItem[];
  checklistReady: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreatePlanBody = z.infer<typeof createPlanSchema>;
export type UpdatePlanBody = z.infer<typeof updatePlanSchema>;
export type PlanIdParams = z.infer<typeof planIdParamsSchema>;
export type PlanClientIdParams = z.infer<typeof planClientIdParamsSchema>;

export type PlanPatch = Partial<
  Omit<NewTripPlanRow, "id" | "userId" | "createdAt">
>;
