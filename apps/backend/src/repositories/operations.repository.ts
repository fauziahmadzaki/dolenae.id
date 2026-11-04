import { and, asc, count, desc, eq, getTableColumns, ilike, lte, gt, or, sql, type AnyColumn } from "drizzle-orm";
import { getDb } from "../db/client";
import { notifications } from "../db/personal-schema";
import { destinations, dummyPayments, facilityProposals, operationActivity, promos, travelSupports, users, type NewTravelSupportRow, type NewFacilityProposalRow, type FacilityProposalRow, type NewPromoRow, type PromoRow, type NewDummyPaymentRow, type DummyPaymentRow } from "../db/schema";
import type { Pagination } from "../utils/pagination";
import type { JoinedTravelSupport } from "./support.repository";

const supportSelection = { ...getTableColumns(travelSupports), relatedDestinationName: destinations.name };
type Db = ReturnType<typeof getDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
function audit(tx: Tx, actorId: string, action: string, targetType: string, targetId: string, targetLabel: string) {
  return tx.insert(operationActivity).values({ actorId, action, targetType, targetId, targetLabel: targetLabel.slice(0, 160) });
}
function notify(tx: Tx, userId: string, kind: "usulan" | "sistem", title: string, body: string, href: string) {
  return tx.insert(notifications).values({ userId, kind, title, body, href, read: false });
}
function ordering(query: Pagination, columns: Record<string, AnyColumn>, fallback: AnyColumn, id: AnyColumn) {
  const column = query.sort ? columns[query.sort] ?? fallback : fallback;
  return [query.order === "desc" ? desc(column) : asc(column), asc(id)];
}
export const operationsRepository = {
  async createPayment(input: { supportId: string; quantity: number; promoCode?: string }, actorId: string,
    calculate: (support: { id: string; name: string; priceMin: number | null } | undefined, promo: PromoRow | undefined) => NewDummyPaymentRow) {
    return getDb().transaction(async (tx) => {
      // Share locks keep the quoted support/promo stable through insert and audit.
      const [support] = await tx.select({ id: travelSupports.id, name: travelSupports.name, priceMin: travelSupports.priceMin })
        .from(travelSupports).innerJoin(destinations, eq(travelSupports.destinationId, destinations.id))
        .where(and(eq(travelSupports.id, input.supportId), eq(destinations.status, "published"))).limit(1).for("share");
      const [promo] = input.promoCode ? await tx.select().from(promos).where(eq(promos.code, input.promoCode)).limit(1).for("share") : [];
      const [row] = await tx.insert(dummyPayments).values(calculate(support, promo)).returning();
      await audit(tx, actorId, "payment.created", "payment", row!.id, row!.supportName);
      await notify(tx, actorId, "sistem", "Pembayaran simulasi dibuat", `SIMULASI untuk ${row!.supportName}; tidak ada uang yang ditransfer.`, `/payments/${row!.id}`);
      return row!;
    });
  },
  async findPayment(id: string, ownerId?: string) {
    const [row] = await getDb().select().from(dummyPayments).where(and(eq(dummyPayments.id, id), ownerId ? eq(dummyPayments.userId, ownerId) : undefined)).limit(1);
    return row;
  },
  async minePayments(ownerId: string) {
    // ponytail: latest 500 records; switch to cursor pagination above this ceiling.
    return getDb().select().from(dummyPayments).where(eq(dummyPayments.userId, ownerId)).orderBy(desc(dummyPayments.createdAt), asc(dummyPayments.id)).limit(500);
  },
  async listPayments(query: Pagination & { status?: DummyPaymentRow["status"] }) {
    const where = and(query.status ? eq(dummyPayments.status, query.status) : undefined,
      query.search ? or(ilike(dummyPayments.supportName, `%${query.search}%`), ilike(dummyPayments.promoCode, `%${query.search}%`)) : undefined);
    const items = await getDb().select().from(dummyPayments).where(where)
      .orderBy(...ordering(query, { createdAt: dummyPayments.createdAt, total: dummyPayments.total, status: dummyPayments.status, supportName: dummyPayments.supportName }, dummyPayments.createdAt, dummyPayments.id)).limit(query.limit).offset(query.offset);
    const [total] = await getDb().select({ value: count() }).from(dummyPayments).where(where);
    return { items, total: Number(total?.value ?? 0) };
  },
  async transitionPayment(id: string, status: "paid" | "cancelled", actorId: string, isAdmin: boolean) {
    return getDb().transaction(async (tx) => {
      const scope = and(eq(dummyPayments.id, id), isAdmin ? undefined : eq(dummyPayments.userId, actorId));
      const at = new Date();
      // Compare-and-set is atomic even when different terminal requests race.
      const [updated] = await tx.update(dummyPayments).set({ status, updatedAt: at, paidAt: status === "paid" ? at : null })
        .where(and(scope, eq(dummyPayments.status, "pending"))).returning();
      if (updated) {
        await audit(tx, actorId, `payment.${status}`, "payment", updated.id, updated.supportName);
        await notify(tx, updated.userId, "sistem", "Status pembayaran simulasi berubah", `SIMULASI ${updated.supportName}: ${status}. Tidak ada transaksi uang nyata.`, `/payments/${updated.id}`);
        return updated;
      }
      // Same target is idempotent; service rejects an incompatible terminal result.
      const [existing] = await tx.select().from(dummyPayments).where(scope).limit(1);
      return existing;
    });
  },
  async createPromo(input: NewPromoRow, actorId: string) {
    return getDb().transaction(async (tx) => {
      const [row] = await tx.insert(promos).values(input).returning();
      await audit(tx, actorId, "promo.created", "promo", row!.id, row!.code);
      return row!;
    });
  },
  async findPromo(id: string) {
    const [row] = await getDb().select().from(promos).where(eq(promos.id, id)).limit(1);
    return row;
  },
  async activePromos(at: Date) {
    return getDb().select().from(promos).where(and(eq(promos.active, true), lte(promos.startsAt, at), gt(promos.endsAt, at))).orderBy(asc(promos.code)).limit(500);
  },
  async listPromos(query: Pagination) {
    const where = query.search ? or(ilike(promos.title, `%${query.search}%`), ilike(promos.code, `%${query.search}%`)) : undefined;
    const items = await getDb().select().from(promos).where(where)
      .orderBy(...ordering(query, { code: promos.code, title: promos.title, createdAt: promos.createdAt, startsAt: promos.startsAt, endsAt: promos.endsAt }, promos.createdAt, promos.id)).limit(query.limit).offset(query.offset);
    const [total] = await getDb().select({ value: count() }).from(promos).where(where);
    return { items, total: Number(total?.value ?? 0) };
  },
  async updatePromo(id: string, input: Partial<NewPromoRow>, actorId: string) {
    return getDb().transaction(async (tx) => {
      const [row] = await tx.update(promos).set({ ...input, updatedAt: new Date() }).where(eq(promos.id, id)).returning();
      if (!row) return;
      await audit(tx, actorId, "promo.updated", "promo", row.id, row.code);
      return row;
    });
  },
  async deletePromo(id: string, actorId: string) {
    return getDb().transaction(async (tx) => {
      const [row] = await tx.delete(promos).where(eq(promos.id, id)).returning();
      if (!row) return false;
      await audit(tx, actorId, "promo.deleted", "promo", row.id, row.code);
      return true;
    });
  },
  async createProposal(input: NewFacilityProposalRow, actorId: string) {
    return getDb().transaction(async (tx) => {
      const [row] = await tx.insert(facilityProposals).values(input).returning();
      await audit(tx, actorId, "proposal.created", "proposal", row!.id, row!.name);
      await notify(tx, actorId, "usulan", "Usulan fasilitas diterima", `${row!.name} menunggu tinjauan admin.`, "/facilities/proposals");
      return row!;
    });
  },
  async mineProposals(userId: string) {
    // ponytail: bounded personal collection; add cursor pagination above 500 rows.
    return getDb().select().from(facilityProposals).where(eq(facilityProposals.userId, userId)).orderBy(desc(facilityProposals.createdAt), asc(facilityProposals.id)).limit(500);
  },
  async listProposals(query: Pagination & { status?: FacilityProposalRow["status"]; type?: FacilityProposalRow["type"] }) {
    const where = and(query.status ? eq(facilityProposals.status, query.status) : undefined,
      query.type ? eq(facilityProposals.type, query.type) : undefined,
      query.search ? or(ilike(facilityProposals.name, `%${query.search}%`), ilike(facilityProposals.nearestDestinationName, `%${query.search}%`)) : undefined);
    const items = await getDb().select().from(facilityProposals).where(where)
      .orderBy(...ordering(query, { name: facilityProposals.name, status: facilityProposals.status, createdAt: facilityProposals.createdAt }, facilityProposals.createdAt, facilityProposals.id)).limit(query.limit).offset(query.offset);
    const [total] = await getDb().select({ value: count() }).from(facilityProposals).where(where);
    return { items, total: Number(total?.value ?? 0) };
  },
  async reviewProposal(id: string, input: { status: "terverifikasi" | "ditolak"; reviewNote?: string }, actorId: string) {
    return getDb().transaction(async (tx) => {
      const at = new Date();
      const [row] = await tx.update(facilityProposals).set({ ...input, reviewNote: input.reviewNote ?? null, reviewedBy: actorId, reviewedAt: at, updatedAt: at }).where(eq(facilityProposals.id, id)).returning();
      if (!row) return;
      await audit(tx, actorId, `proposal.${input.status}`, "proposal", row.id, row.name);
      await notify(tx, row.userId, "usulan", "Usulan fasilitas ditinjau", `${row.name}: ${row.status}.`, "/facilities/proposals");
      return row;
    });
  },
  async listActivity(query: Pagination & { targetType?: string }) {
    const where = and(query.targetType ? eq(operationActivity.targetType, query.targetType) : undefined,
      query.search ? or(ilike(operationActivity.targetLabel, `%${query.search}%`), ilike(operationActivity.action, `%${query.search}%`)) : undefined);
    const items = await getDb().select().from(operationActivity).where(where)
      .orderBy(...ordering(query, { createdAt: operationActivity.createdAt, action: operationActivity.action, targetLabel: operationActivity.targetLabel }, operationActivity.createdAt, operationActivity.id)).limit(query.limit).offset(query.offset);
    const [total] = await getDb().select({ value: count() }).from(operationActivity).where(where);
    return { items, total: Number(total?.value ?? 0) };
  },
  async metrics() {
    // One statement gives a consistent PostgreSQL snapshot for every counter.
    const [row] = await getDb().select({
      users: sql<number>`(SELECT count(*)::int FROM ${users})`,
      destinations: sql<number>`(SELECT count(*)::int FROM ${destinations})`,
      publishedDestinations: sql<number>`(SELECT count(*)::int FROM ${destinations} WHERE ${destinations.status} = 'published')`,
      supports: sql<number>`(SELECT count(*)::int FROM ${travelSupports})`,
      pendingProposals: sql<number>`(SELECT count(*)::int FROM ${facilityProposals} WHERE ${facilityProposals.status} = 'menunggu')`,
      pendingPayments: sql<number>`(SELECT count(*)::int FROM ${dummyPayments} WHERE ${dummyPayments.status} = 'pending')`,
      paidPayments: sql<number>`(SELECT count(*)::int FROM ${dummyPayments} WHERE ${dummyPayments.status} = 'paid')`,
      dummyRevenue: sql<string>`(SELECT coalesce(sum(${dummyPayments.total}), 0)::text FROM ${dummyPayments} WHERE ${dummyPayments.status} = 'paid')`,
    }).from(sql`(SELECT 1) AS metrics`);
    return { users: Number(row!.users), destinations: Number(row!.destinations), publishedDestinations: Number(row!.publishedDestinations), supports: Number(row!.supports), pendingProposals: Number(row!.pendingProposals), pendingPayments: Number(row!.pendingPayments), paidPayments: Number(row!.paidPayments), dummyRevenue: Number(row!.dummyRevenue) };
  },
  async destinationExists(id: string) {
    const [row] = await getDb().select({ id: destinations.id }).from(destinations).where(eq(destinations.id, id)).limit(1);
    return Boolean(row);
  },
  async findSupport(id: string): Promise<JoinedTravelSupport | undefined> {
    const [row] = await getDb().select(supportSelection).from(travelSupports)
      .innerJoin(destinations, eq(travelSupports.destinationId, destinations.id)).where(eq(travelSupports.id, id)).limit(1);
    return row;
  },
  async listSupports(query: Pagination & { destinationId?: string; category?: typeof travelSupports.$inferSelect.category }, publishedOnly: boolean) {
    const db = getDb();
    const where = and(publishedOnly ? eq(destinations.status, "published") : undefined,
      query.destinationId ? eq(travelSupports.destinationId, query.destinationId) : undefined,
      query.category ? eq(travelSupports.category, query.category) : undefined,
      query.search ? or(ilike(travelSupports.name, `%${query.search}%`), ilike(destinations.name, `%${query.search}%`)) : undefined);
    const items = await db.select(supportSelection).from(travelSupports)
      .innerJoin(destinations, eq(travelSupports.destinationId, destinations.id)).where(where)
      .orderBy(...ordering(query, { name: travelSupports.name, category: travelSupports.category, createdAt: travelSupports.createdAt, priceMin: travelSupports.priceMin }, travelSupports.createdAt, travelSupports.id))
      .limit(query.limit).offset(query.offset);
    const [total] = await db.select({ value: count() }).from(travelSupports)
      .innerJoin(destinations, eq(travelSupports.destinationId, destinations.id)).where(where);
    return { items, total: Number(total?.value ?? 0) };
  },
  async createSupport(input: NewTravelSupportRow, actorId: string): Promise<JoinedTravelSupport> {
    return getDb().transaction(async (tx) => {
      const [row] = await tx.insert(travelSupports).values(input).returning();
      const [destination] = await tx.select({ name: destinations.name }).from(destinations).where(eq(destinations.id, row!.destinationId));
      await audit(tx, actorId, "support.created", "support", row!.id, row!.name);
      return { ...row!, relatedDestinationName: destination!.name };
    });
  },
  async updateSupport(id: string, input: Partial<NewTravelSupportRow>, actorId: string): Promise<JoinedTravelSupport | undefined> {
    return getDb().transaction(async (tx) => {
      const [row] = await tx.update(travelSupports).set({ ...input, updatedAt: new Date() }).where(eq(travelSupports.id, id)).returning();
      if (!row) return;
      const [destination] = await tx.select({ name: destinations.name }).from(destinations).where(eq(destinations.id, row.destinationId));
      await audit(tx, actorId, "support.updated", "support", row.id, row.name);
      return { ...row, relatedDestinationName: destination!.name };
    });
  },
  async deleteSupport(id: string, actorId: string) {
    return getDb().transaction(async (tx) => {
      const [row] = await tx.delete(travelSupports).where(eq(travelSupports.id, id)).returning();
      if (!row) return false;
      await audit(tx, actorId, "support.deleted", "support", row.id, row.name);
      return true;
    });
  },
};
