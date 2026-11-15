export const FACILITY_CATEGORIES = [
  "transport",
  "accommodation",
  "food",
] as const;

export type FacilityCategory = (typeof FACILITY_CATEGORIES)[number];

export const FACILITY_STATUSES = [
  "draft",
  "pending",
  "published",
  "rejected",
  "archived",
] as const;

export type FacilityStatus = (typeof FACILITY_STATUSES)[number];

export const categoryLabels: Record<FacilityCategory, string> = {
  transport: "Transportasi",
  accommodation: "Penginapan",
  food: "Toko / Warung",
};

export const categoryOptions = FACILITY_CATEGORIES.map((value) => ({
  value,
  label: categoryLabels[value],
}));

export const statusLabels: Record<FacilityStatus, string> = {
  draft: "Draf",
  pending: "Menunggu verifikasi",
  published: "Tayang",
  rejected: "Ditolak",
  archived: "Diarsipkan",
};

export const statusOptions = FACILITY_STATUSES.map((value) => ({
  value,
  label: statusLabels[value],
}));

export interface FacilityProduct {
  id: string;
  facilityId: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  price: number;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  destinationId: string;
  destinationName: string;
  ownerId: string | null;
  name: string;
  category: FacilityCategory;
  type: string;
  location: { latitude: number; longitude: number };
  priceMin: number | null;
  priceMax: number | null;
  description: string | null;
  contact: string;
  contactEmail: string | null;
  website: string | null;
  bannerUrl: string | null;
  status: FacilityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityDetail extends Facility {
  products: FacilityProduct[];
}

/** Product row joined with its facility/destination for merchant listings. */
export interface MerchantProduct extends FacilityProduct {
  facilityName: string;
  destinationName: string;
}

export interface FacilityFormValues {
  destinationId: string;
  name: string;
  category: FacilityCategory;
  type: string;
  latitude: string;
  longitude: string;
  priceMin: string;
  priceMax: string;
  description: string;
  contact: string;
  contactEmail: string;
  website: string;
  bannerUrl: string;
}

export function facilityToForm(facility: Facility): FacilityFormValues {
  return {
    destinationId: facility.destinationId,
    name: facility.name,
    category: facility.category,
    type: facility.type,
    latitude: String(facility.location.latitude),
    longitude: String(facility.location.longitude),
    priceMin: facility.priceMin == null ? "" : String(facility.priceMin),
    priceMax: facility.priceMax == null ? "" : String(facility.priceMax),
    description: facility.description ?? "",
    contact: facility.contact,
    contactEmail: facility.contactEmail ?? "",
    website: facility.website ?? "",
    bannerUrl: facility.bannerUrl ?? "",
  };
}

export function emptyFacilityForm(): FacilityFormValues {
  return {
    destinationId: "",
    name: "",
    category: "accommodation",
    type: "",
    latitude: "",
    longitude: "",
    priceMin: "",
    priceMax: "",
    description: "",
    contact: "",
    contactEmail: "",
    website: "",
    bannerUrl: "",
  };
}

export function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatRupiah(value: number | null): string {
  if (value == null) return "—";
  return `Rp ${value.toLocaleString("id-ID")}`;
}
