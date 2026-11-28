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

export interface WeatherAlertFeedItem {
  id: string;
  kind: WeatherAlertKind;
  severity: WeatherAlertSeverity;
  title: string;
  body: string;
  createdAt: string;
  expiresAt: string | null;
  destinationId: string | null;
  destinationName: string | null;
  href: string | null;
  source: "BMKG";
}

export interface WeatherAlertsFeedResponse {
  attribution: string;
  fetchedAt: string;
  items: WeatherAlertFeedItem[];
}

export interface DestinationGeoTarget {
  id: string;
  name: string;
  province: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
}
