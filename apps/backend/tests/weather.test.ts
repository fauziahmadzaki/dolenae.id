import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/db/DatabaseClient", () => ({
  database: {
    getDb: vi.fn(),
    getPool: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createApp } from "../src/app";
import { aiRepository } from "../src/repositories/AiRepository";
import { destinationService } from "../src/services/DestinationService";
import {
  BmkgService,
  bmkgService,
  parseStrictIsoDateMs,
} from "../src/services/BmkgService";
import { regionService } from "../src/services/RegionService";
import { aiService } from "../src/services/ai/AiService";
import { geminiService } from "../src/services/ai/GeminiService";
import { aiRetrieval } from "../src/services/ai/RetrievalService";
import type { PublicDestinationDetail } from "../src/types/destination";
import type { DestinationGeoTarget } from "../src/types/weather";
import { NotFoundError } from "../src/utils/errors";

const FIXED_NOW = Date.parse("2026-11-27T05:00:00.000Z"); // 12:00 WIB

const DIENG_TARGET: DestinationGeoTarget = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Dataran Tinggi Dieng",
  province: "Jawa Tengah",
  district: "Kejajar",
  latitude: -7.2105,
  longitude: 109.9142,
};

function makeForecastJson(tempNow = 19, baseMs = FIXED_NOW): string {
  const wibDate = (offsetDays: number, hour: number) => {
    const d = new Date(baseMs + 7 * 3600_000 + offsetDays * 86_400_000);
    const yyyyMmDd = d.toISOString().slice(0, 10);
    return `${yyyyMmDd} ${String(hour).padStart(2, "0")}:00:00`;
  };
  return JSON.stringify({
    data: [
      {
        lokasi: { desa: "Dieng Kulon" },
        cuaca: [
          [
            {
              local_datetime: wibDate(0, 12),
              t: tempNow,
              hu: 78,
              weather: 3,
              weather_desc: "Berawan",
              ws: 12.4,
              wd: "SE",
            },
            {
              local_datetime: wibDate(0, 18),
              t: tempNow - 4,
              hu: 88,
              weather: 3,
              weather_desc: "Berawan",
              ws: 8.1,
              wd: "E",
            },
          ],
          [
            {
              local_datetime: wibDate(1, 12),
              t: 22,
              hu: 70,
              weather: 1,
              weather_desc: "Cerah Berawan",
              ws: 10.0,
              wd: "NE",
            },
          ],
          [
            {
              local_datetime: wibDate(2, 12),
              t: 20,
              hu: 82,
              weather: 60,
              weather_desc: "Hujan Ringan",
              ws: 15.2,
              wd: "SW",
            },
          ],
        ],
      },
    ],
  });
}

function makeRssXml(links: string[]): string {
  const items = links
    .map(
      (link, idx) => `
    <item>
      <title>Peringatan Dini Cuaca Provinsi Jawa Tengah #${idx + 1}</title>
      <link>${link}</link>
      <pubDate>Fri, 27 Nov 2026 04:30:00 GMT</pubDate>
      <description>Hujan lebat disertai petir di wilayah Jawa Tengah</description>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?><rss><channel>${items}</channel></rss>`;
}

function makeCapXml(opts: {
  identifier?: string;
  status?: string;
  msgType?: string;
  scope?: string;
  severity?: string;
  urgency?: string;
  effective?: string | null;
  expires?: string | null;
  polygon?: string;
  areaDesc?: string;
  description?: string;
}): string {
  const effectiveTag =
    opts.effective === null
      ? ""
      : `<effective>${opts.effective ?? "2026-11-27T04:30:00+00:00"}</effective>`;
  const expiresTag =
    opts.expires === null
      ? ""
      : `<expires>${opts.expires ?? "2026-11-27T08:00:00+00:00"}</expires>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
  <alert>
    <identifier>${opts.identifier ?? "BMKG-CAP-001"}</identifier>
    <status>${opts.status ?? "Actual"}</status>
    <msgType>${opts.msgType ?? "Alert"}</msgType>
    <scope>${opts.scope ?? "Public"}</scope>
    <info>
      <event>Hujan Lebat Disertai Petir</event>
      <urgency>${opts.urgency ?? "Immediate"}</urgency>
      <severity>${opts.severity ?? "Severe"}</severity>
      ${effectiveTag}
      ${expiresTag}
      <headline>Peringatan Dini Cuaca Ekstrem Jawa Tengah</headline>
      <description>${opts.description ?? "Berpotensi terjadi hujan sedang-lebat disertai kilat dan angin kencang."}</description>
      <area>
        <areaDesc>${opts.areaDesc ?? "Kabupaten Wonosobo, Kecamatan Kejajar"}</areaDesc>
        ${opts.polygon ? `<polygon>${opts.polygon}</polygon>` : ""}
      </area>
    </info>
  </alert>`;
}

function makeResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

describe("BMKG Open Data Integration", () => {
  beforeEach(() => {
    bmkgService.setFetcher(undefined);
    bmkgService.resetCaches();
  });

  afterEach(() => {
    bmkgService.setFetcher(undefined);
    bmkgService.resetCaches();
    vi.restoreAllMocks();
  });

  it("RegionService.resolveAdm4Candidates returns valid Kemendagri adm4 codes for Dieng & Bromo", () => {
    const dieng = regionService.resolveAdm4Candidates(-7.2105, 109.9142, 3);
    const bromo = regionService.resolveAdm4Candidates(-7.9425, 112.953, 3);

    expect(dieng.length).toBe(3);
    expect(bromo.length).toBe(3);
    for (const code of [...dieng, ...bromo]) {
      expect(code).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/);
    }
    expect(new Set(dieng).size).toBe(3);
  });

  it("parses 3-day forecast, falls back across adm4 candidates on 404, caches 3h, and single-flights concurrent calls", async () => {
    const candidates = regionService.resolveAdm4Candidates(
      DIENG_TARGET.latitude!,
      DIENG_TARGET.longitude!,
      3,
    );
    const forecastUrls: string[] = [];
    let currentTime = FIXED_NOW;

    const mockFetch: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("/publik/prakiraan-cuaca")) {
        forecastUrls.push(url);
        if (url.includes(candidates[0]!)) {
          return makeResponse("Not found", 404);
        }
        return makeResponse(makeForecastJson(19), 200);
      }
      if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
        return makeResponse(makeRssXml([]), 200);
      }
      return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
    };

    const service = new BmkgService({
      fetch: mockFetch,
      now: () => currentTime,
    });

    const [first, second] = await Promise.all([
      service.getDestinationWeather(DIENG_TARGET),
      service.getDestinationWeather(DIENG_TARGET),
    ]);

    expect(first.available).toBe(true);
    expect(first.adm4Code).toBe(candidates[1]);
    expect(first.attribution).toBe("Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)");
    expect(first.current?.temperatureC).toBe(19);
    expect(first.daily).toHaveLength(3);
    expect(first.daily[0]).toMatchObject({
      date: "2026-11-27",
      dayLabel: "Hari ini",
      tempMinC: 15,
      tempMaxC: 19,
    });
    expect(first.daily[1]?.dayLabel).toBe("Besok");
    expect(first.daily[2]?.dayLabel).toBe("Lusa");

    // Single-flight deduplicated the two concurrent calls into 1 attempt on candidate[0] + 1 on candidate[1]
    expect(forecastUrls).toHaveLength(2);
    expect(second.adm4Code).toBe(candidates[1]);

    // Within 25m: both negative (30m) and positive (3h) caches hit
    currentTime += 25 * 60 * 1000;
    await service.getDestinationWeather(DIENG_TARGET);
    expect(forecastUrls).toHaveLength(2);

    // At 2h: negative cache on candidate[0] expired (30m) so it retries once, while candidate[1] hits 3h cache
    currentTime += 95 * 60 * 1000;
    await service.getDestinationWeather(DIENG_TARGET);
    expect(forecastUrls).toHaveLength(3);
  });

  it("validates CAP SSRF strictly, filters expired alerts, and matches point-in-polygon hits and misses", async () => {
    const requestedUrls: string[] = [];
    const capHitUrl = "https://www.bmkg.go.id/alerts/nowcast/id/JTG_hit_alert.xml";
    const capMissUrl = "https://www.bmkg.go.id/alerts/nowcast/id/JTG_miss_alert.xml";
    const capExpiredUrl = "https://www.bmkg.go.id/alerts/nowcast/id/JTG_exp_alert.xml";

    const mockFetch: typeof fetch = async (input) => {
      const url = String(input);
      requestedUrls.push(url);
      if (url.includes("/publik/prakiraan-cuaca")) {
        return makeResponse(makeForecastJson(), 200);
      }
      if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
        return makeResponse(
          makeRssXml([
            "http://www.bmkg.go.id/alerts/nowcast/id/insecure_alert.xml", // http rejected
            "https://evil.example.com/alerts/nowcast/id/ssrf_alert.xml", // foreign host rejected
            "https://www.bmkg.go.id/alerts/nowcast/id/../secret_alert.xml", // traversal rejected
            "https://www.bmkg.go.id/alerts/nowcast/id/query_alert.xml?x=1", // query rejected
            capHitUrl,
            capMissUrl,
            capExpiredUrl,
          ]),
          200,
        );
      }
      if (url === capHitUrl) {
        // Polygon surrounding Dieng (-7.2105, 109.9142)
        return makeResponse(
          makeCapXml({
            identifier: "CAP-HIT",
            severity: "Extreme",
            polygon: "-7.3,109.8 -7.1,109.8 -7.1,110.0 -7.3,110.0 -7.3,109.8",
          }),
          200,
        );
      }
      if (url === capMissUrl) {
        // Polygon far away in East Java
        return makeResponse(
          makeCapXml({
            identifier: "CAP-MISS",
            polygon: "-8.1,112.8 -7.8,112.8 -7.8,113.1 -8.1,113.1 -8.1,112.8",
            areaDesc: "Kabupaten Probolinggo",
          }),
          200,
        );
      }
      if (url === capExpiredUrl) {
        return makeResponse(
          makeCapXml({
            identifier: "CAP-EXPIRED",
            expires: "2026-11-27T04:00:00+00:00", // before FIXED_NOW
            polygon: "-7.3,109.8 -7.1,109.8 -7.1,110.0 -7.3,110.0 -7.3,109.8",
          }),
          200,
        );
      }
      return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
    };

    const service = new BmkgService({ fetch: mockFetch, now: () => FIXED_NOW });
    const weather = await service.getDestinationWeather(DIENG_TARGET);

    expect(requestedUrls.some((u) => u.includes("evil.example.com"))).toBe(false);
    expect(requestedUrls.some((u) => u.startsWith("http://"))).toBe(false);
    expect(requestedUrls.some((u) => u.includes("secret_alert.xml"))).toBe(false);
    expect(requestedUrls.some((u) => u.includes("?x=1"))).toBe(false);

    expect(weather.alerts).toHaveLength(1);
    expect(weather.alerts[0]?.severity).toBe("danger");
    expect(weather.alerts[0]?.kind).toBe("weather");
    expect(weather.alerts[0]?.source).toBe("BMKG");
  });

  it("rejects oversized (>512 KB) responses and degrades gracefully without fake data", async () => {
    const oversized = "x".repeat(520 * 1024);
    const mockFetch: typeof fetch = async () => makeResponse(oversized, 200);
    const service = new BmkgService({ fetch: mockFetch, now: () => FIXED_NOW });

    const weather = await service.getDestinationWeather(DIENG_TARGET);
    expect(weather.available).toBe(false);
    expect(weather.current).toBeNull();
    expect(weather.daily).toEqual([]);
    expect(weather.alerts).toEqual([]);
  });

  it("matches earthquakes within 150km & <=24h, ignores distant/old quakes, and flags real tsunami as danger", async () => {
    const recentIso = new Date(FIXED_NOW - 2 * 3600_000).toISOString();
    const oldIso = new Date(FIXED_NOW - 30 * 3600_000).toISOString();

    const mockFetch: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("/publik/prakiraan-cuaca")) {
        return makeResponse(makeForecastJson(), 200);
      }
      if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
        return makeResponse(makeRssXml([]), 200);
      }
      if (url.endsWith("autogempa.json")) {
        return makeResponse(
          JSON.stringify({
            Infogempa: {
              gempa: {
                DateTime: recentIso,
                Coordinates: "-7.30,109.90", // ~10 km from Dieng
                Magnitude: "4.8",
                Kedalaman: "12 km",
                Wilayah: "Pusat gempa di darat 10 km barat daya Dieng",
                Potensi: "Tidak berpotensi tsunami",
                Dirasakan: "III Wonosobo",
              },
            },
          }),
          200,
        );
      }
      if (url.endsWith("gempadirasakan.json")) {
        return makeResponse(
          JSON.stringify({
            Infogempa: {
              gempa: [
                {
                  DateTime: oldIso, // > 24h old -> ignored
                  Coordinates: "-7.25,109.90",
                  Magnitude: "5.2",
                  Kedalaman: "10 km",
                  Wilayah: "Gempa lama",
                  Potensi: "Tidak berpotensi tsunami",
                  Dirasakan: "IV Wonosobo",
                },
                {
                  DateTime: recentIso, // > 150 km away in Papua -> ignored unless tsunami
                  Coordinates: "-2.50,140.70",
                  Magnitude: "5.8",
                  Kedalaman: "15 km",
                  Wilayah: "Jayapura",
                  Potensi: "Tidak berpotensi tsunami",
                  Dirasakan: "IV Jayapura",
                },
                {
                  DateTime: recentIso, // Real tsunami warning -> danger
                  Coordinates: "-8.80,110.20",
                  Magnitude: "6.9",
                  Kedalaman: "10 km",
                  Wilayah: "Samudera Hindia Selatan DIY",
                  Potensi: "Berpotensi tsunami untuk wilayah pesisir selatan Jawa",
                  Dirasakan: "V Yogyakarta",
                },
              ],
            },
          }),
          200,
        );
      }
      return makeResponse("{}", 404);
    };

    const service = new BmkgService({ fetch: mockFetch, now: () => FIXED_NOW });
    const weather = await service.getDestinationWeather(DIENG_TARGET);

    expect(weather.alerts).toHaveLength(2);
    expect(weather.alerts.find((a) => a.title.includes("M4.8"))?.severity).toBe("warning");
    expect(weather.alerts.find((a) => a.title.includes("M6.9"))?.severity).toBe("danger");
  });

  it("enforces global <=40 req/min outbound rate-limit budget", async () => {
    let fetchCount = 0;
    const mockFetch: typeof fetch = async (input) => {
      fetchCount += 1;
      const url = String(input);
      if (url.includes("/publik/prakiraan-cuaca")) {
        return makeResponse(makeForecastJson(), 200);
      }
      if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
        return makeResponse(makeRssXml([]), 200);
      }
      return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
    };

    const service = new BmkgService({ fetch: mockFetch, now: () => FIXED_NOW });
    // Trigger > 40 distinct destinations within 60s
    for (let i = 0; i < 45; i++) {
      await service.getDestinationWeather({
        ...DIENG_TARGET,
        id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
        latitude: -7.2 + i * 0.15,
        longitude: 109.9 + i * 0.15,
      });
    }
    expect(fetchCount).toBeLessThanOrEqual(40);
  });

  it("serves GET /api/destinations/:id/weather (200/400/404) and GET /api/weather/alerts with destination href", async () => {
    const app = createApp();
    const publishedDetail: PublicDestinationDetail = {
      id: DIENG_TARGET.id,
      name: DIENG_TARGET.name,
      slug: "dataran-tinggi-dieng",
      tagline: "Dataran tinggi berkabut",
      description: "Deskripsi",
      difficulty: "ramah-pemula",
      bestSeason: ["Juni"],
      tags: ["sunrise"],
      terrain: ["Dataran Tinggi"],
      activities: ["Camping"],
      location: {
        province: "Jawa Tengah",
        regency: "Wonosobo",
        district: "Kejajar",
        latitude: DIENG_TARGET.latitude,
        longitude: DIENG_TARGET.longitude,
        accessPoint: "Kejajar",
      },
      access: { description: null, transport: [], duration: null, distanceKm: null },
      elevationMeters: 2093,
      images: [],
      guideRequired: false,
      status: "published",
      verified: true,
      categoryIds: [],
      categories: [],
      facilities: {},
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    vi.spyOn(destinationService, "getById").mockImplementation(async (id) => {
      if (id === DIENG_TARGET.id) return publishedDetail;
      throw new NotFoundError("Destinasi tidak ditemukan");
    });
    vi.spyOn(destinationService, "listPublishedGeoTargets").mockResolvedValue([
      DIENG_TARGET,
    ]);

    vi.useFakeTimers({ now: FIXED_NOW, toFake: ["Date"] });
    const recentIso = new Date().toISOString();
    bmkgService.setFetcher(async (input) => {
      const url = String(input);
      if (url.includes("/publik/prakiraan-cuaca")) {
        return makeResponse(makeForecastJson(18, FIXED_NOW), 200);
      }
      if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
        return makeResponse(makeRssXml([]), 200);
      }
      if (url.endsWith("autogempa.json")) {
        return makeResponse(
          JSON.stringify({
            Infogempa: {
              gempa: {
                DateTime: recentIso,
                Coordinates: "-7.25,109.90",
                Magnitude: "4.4",
                Kedalaman: "10 km",
                Wilayah: "Wonosobo",
                Potensi: "Tidak berpotensi tsunami",
                Dirasakan: "III Wonosobo",
              },
            },
          }),
          200,
        );
      }
      return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
    });

    // 200 published destination
    const okRes = await request(app)
      .get(`/api/destinations/${DIENG_TARGET.id}/weather`)
      .expect(200);
    expect(okRes.body.data.available).toBe(true);
    expect(okRes.body.data.current.temperatureC).toBe(18);
    expect(okRes.body.data.alerts).toHaveLength(1);

    // 422 invalid UUID
    await request(app).get("/api/destinations/not-a-uuid/weather").expect(422);

    // 404 missing destination
    await request(app)
      .get("/api/destinations/22222222-2222-4222-8222-222222222222/weather")
      .expect(404);

    // 200 global alerts feed mapped to destination href
    const feedRes = await request(app).get("/api/weather/alerts").expect(200);
    expect(feedRes.body.data.attribution).toBe(
      "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)",
    );
    expect(feedRes.body.data.items).toHaveLength(1);
    expect(feedRes.body.data.items[0]).toMatchObject({
      kind: "earthquake",
      destinationId: DIENG_TARGET.id,
      href: `/destinations/${DIENG_TARGET.id}`,
      source: "BMKG",
    });
    expect(feedRes.body.data.items[0].body).toContain("Sumber: BMKG");
  });

  it("AiService.generate appends live BMKG alert to briefing.warnings and degrades cleanly on BMKG failure", async () => {
    vi.spyOn(aiRepository, "findRecent").mockResolvedValue(undefined);
    vi.spyOn(aiRepository, "countSince").mockResolvedValue(0);
    vi.spyOn(aiRepository, "save").mockResolvedValue(undefined as never);
    vi.spyOn(geminiService, "generate").mockResolvedValue(null);
    vi.spyOn(aiRetrieval, "build").mockResolvedValue({
      preference: { durationDays: 2 },
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
      relaxed: [],
      destinations: [
        {
          id: DIENG_TARGET.id,
          name: DIENG_TARGET.name,
          slug: "dataran-tinggi-dieng",
          tagline: "Dieng",
          images: [],
          province: "Jawa Tengah",
          regency: "Wonosobo",
          latitude: DIENG_TARGET.latitude,
          longitude: DIENG_TARGET.longitude,
          difficulty: "ramah-pemula",
          elevationMeters: 2093,
          bestSeason: ["Juni"],
          guideRequired: false,
          description: "Dataran tinggi",
          categories: ["Gunung"],
          isExplicit: true,
        },
      ],
      routes: [],
      supports: [],
    });

    const recentIso = new Date().toISOString();
    bmkgService.setFetcher(async (input) => {
      const url = String(input);
      if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
        return makeResponse(makeRssXml([]), 200);
      }
      if (url.endsWith("autogempa.json")) {
        return makeResponse(
          JSON.stringify({
            Infogempa: {
              gempa: {
                DateTime: recentIso,
                Coordinates: "-7.25,109.90",
                Magnitude: "4.6",
                Kedalaman: "10 km",
                Wilayah: "Wonosobo",
                Potensi: "Tidak berpotensi tsunami",
                Dirasakan: "III Wonosobo",
              },
            },
          }),
          200,
        );
      }
      return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
    });

    const withAlert = await aiService.generate(
      "11111111-1111-4111-a111-111111111111",
      { destinationIds: [DIENG_TARGET.id], durationDays: 2 },
    );
    expect(
      withAlert.briefing.warnings.some((w) => w.includes("Sumber: BMKG")),
    ).toBe(true);

    // Graceful degradation when BMKG fetch fails
    bmkgService.setFetcher(async () => {
      throw new Error("BMKG unreachable");
    });
    const withoutAlert = await aiService.generate(
      "11111111-1111-4111-a111-111111111111",
      { destinationIds: [DIENG_TARGET.id], durationDays: 2 },
    );
    expect(withoutAlert.itinerary.days.length).toBeGreaterThan(0);
  });

  it("cancels streaming body early once >512 KB without pulling remaining chunks", async () => {
    const nowMs = FIXED_NOW;
    const perResponsePulled: number[] = [];
    let cancelled = false;
    const chunkSize = 128 * 1024;

    const svc = new BmkgService({
      now: () => nowMs,
      fetch: async (input) => {
        const url = String(input);
        if (url.includes("/publik/prakiraan-cuaca")) {
          const idx = perResponsePulled.length;
          perResponsePulled.push(0);
          const stream = new ReadableStream<Uint8Array>({
            pull(controller) {
              perResponsePulled[idx] = (perResponsePulled[idx] ?? 0) + 1;
              if (perResponsePulled[idx]! > 20) {
                controller.close();
                return;
              }
              controller.enqueue(new Uint8Array(chunkSize).fill(65));
            },
            cancel() {
              cancelled = true;
            },
          });
          return new Response(stream, { status: 200 });
        }
        if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
          return makeResponse(makeRssXml([]), 200);
        }
        return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
      },
    });

    const res = await svc.getDestinationWeather(DIENG_TARGET);
    expect(res.available).toBe(false);
    expect(cancelled).toBe(true);
    expect(perResponsePulled.length).toBeGreaterThan(0);
    for (const count of perResponsePulled) {
      expect(count).toBeLessThan(20);
      expect(count).toBeLessThanOrEqual(6);
    }
  });

  it("purges expired CAP cache entries and enforces max 200 capacity", () => {
    let nowMs = FIXED_NOW;
    const svc = new BmkgService({ now: () => nowMs });
    const internal = svc as unknown as {
      capCache: Map<string, { value: unknown; expiresAt: number }>;
      setCapCache: (url: string, value: null, ttlMs: number) => void;
    };

    for (let i = 0; i < 205; i++) {
      internal.setCapCache(
        `https://www.bmkg.go.id/alerts/nowcast/id/item_${i}_alert.xml`,
        null,
        i < 10 ? 1000 : 600_000,
      );
    }
    expect(internal.capCache.size).toBe(200);

    nowMs += 2000;
    internal.setCapCache(
      "https://www.bmkg.go.id/alerts/nowcast/id/item_fresh_alert.xml",
      null,
      600_000,
    );
    expect(internal.capCache.size).toBe(196);
  });

  it("handles malformed unclosed CDATA and repeated '<' in linear O(n) time", async () => {
    const evilDescription = `${"<".repeat(25_000)}<![CDATA[unclosed payload ${"<a".repeat(5_000)}`;
    const capUrl = "https://www.bmkg.go.id/alerts/nowcast/id/evil_alert.xml";
    const svc = new BmkgService({
      now: () => FIXED_NOW,
      fetch: async (input) => {
        const url = String(input);
        if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
          return makeResponse(makeRssXml([capUrl]), 200);
        }
        if (url === capUrl) {
          return makeResponse(
            makeCapXml({
              identifier: "CAP-EVIL",
              description: evilDescription,
              areaDesc: "Kabupaten Wonosobo, Kecamatan Kejajar",
            }),
            200,
          );
        }
        return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
      },
    });

    const start = performance.now();
    const feed = await svc.getAlertsFeed([DIENG_TARGET]);
    const elapsedMs = performance.now() - start;
    expect(elapsedMs).toBeLessThan(250);
    expect(feed.items).toHaveLength(1);
  });

  it("rejects Exercise/Cancel/Restricted CAP alerts, malformed/missing expires, future effective, and invalid/empty coordinates", async () => {
    const urls = {
      exercise: "https://www.bmkg.go.id/alerts/nowcast/id/ex_alert.xml",
      cancel: "https://www.bmkg.go.id/alerts/nowcast/id/cancel_alert.xml",
      restricted: "https://www.bmkg.go.id/alerts/nowcast/id/rest_alert.xml",
      noExpires: "https://www.bmkg.go.id/alerts/nowcast/id/noexp_alert.xml",
      badExpires: "https://www.bmkg.go.id/alerts/nowcast/id/badexp_alert.xml",
      futureEff: "https://www.bmkg.go.id/alerts/nowcast/id/futeff_alert.xml",
      valid: "https://www.bmkg.go.id/alerts/nowcast/id/valid_alert.xml",
    };

    const svc = new BmkgService({
      now: () => FIXED_NOW,
      fetch: async (input) => {
        const url = String(input);
        if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
          return makeResponse(makeRssXml(Object.values(urls)), 200);
        }
        if (url === urls.exercise) {
          return makeResponse(makeCapXml({ identifier: "ex", status: "Exercise" }), 200);
        }
        if (url === urls.cancel) {
          return makeResponse(makeCapXml({ identifier: "cancel", msgType: "Cancel" }), 200);
        }
        if (url === urls.restricted) {
          return makeResponse(makeCapXml({ identifier: "rest", scope: "Restricted" }), 200);
        }
        if (url === urls.noExpires) {
          return makeResponse(makeCapXml({ identifier: "noexp", expires: null }), 200);
        }
        if (url === urls.badExpires) {
          return makeResponse(makeCapXml({ identifier: "badexp", expires: "not-a-date" }), 200);
        }
        if (url === urls.futureEff) {
          return makeResponse(
            makeCapXml({
              identifier: "futeff",
              effective: "2026-11-27T06:00:00+00:00",
            }),
            200,
          );
        }
        if (url === urls.valid) {
          return makeResponse(
            makeCapXml({
              identifier: "valid",
              polygon: "95,200 ,106.8 -7.20,109.90 -7.20,109.95 -7.25,109.95",
              areaDesc: "Kabupaten Wonosobo, Kecamatan Kejajar",
            }),
            200,
          );
        }
        if (url.endsWith("autogempa.json")) {
          return makeResponse(
            JSON.stringify({
              Infogempa: {
                gempa: [
                  {
                    DateTime: new Date(FIXED_NOW - 1000).toISOString(),
                    Coordinates: ",109.90",
                    Magnitude: "5.2",
                    Wilayah: "Blank lat",
                  },
                  {
                    DateTime: new Date(FIXED_NOW - 1000).toISOString(),
                    Coordinates: "95,200",
                    Magnitude: "5.2",
                    Wilayah: "Out of range",
                  },
                ],
              },
            }),
            200,
          );
        }
        return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
      },
    });

    const feed = await svc.getAlertsFeed([DIENG_TARGET]);
    expect(feed.items).toHaveLength(1);
    expect(feed.items[0]?.kind).toBe("weather");
  });

  it("covers published destinations beyond #100 in /api/weather/alerts and cached AiService enrichment", async () => {
    const beyond100: DestinationGeoTarget[] = Array.from({ length: 105 }, (_, i) => ({
      id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      name: i === 104 ? "Puncak Ke-105" : `Destinasi ${i + 1}`,
      province: i === 104 ? "Jawa Tengah" : "Bali",
      district: i === 104 ? "Kejajar" : "Ubud",
      latitude: i === 104 ? -7.2105 : -8.5,
      longitude: i === 104 ? 109.9142 : 115.2,
    }));
    const target105 = beyond100[104]!;

    vi.spyOn(destinationService, "listPublishedGeoTargets").mockResolvedValue(
      beyond100,
    );
    const findByIdsSpy = vi
      .spyOn(destinationService, "findPublishedGeoTargetsByIds")
      .mockResolvedValue([target105]);

    vi.useFakeTimers({ now: FIXED_NOW, toFake: ["Date"] });
    const recentIso = new Date().toISOString();
    bmkgService.setFetcher(async (input) => {
      const url = String(input);
      if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
        return makeResponse(makeRssXml([]), 200);
      }
      if (url.endsWith("autogempa.json")) {
        return makeResponse(
          JSON.stringify({
            Infogempa: {
              gempa: {
                DateTime: recentIso,
                Coordinates: "-7.25,109.90",
                Magnitude: "4.5",
                Kedalaman: "10 km",
                Wilayah: "Wonosobo",
                Potensi: "Tidak berpotensi tsunami",
              },
            },
          }),
          200,
        );
      }
      return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
    });

    const app = createApp();
    const feedRes = await request(app).get("/api/weather/alerts").expect(200);
    expect(feedRes.body.data.items).toHaveLength(1);
    expect(feedRes.body.data.items[0]?.destinationId).toBe(target105.id);

    // Cached AI path resolves target #105 via findPublishedGeoTargetsByIds
    vi.spyOn(aiRepository, "findRecent").mockResolvedValue({
      id: "cache-1",
      userId: "user-1",
      preferenceHash: "hash",
      resultJson: {
        summary: "Ringkasan",
        recommendations: [
          {
            destinationId: target105.id,
            name: target105.name,
            reason: "Cocok",
            highlights: [],
          },
        ],
        itinerary: { title: "Trip", days: [] },
        packingChecklist: [],
        briefing: { summary: "Aman", tips: [], warnings: [] },
        meta: {
          mode: "template",
          generatedAt: new Date().toISOString(),
          queryMatched: true,
        },
      },
      createdAt: new Date(),
    } as never);

    const aiRes = await aiService.generate("user-1", { durationDays: 2 });
    expect(findByIdsSpy).toHaveBeenCalledWith([target105.id]);
    expect(
      aiRes.briefing.warnings.some((w) => w.includes("Sumber: BMKG")),
    ).toBe(true);
  });

  it("AiService.generate stops waiting at 2000ms deadline without aborting shared upstream fetch", async () => {
    vi.spyOn(aiRepository, "findRecent").mockResolvedValue(undefined);
    vi.spyOn(aiRepository, "countSince").mockResolvedValue(0);
    vi.spyOn(aiRepository, "save").mockResolvedValue(undefined as never);
    vi.spyOn(geminiService, "generate").mockResolvedValue(null);
    vi.spyOn(aiRetrieval, "build").mockResolvedValue({
      preference: { durationDays: 2 },
      queryMatched: true,
      unmatchedTerms: [],
      invalidDestinationIds: [],
      relaxed: [],
      destinations: [
        {
          id: DIENG_TARGET.id,
          name: DIENG_TARGET.name,
          slug: "dataran-tinggi-dieng",
          tagline: "Dieng",
          images: [],
          province: "Jawa Tengah",
          regency: "Wonosobo",
          latitude: DIENG_TARGET.latitude,
          longitude: DIENG_TARGET.longitude,
          difficulty: "ramah-pemula",
          elevationMeters: 2093,
          bestSeason: ["Juni"],
          guideRequired: false,
          description: "Dataran tinggi",
          categories: ["Gunung"],
          isExplicit: true,
        },
      ],
      routes: [],
      supports: [],
    });

    let upstreamAborted = false;
    bmkgService.setFetcher(async (_input, init) => {
      init?.signal?.addEventListener(
        "abort",
        () => {
          upstreamAborted = true;
        },
        { once: true },
      );
      return new Promise<Response>((resolve) => {
        setTimeout(
          () => resolve(makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200)),
          2600,
        );
      });
    });

    const started = performance.now();
    const result = await aiService.generate(
      "11111111-1111-4111-a111-111111111111",
      { destinationIds: [DIENG_TARGET.id], durationDays: 2 },
    );
    const elapsedMs = performance.now() - started;
    expect(elapsedMs).toBeLessThan(2500);
    expect(upstreamAborted).toBe(false);
    expect(result.itinerary.days.length).toBeGreaterThan(0);
  }, 6000);

  it("cancels body on Content-Length > 512 KB and returns null without arrayBuffer() when body is null", async () => {
    let headerBodyCancelled = false;
    let arrayBufferCalled = false;
    let mode: "content-length" | "null-body" = "content-length";

    const svc = new BmkgService({
      now: () => FIXED_NOW,
      fetch: async () => {
        if (mode === "content-length") {
          const stream = new ReadableStream<Uint8Array>({
            cancel() {
              headerBodyCancelled = true;
            },
          });
          return new Response(stream, {
            status: 200,
            headers: { "content-length": String(600 * 1024) },
          });
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          body: null,
          arrayBuffer: async () => {
            arrayBufferCalled = true;
            return new ArrayBuffer(8);
          },
        } as unknown as Response;
      },
    });

    const clRes = await svc.getDestinationWeather(DIENG_TARGET);
    expect(clRes.available).toBe(false);
    expect(headerBodyCancelled).toBe(true);

    svc.resetCaches();
    mode = "null-body";
    const nullRes = await svc.getDestinationWeather(DIENG_TARGET);
    expect(nullRes.available).toBe(false);
    expect(arrayBufferCalled).toBe(false);
  });

  it("parseStrictIsoDateMs validates leap years, year 0000–0099, and rejects impossible dates/offsets", () => {
    expect(parseStrictIsoDateMs("2026-11-27T16:00:00Z")).toBe(
      Date.parse("2026-11-27T16:00:00Z"),
    );
    expect(parseStrictIsoDateMs("2026-11-27T23:00:00+07:00")).toBe(
      Date.parse("2026-11-27T16:00:00Z"),
    );
    expect(parseStrictIsoDateMs("2024-02-29T23:59:59+07:00")).toBe(
      Date.parse("2024-02-29T16:59:59Z"),
    );

    const yearZeroLeap = parseStrictIsoDateMs("0000-02-29T00:00:00Z");
    expect(yearZeroLeap).not.toBeNull();
    const d0 = new Date(yearZeroLeap!);
    expect(d0.getUTCFullYear()).toBe(0);
    expect(d0.getUTCMonth()).toBe(1);
    expect(d0.getUTCDate()).toBe(29);

    expect(parseStrictIsoDateMs("2026-02-29T12:00:00+07:00")).toBeNull();
    expect(parseStrictIsoDateMs("0001-02-29T00:00:00Z")).toBeNull();
    expect(parseStrictIsoDateMs("2026-02-30T12:00:00+07:00")).toBeNull();
    expect(parseStrictIsoDateMs("2026-04-31T00:00:00Z")).toBeNull();
    expect(parseStrictIsoDateMs("2026-11-27T12:00:00")).toBeNull();
    expect(parseStrictIsoDateMs("2026-11-27T12:00:00+25:00")).toBeNull();
    expect(parseStrictIsoDateMs("2026-11-27T12:00:00+07:60")).toBeNull();
  });

  it("rejects impossible calendar dates inside the active rollover window while accepting valid controls", async () => {
    vi.useFakeTimers({
      now: Date.parse("2026-03-01T12:00:00Z"),
      toFake: ["Date"],
    });
    const capUrls = {
      badExp: "https://www.bmkg.go.id/alerts/nowcast/id/feb30_exp_alert.xml",
      badEff: "https://www.bmkg.go.id/alerts/nowcast/id/apr31_eff_alert.xml",
      validCtrl: "https://www.bmkg.go.id/alerts/nowcast/id/mar02_valid_alert.xml",
    };

    const svc = new BmkgService({
      now: () => Date.now(),
      fetch: async (input) => {
        const url = String(input);
        if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
          return makeResponse(makeRssXml(Object.values(capUrls)), 200);
        }
        if (url === capUrls.badExp) {
          return makeResponse(
            makeCapXml({
              identifier: "feb30",
              effective: "2026-03-01T10:00:00Z",
              expires: "2026-02-30T12:00:00+07:00",
              areaDesc: "Kabupaten Wonosobo, Kecamatan Kejajar",
            }),
            200,
          );
        }
        if (url === capUrls.badEff) {
          return makeResponse(
            makeCapXml({
              identifier: "apr31",
              effective: "2026-04-31T00:00:00Z",
              expires: "2026-03-02T12:00:00+07:00",
              areaDesc: "Kabupaten Wonosobo, Kecamatan Kejajar",
            }),
            200,
          );
        }
        if (url === capUrls.validCtrl) {
          return makeResponse(
            makeCapXml({
              identifier: "mar02-valid",
              effective: "2026-03-01T10:00:00Z",
              expires: "2026-03-02T12:00:00+07:00",
              areaDesc: "Kabupaten Wonosobo, Kecamatan Kejajar",
            }),
            200,
          );
        }
        if (url.endsWith("autogempa.json")) {
          return makeResponse(
            JSON.stringify({
              Infogempa: {
                gempa: [
                  {
                    DateTime: "2026-02-30T12:00:00+07:00",
                    Coordinates: "-7.25,109.90",
                    Magnitude: "5.0",
                    Wilayah: "Wonosobo",
                    Potensi: "Tidak berpotensi tsunami",
                  },
                  {
                    DateTime: "2026-04-31T00:00:00Z",
                    Coordinates: "-7.25,109.90",
                    Magnitude: "5.0",
                    Wilayah: "Wonosobo",
                    Potensi: "Tidak berpotensi tsunami",
                  },
                  {
                    DateTime: "2026-03-01T10:00:00Z",
                    Coordinates: "-7.25,109.90",
                    Magnitude: "4.8",
                    Kedalaman: "10 km",
                    Wilayah: "Wonosobo",
                    Potensi: "Tidak berpotensi tsunami",
                  },
                ],
              },
            }),
            200,
          );
        }
        return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
      },
    });

    const feed = await svc.getAlertsFeed([DIENG_TARGET]);
    expect(feed.items).toHaveLength(2);
    expect(feed.items.map((i) => i.kind).sort()).toEqual([
      "earthquake",
      "weather",
    ]);
  });

  it("decouples shared single-flight fetch from caller AbortSignal in both concurrency orderings", async () => {
    const recentIso = new Date(FIXED_NOW - 10 * 60_000).toISOString();

    function makeSlowService(): BmkgService {
      return new BmkgService({
        now: () => FIXED_NOW,
        fetch: async (input) => {
          const url = String(input);
          await new Promise((r) => setTimeout(r, 80));
          if (url === "https://www.bmkg.go.id/alerts/nowcast/id") {
            return makeResponse(makeRssXml([]), 200);
          }
          if (url.endsWith("autogempa.json")) {
            return makeResponse(
              JSON.stringify({
                Infogempa: {
                  gempa: {
                    DateTime: recentIso,
                    Coordinates: "-7.25,109.90",
                    Magnitude: "4.6",
                    Kedalaman: "10 km",
                    Wilayah: "Wonosobo",
                    Potensi: "Tidak berpotensi tsunami",
                  },
                },
              }),
              200,
            );
          }
          return makeResponse(JSON.stringify({ Infogempa: { gempa: [] } }), 200);
        },
      });
    }

    // (a) AI caller starts first with short abort deadline, public caller joins second
    {
      const svc = makeSlowService();
      const aiController = new AbortController();
      setTimeout(() => aiController.abort(), 15);

      const aiPromise = svc.getAlertsFeed([DIENG_TARGET], {
        signal: aiController.signal,
      });
      const publicPromise = svc.getAlertsFeed([DIENG_TARGET]);

      const [aiFeed, publicFeed] = await Promise.all([aiPromise, publicPromise]);
      expect(aiFeed.items).toHaveLength(0);
      expect(publicFeed.items).toHaveLength(1);
    }

    // (b) Public caller starts first, AI caller joins second with short abort deadline
    {
      const svc = makeSlowService();
      const aiController = new AbortController();
      setTimeout(() => aiController.abort(), 15);

      const publicPromise = svc.getAlertsFeed([DIENG_TARGET]);
      const aiPromise = svc.getAlertsFeed([DIENG_TARGET], {
        signal: aiController.signal,
      });

      const [publicFeed, aiFeed] = await Promise.all([publicPromise, aiPromise]);
      expect(aiFeed.items).toHaveLength(0);
      expect(publicFeed.items).toHaveLength(1);
    }
  });
});
