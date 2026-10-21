import { z } from "zod";

export const destinationIdParamsSchema = z.object({
  destinationId: z.string().uuid("ID destinasi harus UUID"),
});

export const routeEntityIdParamsSchema = z.object({
  id: z.string().uuid("ID harus UUID"),
});

const trackNodeType = z.enum([
  "basecamp",
  "gerbang",
  "parkir",
  "pos",
  "sumber-air",
  "viewpoint",
  "puncak",
  "persimpangan",
  "area-camp",
]);

const routeSurface = z.enum(["setapak", "aspal", "tanah", "batu", "pasir"]);
const routeGrade = z.enum([
  "datar",
  "landai",
  "sedang",
  "terjal",
  "sangat-terjal",
]);
const routeStatus = z.enum(["draft", "diterbitkan", "terverifikasi"]);
const traversal = z.enum([
  "pejalan-kaki",
  "sepeda",
  "motor",
  "mobil",
  "jeep",
  "pickup",
  "elf",
  "minibus",
  "ojek",
  "open-trip",
]);

const traversalList = z.array(traversal).max(10).optional();

const notes = z.string().trim().max(2000).nullable().optional();

export const createTrackNodeSchema = z.object({
  name: z.string().trim().min(2, "Nama titik minimal 2 karakter").max(120),
  type: trackNodeType,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  elevationMeters: z.number().int().min(-500).max(9000),
  notes,
});

export const updateTrackNodeSchema = createTrackNodeSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Setidaknya satu field harus diisi",
  );

export const createRouteSegmentSchema = z.object({
  fromNodeId: z.string().uuid(),
  toNodeId: z.string().uuid(),
  surface: routeSurface.optional(),
  grade: routeGrade.optional(),
  traversableBy: traversalList,
  bidirectional: z.boolean().optional(),
  distanceKm: z.number().min(0).max(100000).nullable().optional(),
  estimatedDurationMinutes: z.number().int().min(1).max(100000).nullable().optional(),
  seasonal: z.boolean().optional(),
  notes,
  status: routeStatus.optional(),
});

export const updateRouteSegmentSchema = createRouteSegmentSchema
  .omit({ fromNodeId: true, toNodeId: true })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Setidaknya satu field harus diisi",
  );

const trailRouteFields = {
  name: z.string().trim().min(2, "Nama jalur minimal 2 karakter").max(120),
  description: notes,
  basecampNodeId: z.string().uuid().nullable().optional(),
  /** Free geometry: named anchors and anonymous bend points. */
  points: z
    .array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        elevationMeters: z
          .number()
          .int()
          .min(-500)
          .max(9000)
          .nullable()
          .optional(),
        nodeId: z.string().uuid().nullable().optional(),
      }),
    )
    .min(2, "Minimal dua titik")
    .max(200)
    .optional(),
  /** Legacy input: anchors only, converted into points. */
  nodeIds: z.array(z.string().uuid()).min(2, "Minimal dua titik").max(200).optional(),
  surface: z.union([routeSurface, z.literal("campuran")]).optional(),
  grade: routeGrade.optional(),
  traversableBy: traversalList,
  difficulty: z.enum(["ramah-pemula", "menengah", "sulit"]).optional(),
  recommended: z.boolean().optional(),
  status: routeStatus.optional(),
};

export const createTrailRouteSchema = z
  .object(trailRouteFields)
  .refine(
    (data) =>
      (data.points?.length ?? 0) >= 2 || (data.nodeIds?.length ?? 0) >= 2,
    "Jalur butuh minimal dua titik (points atau nodeIds)",
  );

export const updateTrailRouteSchema = z
  .object(trailRouteFields)
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Setidaknya satu field harus diisi",
  );

export type CreateTrackNodeBody = z.infer<typeof createTrackNodeSchema>;
export type UpdateTrackNodeBody = z.infer<typeof updateTrackNodeSchema>;
export type CreateRouteSegmentBody = z.infer<typeof createRouteSegmentSchema>;
export type UpdateRouteSegmentBody = z.infer<typeof updateRouteSegmentSchema>;
export type CreateTrailRouteBody = z.infer<typeof createTrailRouteSchema>;
export type UpdateTrailRouteBody = z.infer<typeof updateTrailRouteSchema>;
