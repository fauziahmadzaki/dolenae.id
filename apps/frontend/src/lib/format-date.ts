const MEDIUM_DATE = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const DAY_MONTH = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Jakarta",
});

const CLOCK_TIME = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

const JAKARTA_DAY = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Jakarta",
});

/** Format an ISO timestamp as `"12 Sep 2026"` in WIB. */
export function formatMediumDateId(isoDate: string): string {
  const ms = Date.parse(isoDate);
  if (Number.isNaN(ms)) return "—";
  return MEDIUM_DATE.format(new Date(ms));
}

/** Format recent timestamps cleanly (`Baru saja`, `2 jam lalu`, `Kemarin`, `3 hari lalu`, or medium date). */
export function formatRelativeId(isoDate: string): string {
  const ms = Date.parse(isoDate);
  if (Number.isNaN(ms)) return "—";

  const diffMs = Math.max(0, Date.now() - ms);
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;

  return formatMediumDateId(isoDate);
}

/** Compact clock (`10:24`) for today in WIB, or short date (`23 Nov`) for older events. */
export function formatActivityTimeId(isoDate: string): string {
  const ms = Date.parse(isoDate);
  if (Number.isNaN(ms)) return "—";

  const target = new Date(ms);
  const now = new Date();
  if (JAKARTA_DAY.format(target) === JAKARTA_DAY.format(now)) {
    return CLOCK_TIME.format(target);
  }
  return DAY_MONTH.format(target);
}
