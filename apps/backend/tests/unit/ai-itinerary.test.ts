import { describe, expect, it, vi } from "vitest";
import { AppConfig } from "../../src/config/AppConfig";
import { settingsService } from "../../src/services/SettingsService";
import { aiService } from "../../src/services/ai/AiService";
import { geminiService } from "../../src/services/ai/GeminiService";
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
      bestSeason: ["Juni - Juli"],
      guideRequired: false,
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
      result.checklistItems.some((item) => item.name.startsWith("Tiket masuk")),
    ).toBe(false);
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

  it("highlights lowest facility costs without forcing beginner difficulty on low-cost queries", () => {
    const beginnerId = "66666666-6666-4666-a666-666666666666";
    const lowCostContext: AiContext = {
      preference: {
        rawText: "coba buatkan trip yang murah",
        preferLowCost: true,
      },
      destinations: [
        {
          id: beginnerId,
          name: "Bukit Murah",
          slug: "bukit-murah",
          tagline: "Panorama terjangkau",
          images: ["https://example.test/bukit.jpg"],
          province: "Jawa Tengah",
          regency: "Wonosobo",
          difficulty: "ramah-pemula",
          elevationMeters: 1850,
          bestSeason: ["Juni"],
          guideRequired: false,
          description: "Bukit hemat biaya.",
          categories: ["Bukit", "Hiking"],
          estimatedCostPerPerson: 190_000,
          costSummary: "Estimasi mulai Rp 190.000/orang",
        },
      ],
      supports: [
        {
          id: "sup-mahal",
          destinationId: beginnerId,
          name: "Jeep Mahal",
          category: "transport",
          priceMin: 650_000,
          priceMax: 650_000,
          priceLabel: "Rp 650.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-ojek",
          destinationId: beginnerId,
          name: "Ojek Murah",
          category: "transport",
          priceMin: 25_000,
          priceMax: 30_000,
          priceLabel: "Rp 25.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-warung",
          destinationId: beginnerId,
          name: "Warung Hemat",
          category: "food",
          priceMin: 15_000,
          priceMax: 25_000,
          priceLabel: "Rp 15.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-inap",
          destinationId: beginnerId,
          name: "Basecamp Hemat",
          category: "accommodation",
          priceMin: 150_000,
          priceMax: 200_000,
          priceLabel: "Rp 150.000",
          locationLabel: null,
          verified: true,
        },
      ],
      routes: [],
      relaxed: [],
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
    };

    const payload = itineraryService.build(
      lowCostContext,
      lowCostContext.preference,
    );
    const cards = itineraryService.buildRecommendations(lowCostContext, payload);
    const attached = aiService.attachQueryNotice(payload, lowCostContext);

    expect(payload.itinerary.title).toContain("hemat");
    expect(payload.itinerary.summary).toContain("terjangkau");
    expect(attached.notice).toBeUndefined();
    expect(cards).toHaveLength(1);
    expect(cards[0]?.reasons[0]).toContain("Warung Hemat");
    expect(cards[0]?.reasons[0]).toContain("Ojek Murah");
    expect(cards[0]?.reasons[0]).toContain("Basecamp Hemat");
    expect(cards[0]?.reasons[0]).toContain("Rp 190.000");
    expect(cards[0]?.reasons[0]).not.toContain("Jeep Mahal");
    expect(cards[0]?.reasons.join(" ")).not.toContain("kesulitan Ramah pemula");
  });

  it("falls back across active gemini 3.5+ models on 404 without legacy 1.x/2.x calls", async () => {
    const configSpy = vi.spyOn(AppConfig, "load").mockReturnValue({
      aiTimeoutMs: 5000,
    } as never);
    const settingsSpy = vi
      .spyOn(settingsService, "getGeminiConfig")
      .mockResolvedValue({
        apiKey: "AIzaTestKey",
        model: "gemini-3.5-flash-lite",
        source: "db",
      });
    const fetchSpy = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { message: "models/gemini-3.5-flash-lite not found" },
          }),
          { status: 404, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: "Koneksi berhasil." }] } }],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchSpy);

    try {
      const res = await geminiService.testConnection("Halo");
      expect(res.model).toBe("gemini-3.5-flash");
      expect(res.text).toBe("Koneksi berhasil.");
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      const calledUrls = fetchSpy.mock.calls.map((call) => String(call[0]));
      expect(calledUrls[0]).toContain("gemini-3.5-flash-lite");
      expect(calledUrls[1]).toContain("gemini-3.5-flash");
      for (const url of calledUrls) {
        expect(url).not.toMatch(/gemini-(?:1\.|2\.|3\.0)/i);
      }
    } finally {
      configSpy.mockRestore();
      settingsSpy.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it("skips deprecated gemini-2.5-flash and retired gemini-3-pro-preview configs to use gemini-3.5-flash-lite first", async () => {
    const configSpy = vi.spyOn(AppConfig, "load").mockReturnValue({
      aiTimeoutMs: 5000,
    } as never);
    const settingsSpy = vi
      .spyOn(settingsService, "getGeminiConfig")
      .mockResolvedValueOnce({
        apiKey: "AIzaTestKey",
        model: "gemini-2.5-flash",
        source: "db",
      })
      .mockResolvedValueOnce({
        apiKey: "AIzaTestKey",
        model: "gemini-3-pro-preview",
        source: "db",
      });
    const fetchSpy = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: "Aktif 3.5+." }] } }],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: "Aktif 3.5+." }] } }],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchSpy);

    try {
      const first = await geminiService.testConnection("Halo");
      const second = await geminiService.testConnection("Halo");
      expect(first.model).toBe("gemini-3.5-flash-lite");
      expect(second.model).toBe("gemini-3.5-flash-lite");
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      for (const call of fetchSpy.mock.calls) {
        const url = String(call[0]);
        expect(url).toContain("gemini-3.5-flash-lite");
        expect(url).not.toMatch(/gemini-(?:1\.|2\.|3(?:\.[0-4]|-))/i);
      }
    } finally {
      configSpy.mockRestore();
      settingsSpy.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it("never leaks raw provider or network error messages on admin Gemini calls", async () => {
    const configSpy = vi.spyOn(AppConfig, "load").mockReturnValue({
      aiTimeoutMs: 5000,
    } as never);
    const settingsSpy = vi
      .spyOn(settingsService, "getGeminiConfig")
      .mockResolvedValue({
        apiKey: "AIzaTestKey",
        model: "gemini-3.5-flash-lite",
        source: "db",
      });
    const fetchSpy = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { message: "SECRET_PROVIDER_REASON_DO_NOT_LEAK" },
          }),
          { status: 403, headers: { "content-type": "application/json" } },
        ),
      )
      .mockRejectedValueOnce(new Error("SECRET_NETWORK_STACK_DO_NOT_LEAK"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { message: "SECRET_MODELS_ERROR_DO_NOT_LEAK" },
          }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
      )
      .mockRejectedValueOnce(new Error("SECRET_LIST_EXCEPTION_DO_NOT_LEAK"));
    vi.stubGlobal("fetch", fetchSpy);

    try {
      await expect(geminiService.testConnection("Halo")).rejects.toMatchObject({
        code: "AI_TEST_FAILED",
        details: { reason: "HTTP 403" },
      });
      await expect(geminiService.testConnection("Halo")).rejects.toMatchObject({
        code: "AI_TEST_FAILED",
        details: { reason: "Permintaan ke layanan Gemini gagal" },
      });
      await expect(geminiService.listModels()).rejects.toMatchObject({
        code: "AI_MODELS_FAILED",
        details: { reason: "HTTP 401" },
      });
      await expect(geminiService.listModels()).rejects.toMatchObject({
        code: "AI_MODELS_FAILED",
        details: { reason: "Permintaan ke layanan Gemini gagal" },
      });
    } finally {
      configSpy.mockRestore();
      settingsSpy.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it("orders budget recommendation cards deterministically by lowest cost even if Gemini day 1 picks a pricier stop", () => {
    const mahalId = "77777777-7777-4777-a777-777777777771";
    const murahId = "77777777-7777-4777-a777-777777777772";
    const budgetContext: AiContext = {
      preference: { rawText: "trip murah", preferLowCost: true },
      destinations: [
        {
          id: murahId,
          name: "Gunung Murah",
          slug: "gunung-murah",
          tagline: "Hemat",
          images: [],
          province: "Jawa Tengah",
          regency: "Wonosobo",
          difficulty: "menengah",
          elevationMeters: 2000,
          bestSeason: ["Juni"],
          guideRequired: false,
          description: "Hemat.",
          categories: ["Gunung"],
          estimatedCostPerPerson: 130_000,
        },
        {
          id: mahalId,
          name: "Bukit Agak Mahal",
          slug: "bukit-mahal",
          tagline: "Biasa",
          images: [],
          province: "Jawa Timur",
          regency: "Malang",
          difficulty: "ramah-pemula",
          elevationMeters: 1200,
          bestSeason: ["Juli"],
          guideRequired: false,
          description: "Agak mahal.",
          categories: ["Bukit"],
          estimatedCostPerPerson: 200_000,
        },
      ],
      supports: [
        {
          id: "sup-mahal-stay",
          destinationId: mahalId,
          name: "Homestay Agak Mahal",
          category: "accommodation",
          priceMin: 200_000,
          priceMax: 250_000,
          priceLabel: "Rp 200.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-murah-stay",
          destinationId: murahId,
          name: "Basecamp Hemat",
          category: "accommodation",
          priceMin: 100_000,
          priceMax: 120_000,
          priceLabel: "Rp 100.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-murah-trans",
          destinationId: murahId,
          name: "Ojek Hemat",
          category: "transport",
          priceMin: 20_000,
          priceMax: 25_000,
          priceLabel: "Rp 20.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-murah-food",
          destinationId: murahId,
          name: "Warung Hemat",
          category: "food",
          priceMin: 10_000,
          priceMax: 15_000,
          priceLabel: "Rp 10.000",
          locationLabel: null,
          verified: true,
        },
      ],
      routes: [],
      relaxed: [],
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
    };

    const payloadFromGemini = {
      itinerary: {
        title: "Rencana hemat",
        summary: "Ringkasan",
        days: [
          {
            day: 1,
            title: "Hari 1",
            items: [
              {
                destinationId: mahalId,
                destinationName: "Bukit Agak Mahal",
                routeId: null,
                activity: "Eksplor",
              },
            ],
          },
          {
            day: 2,
            title: "Hari 2",
            items: [
              {
                destinationId: murahId,
                destinationName: "Gunung Murah",
                routeId: null,
                activity: "Eksplor",
              },
            ],
          },
        ],
      },
      briefing: { grounded: [], general: [], warnings: [] },
      checklist: [],
      checklistItems: [],
      sources: [],
      engine: "gemini" as const,
      model: "gemini-3.5-flash-lite",
    };

    const cards = itineraryService.buildRecommendations(
      budgetContext,
      payloadFromGemini,
    );

    expect(cards.map((card) => card.name)).toEqual([
      "Gunung Murah",
      "Bukit Agak Mahal",
    ]);
    expect(cards[0]?.reasons[0]).toContain("Rp 130.000");
    expect(cards[1]?.reasons[0]).toContain("Rp 200.000");
  });

  it("keeps estimatedCostPerPerson consistent with card cost text when 10 cheap food items crowd supports, and breaks equal ties by id", () => {
    const foodHeavyId = "88888888-8888-4888-a888-000000000001";
    const cheaperId = "88888888-8888-4888-a888-000000000002";
    const tieIdLow = "88888888-8888-4888-a888-0000000000aa";
    const tieIdHigh = "88888888-8888-4888-a888-0000000000zz";

    const tenFoodSupports = Array.from({ length: 10 }, (_, idx) => ({
      id: `food-heavy-${idx + 1}`,
      destinationId: foodHeavyId,
      name: `Warung Padat ${idx + 1}`,
      category: "food",
      priceMin: 10_000,
      priceMax: 15_000,
      priceLabel: "Rp 10.000",
      locationLabel: null,
      verified: true,
    }));

    const rankingContext: AiContext = {
      preference: { rawText: "trip murah", preferLowCost: true },
      destinations: [
        {
          id: foodHeavyId,
          name: "Destinasi Food Padat",
          slug: "dest-food-padat",
          tagline: null,
          images: [],
          province: "Jawa Barat",
          regency: "Bandung",
          difficulty: "ramah-pemula",
          elevationMeters: 1100,
          bestSeason: ["Juli"],
          guideRequired: false,
          description: "Padat kuliner.",
          categories: ["Bukit"],
          estimatedCostPerPerson: 200_000,
        },
        {
          id: cheaperId,
          name: "Destinasi Lebih Hemat",
          slug: "dest-lebih-hemat",
          tagline: null,
          images: [],
          province: "Jawa Tengah",
          regency: "Magelang",
          difficulty: "menengah",
          elevationMeters: 1500,
          bestSeason: ["Juni"],
          guideRequired: false,
          description: "Hemat.",
          categories: ["Gunung"],
          estimatedCostPerPerson: 150_000,
        },
      ],
      supports: [
        ...tenFoodSupports,
        {
          id: "sup-cheaper-stay",
          destinationId: cheaperId,
          name: "Basecamp 150k",
          category: "accommodation",
          priceMin: 150_000,
          priceMax: 170_000,
          priceLabel: "Rp 150.000",
          locationLabel: null,
          verified: true,
        },
      ],
      routes: [],
      relaxed: [],
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
    };

    const geminiSwappedPayload = {
      itinerary: {
        title: "Rencana hemat",
        summary: "Ringkasan",
        days: [
          {
            day: 1,
            title: "Hari 1",
            items: [
              {
                destinationId: foodHeavyId,
                destinationName: "Destinasi Food Padat",
                routeId: null,
                activity: "Eksplor",
              },
            ],
          },
          {
            day: 2,
            title: "Hari 2",
            items: [
              {
                destinationId: cheaperId,
                destinationName: "Destinasi Lebih Hemat",
                routeId: null,
                activity: "Eksplor",
              },
            ],
          },
        ],
      },
      briefing: { grounded: [], general: [], warnings: [] },
      checklist: [],
      checklistItems: [],
      sources: [],
      engine: "gemini" as const,
      model: "gemini-3.5-flash-lite",
    };

    const ranked = itineraryService.buildRecommendations(
      rankingContext,
      geminiSwappedPayload,
    );
    expect(ranked.map((card) => card.destinationId)).toEqual([
      cheaperId,
      foodHeavyId,
    ]);
    expect(ranked[1]?.reasons[0]).toContain("Rp 200.000");
    expect(ranked[1]?.reasons[0]).not.toContain("total mulai Rp 10.000");

    const tieContext: AiContext = {
      preference: { rawText: "trip murah", preferLowCost: true },
      destinations: [
        {
          id: tieIdHigh,
          name: "Bukit Kembar",
          slug: "bukit-kembar-z",
          tagline: null,
          images: [],
          province: "Jawa Timur",
          regency: "Malang",
          difficulty: "ramah-pemula",
          elevationMeters: 1000,
          bestSeason: ["Juni"],
          guideRequired: false,
          description: "Z.",
          categories: ["Bukit"],
          estimatedCostPerPerson: 150_000,
        },
        {
          id: tieIdLow,
          name: "Bukit Kembar",
          slug: "bukit-kembar-a",
          tagline: null,
          images: [],
          province: "Jawa Timur",
          regency: "Malang",
          difficulty: "ramah-pemula",
          elevationMeters: 1000,
          bestSeason: ["Juni"],
          guideRequired: false,
          description: "A.",
          categories: ["Bukit"],
          estimatedCostPerPerson: 150_000,
        },
      ],
      supports: [],
      routes: [],
      relaxed: [],
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
    };

    const reverseOrderPayload = {
      ...geminiSwappedPayload,
      itinerary: {
        title: "Rencana",
        summary: "Ringkasan",
        days: [
          {
            day: 1,
            title: "Hari 1",
            items: [
              {
                destinationId: tieIdHigh,
                destinationName: "Bukit Kembar",
                routeId: null,
                activity: "Eksplor",
              },
            ],
          },
          {
            day: 2,
            title: "Hari 2",
            items: [
              {
                destinationId: tieIdLow,
                destinationName: "Bukit Kembar",
                routeId: null,
                activity: "Eksplor",
              },
            ],
          },
        ],
      },
    };

    const tieCards = itineraryService.buildRecommendations(
      tieContext,
      reverseOrderPayload,
    );
    expect(tieCards.map((card) => card.destinationId)).toEqual([
      tieIdLow,
      tieIdHigh,
    ]);
  });

  it("ranks day-trip budget recommendations #1 using dayCost facilities and excludes accommodation when needsAccommodation is unset", () => {
    const dayCheapId = "99999999-9999-4999-a999-000000000001";
    const dayPricierId = "99999999-9999-4999-a999-000000000002";

    const dayBudgetContext: AiContext = {
      preference: { budgetPerPerson: 750_000 },
      destinations: [
        {
          id: dayCheapId,
          name: "Bukit Harian Hemat",
          slug: "bukit-harian-hemat",
          tagline: null,
          images: [],
          province: "Jawa Tengah",
          regency: "Semarang",
          difficulty: "ramah-pemula",
          elevationMeters: 900,
          bestSeason: ["Juli"],
          guideRequired: false,
          description: "Hemat harian.",
          categories: ["Bukit"],
          estimatedCostPerPerson: 20_000,
        },
        {
          id: dayPricierId,
          name: "Gunung Stay Murah",
          slug: "gunung-stay-murah",
          tagline: null,
          images: [],
          province: "Jawa Timur",
          regency: "Batu",
          difficulty: "menengah",
          elevationMeters: 1600,
          bestSeason: ["Juni"],
          guideRequired: false,
          description: "Penginapan murah.",
          categories: ["Gunung"],
          estimatedCostPerPerson: 40_000,
        },
      ],
      supports: [
        {
          id: "sup-day-cheap-food",
          destinationId: dayCheapId,
          name: "Warung Pagi",
          category: "food",
          priceMin: 10_000,
          priceMax: 15_000,
          priceLabel: "Rp 10.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-day-cheap-trans",
          destinationId: dayCheapId,
          name: "Ojek Pagi",
          category: "transport",
          priceMin: 10_000,
          priceMax: 15_000,
          priceLabel: "Rp 10.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-day-cheap-stay",
          destinationId: dayCheapId,
          name: "Villa Mewah 500k",
          category: "accommodation",
          priceMin: 500_000,
          priceMax: 600_000,
          priceLabel: "Rp 500.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-day-pricier-food",
          destinationId: dayPricierId,
          name: "Warung Batu",
          category: "food",
          priceMin: 20_000,
          priceMax: 25_000,
          priceLabel: "Rp 20.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-day-pricier-trans",
          destinationId: dayPricierId,
          name: "Ojek Batu",
          category: "transport",
          priceMin: 20_000,
          priceMax: 25_000,
          priceLabel: "Rp 20.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-day-pricier-stay",
          destinationId: dayPricierId,
          name: "Homestay 50k",
          category: "accommodation",
          priceMin: 50_000,
          priceMax: 60_000,
          priceLabel: "Rp 50.000",
          locationLabel: null,
          verified: true,
        },
      ],
      routes: [],
      relaxed: [],
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
    };

    const swappedPayload = {
      itinerary: {
        title: "Rencana harian",
        summary: "Ringkasan",
        days: [
          {
            day: 1,
            title: "Hari 1",
            items: [
              {
                destinationId: dayPricierId,
                destinationName: "Gunung Stay Murah",
                routeId: null,
                activity: "Eksplor",
              },
            ],
          },
          {
            day: 2,
            title: "Hari 2",
            items: [
              {
                destinationId: dayCheapId,
                destinationName: "Bukit Harian Hemat",
                routeId: null,
                activity: "Eksplor",
              },
            ],
          },
        ],
      },
      briefing: { grounded: [], general: [], warnings: [] },
      checklist: [],
      checklistItems: [],
      sources: [],
      engine: "gemini" as const,
      model: "gemini-3.5-flash-lite",
    };

    const cards = itineraryService.buildRecommendations(
      dayBudgetContext,
      swappedPayload,
    );

    expect(cards.map((card) => card.destinationId)).toEqual([
      dayCheapId,
      dayPricierId,
    ]);
    expect(cards[0]?.reasons[0]).toContain("Rp 20.000");
    expect(cards[0]?.reasons[0]).not.toContain("Villa Mewah 500k");
  });

  it("ranks accommodation-only destinations behind day-priced ones without showing Homestay or synthetic Rp 70.000 in day-trip mode", () => {
    const stayOnlyId = "abababab-abab-4aba-aaba-000000000001";
    const dayPricedId = "abababab-abab-4aba-aaba-000000000002";

    const mixedContext: AiContext = {
      preference: { budgetPerPerson: 750_000 },
      destinations: [
        {
          id: stayOnlyId,
          name: "Bukit Hanya Inap",
          slug: "bukit-hanya-inap",
          tagline: null,
          images: [],
          province: "Jawa Barat",
          regency: "Garut",
          difficulty: "ramah-pemula",
          elevationMeters: 1100,
          bestSeason: ["Juni"],
          guideRequired: false,
          description: "Hanya homestay.",
          categories: ["Bukit"],
          estimatedCostPerPerson: null,
        },
        {
          id: dayPricedId,
          name: "Gunung Punya Harian",
          slug: "gunung-punya-harian",
          tagline: null,
          images: [],
          province: "Jawa Tengah",
          regency: "Boyolali",
          difficulty: "menengah",
          elevationMeters: 1700,
          bestSeason: ["Juli"],
          guideRequired: false,
          description: "Ada warung & ojek.",
          categories: ["Gunung"],
          estimatedCostPerPerson: 90_000,
        },
      ],
      supports: [
        {
          id: "sup-only-stay",
          destinationId: stayOnlyId,
          name: "Homestay Anggun",
          category: "accommodation",
          priceMin: 200_000,
          priceMax: 250_000,
          priceLabel: "Rp 200.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-day-food",
          destinationId: dayPricedId,
          name: "Warung Lereng",
          category: "food",
          priceMin: 30_000,
          priceMax: 40_000,
          priceLabel: "Rp 30.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-day-trans",
          destinationId: dayPricedId,
          name: "Ojek Lereng",
          category: "transport",
          priceMin: 60_000,
          priceMax: 70_000,
          priceLabel: "Rp 60.000",
          locationLabel: null,
          verified: true,
        },
      ],
      routes: [],
      relaxed: [],
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
    };

    const swappedPayload = {
      itinerary: {
        title: "Rencana harian",
        summary: "Ringkasan",
        days: [
          {
            day: 1,
            title: "Hari 1",
            items: [
              {
                destinationId: stayOnlyId,
                destinationName: "Bukit Hanya Inap",
                routeId: null,
                activity: "Eksplor",
              },
            ],
          },
          {
            day: 2,
            title: "Hari 2",
            items: [
              {
                destinationId: dayPricedId,
                destinationName: "Gunung Punya Harian",
                routeId: null,
                activity: "Eksplor",
              },
            ],
          },
        ],
      },
      briefing: { grounded: [], general: [], warnings: [] },
      checklist: [],
      checklistItems: [],
      sources: [],
      engine: "gemini" as const,
      model: "gemini-3.5-flash-lite",
    };

    const cards = itineraryService.buildRecommendations(
      mixedContext,
      swappedPayload,
    );

    expect(cards.map((card) => card.destinationId)).toEqual([
      dayPricedId,
      stayOnlyId,
    ]);
    expect(cards[0]?.reasons[0]).toContain("Rp 90.000");
    const stayOnlyReasons = cards[1]?.reasons.join(" ") ?? "";
    expect(stayOnlyReasons).not.toContain("Homestay");
    expect(stayOnlyReasons).not.toContain("Rp 70.000");
    expect(stayOnlyReasons).not.toContain("Rp 200.000");
  });

  it("includes destination names, cost breakdown, and low-cost phrasing in deterministic summary", () => {
    const destAId = "cdcdcdcd-cdcd-4cdc-acdc-000000000001";
    const destBId = "cdcdcdcd-cdcd-4cdc-acdc-000000000002";

    const richContext: AiContext = {
      preference: {
        rawText: "budgetku 1 juta kemana ya enaknya",
        budgetPerPerson: 1_000_000,
      },
      destinations: [
        {
          ...context.destinations[0]!,
          id: destAId,
          name: "Gunung Bromo",
          slug: "gunung-bromo",
          province: "Jawa Timur",
          estimatedCostPerPerson: 95_000,
        },
        {
          ...context.destinations[0]!,
          id: destBId,
          name: "Gunung Prau",
          slug: "gunung-prau",
          province: "Jawa Tengah",
          estimatedCostPerPerson: 40_000,
        },
      ],
      supports: [
        {
          id: "sup-a-food",
          destinationId: destAId,
          name: "Warung Bromo",
          category: "food",
          priceMin: 35_000,
          priceMax: 50_000,
          priceLabel: "Rp 35.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-a-trans",
          destinationId: destAId,
          name: "Ojek Bromo",
          category: "transport",
          priceMin: 60_000,
          priceMax: 80_000,
          priceLabel: "Rp 60.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-b-food",
          destinationId: destBId,
          name: "Warung Prau",
          category: "food",
          priceMin: 15_000,
          priceMax: 25_000,
          priceLabel: "Rp 15.000",
          locationLabel: null,
          verified: true,
        },
        {
          id: "sup-b-trans",
          destinationId: destBId,
          name: "Ojek Prau",
          category: "transport",
          priceMin: 25_000,
          priceMax: 30_000,
          priceLabel: "Rp 25.000",
          locationLabel: null,
          verified: true,
        },
      ],
      routes: [],
      relaxed: [],
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
    };

    const budgetResult = itineraryService.build(richContext, {
      durationDays: 2,
      budgetPerPerson: 1_000_000,
    });
    expect(budgetResult.itinerary.summary).toContain("Gunung Bromo");
    expect(budgetResult.itinerary.summary).toContain("Gunung Prau");
    expect(budgetResult.itinerary.summary).toContain("Rp 1.000.000");
    expect(budgetResult.itinerary.summary).toContain("Rp 40.000");

    const lowCostResult = itineraryService.build(
      {
        ...richContext,
        preference: { rawText: "budgetku terbatas", preferLowCost: true },
      },
      { durationDays: 2, preferLowCost: true },
    );
    expect(lowCostResult.itinerary.title).toContain("hemat");
    expect(lowCostResult.itinerary.summary).toContain("terjangkau");
    expect(lowCostResult.itinerary.summary).toContain("Gunung Bromo");
    expect(lowCostResult.itinerary.summary).toContain("Gunung Prau");
    expect(lowCostResult.itinerary.summary).toContain("Rp 40.000");
  });

  it("keeps explicitly named destinations at card rank #1 under low-cost queries while sorting remaining cards by lowest cost", () => {
    const mokoId = "dededede-dede-4ded-aded-000000000001";
    const bromoId = "dededede-dede-4ded-aded-000000000002";
    const pindulId = "dededede-dede-4ded-aded-000000000003";
    const sewuId = "dededede-dede-4ded-aded-000000000004";
    const prauId = "dededede-dede-4ded-aded-000000000005";

    const baseCandidates = [
      {
        ...context.destinations[0]!,
        id: pindulId,
        name: "Goa Pindul",
        slug: "goa-pindul",
        province: "DI Yogyakarta",
        estimatedCostPerPerson: 190_000,
      },
      {
        ...context.destinations[0]!,
        id: sewuId,
        name: "Air Terjun Tumpak Sewu",
        slug: "tumpak-sewu",
        province: "Jawa Timur",
        estimatedCostPerPerson: 195_000,
      },
      {
        ...context.destinations[0]!,
        id: prauId,
        name: "Gunung Prau",
        slug: "gunung-prau",
        province: "Jawa Tengah",
        estimatedCostPerPerson: 210_000,
      },
    ];

    const mokoContext: AiContext = {
      preference: {
        rawText: "trip murah ke bukit moko",
        preferLowCost: true,
      },
      destinations: [
        {
          ...context.destinations[0]!,
          id: mokoId,
          name: "Bukit Moko",
          slug: "bukit-moko",
          province: "Jawa Barat",
          estimatedCostPerPerson: null,
          isExplicit: true,
        },
        ...baseCandidates,
      ],
      supports: [],
      routes: [],
      relaxed: [],
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
    };
    const mokoPayload = itineraryService.build(
      mokoContext,
      mokoContext.preference,
    );
    const mokoCards = itineraryService.buildRecommendations(
      mokoContext,
      mokoPayload,
    );
    expect(mokoCards.map((card) => card.name)).toEqual([
      "Bukit Moko",
      "Goa Pindul",
      "Air Terjun Tumpak Sewu",
    ]);

    const bromoContext: AiContext = {
      preference: {
        rawText: "trip murah ke bromo",
        preferLowCost: true,
      },
      destinations: [
        ...baseCandidates,
        {
          ...context.destinations[0]!,
          id: bromoId,
          name: "Gunung Bromo",
          slug: "gunung-bromo",
          province: "Jawa Timur",
          estimatedCostPerPerson: 925_000,
        },
      ],
      supports: [
        {
          id: "sup-bromo-jeep",
          destinationId: bromoId,
          name: "Jeep Bromo",
          category: "transport",
          priceMin: 650_000,
          priceMax: 750_000,
          priceLabel: "Rp 650.000",
          locationLabel: null,
          verified: true,
        },
      ],
      routes: [],
      relaxed: [],
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
    };
    const bromoPayload = itineraryService.build(
      bromoContext,
      bromoContext.preference,
    );
    const bromoCards = itineraryService.buildRecommendations(
      bromoContext,
      bromoPayload,
    );
    expect(bromoCards.map((card) => card.name)).toEqual([
      "Gunung Bromo",
      "Goa Pindul",
      "Air Terjun Tumpak Sewu",
    ]);
  });
});
