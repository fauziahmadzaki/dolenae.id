import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/db/client", () => ({
  pingDatabase: vi.fn().mockResolvedValue(true),
  closeDatabase: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn(),
  getPool: vi.fn(),
}));

import { createApp } from "../../src/app";

describe("http", () => {
  const app = createApp();

  it("GET /api/health returns the success envelope", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      status: "ok",
      service: "Dolenae API",
      db: "connected",
    });
  });

  it("unknown route returns the error envelope", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("GET / returns service info", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.data.service).toBe("Dolenae API");
  });
});
