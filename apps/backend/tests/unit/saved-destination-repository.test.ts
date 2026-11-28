import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
}));

vi.mock("../../src/db/DatabaseClient", () => ({
  database: {
    getDb: getDbMock,
  },
}));

import { savedDestinationRepository } from "../../src/repositories/SavedDestinationRepository";

const USER_ID = "11111111-1111-4111-a111-111111111111";
const DEST_ID = "44444444-4444-4444-a444-444444444444";

function makeDestination(id = DEST_ID) {
  return {
    id,
    name: "Gunung Prau",
    slug: "gunung-prau",
    tagline: null,
    description: null,
    difficulty: "menengah" as const,
    bestSeason: [],
    tags: [],
    province: "Jawa Tengah",
    regency: "Wonosobo",
    district: null,
    latitude: null,
    longitude: null,
    accessPoint: null,
    accessDescription: null,
    accessTransport: [],
    accessDuration: null,
    accessDistanceKm: null,
    elevationMeters: 2565,
    images: [],
    guideRequired: false,
    status: "published" as const,
    verified: true,
    createdAt: new Date("2026-06-01T00:00:00Z"),
    updatedAt: new Date("2026-06-01T00:00:00Z"),
  };
}

describe("SavedDestinationRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listByUser menjalankan join dengan destinations published dan orderBy terbaru dulu", async () => {
    const row = {
      saved: {
        userId: USER_ID,
        destinationId: DEST_ID,
        createdAt: new Date("2026-06-02T00:00:00Z"),
      },
      destination: makeDestination(),
    };
    const orderBy = vi.fn().mockResolvedValue([row]);
    const where = vi.fn().mockReturnValue({ orderBy });
    const innerJoin = vi.fn().mockReturnValue({ where });
    const from = vi.fn().mockReturnValue({ innerJoin });
    const select = vi.fn().mockReturnValue({ from });
    getDbMock.mockReturnValue({ select });

    const result = await savedDestinationRepository.listByUser(USER_ID);
    expect(result).toEqual([row]);
    expect(innerJoin).toHaveBeenCalledTimes(1);
    expect(orderBy).toHaveBeenCalledTimes(1);
  });

  it("removeForUser menghapus sesuai userId dan destinationId secara idempoten", async () => {
    const where = vi.fn().mockResolvedValue([]);
    const del = vi.fn().mockReturnValue({ where });
    getDbMock.mockReturnValue({ delete: del });

    const result = await savedDestinationRepository.removeForUser(USER_ID, DEST_ID);
    expect(result).toEqual({ deleted: true, destinationId: DEST_ID });
    expect(del).toHaveBeenCalledTimes(1);
    expect(where).toHaveBeenCalledTimes(1);
  });

  it("saveForUser mengembalikan user_not_found bila baris user tidak ada saat FOR UPDATE", async () => {
    const userFor = vi.fn().mockResolvedValue([]);
    const userWhere = vi.fn().mockReturnValue({ for: userFor });
    const userFrom = vi.fn().mockReturnValue({ where: userWhere });
    const tx = {
      select: vi.fn().mockReturnValueOnce({ from: userFrom }),
    };
    getDbMock.mockReturnValue({
      transaction: vi.fn((cb: (txArg: typeof tx) => unknown) => cb(tx)),
    });

    const res = await savedDestinationRepository.saveForUser(USER_ID, DEST_ID, 200);
    expect(res).toEqual({ status: "user_not_found" });
    expect(userFor).toHaveBeenCalledWith("update");
  });

  it("saveForUser mengembalikan not_found bila destinasi tidak ditemukan/published saat FOR KEY SHARE", async () => {
    const userFor = vi.fn().mockResolvedValue([{ id: USER_ID }]);
    const userWhere = vi.fn().mockReturnValue({ for: userFor });
    const userFrom = vi.fn().mockReturnValue({ where: userWhere });

    const destLimit = vi.fn().mockResolvedValue([]);
    const destFor = vi.fn().mockReturnValue({ limit: destLimit });
    const destWhere = vi.fn().mockReturnValue({ for: destFor });
    const destFrom = vi.fn().mockReturnValue({ where: destWhere });

    const tx = {
      select: vi
        .fn()
        .mockReturnValueOnce({ from: userFrom })
        .mockReturnValueOnce({ from: destFrom }),
    };
    getDbMock.mockReturnValue({
      transaction: vi.fn((cb: (txArg: typeof tx) => unknown) => cb(tx)),
    });

    const res = await savedDestinationRepository.saveForUser(USER_ID, DEST_ID, 200);
    expect(res).toEqual({ status: "not_found" });
    expect(destFor).toHaveBeenCalledWith("share");
  });

  it("saveForUser mengembalikan existing saat bookmark sudah ada", async () => {
    const dest = makeDestination();
    const existingRow = {
      userId: USER_ID,
      destinationId: DEST_ID,
      createdAt: new Date("2026-06-02T00:00:00Z"),
    };

    const userFor = vi.fn().mockResolvedValue([{ id: USER_ID }]);
    const userWhere = vi.fn().mockReturnValue({ for: userFor });
    const userFrom = vi.fn().mockReturnValue({ where: userWhere });

    const destLimit = vi.fn().mockResolvedValue([dest]);
    const destFor = vi.fn().mockReturnValue({ limit: destLimit });
    const destWhere = vi.fn().mockReturnValue({ for: destFor });
    const destFrom = vi.fn().mockReturnValue({ where: destWhere });

    const existLimit = vi.fn().mockResolvedValue([existingRow]);
    const existWhere = vi.fn().mockReturnValue({ limit: existLimit });
    const existFrom = vi.fn().mockReturnValue({ where: existWhere });

    const tx = {
      select: vi
        .fn()
        .mockReturnValueOnce({ from: userFrom })
        .mockReturnValueOnce({ from: destFrom })
        .mockReturnValueOnce({ from: existFrom }),
    };
    getDbMock.mockReturnValue({
      transaction: vi.fn((cb: (txArg: typeof tx) => unknown) => cb(tx)),
    });

    const res = await savedDestinationRepository.saveForUser(USER_ID, DEST_ID, 200);
    expect(res).toEqual({ status: "existing", row: existingRow, destination: dest });
  });

  it("saveForUser mengecek kuota hanya untuk destinasi published dan mengembalikan limit_reached", async () => {
    const dest = makeDestination();
    const userFor = vi.fn().mockResolvedValue([{ id: USER_ID }]);
    const userWhere = vi.fn().mockReturnValue({ for: userFor });
    const userFrom = vi.fn().mockReturnValue({ where: userWhere });

    const destLimit = vi.fn().mockResolvedValue([dest]);
    const destFor = vi.fn().mockReturnValue({ limit: destLimit });
    const destWhere = vi.fn().mockReturnValue({ for: destFor });
    const destFrom = vi.fn().mockReturnValue({ where: destWhere });

    const existLimit = vi.fn().mockResolvedValue([]);
    const existWhere = vi.fn().mockReturnValue({ limit: existLimit });
    const existFrom = vi.fn().mockReturnValue({ where: existWhere });

    const countWhere = vi.fn().mockResolvedValue([{ value: 200 }]);
    const countJoin = vi.fn().mockReturnValue({ where: countWhere });
    const countFrom = vi.fn().mockReturnValue({ innerJoin: countJoin });

    const tx = {
      select: vi
        .fn()
        .mockReturnValueOnce({ from: userFrom })
        .mockReturnValueOnce({ from: destFrom })
        .mockReturnValueOnce({ from: existFrom })
        .mockReturnValueOnce({ from: countFrom }),
    };
    getDbMock.mockReturnValue({
      transaction: vi.fn((cb: (txArg: typeof tx) => unknown) => cb(tx)),
    });

    const res = await savedDestinationRepository.saveForUser(USER_ID, DEST_ID, 200);
    expect(res).toEqual({ status: "limit_reached" });
    expect(countJoin).toHaveBeenCalledTimes(1);
  });

  it("saveForUser menyisipkan baris baru dan memetakan error FK 23503 untuk user dan destination", async () => {
    const dest = makeDestination();
    const createdRow = {
      userId: USER_ID,
      destinationId: DEST_ID,
      createdAt: new Date("2026-06-03T00:00:00Z"),
    };

    const makeSelectChain = () => {
      const userFor = vi.fn().mockResolvedValue([{ id: USER_ID }]);
      const userWhere = vi.fn().mockReturnValue({ for: userFor });
      const userFrom = vi.fn().mockReturnValue({ where: userWhere });

      const destLimit = vi.fn().mockResolvedValue([dest]);
      const destFor = vi.fn().mockReturnValue({ limit: destLimit });
      const destWhere = vi.fn().mockReturnValue({ for: destFor });
      const destFrom = vi.fn().mockReturnValue({ where: destWhere });

      const existLimit = vi.fn().mockResolvedValue([]);
      const existWhere = vi.fn().mockReturnValue({ limit: existLimit });
      const existFrom = vi.fn().mockReturnValue({ where: existWhere });

      const countWhere = vi.fn().mockResolvedValue([{ value: 5 }]);
      const countJoin = vi.fn().mockReturnValue({ where: countWhere });
      const countFrom = vi.fn().mockReturnValue({ innerJoin: countJoin });

      return vi
        .fn()
        .mockReturnValueOnce({ from: userFrom })
        .mockReturnValueOnce({ from: destFrom })
        .mockReturnValueOnce({ from: existFrom })
        .mockReturnValueOnce({ from: countFrom });
    };

    // 1. Created
    const txCreated = {
      select: makeSelectChain(),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdRow]),
        }),
      }),
    };
    getDbMock.mockReturnValue({
      transaction: vi.fn((cb: (txArg: typeof txCreated) => unknown) => cb(txCreated)),
    });
    expect(
      await savedDestinationRepository.saveForUser(USER_ID, DEST_ID, 200),
    ).toEqual({ status: "created", row: createdRow, destination: dest });

    // 2. FK 23503 pada user_id (via cause)
    const txFkUser = {
      select: makeSelectChain(),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue({
            cause: {
              code: "23503",
              constraint: "saved_destinations_user_id_users_id_fk",
            },
          }),
        }),
      }),
    };
    getDbMock.mockReturnValue({
      transaction: vi.fn((cb: (txArg: typeof txFkUser) => unknown) => cb(txFkUser)),
    });
    expect(
      await savedDestinationRepository.saveForUser(USER_ID, DEST_ID, 200),
    ).toEqual({ status: "user_not_found" });

    // 3. FK 23503 pada destination_id
    const txFkDest = {
      select: makeSelectChain(),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue({
            code: "23503",
            constraint: "saved_destinations_destination_id_destinations_id_fk",
          }),
        }),
      }),
    };
    getDbMock.mockReturnValue({
      transaction: vi.fn((cb: (txArg: typeof txFkDest) => unknown) => cb(txFkDest)),
    });
    expect(
      await savedDestinationRepository.saveForUser(USER_ID, DEST_ID, 200),
    ).toEqual({ status: "not_found" });
  });
});
