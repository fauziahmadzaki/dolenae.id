export type TrackNodeType =
  | "basecamp"
  | "gerbang"
  | "parkir"
  | "pos"
  | "sumber-air"
  | "viewpoint"
  | "puncak"
  | "persimpangan"
  | "area-camp";

export type RouteSurface =
  | "setapak"
  | "aspal"
  | "tanah"
  | "tanah-liat"
  | "batu"
  | "pasir";
export type RouteGrade =
  | "datar"
  | "landai"
  | "sedang"
  | "terjal"
  | "sangat-terjal";
/** Legacy status kept for segments. */
export type RouteSegmentStatus = "draft" | "diterbitkan" | "terverifikasi";
/** Condition shown for a whole trail. */
export type TrailRouteStatus =
  | "terverifikasi"
  | "alternatif"
  | "dalam-perbaikan"
  | "rusak"
  | "terlarang";
export type RouteDifficulty = "ramah-pemula" | "menengah" | "sulit";

export interface TrackNode {
  id: string;
  destinationId: string;
  name: string;
  type: TrackNodeType;
  coordinate: { latitude: number; longitude: number };
  elevationMeters: number;
  notes: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RouteSegment {
  id: string;
  destinationId: string;
  fromNodeId: string;
  toNodeId: string;
  surface: RouteSurface;
  grade: RouteGrade;
  traversableBy: string[];
  bidirectional: boolean;
  distanceKm: number | null;
  estimatedDurationMinutes: number | null;
  seasonal: boolean;
  notes: string | null;
  status: RouteSegmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  elevationMeters: number | null;
  nodeId: string | null;
}

export interface TrailRoute {
  id: string;
  destinationId: string;
  name: string;
  description: string | null;
  basecampNodeId: string | null;
  nodeIds: string[];
  segmentIds: string[];
  points: RoutePoint[];
  surface: string;
  grade: RouteGrade;
  traversableBy: string[];
  difficulty: RouteDifficulty;
  recommended: boolean;
  status: TrailRouteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RouteGraph {
  nodes: TrackNode[];
  segments: RouteSegment[];
  routes: TrailRoute[];
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  nodeId: string;
  name: string;
  type: TrackNodeType | "belokan";
}

export interface RouteProfile {
  routeId: string;
  points: ElevationPoint[];
  totalDistanceKm: number;
  totalGainMeters: number;
  totalLossMeters: number;
  maxElevationMeters: number;
  minElevationMeters: number;
  steepestGradePercent: number;
  estimatedDurationMinutes: number;
}

export const nodeTypeLabels: Record<TrackNodeType, string> = {
  basecamp: "Basecamp",
  gerbang: "Gerbang",
  parkir: "Parkir",
  pos: "Pos",
  "sumber-air": "Sumber air",
  viewpoint: "Viewpoint",
  puncak: "Puncak",
  persimpangan: "Persimpangan",
  "area-camp": "Area camp",
};

export const surfaceLabels: Record<RouteSurface, string> = {
  setapak: "Setapak",
  aspal: "Aspal",
  tanah: "Tanah",
  "tanah-liat": "Tanah liat",
  batu: "Bebatuan",
  pasir: "Pasir",
};

export const gradeLabels: Record<RouteGrade, string> = {
  datar: "Datar",
  landai: "Landai",
  sedang: "Sedang",
  terjal: "Terjal",
  "sangat-terjal": "Sangat terjal",
};

export const statusLabels: Record<TrailRouteStatus, string> = {
  terverifikasi: "Terverifikasi",
  alternatif: "Alternatif",
  "dalam-perbaikan": "Dalam perbaikan",
  rusak: "Rusak",
  terlarang: "Terlarang",
};

export const difficultyLabels: Record<RouteDifficulty, string> = {
  "ramah-pemula": "Ramah pemula",
  menengah: "Menengah",
  sulit: "Sulit",
};

export const traversalLabels: Record<string, string> = {
  "pejalan-kaki": "Pejalan kaki",
  sepeda: "Sepeda",
  motor: "Motor",
  mobil: "Mobil",
  jeep: "Jeep",
  pickup: "Pickup",
  elf: "Elf",
  minibus: "Minibus",
  ojek: "Ojek",
  "open-trip": "Open trip",
};

export const nodeTypeOptions = Object.entries(nodeTypeLabels).map(
  ([value, label]) => ({ value, label }),
);
export const surfaceOptions = Object.entries(surfaceLabels).map(
  ([value, label]) => ({ value, label }),
);
/** Trail-level surfaces include "campuran". */
export const trailSurfaceOptions = [
  { value: "campuran", label: "Campuran" },
  ...surfaceOptions,
];
export const gradeOptions = Object.entries(gradeLabels).map(
  ([value, label]) => ({ value, label }),
);
export const statusOptions = Object.entries(statusLabels).map(
  ([value, label]) => ({ value, label }),
);
export const traversalOptions = Object.entries(traversalLabels).map(
  ([value, label]) => ({ value, label }),
);

export const NODE_TYPE_COLORS: Record<TrackNodeType, string> = {
  basecamp: "#1e3b2e",
  gerbang: "#5b7f6b",
  parkir: "#6b7280",
  pos: "#9a6b3f",
  "sumber-air": "#2f6f9e",
  viewpoint: "#b5651d",
  puncak: "#8c2f39",
  persimpangan: "#6d5b9a",
  "area-camp": "#3f7a52",
};
