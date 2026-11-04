import express from "express";
import { SQL } from "drizzle-orm";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { PgDialect, getTableConfig } from "drizzle-orm/pg-core";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

vi.mock("../../src/db/client", () => ({ getDb: vi.fn(), getPool: vi.fn() }));
import { getDb } from "../../src/db/client";
import { operationsRouter } from "../../src/routes/operations.route";
import { errorHandler, notFoundHandler } from "../../src/middleware/error-handler";
import { signAccessToken } from "../../src/utils/jwt";
import { operationsRepository as repo } from "../../src/repositories/operations.repository";
import * as schema from "../../src/db/schema";
import { notifications } from "../../src/db/personal-schema";
import { loadEnv } from "../../src/config/env";

// Opt-in real PostgreSQL, isolated TEMP tables only. Never migrate/seed/drop
// application tables. Each TEMP table shadows the application table for this
// connection; all test records disappear automatically when the client closes.
const enabled = process.env.OPERATIONS_DB_TEST === "1";
const dbIt = enabled ? it : it.skip;
const app = express();
app.use(express.json()); app.use("/api", operationsRouter); app.use(notFoundHandler, errorHandler);
let pool: Pool;
let client: PoolClient;
let admin: string;
let user: string;
let other: string;
const actorId = randomUUID(), ownerId = randomUUID(), otherId = randomUUID();
const destinationId = randomUUID(), draftId = randomUUID();
let supportId: string;
let paymentId: string;

beforeAll(async () => {
  if (!enabled) return;
  pool = new Pool({ connectionString: loadEnv().DATABASE_URL, max: 1 });
  client = await pool.connect();
  // Guard accidental writes even if a future test adds an unshadowed table.
  await client.query("BEGIN");
  const dialect = new PgDialect();
  const tables = [schema.users, schema.destinations, schema.travelSupports, schema.operationActivity, schema.facilityProposals, schema.promos, schema.dummyPayments, notifications];
  const quote = (s: string) => `"${s.replaceAll('"', '""')}"`;
  for (const table of tables) {
    const config = getTableConfig(table);
    const columns = config.columns.map((col) => {
      const type = "enumValues" in col && col.enumValues?.length ? "text" : col.getSQLType();
      const value = col.default;
      const literal = value instanceof SQL ? dialect.sqlToQuery(value).sql
        : Array.isArray(value) ? "ARRAY[]::text[]"
        : typeof value === "string" ? `'${value.replaceAll("'", "''")}'` : String(value);
      const def = value === undefined ? "" : ` DEFAULT ${literal}`;
      return `${quote(col.name)} ${type}${col.notNull ? " NOT NULL" : ""}${col.primary ? " PRIMARY KEY" : ""}${col.isUnique ? " UNIQUE" : ""}${def}`;
    });
    for (const check of config.checks) columns.push(`CONSTRAINT ${quote(check.name)} CHECK (${dialect.sqlToQuery(check.value).sql})`);
    await client.query(`CREATE TEMP TABLE ${quote(config.name)} (${columns.join(", ")}) ON COMMIT PRESERVE ROWS`);
  }
  const db = drizzle(client, { schema });
  vi.mocked(getDb).mockReturnValue(db);
  await db.insert(schema.users).values([
    { id: actorId, name: "Operations admin test", email: `${actorId}@example.test`, role: "admin" },
    { id: ownerId, name: "Operations owner test", email: `${ownerId}@example.test`, role: "wisatawan" },
    { id: otherId, name: "Operations other test", email: `${otherId}@example.test`, role: "merchant" },
  ]);
  await db.insert(schema.destinations).values([
    { id: destinationId, name: "Test published", slug: destinationId, status: "published" },
    { id: draftId, name: "Test draft", slug: draftId, status: "draft" },
  ]);
  admin = await signAccessToken({ sub: actorId, email: `${actorId}@example.test`, role: "admin" });
  user = await signAccessToken({ sub: ownerId, email: `${ownerId}@example.test`, role: "wisatawan" });
  other = await signAccessToken({ sub: otherId, email: `${otherId}@example.test`, role: "merchant" });
}, 30000);
afterAll(async () => {
  if (client) { await client.query("ROLLBACK"); client.release(); }
  if (pool) await pool.end();
});

dbIt("persists admin supports, protects public draft visibility, updates and deletes", async () => {
  const create = await request(app).post("/api/admin/supports").auth(admin, { type: "bearer" }).send({ destinationId, name: "Jeep test", category: "transport", priceMin: 100001, priceMax: 200000 });
  expect(create.status).toBe(201);
  supportId = create.body.data.id;
  expect((await request(app).get(`/api/admin/supports/${supportId}`).auth(admin, { type: "bearer" })).body.data.name).toBe("Jeep test");
  expect((await request(app).patch(`/api/admin/supports/${supportId}`).auth(admin, { type: "bearer" }).send({ name: "Jeep baru" })).status).toBe(200);
  const draft = await request(app).post("/api/admin/supports").auth(admin, { type: "bearer" }).send({ destinationId: draftId, name: "Hidden test", category: "food", priceMin: 1 });
  expect(draft.status).toBe(201);
  const publicList = await request(app).get("/api/supports");
  expect(publicList.status).toBe(200);
  expect(publicList.body.data.map((s: { id: string }) => s.id)).toEqual([supportId]);
  expect((await request(app).delete(`/api/admin/supports/${draft.body.data.id}`).auth(admin, { type: "bearer" })).body.data).toBeNull();
});

dbIt("persists proposals and reviews, scopes mine to owner without publishing a support", async () => {
  const create = await request(app).post("/api/facility-proposals").auth(user, { type: "bearer" }).send({ name: "Warung test", type: "food", destinationId, nearestDestinationName: "Test published", address: "Alamat test" });
  expect(create.status).toBe(201);
  const review = await request(app).patch(`/api/admin/facility-proposals/${create.body.data.id}`).auth(admin, { type: "bearer" }).send({ status: "terverifikasi", reviewNote: "Sudah ditinjau" });
  expect(review.status).toBe(200);
  expect(review.body.data).toMatchObject({ reviewedBy: actorId, status: "terverifikasi", reviewNote: "Sudah ditinjau" });
  expect(review.body.data.reviewedAt).toEqual(expect.any(String));
  expect((await request(app).get("/api/facility-proposals/mine").auth(user, { type: "bearer" })).body.data).toHaveLength(1);
  expect((await request(app).get("/api/facility-proposals/mine").auth(other, { type: "bearer" })).body.data).toEqual([]);
  expect((await repo.metrics()).supports).toBe(1);
});

dbIt("persists real promo, computes payment and enforces ownership/idempotency/terminal immutability", async () => {
  const createdPromo = await request(app).post("/api/admin/promos").auth(admin, { type: "bearer" }).send({ code: "TEST10", title: "Test only", discountType: "percentage", value: 10, startsAt: "2020-01-01T00:00:00Z", endsAt: "2099-01-01T00:00:00Z" });
  expect(createdPromo.status).toBe(201);
  expect((await request(app).get("/api/promos")).body.data).toHaveLength(1);
  const createdPayment = await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 2, promoCode: "TEST10" });
  expect(createdPayment.status).toBe(201);
  paymentId = createdPayment.body.data.id;
  expect(createdPayment.body.data).toMatchObject({ subtotal: 200002, discount: 20000, total: 180002, isDummy: true, method: "dummy_qr", status: "pending" });
  expect((await request(app).get(`/api/payments/${paymentId}`).auth(other, { type: "bearer" })).status).toBe(404);
  expect((await request(app).post(`/api/payments/${paymentId}/simulate`).auth(other, { type: "bearer" }).send({ status: "paid" })).status).toBe(404);
  expect((await repo.findPayment(paymentId, ownerId))?.status).toBe("pending");
  const paid = await request(app).post(`/api/payments/${paymentId}/simulate`).auth(user, { type: "bearer" }).send({ status: "paid" });
  expect(paid.status).toBe(201);
  const same = await request(app).post(`/api/payments/${paymentId}/simulate`).auth(user, { type: "bearer" }).send({ status: "paid" });
  expect(same.body.data.paidAt).toBe(paid.body.data.paidAt);
  expect((await request(app).post(`/api/payments/${paymentId}/simulate`).auth(admin, { type: "bearer" }).send({ status: "cancelled" })).status).toBe(409);
  expect((await repo.findPayment(paymentId, ownerId))?.status).toBe("paid");
});

dbIt("validates active promo intervals against real persisted timestamps", async () => {
  const createPromo = (code: string, startsAt: string, endsAt: string, active = true) => request(app).post("/api/admin/promos").auth(admin, { type: "bearer" }).send({ code, title: code, discountType: "fixed", value: 100, startsAt, endsAt, active });
  const rows = [
    await createPromo("EXPIRED", "2000-01-01T00:00:00Z", "2001-01-01T00:00:00Z"),
    await createPromo("FUTURE", "2098-01-01T00:00:00Z", "2099-01-01T00:00:00Z"),
    await createPromo("INACTIVE", "2000-01-01T00:00:00Z", "2099-01-01T00:00:00Z", false),
  ];
  expect(rows.map((r) => r.status)).toEqual([201, 201, 201]);
  const publicList = await request(app).get("/api/promos");
  expect(publicList.body.data.map((p: { code: string }) => p.code)).toEqual(["TEST10"]);
  for (const promoCode of ["EXPIRED", "FUTURE", "INACTIVE", "UNKNOWN"]) {
    expect((await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 1, promoCode })).status).toBe(422);
  }
  for (const row of rows) expect((await request(app).delete(`/api/admin/promos/${row.body.data.id}`).auth(admin, { type: "bearer" })).status).toBe(200);
});

dbIt("reads accurate metrics and append-only transactional activity from PostgreSQL", async () => {
  expect(await repo.metrics()).toEqual({ users: 3, destinations: 2, publishedDestinations: 1, supports: 1, pendingProposals: 0, pendingPayments: 0, paidPayments: 1, dummyRevenue: 180002 });
  const log = await repo.listActivity({ page: 1, limit: 100, offset: 0, order: "asc" });
  const notices = await getDb().select().from(notifications);
  expect(notices).toHaveLength(4);
  expect(notices.every((n) => n.userId === ownerId && !n.read)).toBe(true);
  expect(notices.map((n) => n.kind).sort()).toEqual(["sistem", "sistem", "usulan", "usulan"]);
  expect(log.total).toBe(15);
  expect(log.items.filter((v) => v.action === "payment.paid")).toHaveLength(1);
  expect(log.items.every((v) => v.actorId === actorId || v.actorId === ownerId)).toBe(true);
  expect((await request(app).get("/api/admin/merchants").auth(admin, { type: "bearer" })).body.data.map((v: { id: string }) => v.id)).toEqual([otherId]);
});
