import type { ID, ISODateString } from "./common";
import type { Destination } from "./destination";
import type { TripPlan } from "./trip";

export interface SavedDestination {
  id: ID;
  destination: Destination;
  savedAt: ISODateString;
}

export type SavedPlanStatus = "aktif" | "arsip";

export interface SavedTripPlan {
  id: ID;
  plan: TripPlan;
  status: SavedPlanStatus;
  savedAt: ISODateString;
}

export interface SavedChecklist {
  id: ID;
  name: string;
  destination: Destination;
  completedCount: number;
  totalCount: number;
  finished: boolean;
  savedAt: ISODateString;
}
