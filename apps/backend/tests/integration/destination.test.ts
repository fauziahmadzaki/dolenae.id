import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/db/client", () => ({
  pingDatabase: vi.fn().mockResolvedValue(true),
  closeDatabase: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn(),
  getPool: vi.fn(),
}));

import { createApp } from "../../src/app";
import { categoryRepository } from "../../src/repositories/category.repository";
import { destinationRepository } from "../../src/repositories/destination.repository";
import { signAccessToken } from "../../src/utils/jwt";

describe("Destination CRUD API (/api/destinations)", () => {
  const app = createApp();
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    adminToken = await signAccessToken({
      sub: "87654321-4321-4321-a321-1234567890ab",
      email: "admin@dolenae.id",
      role: "admin",
    });
    userToken = await signAccessToken({
      sub: "12345678-1234-4234-a234-1234567890ab",
      email: "wisatawan@dolenae.id",
      role: "wisatawan",
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const categoryId = "11111111-1111-4111-a111-111111111111";
  const mockDestination = {
    id: "22222222-2222-4222-a222-222222222222",
    name: "Gunung Bromo",
    slug: "gunung-bromo",
    tagline: "Sunrise terbaik Jawa Timur",
    description: "Deskripsi Bromo.",
    difficulty: "menengah" as const,
    bestSeason: ["Apr-Okt"],
    tags: ["sunrise"],
    terrain: ["gunung"],
    activities: ["hiking"],
    province: "Jawa Timur",
    regency: "Probolinggo",
    district: "Sukapura",
    latitude: "-7.9425",
    longitude: "112.9530",
    accessPoint: "Cemoro Lawang",
    accessDescription: "Jalan aspal sampai basecamp.",
    accessTransport: ["Jeep", "Motor"],
    accessDuration: "4 jam",
    accessDistanceKm: "140.5",
    facilities: ["Toilet", "Warung"],
    entryFee: 29000,
    elevationMeters: 2329,
    images: ["https://cdn.dolenae.id/bromo.jpg"],
    guideRequired: false,
    status: "draft" as const,
    verified: false,
    createdAt: new Date("2026-10-10T00:00:00Z"),
    updatedAt: new Date("2026-10-10T00:00:00Z"),
  };

  const mockCategory = {
    id: categoryId,
    name: "Gunung",
    slug: "gunung",
    type: "terrain" as const,
    icon: "lucide:mountain",
    description: null,
    createdAt: new Date("2026-10-10T00:00:00Z"),
    updatedAt: new Date("2026-10-10T00:00:00Z"),
  };

  describe("GET /api/destinations", () => {
    it("returns a paginated public list with category links", async () => {
      vi.spyOn(destinationRepository, "list").mockResolvedValueOnce({
        items: [mockDestination],
        total: 1,
      });
      vi.spyOn(destinationRepository, "findCategoryLinks").mockResolvedValueOnce([
        { destinationId: mockDestination.id, categoryId },
      ]);

      const res = await request(app).get("/api/destinations?page=1&limit=10");
      expect(res.status).toBe(200);
      expect(res.body.data[0]).toMatchObject({
        id: mockDestination.id,
        slug: "gunung-bromo",
        categoryIds: [categoryId],
      });
      expect(res.body.data[0].location).toMatchObject({
        province: "Jawa Timur",
        latitude: -7.9425,
        longitude: 112.953,
      });
      expect(res.body.data[0].access.distanceKm).toBe(140.5);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 10, total: 1 });
    });

    it("passes filters to the repository", async () => {
      const list = vi
        .spyOn(destinationRepository, "list")
        .mockResolvedValueOnce({ items: [], total: 0 });
      vi.spyOn(destinationRepository, "findCategoryLinks").mockResolvedValueOnce([]);

      const res = await request(app).get(
        `/api/destinations?difficulty=menengah&status=published&categoryId=${categoryId}`,
      );
      expect(res.status).toBe(200);
      expect(list).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: "menengah",
          status: "published",
          categoryId,
        }),
      );
    });
  });

  describe("POST /api/destinations", () => {
    it("requires admin", async () => {
      const anon = await request(app)
        .post("/api/destinations")
        .send({ name: "Gunung Prau" });
      expect(anon.status).toBe(401);

      const asUser = await request(app)
        .post("/api/destinations")
        .auth(userToken, { type: "bearer" })
        .send({ name: "Gunung Prau" });
      expect(asUser.status).toBe(403);
    });

    it("creates a destination with nested location/access + category links", async () => {
      vi.spyOn(destinationRepository, "slugExists").mockResolvedValueOnce(false);
      vi.spyOn(destinationRepository, "create").mockResolvedValueOnce({
        ...mockDestination,
        status: "draft",
      });
      vi.spyOn(destinationRepository, "findById").mockResolvedValue({
        ...mockDestination,
        status: "published",
      });
      vi.spyOn(destinationRepository, "findCategoryIds").mockResolvedValue([
        categoryId,
      ]);
      vi.spyOn(categoryRepository, "findByIds").mockResolvedValue([mockCategory]);
      const replace = vi
        .spyOn(destinationRepository, "replaceCategories")
        .mockResolvedValueOnce(undefined);

      const res = await request(app)
        .post("/api/destinations")
        .auth(adminToken, { type: "bearer" })
        .send({
          name: "Gunung Prau",
          difficulty: "ramah-pemula",
          location: { province: "Jawa Tengah", latitude: -7.2, longitude: 109.9 },
          access: { transport: ["Jeep"], duration: "2 jam" },
          entryFee: 20000,
          status: "published",
          categoryIds: [categoryId],
        });

      expect(res.status).toBe(201);
      // Response is built from the mocked findById row; payload correctness
      // is asserted on the create/replace calls below.
      expect(res.body.data).toMatchObject({
        categoryIds: [categoryId],
        status: "published",
      });
      expect(replace).toHaveBeenCalledWith(mockDestination.id, [categoryId]);
      expect(destinationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: "gunung-prau",
          difficulty: "ramah-pemula",
          province: "Jawa Tengah",
          accessTransport: ["Jeep"],
        }),
      );
    });

    it("returns 400 when a category id does not exist", async () => {
      vi.spyOn(destinationRepository, "slugExists").mockResolvedValueOnce(false);
      vi.spyOn(categoryRepository, "findByIds").mockResolvedValueOnce([]);

      const res = await request(app)
        .post("/api/destinations")
        .auth(adminToken, { type: "bearer" })
        .send({ name: "Gunung Prau", categoryIds: [categoryId] });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("BAD_REQUEST");
    });

    it("returns 422 for invalid coordinates", async () => {
      const res = await request(app)
        .post("/api/destinations")
        .auth(adminToken, { type: "bearer" })
        .send({ name: "Gunung Prau", location: { latitude: 999 } });

      expect(res.status).toBe(422);
    });
  });

  describe("PATCH /api/destinations/:id", () => {
    it("updates fields and replaces category links when provided", async () => {
      vi.spyOn(destinationRepository, "findById").mockResolvedValue(
        mockDestination,
      );
      vi.spyOn(categoryRepository, "findByIds").mockResolvedValue([mockCategory]);
      vi.spyOn(destinationRepository, "update").mockResolvedValueOnce({
        ...mockDestination,
        status: "published",
      });
      vi.spyOn(destinationRepository, "findCategoryIds").mockResolvedValue([
        categoryId,
      ]);
      const replace = vi
        .spyOn(destinationRepository, "replaceCategories")
        .mockResolvedValueOnce(undefined);

      const res = await request(app)
        .patch(`/api/destinations/${mockDestination.id}`)
        .auth(adminToken, { type: "bearer" })
        .send({ status: "published", categoryIds: [categoryId] });

      expect(res.status).toBe(200);
      expect(destinationRepository.update).toHaveBeenCalledWith(
        mockDestination.id,
        expect.objectContaining({ status: "published" }),
      );
      expect(replace).toHaveBeenCalledWith(mockDestination.id, [categoryId]);
      expect(res.body.data.categoryIds).toEqual([categoryId]);
    });

    it("returns 404 for an unknown id", async () => {
      vi.spyOn(destinationRepository, "findById").mockResolvedValueOnce(undefined);

      const res = await request(app)
        .patch(`/api/destinations/${mockDestination.id}`)
        .auth(adminToken, { type: "bearer" })
        .send({ tagline: "Baru" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/destinations/:id", () => {
    it("deletes a destination", async () => {
      vi.spyOn(destinationRepository, "findById").mockResolvedValueOnce(
        mockDestination,
      );
      vi.spyOn(destinationRepository, "delete").mockResolvedValueOnce(true);

      const res = await request(app)
        .delete(`/api/destinations/${mockDestination.id}`)
        .auth(adminToken, { type: "bearer" });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ id: mockDestination.id, deleted: true });
    });
  });
});
