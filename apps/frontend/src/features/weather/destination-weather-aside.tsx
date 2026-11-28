import { AlertTriangle, Cloud, CloudRain, Sun } from "lucide-react";
import type { DestinationWeatherResponse } from "~/features/weather/types";
import { cn } from "~/lib/cn";

function weatherIconForCode(code: number) {
  if (code <= 2) return Sun;
  if (code <= 45) return Cloud;
  if (code >= 60 && code <= 85) return CloudRain;
  if (code >= 95 && code <= 99) return AlertTriangle;
  return Cloud;
}

function formatWind(windSpeedKmh: number): string {
  return Number.isInteger(windSpeedKmh)
    ? String(windSpeedKmh)
    : windSpeedKmh.toFixed(1);
}

export function DestinationWeatherAlerts({
  weather,
}: {
  weather: DestinationWeatherResponse | null;
}) {
  if (!weather || !Array.isArray(weather.alerts) || weather.alerts.length === 0) {
    return null;
  }

  const sortedAlerts = [...weather.alerts]
    .sort((a, b) => {
      if (a.severity === b.severity) return 0;
      return a.severity === "danger" ? -1 : 1;
    })
    .slice(0, 2);

  return (
    <>
      {sortedAlerts.map((alert) => (
        <section
          key={alert.id}
          aria-label="Peringatan alam BMKG"
          className={cn(
            "space-y-1.5 rounded-2xl border p-4",
            alert.severity === "danger"
              ? "border-danger/40 bg-danger/10"
              : "border-warning/40 bg-warning/10",
          )}
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              aria-hidden
              className={cn(
                "mt-0.5 size-4 shrink-0",
                alert.severity === "danger" ? "text-danger" : "text-warning",
              )}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="text-sm font-semibold text-ink">{alert.title}</h2>
              <p className="line-clamp-3 text-xs leading-5 text-ink/90">
                {alert.summary}
              </p>
              <p className="text-[11px] font-medium text-body">Sumber: BMKG</p>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

export function DestinationWeatherCard({
  weather,
}: {
  weather: DestinationWeatherResponse | null;
}) {
  if (!weather || !weather.available || !weather.current) return null;

  const { current, daily } = weather;
  const WeatherIcon = weatherIconForCode(current.weatherCode);
  const days = Array.isArray(daily) ? daily.slice(0, 3) : [];

  return (
    <section className="space-y-3 rounded-2xl border border-hairline bg-canvas-subtle p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Prakiraan cuaca</h2>
        <span className="text-[11px] font-semibold tracking-wide text-body uppercase">
          BMKG
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-hairline pt-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <WeatherIcon aria-hidden className="size-6 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink">
              {Math.round(current.temperatureC)}°C
            </p>
            <p className="truncate text-xs text-body">{current.weatherDesc}</p>
          </div>
        </div>
        <p className="shrink-0 text-right text-xs text-body">
          {current.humidityPct}% · {formatWind(current.windSpeedKmh)} km/j
        </p>
      </div>
      {days.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 border-t border-hairline pt-3 text-center">
          {days.map((d) => {
            const DayIcon = weatherIconForCode(d.weatherCode);
            return (
              <li
                key={d.date}
                className="space-y-1 rounded-lg border border-hairline bg-canvas px-2 py-2"
              >
                <p className="truncate text-[11px] font-semibold text-body">
                  {d.dayLabel}
                </p>
                <DayIcon aria-hidden className="mx-auto size-4 text-primary" />
                <p className="text-xs font-semibold text-ink">
                  {Math.round(d.tempMinC)}°–{Math.round(d.tempMaxC)}°
                </p>
                <p className="truncate text-[11px] text-body">
                  {d.weatherDesc}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[11px] text-body">
        Sumber: Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)
      </p>
    </section>
  );
}
