import { describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../../src/db/client", () => ({
  pingDatabase: vi.fn().mockResolvedValue(true),
  closeDatabase: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn(),
  getPool: vi.fn(),
}));

import { createApp } from "../../src/app";

const app = createApp();

describe("Regions API (/api/regions)", () => {
  it("lists all provinces", async () => {
    const res = await request(app).get("/api/regions/provinces");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(34);
    expect(res.body.data).toContainEqual({ code: "35", name: "Jawa Timur" });
  });

  it("lists regencies of a province", async () => {
    const res = await request(app).get("/api/regions/regencies?province=35");

    expect(res.status).toBe(200);
    expect(res.body.data).toContainEqual({
      code: "35.13",
      name: "Kabupaten Probolinggo",
    });
    expect(
      res.body.data.every((row: { code: string }) => row.code.startsWith("35.")),
    ).toBe(true);
  });

  it("lists districts of a regency", async () => {
    const res = await request(app).get("/api/regions/districts?regency=35.13");

    expect(res.status).toBe(200);
    expect(res.body.data).toContainEqual({ code: "35.13.01", name: "Sukapura" });
  });

  it("reverse geocodes a coordinate to the nearest district", async () => {
    const res = await request(app).get(
      "/api/regions/reverse?lat=-7.9425&lng=112.953",
    );

    expect(res.status).toBe(200);
    expect(res.body.data.province).toEqual({ code: "35", name: "Jawa Timur" });
    expect(res.body.data.regency.name).toContain("Pasuruan");
    expect(typeof res.body.data.district.name).toBe("string");
    expect(res.body.data.distanceKm).toBeLessThan(20);
  });

  it("rejects an invalid coordinate", async () => {
    const res = await request(app).get("/api/regions/reverse?lat=91&lng=0");
    expect(res.status).toBe(422);
  });
});
