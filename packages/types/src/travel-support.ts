import type { ID } from "./common";

export type PriceRange = "ekonomis" | "menengah" | "premium";

export interface ContactInfo {
  phone?: string;
  whatsapp?: string;
  instagram?: string;
}

export type TravelSupportType = "accommodation" | "transport" | "food";

export interface TravelSupportBase {
  id: ID;
  name: string;
  destinationId: ID;
  description: string;
  priceRange: PriceRange;
  contact: ContactInfo;
  image?: string;
  verified: boolean;
  tags: string[];
}

export type TransportMode =
  | "motor"
  | "mobil"
  | "elf"
  | "minibus"
  | "pickup"
  | "ojek"
  | "open-trip"
  | "kereta"
  | "feri";

export interface Accommodation extends TravelSupportBase {
  type: "accommodation";
  pricePerNight: number;
  capacity: string;
  facilities: string[];
}

export interface Transport extends TravelSupportBase {
  type: "transport";
  mode: TransportMode;
  capacitySeats?: number;
  /** rute yang dilayani, mis. ["Bandung", "Basecamp"] */
  routes: string[];
  price: number;
}

export interface FoodSpot extends TravelSupportBase {
  type: "food";
  cuisine: string[];
  priceRange: PriceRange;
}

export type TravelSupport = Accommodation | Transport | FoodSpot;