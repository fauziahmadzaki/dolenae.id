import { randomUUID } from "node:crypto";
import type { DummyPaymentRow } from "../db/schema";
import { dummyQrMatrix } from "../utils/dummy-qr";
import { userService } from "./user.service";

import type { CreatePayment, PaymentQuery, CreatePromo, UpdatePromo, ActivityQuery, CreateProposal, ProposalQuery, ReviewProposal, CreateSupport, SupportQuery, UpdateSupport } from "../controllers/operations.schema";
import { operationsRepository as repo } from "../repositories/operations.repository";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";
import { buildMeta, toPagination, type PaginationQuery } from "../utils/pagination";

// PostgreSQL may wrap the original error; never expose SQL, parameters or internals.
async function persist<T>(write: () => Promise<T>): Promise<T> {
  try { return await write(); } catch (error) {
    const codes: unknown[] = [];
    let current: unknown = error;
    for (let i = 0; i < 5 && current && typeof current === "object"; i++) {
      codes.push((current as { code?: unknown }).code);
      current = (current as { cause?: unknown }).cause;
    }
    if (codes.includes("23505")) throw new ConflictError("Data sudah digunakan");
    if (codes.includes("23503")) throw new ConflictError("Relasi data tidak tersedia atau masih digunakan");
    if (codes.includes("23514")) throw new ValidationError("Nilai atau rentang data tidak valid");
    throw error;
  }
}
function validPromo(v: { startsAt: Date; endsAt: Date; discountType: string; value: number }) {
  return v.startsAt < v.endsAt && (v.discountType !== "percentage" || v.value <= 100);
}
function paymentResponse(row: DummyPaymentRow) {
  const { promoId: _promoId, ...data } = row;
  return { ...data, method: "dummy_qr" as const, isDummy: true as const, qrMatrix: dummyQrMatrix(data.qrPayload) };
}
export const operationsService = {
  async createPayment(input: CreatePayment, actorId: string) {
    const row = await persist(() => repo.createPayment(input, actorId, (support, promo) => {
      if (!support) throw new NotFoundError("Fasilitas published tidak ditemukan");
      if (support.priceMin == null || !Number.isInteger(support.priceMin) || support.priceMin < 0 || support.priceMin > 2147483647) throw new ValidationError("Harga fasilitas belum tersedia atau tidak valid");
      const subtotal = support.priceMin * input.quantity;
      let discount = 0;
      if (input.promoCode) {
        const at = new Date();
        if (!promo || !promo.active || promo.code !== input.promoCode || promo.startsAt > at || promo.endsAt <= at || subtotal < promo.minAmount || !validPromo(promo)) throw new ValidationError("Promo tidak berlaku");
        discount = promo.discountType === "percentage" ? Math.floor(subtotal * promo.value / 100) : promo.value;
        discount = Math.min(discount, promo.maxDiscount ?? subtotal, subtotal);
      }
      const id = randomUUID();
      return { id, userId: actorId, supportId: input.supportId, supportName: support.name, quantity: input.quantity, subtotal, discount, total: subtotal - discount,
        promoId: input.promoCode ? promo!.id : null, promoCode: input.promoCode ?? null, status: "pending", method: "dummy_qr", isDummy: true, qrPayload: `DUMMY:${id}`, paidAt: null };
    }));
    return paymentResponse(row);
  },
  async getPayment(id: string, actorId: string, isAdmin: boolean) {
    const row = await repo.findPayment(id, isAdmin ? undefined : actorId);
    if (!row) throw new NotFoundError("Pembayaran simulasi tidak ditemukan");
    return paymentResponse(row);
  },
  async minePayments(actorId: string) { return (await repo.minePayments(actorId)).map(paymentResponse); },
  async listPayments(query: PaymentQuery) {
    const { items, total } = await repo.listPayments(toPagination(query));
    return { items: items.map(paymentResponse), meta: buildMeta(total, query.page, query.limit) };
  },
  async simulatePayment(id: string, status: "paid" | "cancelled", actorId: string, isAdmin: boolean) {
    const row = await persist(() => repo.transitionPayment(id, status, actorId, isAdmin));
    if (!row) throw new NotFoundError("Pembayaran simulasi tidak ditemukan");
    if (row.status !== status) throw new ConflictError("Status terminal pembayaran simulasi tidak dapat diubah");
    return paymentResponse(row);
  },
  createPromo: (input: CreatePromo, actorId: string) => persist(() => repo.createPromo(input, actorId)),
  activePromos: () => repo.activePromos(new Date()),
  async listPromos(query: PaginationQuery) {
    const { items, total } = await repo.listPromos(toPagination(query));
    return { items, meta: buildMeta(total, query.page, query.limit) };
  },
  async updatePromo(id: string, input: UpdatePromo, actorId: string) {
    const current = await repo.findPromo(id);
    if (!current) throw new NotFoundError("Promo tidak ditemukan");
    if (!validPromo({ ...current, ...input })) throw new ValidationError("Rentang tanggal atau persentase promo tidak valid");
    const row = await persist(() => repo.updatePromo(id, input, actorId));
    if (!row) throw new NotFoundError("Promo tidak ditemukan");
    return row;
  },
  async deletePromo(id: string, actorId: string) {
    if (!await persist(() => repo.deletePromo(id, actorId))) throw new NotFoundError("Promo tidak ditemukan");
    return null;
  },
  async createProposal(input: CreateProposal, actorId: string) {
    if (input.destinationId && !await repo.destinationExists(input.destinationId)) throw new NotFoundError("Destinasi tidak ditemukan");
    return persist(() => repo.createProposal({ ...input, userId: actorId, status: "menunggu" }, actorId));
  },
  mineProposals: (actorId: string) => repo.mineProposals(actorId),
  async listProposals(query: ProposalQuery) {
    const { items, total } = await repo.listProposals(toPagination(query));
    return { items, meta: buildMeta(total, query.page, query.limit) };
  },
  async reviewProposal(id: string, input: ReviewProposal, actorId: string) {
    const row = await persist(() => repo.reviewProposal(id, input, actorId));
    if (!row) throw new NotFoundError("Usulan tidak ditemukan");
    return row;
  },
  metrics: () => repo.metrics(),
  async activity(query: ActivityQuery) {
    const { items, total } = await repo.listActivity(toPagination(query));
    return { items, meta: buildMeta(total, query.page, query.limit) };
  },
  merchants: (query: PaginationQuery) => userService.list({ ...query, role: "merchant" }),
  async listSupports(query: SupportQuery, publishedOnly: boolean) {
    const { items, total } = await repo.listSupports({ ...toPagination(query), destinationId: query.destinationId, category: query.category }, publishedOnly);
    return { items, meta: buildMeta(total, query.page, query.limit) };
  },
  async getSupport(id: string) {
    const row = await repo.findSupport(id);
    if (!row) throw new NotFoundError("Fasilitas tidak ditemukan");
    return row;
  },
  async createSupport(input: CreateSupport, actorId: string) {
    if (!await repo.destinationExists(input.destinationId)) throw new NotFoundError("Destinasi tidak ditemukan");
    return persist(() => repo.createSupport(input, actorId));
  },
  async updateSupport(id: string, input: UpdateSupport, actorId: string) {
    const current = await operationsService.getSupport(id);
    const combined = { ...current, ...input };
    if (combined.priceMin != null && combined.priceMax != null && combined.priceMin > combined.priceMax) throw new ValidationError("Harga minimum melebihi maksimum");
    if (input.destinationId && !await repo.destinationExists(input.destinationId)) throw new NotFoundError("Destinasi tidak ditemukan");
    const row = await persist(() => repo.updateSupport(id, input, actorId));
    if (!row) throw new NotFoundError("Fasilitas tidak ditemukan");
    return row;
  },
  async deleteSupport(id: string, actorId: string) {
    if (!await persist(() => repo.deleteSupport(id, actorId))) throw new NotFoundError("Fasilitas tidak ditemukan");
    return null;
  },
};
