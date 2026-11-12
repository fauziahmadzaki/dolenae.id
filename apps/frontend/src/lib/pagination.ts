/** Page sizes offered by the data tables ("Tampilkan …"). */
export const PAGE_SIZES = [10, 25, 50] as const;

export const DEFAULT_PAGE_SIZE = PAGE_SIZES[0];

/** Total pages for a server-side paginated dataset (minimum 1). */
export function pageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}

export interface PageRange {
  from: number;
  to: number;
}

/** First and last row numbers shown on the current page (`0–0` when empty). */
export function pageRange(
  page: number,
  pageSize: number,
  total: number,
): PageRange {
  if (total <= 0) return { from: 0, to: 0 };

  return {
    from: Math.min((page - 1) * pageSize + 1, total),
    to: Math.min(page * pageSize, total),
  };
}
