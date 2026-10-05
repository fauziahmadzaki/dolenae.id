import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

const app = createApp();

describe("uploads guard & validasi", () => {
  it("POST /api/uploads tanpa token -> 401", async () => {
    const res = await app.request("/api/uploads", { method: "POST" });
    expect(res.status).toBe(401);
  });

  it("DELETE /api/uploads tanpa token -> 401", async () => {
    const res = await app.request("/api/uploads?url=x", { method: "DELETE" });
    expect(res.status).toBe(401);
  });
});
