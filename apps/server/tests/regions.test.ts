import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

const app = createApp();

async function req(path: string) {
  const res = await app.request(path);
  const body = (await res.json()) as Record<string, unknown>;
  return { status: res.status, body };
}

describe("regions", () => {
  it("GET /api/regions/provinces mengembalikan daftar provinsi", async () => {
    const { status, body } = await req("/api/regions/provinces");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    const data = body.data as string[];
    expect(data.length).toBeGreaterThan(30);
    expect(data).toContain("Jawa Timur");
  });

  it("GET /api/regions/regencies memfilter per provinsi", async () => {
    const { status, body } = await req(
      "/api/regions/regencies?province=" + encodeURIComponent("Jawa Timur"),
    );
    expect(status).toBe(200);
    const data = body.data as { name: string; province: string }[];
    expect(data.length).toBeGreaterThan(30);
    expect(data.every((r) => r.province === "Jawa Timur")).toBe(true);
  });

  it("GET /api/regions/reverse mengisi area dari koordinat", async () => {
    const { status, body } = await req("/api/regions/reverse?lat=-7.9425&lng=112.9531");
    expect(status).toBe(200);
    const data = body.data as { province: string; regency: string; district: string };
    expect(data.province).toBe("Jawa Timur");
    expect(data.regency).toBeTruthy();
    expect(data.district).toBeTruthy();
  });

  it("reverse dengan koordinat tidak valid -> 400", async () => {
    const { status, body } = await req("/api/regions/reverse?lat=abc&lng=10");
    expect(status).toBe(400);
    expect(body).toMatchObject({ success: false, error: { code: "BAD_REQUEST" } });
  });
});
