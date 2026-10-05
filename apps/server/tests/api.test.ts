import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { buildPaginationMeta, parsePagination } from "../src/utils/pagination";

/**
 * Test API-level tanpa database:
 * fokus pada kontrak response, error handler, 404, dan pagination guard.
 * Endpoint yang butuh DB sengaja tidak diuji di sini.
 */
const app = createApp();

async function req(path: string, init?: RequestInit) {
  const res = await app.request(path, init);
  const body = (await res.json()) as Record<string, unknown>;
  return { status: res.status, body };
}

describe("envelope response", () => {
  it("GET / mengembalikan success + data", async () => {
    const { status, body } = await req("/");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeTruthy();
  });

  it("route tidak dikenal -> 404 dengan envelope error", async () => {
    const { status, body } = await req("/api/tidak-ada");
    expect(status).toBe(404);
    expect(body).toMatchObject({
      success: false,
      error: { code: "NOT_FOUND" },
    });
  });
});

describe("validasi input", () => {
  it("register dengan data invalid -> 422 + details", async () => {
    const { status, body } = await req("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "x", email: "bukan-email", password: "1" }),
    });
    expect(status).toBe(422);
    expect(body).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR" },
    });
    const error = body.error as { details: unknown[] };
    expect(Array.isArray(error.details)).toBe(true);
  });
});

describe("auth guard", () => {
  it("GET /users/me tanpa token -> 401", async () => {
    const { status, body } = await req("/api/users/me");
    expect(status).toBe(401);
    expect(body).toMatchObject({
      success: false,
      error: { code: "UNAUTHORIZED" },
    });
  });

  it("POST /categories tanpa token -> 401", async () => {
    const { status, body } = await req("/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Uji", type: "terrain" }),
    });
    expect(status).toBe(401);
    expect(body).toMatchObject({
      success: false,
      error: { code: "UNAUTHORIZED" },
    });
  });

  it("POST /destinations tanpa token -> 401", async () => {
    const { status } = await req("/api/destinations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(status).toBe(401);
  });
});

describe("pagination", () => {
  it("parsePagination menolak page < 1", () => {
    const fake = { req: { query: (k: string) => (k === "page" ? "0" : undefined) } };
    expect(() => parsePagination(fake as never)).toThrow();
  });

  it("parsePagination memakai default & batas limit", () => {
    const fake = { req: { query: () => undefined } };
    const params = parsePagination(fake as never);
    expect(params).toMatchObject({ page: 1, limit: 20, order: "desc" });
  });

  it("buildPaginationMeta menghitung totalPages & flags", () => {
    const meta = buildPaginationMeta(45, { page: 2, limit: 20 });
    expect(meta).toMatchObject({
      page: 2,
      limit: 20,
      total: 45,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
  });
});
