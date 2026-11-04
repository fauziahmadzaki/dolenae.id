"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Mountain } from "lucide-react";
import { cn } from "~/lib/cn";
import type { Destination } from "~/types/domain";
import { rupiah } from "~/features/operations/types";

const difficulties = { "ramah-pemula": ["Ramah pemula", "bg-success/10 text-success"], menengah: ["Menengah", "bg-warning/10 text-warning"], sulit: ["Sulit", "bg-danger/10 text-danger"] };
export function DestinationCard({ destination: d }: { destination: Destination }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return <article className="overflow-hidden rounded-xl border border-hairline bg-canvas-subtle shadow-sm">
    <div className="flex h-52 w-full items-center justify-center overflow-hidden bg-canvas-subtle">{d.images[0] && d.images[0] !== failedImage ? <img src={d.images[0]} alt={d.name} className="h-full w-full object-cover" loading="lazy" onError={() => setFailedImage(d.images[0])} /> : <span className="flex flex-col items-center gap-2 text-sm text-body"><Mountain aria-hidden className="h-8 w-8" />Foto belum tersedia</span>}</div>
    <div className="flex flex-col gap-2 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-display text-lg font-bold text-ink"><Link href={`/destinations/${d.id}`} className="hover:underline focus-visible:outline-2 focus-visible:outline-primary">{d.name}</Link></h3><span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold", difficulties[d.difficulty][1])}>{difficulties[d.difficulty][0]}</span></div>
      <p className="flex items-center gap-1.5 text-sm text-body"><MapPin aria-hidden className="h-4 w-4 shrink-0" />{[d.elevationMeters == null ? null : `${d.elevationMeters.toLocaleString("id-ID")} mdpl`, d.location.regency ?? d.location.province].filter(Boolean).join(" · ") || "Lokasi belum tersedia"}</p><div className="mt-1 flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-ink">{d.entryFee == null ? "Harga belum tersedia" : rupiah(d.entryFee)}</span>{d.terrain[0] && <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-body">{d.terrain[0]}</span>}</div>
    </div></article>;
}

