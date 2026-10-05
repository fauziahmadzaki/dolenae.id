import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  slug: z.string().trim().max(140).optional(),
  type: z.enum(["terrain", "activity"]),
  icon: z.string().trim().max(80).optional(),
  description: z.string().trim().max(500).optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

const coordinate = z.object({
  latitude: z.number().min(-90, "Latitude harus -90..90").max(90, "Latitude harus -90..90"),
  longitude: z
    .number()
    .min(-180, "Longitude harus -180..180")
    .max(180, "Longitude harus -180..180"),
});

const locationSchema = z.object({
  province: z.string().trim().min(2).max(120),
  regency: z.string().trim().min(2).max(120),
  district: z.string().trim().max(120).optional(),
  coordinate,
  accessPoint: z
    .object({ name: z.string().trim().min(2).max(120), coordinate })
    .optional(),
});

const accessSchema = z.object({
  description: z.string().trim().min(2),
  transportModes: z.array(z.string().trim()).default([]),
  estimatedTravelTime: z.string().trim().min(1),
  distanceKm: z.number().nonnegative().optional(),
});

const facilitiesSchema = z.object({
  toilet: z.boolean().optional(),
  warung: z.boolean().optional(),
  spotRequest: z.boolean().default(false),
  mushola: z.boolean().optional(),
  parkingArea: z.boolean().optional(),
  homestayNearby: z.boolean().optional(),
});

const terrainEnum = z.enum([
  "gunung",
  "bukit",
  "danau",
  "air-terjun",
  "pantai",
  "camping-ground",
  "savana",
  "hutan",
]);

const activityEnum = z.enum([
  "hiking",
  "camping",
  "sightseeing",
  "photography",
  "sunrise",
  "susur-sungai",
  "off-road",
]);

const difficultyEnum = z.enum([
  "ramah-pemula",
  "menengah",
  "sulit",
  "butuh-lokal-guide",
]);

export const destinationCreateSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(160),
  slug: z.string().trim().max(180).optional(),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  terrain: z.array(terrainEnum).default([]),
  activities: z.array(activityEnum).default([]),
  difficulty: difficultyEnum.default("ramah-pemula"),
  status: z.enum(["draft", "published"]).default("draft"),
  bestSeason: z.array(z.string().trim()).default([]),
  location: locationSchema,
  access: accessSchema,
  facilities: facilitiesSchema,
  entryFee: z.string().trim().max(200).optional(),
  images: z.array(z.string().trim()).default([]),
  tags: z.array(z.string().trim()).default([]),
  elevationMeters: z.number().int().nonnegative().optional(),
  guideRequired: z.boolean().default(false),
  categoryIds: z.array(z.string().uuid()).default([]),
});

export const destinationUpdateSchema = destinationCreateSchema.partial();

export type DestinationCreateInput = z.infer<typeof destinationCreateSchema>;
export type DestinationUpdateInput = z.infer<typeof destinationUpdateSchema>;

const contactSchema = z.object({
  phone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  instagram: z.string().trim().max(80).optional(),
});

export const supportCreateSchema = z.object({
  destinationId: z.string().uuid(),
  type: z.enum(["accommodation", "transport", "food"]),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000).optional(),
  priceRange: z.enum(["ekonomis", "menengah", "premium"]).default("ekonomis"),
  contact: contactSchema.default({}),
  image: z.string().trim().max(300).optional(),
  verified: z.boolean().default(false),
  tags: z.array(z.string().trim()).default([]),
  pricePerNight: z.number().int().nonnegative().optional(),
  capacity: z.string().trim().max(80).optional(),
  facilities: z.array(z.string().trim()).optional(),
  mode: z
    .enum([
      "motor",
      "mobil",
      "elf",
      "minibus",
      "pickup",
      "ojek",
      "open-trip",
      "kereta",
      "feri",
    ])
    .optional(),
  capacitySeats: z.number().int().nonnegative().optional(),
  routes: z.array(z.string().trim()).optional(),
  price: z.number().int().nonnegative().optional(),
  cuisine: z.array(z.string().trim()).optional(),
});

export const supportUpdateSchema = supportCreateSchema
  .omit({ destinationId: true })
  .partial();

export type SupportCreateInput = z.infer<typeof supportCreateSchema>;
export type SupportUpdateInput = z.infer<typeof supportUpdateSchema>;
