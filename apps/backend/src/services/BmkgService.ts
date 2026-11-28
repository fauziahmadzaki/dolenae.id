import { createHash } from "node:crypto";
import type {
  DestinationGeoTarget,
  DestinationWeatherAlert,
  DestinationWeatherResponse,
  WeatherAlertFeedItem,
  WeatherAlertSeverity,
  WeatherCurrent,
  WeatherDaily,
} from "../types/weather";
import { haversineKm } from "../utils/geo";
import { regionService } from "./RegionService";

const BMKG_ATTRIBUTION = "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)";
const ADM4_RE = /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/;
const CAP_PATH_RE = /^\/alerts\/nowcast\/id\/[A-Za-z0-9_-]+_alert\.xml$/;

const MAX_RESPONSE_BYTES = 512 * 1024;
const REQUEST_TIMEOUT_MS = 5000;
const MAX_OUTBOUND_PER_MINUTE = 40;
const FORECAST_CACHE_MAX = 500;
const CAP_CACHE_MAX = 200;
const FORECAST_TTL_MS = 3 * 60 * 60 * 1000;
const FORECAST_NEG_TTL_MS = 30 * 60 * 1000;
const NOWCAST_TTL_MS = 10 * 60 * 1000;
const EARTHQUAKE_TTL_MS = 5 * 60 * 1000;
const EARTHQUAKE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const EARTHQUAKE_RADIUS_KM = 150;
const MAX_CAP_FETCHES_PER_CYCLE = 15;
const CAP_CONCURRENCY = 4;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface ParsedRssItem {
  title: string;
  link: string;
  pubDate: string | null;
  description: string;
}

interface ParsedCapAlert {
  identifier: string;
  status: string;
  msgType: string;
  scope: string;
  event: string;
  urgency: string;
  severity: string;
  effective: string | null;
  effectiveMs: number | null;
  expires: string;
  expiresMs: number;
  headline: string;
  description: string;
  areaDesc: string;
  polygons: [number, number][][];
}

interface ParsedEarthquake {
  idKey: string;
  dateTimeIso: string;
  timestampMs: number;
  magnitude: number;
  depthText: string;
  lat: number;
  lng: number;
  regionText: string;
  potensi: string;
  dirasakan: string;
  tsunamiPotential: boolean;
}

export interface BmkgServiceOptions {
  fetch?: typeof fetch;
  now?: () => number;
}

function truncateText(value: string, maxLen: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trimEnd()}…`;
}

function unwrapCdataLinear(value: string): string {
  const open = "<![CDATA[";
  const close = "]]>";
  let result = "";
  let cursor = 0;

  while (cursor < value.length) {
    const start = value.indexOf(open, cursor);
    if (start < 0) {
      result += value.slice(cursor);
      break;
    }
    result += value.slice(cursor, start);
    const contentStart = start + open.length;
    const end = value.indexOf(close, contentStart);
    if (end < 0) {
      // Unclosed CDATA: treat remaining text linearly without backtracking.
      result += value.slice(contentStart);
      break;
    }
    result += value.slice(contentStart, end);
    cursor = end + close.length;
  }
  return result;
}

function stripTagsLinear(value: string): string {
  let result = "";
  let cursor = 0;

  while (cursor < value.length) {
    const lt = value.indexOf("<", cursor);
    if (lt < 0) {
      result += value.slice(cursor);
      break;
    }
    result += value.slice(cursor, lt);
    const gt = value.indexOf(">", lt + 1);
    if (gt < 0) {
      // Unclosed '<': emit remaining slice once in O(n).
      result += " " + value.slice(lt + 1);
      break;
    }
    result += " ";
    cursor = gt + 1;
  }
  return result;
}

function decodeXmlEntities(value: string): string {
  return value.replace(/&(amp|lt|gt|quot|apos);/g, (entity) => {
    switch (entity) {
      case "&amp;":
        return "&";
      case "&lt;":
        return "<";
      case "&gt;":
        return ">";
      case "&quot;":
        return '"';
      case "&apos;":
        return "'";
      default:
        return entity;
    }
  });
}

function stripXmlToPlainText(value: string): string {
  const unwrapped = unwrapCdataLinear(value);
  const noTags = stripTagsLinear(unwrapped);
  return decodeXmlEntities(noTags).replace(/\s+/g, " ").trim();
}

function extractTagContents(xml: string, tagName: string): string[] {
  const results: string[] = [];
  const openPrefix = `<${tagName}`;
  const closeTag = `</${tagName}>`;
  let cursor = 0;

  while (cursor < xml.length) {
    const start = xml.indexOf(openPrefix, cursor);
    if (start < 0) break;
    const afterName = xml[start + openPrefix.length];
    if (afterName !== ">" && afterName !== " " && afterName !== "\t" && afterName !== "\n" && afterName !== "\r") {
      cursor = start + openPrefix.length;
      continue;
    }
    const gt = xml.indexOf(">", start);
    if (gt < 0) break;
    const end = xml.indexOf(closeTag, gt + 1);
    if (end < 0) break;
    results.push(xml.slice(gt + 1, end));
    cursor = end + closeTag.length;
  }
  return results;
}

function extractFirstTag(xml: string, tagName: string): string {
  const list = extractTagContents(xml, tagName);
  return list[0] ? stripXmlToPlainText(list[0]) : "";
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/^provinsi\s+/, "")
    .replace(/^kabupaten\s+/, "")
    .replace(/^kota\s+/, "")
    .replace(/^kecamatan\s+/, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCoordNumber(raw: string | undefined, min: number, max: number): number | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

function parseCoordinatePair(raw: string): [number, number] | null {
  const parts = raw.split(",");
  if (parts.length !== 2) return null;
  const lat = parseCoordNumber(parts[0], -90, 90);
  const lng = parseCoordNumber(parts[1], -180, 180);
  if (lat === null || lng === null) return null;
  return [lat, lng];
}

function parsePolygonString(raw: string): [number, number][] {
  const ring: [number, number][] = [];
  const tokens = raw.trim().split(/\s+/);
  for (const token of tokens) {
    const pair = parseCoordinatePair(token);
    if (pair) ring.push(pair);
  }
  return ring;
}

function pointInPolygon(lat: number, lng: number, ring: [number, number][]): boolean {
  if (ring.length < 3) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i]![0];
    const xi = ring[i]![1];
    const yj = ring[j]![0];
    const xj = ring[j]![1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function weekdayLabel(dateStr: string, todayStr: string): string {
  const targetMs = Date.parse(`${dateStr}T00:00:00Z`);
  const todayMs = Date.parse(`${todayStr}T00:00:00Z`);
  if (!Number.isFinite(targetMs) || !Number.isFinite(todayMs)) return dateStr;
  const diffDays = Math.round((targetMs - todayMs) / 86_400_000);
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Besok";
  if (diffDays === 2) return "Lusa";
  const names = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  return names[new Date(targetMs).getUTCDay()] ?? dateStr;
}

function shortHash(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

const ISO_8601_TZ_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?(Z|([+-])(\d{2}):?(\d{2}))$/;

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 29 : 28;
  }
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

export function parseStrictIsoDateMs(value: string): number | null {
  const match = ISO_8601_TZ_RE.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] ? Number(match[6]) : 0;
  const fracStr = match[7] ?? "";
  const ms = fracStr ? Number(fracStr.slice(0, 3).padEnd(3, "0")) : 0;

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  if (second < 0 || second > 59) return null;

  let tzOffsetMs = 0;
  if (match[8] !== "Z") {
    const sign = match[9] === "-" ? -1 : 1;
    const tzHour = Number(match[10]);
    const tzMin = Number(match[11]);
    if (tzHour < 0 || tzHour > 23 || tzMin < 0 || tzMin > 59) return null;
    tzOffsetMs = sign * (tzHour * 60 + tzMin) * 60_000;
  }

  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  d.setUTCHours(hour, minute, second, ms);
  const utcMs = d.getTime();
  if (!Number.isFinite(utcMs)) return null;
  const epochMs = utcMs - tzOffsetMs;
  return Number.isFinite(epochMs) ? epochMs : null;
}

async function awaitWithAbort<T>(
  promise: Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err);
      },
    );
  });
}

export class BmkgService {
  private customFetch?: typeof fetch;
  private readonly nowFn: () => number;

  private readonly forecastCache = new Map<
    string,
    CacheEntry<{ current: WeatherCurrent | null; daily: WeatherDaily[] } | null>
  >();
  private nowcastRssCache: CacheEntry<ParsedRssItem[]> | null = null;
  private readonly capCache = new Map<string, CacheEntry<ParsedCapAlert | null>>();
  private earthquakeCache: CacheEntry<ParsedEarthquake[]> | null = null;

  private readonly inFlight = new Map<string, Promise<unknown>>();
  private outboundTimestamps: number[] = [];

  constructor(options: BmkgServiceOptions = {}) {
    this.customFetch = options.fetch;
    this.nowFn = options.now ?? (() => Date.now());
  }

  /** Test helper: inject or reset a deterministic fetch implementation. */
  setFetcher(fn?: typeof fetch): void {
    this.customFetch = fn;
    this.resetCaches();
  }

  resetCaches(): void {
    this.forecastCache.clear();
    this.nowcastRssCache = null;
    this.capCache.clear();
    this.earthquakeCache = null;
    this.inFlight.clear();
    this.outboundTimestamps = [];
  }

  /** Validate CAP URL strictly against official BMKG nowcast XML paths (SSRF guard). */
  isAllowedCapUrl(rawUrl: string): boolean {
    try {
      const parsed = new URL(rawUrl.trim());
      return (
        parsed.protocol === "https:" &&
        parsed.hostname === "www.bmkg.go.id" &&
        parsed.port === "" &&
        parsed.username === "" &&
        parsed.password === "" &&
        parsed.search === "" &&
        parsed.hash === "" &&
        CAP_PATH_RE.test(parsed.pathname)
      );
    } catch {
      return false;
    }
  }

  private get isTestWithoutFetcher(): boolean {
    return (
      !this.customFetch &&
      (process.env.VITEST === "true" || process.env.NODE_ENV === "test")
    );
  }

  private consumeRateBudget(): boolean {
    const now = this.nowFn();
    const cutoff = now - 60_000;
    this.outboundTimestamps = this.outboundTimestamps.filter((ts) => ts > cutoff);
    if (this.outboundTimestamps.length >= MAX_OUTBOUND_PER_MINUTE) {
      return false;
    }
    this.outboundTimestamps.push(now);
    return true;
  }

  private singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key) as Promise<T> | undefined;
    if (existing) return existing;
    const promise = fn().finally(() => {
      this.inFlight.delete(key);
    });
    this.inFlight.set(key, promise);
    return promise;
  }

  private async fetchTextBounded(url: string): Promise<string | null> {
    if (this.isTestWithoutFetcher) return null;
    if (!this.consumeRateBudget()) return null;

    const fetcher = this.customFetch ?? globalThis.fetch;
    const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

    try {
      const response = await fetcher(url, {
        signal: timeoutSignal,
        redirect: "error",
        headers: {
          Accept: "application/json, application/xml, text/xml, */*",
          "User-Agent": "Dolenae/1.0 (+https://dolenae.id)",
        },
      });
      if (!response.ok) return null;

      const contentLengthHeader = response.headers?.get("content-length");
      if (contentLengthHeader) {
        const declared = Number(contentLengthHeader);
        if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
          await response.body?.cancel().catch(() => undefined);
          return null;
        }
      }

      if (!response.body || typeof response.body.getReader !== "function") {
        return null;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let totalBytes = 0;
      let text = "";

      while (true) {
        if (timeoutSignal.aborted) {
          await reader.cancel().catch(() => undefined);
          return null;
        }
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.byteLength;
          if (totalBytes > MAX_RESPONSE_BYTES) {
            await reader.cancel().catch(() => undefined);
            return null;
          }
          text += decoder.decode(value, { stream: true });
        }
      }
      text += decoder.decode();
      return text;
    } catch {
      return null;
    }
  }

  private setCapCache(
    url: string,
    value: ParsedCapAlert | null,
    ttlMs: number,
  ): void {
    const now = this.nowFn();
    for (const [key, entry] of this.capCache.entries()) {
      if (entry.expiresAt <= now) {
        this.capCache.delete(key);
      }
    }
    if (!this.capCache.has(url) && this.capCache.size >= CAP_CACHE_MAX) {
      const oldestKey = this.capCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.capCache.delete(oldestKey);
      }
    }
    this.capCache.set(url, {
      value,
      expiresAt: now + ttlMs,
    });
  }

  private setForecastCache(
    adm4: string,
    value: { current: WeatherCurrent | null; daily: WeatherDaily[] } | null,
    ttlMs: number,
  ): void {
    if (!this.forecastCache.has(adm4) && this.forecastCache.size >= FORECAST_CACHE_MAX) {
      const oldestKey = this.forecastCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.forecastCache.delete(oldestKey);
      }
    }
    this.forecastCache.set(adm4, {
      value,
      expiresAt: this.nowFn() + ttlMs,
    });
  }

  private parseForecastPayload(
    rawText: string,
  ): { current: WeatherCurrent | null; daily: WeatherDaily[] } | null {
    let json: unknown;
    try {
      json = JSON.parse(rawText);
    } catch {
      return null;
    }
    if (!json || typeof json !== "object") return null;
    const dataArr = (json as { data?: unknown }).data;
    if (!Array.isArray(dataArr) || dataArr.length === 0) return null;

    const first = dataArr[0] as { cuaca?: unknown };
    if (!first || !Array.isArray(first.cuaca)) return null;

    const slots: Record<string, unknown>[] = [];
    for (const item of first.cuaca) {
      if (Array.isArray(item)) {
        for (const sub of item) {
          if (sub && typeof sub === "object") {
            slots.push(sub as Record<string, unknown>);
          }
        }
      } else if (item && typeof item === "object") {
        slots.push(item as Record<string, unknown>);
      }
    }
    if (slots.length === 0) return null;

    const nowMs = this.nowFn();
    const todayWib = new Date(nowMs + 7 * 3600_000).toISOString().slice(0, 10);

    let bestSlot: Record<string, unknown> | undefined;
    let bestDiff = Number.POSITIVE_INFINITY;

    const byDate = new Map<
      string,
      {
        temps: number[];
        descriptions: Map<string, { count: number; code: number }>;
      }
    >();

    for (const slot of slots) {
      const localDatetime = String(slot.local_datetime ?? slot.datetime ?? "").trim();
      const temp = Number(slot.t);
      const hu = Number(slot.hu);
      const ws = Number(slot.ws);
      const weatherCode = Number(slot.weather ?? 0);
      const weatherDesc = truncateText(
        String(slot.weather_desc ?? slot.weather_desc_en ?? "Berawan"),
        60,
      );

      if (!localDatetime || !Number.isFinite(temp)) continue;

      const parsedMs = Date.parse(localDatetime.replace(" ", "T") + "+07:00");
      if (Number.isFinite(parsedMs)) {
        const diff = Math.abs(parsedMs - nowMs);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestSlot = {
            localDatetime,
            t: Math.round(temp),
            hu: Number.isFinite(hu) ? Math.round(hu) : 0,
            weatherDesc,
            weatherCode: Number.isFinite(weatherCode) ? weatherCode : 0,
            ws: Number.isFinite(ws) ? Number(ws.toFixed(1)) : 0,
            wd: String(slot.wd ?? "").trim(),
          };
        }
      }

      const dateKey = localDatetime.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        let dayEntry = byDate.get(dateKey);
        if (!dayEntry) {
          dayEntry = { temps: [], descriptions: new Map() };
          byDate.set(dateKey, dayEntry);
        }
        dayEntry.temps.push(temp);
        const existingDesc = dayEntry.descriptions.get(weatherDesc);
        if (existingDesc) {
          existingDesc.count += 1;
        } else {
          dayEntry.descriptions.set(weatherDesc, {
            count: 1,
            code: Number.isFinite(weatherCode) ? weatherCode : 0,
          });
        }
      }
    }

    const current: WeatherCurrent | null = bestSlot
      ? {
          localDatetime: String(bestSlot.localDatetime),
          temperatureC: Number(bestSlot.t),
          humidityPct: Number(bestSlot.hu),
          weatherDesc: String(bestSlot.weatherDesc),
          weatherCode: Number(bestSlot.weatherCode),
          windSpeedKmh: Number(bestSlot.ws),
          windDirection: String(bestSlot.wd),
        }
      : null;

    const daily: WeatherDaily[] = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 3)
      .map(([date, info]) => {
        let dominantDesc = "Berawan";
        let dominantCode = 0;
        let maxCount = -1;
        for (const [desc, meta] of info.descriptions.entries()) {
          if (meta.count > maxCount) {
            maxCount = meta.count;
            dominantDesc = desc;
            dominantCode = meta.code;
          }
        }
        return {
          date,
          dayLabel: weekdayLabel(date, todayWib),
          tempMinC: Math.round(Math.min(...info.temps)),
          tempMaxC: Math.round(Math.max(...info.temps)),
          weatherDesc: dominantDesc,
          weatherCode: dominantCode,
        };
      });

    if (!current && daily.length === 0) return null;
    return { current, daily };
  }

  private async fetchForecastForAdm4(
    adm4: string,
  ): Promise<{ current: WeatherCurrent | null; daily: WeatherDaily[] } | null> {
    if (!ADM4_RE.test(adm4)) return null;
    const now = this.nowFn();
    const cached = this.forecastCache.get(adm4);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    return this.singleFlight(`forecast:${adm4}`, async () => {
      const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`;
      const text = await this.fetchTextBounded(url);
      if (!text) {
        if (cached) return cached.value;
        this.setForecastCache(adm4, null, FORECAST_NEG_TTL_MS);
        return null;
      }
      const parsed = this.parseForecastPayload(text);
      if (!parsed) {
        this.setForecastCache(adm4, null, FORECAST_NEG_TTL_MS);
        return null;
      }
      this.setForecastCache(adm4, parsed, FORECAST_TTL_MS);
      return parsed;
    });
  }

  private parseRssItems(xml: string): ParsedRssItem[] {
    const items = extractTagContents(xml, "item");
    return items.map((itemXml) => ({
      title: extractFirstTag(itemXml, "title"),
      link: extractFirstTag(itemXml, "link"),
      pubDate: extractFirstTag(itemXml, "pubDate") || null,
      description: extractFirstTag(itemXml, "description"),
    }));
  }

  private parseCapXml(xml: string): ParsedCapAlert | null {
    const identifier = extractFirstTag(xml, "identifier");
    const status = extractFirstTag(xml, "status").trim();
    const msgType = extractFirstTag(xml, "msgType").trim();
    const scope = extractFirstTag(xml, "scope").trim();
    const event = extractFirstTag(xml, "event");
    const urgency = extractFirstTag(xml, "urgency");
    const severity = extractFirstTag(xml, "severity");
    const effective = extractFirstTag(xml, "effective") || null;
    const expires = extractFirstTag(xml, "expires") || null;
    const headline = extractFirstTag(xml, "headline");
    const description = extractFirstTag(xml, "description");
    const areaDesc = extractFirstTag(xml, "areaDesc");

    if (status.toLowerCase() !== "actual") return null;
    const msgTypeLower = msgType.toLowerCase();
    if (msgTypeLower !== "alert" && msgTypeLower !== "update") return null;
    if (scope.toLowerCase() !== "public") return null;

    if (!expires) return null;
    const expiresMs = parseStrictIsoDateMs(expires);
    if (expiresMs === null) return null;

    let effectiveMs: number | null = null;
    if (effective !== null) {
      const parsedEffective = parseStrictIsoDateMs(effective);
      if (parsedEffective === null) return null;
      effectiveMs = parsedEffective;
    }

    const polygons = extractTagContents(xml, "polygon")
      .map((raw) => parsePolygonString(stripXmlToPlainText(raw)))
      .filter((ring) => ring.length >= 3);

    if (!event && !headline && !description) return null;
    return {
      identifier: identifier || shortHash(`${headline}:${effective ?? ""}`),
      status,
      msgType,
      scope,
      event: event || "Peringatan Dini Cuaca",
      urgency,
      severity,
      effective,
      effectiveMs,
      expires,
      expiresMs,
      headline: headline || event || "Peringatan Dini Cuaca",
      description,
      areaDesc,
      polygons,
    };
  }

  private async fetchActiveNowcastCaps(
    provincesFilter?: Set<string>,
    signal?: AbortSignal,
  ): Promise<ParsedCapAlert[]> {
    if (signal?.aborted) return [];
    const now = this.nowFn();
    let rssItems: ParsedRssItem[];

    if (this.nowcastRssCache && this.nowcastRssCache.expiresAt > now) {
      rssItems = this.nowcastRssCache.value;
    } else {
      rssItems = await awaitWithAbort(
        this.singleFlight("nowcast:rss", async () => {
          const text = await this.fetchTextBounded(
            "https://www.bmkg.go.id/alerts/nowcast/id",
          );
          if (!text) {
            return this.nowcastRssCache?.value ?? [];
          }
          const parsed = this.parseRssItems(text);
          this.nowcastRssCache = {
            value: parsed,
            expiresAt: this.nowFn() + NOWCAST_TTL_MS,
          };
          return parsed;
        }),
        signal,
      );
    }

    const validLinks: string[] = [];
    for (const item of rssItems) {
      if (!this.isAllowedCapUrl(item.link)) continue;
      if (provincesFilter && provincesFilter.size > 0) {
        const hay = normalizeText(`${item.title} ${item.description}`);
        const matchesAnyProvince = [...provincesFilter].some(
          (prov) => prov.length > 0 && hay.includes(prov),
        );
        // Only filter out items that clearly name a different province.
        if (hay.length > 0 && !matchesAnyProvince && hay.includes("provinsi")) {
          continue;
        }
      }
      if (!validLinks.includes(item.link)) {
        validLinks.push(item.link);
      }
      if (validLinks.length >= MAX_CAP_FETCHES_PER_CYCLE) break;
    }

    const caps: ParsedCapAlert[] = [];
    for (let i = 0; i < validLinks.length; i += CAP_CONCURRENCY) {
      if (signal?.aborted) break;
      const batch = validLinks.slice(i, i + CAP_CONCURRENCY);
      const results = await Promise.all(
        batch.map(async (url) => {
          const cached = this.capCache.get(url);
          if (cached && cached.expiresAt > this.nowFn()) {
            return cached.value;
          }
          return awaitWithAbort(
            this.singleFlight(`cap:${url}`, async () => {
              const xml = await this.fetchTextBounded(url);
              if (!xml) return cached?.value ?? null;
              const parsed = this.parseCapXml(xml);
              this.setCapCache(url, parsed, NOWCAST_TTL_MS);
              return parsed;
            }),
            signal,
          );
        }),
      );
      const checkNow = this.nowFn();
      for (const cap of results) {
        if (!cap) continue;
        if (cap.expiresMs <= checkNow) continue;
        if (cap.effectiveMs !== null && cap.effectiveMs > checkNow + 60_000) {
          continue;
        }
        caps.push(cap);
      }
    }

    return caps;
  }

  private parseEarthquakeList(rawText: string): ParsedEarthquake[] {
    let json: unknown;
    try {
      json = JSON.parse(rawText);
    } catch {
      return [];
    }
    const gempa = (json as { Infogempa?: { gempa?: unknown } })?.Infogempa?.gempa;
    const rows = Array.isArray(gempa) ? gempa : gempa && typeof gempa === "object" ? [gempa] : [];

    const now = this.nowFn();
    const parsed: ParsedEarthquake[] = [];

    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const item = row as Record<string, unknown>;
      const dateTimeIso = String(item.DateTime ?? "").trim();
      const coords = String(item.Coordinates ?? "").trim();
      const coordPair = parseCoordinatePair(coords);
      const magnitude = Number(item.Magnitude);
      const timestampMs = parseStrictIsoDateMs(dateTimeIso);

      if (
        !dateTimeIso ||
        timestampMs === null ||
        !coordPair ||
        !Number.isFinite(magnitude)
      ) {
        continue;
      }
      const [lat, lng] = coordPair;

      if (now - timestampMs > EARTHQUAKE_MAX_AGE_MS || timestampMs > now + 5 * 60_000) {
        continue;
      }

      const potensi = truncateText(String(item.Potensi ?? ""), 160);
      const potensiLower = potensi.toLowerCase();
      const tsunamiPotential =
        potensiLower.includes("tsunami") &&
        !potensiLower.includes("tidak berpotensi tsunami");

      parsed.push({
        idKey: `${dateTimeIso}|${coords}`,
        dateTimeIso,
        timestampMs,
        magnitude,
        depthText: truncateText(String(item.Kedalaman ?? ""), 40),
        lat,
        lng,
        regionText: truncateText(String(item.Wilayah ?? ""), 140),
        potensi,
        dirasakan: truncateText(String(item.Dirasakan ?? ""), 120),
        tsunamiPotential,
      });
    }

    return parsed;
  }

  private async fetchRecentEarthquakes(
    signal?: AbortSignal,
  ): Promise<ParsedEarthquake[]> {
    if (signal?.aborted) return [];
    const now = this.nowFn();
    if (this.earthquakeCache && this.earthquakeCache.expiresAt > now) {
      return this.earthquakeCache.value;
    }

    return awaitWithAbort(
      this.singleFlight("tews:earthquakes", async () => {
        const [autoText, feltText] = await Promise.all([
          this.fetchTextBounded(
            "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json",
          ),
          this.fetchTextBounded(
            "https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json",
          ),
        ]);

      if (!autoText && !feltText) {
        return this.earthquakeCache?.value ?? [];
      }

      const byKey = new Map<string, ParsedEarthquake>();
      for (const text of [autoText, feltText]) {
        if (!text) continue;
        for (const eq of this.parseEarthquakeList(text)) {
          if (!byKey.has(eq.idKey)) {
            byKey.set(eq.idKey, eq);
          }
        }
      }

      const deduped = [...byKey.values()].sort(
        (a, b) => b.timestampMs - a.timestampMs,
      );
      this.earthquakeCache = {
        value: deduped,
        expiresAt: this.nowFn() + EARTHQUAKE_TTL_MS,
      };
      return deduped;
      }),
      signal,
    );
  }

  private capMatchesDestination(
    cap: ParsedCapAlert,
    target: DestinationGeoTarget,
  ): boolean {
    if (
      target.latitude !== null &&
      target.longitude !== null &&
      Number.isFinite(target.latitude) &&
      Number.isFinite(target.longitude) &&
      cap.polygons.length > 0
    ) {
      for (const ring of cap.polygons) {
        if (pointInPolygon(target.latitude, target.longitude, ring)) {
          return true;
        }
      }
    }

    const normProvince = normalizeText(target.province);
    const normDistrict = normalizeText(target.district);
    if (!normProvince || !normDistrict) return false;

    const hay = normalizeText(`${cap.headline} ${cap.description} ${cap.areaDesc}`);
    return hay.includes(normProvince) && hay.includes(normDistrict);
  }

  private mapCapSeverity(cap: ParsedCapAlert): WeatherAlertSeverity {
    const sev = cap.severity.trim().toLowerCase();
    const urg = cap.urgency.trim().toLowerCase();
    if (sev === "extreme" || sev === "severe") return "danger";
    if (urg === "immediate" && sev !== "minor") return "danger";
    return "warning";
  }

  private matchAlertsForDestination(
    target: DestinationGeoTarget,
    caps: ParsedCapAlert[],
    earthquakes: ParsedEarthquake[],
  ): DestinationWeatherAlert[] {
    const alerts: DestinationWeatherAlert[] = [];

    for (const cap of caps) {
      if (!this.capMatchesDestination(cap, target)) continue;
      alerts.push({
        id: `bmkg-wx-${shortHash(`${cap.identifier}:${target.id}`)}`,
        kind: "weather",
        severity: this.mapCapSeverity(cap),
        title: truncateText(cap.headline || cap.event, 120),
        summary: truncateText(cap.description || cap.areaDesc || cap.event, 220),
        detail: truncateText(
          `${cap.description} ${cap.areaDesc ? `Area: ${cap.areaDesc}` : ""}`.trim(),
          800,
        ),
        effectiveAt: cap.effective,
        expiresAt: cap.expires,
        source: "BMKG",
      });
    }

    if (
      target.latitude !== null &&
      target.longitude !== null &&
      Number.isFinite(target.latitude) &&
      Number.isFinite(target.longitude)
    ) {
      for (const eq of earthquakes) {
        const distanceKm = haversineKm(
          { latitude: target.latitude, longitude: target.longitude },
          { latitude: eq.lat, longitude: eq.lng },
        );
        const closeEnough =
          distanceKm <= EARTHQUAKE_RADIUS_KM &&
          (eq.magnitude >= 4.0 || eq.dirasakan.length > 0);
        if (!closeEnough && !eq.tsunamiPotential) continue;

        const severity: WeatherAlertSeverity =
          eq.tsunamiPotential || (eq.magnitude >= 5.5 && distanceKm <= 100)
            ? "danger"
            : "warning";

        const title = truncateText(
          `Gempa M${eq.magnitude.toFixed(1)} (${Math.round(distanceKm)} km dari ${target.name})`,
          120,
        );
        const summary = truncateText(
          `${eq.regionText}. Kedalaman ${eq.depthText}. ${eq.potensi}`.trim(),
          220,
        );
        const detail = truncateText(
          `${eq.regionText}. Kedalaman ${eq.depthText}. ${eq.potensi}${eq.dirasakan ? ` Dirasakan: ${eq.dirasakan}.` : ""}`.trim(),
          800,
        );

        alerts.push({
          id: `bmkg-eq-${shortHash(`${eq.idKey}:${target.id}`)}`,
          kind: "earthquake",
          severity,
          title,
          summary,
          detail,
          effectiveAt: eq.dateTimeIso,
          expiresAt: new Date(eq.timestampMs + EARTHQUAKE_MAX_AGE_MS).toISOString(),
          source: "BMKG",
        });
      }
    }

    return alerts;
  }

  /** Full weather + active alerts payload for a single destination detail view. */
  async getDestinationWeather(
    target: DestinationGeoTarget,
  ): Promise<DestinationWeatherResponse> {
    const fetchedAt = new Date(this.nowFn()).toISOString();
    const hasCoords =
      target.latitude !== null &&
      target.longitude !== null &&
      Number.isFinite(target.latitude) &&
      Number.isFinite(target.longitude);

    let adm4Code: string | null = null;
    let forecast: { current: WeatherCurrent | null; daily: WeatherDaily[] } | null =
      null;

    const provincesFilter = new Set<string>();
    const normProv = normalizeText(target.province);
    if (normProv) provincesFilter.add(normProv);

    const [forecastResult, caps, earthquakes] = await Promise.all([
      (async () => {
        if (!hasCoords) return null;
        const candidates = regionService.resolveAdm4Candidates(
          target.latitude!,
          target.longitude!,
          3,
        );
        for (const candidate of candidates) {
          const res = await this.fetchForecastForAdm4(candidate);
          if (res) {
            return { adm4Code: candidate, forecast: res };
          }
        }
        return null;
      })(),
      this.fetchActiveNowcastCaps(provincesFilter),
      this.fetchRecentEarthquakes(),
    ]);

    if (forecastResult) {
      adm4Code = forecastResult.adm4Code;
      forecast = forecastResult.forecast;
    }

    const alerts = this.matchAlertsForDestination(target, caps, earthquakes);

    return {
      destinationId: target.id,
      adm4Code,
      available: forecast !== null,
      attribution: BMKG_ATTRIBUTION,
      fetchedAt,
      current: forecast?.current ?? null,
      daily: forecast?.daily ?? [],
      alerts,
    };
  }

  /** Global active BMKG weather & earthquake alerts matched to Dolenae destinations. */
  async getAlertsFeed(
    targets: DestinationGeoTarget[],
    options?: { signal?: AbortSignal },
  ): Promise<{
    attribution: string;
    fetchedAt: string;
    items: WeatherAlertFeedItem[];
  }> {
    const signal = options?.signal;
    const fetchedAt = new Date(this.nowFn()).toISOString();
    if (signal?.aborted) {
      return { attribution: BMKG_ATTRIBUTION, fetchedAt, items: [] };
    }
    const provincesFilter = new Set<string>();
    for (const t of targets) {
      const norm = normalizeText(t.province);
      if (norm) provincesFilter.add(norm);
    }

    let caps: ParsedCapAlert[];
    let earthquakes: ParsedEarthquake[];
    try {
      [caps, earthquakes] = await Promise.all([
        this.fetchActiveNowcastCaps(provincesFilter, signal),
        this.fetchRecentEarthquakes(signal),
      ]);
    } catch (err) {
      if (signal?.aborted) {
        return { attribution: BMKG_ATTRIBUTION, fetchedAt, items: [] };
      }
      throw err;
    }

    const items: WeatherAlertFeedItem[] = [];
    const seenIds = new Set<string>();

    for (const target of targets) {
      const matched = this.matchAlertsForDestination(target, caps, earthquakes);
      for (const alert of matched) {
        if (seenIds.has(alert.id)) continue;
        seenIds.add(alert.id);
        items.push({
          id: alert.id,
          kind: alert.kind,
          severity: alert.severity,
          title: alert.title,
          body: truncateText(`${alert.summary} Sumber: BMKG`, 240),
          createdAt: alert.effectiveAt ?? fetchedAt,
          expiresAt: alert.expiresAt,
          destinationId: target.id,
          destinationName: target.name,
          href: `/destinations/${target.id}`,
          source: "BMKG",
        });
      }
    }

    items.sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === "danger" ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return {
      attribution: BMKG_ATTRIBUTION,
      fetchedAt,
      items,
    };
  }
}

export const bmkgService = new BmkgService();
