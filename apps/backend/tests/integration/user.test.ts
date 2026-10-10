import request from "supertest";
import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";

// Mock DB client to isolate HTTP & validation layer
vi.mock("../../src/db/client", () => ({
  pingDatabase: vi.fn().mockResolvedValue(true),
  closeDatabase: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn(),
  getPool: vi.fn(),
}));

import { signAccessToken } from "../../src/utils/jwt";
import { createApp } from "../../src/app";
import { userRepository } from "../../src/repositories/user.repository";

describe("User Management CRUD API (/api/users)", () => {
  const app = createApp();
  let token: string;
  beforeAll(async () => { token = await signAccessToken({ sub: "87654321-4321-4321-a321-1234567890ab", email: "admin@dolenae.id", role: "admin" }); });

  const mockUserRow = {
    id: "12345678-1234-4234-a234-1234567890ab",
    name: "Dimas Pratama",
    email: "dimas@dolenae.id",
    passwordHash: "scrypt$mock$hash",
    role: "wisatawan" as const,
    provider: "local" as const, googleId: null, avatarUrl: null, emailVerifiedAt: null, lastLoginAt: null,
    createdAt: new Date("2026-10-10T00:00:00Z"),
    updatedAt: new Date("2026-10-10T00:00:00Z"),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/users", () => {
    it("returns paginated users list", async () => {
      vi.spyOn(userRepository, "list").mockResolvedValueOnce({
        items: [mockUserRow],
        total: 1,
      });

      const res = await request(app).get("/api/users?page=1&limit=10").auth(token, { type: "bearer" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].id).toBe(mockUserRow.id);
      expect(res.body.data[0].email).toBe(mockUserRow.email);
      expect(Object.keys(res.body.data[0]).sort()).toEqual(["createdAt", "email", "id", "name", "role", "updatedAt"]);
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
      });
    });
  });

  describe("POST /api/users", () => {
    it("creates a new user and returns 201", async () => {
      vi.spyOn(userRepository, "emailExists").mockResolvedValueOnce(false);
      vi.spyOn(userRepository, "create").mockResolvedValueOnce(mockUserRow);

      const res = await request(app).post("/api/users").auth(token, { type: "bearer" }).send({
        name: "Dimas Pratama",
        email: "dimas@dolenae.id",
        password: "password123",
        role: "wisatawan",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(mockUserRow.id);
      expect(res.body.data.email).toBe(mockUserRow.email);
      expect(res.body.data).not.toHaveProperty("passwordHash");
    });

    it("returns 422 VALIDATION_ERROR when input is invalid", async () => {
      const res = await request(app).post("/api/users").auth(token, { type: "bearer" }).send({
        name: "A", // too short
        email: "not-an-email",
        password: "123", // too short
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 409 CONFLICT when email is already registered", async () => {
      vi.spyOn(userRepository, "emailExists").mockResolvedValueOnce(true);

      const res = await request(app).post("/api/users").auth(token, { type: "bearer" }).send({
        name: "Dimas Pratama",
        email: "dimas@dolenae.id",
        password: "password123",
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("CONFLICT");
      expect(res.body.error.message).toBe("Email sudah terdaftar");
    });
  });

  describe("GET /api/users/:id", () => {
    it("returns 422 VALIDATION_ERROR when ID is not a UUID", async () => {
      const res = await request(app).get("/api/users/not-a-uuid").auth(token, { type: "bearer" });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns user details when valid ID exists", async () => {
      vi.spyOn(userRepository, "findById").mockResolvedValueOnce(mockUserRow);

      const res = await request(app).get(`/api/users/${mockUserRow.id}`).auth(token, { type: "bearer" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(mockUserRow.id);
      expect(res.body.data).not.toHaveProperty("passwordHash");
    });

    it("returns 404 NOT_FOUND when user does not exist", async () => {
      vi.spyOn(userRepository, "findById").mockResolvedValueOnce(undefined);

      const res = await request(app).get(`/api/users/${mockUserRow.id}`).auth(token, { type: "bearer" });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("returns 422 when body is empty", async () => {
      const res = await request(app)
        .patch(`/api/users/${mockUserRow.id}`).auth(token, { type: "bearer" })
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("updates user and returns updated record", async () => {
      vi.spyOn(userRepository, "findById").mockResolvedValueOnce(mockUserRow);
      vi.spyOn(userRepository, "update").mockResolvedValueOnce({
        ...mockUserRow,
        name: "Dimas Updated",
      });

      const res = await request(app)
        .patch(`/api/users/${mockUserRow.id}`).auth(token, { type: "bearer" })
        .send({ name: "Dimas Updated" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Dimas Updated");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("returns 422 when ID is not a UUID", async () => {
      const res = await request(app).delete("/api/users/not-uuid").auth(token, { type: "bearer" });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("deletes user and returns confirmation", async () => {
      vi.spyOn(userRepository, "findById").mockResolvedValueOnce(mockUserRow);
      vi.spyOn(userRepository, "delete").mockResolvedValueOnce(true);

      const res = await request(app).delete(`/api/users/${mockUserRow.id}`).auth(token, { type: "bearer" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        id: mockUserRow.id,
        deleted: true,
      });
    });
  });
});
