import type { CategoryDistributionItem } from "../schema";

const SIZE = 200;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_SEGMENTS = 6;

const PALETTE = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-border-strong)",
  "var(--color-body)",
  "var(--color-hairline)",
];

interface CategoryDonutProps {
  items: CategoryDistributionItem[];
  totalDestinations: number;
  isLoading: boolean;
}

export function CategoryDonut({
  items,
  totalDestinations,
  isLoading,
}: CategoryDonutProps) {
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const head = sorted.slice(0, MAX_SEGMENTS);
  const rest = sorted.slice(MAX_SEGMENTS);
  const restCount = rest.reduce((sum, item) => sum + item.count, 0);
  const segments = restCount
    ? [
        ...head,
        {
          id: "other",
          name: "Lainnya",
          slug: "lainnya",
          count: restCount,
        },
      ]
    : head;
  const totalLinks = segments.reduce((sum, item) => sum + item.count, 0);

  let offset = 0;

  return (
    <section className="rounded-xl border border-hairline bg-surface">
      <div className="border-b border-hairline px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">
          Persebaran kategori destinasi
        </h2>
        <p className="text-xs text-body">
          Proporsi destinasi berdasarkan kategori.
        </p>
      </div>

      <div className="space-y-4 p-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-[200px] w-[200px] animate-pulse rounded-full bg-canvas-subtle" />
            <div className="h-16 w-full animate-pulse rounded-lg bg-canvas-subtle" />
          </div>
        ) : segments.length === 0 ? (
          <p className="py-16 text-center text-sm text-body">
            Belum ada kategori dengan destinasi.
          </p>
        ) : (
          <>
            <div className="relative mx-auto h-[200px] w-[200px]">
              <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                role="img"
                aria-label={`Donut persebaran ${totalDestinations} destinasi ke dalam ${segments.length} kategori`}
                className="h-full w-full -rotate-90"
              >
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke="var(--color-canvas-subtle)"
                  strokeWidth={STROKE}
                />
                {segments.map((item, index) => {
                  const length = (item.count / totalLinks) * CIRCUMFERENCE;
                  const segment = (
                    <circle
                      key={item.id}
                      cx={SIZE / 2}
                      cy={SIZE / 2}
                      r={RADIUS}
                      fill="none"
                      stroke={PALETTE[index % PALETTE.length]}
                      strokeWidth={STROKE}
                      strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                      strokeDashoffset={-offset}
                    >
                      <title>
                        {`${item.name}: ${item.count} destinasi`}
                      </title>
                    </circle>
                  );
                  offset += length;
                  return segment;
                })}
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-bold text-ink">
                  {totalDestinations.toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-body">destinasi</span>
              </div>
            </div>

            <ul className="space-y-2">
              {segments.map((item, index) => {
                const share = Math.round((item.count / totalLinks) * 100);
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            PALETTE[index % PALETTE.length],
                        }}
                      />
                      <span className="truncate text-ink">{item.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-body">
                      {item.count} · {share}%
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="text-[11px] text-body">
              Satu destinasi bisa masuk beberapa kategori, jadi total persentase
              mengikuti tautan kategori.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
