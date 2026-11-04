import express from "express";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { SQL, eq } from "drizzle-orm";
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

// Dedicated disposable PostgreSQL ONLY. No fallback to application DATABASE_URL.
// Example: docker run --rm -d -p 127.0.0.1::5432 -e POSTGRES_HOST_AUTH_METHOD=trust
// -e POSTGRES_DB=dolenae_operations_test postgres:16
const url = process.env.OPERATIONS_RACE_DATABASE_URL;
const dbIt = url ? it : it.skip;
const app = express();
app.use(express.json()); app.use("/api", operationsRouter); app.use(notFoundHandler, errorHandler);
let pool: Pool;
let db: ReturnType<typeof getDb>;
let user: string;
let admin: string;
let connections = 0;
const userId = randomUUID(), destinationId = randomUUID(), supportId = randomUUID();
beforeAll(async () => {
  if (!url) return;
  const parsed = new URL(url);
  if (parsed.pathname !== "/dolenae_operations_test" || !["localhost", "127.0.0.1"].includes(parsed.hostname)) throw new Error("Race tests require a dedicated local dolenae_operations_test database");
  pool = new Pool({ connectionString: url, max: 8 });
  pool.on("connect", () => connections++);
  const dialect = new PgDialect();
  const quote = (s: string) => `"${s.replaceAll('"', '""')}"`;
  // No IF NOT EXISTS: refuse reuse of a database containing application tables.
  for (const table of [schema.users, schema.destinations, schema.travelSupports, schema.operationActivity, schema.promos, schema.dummyPayments, notifications]) {
    const config = getTableConfig(table);
    const columns = config.columns.map((col) => {
      const type = "enumValues" in col && col.enumValues?.length ? "text" : col.getSQLType();
      const value = col.default;
      const literal = value instanceof SQL ? dialect.sqlToQuery(value).sql : Array.isArray(value) ? "ARRAY[]::text[]" : typeof value === "string" ? `'${value.replaceAll("'", "''")}'` : String(value);
      return `${quote(col.name)} ${type}${col.notNull ? " NOT NULL" : ""}${col.primary ? " PRIMARY KEY" : ""}${col.isUnique ? " UNIQUE" : ""}${value === undefined ? "" : ` DEFAULT ${literal}`}`;
    });
    for (const check of config.checks) columns.push(`CONSTRAINT ${quote(check.name)} CHECK (${dialect.sqlToQuery(check.value).sql})`);
    for (const fk of config.foreignKeys) {
      const ref = fk.reference();
      columns.push(`CONSTRAINT ${quote(fk.getName())} FOREIGN KEY (${ref.columns.map((c) => quote(c.name)).join(", ")}) REFERENCES ${quote(getTableConfig(ref.foreignTable).name)} (${ref.foreignColumns.map((c) => quote(c.name)).join(", ")}) ON DELETE ${fk.onDelete}`);
    }
    await pool.query(`CREATE TABLE ${quote(config.name)} (${columns.join(", ")})`);
  }
  db = drizzle(pool, { schema }); vi.mocked(getDb).mockReturnValue(db);
  await db.insert(schema.users).values({ id: userId, name: "Race test", email: `${userId}@example.test`, role: "wisatawan" });
  await db.insert(schema.destinations).values({ id: destinationId, name: "Race destination", slug: destinationId, status: "published" });
  await db.insert(schema.travelSupports).values({ id: supportId, destinationId, name: "Race support", category: "transport", priceMin: 10000 });
  user = await signAccessToken({ sub: userId, email: `${userId}@example.test`, role: "wisatawan" });
  admin = await signAccessToken({ sub: userId, email: `${userId}@example.test`, role: "admin" });
}, 30000);
afterAll(async () => { if (pool) await pool.end(); });

async function pending() {
  const res = await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 1 });
  expect(res.status).toBe(201);
  return res.body.data.id as string;
}
const simulate = (id: string, status: string) => request(app).post(`/api/payments/${id}/simulate`).auth(user, { type: "bearer" }).send({ status });

dbIt("atomically resolves competing paid/cancelled requests on separate PostgreSQL connections", async () => {
  for (let i = 0; i < 12; i++) {
    const id = await pending();
    const results = await Promise.all([simulate(id, "paid"), simulate(id, "cancelled")]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    const [stored] = await db.select().from(schema.dummyPayments).where(eq(schema.dummyPayments.id, id));
    const winner = results.find((r) => r.status === 201)!;
    expect(stored!.status).toBe(winner.body.data.status);
    expect(Boolean(stored!.paidAt)).toBe(stored!.status === "paid");
    const logs = await db.select().from(schema.operationActivity).where(eq(schema.operationActivity.targetId, id));
    expect(logs.map((r) => r.action).sort()).toEqual(["payment.created", `payment.${stored!.status}`].sort());
  }
  expect(connections).toBeGreaterThanOrEqual(2);
}, 30000);

dbIt("same-outcome concurrent requests are idempotent, terminal cancellation cannot become paid", async () => {
  const id = await pending();
  const results = await Promise.all([simulate(id, "cancelled"), simulate(id, "cancelled"), simulate(id, "cancelled")]);
  expect(results.map((r) => r.status)).toEqual([201, 201, 201]);
  expect(new Set(results.map((r) => r.body.data.updatedAt)).size).toBe(1);
  expect((await simulate(id, "paid")).status).toBe(409);
  const [stored] = await db.select().from(schema.dummyPayments).where(eq(schema.dummyPayments.id, id));
  expect(stored!.status).toBe("cancelled"); expect(stored!.paidAt).toBeNull();
  const logs = await db.select().from(schema.operationActivity).where(eq(schema.operationActivity.targetId, id));
  expect(logs.filter((r) => r.action === "payment.cancelled")).toHaveLength(1);
});

dbIt("rejects a concurrent partial price update after both requests read the old range", async () => {
  const [support] = await db.insert(schema.travelSupports).values({ destinationId, name: "Concurrent prices", category: "food", priceMin: 100, priceMax: 200 }).returning();
  const find = repo.findSupport.bind(repo);
  let reads = 0;
  let release!: () => void;
  const ready = new Promise<void>((resolve) => { release = resolve; });
  // Synchronize real reads, not mocked rows: both requests validate 100..200.
  const read = vi.spyOn(repo, "findSupport").mockImplementation(async (id) => {
    const row = await find(id);
    if (++reads === 2) release();
    await ready;
    return row;
  });
  try {
    const results = await Promise.all([{ priceMin: 150 }, { priceMax: 120 }].map((patch) =>
      request(app).patch(`/api/admin/supports/${support!.id}`).auth(admin, { type: "bearer" }).send(patch)));
    expect(reads).toBe(2);
    expect(results.map((r) => r.status).sort()).toEqual([200, 422]);
    const winner = results.find((r) => r.status === 200)!;
    const rejected = results.find((r) => r.status === 422)!;
    expect(rejected.body).toEqual({ success: false, error: { code: "VALIDATION_ERROR", message: "Rentang harga fasilitas tidak valid" } });
    const [stored] = await db.select().from(schema.travelSupports).where(eq(schema.travelSupports.id, support!.id));
    expect(stored!.priceMin).toBeLessThanOrEqual(stored!.priceMax!);
    expect(stored).toMatchObject({ priceMin: winner.body.data.priceMin, priceMax: winner.body.data.priceMax });
    const logs = await db.select().from(schema.operationActivity).where(eq(schema.operationActivity.targetId, support!.id));
    expect(logs.map((r) => r.action)).toEqual(["support.updated"]);
    expect(connections).toBeGreaterThanOrEqual(2);
  } finally { read.mockRestore(); }
});

dbIt("database rejects invalid support prices on insert and update", async () => {
  const [valid] = await db.insert(schema.travelSupports).values({ destinationId, name: "Price invariant", category: "food", priceMin: 100, priceMax: 200 }).returning();
  for (const prices of [{ priceMin: 150, priceMax: 120 }, { priceMin: -1, priceMax: null }, { priceMin: null, priceMax: -1 }]) {
    await expect(db.insert(schema.travelSupports).values({ destinationId, name: "Invalid prices", category: "food", ...prices })).rejects.toMatchObject({ code: "23514", constraint: "travel_supports_prices" });
    await expect(db.update(schema.travelSupports).set(prices).where(eq(schema.travelSupports.id, valid!.id))).rejects.toMatchObject({ code: "23514", constraint: "travel_supports_prices" });
  }
  const [stored] = await db.select().from(schema.travelSupports).where(eq(schema.travelSupports.id, valid!.id));
  expect(stored).toMatchObject({ priceMin: 100, priceMax: 200 });
});

dbIt("database accepts nullable support prices and int32 boundaries", async () => {
  const [valid] = await db.insert(schema.travelSupports).values({ destinationId, name: "Nullable prices", category: "food" }).returning();
  for (const prices of [
    { priceMin: null, priceMax: null }, { priceMin: 0, priceMax: null }, { priceMin: null, priceMax: 0 },
    { priceMin: 2147483647, priceMax: null }, { priceMin: null, priceMax: 2147483647 },
    { priceMin: 0, priceMax: 0 }, { priceMin: 0, priceMax: 2147483647 }, { priceMin: 2147483647, priceMax: 2147483647 },
  ]) {
    const [inserted] = await db.insert(schema.travelSupports).values({ destinationId, name: "Boundary prices", category: "food", ...prices }).returning();
    expect(inserted).toMatchObject(prices);
    const [updated] = await db.update(schema.travelSupports).set(prices).where(eq(schema.travelSupports.id, valid!.id)).returning();
    expect(updated).toMatchObject(prices);
  }
});

dbIt("database enforces foreign keys and dummy amount/provider invariants", async () => {
  await expect(db.insert(schema.travelSupports).values({ destinationId: randomUUID(), name: "Orphan", category: "food" })).rejects.toMatchObject({ code: "23503" });
  const id = await pending();
  await expect(db.update(schema.dummyPayments).set({ total: 1 }).where(eq(schema.dummyPayments.id, id))).rejects.toMatchObject({ code: "23514" });
  await expect(db.update(schema.dummyPayments).set({ isDummy: false }).where(eq(schema.dummyPayments.id, id))).rejects.toMatchObject({ code: "23514" });
  await expect(db.delete(schema.travelSupports).where(eq(schema.travelSupports.id, supportId))).rejects.toMatchObject({ code: "23503" });
});
