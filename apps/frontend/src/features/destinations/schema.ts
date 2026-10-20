import { z } from "zod";
import type {
  CategoryType,
  DestinationStatus,
  Difficulty,
} from "~/types/domain";

export const difficultyLabels: Record<Difficulty, string> = {
  "ramah-pemula": "Ramah pemula",
  menengah: "Menengah",
  sulit: "Sulit",
};

export const statusLabels: Record<DestinationStatus, string> = {
  draft: "Draf",
  published: "Published",
  archived: "Diarsipkan",
};

export const categoryTypeLabels: Record<CategoryType, string> = {
  terrain: "Terrain",
  activity: "Aktivitas",
};

/** Lucide icons offered in the category dialog (design §1). */
export const categoryIconOptions = [
  { value: "lucide:mountain", label: "Gunung" },
  { value: "lucide:trees", label: "Hutan" },
  { value: "lucide:waves", label: "Danau / pantai" },
  { value: "lucide:tent", label: "Camping" },
  { value: "lucide:footprints", label: "Hiking" },
  { value: "lucide:map-pin", label: "Lokasi" },
  { value: "lucide:sun", label: "Sunrise" },
  { value: "lucide:leaf", label: "Alam" },
  { value: "lucide:camera", label: "Fotografi" },
  { value: "lucide:circle", label: "Lainnya" },
];

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  slug: z
    .string()
    .trim()
    .max(100)
    .refine(
      (value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "Slug hanya huruf kecil, angka, dan tanda hubung",
    ),
  type: z.enum(["terrain", "activity"]),
  icon: z.string().trim().min(1, "Pilih ikon"),
  description: z.string().trim().max(1000),
});

export type CategoryForm = z.infer<typeof categoryFormSchema>;

const csvList = (max = 40) =>
  z
    .string()
    .max(2000)
    .refine(
      (value) => value.split(",").filter((item) => item.trim()).length <= max,
      `Maksimal ${max} item`,
    );

const numberField = (label: string, min: number, max: number, integer = false) =>
  z.string().refine((value) => {
    if (value.trim() === "") return true;
    const parsed = Number(value);
    return (
      Number.isFinite(parsed) &&
      parsed >= min &&
      parsed <= max &&
      (!integer || Number.isInteger(parsed))
    );
  }, `${label} harus angka ${min}–${max}`);

/** Form payload (everything as strings for easy controlled inputs). */
export const destinationFormSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  slug: z
    .string()
    .trim()
    .max(140)
    .refine(
      (value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "Slug hanya huruf kecil, angka, dan tanda hubung",
    ),
  tagline: z.string().trim().max(200),
  description: z.string().trim().max(50000),
  difficulty: z.enum(["ramah-pemula", "menengah", "sulit"]),
  status: z.enum(["draft", "published", "archived"]),
  bestSeason: csvList(),
  tags: csvList(),
  terrain: csvList(),
  activities: csvList(),
  categoryIds: z.array(z.string().uuid()),
  province: z.string().trim().max(80),
  regency: z.string().trim().max(80),
  district: z.string().trim().max(80),
  latitude: numberField("Latitude", -90, 90),
  longitude: numberField("Longitude", -180, 180),
  accessPoint: z.string().trim().max(160),
  accessDescription: z.string().trim().max(4000),
  accessTransport: csvList(),
  accessDuration: z.string().trim().max(80),
  accessDistanceKm: numberField("Jarak akses", 0, 100000),
  facilities: csvList(),
  entryFee: numberField("Biaya masuk", 0, 100_000_000, true),
  elevationMeters: numberField("Ketinggian", -500, 9000, true),
  images: z.array(z.string().trim().min(1).max(2000)).max(20),
  guideRequired: z.boolean(),
});

export type DestinationForm = z.infer<typeof destinationFormSchema>;

export const emptyDestinationForm: DestinationForm = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  difficulty: "menengah",
  status: "draft",
  bestSeason: "",
  tags: "",
  terrain: "",
  activities: "",
  categoryIds: [],
  province: "",
  regency: "",
  district: "",
  latitude: "",
  longitude: "",
  accessPoint: "",
  accessDescription: "",
  accessTransport: "",
  accessDuration: "",
  accessDistanceKm: "",
  facilities: "",
  entryFee: "",
  elevationMeters: "",
  images: [],
  guideRequired: false,
};

const splitList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toNumber = (value: string): number | null =>
  value.trim() === "" ? null : Number(value);

const toText = (value: string): string | null =>
  value.trim() === "" ? null : value.trim();

/** Map the form model to the API body accepted by POST/PATCH /api/destinations. */
export function toDestinationPayload(form: DestinationForm) {
  return {
    name: form.name,
    slug: form.slug.trim() || undefined,
    tagline: toText(form.tagline),
    description: toText(form.description),
    difficulty: form.difficulty,
    status: form.status,
    bestSeason: splitList(form.bestSeason),
    tags: splitList(form.tags),
    terrain: splitList(form.terrain),
    activities: splitList(form.activities),
    categoryIds: form.categoryIds,
    location: {
      province: toText(form.province),
      regency: toText(form.regency),
      district: toText(form.district),
      latitude: toNumber(form.latitude),
      longitude: toNumber(form.longitude),
      accessPoint: toText(form.accessPoint),
    },
    access: {
      description: toText(form.accessDescription),
      transport: splitList(form.accessTransport),
      duration: toText(form.accessDuration),
      distanceKm: toNumber(form.accessDistanceKm),
    },
    facilities: splitList(form.facilities),
    entryFee: toNumber(form.entryFee),
    elevationMeters: toNumber(form.elevationMeters),
    images: form.images.map((image) => image.trim()).filter(Boolean),
    guideRequired: form.guideRequired,
  };
}

/** Hydrate the form model from a destination detail (edit flow). */
export function toDestinationForm(detail: {
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  difficulty: Difficulty;
  status: DestinationStatus;
  bestSeason: string[];
  tags: string[];
  terrain: string[];
  activities: string[];
  categoryIds: string[];
  location: {
    province: string | null;
    regency: string | null;
    district: string | null;
    latitude: number | null;
    longitude: number | null;
    accessPoint: string | null;
  };
  access: {
    description: string | null;
    transport: string[];
    duration: string | null;
    distanceKm: number | null;
  };
  facilities: string[];
  entryFee: number | null;
  elevationMeters: number | null;
  images: string[];
  guideRequired: boolean;
}): DestinationForm {
  const join = (values: string[]) => values.join(", ");
  const text = (value: string | null) => value ?? "";
  const num = (value: number | null) => (value === null ? "" : String(value));

  return {
    name: detail.name,
    slug: detail.slug,
    tagline: text(detail.tagline),
    description: text(detail.description),
    difficulty: detail.difficulty,
    status: detail.status,
    bestSeason: join(detail.bestSeason),
    tags: join(detail.tags),
    terrain: join(detail.terrain),
    activities: join(detail.activities),
    categoryIds: detail.categoryIds,
    province: text(detail.location.province),
    regency: text(detail.location.regency),
    district: text(detail.location.district),
    latitude: num(detail.location.latitude),
    longitude: num(detail.location.longitude),
    accessPoint: text(detail.location.accessPoint),
    accessDescription: text(detail.access.description),
    accessTransport: join(detail.access.transport),
    accessDuration: text(detail.access.duration),
    accessDistanceKm: num(detail.access.distanceKm),
    facilities: join(detail.facilities),
    entryFee: num(detail.entryFee),
    elevationMeters: num(detail.elevationMeters),
    images: detail.images,
    guideRequired: detail.guideRequired,
  };
}

export const difficultyOptions = Object.entries(difficultyLabels).map(
  ([value, label]) => ({ value, label }),
);

export const statusOptions = Object.entries(statusLabels).map(
  ([value, label]) => ({ value, label }),
);
