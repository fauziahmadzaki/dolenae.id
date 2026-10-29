import { describe, expect, it } from "vitest";
import { buildDeterministicItinerary } from "../../src/services/ai/itinerary.service";
import type { AiContext } from "../../src/services/ai/retrieval.service";
import { validateAiPayload } from "../../src/services/ai/validate";

const destinationId = "11111111-1111-4111-a111-111111111111";
const routeId = "22222222-2222-4222-a222-222222222222";
const supportId = "33333333-3333-4333-a333-333333333333";

const context: AiContext = {
  preference: {},
  destinations: [
    {
      id: destinationId,
      name: "Gunung Uji",
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
};

describe("AI itinerary", () => {
  it("builds a grounded deterministic itinerary", () => {
    const result = buildDeterministicItinerary(context, {
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

  it("warns when no destination matches", () => {
    const result = buildDeterministicItinerary(
      { ...context, destinations: [], supports: [], routes: [] },
      { durationDays: 2 },
    );

    expect(result.itinerary.days).toHaveLength(0);
    expect(result.briefing.warnings[0]).toContain("Tidak ada destinasi");
  });

  it("drops unknown IDs from an LLM payload", () => {
    const result = validateAiPayload(
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
    const item = result!.itinerary.days[0]?.items[0];
    expect(item?.destinationId).toBeNull();
    expect(item?.routeId).toBeNull();
    expect(result!.sources).toHaveLength(0);
    expect(result!.engine).toBe("gemini");
  });

  it("rejects a payload without valid days", () => {
    const result = validateAiPayload(
      { itinerary: { title: "x", summary: "y", days: [] } },
      context,
      "gemini",
    );
    expect(result).toBeNull();
  });
});
