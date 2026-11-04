import express from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/db/client", () => ({ getDb: vi.fn(), getPool: vi.fn() }));
import { operationsRouter } from "../../src/routes/operations.route";
import { operationsRepository as repo } from "../../src/repositories/operations.repository";
import { operationsService } from "../../src/services/operations.service";
import { errorHandler, notFoundHandler } from "../../src/middleware/error-handler";
import { signAccessToken } from "../../src/utils/jwt";

const app = express();
app.use(express.json());
app.use("/api", operationsRouter);
app.use(notFoundHandler, errorHandler);
const actorId = "11111111-1111-4111-a111-111111111111";
const destinationId = "22222222-2222-4222-a222-222222222222";
const id = "33333333-3333-4333-a333-333333333333";
const now = new Date("2026-10-10T00:00:00Z");
const support = {
  id, destinationId, name: "Jeep Bromo", category: "transport" as const,
  description: null, locationLabel: null, capacity: null, distanceLabel: null,
  priceLabel: null, priceUnit: null, priceMin: 100000, priceMax: 200000,
  contactPhone: null, contactWhatsapp: null, contactInstagram: null, imageUrl: null,
  facilities: [], routes: [], cuisine: [], includesDriver: false, verified: false,
  relatedDestinationName: "Bromo", createdAt: now, updatedAt: now,
};
let admin: string;
let user: string;
beforeAll(async () => {
  admin = await signAccessToken({ sub: actorId, email: "admin@example.com", role: "admin" });
  user = await signAccessToken({ sub: actorId, email: "user@example.com", role: "wisatawan" });
});
beforeEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); });

describe("proposals and dashboard operations", () => {
  const proposal = { id, userId: actorId, name: "Warung", type: "food" as const, destinationId: null, nearestDestinationName: "Bromo", address: "Jalan Bromo 1", note: null, status: "menunggu" as const, reviewNote: null, reviewedBy: null, reviewedAt: null, createdAt: now, updatedAt: now };
  it("creates a proposal with server-owned owner and initial status", async () => {
    const create = vi.spyOn(repo, "createProposal").mockResolvedValue(proposal);
    const res = await request(app).post("/api/facility-proposals").auth(user, { type: "bearer" }).send({ name: "Warung", type: "food", nearestDestinationName: "Bromo", address: "Jalan Bromo 1" });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ userId: actorId, status: "menunggu", reviewNote: null });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ userId: actorId, status: "menunggu" }), actorId);
  });
  it("scopes mine to owner, paginates admin proposals and records reviewer", async () => {
    const mine = vi.spyOn(repo, "mineProposals").mockResolvedValue([proposal]);
    vi.spyOn(repo, "listProposals").mockResolvedValue({ items: [proposal], total: 1 });
    const review = vi.spyOn(repo, "reviewProposal").mockResolvedValue({ ...proposal, status: "terverifikasi", reviewNote: "Diperiksa", reviewedBy: actorId, reviewedAt: now });
    expect((await request(app).get("/api/facility-proposals/mine").auth(user, { type: "bearer" })).body.data).toHaveLength(1);
    expect(mine).toHaveBeenCalledWith(actorId);
    expect((await request(app).get("/api/admin/facility-proposals").auth(admin, { type: "bearer" })).body.meta.total).toBe(1);
    const res = await request(app).patch(`/api/admin/facility-proposals/${id}`).auth(admin, { type: "bearer" }).send({ status: "terverifikasi", reviewNote: "Diperiksa" });
    expect(res.status).toBe(200);
    expect(review).toHaveBeenCalledWith(id, { status: "terverifikasi", reviewNote: "Diperiksa" }, actorId);
  });
  it("rejects spoofed ownership, invalid relation, invalid reviews and unauthenticated proposals", async () => {
    vi.spyOn(repo, "destinationExists").mockResolvedValue(false);
    expect((await request(app).post("/api/facility-proposals").send({})).status).toBe(401);
    expect((await request(app).get("/api/facility-proposals/mine")).status).toBe(401);
    const input = { name: "Warung", type: "food", nearestDestinationName: "Bromo", address: "Jalan Bromo 1" };
    expect((await request(app).post("/api/facility-proposals").auth(user, { type: "bearer" }).send({ ...input, userId: id })).status).toBe(422);
    expect((await request(app).post("/api/facility-proposals").auth(user, { type: "bearer" }).send({ ...input, destinationId })).status).toBe(404);
    expect((await request(app).patch(`/api/admin/facility-proposals/${id}`).auth(admin, { type: "bearer" }).send({ status: "menunggu" })).status).toBe(422);
    expect((await request(app).patch(`/api/admin/facility-proposals/${id}`).auth(user, { type: "bearer" }).send({ status: "ditolak" })).status).toBe(403);
  });
  it("returns database metrics and paginated mutation activity", async () => {
    const metrics = { users: 9, destinations: 4, publishedDestinations: 2, supports: 6, pendingProposals: 1, pendingPayments: 2, paidPayments: 3, dummyRevenue: 50000 };
    vi.spyOn(repo, "metrics").mockResolvedValue(metrics);
    vi.spyOn(repo, "listActivity").mockResolvedValue({ items: [{ id, actorId, action: "support.created", targetType: "support", targetId: id, targetLabel: "Jeep", createdAt: now }], total: 1 });
    expect((await request(app).get("/api/admin/metrics").auth(admin, { type: "bearer" })).body.data).toEqual(metrics);
    expect((await request(app).get("/api/admin/activity").auth(admin, { type: "bearer" })).body.meta.total).toBe(1);
    for (const path of ["metrics", "activity", "merchants", "facility-proposals"]) {
      expect((await request(app).get(`/api/admin/${path}`)).status).toBe(401);
      expect((await request(app).get(`/api/admin/${path}`).auth(user, { type: "bearer" })).status).toBe(403);
    }
  });
});

describe("promo operations", () => {
  const promo = { id, code: "ALAM10", title: "Promo alam", discountType: "percentage" as const, value: 10, minAmount: 0, maxDiscount: null, startsAt: new Date("2020-01-01Z"), endsAt: new Date("2099-01-01Z"), active: true, createdAt: now, updatedAt: now };
  const input = { code: "ALAM10", title: "Promo alam", discountType: "percentage", value: 10, startsAt: "2020-01-01T00:00:00Z", endsAt: "2099-01-01T00:00:00Z" };
  it("creates, lists active, updates and deletes actual promos", async () => {
    const create = vi.spyOn(repo, "createPromo").mockResolvedValue(promo);
    const active = vi.spyOn(repo, "activePromos").mockResolvedValue([promo]);
    vi.spyOn(repo, "listPromos").mockResolvedValue({ items: [promo], total: 1 });
    vi.spyOn(repo, "findPromo").mockResolvedValue(promo);
    vi.spyOn(repo, "updatePromo").mockResolvedValue({ ...promo, active: false });
    vi.spyOn(repo, "deletePromo").mockResolvedValue(true);
    expect((await request(app).post("/api/admin/promos").auth(admin, { type: "bearer" }).send(input)).status).toBe(201);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ code: "ALAM10", active: true, minAmount: 0, startsAt: expect.any(Date) }), actorId);
    const res = await request(app).get("/api/promos");
    expect(res.body.data[0]).toMatchObject({ code: "ALAM10", endsAt: "2099-01-01T00:00:00.000Z" });
    expect(active).toHaveBeenCalledWith(expect.any(Date));
    expect((await request(app).get("/api/admin/promos").auth(admin, { type: "bearer" })).body.meta.total).toBe(1);
    expect((await request(app).patch(`/api/admin/promos/${id}`).auth(admin, { type: "bearer" }).send({ active: false })).body.data.active).toBe(false);
    expect((await request(app).delete(`/api/admin/promos/${id}`).auth(admin, { type: "bearer" })).body.data).toBeNull();
  });
  it.each([{ code: "lower" }, { code: "AA" }, { value: 101 }, { value: 0 }, { discountType: "fixed", value: 1.5 }, { minAmount: -1 }, { startsAt: "bad" }, { startsAt: "2027-02-30T00:00:00Z" }, { startsAt: "2099-01-01T00:00:00Z" }, { maxDiscount: -1 }])("rejects promo boundary %j", async (patch) => {
    expect((await request(app).post("/api/admin/promos").auth(admin, { type: "bearer" }).send({ ...input, ...patch })).status).toBe(422);
  });
  it("checks partial promo date and type changes against persisted fields", async () => {
    vi.spyOn(repo, "findPromo").mockResolvedValue(promo);
    const update = vi.spyOn(repo, "updatePromo");
    for (const patch of [{ endsAt: "2010-01-01T00:00:00Z" }, { value: 101 }]) {
      expect((await request(app).patch(`/api/admin/promos/${id}`).auth(admin, { type: "bearer" }).send(patch)).status).toBe(422);
    }
    expect(update).not.toHaveBeenCalled();
  });
  it("guards promo mutations and maps uniqueness conflicts without leaking SQL", async () => {
    for (const method of ["post", "patch", "delete"] as const) {
      const path = method === "post" ? "/api/admin/promos" : `/api/admin/promos/${id}`;
      expect((await request(app)[method](path).send(input)).status).toBe(401);
      expect((await request(app)[method](path).auth(user, { type: "bearer" }).send(input)).status).toBe(403);
    }
    vi.spyOn(repo, "createPromo").mockRejectedValue(Object.assign(new Error("secret sql"), { cause: { code: "23505" } }));
    const res = await request(app).post("/api/admin/promos").auth(admin, { type: "bearer" }).send(input);
    expect(res.status).toBe(409);
    expect(JSON.stringify(res.body)).not.toContain("secret");
  });
});

describe("supports operations", () => {
  it("creates an admin support for an existing draft destination with audit actor", async () => {
    vi.spyOn(repo, "destinationExists").mockResolvedValue(true);
    const create = vi.spyOn(repo, "createSupport").mockResolvedValue(support);
    const res = await request(app).post("/api/admin/supports").auth(admin, { type: "bearer" })
      .send({ destinationId, name: support.name, category: "transport", priceMin: 100000, priceMax: 200000 });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ id, relatedDestinationName: "Bromo", priceMin: 100000, createdAt: now.toISOString() });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ destinationId, facilities: [], verified: false }), actorId);
  });

  it("guards every admin support operation before database access", async () => {
    const find = vi.spyOn(repo, "findSupport");
    for (const [method, path] of [["get", "/admin/supports"], ["post", "/admin/supports"], ["get", `/admin/supports/${id}`], ["patch", `/admin/supports/${id}`], ["delete", `/admin/supports/${id}`]] as const) {
      expect((await request(app)[method](`/api${path}`).send({})).status).toBe(401);
      expect((await request(app)[method](`/api${path}`).auth(user, { type: "bearer" }).send({})).status).toBe(403);
    }
    expect(find).not.toHaveBeenCalled();
  });

  it("lists public supports with published-only filtering, category, pagination", async () => {
    const list = vi.spyOn(repo, "listSupports").mockResolvedValue({ items: [support], total: 3 });
    const res = await request(app).get(`/api/supports?destinationId=${destinationId}&category=transport&page=2&limit=1`);
    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({ page: 2, total: 3, hasNext: true });
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ offset: 1, destinationId, category: "transport" }), true);
  });

  it("reads, updates and deletes supports with expected response envelopes", async () => {
    vi.spyOn(repo, "findSupport").mockResolvedValue(support);
    vi.spyOn(repo, "updateSupport").mockResolvedValue({ ...support, name: "Jeep Baru" });
    vi.spyOn(repo, "deleteSupport").mockResolvedValue(true);
    expect((await request(app).get(`/api/admin/supports/${id}`).auth(admin, { type: "bearer" })).body.data.id).toBe(id);
    const updated = await request(app).patch(`/api/admin/supports/${id}`).auth(admin, { type: "bearer" }).send({ name: "Jeep Baru" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe("Jeep Baru");
    expect((await request(app).delete(`/api/admin/supports/${id}`).auth(admin, { type: "bearer" })).body).toEqual({ success: true, data: null });
  });

  it("validates partial price ranges against persisted support prices", async () => {
    vi.spyOn(repo, "findSupport").mockResolvedValue(support);
    const update = vi.spyOn(repo, "updateSupport");
    const res = await request(app).patch(`/api/admin/supports/${id}`).auth(admin, { type: "bearer" }).send({ priceMin: 300000 });
    expect(res.status).toBe(422);
    expect(update).not.toHaveBeenCalled();
  });

  it.each([
    { code: "23514", constraint: "travel_supports_prices" },
    { cause: { code: "23514", constraint: "travel_supports_prices" } },
  ])("maps only the support price constraint to its validation response: %j", async (failure) => {
    vi.spyOn(repo, "findSupport").mockResolvedValue(support);
    vi.spyOn(repo, "updateSupport").mockRejectedValue(Object.assign(new Error("secret SQL"), failure));
    const res = await request(app).patch(`/api/admin/supports/${id}`).auth(admin, { type: "bearer" }).send({ priceMin: 150000 });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({ success: false, error: { code: "VALIDATION_ERROR", message: "Rentang harga fasilitas tidak valid" } });
  });

  it.each([
    { code: "23514", constraint: "unrelated_check" },
    { code: "23514" },
    { code: "23514", cause: { constraint: "travel_supports_prices" } },
    { constraint: "travel_supports_prices", cause: { code: "23514" } },
  ])("preserves generic check validation without matching separate error nodes: %j", async (failure) => {
    vi.spyOn(repo, "findSupport").mockResolvedValue(support);
    vi.spyOn(repo, "updateSupport").mockRejectedValue(Object.assign(new Error("secret SQL"), failure));
    await expect(operationsService.updateSupport(id, { priceMin: 150000 }, actorId)).rejects.toMatchObject({ statusCode: 422, code: "VALIDATION_ERROR", message: "Nilai atau rentang data tidak valid" });
  });

  it("does not classify a non-check failure bearing the support price constraint", async () => {
    vi.spyOn(repo, "findSupport").mockResolvedValue(support);
    const error = Object.assign(new Error("database failure"), { code: "XX000", constraint: "travel_supports_prices" });
    vi.spyOn(repo, "updateSupport").mockRejectedValue(error);
    await expect(operationsService.updateSupport(id, { priceMin: 150000 }, actorId)).rejects.toBe(error);
  });

  it.each([{ priceMin: -1 }, { priceMin: 1.5 }, { priceMin: 200, priceMax: 100 }, { name: " " }, { imageUrl: "javascript:bad" }, { surprise: "field" }])("rejects invalid support input %j", async (patch) => {
    const create = vi.spyOn(repo, "createSupport");
    const res = await request(app).post("/api/admin/supports").auth(admin, { type: "bearer" }).send({ destinationId, name: "Jeep", category: "transport", ...patch });
    expect(res.status).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects bad IDs, missing destinations and missing supports", async () => {
    vi.spyOn(repo, "destinationExists").mockResolvedValue(false);
    vi.spyOn(repo, "findSupport").mockResolvedValue(undefined);
    expect((await request(app).get("/api/admin/supports/bad").auth(admin, { type: "bearer" })).status).toBe(400);
    expect((await request(app).get(`/api/admin/supports/${id}`).auth(admin, { type: "bearer" })).status).toBe(404);
    expect((await request(app).post("/api/admin/supports").auth(admin, { type: "bearer" }).send({ destinationId, name: "Jeep", category: "transport" })).status).toBe(404);
  });
});
