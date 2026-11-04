import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({ users: new Map<string, Record<string, unknown>>() }));
vi.mock("../../src/repositories/user.repository", () => ({
  userRepository: {
    findById: vi.fn(async (id: string) => store.users.get(id)),
    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      const row = store.users.get(id);
      if (!row) return undefined;
      const updated = { ...row, ...patch, updatedAt: new Date("2026-11-04T01:00:00Z") };
      store.users.set(id, updated);
      return updated;
    }),
  },
}));
vi.mock("../../src/db/client", () => ({ getDb: vi.fn() }));
// Keep scoped tests independent of local secrets/configuration.
vi.mock("../../src/config/env", () => ({
  loadEnv: () => ({ JWT_SECRET: "self-profile-test-only-not-a-secret", JWT_EXPIRES_IN: "1h" }),
  isProduction: () => true,
}));

import { errorHandler, notFoundHandler } from "../../src/middleware/error-handler";
import { profileRouter } from "../../src/routes/profile.route";
import { userRepository } from "../../src/repositories/user.repository";
import { signAccessToken } from "../../src/utils/jwt";

const app = express();
app.use(express.json());
app.use("/api/users", profileRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const ownerId = "82000000-0000-4000-8000-000000000001";
const otherId = "82000000-0000-4000-8000-000000000002";
const row = (id: string) => ({
  id, name: "Nama Lama", email: `${id}@example.test`, role: "wisatawan",
  provider: "local", passwordHash: "private-hash", googleId: "private-google-id",
  avatarUrl: null, emailVerifiedAt: null, lastLoginAt: null,
  createdAt: new Date("2026-11-01T00:00:00Z"), updatedAt: new Date("2026-11-01T00:00:00Z"),
});
let token: string;
beforeEach(async () => {
  vi.clearAllMocks();
  store.users.clear();
  store.users.set(ownerId, row(ownerId));
  store.users.set(otherId, row(otherId));
  token = await signAccessToken({ sub: ownerId, email: `${ownerId}@example.test`, role: "wisatawan" });
});

describe("self profile", () => {
  it("GET /users/me returns the authenticated public identity", async () => {
    const res = await request(app).get("/api/users/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ id: ownerId, name: "Nama Lama", role: "wisatawan" });
    expect(res.body.data.user).not.toHaveProperty("passwordHash");
    expect(res.body.data.user).not.toHaveProperty("googleId");
  });

  it.each(["get", "patch"] as const)("%s rejects anonymous callers", async (method) => {
    const res = await request(app)[method]("/api/users/me").send({ name: "Valid Name" });
    expect(res.status).toBe(401);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it.each(["get", "patch"] as const)("%s rejects invalid credentials", async (method) => {
    const res = await request(app)[method]("/api/users/me")
      .set("Authorization", "Bearer invalid").send({ name: "Valid Name" });
    expect(res.status).toBe(401);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it.each(["get", "patch"] as const)("%s returns 404 for a deleted account", async (method) => {
    store.users.delete(ownerId);
    const res = await request(app)[method]("/api/users/me")
      .set("Authorization", `Bearer ${token}`).send({ name: "Valid Name" });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it.each(["role", "email", "password", "passwordHash", "provider", "avatarUrl", "id", "googleId", "emailVerifiedAt", "phone", "city", "bio", "unknown"])(
    "PATCH refuses forbidden/unknown field %s rather than silently stripping it", async (field) => {
      const res = await request(app).patch("/api/users/me").set("Authorization", `Bearer ${token}`)
        .send({ name: "Valid Name", [field]: "changed" });
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(userRepository.update).not.toHaveBeenCalled();
    },
  );

  it.each([{}, { name: "" }, { name: "  " }, { name: " A " }, { name: "x".repeat(121) }, { name: null }, { name: 42 }])(
    "PATCH validates name %j", async (body) => {
      const res = await request(app).patch("/api/users/me").set("Authorization", `Bearer ${token}`).send(body);
      expect(res.status).toBe(422);
      expect(userRepository.update).not.toHaveBeenCalled();
    },
  );

  it.each([" Ab ", ` ${"x".repeat(120)} `])("PATCH trims before length validation", async (name) => {
    const res = await request(app).patch("/api/users/me").set("Authorization", `Bearer ${token}`).send({ name });
    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe(name.trim());
  });

  it.each(["merchant", "admin"] as const)("PATCH permits %s to update only their own name", async (role) => {
    store.users.get(ownerId)!.role = role;
    const roleToken = await signAccessToken({ sub: ownerId, email: `${ownerId}@example.test`, role });
    const res = await request(app).patch("/api/users/me").set("Authorization", `Bearer ${roleToken}`).send({ name: "Own Name" });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe(role);
  });

  it("PATCH /users/me updates only the authenticated name and returns AuthUser", async () => {
    const res = await request(app).patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`).send({ name: "Nama Baru" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { user: {
      id: ownerId, name: "Nama Baru", email: `${ownerId}@example.test`, role: "wisatawan",
      provider: "local", avatarUrl: null, emailVerifiedAt: null,
      createdAt: "2026-11-01T00:00:00.000Z", updatedAt: "2026-11-04T01:00:00.000Z",
    } } });
    expect(userRepository.update).toHaveBeenCalledWith(ownerId, { name: "Nama Baru" });
    expect(store.users.get(otherId)?.name).toBe("Nama Lama");
  });
});
