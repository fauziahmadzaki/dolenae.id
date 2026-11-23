import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/db/DatabaseClient", () => ({
  database: {
    getDb: vi.fn(),
    getPool: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createApp } from "../../src/app";
import { statsRepository } from "../../src/repositories/StatsRepository";
import { signAccessToken } from "../../src/utils/jwt";

const app = createApp();

const currentMonth = (() => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
})();

function mockOverviewData() {
  vi.spyOn(statsRepository, "countDestinations").mockResolvedValue({
    total: 23,
    published: 21,
    draft: 2,
    archived: 0,
  });
  vi.spyOn(statsRepository, "countFacilities").mockResolvedValue({
    total: 59,
    published: 50,
    pending: 6,
    draft: 3,
  });
  vi.spyOn(statsRepository, "countUsersByRole").mockResolvedValue([
    { role: "wisatawan", value: 3 },
    { role: "merchant", value: 1 },
    { role: "admin", value: 1 },
  ]);
  vi.spyOn(statsRepository, "countUsersCreatedSince").mockResolvedValue([
    { role: "wisatawan", value: 2 },
    { role: "merchant", value: 1 },
  ]);
  vi.spyOn(statsRepository, "countUsersBefore").mockResolvedValue(0);
  vi.spyOn(statsRepository, "listUserGrowth").mockResolvedValue([
    { month: currentMonth, value: 3 },
  ]);
  vi.spyOn(
    statsRepository,
    "listCategoryDistribution",
  ).mockResolvedValue([
    { id: "cat-1", name: "Gunung", slug: "gunung", value: 10 },
    { id: "cat-2", name: "Pantai", slug: "pantai", value: 3 },
    { id: "cat-3", name: "Kosong", slug: "kosong", value: 0 },
  ]);
  vi.spyOn(
    statsRepository,
    "listPopularDestinations",
  ).mockResolvedValue([
    {
      id: "dest-1",
      name: "Danau Kelimutu",
      province: "Nusa Tenggara Timur",
      regency: "Ende",
      images: ["https://example.com/kelimutu.jpg"],
      planCount: 3,
    },
  ]);
  vi.spyOn(
    statsRepository,
    "listRecentDestinations",
  ).mockResolvedValue([
    {
      id: "dest-2",
      name: "Goa Pindul",
      province: "DI Yogyakarta",
      regency: "Gunungkidul",
      images: [],
      createdAt: new Date("2026-11-17T10:00:00Z"),
    },
  ]);
}

describe("Admin dashboard stats API (/api/admin/stats)", () => {
  let adminToken: string;
  let touristToken: string;

  beforeAll(async () => {
    adminToken = await signAccessToken({
      sub: "87654321-4321-4321-a321-1234567890ab",
      email: "admin@dolenae.id",
      role: "admin",
    });
    touristToken = await signAccessToken({
      sub: "12345678-1234-4234-a234-1234567890ab",
      email: "wisatawan@dolenae.id",
      role: "wisatawan",
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects anonymous requests", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects non-admin roles", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .auth(touristToken, { type: "bearer" });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("returns totals, growth, categories, and destinations", async () => {
    mockOverviewData();

    const res = await request(app)
      .get("/api/admin/stats?months=6")
      .auth(adminToken, { type: "bearer" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.totals.destinations).toEqual({
      total: 23,
      published: 21,
      draft: 2,
      archived: 0,
    });
    expect(data.totals.facilities).toEqual({
      total: 59,
      published: 50,
      pending: 6,
      draft: 3,
    });
    expect(data.totals.users).toEqual({
      total: 5,
      wisatawan: 3,
      merchant: 1,
      admin: 1,
      newThisMonth: 3,
    });
    expect(data.totals.merchants).toEqual({ total: 1, newThisMonth: 1 });

    expect(data.userGrowth).toHaveLength(6);
    expect(data.userGrowth.at(-1)).toMatchObject({
      month: currentMonth,
      newUsers: 3,
      totalUsers: 3,
    });

    expect(data.categoryDistribution).toEqual([
      { id: "cat-1", name: "Gunung", slug: "gunung", count: 10 },
      { id: "cat-2", name: "Pantai", slug: "pantai", count: 3 },
    ]);

    expect(data.popularDestinations[0]).toMatchObject({
      name: "Danau Kelimutu",
      planCount: 3,
      image: "https://example.com/kelimutu.jpg",
    });
    expect(data.recentDestinations[0]).toMatchObject({
      name: "Goa Pindul",
      image: null,
      createdAt: "2026-11-17T10:00:00.000Z",
    });
  });

  it("rejects out-of-range month windows", async () => {
    const res = await request(app)
      .get("/api/admin/stats?months=1")
      .auth(adminToken, { type: "bearer" });
    expect(res.status).toBe(422);
  });
});
