import request from "supertest";
import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, expect, it, vi } from "vitest";

vi.mock("../../src/db/client", () => ({
  pingDatabase: vi.fn().mockResolvedValue(true),
  closeDatabase: vi.fn(), getDb: vi.fn(), getPool: vi.fn(),
}));

import { createApp } from "../../src/app";
import { getDb } from "../../src/db/client";

import { supportRepository } from "../../src/repositories/support.repository";
import { signAccessToken } from "../../src/utils/jwt";

const supportId = "33333333-3333-4333-a333-333333333333";
const app = createApp();
const destinationId = "22222222-2222-4222-a222-222222222222";

beforeEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); });

const row = {
  id: supportId, destinationId, name: "Jeep Bromo", category: "transport" as const,
  description: null, locationLabel: null, capacity: "6 orang", distanceLabel: null,
  priceLabel: null, priceUnit: null, contactPhone: null, contactWhatsapp: null,
  contactInstagram: null, imageUrl: null, facilities: [], routes: ["Basecamp"], cuisine: [],
  includesDriver: true, verified: false, relatedDestinationName: "Bromo",
  createdAt: new Date("2026-10-10T00:00:00Z"), updatedAt: new Date("2026-10-10T00:00:00Z"),
};

it("returns support detail with joined destination name and ISO timestamps", async () => {
  const detail = { from: vi.fn().mockReturnThis(), innerJoin: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue([row]) };
  vi.mocked(getDb).mockReturnValue({ select: vi.fn().mockReturnValue(detail) } as unknown as ReturnType<typeof getDb>);
  const res = await request(app).get(`/api/supports/${supportId}`);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ success: true, data: { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() } });
});

it.each(["/api/supports/not-a-uuid", "/api/destinations/not-a-uuid/supports"])("rejects invalid UUID with 400: %s", async (path) => {
  const res = await request(app).get(path);
  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe("BAD_REQUEST");
  expect(getDb).not.toHaveBeenCalled();
});

it.each(["missing", "draft", "archived"])("hides %s destination/support from anonymous and admin", async (status) => {
  const adminToken = await signAccessToken({ sub: destinationId, email: "admin@dolenae.id", role: "admin" });
  let requestedStatus: unknown;
  const query = {
    from: vi.fn().mockReturnThis(), innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockImplementation((filter) => {
      requestedStatus = new PgDialect().sqlToQuery(filter).params[1];
      return query;
    }),
    limit: vi.fn().mockImplementation(async () => status !== "missing" && (!requestedStatus || requestedStatus === status) ? [row] : []),
  };
  vi.mocked(getDb).mockReturnValue({ select: vi.fn().mockReturnValue(query) } as unknown as ReturnType<typeof getDb>);
  for (const token of [undefined, adminToken]) {
    for (const path of [`/api/supports/${supportId}`, `/api/destinations/${destinationId}/supports`]) {
      const req = request(app).get(path);
      if (token) req.auth(token, { type: "bearer" });
      const res = await req;
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
      expect(res.body.data).toBeUndefined();
    }
  }
});

it("paginates populated results without changing fixed ordering", async () => {
  vi.spyOn(supportRepository, "hasPublishedDestination").mockResolvedValue(true);
  const list = vi.spyOn(supportRepository, "list").mockResolvedValue({ items: [row], total: 3 });
  const res = await request(app).get(`/api/destinations/${destinationId}/supports?page=2&limit=1&sort=name&order=desc`);
  expect(res.status).toBe(200);
  expect(res.body.data).toEqual([{ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() }]);
  expect(res.body.meta).toEqual({ page: 2, limit: 1, total: 3, totalPages: 3, hasNext: true, hasPrev: true });
  expect(list).toHaveBeenCalledWith(destinationId, { page: 2, limit: 1, offset: 1, order: "asc" });
});

it.each(["page=0", "page=1.5", "limit=101", "limit=-1", "limit=bad"])("rejects invalid pagination %s", async (query) => {
  const res = await request(app).get(`/api/destinations/${destinationId}/supports?${query}`);
  expect(res.status).toBe(422);
  expect(getDb).not.toHaveBeenCalled();
});

it("returns successful empty paginated supports for a published destination", async () => {
  const destination = { from: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue([{ id: destinationId }]) };
  const list = { from: vi.fn().mockReturnThis(), innerJoin: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), orderBy: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), offset: vi.fn().mockResolvedValue([]) };
  const total = { from: vi.fn().mockReturnThis(), innerJoin: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([{ value: 0 }]) };
  vi.mocked(getDb).mockReturnValue({ select: vi.fn().mockReturnValueOnce(destination).mockReturnValueOnce(list).mockReturnValueOnce(total) } as unknown as ReturnType<typeof getDb>);
  const res = await request(app).get(`/api/destinations/${destinationId}/supports`);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false } });
});
