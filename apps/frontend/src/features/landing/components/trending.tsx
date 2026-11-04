import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { get } from "~/lib/api/server";
import type { Destination } from "~/types/domain";
import { DestinationCard } from "./destination-card";
import { PublicFetchError } from "~/features/public/fetch-error";

export async function Trending() {
  let destinations: Destination[] | null = null;
  try { destinations = (await get<Destination[]>("/destinations?status=published&limit=3&sort=createdAt&order=desc")).data; } catch { /* Keep the landing usable when the API is offline. */ }
  return <section id="destinations" className="bg-canvas py-24"><div className="mx-auto max-w-[1200px] px-6"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-display text-3xl font-extrabold text-ink">Jelajahi destinasi</h2><p className="mt-1 text-body">Destinasi terbaru yang telah diterbitkan pengelola.</p></div><Link href="/destinations" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">Lihat semua <ArrowRight aria-hidden className="h-4 w-4" /></Link></div>{destinations === null ? <PublicFetchError /> : destinations.length ? <div className="grid gap-6 md:grid-cols-3">{destinations.map((d) => <DestinationCard key={d.id} destination={d} />)}</div> : <p className="text-sm text-body">Belum ada destinasi yang diterbitkan.</p>}</div></section>;
}

