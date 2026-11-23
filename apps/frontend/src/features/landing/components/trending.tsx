import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { destinations } from "~/features/landing/data";
import { DestinationCard } from "./destination-card";

export function Trending() {
  return (
    <section id="destinations" className="bg-canvas py-24">
      <div className="mx-auto max-w-[1248px] px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl leading-8 font-bold text-ink">
              Destinasi populer
            </h2>
            <p className="mt-1 text-body">
              Paling banyak dicari wisatawan minggu ini.
            </p>
          </div>
          <Link
            href="/destinations"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Lihat semua <ChevronRight aria-hidden className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {destinations.map((d) => (
            <DestinationCard key={d.name} destination={d} />
          ))}
        </div>
      </div>
    </section>
  );
}
