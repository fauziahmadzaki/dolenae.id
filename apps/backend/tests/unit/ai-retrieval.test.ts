import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/destination.service", () => ({
  destinationService: {
    list: vi.fn(),
  },
}));

vi.mock("../../src/repositories/support.repository", () => ({
  supportRepository: {
    list: vi.fn(async () => ({ items: [] })),
  },
}));

vi.mock("../../src/services/route.service", () => ({
  routeService: {
    listRoutes: vi.fn(async () => []),
    profile: vi.fn(),
  },
}));

import { destinationService } from "../../src/services/destination.service";
import { aiRetrieval } from "../../src/services/ai/retrieval.service";

const list = vi.mocked(destinationService.list);

const destination = {
  id: "11111111-1111-4111-a111-111111111111",
  name: "Gunung Uji",
  tagline: "Puncak uji",
  description: "Destinasi uji",
  difficulty: "menengah",
  tags: ["sunrise"],
  terrain: ["Gunung"],
  activities: ["Hiking"],
  location: { province: "Jawa Timur", regency: "Kabupaten Uji" },
  entryFee: 25000,
  elevationMeters: 2300,
  bestSeason: ["Juni"],
  guideRequired: false,
  facilities: ["Toilet"],
};

describe("AI retrieval relaxation", () => {
  beforeEach(() => {
    list.mockReset();
    list.mockResolvedValue({ items: [destination], meta: {} } as never);
  });

  it("drops filters one by one until a destination matches", async () => {
    const context = await aiRetrieval.build({
      regions: ["Jawa Timur"],
      activities: ["Camping Ground"],
      terrains: ["Gunung"],
    });

    expect(context.destinations.map((item) => item.name)).toEqual([
      "Gunung Uji",
    ]);
    expect(context.relaxed).toEqual(["aktivitas"]);
  });

  it("returns no destinations and all relaxed filters when nothing can match", async () => {
    list.mockResolvedValue({ items: [], meta: {} } as never);

    const context = await aiRetrieval.build({
      regions: ["Bali"],
      activities: ["Hiking"],
    });

    expect(context.destinations).toHaveLength(0);
    expect(context.relaxed).toEqual(["aktivitas", "wilayah"]);
  });
});
