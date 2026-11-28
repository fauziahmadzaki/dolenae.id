import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/db/DatabaseClient", () => ({
  database: {
    getDb: vi.fn(),
    getPool: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createApp } from "../../src/app";
import type { DestinationRow, SavedDestinationRow } from "../../src/db/models";
import { categoryRepository } from "../../src/repositories/CategoryRepository";
import { destinationRepository } from "../../src/repositories/DestinationRepository";
import { facilityRepository } from "../../src/repositories/FacilityRepository";
import { savedDestinationRepository } from "../../src/repositories/SavedDestinationRepository";
import { signAccessToken } from "../../src/utils/jwt";

const USER_A = "11111111-1111-4111-a111-111111111111";
const USER_B = "22222222-2222-4222-a222-222222222222";
const DEST_1 = "44444444-4444-4444-a444-444444444444";
const DEST_2 = "55555555-5555-4555-a555-555555555555";
const DEST_DRAFT = "66666666-6666-4666-a666-666666666666";
const CAT_TERRAIN = "77777777-7777-4777-a777-777777777777";
const CAT_ACT = "88888888-8888-4888-a888-888888888888";

function makeDestinationRow(
  id: string,
  overrides: Partial<DestinationRow> = {},
): DestinationRow {
  return {
    id,
    name: id === DEST_1 ? "Gunung Prau" : "Bukit Sikunir",
    slug: id === DEST_1 ? "gunung-prau" : "bukit-sikunir",
    tagline: "Pemandangan golden sunrise",
    description: "Deskripsi destinasi alam",
    difficulty: "menengah",
    bestSeason: ["Kemarau"],
    tags: ["Sunrise"],
    province: "Jawa Tengah",
    regency: "Wonosobo",
    district: "Kejajar",
    latitude: "-7.1867000",
    longitude: "109.9228000",
    accessPoint: "Basecamp Patak Banteng",
    accessDescription: "Mudah dijangkau",
    accessTransport: ["Motor", "Mobil"],
    accessDuration: "2 jam",
    accessDistanceKm: "26.50",
    elevationMeters: 2565,
    images: ["https://cdn.example.com/prau.jpg"],
    guideRequired: false,
    status: "published",
    verified: true,
    createdAt: new Date("2026-06-01T00:00:00Z"),
    updatedAt: new Date("2026-06-01T00:00:00Z"),
    ...overrides,
  };
}

describe("Saved destinations API (/api/saved-destinations)", () => {
  const app = createApp();
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    tokenA = await signAccessToken({
      sub: USER_A,
      email: "a@dolenae.id",
      role: "wisatawan",
    });
    tokenB = await signAccessToken({
      sub: USER_B,
      email: "b@dolenae.id",
      role: "wisatawan",
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(destinationRepository, "findCategoryLinks").mockResolvedValue([
      { destinationId: DEST_1, categoryId: CAT_TERRAIN },
      { destinationId: DEST_1, categoryId: CAT_ACT },
      { destinationId: DEST_2, categoryId: CAT_TERRAIN },
    ]);
    vi.spyOn(facilityRepository, "countPublishedTypesByDestinations").mockResolvedValue([
      { destinationId: DEST_1, type: "warung", total: 3 },
      { destinationId: DEST_1, type: "jeep", total: 1 },
    ]);
    vi.spyOn(categoryRepository, "findByIds").mockResolvedValue([
      {
        id: CAT_TERRAIN,
        name: "Gunung",
        slug: "gunung",
        type: "terrain",
        description: null,
        icon: null,
        createdAt: new Date("2026-06-01T00:00:00Z"),
        updatedAt: new Date("2026-06-01T00:00:00Z"),
      },
      {
        id: CAT_ACT,
        name: "Camping Ground",
        slug: "camping-ground",
        type: "activity",
        description: null,
        icon: null,
        createdAt: new Date("2026-06-01T00:00:00Z"),
        updatedAt: new Date("2026-06-01T00:00:00Z"),
      },
    ]);
  });

  it("menolak permintaan tanpa auth dengan 401", async () => {
    const resList = await request(app).get("/api/saved-destinations");
    expect(resList.status).toBe(401);

    const resPut = await request(app).put(`/api/saved-destinations/${DEST_1}`);
    expect(resPut.status).toBe(401);

    const resDel = await request(app).delete(`/api/saved-destinations/${DEST_1}`);
    expect(resDel.status).toBe(401);
  });

  it("menolak destinationId bukan UUID dengan 422", async () => {
    const resPut = await request(app)
      .put("/api/saved-destinations/not-a-uuid")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resPut.status).toBe(422);

    const resDel = await request(app)
      .delete("/api/saved-destinations/invalid-id")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resDel.status).toBe(422);
  });

  it("mengembalikan 401 saat akun pengguna sudah terhapus (user_not_found)", async () => {
    vi.spyOn(savedDestinationRepository, "saveForUser").mockResolvedValue({
      status: "user_not_found",
    });

    const res = await request(app)
      .put(`/api/saved-destinations/${DEST_1}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(401);
  });

  it("mengembalikan 404 untuk destinasi tidak ada, draft, atau archived", async () => {
    vi.spyOn(savedDestinationRepository, "saveForUser").mockResolvedValue({
      status: "not_found",
    });

    const res = await request(app)
      .put(`/api/saved-destinations/${DEST_DRAFT}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
    expect(savedDestinationRepository.saveForUser).toHaveBeenCalledWith(
      USER_A,
      DEST_DRAFT,
      200,
    );
  });

  it("mengembalikan 201 pada simpan pertama dan 200 idempoten pada simpan ulang dengan PublicDestination terhidrasi lengkap", async () => {
    const savedRow: SavedDestinationRow = {
      userId: USER_A,
      destinationId: DEST_1,
      createdAt: new Date("2026-06-02T10:00:00Z"),
    };
    const destRow = makeDestinationRow(DEST_1);

    const spy = vi
      .spyOn(savedDestinationRepository, "saveForUser")
      .mockResolvedValueOnce({
        status: "created",
        row: savedRow,
        destination: destRow,
      })
      .mockResolvedValueOnce({
        status: "existing",
        row: savedRow,
        destination: destRow,
      });

    const first = await request(app)
      .put(`/api/saved-destinations/${DEST_1}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(first.status).toBe(201);
    expect(first.body.data).toMatchObject({
      id: `${USER_A}:${DEST_1}`,
      destinationId: DEST_1,
      savedAt: "2026-06-02T10:00:00.000Z",
      destination: {
        id: DEST_1,
        name: "Gunung Prau",
        terrain: ["Gunung"],
        activities: ["Camping Ground"],
        facilities: { Warung: 3, Jeep: 1 },
        location: { province: "Jawa Tengah", regency: "Wonosobo" },
        images: ["https://cdn.example.com/prau.jpg"],
      },
    });

    const second = await request(app)
      .put(`/api/saved-destinations/${DEST_1}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(second.status).toBe(200);
    expect(second.body.data.destinationId).toBe(DEST_1);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("mengisolasi daftar tersimpan antar akun dan mengurutkan terbaru dulu", async () => {
    const store = new Map<string, SavedDestinationRow[]>();
    store.set(USER_A, [
      {
        userId: USER_A,
        destinationId: DEST_2,
        createdAt: new Date("2026-06-03T12:00:00Z"),
      },
      {
        userId: USER_A,
        destinationId: DEST_1,
        createdAt: new Date("2026-06-02T12:00:00Z"),
      },
    ]);
    store.set(USER_B, [
      {
        userId: USER_B,
        destinationId: DEST_1,
        createdAt: new Date("2026-06-01T12:00:00Z"),
      },
    ]);

    vi.spyOn(savedDestinationRepository, "listByUser").mockImplementation(
      async (userId) => {
        const rows = store.get(userId) ?? [];
        return rows.map((saved) => ({
          saved,
          destination: makeDestinationRow(saved.destinationId),
        }));
      },
    );

    const resA = await request(app)
      .get("/api/saved-destinations")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(resA.status).toBe(200);
    expect(resA.body.data).toHaveLength(2);
    expect(resA.body.data.map((i: { destinationId: string }) => i.destinationId)).toEqual([
      DEST_2,
      DEST_1,
    ]);

    const resB = await request(app)
      .get("/api/saved-destinations")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(resB.status).toBe(200);
    expect(resB.body.data).toHaveLength(1);
    expect(resB.body.data[0].destinationId).toBe(DEST_1);
  });

  it("menghapus secara idempoten dan terisolasi per user", async () => {
    const removeSpy = vi
      .spyOn(savedDestinationRepository, "removeForUser")
      .mockResolvedValue({ deleted: true, destinationId: DEST_1 });

    const res1 = await request(app)
      .delete(`/api/saved-destinations/${DEST_1}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res1.status).toBe(200);
    expect(res1.body.data).toEqual({ deleted: true, destinationId: DEST_1 });

    const res2 = await request(app)
      .delete(`/api/saved-destinations/${DEST_1}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res2.status).toBe(200);

    expect(removeSpy).toHaveBeenNthCalledWith(1, USER_A, DEST_1);
    expect(removeSpy).toHaveBeenNthCalledWith(2, USER_B, DEST_1);
  });

  it("mengembalikan 422 saat batas maksimum 200 destinasi tersimpan tercapai", async () => {
    vi.spyOn(savedDestinationRepository, "saveForUser").mockResolvedValue({
      status: "limit_reached",
    });

    const res = await request(app)
      .put(`/api/saved-destinations/${DEST_1}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(422);
    expect(res.body.error.message).toContain("200");
  });
});
