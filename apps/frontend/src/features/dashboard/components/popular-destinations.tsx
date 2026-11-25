"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MountainSnow } from "lucide-react";
import { formatRelativeId } from "~/lib/format-date";
import type { Destination } from "~/types/domain";
import type { PopularDestination, RecentDestination } from "../schema";

const CARD_COUNT = 3;

export interface RecentDestinationCardItem {
  id: string;
  name: string;
  tag: string;
  image: string | null;
  updatedAt: string;
}

export function mapDestinationCards(
  destinations: Destination[] | undefined,
  fallback: RecentDestination[],
  categoryName: (id: string) => string | undefined,
): RecentDestinationCardItem[] {
  if (destinations?.length) {
    return destinations.map((item) => {
      const cat = item.categoryIds.map(categoryName).find(Boolean);
      const region = [item.location.regency, item.location.province]
        .filter(Boolean)
        .join(", ");
      return {
        id: item.id,
        name: item.name,
        tag: cat ?? (region || "Destinasi"),
        image: item.images[0] ?? null,
        updatedAt: item.updatedAt || item.createdAt,
      };
    });
  }

  return fallback.map((item) => ({
    id: item.id,
    name: item.name,
    tag: [item.regency, item.province].filter(Boolean).join(", ") || "Destinasi",
    image: item.image,
    updatedAt: item.createdAt,
  }));
}

interface RecentDestinationsSectionProps {
  items: RecentDestinationCardItem[];
  isLoading: boolean;
}

export function RecentDestinationsSection({
  items,
  isLoading,
}: RecentDestinationsSectionProps) {
  const [page, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(items.length / CARD_COUNT) - 1);
  const currentPage = Math.min(page, lastPage);
  const visible = items.slice(
    currentPage * CARD_COUNT,
    (currentPage + 1) * CARD_COUNT,
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-ink">
          Destinasi Terbaru
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Destinasi sebelumnya"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
            className="grid size-9 place-items-center rounded-full border border-hairline bg-surface text-primary transition-colors hover:bg-canvas-subtle disabled:opacity-50"
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Destinasi berikutnya"
            disabled={currentPage === lastPage}
            onClick={() => setPage(currentPage + 1)}
            className="grid size-9 place-items-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p
          role="status"
          className="rounded-2xl border border-hairline bg-surface p-5 text-sm text-body"
        >
          Memuat destinasi…
        </p>
      ) : visible.length ? (
        <ul className="grid gap-4 sm:grid-cols-3">
          {visible.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/destinasi/${item.id}/edit`}
                className="group block overflow-hidden rounded-[20px] border border-hairline bg-surface transition-colors hover:border-border-strong"
              >
                <div className="relative grid h-[116px] place-items-center bg-canvas-subtle text-primary">
                  <MountainSnow aria-hidden className="size-8" />
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                      onError={(event) => {
                        event.currentTarget.hidden = true;
                      }}
                    />
                  )}
                </div>
                <div className="space-y-2 p-3.5">
                  <span className="inline-block max-w-full truncate rounded-full bg-canvas-subtle px-2.5 py-0.5 text-[11px] font-medium text-body">
                    {item.tag}
                  </span>
                  <h3 className="truncate font-sans text-sm font-semibold text-ink group-hover:underline">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-body">
                    <span
                      aria-hidden
                      className="grid size-5 shrink-0 place-items-center rounded-full bg-canvas-subtle text-primary"
                    >
                      <Clock className="size-3" />
                    </span>
                    <span className="truncate">
                      Diperbarui {formatRelativeId(item.updatedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-hairline bg-surface p-5 text-sm text-body">
          Belum ada destinasi di katalog.
        </p>
      )}
    </section>
  );
}

export function AiPopularDestinationsCard({
  popular,
}: {
  popular: PopularDestination[];
}) {
  if (!popular.length) return null;

  return (
    <section className="rounded-[20px] border border-hairline bg-surface">
      <h2 className="px-5 py-4 font-display text-base font-bold text-ink">
        Destinasi populer di rencana AI
      </h2>
      <ol className="divide-y divide-hairline border-t border-hairline">
        {popular.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 px-5 py-3 text-sm"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/destinasi/${item.id}/edit`}
                className="font-semibold text-ink hover:underline"
              >
                {item.name}
              </Link>
              <p className="truncate text-xs text-body">
                {[item.regency, item.province].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-canvas-subtle px-2.5 py-1 text-xs font-semibold text-primary">
              {item.planCount} rencana
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
