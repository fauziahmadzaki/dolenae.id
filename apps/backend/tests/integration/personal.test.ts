import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { memory, resetMemory, state, ownerId, otherId, destinationId, draftId, supportId } from "../helpers/personal-memory";

vi.mock("../../src/repositories/personal.repository", () => ({ personalRepository: memory }));
vi.mock("../../src/repositories/destination.repository", () => ({ destinationRepository: {
  findById: async (id: string) => id === destinationId ? { id, name: "Gunung Uji", slug: "gunung-uji", status: "published", difficulty: "menengah", bestSeason: [], tags: [], facilities: [], images: [], accessTransport: [], latitude: "-6.9", longitude: "107.6", accessDistanceKm: null, createdAt: new Date("2026-01-01Z"), updatedAt: new Date("2026-01-01Z") } : undefined,
  findCategoryIds: async () => [],
} }));
vi.mock("../../src/repositories/category.repository", () => ({ categoryRepository: { findByIds: async () => [] } }));
import { personalRouter } from "../../src/routes/personal.route";
import { errorHandler, notFoundHandler } from "../../src/middleware/error-handler";
import { requestId } from "../../src/middleware/request-id";
import { signAccessToken } from "../../src/utils/jwt";

const app = express();
app.use(express.json(), requestId());
app.use("/api", personalRouter);
app.use(notFoundHandler, errorHandler);
let ownerToken: string;
let otherToken: string;
let adminToken: string;
const tripBody = { name: "Pendakian bersama", startDate: "2026-12-01", endDate: "2026-12-03", peopleCount: 3 };
const call = (method: "get" | "post" | "patch" | "delete", path: string, body?: unknown, token = ownerToken) => {
  const req = request(app)[method]("/api" + path).auth(token, { type: "bearer" });
  return body === undefined ? req : req.send(body);
};
const createTrip = async () => (await call("post", "/trips", tripBody)).body.data;
beforeEach(async () => {
  resetMemory();
  ownerToken = await signAccessToken({ sub: ownerId, email: "owner@example.test", role: "wisatawan" });
  otherToken = await signAccessToken({ sub: otherId, email: "other@example.test", role: "wisatawan" });
  adminToken = await signAccessToken({ sub: otherId, email: "admin@example.test", role: "admin" });
});

describe("all personal route authentication", () => {
  it.each([
    ["get", "/trips"], ["post", "/trips"], ["get", `/trips/${destinationId}`], ["patch", `/trips/${destinationId}`], ["delete", `/trips/${destinationId}`],
    ["post", `/trips/${destinationId}/items`], ["patch", `/trips/${destinationId}/items/${supportId}`], ["delete", `/trips/${destinationId}/items/${supportId}`],
    ["get", `/destinations/${destinationId}/checklist`], ["post", `/checklists/${destinationId}/items`], ["patch", `/checklists/${destinationId}/items/${supportId}`], ["delete", `/checklists/${destinationId}/items/${supportId}`],
    ["get", "/saved/destinations"], ["post", "/saved/destinations"], ["delete", `/saved/destinations/${destinationId}`], ["get", "/saved/plans"], ["patch", `/saved/plans/${destinationId}`], ["delete", `/saved/plans/${destinationId}`],
    ["get", "/saved/checklists"], ["delete", `/saved/checklists/${destinationId}`], ["get", "/notifications"], ["patch", "/notifications/read-all"], ["patch", `/notifications/${destinationId}/read`], ["get", "/users/me/settings"], ["patch", "/users/me/settings"], ["post", "/feedback"],
  ] as const)("%s %s rejects anonymous and invalid credentials", async (method, path) => {
    expect((await request(app)[method]("/api" + path)).status).toBe(401);
    expect((await request(app)[method]("/api" + path).auth("invalid", { type: "bearer" })).status).toBe(401);
  });
});

describe("personal trips", () => {
  it("requires authentication", async () => {
    expect((await request(app).get("/api/trips")).status).toBe(401);
  });
  it("starts empty, persists a trip with real notification, returns nested items", async () => {
    expect((await call("get", "/trips")).body).toEqual({ success: true, data: [] });
    const res = await call("post", "/trips", tripBody);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ ...tripBody, status: "aktif", budget: null, notes: null, items: [] });
    expect(res.body.data).not.toHaveProperty("userId");
    expect((await call("get", "/trips")).body.data).toEqual([res.body.data]);
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0]).toMatchObject({ userId: ownerId, kind: "rencana", read: false });
  });
  it("keeps detail, update, delete owner-scoped even for admins", async () => {
    const trip = await createTrip();
    for (const token of [otherToken, adminToken]) {
      for (const method of ["get", "patch", "delete"] as const) {
        expect((await call(method, `/trips/${trip.id}`, method === "patch" ? { name: "Stolen" } : undefined, token)).status).toBe(404);
      }
      expect((await call("get", "/trips", undefined, token)).body.data).toEqual([]);
    }
    expect((await call("patch", `/trips/${trip.id}`, { status: "arsip", budget: 250000 })).body.data).toMatchObject({ status: "arsip", budget: 250000 });
    expect((await call("delete", `/trips/${trip.id}`)).body).toEqual({ success: true, data: null });
    expect((await call("get", `/trips/${trip.id}`)).status).toBe(404);
  });
  it.each([
    { startDate: "2026-02-30" }, { startDate: "2026-13-01" }, { endDate: "2026-11-30" },
    { peopleCount: 101 }, { budget: -1 }, { budget: 1.5 }, { userId: otherId }, { status: "arsip" },
  ])("rejects invalid trip input %j", async (patch) => {
    expect((await call("post", "/trips", { ...tripBody, ...patch })).status).toBe(422);
    expect(state.trips).toEqual([]);
  });
  it("validates partial updates against persisted date range", async () => {
    const trip = await createTrip();
    expect((await call("patch", `/trips/${trip.id}`, { startDate: "2026-12-04" })).status).toBe(400);
    expect((await call("patch", `/trips/${trip.id}`, {})).status).toBe(422);
    expect((await call("patch", `/trips/${trip.id}`, { userId: otherId })).status).toBe(422);
  });
  it("caps trips and rolls back the trip if notification creation fails", async () => {
    state.trips = Array.from({ length: 500 }, (_, i) => ({ id: String(i), userId: ownerId }));
    expect((await call("post", "/trips", tripBody)).status).toBe(409);
    resetMemory();
    const spy = vi.spyOn(memory, "insertNotification").mockRejectedValueOnce(new Error("test write failure"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await call("post", "/trips", tripBody)).status).toBe(500);
    expect(state.trips).toEqual([]);
    spy.mockRestore(); log.mockRestore();
  });
});

describe("trip items", () => {
  const itemBody = { destinationId, date: "2026-12-02", supportIds: [supportId] };
  it("creates and edits an item; detail and list include the contracted projection", async () => {
    const trip = await createTrip();
    const response = await call("post", `/trips/${trip.id}/items`, itemBody);
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ ...itemBody, tripId: trip.id, order: 0, destinationName: "Gunung Uji", destinationMeta: "Bandung, Jawa Barat", difficulty: "menengah", notes: null, entryFee: 15000 });
    expect(response.body.data).not.toHaveProperty("userId");
    const item = response.body.data;
    expect((await call("patch", `/trips/${trip.id}/items/${item.id}`, { notes: "Bawa air", date: "2026-12-03" })).body.data).toMatchObject({ notes: "Bawa air", date: "2026-12-03" });
    expect((await call("get", `/trips/${trip.id}`)).body.data.items).toHaveLength(1);
    expect((await call("get", "/trips")).body.data[0].items).toHaveLength(1);
    expect((await call("patch", `/trips/${trip.id}`, { endDate: "2026-12-01" })).status).toBe(400);
    expect((await call("delete", `/trips/${trip.id}/items/${item.id}`)).body).toEqual({ success: true, data: null });
  });
  it("rejects cross-owner trip/item references, including mismatched trip IDs", async () => {
    const trip = await createTrip();
    const item = (await call("post", `/trips/${trip.id}/items`, itemBody)).body.data;
    expect((await call("post", `/trips/${trip.id}/items`, itemBody, otherToken)).status).toBe(404);
    for (const method of ["patch", "delete"] as const) expect((await call(method, `/trips/${trip.id}/items/${item.id}`, method === "patch" ? { notes: "stolen" } : undefined, otherToken)).status).toBe(404);
    const second = await createTrip();
    expect((await call("patch", `/trips/${second.id}/items/${item.id}`, { notes: "wrong trip" })).status).toBe(404);
    expect((await call("delete", `/trips/${second.id}/items/${item.id}`)).status).toBe(404);
    expect(state.items).toHaveLength(1);
  });
  it.each([
    [{ date: "2026-02-30" }, 422], [{ date: "2026-12-04" }, 400], [{ date: "2026-11-30" }, 400],
    [{ destinationId: draftId }, 404], [{ supportIds: [otherId] }, 400], [{ destinationId: "broken" }, 422], [{ order: 200 }, 422],
  ])("rejects invalid/foreign item references %j", async (patch, status) => {
    const trip = await createTrip();
    expect((await call("post", `/trips/${trip.id}/items`, { ...itemBody, ...patch })).status).toBe(status);
    expect(state.items).toEqual([]);
  });
  it("revalidates relations on PATCH and caps at 100 items", async () => {
    const trip = await createTrip();
    const item = (await call("post", `/trips/${trip.id}/items`, itemBody)).body.data;
    expect((await call("patch", `/trips/${trip.id}/items/${item.id}`, { supportIds: [otherId] })).status).toBe(400);
    expect((await call("patch", `/trips/${trip.id}/items/${item.id}`, { destinationId: draftId })).status).toBe(404);
    const base = state.items[0];
    state.items = Array.from({ length: 100 }, (_, order) => ({ ...base, id: String(order), order }));
    expect((await call("post", `/trips/${trip.id}/items`, itemBody)).status).toBe(409);
    expect(state.items).toHaveLength(100);
  });
});

describe("personal checklists", () => {
  const input = { name: "Air minum", category: "perlengkapan", isRequired: true };
  it("begins empty, persists owned items, computes saved checklist progress", async () => {
    expect((await call("get", `/destinations/${destinationId}/checklist`)).body.data).toEqual([]);
    const created = await call("post", `/checklists/${destinationId}/items`, input);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ ...input, destinationId, isCompleted: false, note: null });
    expect(created.body.data).not.toHaveProperty("userId");
    const id = created.body.data.id;
    expect((await call("get", `/destinations/${destinationId}/checklist`)).body.data).toHaveLength(1);
    expect((await call("get", "/saved/checklists")).body.data).toEqual([expect.objectContaining({ id: destinationId, destinationName: "Gunung Uji", completedCount: 0, totalCount: 1, finished: false })]);
    expect((await call("patch", `/checklists/${destinationId}/items/${id}`, { isCompleted: true, note: "2 liter" })).body.data).toMatchObject({ isCompleted: true, note: "2 liter" });
    expect((await call("get", "/saved/checklists")).body.data[0]).toMatchObject({ completedCount: 1, totalCount: 1, finished: true });
    expect((await call("delete", `/checklists/${destinationId}/items/${id}`)).body.data).toBeNull();
    expect((await call("get", "/saved/checklists")).body.data).toEqual([]);
  });
  it("isolates read/update/delete and saved-checklist delete by owner", async () => {
    const item = (await call("post", `/checklists/${destinationId}/items`, input)).body.data;
    expect((await call("get", `/destinations/${destinationId}/checklist`, undefined, otherToken)).body.data).toEqual([]);
    expect((await call("get", "/saved/checklists", undefined, otherToken)).body.data).toEqual([]);
    for (const method of ["patch", "delete"] as const) expect((await call(method, `/checklists/${destinationId}/items/${item.id}`, method === "patch" ? { isCompleted: true } : undefined, otherToken)).status).toBe(404);
    expect((await call("delete", `/saved/checklists/${destinationId}`, undefined, otherToken)).status).toBe(200);
    expect(state.checklists).toHaveLength(1);
    expect((await call("delete", `/saved/checklists/${destinationId}`)).body).toEqual({ success: true, data: null });
    expect(state.checklists).toEqual([]);
  });
  it("rejects draft destinations, cross-destination IDs, invalid category/completion", async () => {
    expect((await call("get", `/destinations/${draftId}/checklist`)).status).toBe(404);
    expect((await call("post", `/checklists/${draftId}/items`, input)).status).toBe(404);
    expect((await call("post", `/checklists/${destinationId}/items`, { ...input, category: "bogus" })).status).toBe(422);
    expect((await call("post", `/checklists/${destinationId}/items`, { ...input, isCompleted: true })).status).toBe(422);
    const item = (await call("post", `/checklists/${destinationId}/items`, input)).body.data;
    expect((await call("patch", `/checklists/${draftId}/items/${item.id}`, { isCompleted: true })).status).toBe(404);
    expect((await call("patch", `/checklists/${destinationId}/items/${item.id}`, { isCompleted: "true" })).status).toBe(422);
  });
  it("limits checklist collections to 500 total items per owner", async () => {
    state.checklists = Array.from({ length: 500 }, (_, i) => ({ id: String(i), userId: ownerId, destinationId }));
    expect((await call("post", `/checklists/${destinationId}/items`, input)).status).toBe(409);
  });
});

describe("saved destinations and plans", () => {
  it("saves idempotently, returns public destination shape, deletes idempotently", async () => {
    expect((await call("get", "/saved/destinations")).body.data).toEqual([]);
    const saved = await call("post", "/saved/destinations", { destinationId });
    expect(saved.status).toBe(201);
    expect(saved.body.data.destination).toMatchObject({ id: destinationId, slug: "gunung-uji", terrain: [], activities: [], location: { latitude: -6.9 }, access: { transport: [] } });
    expect((await call("post", "/saved/destinations", { destinationId })).body.data).toEqual(saved.body.data);
    expect(state.saved).toHaveLength(1);
    expect((await call("get", "/saved/destinations")).body.data).toEqual([saved.body.data]);
    expect((await call("get", "/saved/destinations", undefined, otherToken)).body.data).toEqual([]);
    expect((await call("delete", `/saved/destinations/${destinationId}`, undefined, otherToken)).body.data).toBeNull();
    expect(state.saved).toHaveLength(1);
    for (let i = 0; i < 2; i++) expect((await call("delete", `/saved/destinations/${destinationId}`)).body).toEqual({ success: true, data: null });
  });
  it("rejects draft/invalid destination saves, caps collection without breaking idempotency", async () => {
    expect((await call("post", "/saved/destinations", { destinationId: draftId })).status).toBe(404);
    expect((await call("post", "/saved/destinations", { destinationId: "bad" })).status).toBe(422);
    const saved = (await call("post", "/saved/destinations", { destinationId })).body.data;
    state.saved.push(...Array.from({ length: 499 }, (_, i) => ({ userId: ownerId, destinationId: String(i) })));
    expect((await call("post", "/saved/destinations", { destinationId })).body.data).toEqual(saved);
    state.saved = state.saved.filter((row) => row.destinationId !== destinationId);
    state.saved.push({ userId: ownerId, destinationId: "another" });
    expect((await call("post", "/saved/destinations", { destinationId })).status).toBe(409);
  });
  it("uses the same trip records for plan archive/delete with owner scope", async () => {
    const trip = await createTrip();
    await call("post", `/trips/${trip.id}/items`, { destinationId, date: "2026-12-01" });
    expect((await call("get", "/saved/plans")).body.data).toEqual([expect.objectContaining({ id: trip.id, name: trip.name, startDate: trip.startDate, endDate: trip.endDate, destinationCount: 1, destinationTotal: 1, status: "aktif" })]);
    expect((await call("patch", `/saved/plans/${trip.id}`, { status: "arsip" }, otherToken)).status).toBe(404);
    expect((await call("delete", `/saved/plans/${trip.id}`, undefined, otherToken)).status).toBe(404);
    expect((await call("patch", `/saved/plans/${trip.id}`, { status: "arsip" })).status).toBe(200);
    expect((await call("get", `/trips/${trip.id}`)).body.data.status).toBe("arsip");
    expect((await call("patch", `/saved/plans/${trip.id}`, { name: "not a status" })).status).toBe(422);
    expect((await call("delete", `/saved/plans/${trip.id}`)).body.data).toBeNull();
    expect((await call("get", "/trips")).body.data).toEqual([]);
  });
});

describe("notifications and settings", () => {
  it("lists real notifications only, reads owned items and read-all", async () => {
    expect((await call("get", "/notifications")).body).toEqual({ success: true, data: [] });
    await createTrip();
    await call("post", "/trips", tripBody, otherToken);
    const rows = (await call("get", "/notifications")).body.data;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: "rencana", read: false, title: "Rencana perjalanan dibuat" });
    expect(rows[0]).not.toHaveProperty("userId");
    expect((await call("patch", `/notifications/${rows[0].id}/read`, { read: true }, otherToken)).status).toBe(404);
    expect((await call("patch", `/notifications/${rows[0].id}/read`, { read: false })).status).toBe(422);
    expect((await call("patch", `/notifications/${rows[0].id}/read`, { read: true })).body.data.read).toBe(true);
    expect((await call("patch", `/notifications/${rows[0].id}/read`, {})).body.data.read).toBe(true);
    await createTrip();
    expect((await call("patch", "/notifications/read-all", {})).body).toEqual({ success: true, data: null });
    expect((await call("get", "/notifications")).body.data.every((row: any) => row.read)).toBe(true);
    expect((await call("get", "/notifications", undefined, otherToken)).body.data[0].read).toBe(false);
  });
  it("persists correct defaults without exposing fictional 2FA or user identifiers", async () => {
    const defaults = { theme: "terang", language: "id", dataSaver: false,
      notifications: { rekomendasi: true, pengingatRencana: true, pengingatChecklist: true, fasilitasBaru: false, promo: false },
      privacy: { profilPublik: true, bagikanAktivitas: true, analitik: false } };
    expect((await call("get", "/users/me/settings")).body).toEqual({ success: true, data: defaults });
    const changed = await call("patch", "/users/me/settings", { theme: "gelap", notifications: { promo: true }, privacy: { profilPublik: false } });
    expect(changed.status).toBe(200);
    expect(changed.body.data).toEqual({ ...defaults, theme: "gelap", notifications: { ...defaults.notifications, promo: true }, privacy: { ...defaults.privacy, profilPublik: false } });
    expect((await call("get", "/users/me/settings")).body.data).toEqual(changed.body.data);
    expect(state.settings.find((row) => row.userId === ownerId)).toBeDefined();
    expect((await call("get", "/users/me/settings", undefined, otherToken)).body.data).toEqual(defaults);
    expect((await call("patch", "/users/me/settings", { language: "en", dataSaver: true })).body.data.notifications.promo).toBe(true);
  });
  it.each([{ privacy: { twoFactor: true } }, { userId: otherId }, { theme: "dark" }, { dataSaver: "true" }, { notifications: { promo: 1 } }, {}])("rejects unsafe settings patches %j", async (body) => {
    expect((await call("patch", "/users/me/settings", body)).status).toBe(422);
  });
});

describe("FAQ and feedback", () => {
  const faq = { category: "perjalanan", question: "Apa yang perlu disiapkan?", answer: "Sesuaikan perlengkapan dengan kondisi destinasi." };
  const feedback = { category: "saran", subject: "Tambahkan filter", message: "Mohon tambahkan filter perlengkapan perjalanan.", rating: 0 };
  it("serves empty public FAQ and admin CRUD with paginated metadata", async () => {
    expect((await request(app).get("/api/faqs")).body).toEqual({ success: true, data: [] });
    const res = await call("post", "/admin/faqs", faq, adminToken);
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ id: expect.any(String), ...faq });
    const id = res.body.data.id;
    expect((await request(app).get("/api/faqs")).body.data).toEqual([res.body.data]);
    expect((await call("get", "/admin/faqs?page=1&limit=1&search=disiapkan", undefined, adminToken)).body).toMatchObject({ data: [res.body.data], meta: { page: 1, limit: 1, total: 1, totalPages: 1, hasNext: false, hasPrev: false } });
    expect((await call("get", `/admin/faqs/${id}`, undefined, adminToken)).body.data).toEqual(res.body.data);
    expect((await call("patch", `/admin/faqs/${id}`, { answer: "Bawa air minum yang cukup." }, adminToken)).body.data.answer).toBe("Bawa air minum yang cukup.");
    expect((await call("delete", `/admin/faqs/${id}`, undefined, adminToken)).body).toEqual({ success: true, data: null });
    expect((await call("patch", `/admin/faqs/${id}`, { answer: "Tidak ditemukan" }, adminToken)).status).toBe(404);
    expect((await call("delete", `/admin/faqs/${id}`, undefined, adminToken)).status).toBe(404);
  });
  it("requires admin on every administrative FAQ/feedback route", async () => {
    for (const [method, path] of [["get", "/admin/faqs"], ["post", "/admin/faqs"], ["patch", `/admin/faqs/${destinationId}`], ["delete", `/admin/faqs/${destinationId}`], ["get", "/admin/feedback"]] as const) {
      expect((await request(app)[method]("/api" + path)).status).toBe(401);
      expect((await call(method, path, undefined, ownerToken)).status).toBe(403);
    }
  });
  it("stores authenticated feedback with server-derived owner; only admin can list", async () => {
    expect((await request(app).post("/api/feedback").send(feedback)).status).toBe(401);
    const res = await call("post", "/feedback", feedback);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ ...feedback, userId: ownerId });
    const list = await call("get", "/admin/feedback?search=filter&page=1&limit=20", undefined, adminToken);
    expect(list.body).toMatchObject({ data: [res.body.data], meta: { total: 1, page: 1, limit: 20 } });
    expect((await call("get", "/admin/feedback", undefined, ownerToken)).status).toBe(403);
    expect((await call("get", "/feedback")).status).toBe(404);
  });
  it.each([{ subject: "ab" }, { message: "short" }, { rating: 6 }, { rating: -1 }, { rating: 1.5 }, { category: "bad" }, { subject: "x".repeat(161) }, { message: "x".repeat(5001) }, { userId: otherId }])("rejects invalid feedback %j", async (patch) => {
    expect((await call("post", "/feedback", { ...feedback, ...patch })).status).toBe(422);
    expect(state.feedback).toEqual([]);
  });
  it("validates FAQ writes and admin pagination", async () => {
    expect((await call("post", "/admin/faqs", { ...faq, category: "bad" }, adminToken)).status).toBe(422);
    expect((await call("post", "/admin/faqs", { ...faq, answer: " " }, adminToken)).status).toBe(422);
    expect((await call("get", "/admin/faqs?limit=101", undefined, adminToken)).status).toBe(422);
    expect((await call("get", "/admin/feedback?page=0", undefined, adminToken)).status).toBe(422);
  });
});

