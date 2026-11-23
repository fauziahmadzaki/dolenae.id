"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MountainSnow } from "lucide-react";
import type { PopularDestination, RecentDestination } from "../schema";

const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });
const cardCount = 3;

interface PopularDestinationsProps {
  popular: PopularDestination[];
  recent: RecentDestination[];
  isLoading: boolean;
}

export function PopularDestinations({ popular, recent, isLoading }: PopularDestinationsProps) {
  const [page, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(recent.length / cardCount) - 1);
  const currentPage = Math.min(page, lastPage);

  return (
    <div className="space-y-5">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-sans text-lg font-bold">Destinasi Terbaru</h2>
          <div className="flex items-center gap-2">
            <Link href="/admin/destinasi" className="mr-1 text-xs font-semibold text-primary hover:underline">Lihat semua</Link>
            <button type="button" aria-label="Destinasi sebelumnya" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="grid size-9 place-items-center rounded-full border border-hairline bg-surface text-primary disabled:opacity-50"><ChevronLeft aria-hidden className="size-4" /></button>
            <button type="button" aria-label="Destinasi berikutnya" disabled={currentPage === lastPage} onClick={() => setPage(currentPage + 1)} className="grid size-9 place-items-center rounded-full bg-primary text-on-primary disabled:opacity-50"><ChevronRight aria-hidden className="size-4" /></button>
          </div>
        </div>
        {isLoading ? (
          <p role="status" className="rounded-xl border border-hairline bg-surface p-5 text-sm">Memuat destinasi…</p>
        ) : recent.length ? (
          <ul className="grid gap-4 sm:grid-cols-3">
            {recent.slice(currentPage * cardCount, (currentPage + 1) * cardCount).map((item) => (
              <li key={item.id}>
                <Link href={`/admin/destinasi/${item.id}/edit`} className="group block overflow-hidden rounded-[20px] border border-hairline bg-surface hover:border-border-strong">
                  <div className="relative grid h-[116px] place-items-center bg-canvas-subtle text-primary">
                    <MountainSnow aria-hidden className="size-8" />
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="absolute inset-0 size-full object-cover" onError={(event) => { event.currentTarget.hidden = true; }} />
                    )}
                  </div>
                  <div className="space-y-2 p-3.5">
                    <p className="w-fit max-w-full truncate rounded-full bg-canvas-subtle px-2 py-1 text-[11px] text-body">{[item.regency, item.province].filter(Boolean).join(", ") || "—"}</p>
                    <h3 className="truncate font-sans text-sm font-semibold group-hover:underline">{item.name}</h3>
                    <p className="text-xs text-body">Ditambahkan {date.format(new Date(item.createdAt))}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-hairline bg-surface p-5 text-sm">Belum ada destinasi di katalog.</p>
        )}
      </section>
      {popular.length > 0 && (
        <section className="rounded-[20px] border border-hairline bg-surface">
          <h2 className="px-5 py-4 font-sans font-bold">Destinasi populer di rencana AI</h2>
          <ol className="divide-y divide-hairline border-t border-hairline">
            {popular.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                <div>
                  <Link href={`/admin/destinasi/${item.id}/edit`} className="font-semibold text-ink hover:underline">{item.name}</Link>
                  <p className="text-xs text-body">{[item.regency, item.province].filter(Boolean).join(", ")}</p>
                </div>
                <span className="shrink-0 rounded-full bg-canvas-subtle px-2 py-1 text-xs font-semibold text-primary">{item.planCount} rencana</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
