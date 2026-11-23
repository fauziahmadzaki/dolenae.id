import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/repositories/DestinationRepository", () => ({
  destinationRepository: { findById: vi.fn() },
}));

vi.mock("../../src/repositories/FacilityRepository", () => ({
  facilityRepository: {
    findById: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../src/repositories/FacilityProductRepository", () => ({
  facilityProductRepository: {
    listByFacility: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { destinationRepository } from "../../src/repositories/DestinationRepository";
import { facilityProductRepository } from "../../src/repositories/FacilityProductRepository";
import { facilityRepository } from "../../src/repositories/FacilityRepository";
import { facilityService } from "../../src/services/FacilityService";
import type { CreateFacilityBody } from "../../src/types/facility";

const destinationId = "22222222-2222-4222-a222-222222222222";
const facilityId = "33333333-3333-4333-a333-333333333333";
const merchant = { id: "44444444-4444-4444-a444-444444444444", role: "merchant" as const };
const admin = { id: "55555555-5555-4555-a555-555555555555", role: "admin" as const };

const destination = {
  id: destinationId,
  status: "published",
  latitude: "-7.9425000",
  longitude: "112.9530000",
};

const facilityRow = {
  id: facilityId,
  destinationId,
  ownerId: merchant.id,
  name: "Homestay Uji",
  category: "accommodation" as const,
  type: "homestay",
  latitude: "-7.9500000",
  longitude: "112.9550000",
  priceMin: 150000,
  priceMax: 250000,
  description: null,
  contact: "081234567890",
  contactEmail: null,
  website: null,
  bannerUrl: null,
  status: "pending" as const,
  createdAt: new Date("2026-11-14T00:00:00Z"),
  updatedAt: new Date("2026-11-14T00:00:00Z"),
  destinationName: "Gunung Uji",
};

function body(overrides: Partial<CreateFacilityBody> = {}): CreateFacilityBody {
  return {
    destinationId,
    name: "Homestay Uji",
    category: "accommodation",
    type: "homestay",
    latitude: -7.95,
    longitude: 112.955,
    priceMin: 150000,
    priceMax: 250000,
    contact: "081234567890",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(destinationRepository.findById).mockResolvedValue(
    destination as never,
  );
  vi.mocked(facilityRepository.create).mockResolvedValue(facilityRow);
  vi.mocked(facilityRepository.update).mockResolvedValue(facilityRow);
  vi.mocked(facilityProductRepository.listByFacility).mockResolvedValue([]);
});

describe("FacilityService verification queue", () => {
  it("applies pending status and server-side search without scoping admin to one owner", async () => {
    vi.mocked(facilityRepository.list).mockResolvedValue({ items: [facilityRow], total: 1 });
    const result = await facilityService.listMine(admin, {
      status: "pending", search: "Gunung", sort: "createdAt", order: "desc", page: 2, limit: 10,
    });
    expect(facilityRepository.list).toHaveBeenCalledWith(expect.objectContaining({
      statuses: ["pending"], ownerId: undefined, search: "Gunung", sort: "createdAt", order: "desc", offset: 10,
    }));
    expect(result.items[0]?.status).toBe("pending");
  });
});

describe("FacilityService geofence", () => {
  it("accepts a merchant facility within 20 km and marks it pending", async () => {
    const result = await facilityService.create(merchant, body());

    expect(result.status).toBe("pending");
    expect(facilityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: merchant.id,
        status: "pending",
        latitude: "-7.95",
        longitude: "112.955",
      }),
    );
  });

  it("rejects a facility farther than 20 km from the destination", async () => {
    await expect(
      facilityService.create(merchant, body({ latitude: -7.0, longitude: 112.95 })),
    ).rejects.toMatchObject({
      statusCode: 422,
      code: "VALIDATION_ERROR",
    });
    expect(facilityRepository.create).not.toHaveBeenCalled();
  });

  it("rejects when the destination has no coordinates", async () => {
    vi.mocked(destinationRepository.findById).mockResolvedValue({
      ...destination,
      latitude: null,
      longitude: null,
    } as never);

    await expect(facilityService.create(merchant, body())).rejects.toMatchObject({
      statusCode: 422,
    });
  });
});

describe("FacilityService pricing", () => {
  it("rejects priceMax without priceMin", async () => {
    await expect(
      facilityService.create(merchant, body({ priceMin: null, priceMax: 200000 })),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects priceMax lower than priceMin", async () => {
    await expect(
      facilityService.create(merchant, body({ priceMin: 200000, priceMax: 100000 })),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("FacilityService ownership & visibility", () => {
  it("forbids a merchant from editing another merchant's facility", async () => {
    vi.mocked(facilityRepository.findById).mockResolvedValue(facilityRow);

    await expect(
      facilityService.update(facilityId, admin, { name: "Baru" }),
    ).resolves.toBeDefined();

    await expect(
      facilityService.update(
        facilityId,
        { id: "99999999-9999-4999-a999-999999999999", role: "merchant" },
        { name: "Baru" },
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("hides draft facilities from anonymous users but shows them to the owner", async () => {
    vi.mocked(facilityRepository.findById).mockResolvedValue({
      ...facilityRow,
      status: "draft",
    });

    await expect(facilityService.getById(facilityId)).rejects.toMatchObject({
      statusCode: 404,
    });
    await expect(
      facilityService.getById(facilityId, merchant),
    ).resolves.toBeDefined();
  });
});
