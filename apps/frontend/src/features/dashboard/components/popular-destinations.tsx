import Link from "next/link";
import { ArrowRight, Mountain } from "lucide-react";
import type { PopularDestination, RecentDestination } from "../schema";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function regionLabel(item: {
  regency: string | null;
  province: string | null;
}): string {
  return [item.regency, item.province].filter(Boolean).join(", ") || "—";
}

function Thumbnail({
  image,
  name,
}: {
  image: string | null;
  name: string;
}) {
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-canvas-subtle">
      {image ? (
        // Remote Wikimedia URLs are already used as plain <img> elsewhere in admin.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-body">
          <Mountain aria-hidden className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

interface PopularDestinationsProps {
  popular: PopularDestination[];
  recent: RecentDestination[];
  isLoading: boolean;
}

export function PopularDestinations({
  popular,
  recent,
  isLoading,
}: PopularDestinationsProps) {
  const usingPlans = popular.length > 0;
  const maxPlans = Math.max(1, ...popular.map((item) => item.planCount));

  return (
    <section className="rounded-xl border border-hairline bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">
            {usingPlans
              ? "Destinasi populer di rencana AI"
              : "Destinasi terbaru"}
          </h2>
          <p className="text-xs text-body">
            {usingPlans
              ? "Destinasi yang paling sering muncul di itinerary AI pengguna."
              : "Belum ada data rencana AI. Menampilkan destinasi yang baru ditambahkan."}
          </p>
        </div>
        <Link
          href="/admin/destinasi"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
        >
          Lihat semua <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="h-14 animate-pulse rounded-lg bg-canvas-subtle"
            />
          ))}
        </div>
      ) : usingPlans ? (
        <ol className="divide-y divide-hairline">
          {popular.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span className="w-6 shrink-0 font-display text-sm font-bold tabular-nums text-body">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Thumbnail image={item.image} name={item.name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <Link
                    href={`/admin/destinasi/${item.id}/edit`}
                    className="truncate text-sm font-semibold text-ink hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    {item.planCount} rencana
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs text-body">
                    {regionLabel(item)}
                  </p>
                  <div
                    className="h-1.5 w-24 overflow-hidden rounded-full bg-canvas-subtle"
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.round((item.planCount / maxPlans) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : recent.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-body">
          Belum ada destinasi di katalog.
        </p>
      ) : (
        <ul className="divide-y divide-hairline">
          {recent.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <Thumbnail image={item.image} name={item.name} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/destinasi/${item.id}/edit`}
                  className="block truncate text-sm font-semibold text-ink hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="truncate text-xs text-body">
                  {regionLabel(item)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-body">
                {formatDate(item.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
