import { describe, expect, it } from "vitest";
import { aiService } from "../../src/services/ai/AiService";
import { itineraryService } from "../../src/services/ai/ItineraryService";
import { aiPayloadValidator } from "../../src/services/ai/AiPayloadValidator";
import type { AiContext } from "../../src/types/ai";

const destinationId = "11111111-1111-4111-a111-111111111111";
const routeId = "22222222-2222-4222-a222-222222222222";
const supportId = "33333333-3333-4333-a333-333333333333";

const context: AiContext = {
  preference: {},
  destinations: [
    {
      id: destinationId,
      name: "Gunung Uji",
      slug: "gunung-uji",
      tagline: "Puncak uji",
      images: ["https://example.test/gunung.jpg"],
      province: "Jawa Timur",
      regency: "Kabupaten Uji",
      difficulty: "menengah",
      elevationMeters: 2300,
      entryFee: 30000,
      bestSeason: ["Juni - Juli"],
      guideRequired: false,
      facilities: ["Toilet", "Warung"],
      description: "Destinasi uji.",
      categories: ["Gunung", "Hiking"],
    },
  ],
  supports: [
    {
      id: supportId,
      destinationId,
      name: "Homestay Uji",
      category: "accommodation",
      priceMin: 200000,
      priceMax: 250000,
      priceLabel: "Rp 200.000",
      locationLabel: "Dekat basecamp",
      verified: true,
    },
  ],
  routes: [
    {
      id: routeId,
      destinationId,
      name: "Jalur Uji",
      surface: "setapak",
      status: "terverifikasi",
      totalDistanceKm: 2.5,
      totalGainMeters: 300,
      estimatedDurationMinutes: 90,
    },
  ],
  relaxed: [],
  queryMatched: true,
  unmatchedTerms: [],
  invalidDestinationIds: [],
};

describe("AI itinerary", () => {
  it("builds a grounded deterministic itinerary", () => {
    const result = itineraryService.build(context, {
      durationDays: 1,
      needsAccommodation: true,
    });

    expect(result.engine).toBe("deterministic");
    expect(result.itinerary.days).toHaveLength(1);
    expect(result.itinerary.days[0]?.items[0]?.destinationId).toBe(
      destinationId,
    );
    expect(result.itinerary.days[0]?.items[0]?.routeId).toBe(routeId);
    expect(result.briefing.grounded.join(" ")).toContain("2.5 km");
    expect(result.briefing.general.length).toBeGreaterThan(0);
    expect(result.sources.map((source) => source.type)).toContain("route");
    expect(result.sources.map((source) => source.type)).toContain("support");
  });

  it("schedules every explicitly selected destination across the days", () => {
    const secondId = "44444444-4444-4444-a444-444444444444";
    const thirdId = "55555555-5555-4555-a555-555555555555";
    const first = context.destinations[0]!;
    const selectedContext: AiContext = {
      ...context,
      preference: { destinationIds: [destinationId, secondId, thirdId] },
      destinations: [
        first,
        { ...first, id: secondId, name: "Gunung Dua", slug: "gunung-dua" },
        { ...first, id: thirdId, name: "Gunung Tiga", slug: "gunung-tiga" },
      ],
    };

    const result = itineraryService.build(selectedContext, {
      destinationIds: [destinationId, secondId, thirdId],
      durationDays: 2,
    });

    expect(result.itinerary.days).toHaveLength(2);
    expect(
      result.itinerary.days.flatMap((day) =>
        day.items.map((item) => item.destinationName),
      ),
    ).toEqual(["Gunung Uji", "Gunung Dua", "Gunung Tiga"]);
    expect(result.itinerary.days[0]?.items).toHaveLength(2);
  });

  it("builds a complete cost-aware checklist without filling the budget", () => {
    const result = itineraryService.build(context, {
      durationDays: 1,
      budgetPerPerson: 1500000,
      needsAccommodation: true,
      needsTransport: true,
    });

    expect(result.checklistItems.length).toBeGreaterThanOrEqual(12);
    expect(result.checklist).toEqual(
      result.checklistItems.map((item) => item.name),
    );
    expect(
      result.checklistItems.find((item) => item.name.includes("Tiket masuk"))
        ?.estimatedCost,
    ).toBe(30000);
    expect(
      result.checklistItems.some((item) => item.category === "biaya"),
    ).toBe(true);
    expect(
      result.checklistItems.find((item) => item.name.includes("Jaket"))
        ?.estimatedCost,
    ).toBeNull();
    const total = result.checklistItems.reduce(
      (sum, item) => sum + (item.estimatedCost ?? 0),
      0,
    );
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(1500000);
  });

  it("adds flight and ferry alternatives when the origin province differs", () => {
    const result = itineraryService.build(context, {
      durationDays: 1,
      budgetPerPerson: 1500000,
      originProvince: "Jawa Barat",
    });
    const alternatives = result.checklistItems.filter(
      (item) => item.alternativeGroup === "transport-antarprovinsi",
    );

    expect(alternatives).toHaveLength(2);
    expect(
      alternatives.find((item) => item.name.includes("pesawat"))?.selected,
    ).toBe(true);
    expect(
      alternatives.find((item) => item.name.includes("kapal"))?.selected,
    ).toBe(false);
  });

  it("does not add interprovince alternatives when the province matches", () => {
    const result = itineraryService.build(context, {
      durationDays: 1,
      budgetPerPerson: 1500000,
      originProvince: "Jawa Timur",
    });

    expect(
      result.checklistItems.some(
        (item) => item.alternativeGroup === "transport-antarprovinsi",
      ),
    ).toBe(false);
  });

  it("warns when no destination matches", () => {
    const result = itineraryService.build(
      { ...context, destinations: [], supports: [], routes: [] },
      { durationDays: 2 },
    );

    expect(result.itinerary.days).toHaveLength(0);
    expect(result.briefing.warnings[0]).toContain("Tidak ada destinasi");
  });

  it("warns when filters were relaxed", () => {
    const result = itineraryService.build(
      { ...context, relaxed: ["aktivitas", "medan"] },
      { durationDays: 1 },
    );

    expect(result.briefing.warnings.join(" ")).toContain(
      "Filter aktivitas dilonggarkan",
    );
    expect(result.briefing.warnings.join(" ")).toContain(
      "Filter medan dilonggarkan",
    );
  });

  it("adds a not-found notice and warning", () => {
    const result = itineraryService.build(context, { durationDays: 1 });
    const withNotice = aiService.attachQueryNotice(result, {
      ...context,
      queryMatched: false,
      unmatchedTerms: ["everest"],
    });

    expect(withNotice.notice).toContain("belum ada di Dolenae");
    expect(withNotice.briefing.warnings.join(" ")).toContain("everest");
  });

  it("builds card-ready recommendations from the grounded context", () => {
    const payload = itineraryService.build(context, { durationDays: 1 });
    const cards = itineraryService.buildRecommendations(
      { ...context, preference: { needsAccommodation: true } },
      payload,
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      destinationId,
      name: "Gunung Uji",
      slug: "gunung-uji",
      rank: 1,
      score: 95,
      difficulty: "menengah",
    });
    expect(cards[0]?.reasons.join(" ")).toContain("Jalur Uji");
    expect(cards[0]?.reasons.join(" ")).toContain("Homestay Uji");
  });

  it("marks recommendation reasons as alternatives when the query misses", () => {
    const payload = itineraryService.build(context, { durationDays: 1 });
    const cards = itineraryService.buildRecommendations(
      { ...context, queryMatched: false, unmatchedTerms: ["everest"] },
      payload,
    );

    expect(cards[0]?.reasons.join(" ")).toContain("everest");
  });

  it("drops unknown IDs from an LLM payload", () => {
    const result = aiPayloadValidator.validate(
      {
        itinerary: {
          title: "Trip Uji",
          summary: "Ringkasan",
          days: [
            {
              day: 1,
              title: "Hari 1",
              items: [
                {
                  destinationId,
                  destinationName: "Gunung Uji",
                  routeId,
                  activity: "Eksplor",
                },
                {
                  destinationId: "99999999-9999-4999-a999-999999999999",
                  destinationName: "Tempat Halusinasi",
                  routeId: "88888888-8888-4888-a888-888888888888",
                  activity: "Eksplor",
                },
              ],
            },
          ],
        },
        briefing: { grounded: [], general: ["Info umum"], warnings: [] },
        checklist: ["Jaket"],
      },
      context,
      "gemini",
      "gemini-uji",
    );

    expect(result).not.toBeNull();
    const [known, unknown] = result!.itinerary.days[0]!.items;
    expect(known?.destinationId).toBe(destinationId);
    expect(known?.routeId).toBe(routeId);
    expect(unknown?.destinationId).toBeNull();
    expect(unknown?.routeId).toBeNull();
    expect(result!.sources).toHaveLength(2);
    expect(result!.engine).toBe("gemini");
  });

  it("rejects a payload that drops an explicitly selected destination", () => {
    const secondId = "44444444-4444-4444-a444-444444444444";
    const selectedContext: AiContext = {
      ...context,
      preference: { destinationIds: [destinationId, secondId] },
      destinations: [
        ...context.destinations,
        {
          ...context.destinations[0]!,
          id: secondId,
          name: "Gunung Dua",
          slug: "gunung-dua",
        },
      ],
    };

    const result = aiPayloadValidator.validate(
      {
        itinerary: {
          title: "Trip Uji",
          summary: "Ringkasan",
          days: [
            {
              day: 1,
              title: "Hari 1",
              items: [
                {
                  destinationId,
                  destinationName: "Gunung Uji",
                  activity: "Eksplor",
                },
              ],
            },
          ],
        },
        briefing: { grounded: [], general: [], warnings: [] },
        checklist: [],
      },
      selectedContext,
      "gemini",
    );

    expect(result).toBeNull();
  });

  it("keeps detailed AI checklist items with costs", () => {
    const result = aiPayloadValidator.validate(
      {
        itinerary: {
          title: "Trip Uji",
          summary: "Ringkasan",
          days: [
            {
              day: 1,
              title: "Hari 1",
              items: [
                {
                  destinationId,
                  destinationName: "Gunung Uji",
                  activity: "Eksplor",
                },
              ],
            },
          ],
        },
        briefing: { grounded: [], general: [], warnings: [] },
        checklist: [],
        checklistItems: [
          {
            name: "Tiket masuk Gunung Uji",
            category: "biaya",
            estimatedCost: "Rp 30.000",
            note: "Per orang",
            isRequired: true,
          },
          {
            name: "Air minum 2L",
            category: "perlengkapan",
            estimatedCost: 20000,
            isRequired: false,
          },
        ],
      },
      context,
      "gemini",
    );

    expect(result).not.toBeNull();
    expect(result!.checklist).toEqual([
      "Tiket masuk Gunung Uji",
      "Air minum 2L",
    ]);
    expect(result!.checklistItems[0]).toMatchObject({
      name: "Tiket masuk Gunung Uji",
      category: "biaya",
      estimatedCost: 30000,
      note: "Per orang",
      isRequired: true,
    });
    expect(result!.checklistItems[1]?.isRequired).toBe(false);
  });

  it("rejects an ungrounded payload when destinations exist", () => {
    const result = aiPayloadValidator.validate(
      {
        itinerary: {
          title: "Trip Uji",
          summary: "Ringkasan",
          days: [
            {
              day: 1,
              title: "Hari 1",
              items: [
                {
                  destinationName: "Tempat Halusinasi",
                  activity: "Eksplor",
                },
              ],
            },
          ],
        },
        briefing: { grounded: [], general: [], warnings: [] },
        checklist: [],
      },
      context,
      "gemini",
    );

    expect(result).toBeNull();
  });

  it("rejects a payload without valid days", () => {
    const result = aiPayloadValidator.validate(
      { itinerary: { title: "x", summary: "y", days: [] } },
      context,
      "gemini",
    );
    expect(result).toBeNull();
  });
});
