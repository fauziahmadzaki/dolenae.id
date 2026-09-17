import type { ID, ISODateString } from "./common";
import type { Destination } from "./destination";
import type { TravelSupport } from "./travel-support";

export interface PreparationItem {
  id: ID;
  name: string;
  category: "perlengkapan" | "kesehatan" | "konservasi" | "administrasi";
  required: boolean;
  weightEstimateKg?: number;
  note?: string;
}

export interface PreparationChecklist {
  destinationId: ID;
  items: PreparationItem[];
}

export interface TripPlanItem {
  id: ID;
  order: number;
  date?: ISODateString;
  destination: Destination;
  supportsChosen: TravelSupport[];
  notes?: string;
  checklistCompleted: ID[];
}

export interface TripPlan {
  id: ID;
  userId: ID;
  name: string;
  items: TripPlanItem[];
  startDate?: ISODateString;
  endDate?: ISODateString;
  totalEstimatedBudget?: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}