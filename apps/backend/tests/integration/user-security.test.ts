import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("../../src/db/client", () => ({ pingDatabase: vi.fn().mockResolvedValue(true), getDb: vi.fn(), getPool: vi.fn() }));
import { createApp } from "../../src/app";
import { userRepository } from "../../src/repositories/user.repository";
import { signAccessToken } from "../../src/utils/jwt";
const app = createApp();
const id = "12345678-1234-4234-a234-1234567890ab";
beforeEach(() => vi.restoreAllMocks());
describe("Users admin boundary", () => {
  for (const method of ["get", "post", "patch", "delete"] as const) {
    const path = method === "get" || method === "post" ? "/api/users" : `/api/users/${id}`;
    it(`${method} rejects anonymous`, async () => {
      expect((await request(app)[method](path)).status).toBe(401);
    });
    it(`${method} rejects wisatawan`, async () => {
      const token = await signAccessToken({ sub: id, email: "user@example.com", role: "wisatawan" });
      expect((await request(app)[method](path).auth(token, { type: "bearer" })).status).toBe(403);
    });
  }
  it("rejects invalid JWT", async () => {
    expect((await request(app).get("/api/users").auth("invalid", { type: "bearer" })).status).toBe(401);
  });
  it("blocks self-delete before repository access", async () => {
    const spy = vi.spyOn(userRepository, "delete");
    const token = await signAccessToken({ sub: id, email: "admin@example.com", role: "admin" });
    expect((await request(app).delete(`/api/users/${id}`).auth(token, { type: "bearer" })).status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });
});
