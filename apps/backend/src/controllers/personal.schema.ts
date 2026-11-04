import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return value >= "0001-01-01" && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Tanggal tidak valid");
const tripFields = z.object({
  name: z.string().trim().min(1).max(160),
  startDate: dateOnly,
  endDate: dateOnly,
  peopleCount: z.number().int().min(1).max(100),
  budget: z.number().int().min(0).max(2147483647).optional(),
  notes: z.string().trim().max(5000).optional(),
}).strict();
export const createTripSchema = tripFields.refine((data) => data.endDate >= data.startDate, { path: ["endDate"], message: "Tanggal akhir sebelum tanggal mulai" });
export const patchTripSchema = tripFields.partial().extend({ status: z.enum(["aktif", "arsip"]).optional() }).strict().refine((data) => Object.keys(data).length > 0, "Tidak ada perubahan");
export const idParamsSchema = z.object({ id: z.string().uuid() });
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type PatchTripInput = z.infer<typeof patchTripSchema>;

export const tripItemParamsSchema = idParamsSchema.extend({ itemId: z.string().uuid() });
export const createTripItemSchema = z.object({
  destinationId: z.string().uuid(), date: dateOnly,
  notes: z.string().trim().max(5000).optional(),
  supportIds: z.array(z.string().uuid()).max(100).optional(),
}).strict();
export const patchTripItemSchema = createTripItemSchema.partial().refine((data) => Object.keys(data).length > 0, "Tidak ada perubahan");
export type CreateTripItemInput = z.infer<typeof createTripItemSchema>;
export type PatchTripItemInput = z.infer<typeof patchTripItemSchema>;

export const checklistParamsSchema = z.object({ destId: z.string().uuid() });
export const checklistItemParamsSchema = checklistParamsSchema.extend({ id: z.string().uuid() });
export const createChecklistItemSchema = z.object({
  name: z.string().trim().min(1).max(160), category: z.enum(["perlengkapan", "kesehatan", "konservasi", "administrasi"]),
  isRequired: z.boolean(), note: z.string().trim().max(5000).optional(),
}).strict();
export const patchChecklistItemSchema = createChecklistItemSchema.pick({ name: true, note: true }).partial().extend({ isCompleted: z.boolean().optional() }).strict().refine((data) => Object.keys(data).length > 0, "Tidak ada perubahan");
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;
export type PatchChecklistItemInput = z.infer<typeof patchChecklistItemSchema>;
export const saveDestinationSchema = z.object({ destinationId: z.string().uuid() }).strict();
export const savedDestinationParamsSchema = z.object({ destinationId: z.string().uuid() });
export const patchSavedPlanSchema = z.object({ status: z.enum(["aktif", "arsip"]) }).strict();

export const notificationReadSchema = z.object({ read: z.literal(true).default(true) }).strict().default({});
export const emptyBodySchema = z.object({}).strict().default({});
const notificationPreferencesSchema = z.object({ rekomendasi: z.boolean(), pengingatRencana: z.boolean(), pengingatChecklist: z.boolean(), fasilitasBaru: z.boolean(), promo: z.boolean() }).strict();
const privacyPreferencesSchema = z.object({ profilPublik: z.boolean(), bagikanAktivitas: z.boolean(), analitik: z.boolean() }).strict();
export const patchSettingsSchema = z.object({
  theme: z.enum(["terang", "sistem", "gelap"]).optional(), language: z.enum(["id", "en"]).optional(), dataSaver: z.boolean().optional(),
  notifications: notificationPreferencesSchema.partial().optional(), privacy: privacyPreferencesSchema.partial().optional(),
}).strict().refine((data) => Object.keys(data).length > 0, "Tidak ada perubahan");
export type PatchSettingsInput = z.infer<typeof patchSettingsSchema>;

export const createFaqSchema = z.object({ category: z.enum(["akun", "perjalanan", "fasilitas", "data"]), question: z.string().trim().min(3).max(500), answer: z.string().trim().min(1).max(10000) }).strict();
export const patchFaqSchema = createFaqSchema.partial().refine((data) => Object.keys(data).length > 0, "Tidak ada perubahan");
export const createFeedbackSchema = z.object({ category: z.enum(["bug", "saran", "konten", "lainnya"]), subject: z.string().trim().min(3).max(160), message: z.string().trim().min(10).max(5000), rating: z.number().int().min(0).max(5).optional() }).strict();
export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type PatchFaqInput = z.infer<typeof patchFaqSchema>;
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
