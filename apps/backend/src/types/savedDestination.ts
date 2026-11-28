import type { PublicDestination } from "./destination";

export interface PublicSavedDestination {
  id: string;
  destinationId: string;
  savedAt: string;
  destination: PublicDestination;
}

export interface SavedDestinationDeleteResult {
  deleted: true;
  destinationId: string;
}

export interface SavedDestinationParams {
  destinationId: string;
}
