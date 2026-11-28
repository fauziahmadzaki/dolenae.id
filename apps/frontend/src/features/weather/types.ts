import { z } from "zod";

export type WeatherAlertSeverity = "warning" | "danger";
export type WeatherAlertKind = "weather" | "earthquake";

export interface WeatherCurrent {
  localDatetime: string;
  temperatureC: number;
  humidityPct: number;
  weatherDesc: string;
  weatherCode: number;
  windSpeedKmh: number;
  windDirection: string;
}

export interface WeatherDaily {
  date: string;
  dayLabel: string;
  tempMinC: number;
  tempMaxC: number;
  weatherDesc: string;
  weatherCode: number;
}

export interface DestinationWeatherAlert {
  id: string;
  kind: WeatherAlertKind;
  severity: WeatherAlertSeverity;
  title: string;
  summary: string;
  detail: string;
  effectiveAt: string | null;
  expiresAt: string | null;
  source: "BMKG";
}

export interface DestinationWeatherResponse {
  destinationId: string;
  adm4Code: string | null;
  available: boolean;
  attribution: string;
  fetchedAt: string;
  current: WeatherCurrent | null;
  daily: WeatherDaily[];
  alerts: DestinationWeatherAlert[];
}

const finiteNumber = z.number().finite();

const weatherCurrentSchema = z.object({
  localDatetime: z.string(),
  temperatureC: finiteNumber,
  humidityPct: finiteNumber,
  weatherDesc: z.string().min(1),
  weatherCode: finiteNumber,
  windSpeedKmh: finiteNumber,
  windDirection: z.string(),
});

const weatherDailySchema = z.object({
  date: z.string().min(1),
  dayLabel: z.string().min(1),
  tempMinC: finiteNumber,
  tempMaxC: finiteNumber,
  weatherDesc: z.string().min(1),
  weatherCode: finiteNumber,
});

const destinationWeatherAlertSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["weather", "earthquake"]),
  severity: z.enum(["warning", "danger"]),
  title: z.string().min(1),
  summary: z.string().min(1),
  detail: z.string(),
  effectiveAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  source: z.literal("BMKG"),
});

const destinationWeatherResponseSchema = z.object({
  destinationId: z.string().min(1),
  adm4Code: z.string().nullable(),
  available: z.boolean(),
  attribution: z.string().min(1),
  fetchedAt: z.string(),
  current: weatherCurrentSchema.nullable(),
  daily: z.array(weatherDailySchema),
  alerts: z.array(destinationWeatherAlertSchema),
});

export function parseDestinationWeather(
  raw: unknown,
): DestinationWeatherResponse | null {
  const parsed = destinationWeatherResponseSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
