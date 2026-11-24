/**
 * Presentation helpers for the admin content module (Artikel & Galeri).
 * Wire types live in `./api`; this file only formats them for the UI.
 */
import type { ContentKind, ContentStatus } from "./api";

export const contentKindLabels: Record<ContentKind, string> = {
  artikel: "Artikel",
  panduan: "Panduan",
  tips: "Tips",
};

export const contentStatusLabels: Record<ContentStatus, string> = {
  draft: "Draf",
  pending: "Menunggu",
  published: "Terbit",
};

/** `4,2k` style counters used in the "Dilihat" column. */
export function formatViews(views: number | null): string {
  if (views === null || views <= 0) return "—";
  if (views < 1000) return String(views);
  const thousands = views / 1000;
  return `${thousands.toFixed(thousands >= 10 ? 0 : 1).replace(".", ",")}k`;
}

/** Two-letter initials for the author avatar circle. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

/** `24 Agu 2026` in WIB, or "—" for unpublished drafts. */
export function formatPublishedDate(iso: string | null): string {
  if (!iso) return "—";
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsed);
}

/** `1,2 MB` / `840 KB` for the gallery card footer. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/** Reading-time hint shown under an article title. */
export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
