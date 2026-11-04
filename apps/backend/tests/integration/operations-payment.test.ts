import express from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/db/client", () => ({ getDb: vi.fn(), getPool: vi.fn() }));
import { operationsRouter } from "../../src/routes/operations.route";
import { operationsRepository as repo } from "../../src/repositories/operations.repository";
import { errorHandler, notFoundHandler } from "../../src/middleware/error-handler";
import { signAccessToken } from "../../src/utils/jwt";
import type { DummyPaymentRow, PromoRow } from "../../src/db/schema";

const app = express();
app.use(express.json());
app.use("/api", operationsRouter);
app.use(notFoundHandler, errorHandler);
const actorId = "11111111-1111-4111-a111-111111111111";
const supportId = "33333333-3333-4333-a333-333333333333";
const id = "44444444-4444-4444-a444-444444444444";
const now = new Date();
const support = { id: supportId, name: "Jeep", priceMin: 100001 };
const promo: PromoRow = { id, code: "ALAM10", title: "Alam", discountType: "percentage", value: 10, minAmount: 0, maxDiscount: null, active: true, startsAt: new Date("2020-01-01Z"), endsAt: new Date("2099-01-01Z"), createdAt: now, updatedAt: now };
const payment: DummyPaymentRow = { id, userId: actorId, supportId, supportName: "Jeep", quantity: 2, subtotal: 200002, discount: 20000, total: 180002, promoId: id, promoCode: "ALAM10", status: "pending", method: "dummy_qr", isDummy: true, qrPayload: `DUMMY:${id}`, paidAt: null, createdAt: now, updatedAt: now };
let admin: string;
let user: string;
beforeAll(async () => {
  admin = await signAccessToken({ sub: actorId, email: "admin@example.com", role: "admin" });
  user = await signAccessToken({ sub: actorId, email: "user@example.com", role: "wisatawan" });
});
beforeEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); });

function quote(...args: [s?: { id: string; name: string; priceMin: number | null }, p?: PromoRow]) {
  const s = args.length ? args[0] : support;
  const p = args.length > 1 ? args[1] : promo;
  return vi.spyOn(repo, "createPayment").mockImplementation(async (_input, _actorId, calculate) => ({ ...payment, ...calculate(s, p) } as DummyPaymentRow));
}

describe("dummy payments", () => {
  it("prices server support with integer percentage floor and returns standard local QR", async () => {
    const create = quote();
    const res = await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 2, promoCode: "ALAM10" });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ userId: actorId, supportName: "Jeep", quantity: 2, subtotal: 200002, discount: 20000, total: 180002, status: "pending", isDummy: true, method: "dummy_qr", paidAt: null });
    expect(res.body.data.qrPayload).toBe(`DUMMY:${res.body.data.id}`);
    expect(res.body.data.qrMatrix).toHaveLength(29);
    expect(res.body.data.qrMatrix.every((row: unknown[]) => row.length === 29 && row.every((value) => typeof value === "boolean"))).toBe(true);
    expect(res.body.data.promoId).toBeUndefined();
    expect(create).toHaveBeenCalledWith({ supportId, quantity: 2, promoCode: "ALAM10" }, actorId, expect.any(Function));
  });
  it.each([{ amount: 1 }, { total: 1 }, { userId: id }, { method: "qris" }, { quantity: 0 }, { quantity: 101 }, { quantity: 1.5 }, { promoCode: "lower" }])("rejects client-controlled price/identity/invalid quantity %j", async (input) => {
    const create = vi.spyOn(repo, "createPayment");
    const res = await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 1, ...input });
    expect(res.status).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });
  it.each([
    { ...promo, active: false }, { ...promo, startsAt: new Date("2099-01-01Z") },
    { ...promo, endsAt: new Date("2000-01-01Z") }, { ...promo, minAmount: 200000 },
    undefined,
  ])("rejects invalid/inactive/future/expired/minimum/unmatched promo %#", async (invalid) => {
    quote(support, invalid);
    expect((await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 1, promoCode: "ALAM10" })).status).toBe(422);
  });
  it.each([
    [{ ...promo, discountType: "fixed" as const, value: 200000 }, 100001],
    [{ ...promo, value: 100 }, 100001],
    [{ ...promo, maxDiscount: 5000 }, 5000],
    [{ ...promo, maxDiscount: 0 }, 0],
  ])("caps discounts at subtotal/maxDiscount %#", async (value, discount) => {
    quote(support, value);
    const res = await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 1, promoCode: "ALAM10" });
    expect(res.status).toBe(201);
    expect(res.body.data.discount).toBe(discount);
    expect(res.body.data.total).toBe(100001 - discount);
  });
  it("handles zero-price and maximum integer subtotal without overflow", async () => {
    quote({ ...support, priceMin: 2147483647 });
    const max = await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 100 });
    expect(max.body.data.total).toBe(214748364700);
    vi.restoreAllMocks();
    quote({ ...support, priceMin: 0 });
    const zero = await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 1 });
    expect(zero.body.data.total).toBe(0);
  });
  it("requires published support with an available nonnegative integer price", async () => {
    quote(undefined);
    expect((await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 1 })).status).toBe(404);
    for (const priceMin of [null, -1, 1.5]) {
      vi.restoreAllMocks(); quote({ ...support, priceMin });
      expect((await request(app).post("/api/payments").auth(user, { type: "bearer" }).send({ supportId, quantity: 1 })).status).toBe(422);
    }
  });
  it("scopes owner detail/mine and allows administrator reads/list", async () => {
    const find = vi.spyOn(repo, "findPayment").mockResolvedValue(payment);
    const mine = vi.spyOn(repo, "minePayments").mockResolvedValue([payment]);
    vi.spyOn(repo, "listPayments").mockResolvedValue({ items: [payment], total: 1 });
    expect((await request(app).get(`/api/payments/${id}`).auth(user, { type: "bearer" })).status).toBe(200);
    expect(find).toHaveBeenLastCalledWith(id, actorId);
    expect((await request(app).get(`/api/payments/${id}`).auth(admin, { type: "bearer" })).status).toBe(200);
    expect(find).toHaveBeenLastCalledWith(id, undefined);
    expect((await request(app).get("/api/payments/mine").auth(user, { type: "bearer" })).body.data).toHaveLength(1);
    expect(mine).toHaveBeenCalledWith(actorId);
    expect((await request(app).get("/api/admin/payments?status=pending").auth(admin, { type: "bearer" })).body.meta.total).toBe(1);
    expect((await request(app).get("/api/admin/payments").auth(user, { type: "bearer" })).status).toBe(403);
  });
  it("returns 404 for missing/cross-user payments and validates identifiers", async () => {
    vi.spyOn(repo, "findPayment").mockResolvedValue(undefined);
    vi.spyOn(repo, "transitionPayment").mockResolvedValue(undefined);
    expect((await request(app).get(`/api/payments/${id}`).auth(user, { type: "bearer" })).status).toBe(404);
    expect((await request(app).post(`/api/payments/${id}/simulate`).auth(user, { type: "bearer" }).send({ status: "paid" })).status).toBe(404);
    expect((await request(app).get("/api/payments/bad").auth(user, { type: "bearer" })).status).toBe(400);
  });
  it("supports idempotent same outcome, rejects terminal reversal", async () => {
    const transition = vi.spyOn(repo, "transitionPayment").mockResolvedValue({ ...payment, status: "paid", paidAt: now });
    for (let i = 0; i < 2; i++) {
      expect((await request(app).post(`/api/payments/${id}/simulate`).auth(user, { type: "bearer" }).send({ status: "paid" })).status).toBe(201);
    }
    expect(transition).toHaveBeenLastCalledWith(id, "paid", actorId, false);
    expect((await request(app).post(`/api/payments/${id}/simulate`).auth(admin, { type: "bearer" }).send({ status: "cancelled" })).status).toBe(409);
    expect(transition).toHaveBeenLastCalledWith(id, "cancelled", actorId, true);
    expect((await request(app).post(`/api/payments/${id}/simulate`).auth(user, { type: "bearer" }).send({ status: "pending" })).status).toBe(422);
  });
  it("requires authentication across every personal payment operation", async () => {
    for (const [method, path] of [["get", "/payments/mine"], ["get", `/payments/${id}`], ["post", "/payments"], ["post", `/payments/${id}/simulate`], ["get", "/admin/payments"]] as const) {
      expect((await request(app)[method](`/api${path}`).send({})).status).toBe(401);
    }
  });
});
