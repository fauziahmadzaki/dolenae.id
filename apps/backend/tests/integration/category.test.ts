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
import { signAccessToken } from "../../src/utils/jwt";

describe("Category CRUD API (/api/categories)", () => {
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

  const mockCategory = {
    id: "11111111-1111-4111-a111-111111111111",
    name: "Gunung",
    slug: "gunung",
    type: "terrain" as const,
    icon: "lucide:mountain",
    description: null,
    createdAt: new Date("2026-10-10T00:00:00Z"),
    updatedAt: new Date("2026-10-10T00:00:00Z"),
  };

  describe("GET /api/categories", () => {
    it("returns a paginated public list", async () => {
      vi.spyOn(categoryRepository, "list").mockResolvedValueOnce({
        items: [mockCategory],
        total: 1,
      });

      const res = await request(app).get("/api/categories?page=1&limit=10");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0]).toMatchObject({
        id: mockCategory.id,
        name: "Gunung",
        slug: "gunung",
        type: "terrain",
      });
      expect(res.body.meta).toMatchObject({ page: 1, limit: 10, total: 1 });
    });

    it("filters by type and rejects an invalid type", async () => {
      const list = vi
        .spyOn(categoryRepository, "list")
        .mockResolvedValueOnce({ items: [], total: 0 });

      const res = await request(app).get("/api/categories?type=activity");
      expect(res.status).toBe(200);
      expect(list).toHaveBeenCalledWith(expect.objectContaining({ type: "activity" }));

      const invalid = await request(app).get("/api/categories?type=wrong");
      expect(invalid.status).toBe(422);
      expect(invalid.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/categories", () => {
    it("requires authentication", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({ name: "Gunung", type: "terrain" });
      expect(res.status).toBe(401);
    });

    it("forbids non-admin roles", async () => {
      const res = await request(app)
        .post("/api/categories")
        .auth(userToken, { type: "bearer" })
        .send({ name: "Gunung", type: "terrain" });
      expect(res.status).toBe(403);
    });

    it("creates a category and generates the slug", async () => {
      vi.spyOn(categoryRepository, "slugExists").mockResolvedValueOnce(false);
      vi.spyOn(categoryRepository, "create").mockResolvedValueOnce(mockCategory);

      const res = await request(app)
        .post("/api/categories")
        .auth(adminToken, { type: "bearer" })
        .send({ name: "Gunung", type: "terrain", icon: "lucide:mountain" });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ slug: "gunung", type: "terrain" });
      expect(categoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: "gunung", name: "Gunung" }),
      );
    });

    it("returns 409 when the slug is already used", async () => {
      vi.spyOn(categoryRepository, "slugExists").mockResolvedValueOnce(true);

      const res = await request(app)
        .post("/api/categories")
        .auth(adminToken, { type: "bearer" })
        .send({ name: "Gunung", type: "terrain" });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("returns 422 for invalid input", async () => {
      const res = await request(app)
        .post("/api/categories")
        .auth(adminToken, { type: "bearer" })
        .send({ name: "G", type: "nope" });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PATCH /api/categories/:id", () => {
    it("updates a category", async () => {
      vi.spyOn(categoryRepository, "findById").mockResolvedValueOnce(mockCategory);
      vi.spyOn(categoryRepository, "slugExists").mockResolvedValueOnce(false);
      vi.spyOn(categoryRepository, "update").mockResolvedValueOnce({
        ...mockCategory,
        name: "Pegunungan",
        slug: "pegunungan",
      });

      const res = await request(app)
        .patch(`/api/categories/${mockCategory.id}`)
        .auth(adminToken, { type: "bearer" })
        .send({ name: "Pegunungan" });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ name: "Pegunungan", slug: "pegunungan" });
    });

    it("returns 404 for an unknown id", async () => {
      vi.spyOn(categoryRepository, "findById").mockResolvedValueOnce(undefined);

      const res = await request(app)
        .patch(`/api/categories/${mockCategory.id}`)
        .auth(adminToken, { type: "bearer" })
        .send({ name: "Pegunungan" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("deletes a category", async () => {
      vi.spyOn(categoryRepository, "findById").mockResolvedValueOnce(mockCategory);
      vi.spyOn(categoryRepository, "delete").mockResolvedValueOnce(true);

      const res = await request(app)
        .delete(`/api/categories/${mockCategory.id}`)
        .auth(adminToken, { type: "bearer" });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ id: mockCategory.id, deleted: true });
    });
  });
});
