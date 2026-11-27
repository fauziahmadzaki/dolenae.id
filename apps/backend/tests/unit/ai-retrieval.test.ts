import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/DestinationService", () => ({
  destinationService: {
    list: vi.fn(),
  },
}));

vi.mock("../../src/repositories/FacilityRepository", () => ({
  facilityRepository: {
    list: vi.fn(async () => ({ items: [], total: 0 })),
    minPricesByCategory: vi.fn(async () => []),
  },
}));

vi.mock("../../src/services/RouteService", () => ({
  routeService: {
    listRoutes: vi.fn(async () => []),
    profile: vi.fn(),
  },
}));

import { destinationService } from "../../src/services/DestinationService";
import { facilityRepository } from "../../src/repositories/FacilityRepository";
import { aiRetrieval } from "../../src/services/ai/RetrievalService";

const list = vi.mocked(destinationService.list);
const listFacilities = vi.mocked(facilityRepository.list);
const minPricesByCategory = vi.mocked(facilityRepository.minPricesByCategory);

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
  elevationMeters: 2300,
  bestSeason: ["Juni"],
  guideRequired: false,
};

describe("AI retrieval relaxation", () => {
  beforeEach(() => {
    list.mockReset();
    list.mockResolvedValue({ items: [destination], meta: {} } as never);
    listFacilities.mockReset();
    listFacilities.mockResolvedValue({ items: [], total: 0 } as never);
    minPricesByCategory.mockReset();
    minPricesByCategory.mockResolvedValue([]);
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
    expect(context.queryMatched).toBe(true);
  });

  it("flags catalog terms that do not exist", async () => {
    const context = await aiRetrieval.build({
      rawText: "gunung Everest ada ga disini",
    });

    expect(context.queryMatched).toBe(false);
    expect(context.unmatchedTerms).toEqual(["everest"]);
    expect(context.destinations).not.toHaveLength(0);
  });

  it("treats known destinations and generic travel words as matched", async () => {
    const known = await aiRetrieval.build({ rawText: "Gunung Uji" });
    const generic = await aiRetrieval.build({ rawText: "sunrise 2 hari" });

    expect(known.queryMatched).toBe(true);
    expect(generic.queryMatched).toBe(true);
  });

  it("keeps explicitly selected destinations in the requested order", async () => {
    const second = {
      ...destination,
      id: "22222222-2222-4222-a222-222222222222",
      name: "Gunung Kedua",
    };
    list.mockResolvedValue({
      items: [destination, second],
      meta: {},
    } as never);

    const context = await aiRetrieval.build({
      destinationIds: [
        "22222222-2222-4222-a222-222222222222",
        destination.id,
      ],
    });

    expect(context.destinations.map((item) => item.name)).toEqual([
      "Gunung Kedua",
      "Gunung Uji",
    ]);
    expect(context.invalidDestinationIds).toEqual([]);
  });

  it("reports explicit destination IDs that are not published", async () => {
    const context = await aiRetrieval.build({
      destinationIds: ["99999999-9999-4999-a999-999999999999"],
    });

    expect(context.destinations).toHaveLength(0);
    expect(context.invalidDestinationIds).toEqual([
      "99999999-9999-4999-a999-999999999999",
    ]);
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

  it("parses 'coba buatkan trip yang murah' without unmatched terms and prioritizes lowest-cost destinations", async () => {
    const bromoId = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
    const prauId = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
    const bromo = {
      ...destination,
      id: bromoId,
      name: "Gunung Bromo",
      difficulty: "ramah-pemula",
      location: { province: "Jawa Timur", regency: "Probolinggo" },
    };
    const prau = {
      ...destination,
      id: prauId,
      name: "Gunung Prau",
      difficulty: "menengah",
      location: { province: "Jawa Tengah", regency: "Wonosobo" },
    };
    list.mockResolvedValue({
      items: [bromo, prau],
      meta: {},
    } as never);
    minPricesByCategory.mockResolvedValueOnce([
      { destinationId: bromoId, category: "transport", minPrice: 650_000 },
      { destinationId: bromoId, category: "food", minPrice: 25_000 },
      { destinationId: bromoId, category: "accommodation", minPrice: 250_000 },
      { destinationId: prauId, category: "transport", minPrice: 25_000 },
      { destinationId: prauId, category: "food", minPrice: 15_000 },
      { destinationId: prauId, category: "accommodation", minPrice: 150_000 },
    ]);
    listFacilities.mockImplementation(async (params) => {
      if (params.destinationId === bromoId) {
        return {
          items: [
            {
              id: "fac-b-1",
              destinationId: bromoId,
              name: "Jeep Bromo Adventure",
              category: "transport",
              priceMin: 650_000,
              priceMax: 650_000,
              status: "published",
            },
            {
              id: "fac-b-2",
              destinationId: bromoId,
              name: "Warung Bromo",
              category: "food",
              priceMin: 25_000,
              priceMax: 50_000,
              status: "published",
            },
            {
              id: "fac-b-3",
              destinationId: bromoId,
              name: "Homestay Bromo",
              category: "accommodation",
              priceMin: 250_000,
              priceMax: 400_000,
              status: "published",
            },
          ],
          total: 3,
        } as never;
      }
      return {
        items: [
          {
            id: "fac-p-1",
            destinationId: prauId,
            name: "Ojek Dieng Hemat",
            category: "transport",
            priceMin: 25_000,
            priceMax: 30_000,
            status: "published",
          },
          {
            id: "fac-p-2",
            destinationId: prauId,
            name: "Warung Prau Hemat",
            category: "food",
            priceMin: 15_000,
            priceMax: 25_000,
            status: "published",
          },
          {
            id: "fac-p-3",
            destinationId: prauId,
            name: "Basecamp Prau",
            category: "accommodation",
            priceMin: 150_000,
            priceMax: 200_000,
            status: "published",
          },
        ],
        total: 3,
      } as never;
    });

    const context = await aiRetrieval.build({
      rawText: "coba buatkan trip yang murah",
    });

    expect(context.queryMatched).toBe(true);
    expect(context.unmatchedTerms).toEqual([]);
    expect(context.preference.preferLowCost).toBe(true);
    expect(context.destinations.map((item) => item.name)).toEqual([
      "Gunung Prau",
    ]);
    expect(context.destinations[0]?.estimatedCostPerPerson).toBe(190_000);
  });

  it("extracts Indonesian natural-language intent without overriding manual filters", async () => {
    const merapi = {
      ...destination,
      id: "cccccccc-cccc-4ccc-cccc-cccccccccccc",
      name: "Bukit Kaliurang",
      difficulty: "ramah-pemula",
      terrain: ["Gunung"],
      activities: ["Camping Ground"],
      location: { province: "DI Yogyakarta", regency: "Sleman" },
    };
    list.mockResolvedValue({ items: [merapi], meta: {} } as never);

    const parsed = await aiRetrieval.build({
      rawText:
        "tolong carikan camping di gunung di jogja 3 hari budget 500rb ramah pemula dengan homestay",
    });

    expect(parsed.queryMatched).toBe(true);
    expect(parsed.unmatchedTerms).toEqual([]);
    expect(parsed.preference).toMatchObject({
      budgetPerPerson: 500_000,
      preferLowCost: true,
      durationDays: 3,
      difficulty: "ramah-pemula",
      terrains: ["Gunung"],
      activities: ["Camping Ground"],
      regions: ["Yogyakarta"],
      needsAccommodation: true,
    });
    expect(parsed.destinations[0]?.name).toBe("Bukit Kaliurang");

    const manualKept = await aiRetrieval.build({
      rawText: "budget 500rb 3 hari di jogja ramah pemula",
      budgetPerPerson: 1_500_000,
      durationDays: 5,
      difficulty: "menengah",
      regions: ["Jawa Timur"],
    });

    expect(manualKept.preference.budgetPerPerson).toBe(1_500_000);
    expect(manualKept.preference.durationDays).toBe(5);
    expect(manualKept.preference.difficulty).toBe("menengah");
    expect(manualKept.preference.regions).toEqual(["Jawa Timur"]);
  });

  it("enforces Zod bounds on parsed budget and inferred intent lists", async () => {
    const richCatalog = Array.from({ length: 10 }, (_, idx) => ({
      ...destination,
      id: `dddddddd-dddd-4ddd-addd-00000000000${idx}`,
      name: `Destinasi ${idx}`,
      terrain: [`Medan${idx}`],
      activities: [`Aktivitas${idx}`],
      location: { province: `Provinsi${idx}`, regency: `Kabupaten${idx}` },
    }));
    list.mockResolvedValue({ items: richCatalog, meta: {} } as never);

    const extremeBudget = await aiRetrieval.build({
      rawText: "budget 1500 juta",
    });
    expect(extremeBudget.preference.budgetPerPerson).toBeUndefined();
    expect(extremeBudget.preference.preferLowCost).toBeUndefined();

    const dottedLargeUnit = await aiRetrieval.build({
      rawText: "budget 1.500 juta",
    });
    expect(dottedLargeUnit.preference.budgetPerPerson).toBeUndefined();
    expect(dottedLargeUnit.preference.preferLowCost).toBeUndefined();

    const trillionRp = await aiRetrieval.build({
      rawText: "budget Rp 1.000.000.000.000",
    });
    expect(trillionRp.preference.budgetPerPerson).toBeUndefined();
    expect(trillionRp.preference.preferLowCost).toBeUndefined();

    const decimalJuta = await aiRetrieval.build({
      rawText: "budget 1,5 juta",
    });
    expect(decimalJuta.preference.budgetPerPerson).toBe(1_500_000);

    const groupedRp = await aiRetrieval.build({
      rawText: "budget Rp 350.000",
    });
    expect(groupedRp.preference.budgetPerPerson).toBe(350_000);
    expect(groupedRp.preference.preferLowCost).toBe(true);

    const rpCommaDuration = await aiRetrieval.build({
      rawText: "budget Rp 350.000, 2 hari",
    });
    expect(rpCommaDuration.preference.budgetPerPerson).toBe(350_000);
    expect(rpCommaDuration.preference.durationDays).toBe(2);

    const jutaCommaDuration = await aiRetrieval.build({
      rawText: "budget 1,5 juta, 2 hari",
    });
    expect(jutaCommaDuration.preference.budgetPerPerson).toBe(1_500_000);
    expect(jutaCommaDuration.preference.durationDays).toBe(2);

    const rpSpaceDuration = await aiRetrieval.build({
      rawText: "Rp 350.000 2 hari",
    });
    expect(rpSpaceDuration.preference.budgetPerPerson).toBe(350_000);
    expect(rpSpaceDuration.preference.durationDays).toBe(2);

    const rpSpacesDuration = await aiRetrieval.build({
      rawText: "Rp 350 000 2 hari",
    });
    expect(rpSpacesDuration.preference.budgetPerPerson).toBe(350_000);
    expect(rpSpacesDuration.preference.durationDays).toBe(2);

    const rpSpacesTrillionDuration = await aiRetrieval.build({
      rawText: "Rp 1 000 000 000 000 2 hari",
    });
    expect(rpSpacesTrillionDuration.preference.budgetPerPerson).toBeUndefined();
    expect(rpSpacesTrillionDuration.preference.preferLowCost).toBeUndefined();
    expect(rpSpacesTrillionDuration.preference.durationDays).toBe(2);

    const unitSpacesDuration = await aiRetrieval.build({
      rawText: "budget 1 500 juta 2 hari",
    });
    expect(unitSpacesDuration.preference.budgetPerPerson).toBeUndefined();
    expect(unitSpacesDuration.preference.preferLowCost).toBeUndefined();
    expect(unitSpacesDuration.preference.durationDays).toBe(2);

    const rpMultiSpaceDuration = await aiRetrieval.build({
      rawText: "Rp 350  000 2 hari",
    });
    expect(rpMultiSpaceDuration.preference.budgetPerPerson).toBe(350_000);
    expect(rpMultiSpaceDuration.preference.durationDays).toBe(2);

    const rpMultiSpaceTrillionDuration = await aiRetrieval.build({
      rawText: "Rp 1  000 000 000 000 2 hari",
    });
    expect(rpMultiSpaceTrillionDuration.preference.budgetPerPerson).toBeUndefined();
    expect(rpMultiSpaceTrillionDuration.preference.preferLowCost).toBeUndefined();
    expect(rpMultiSpaceTrillionDuration.preference.durationDays).toBe(2);

    const unitMultiSpaceDuration = await aiRetrieval.build({
      rawText: "budget 1  500 juta 2 hari",
    });
    expect(unitMultiSpaceDuration.preference.budgetPerPerson).toBeUndefined();
    expect(unitMultiSpaceDuration.preference.preferLowCost).toBeUndefined();
    expect(unitMultiSpaceDuration.preference.durationDays).toBe(2);

    const unitDoubleDotDuration = await aiRetrieval.build({
      rawText: "budget 1..500 juta 2 hari",
    });
    expect(unitDoubleDotDuration.preference.budgetPerPerson).toBeUndefined();
    expect(unitDoubleDotDuration.preference.preferLowCost).toBeUndefined();
    expect(unitDoubleDotDuration.preference.durationDays).toBe(2);

    const rpDoubleDotDuration = await aiRetrieval.build({
      rawText: "Rp 350..000 2 hari",
    });
    expect(rpDoubleDotDuration.preference.budgetPerPerson).toBeUndefined();
    expect(rpDoubleDotDuration.preference.preferLowCost).toBeUndefined();
    expect(rpDoubleDotDuration.preference.durationDays).toBe(2);

    const postDateRpDuration = await aiRetrieval.build({
      rawText: "Berangkat 26 November 2026, Rp 350.000, 2 hari",
    });
    expect(postDateRpDuration.preference.budgetPerPerson).toBe(350_000);
    expect(postDateRpDuration.preference.durationDays).toBe(2);

    const postDateUnitDuration = await aiRetrieval.build({
      rawText: "Berangkat 26 November 2026, 500rb, 2 hari",
    });
    expect(postDateUnitDuration.preference.budgetPerPerson).toBe(500_000);
    expect(postDateUnitDuration.preference.durationDays).toBe(2);

    const rpDotSpaceDuration = await aiRetrieval.build({
      rawText: "Rp 350. 000 2 hari",
    });
    expect(rpDotSpaceDuration.preference.budgetPerPerson).toBeUndefined();
    expect(rpDotSpaceDuration.preference.preferLowCost).toBeUndefined();
    expect(rpDotSpaceDuration.preference.durationDays).toBe(2);

    const rpDotSpaceTrillionDuration = await aiRetrieval.build({
      rawText: "Rp 1. 000 000 000 000 2 hari",
    });
    expect(rpDotSpaceTrillionDuration.preference.budgetPerPerson).toBeUndefined();
    expect(rpDotSpaceTrillionDuration.preference.preferLowCost).toBeUndefined();
    expect(rpDotSpaceTrillionDuration.preference.durationDays).toBe(2);

    const unitDotSpaceDuration = await aiRetrieval.build({
      rawText: "budget 1. 500 juta 2 hari",
    });
    expect(unitDotSpaceDuration.preference.budgetPerPerson).toBeUndefined();
    expect(unitDotSpaceDuration.preference.preferLowCost).toBeUndefined();
    expect(unitDotSpaceDuration.preference.durationDays).toBe(2);

    const postYearUnitDuration = await aiRetrieval.build({
      rawText: "2026, 500rb, 2 hari",
    });
    expect(postYearUnitDuration.preference.budgetPerPerson).toBe(500_000);
    expect(postYearUnitDuration.preference.durationDays).toBe(2);

    const postMonthYearUnitDuration = await aiRetrieval.build({
      rawText: "Berangkat November 2026, 500rb, 2 hari",
    });
    expect(postMonthYearUnitDuration.preference.budgetPerPerson).toBe(500_000);
    expect(postMonthYearUnitDuration.preference.durationDays).toBe(2);

    const postExplicitYearJutaDuration = await aiRetrieval.build({
      rawText: "Tahun 2026, 1,5 juta, 2 hari",
    });
    expect(postExplicitYearJutaDuration.preference.budgetPerPerson).toBe(
      1_500_000,
    );
    expect(postExplicitYearJutaDuration.preference.durationDays).toBe(2);

    const decimalYearRibuDuration = await aiRetrieval.build({
      rawText: "budget 2026,50 ribu, 2 hari",
    });
    expect(decimalYearRibuDuration.preference.budgetPerPerson).toBe(2_026_500);
    expect(decimalYearRibuDuration.preference.durationDays).toBe(2);

    const decimalYearJutaDuration = await aiRetrieval.build({
      rawText: "budget 2026,50 juta, 2 hari",
    });
    expect(decimalYearJutaDuration.preference.budgetPerPerson).toBeUndefined();
    expect(decimalYearJutaDuration.preference.preferLowCost).toBeUndefined();
    expect(decimalYearJutaDuration.preference.durationDays).toBe(2);

    const monthBeforeUnitDuration = await aiRetrieval.build({
      rawText: "Berangkat November 500 ribu, 2 hari",
    });
    expect(monthBeforeUnitDuration.preference.budgetPerPerson).toBe(500_000);
    expect(monthBeforeUnitDuration.preference.durationDays).toBe(2);

    const postDatePeriodUnitDuration = await aiRetrieval.build({
      rawText: "Berangkat 26 November 2026. 500 ribu, 2 hari",
    });
    expect(postDatePeriodUnitDuration.preference.budgetPerPerson).toBe(500_000);
    expect(postDatePeriodUnitDuration.preference.durationDays).toBe(2);
    expect(postDatePeriodUnitDuration.queryMatched).toBe(true);
    expect(postDatePeriodUnitDuration.unmatchedTerms).toEqual([]);

    const postMonthYearPeriodJutaDuration = await aiRetrieval.build({
      rawText: "Berangkat November 2026. 1,5 juta, 2 hari",
    });
    expect(postMonthYearPeriodJutaDuration.preference.budgetPerPerson).toBe(
      1_500_000,
    );
    expect(postMonthYearPeriodJutaDuration.preference.durationDays).toBe(2);
    expect(postMonthYearPeriodJutaDuration.queryMatched).toBe(true);
    expect(postMonthYearPeriodJutaDuration.unmatchedTerms).toEqual([]);

    const postExplicitYearPeriodUnitDuration = await aiRetrieval.build({
      rawText: "Tahun 2026. 500 rb, 2 hari",
    });
    expect(postExplicitYearPeriodUnitDuration.preference.budgetPerPerson).toBe(
      500_000,
    );
    expect(postExplicitYearPeriodUnitDuration.preference.durationDays).toBe(2);
    expect(postExplicitYearPeriodUnitDuration.queryMatched).toBe(true);
    expect(postExplicitYearPeriodUnitDuration.unmatchedTerms).toEqual([]);

    const malformedBudgetPeriodDuration = await aiRetrieval.build({
      rawText: "budget 2026. 50 ribu, 2 hari",
    });
    expect(
      malformedBudgetPeriodDuration.preference.budgetPerPerson,
    ).toBeUndefined();
    expect(
      malformedBudgetPeriodDuration.preference.preferLowCost,
    ).toBeUndefined();
    expect(malformedBudgetPeriodDuration.preference.durationDays).toBe(2);

    const noisyPrompt = await aiRetrieval.build({
      rawText: `${richCatalog.map((d) => `${d.location.province} ${d.terrain[0]} ${d.activities[0]}`).join(" ")} ${"x".repeat(1200)}`,
      note: "y".repeat(700),
    });

    expect((noisyPrompt.preference.rawText ?? "").length).toBeLessThanOrEqual(
      1000,
    );
    expect((noisyPrompt.preference.note ?? "").length).toBeLessThanOrEqual(500);
    expect((noisyPrompt.preference.regions ?? []).length).toBeLessThanOrEqual(5);
    expect((noisyPrompt.preference.activities ?? []).length).toBeLessThanOrEqual(
      8,
    );
    expect((noisyPrompt.preference.terrains ?? []).length).toBeLessThanOrEqual(
      8,
    );
  });

  it("fetches minimum prices once across all destinations without N+1 list queries", async () => {
    const mahalA = "eeeeeeee-eeee-4eee-aeee-000000000001";
    const mahalB = "eeeeeeee-eeee-4eee-aeee-000000000002";
    const murahC = "eeeeeeee-eeee-4eee-aeee-000000000003";

    list.mockResolvedValue({
      items: [
        { ...destination, id: mahalA, name: "Bukit Alpha Mahal" },
        { ...destination, id: mahalB, name: "Bukit Beta Mahal" },
        { ...destination, id: murahC, name: "Gunung Gamma Murah" },
      ],
      meta: {},
    } as never);

    minPricesByCategory.mockResolvedValueOnce([
      { destinationId: mahalA, category: "transport", minPrice: 300_000 },
      { destinationId: mahalA, category: "food", minPrice: 30_000 },
      { destinationId: mahalA, category: "accommodation", minPrice: 200_000 },
      { destinationId: mahalB, category: "transport", minPrice: 250_000 },
      { destinationId: mahalB, category: "food", minPrice: 25_000 },
      { destinationId: mahalB, category: "accommodation", minPrice: 200_000 },
      // Cheap category minimums discovered by aggregate SQL even if beyond first 10 alphabetical rows
      { destinationId: murahC, category: "transport", minPrice: 20_000 },
      { destinationId: murahC, category: "food", minPrice: 10_000 },
      { destinationId: murahC, category: "accommodation", minPrice: 100_000 },
    ]);

    listFacilities.mockResolvedValue({
      items: [
        {
          id: "fac-cheap-stay",
          destinationId: murahC,
          name: "Warung Hemat Gamma",
          category: "food",
          priceMin: 10_000,
          priceMax: 15_000,
          status: "published",
        },
      ],
      total: 12,
    } as never);

    const context = await aiRetrieval.build({
      rawText: "trip murah",
    });

    expect(minPricesByCategory).toHaveBeenCalledTimes(1);
    expect(minPricesByCategory).toHaveBeenCalledWith([mahalA, mahalB, murahC]);
    expect(listFacilities).toHaveBeenCalledTimes(1);
    expect(listFacilities).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      offset: 0,
      sort: "priceMin",
      order: "asc",
      destinationId: murahC,
      statuses: ["published"],
      publishedDestinationOnly: true,
    });
    expect(context.destinations.map((item) => item.id)).toEqual([murahC]);
    expect(context.destinations[0]?.estimatedCostPerPerson).toBe(130_000);
  });

  it("loads missing transport/accommodation categories when first 10 supports are all food", async () => {
    const foodHeavyId = "ffffffff-ffff-4fff-afff-000000000001";
    list.mockResolvedValue({
      items: [{ ...destination, id: foodHeavyId, name: "Bukit Kuliner" }],
      meta: {},
    } as never);

    minPricesByCategory.mockResolvedValueOnce([
      { destinationId: foodHeavyId, category: "food", minPrice: 10_000 },
      { destinationId: foodHeavyId, category: "transport", minPrice: 30_000 },
      {
        destinationId: foodHeavyId,
        category: "accommodation",
        minPrice: 160_000,
      },
    ]);

    const tenFoods = Array.from({ length: 10 }, (_, idx) => ({
      id: `food-${idx + 1}`,
      destinationId: foodHeavyId,
      name: `Warung ${idx + 1}`,
      category: "food",
      priceMin: 10_000 + idx * 500,
      priceMax: 15_000,
      status: "published",
    }));

    listFacilities
      .mockResolvedValueOnce({ items: tenFoods, total: 12 } as never)
      .mockResolvedValueOnce({
        items: [
          {
            id: "trans-1",
            destinationId: foodHeavyId,
            name: "Ojek Bukit",
            category: "transport",
            priceMin: 30_000,
            priceMax: 35_000,
            status: "published",
          },
        ],
        total: 1,
      } as never)
      .mockResolvedValueOnce({
        items: [
          {
            id: "stay-1",
            destinationId: foodHeavyId,
            name: "Homestay Bukit",
            category: "accommodation",
            priceMin: 160_000,
            priceMax: 180_000,
            status: "published",
          },
        ],
        total: 1,
      } as never);

    const context = await aiRetrieval.build({
      rawText: "trip murah",
    });

    expect(listFacilities).toHaveBeenCalledTimes(3);
    expect(context.supports).toHaveLength(10);
    const categories = new Set(context.supports.map((s) => s.category));
    expect(categories).toEqual(new Set(["food", "transport", "accommodation"]));
    expect(context.destinations[0]?.estimatedCostPerPerson).toBe(200_000);
  });

  it("ranks 9 day-trip budget destinations by dayCost rather than fullStayCost so Rp 20.000 day-trip candidate stays #1", async () => {
    const nineIds = Array.from(
      { length: 9 },
      (_, idx) => `aaaaaaaa-0000-4000-a000-00000000000${idx + 1}`,
    );
    const ninthDayCheapId = nineIds[8]!;
    list.mockResolvedValue({
      items: nineIds.map((id, idx) => ({
        ...destination,
        id,
        name: idx === 8 ? "Bukit Harian Super Hemat" : `Destinasi Stay ${idx + 1}`,
      })),
      meta: {},
    } as never);

    minPricesByCategory.mockResolvedValueOnce(
      nineIds.flatMap((id, idx) =>
        idx === 8
          ? [
              { destinationId: id, category: "food" as const, minPrice: 10_000 },
              { destinationId: id, category: "transport" as const, minPrice: 10_000 },
              {
                destinationId: id,
                category: "accommodation" as const,
                minPrice: 500_000,
              },
            ]
          : [
              { destinationId: id, category: "food" as const, minPrice: 20_000 },
              { destinationId: id, category: "transport" as const, minPrice: 20_000 },
              {
                destinationId: id,
                category: "accommodation" as const,
                minPrice: 50_000,
              },
            ],
      ),
    );

    const context = await aiRetrieval.build({
      budgetPerPerson: 750_000,
    });

    expect(context.destinations).toHaveLength(8);
    expect(context.destinations[0]?.id).toBe(ninthDayCheapId);
    expect(context.destinations[0]?.estimatedCostPerPerson).toBe(20_000);
  });

  it("assigns estimatedCostPerPerson null and ranks behind day-priced stops when a destination only has accommodation in day-trip mode", async () => {
    const stayOnlyId = "12121212-1212-4121-a121-000000000001";
    const dayPricedId = "12121212-1212-4121-a121-000000000002";

    list.mockResolvedValue({
      items: [
        { ...destination, id: stayOnlyId, name: "Bukit Hanya Inap" },
        { ...destination, id: dayPricedId, name: "Gunung Punya Harian" },
      ],
      meta: {},
    } as never);

    minPricesByCategory.mockResolvedValueOnce([
      { destinationId: stayOnlyId, category: "accommodation", minPrice: 200_000 },
      { destinationId: dayPricedId, category: "food", minPrice: 30_000 },
      { destinationId: dayPricedId, category: "transport", minPrice: 60_000 },
    ]);

    const context = await aiRetrieval.build({
      budgetPerPerson: 750_000,
    });

    expect(context.destinations.map((item) => item.id)).toEqual([
      dayPricedId,
      stayOnlyId,
    ]);
    expect(context.destinations[0]?.estimatedCostPerPerson).toBe(90_000);
    expect(context.destinations[1]?.estimatedCostPerPerson).toBeNull();
  });

  it("normalizes casual 'kegunung' prefix and selects mountain destinations without waterfall", async () => {
    const waterfallId = "13131313-1313-4131-a131-000000000001";
    const mountainId = "13131313-1313-4131-a131-000000000002";

    list.mockResolvedValue({
      items: [
        {
          ...destination,
          id: waterfallId,
          name: "Air Terjun Tumpak Sewu",
          terrain: ["Air Terjun"],
        },
        {
          ...destination,
          id: mountainId,
          name: "Gunung Uji",
          terrain: ["Gunung"],
        },
      ],
      meta: {},
    } as never);

    const context = await aiRetrieval.build({
      rawText: "aku pengen kegunung",
    });

    expect(context.queryMatched).toBe(true);
    expect(context.unmatchedTerms).toEqual([]);
    expect(context.preference.terrains).toEqual(["Gunung"]);
    expect(context.destinations.map((item) => item.name)).toEqual([
      "Gunung Uji",
    ]);
  });

  it("treats 'suatu' and 'lah' as stopwords without substring bias on 'adalah'", async () => {
    const bromoId = "14141414-1414-4141-a141-000000000001";
    const merbabuId = "14141414-1414-4141-a141-000000000002";

    list.mockResolvedValue({
      items: [
        {
          ...destination,
          id: merbabuId,
          name: "Gunung Merbabu",
          description: "Gunung ini adalah tujuan pendakian favorit",
          terrain: ["Gunung"],
        },
        {
          ...destination,
          id: bromoId,
          name: "Gunung Bromo",
          description: "Kaldera luas di Jawa Timur",
          terrain: ["Gunung"],
        },
      ],
      meta: {},
    } as never);

    const context = await aiRetrieval.build({
      rawText: "aku pengen ke suatu gunung lah",
    });

    expect(context.queryMatched).toBe(true);
    expect(context.unmatchedTerms).toEqual([]);
    expect(context.preference.terrains).toEqual(["Gunung"]);
    expect(context.destinations.map((item) => item.name)).toEqual([
      "Gunung Bromo",
      "Gunung Merbabu",
    ]);
  });

  it("ranks explicitly named Bukit Moko #1 and same-province companions ahead of distant Bukit destinations", async () => {
    const sentaniId = "15151515-1515-4151-a151-000000000001";
    const kawahPutihId = "15151515-1515-4151-a151-000000000002";
    const bukitMokoId = "15151515-1515-4151-a151-000000000003";

    list.mockResolvedValue({
      items: [
        {
          ...destination,
          id: sentaniId,
          name: "Danau Sentani",
          terrain: ["Bukit", "Danau"],
          location: { province: "Papua", regency: "Jayapura" },
        },
        {
          ...destination,
          id: kawahPutihId,
          name: "Kawah Putih",
          terrain: ["Kawah"],
          location: { province: "Jawa Barat", regency: "Bandung" },
        },
        {
          ...destination,
          id: bukitMokoId,
          name: "Bukit Moko",
          terrain: ["Bukit"],
          location: { province: "Jawa Barat", regency: "Bandung" },
        },
      ],
      meta: {},
    } as never);

    const context = await aiRetrieval.build({
      rawText: "aku pengen ke bukit moko",
    });

    expect(context.queryMatched).toBe(true);
    expect(context.unmatchedTerms).toEqual([]);
    expect(context.preference.terrains).toBeUndefined();
    expect(context.destinations.map((item) => item.name)).toEqual([
      "Bukit Moko",
      "Kawah Putih",
      "Danau Sentani",
    ]);
  });

  it("infers stay and transport needs from text even when mobile sends false defaults", async () => {
    for (const rawText of [
      "mau menginap di homestay pakai ojek",
      "menginap di homestay pakai ojek",
      "sewa jeep dan pesan homestay pake ojek",
    ]) {
      const inferred = await aiRetrieval.build({
        rawText,
        needsAccommodation: false,
        needsTransport: false,
      });

      expect(inferred.preference.needsAccommodation).toBe(true);
      expect(inferred.preference.needsTransport).toBe(true);
      expect(inferred.queryMatched).toBe(true);
      expect(inferred.unmatchedTerms).toEqual([]);
    }

    const unchanged = await aiRetrieval.build({
      rawText: "gunung",
      needsAccommodation: false,
      needsTransport: false,
    });

    expect(unchanged.preference.needsAccommodation).toBe(false);
    expect(unchanged.preference.needsTransport).toBe(false);
  });

  it("handles conversational budget/interrogative prompts without false unmatched warnings", async () => {
    const limitedWithCheap = await aiRetrieval.build({
      rawText: "budgetku terbatas ada rekomendasi trip murah?",
    });
    expect(limitedWithCheap.preference.preferLowCost).toBe(true);
    expect(limitedWithCheap.queryMatched).toBe(true);
    expect(limitedWithCheap.unmatchedTerms).toEqual([]);

    const limitedWhere = await aiRetrieval.build({
      rawText: "budgetku terbatas kemana ya",
    });
    expect(limitedWhere.preference.preferLowCost).toBe(true);
    expect(limitedWhere.queryMatched).toBe(true);
    expect(limitedWhere.unmatchedTerms).toEqual([]);

    const oneMillion = await aiRetrieval.build({
      rawText: "budgetku 1 juta kemana ya enaknya",
    });
    expect(oneMillion.preference.budgetPerPerson).toBe(1_000_000);
    expect(oneMillion.queryMatched).toBe(true);
    expect(oneMillion.unmatchedTerms).toEqual([]);
  });

  it("matches short destination names and ranks explicit destinations #1 even without pricing under preferLowCost", async () => {
    const bromoId = "21212121-2121-4121-a121-000000000001";
    const bukitMokoId = "21212121-2121-4121-a121-000000000002";
    const prauId = "21212121-2121-4121-a121-000000000003";
    const mahalId = "21212121-2121-4121-a121-000000000004";

    list.mockResolvedValue({
      items: [
        {
          ...destination,
          id: bromoId,
          name: "Gunung Bromo",
          terrain: ["Gunung"],
          location: { province: "Jawa Timur", regency: "Probolinggo" },
        },
        {
          ...destination,
          id: bukitMokoId,
          name: "Bukit Moko",
          terrain: ["Bukit"],
          location: { province: "Jawa Barat", regency: "Bandung" },
        },
        {
          ...destination,
          id: prauId,
          name: "Gunung Prau",
          terrain: ["Gunung"],
          location: { province: "Jawa Tengah", regency: "Wonosobo" },
        },
        {
          ...destination,
          id: mahalId,
          name: "Gunung Mahal",
          terrain: ["Gunung"],
          location: { province: "Jawa Tengah", regency: "Magelang" },
        },
      ],
      meta: {},
    } as never);

    const shortBromo = await aiRetrieval.build({
      rawText: "aku pengen ke bromo",
    });
    expect(shortBromo.queryMatched).toBe(true);
    expect(shortBromo.unmatchedTerms).toEqual([]);
    expect(shortBromo.destinations[0]?.name).toBe("Gunung Bromo");

    minPricesByCategory.mockResolvedValueOnce([
      // Bukit Moko intentionally has no pricing data
      { destinationId: prauId, category: "food", minPrice: 15_000 },
      { destinationId: prauId, category: "transport", minPrice: 25_000 },
      { destinationId: prauId, category: "accommodation", minPrice: 150_000 },
      { destinationId: mahalId, category: "transport", minPrice: 350_000 },
    ]);

    const cheapMoko = await aiRetrieval.build({
      rawText: "trip murah ke bukit moko",
    });
    expect(cheapMoko.queryMatched).toBe(true);
    expect(cheapMoko.unmatchedTerms).toEqual([]);
    expect(cheapMoko.preference.preferLowCost).toBe(true);
    expect(cheapMoko.relaxed).toEqual([]);
    expect(cheapMoko.destinations[0]?.name).toBe("Bukit Moko");
    expect(cheapMoko.destinations.map((item) => item.name)).toEqual([
      "Bukit Moko",
      "Gunung Prau",
    ]);
  });

  it("maps 'aku mau mendaki' to Gunung terrain without relaxing filters when catalog lacks Hiking activity", async () => {
    list.mockResolvedValue({
      items: [
        {
          ...destination,
          id: "23232323-2323-4232-a232-000000000001",
          name: "Gunung Semeru",
          terrain: ["Gunung"],
          activities: ["Trekking"],
        },
        {
          ...destination,
          id: "23232323-2323-4232-a232-000000000002",
          name: "Pantai Kuta",
          terrain: ["Pantai"],
          activities: ["Surfing"],
        },
      ],
      meta: {},
    } as never);

    const context = await aiRetrieval.build({
      rawText: "aku mau mendaki",
    });

    expect(context.queryMatched).toBe(true);
    expect(context.unmatchedTerms).toEqual([]);
    expect(context.relaxed).toEqual([]);
    expect(context.preference.terrains).toEqual(["Gunung"]);
    expect(context.preference.activities).toBeUndefined();
    expect(context.destinations.map((item) => item.name)).toEqual([
      "Gunung Semeru",
    ]);
  });

  it("keeps queryMatched true and populates geography/access fields for explicit destinationIds", async () => {
    list.mockResolvedValue({
      items: [
        {
          ...destination,
          id: "23232323-2323-4232-a232-000000000003",
          name: "Gunung Bromo",
          location: {
            province: "Jawa Timur",
            regency: "Probolinggo",
            district: null,
            latitude: -7.9425,
            longitude: 112.953,
            accessPoint: "Cemoro Lawang",
          },
          access: {
            description: "Lewat jalur Probolinggo",
            transport: ["Jeep", "Motor"],
            duration: "2 jam",
            distanceKm: 45,
          },
        },
      ],
      meta: {},
    } as never);

    const context = await aiRetrieval.build({
      destinationIds: ["23232323-2323-4232-a232-000000000003"],
      rawText: "Gunung Bromo",
      durationDays: 2,
    });

    expect(context.queryMatched).toBe(true);
    expect(context.unmatchedTerms).toEqual([]);
    expect(context.destinations[0]?.latitude).toBe(-7.9425);
    expect(context.destinations[0]?.longitude).toBe(112.953);
    expect(context.destinations[0]?.accessPoint).toBe("Cemoro Lawang");
    expect(context.destinations[0]?.accessTransport).toEqual(["Jeep", "Motor"]);
  });
});
