import { z } from "zod";

const money = z.number().int().min(0).max(2147483647);
const text = z.string().trim().max(5000).nullable();
const labels = z.array(z.string().trim().min(1).max(200)).max(100);
export const supportSchema = z.object({
  destinationId: z.string().uuid(), name: z.string().trim().min(1).max(120),
  category: z.enum(["accommodation", "transport", "food"]),
  description: text, locationLabel: text, capacity: text, distanceLabel: text,
  priceLabel: text, priceUnit: text, priceMin: money.nullable(), priceMax: money.nullable(),
  contactPhone: text, contactWhatsapp: text, contactInstagram: text,
  imageUrl: z.string().url().max(2048).regex(/^https?:\/\//i).nullable(),
  facilities: labels, routes: labels, cuisine: labels, includesDriver: z.boolean(), verified: z.boolean(),
}).strict().refine((v) => v.priceMin === null || v.priceMax === null || v.priceMin <= v.priceMax, { path: ["priceMax"], message: "Harga minimum melebihi maksimum." });

export const promoSchema = z.object({
  code: z.string().regex(/^[A-Z0-9_-]{3,32}$/, "Kode uppercase 3–32 karakter (A–Z, 0–9, _ atau -)."),
  title: z.string().trim().min(1).max(160), discountType: z.enum(["percentage", "fixed"]),
  value: money.min(1), minAmount: money, maxDiscount: money.nullable(),
  startsAt: z.string().datetime({ offset: true }), endsAt: z.string().datetime({ offset: true }), active: z.boolean(),
}).strict().refine((v) => v.discountType !== "percentage" || v.value <= 100, { path: ["value"], message: "Persentase harus 1–100." })
  .refine((v) => Date.parse(v.startsAt) < Date.parse(v.endsAt), { path: ["endsAt"], message: "Tanggal akhir harus setelah tanggal mulai." });

export const faqSchema = z.object({
  category: z.enum(["akun", "perjalanan", "fasilitas", "data"]),
  question: z.string().trim().min(3).max(500), answer: z.string().trim().min(1).max(10000),
}).strict();
export const feedbackSchema = z.object({
  category: z.enum(["bug", "saran", "konten", "lainnya"]),
  subject: z.string().trim().min(3).max(160), message: z.string().trim().min(10).max(5000),
  rating: z.number().int().min(0).max(5).optional(),
}).strict();
