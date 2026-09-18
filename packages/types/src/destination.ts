import type { ID, ISODateString } from "./common";
import type { TravelSupport } from "./travel-support";

export type DestinationTerrain =
  | "gunung"
  | "bukit"
  | "danau"
  | "air-terjun"
  | "pantai"
  | "camping-ground"
  | "savana"
  | "hutan";

export type DestinationActivity =
  | "hiking"
  | "camping"
  | "sightseeing"
  | "photography"
  | "sunrise"
  | "susur-sungai"
  | "off-road";

export type DestinationCondition =
  | "ramah-pemula"
  | "menengah"
  | "sulit"
  | "butuh-lokal-guide";

export interface AccessPoint {
  /** Nama basecamp / titik akses terdekat */
  name: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationInfo {
  province: string;
  regency: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  /** Basecamp / titik akses terdekat menuju destinasi */
  accessPoint?: AccessPoint;
}

export interface AccessInfo {
  /** Deskripsi akses menuju lokasi */
  description: string;
  /** Kendaraan/mode yang bisa digunakan ke basecamp */
  transportModes: string[];
  /** Estimasi waktu tempuh dari kota terdekat */
  estimatedTravelTime: string;
  /** Jarak dari kota terdekat */
  distanceKm?: number;
}

export interface FacilityInfo {
  toilet?: boolean;
  warung?: boolean;
  spotRequest: boolean;
  mushola?: boolean;
  parkingArea?: boolean;
  homestayNearby?: boolean;
}

export interface Destination {
  id: ID;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  terrain: DestinationTerrain[];
  activities: DestinationActivity[];
  difficulty: DestinationCondition;
  bestSeason: string[];
  location: LocationInfo;
  access: AccessInfo;
  facilities: FacilityInfo;
  entryFee?: string;
  images: string[];
  tags: string[];
  /** Ketinggian mdpl */
  elevationMeters?: number;
  guideRequired: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface DestinationDetail extends Destination {
  supports: TravelSupport[];
}