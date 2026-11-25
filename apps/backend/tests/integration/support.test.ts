import request from "supertest";
import { beforeEach, expect, it, vi } from "vitest";

vi.mock("../../src/db/DatabaseClient", () => ({
  database: {
    getDb: vi.fn(),
    getPool: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../src/repositories/FacilityRepository", () => ({
  facilityRepository: {
    findById: vi.fn(),
    list: vi.fn(),
  },
}));

import { createApp } from "../../src/app";
import { facilityRepository } from "../../src/repositories/FacilityRepository";
import { signAccessToken } from "../../src/utils/jwt";

const facilityId = "33333333-3333-4333-a333-333333333333";
const destinationId = "22222222-2222-4222-a222-222222222222";
const app = createApp();

const row = {
  id: facilityId,
  destinationId,
  ownerId: null,
  name: "Jeep Bromo",
  category: "transport" as const,
  type: "jeep",
  latitude: "-7.9425000",
  longitude: "112.9530000",
  priceMin: 650000,
  priceMax: 650000,
  description: null,
  contact: "081234567890",
  contactEmail: null,
  website: null,
  bannerUrl: null,
  status: "published" as const,
  createdAt: new Date("2026-10-10T00:00:00Z"),
  updatedAt: new Date("2026-10-10T00:00:00Z"),
  destinationName: "Bromo",
};

const legacy = {
  id: facilityId,
  destinationId,
  name: "Jeep Bromo",
  category: "transport",
  description: null,
  locationLabel: null,
  capacity: null,
  distanceLabel: null,
  priceLabel: "Rp 650.000",
  priceUnit: null,
  priceMin: 650000,
  priceMax: 650000,
  contactPhone: "081234567890",
  contactWhatsapp: null,
  contactInstagram: null,
  imageUrl: null,
  facilities: [],
  routes: [],
  cuisine: [],
  includesDriver: false,
  verified: true,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  relatedDestinationName: "Bromo",
};

beforeEach(() => {
  vi.clearAllMocks();
});

it("returns legacy support detail with ISO timestamps", async () => {
  vi.mocked(facilityRepository.findById).mockResolvedValue(row);

  const res = await request(app).get(`/api/supports/${facilityId}`);

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ success: true, data: legacy });
});

it.each([
  "/api/supports/not-a-uuid",
  "/api/destinations/not-a-uuid/supports",
])("rejects invalid UUID with 400: %s", async (path) => {
  const res = await request(app).get(path);
  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe("BAD_REQUEST");
  expect(facilityRepository.findById).not.toHaveBeenCalled();
});

it.each(["draft", "pending", "rejected", "archived"])(
  "hides %s facility from anonymous and admin",
  async (status) => {
    vi.mocked(facilityRepository.findById).mockResolvedValue({
      ...row,
      status: status as typeof row.status,
    });
    const adminToken = await signAccessToken({
      sub: destinationId,
      email: "admin@dolenae.id",
      role: "admin",
    });

    for (const token of [undefined, adminToken]) {
      const req = request(app).get(`/api/supports/${facilityId}`);
      if (token) req.auth(token, { type: "bearer" });
      const res = await req;
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    }
  },
);

it("paginates legacy supports and keeps the fixed ordering", async () => {
  vi.mocked(facilityRepository.list).mockResolvedValue({
    items: [row],
    total: 3,
  });

  const res = await request(app).get(
    `/api/destinations/${destinationId}/supports?page=2&limit=1`,
  );

  expect(res.status).toBe(200);
  expect(res.body.data).toEqual([legacy]);
  expect(res.body.meta).toEqual({
    page: 2,
    limit: 1,
    total: 3,
    totalPages: 3,
    hasNext: true,
    hasPrev: true,
  });
  expect(facilityRepository.list).toHaveBeenCalledWith({
    destinationId,
    statuses: ["published"],
    publishedDestinationOnly: true,
    page: 2,
    limit: 1,
    offset: 1,
    order: "asc",
  });
});

it.each(["page=0", "page=1.5", "limit=101", "limit=-1", "limit=bad"])(
  "rejects invalid pagination %s",
  async (query) => {
    const res = await request(app).get(
      `/api/destinations/${destinationId}/supports?${query}`,
    );
    expect(res.status).toBe(422);
    expect(facilityRepository.list).not.toHaveBeenCalled();
  },
);

it("returns an empty page for a destination without facilities", async () => {
  vi.mocked(facilityRepository.list).mockResolvedValue({ items: [], total: 0 });

  const res = await request(app).get(
    `/api/destinations/${destinationId}/supports`,
  );

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    success: true,
    data: [],
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  });
});
