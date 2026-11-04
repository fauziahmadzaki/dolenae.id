import { z } from "zod";
import { paginationSchema } from "../utils/pagination";
import { BadRequestError } from "../utils/errors";

export const operationIdSchema = z.object({ id: z.unknown().transform((value) => {
  const result = z.string().uuid().safeParse(value);
  if (!result.success) throw new BadRequestError("ID harus UUID yang valid");
  return result.data;
}) });
const category = z.enum(["accommodation", "transport", "food"]);
const nullableText = z.string().trim().max(5000).nullable().optional();
const price = z.number().int().min(0).max(2147483647).nullable().optional();
const labels = z.array(z.string().trim().min(1).max(200)).max(100);
const supportFields = z.object({
  destinationId: z.string().uuid(), name: z.string().trim().min(1).max(120), category,
  description: nullableText, locationLabel: nullableText, capacity: nullableText,
  distanceLabel: nullableText, priceLabel: nullableText, priceUnit: nullableText,
  priceMin: price, priceMax: price, contactPhone: nullableText,
  contactWhatsapp: nullableText, contactInstagram: nullableText,
  imageUrl: z.string().url().max(2048).refine((v) => /^https?:\/\//i.test(v), "URL harus HTTP(S)").nullable().optional(),
  facilities: labels, routes: labels, cuisine: labels,
  includesDriver: z.boolean(), verified: z.boolean(),
}).strict();
function validPrices(v: { priceMin?: number | null; priceMax?: number | null }) {
  return v.priceMin == null || v.priceMax == null || v.priceMin <= v.priceMax;
}
export const createSupportSchema = supportFields.extend({
  facilities: labels.default([]), routes: labels.default([]), cuisine: labels.default([]),
  includesDriver: z.boolean().default(false), verified: z.boolean().default(false),
}).refine(validPrices, { message: "Harga minimum melebihi maksimum", path: ["priceMax"] });
export const updateSupportSchema = supportFields.partial()
  .refine((v) => Object.keys(v).length > 0, "Perubahan tidak boleh kosong")
  .refine(validPrices, { message: "Harga minimum melebihi maksimum", path: ["priceMax"] });
export const operationSupportQuerySchema = paginationSchema.extend({ destinationId: z.string().uuid().optional(), category: category.optional() });
export type CreateSupport = z.infer<typeof createSupportSchema>;
export type UpdateSupport = z.infer<typeof updateSupportSchema>;
export type SupportQuery = z.infer<typeof operationSupportQuerySchema>;

export const createProposalSchema = z.object({
  name: z.string().trim().min(1).max(120), type: category,
  destinationId: z.string().uuid().optional(),
  nearestDestinationName: z.string().trim().min(1).max(160),
  address: z.string().trim().min(1).max(2000), note: z.string().trim().max(5000).optional(),
}).strict();
export const reviewProposalSchema = z.object({ status: z.enum(["terverifikasi", "ditolak"]), reviewNote: z.string().trim().max(5000).optional() }).strict();
export const proposalQuerySchema = paginationSchema.extend({ status: z.enum(["menunggu", "terverifikasi", "ditolak"]).optional(), type: category.optional() });
export const activityQuerySchema = paginationSchema.extend({ targetType: z.enum(["support", "proposal", "promo", "payment"]).optional() });
export { paginationSchema as operationListQuerySchema };
export type CreateProposal = z.infer<typeof createProposalSchema>;
export type ReviewProposal = z.infer<typeof reviewProposalSchema>;
export type ProposalQuery = z.infer<typeof proposalQuerySchema>;
export type ActivityQuery = z.infer<typeof activityQuerySchema>;

const promoCode = z.string().regex(/^[A-Z0-9_-]{3,32}$/, "Kode promo harus uppercase 3–32 karakter");
const dateTime = z.string().datetime({ offset: true }).transform((v) => new Date(v));
const money = z.number().int().min(0).max(2147483647);
const promoFields = z.object({
  code: promoCode, title: z.string().trim().min(1).max(160), discountType: z.enum(["percentage", "fixed"]),
  value: money.min(1), minAmount: money, maxDiscount: money.nullable(),
  startsAt: dateTime, endsAt: dateTime, active: z.boolean(),
}).strict();
export function validPromo(v: { startsAt?: Date; endsAt?: Date; discountType?: string; value?: number }) {
  return (!v.startsAt || !v.endsAt || v.startsAt < v.endsAt) && (v.discountType !== "percentage" || v.value === undefined || v.value <= 100);
}
export const createPromoSchema = promoFields.extend({ minAmount: money.default(0), maxDiscount: money.nullable().default(null), active: z.boolean().default(true) })
  .refine(validPromo, "Rentang tanggal atau persentase promo tidak valid");
export const updatePromoSchema = promoFields.partial().refine((v) => Object.keys(v).length > 0, "Perubahan tidak boleh kosong").refine(validPromo, "Rentang tanggal atau persentase promo tidak valid");
export type CreatePromo = z.infer<typeof createPromoSchema>;
export type UpdatePromo = z.infer<typeof updatePromoSchema>;

export const createPaymentSchema = z.object({ supportId: z.string().uuid(), quantity: z.number().int().min(1).max(100), promoCode: promoCode.optional() }).strict();
export const simulatePaymentSchema = z.object({ status: z.enum(["paid", "cancelled"]) }).strict();
export const paymentQuerySchema = paginationSchema.extend({ status: z.enum(["pending", "paid", "cancelled"]).optional() });
export type CreatePayment = z.infer<typeof createPaymentSchema>;
export type SimulatePayment = z.infer<typeof simulatePaymentSchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;



