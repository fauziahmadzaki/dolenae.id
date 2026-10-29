import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/destination.service", () => ({
  destinationService: {
    list: vi.fn(),
  },
}));

import { destinationService } from "../../src/services/destination.service";
import { aiService } from "../../src/services/ai/ai.service";

const list = vi.mocked(destinationService.list);

describe("AI options", () => {
  beforeEach(() => {
    list.mockReset();
  });

  it("derives unique regions, activities, terrains and difficulties", async () => {
    list.mockResolvedValue({
      items: [
        {
          location: { province: "Jawa Timur" },
          activities: ["Hiking"],
          terrain: ["Gunung", "Savana"],
        },
        {
          location: { province: "Jawa Timur" },
          activities: ["Camping Ground"],
          terrain: ["Gunung"],
        },
        {
          location: { province: "Jawa Barat" },
          activities: [],
          terrain: ["Hutan"],
        },
      ],
      meta: {},
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
  });
});
