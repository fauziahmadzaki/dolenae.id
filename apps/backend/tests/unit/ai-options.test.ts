import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/destination.service", () => ({
  destinationService: {
    list: vi.fn(),
  },
}));

import { destinationService } from "../../src/services/destination.service";
import { aiService } from "../../src/services/ai/ai.service";
import { buildMeta } from "../../src/utils/pagination";

const list = vi.mocked(destinationService.list);

describe("AI options", () => {
  beforeEach(() => {
    list.mockReset();
  });

  it("derives unique regions, activities, terrains and difficulties", async () => {
    list.mockResolvedValue({
      items: [
        {
          id: "destination-1",
          location: { province: "Jawa Timur" },
          activities: ["Hiking"],
          terrain: ["Gunung", "Savana"],
        },
        {
          id: "destination-2",
          location: { province: "Jawa Timur" },
          activities: ["Camping Ground"],
          terrain: ["Gunung"],
        },
        {
          id: "destination-3",
          location: { province: "Jawa Barat" },
          activities: [],
          terrain: ["Hutan"],
        },
      ],
      meta: buildMeta(3, 1, 100),
    } as never);

    const options = await aiService.getOptions();

    expect(options.regions).toEqual(["Jawa Barat", "Jawa Timur"]);
    expect(options.activities).toEqual(["Camping Ground", "Hiking"]);
    expect(options.terrains).toEqual(["Gunung", "Hutan", "Savana"]);
    expect(options.difficulties.map((item) => item.value)).toEqual([
      "ramah-pemula",
      "menengah",
      "sulit",
    ]);
    expect(options.durations).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["missing page", { page: undefined }],
    ["wrong page", { page: 2 }],
    ["wrong limit", { limit: 20 }],
    ["negative total", { total: -1 }],
    ["fractional total", { total: 0.5 }],
    ["non-finite total", { total: NaN }],
    ["unsafe total", { total: Number.MAX_SAFE_INTEGER + 1 }],
    ["inconsistent page count", { totalPages: 2 }],
    ["missing next flag", { hasNext: undefined }],
    ["inconsistent next flag", { hasNext: true }],
    ["inconsistent previous flag", { hasPrev: true }],
  ])("rejects invalid catalog metadata: %s", async (_label, invalid) => {
    list.mockResolvedValueOnce({
      items: [{
        id: "destination-1",
        location: { province: "Bali" },
        activities: [],
        terrain: [],
      }],
      meta: { ...buildMeta(1, 1, 100), ...invalid },
    } as never);

    await expect(aiService.getOptions()).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });
    expect(list).toHaveBeenCalledTimes(1);
  });

  it.each([0, 1, 101])("rejects an incomplete catalog page of %i items", async (count) => {
    const item = {
      id: "last-destination",
      location: { province: "Bali" },
      activities: [],
      terrain: [],
    };
    list
      .mockResolvedValueOnce({
        items: Array.from({ length: count }, (_, index) => ({
          ...item, id: `destination-${index}`,
        })),
        meta: buildMeta(101, 1, 100),
      } as never)
      .mockResolvedValueOnce({
        items: [item],
        meta: buildMeta(101, 2, 100),
      } as never);

    await expect(aiService.getOptions()).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });
    expect(list).toHaveBeenCalledTimes(1);
  });

  it.each([100, 102])("rejects a catalog total that changes to %i between pages", async (total) => {
    const item = {
      id: "last-destination",
      location: { province: "Bali" },
      activities: [],
      terrain: [],
    };
    list
      .mockResolvedValueOnce({
        items: Array.from({ length: 100 }, (_, index) => ({
          ...item, id: `destination-${index}`,
        })),
        meta: buildMeta(101, 1, 100),
      } as never)
      .mockResolvedValueOnce({
        items: Array.from({ length: total - 100 }, (_, index) => ({
          ...item, id: `last-destination-${index}`,
        })),
        meta: buildMeta(total, 2, 100),
      } as never);

    await expect(aiService.getOptions()).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });
    expect(list).toHaveBeenCalledTimes(2);
  });

  it("includes options from destinations beyond the first 100", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      id: `destination-${index}`,
      name: `Gunung ${String(index).padStart(3, "0")}`,
      location: { province: "Jawa Timur" },
      activities: ["Hiking"],
      terrain: ["Gunung"],
    }));
    list
      .mockResolvedValueOnce({
        items: firstPage,
        meta: buildMeta(101, 1, 100),
      } as never)
      .mockResolvedValueOnce({
        items: [{
          id: "destination-100",
          name: "Zeta",
          location: { province: "Bali" },
          activities: ["Camping Ground"],
          terrain: ["Bukit"],
        }],
        meta: buildMeta(101, 2, 100),
      } as never);

    const options = await aiService.getOptions();

    expect(options.regions).toEqual(["Bali", "Jawa Timur"]);
    expect(options.activities).toEqual(["Camping Ground", "Hiking"]);
    expect(options.terrains).toEqual(["Bukit", "Gunung"]);
    expect(list.mock.calls).toEqual([1, 2].map((page) => [{
      page, limit: 100, sort: "name", order: "asc", status: "published",
    }]));
  });
});
