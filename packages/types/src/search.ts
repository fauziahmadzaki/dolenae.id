import type { DestinationCondition } from "./destination";

export type SortOption = "populer" | "rating" | "terdekat" | "termurah";

/** Tingkat kesulitan di filter; "semua" berarti tanpa pembatasan. */
export type DifficultyFilter = "semua" | DestinationCondition;

/** Isi bottom sheet "Filter & urutkan" dan state Jelajah. */
export interface SearchFilter {
  query: string;
  sort: SortOption;
  difficulty: DifficultyFilter;
  /** Label fasilitas, mis. "Area camping", "Homestay". */
  supports: string[];
  /** Filter "Terverifikasi" untuk fasilitas pendukung. */
  verifiedOnly: boolean;
}

export const defaultSearchFilter: SearchFilter = {
  query: "",
  sort: "populer",
  difficulty: "semua",
  supports: [],
  verifiedOnly: false,
};
