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

vi.mock("../../src/repositories/FacilityProductRepository", () => ({
  facilityProductRepository: {
    listByOwner: vi.fn(),
  },
}));

import { createApp } from "../../src/app";
import { facilityProductRepository } from "../../src/repositories/FacilityProductRepository";
import { signAccessToken } from "../../src/utils/jwt";

const app = createApp();
const merchantId = "44444444-4444-4444-a444-444444444444";
const facilityId = "33333333-3333-4333-a333-333333333333";

const row = {
  id: "55555555-5555-4555-a555-555555555555",
  facilityId,
  name: "Kopi Bromo",
  description: null,
  bannerUrl: null,
  price: 15000,
  position: 0,
  isActive: true,
  createdAt: new Date("2026-11-14T00:00:00Z"),
  updatedAt: new Date("2026-11-14T00:00:00Z"),
  facilityName: "Warung Bromo",
  destinationName: "Gunung Bromo",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(facilityProductRepository.listByOwner).mockResolvedValue({
    items: [row],
    total: 1,
  });
});

it("requires authentication", async () => {
  const res = await request(app).get("/api/products/mine");
  expect(res.status).toBe(401);
});

it("lists products for the signed-in merchant only", async () => {
  const token = await signAccessToken({
    sub: merchantId,
    email: "merchant@dolenae.id",
    role: "merchant",
  });

  const res = await request(app)
    .get("/api/products/mine?page=1&limit=20")
    .auth(token, { type: "bearer" });

  expect(res.status).toBe(200);
  expect(res.body.data[0]).toMatchObject({
    name: "Kopi Bromo",
    facilityName: "Warung Bromo",
    destinationName: "Gunung Bromo",
    createdAt: row.createdAt.toISOString(),
  });
  expect(res.body.meta.total).toBe(1);
  expect(facilityProductRepository.listByOwner).toHaveBeenCalledWith(
    expect.objectContaining({ ownerId: merchantId, limit: 20, offset: 0 }),
  );
});

it("lets admins see products across facilities", async () => {
  const token = await signAccessToken({
    sub: merchantId,
    email: "admin@dolenae.id",
    role: "admin",
  });

  const res = await request(app)
    .get("/api/products/mine")
    .auth(token, { type: "bearer" });

  expect(res.status).toBe(200);
  expect(facilityProductRepository.listByOwner).toHaveBeenCalledWith(
    expect.objectContaining({ ownerId: undefined }),
  );
});
