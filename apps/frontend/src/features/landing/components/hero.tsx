import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { heroChips } from "~/features/landing/data";

export function Hero() {
  return (
    <section className="bg-canvas-subtle">
      <div className="mx-auto grid max-w-[1248px] items-center gap-8 px-6 py-12 lg:min-h-[520px] lg:grid-cols-2 lg:gap-20 lg:py-20">
        <div className="flex flex-col items-start gap-5">
          <span className="text-[11px] leading-[14px] font-semibold text-primary">
            DISCOVER MORE, PREPARE BETTER
          </span>
          <h1 className="font-display text-[32px] leading-[40px] font-extrabold text-ink md:text-[40px] md:leading-[48px]">
            Temukan destinasi alam, siapkan perjalanannya
          </h1>
          <p className="text-lg leading-7 text-body">
            Info akses, fasilitas sekitar, dan checklist persiapan pegunungan
            Indonesia dalam satu tempat.
          </p>

          <form action="/destinations" className="flex h-14 w-full items-center gap-2.5 rounded-full border border-hairline bg-surface pr-1.5 pl-3 focus-within:ring-2 focus-within:ring-primary/25 sm:pl-5">
            <Search aria-hidden className="size-5 shrink-0 text-body" />
            <input
              name="q"
              aria-label="Cari destinasi"
              placeholder="Mau ke mana?"
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-body"
            />
            <Button type="submit" className="h-11 shrink-0 px-3 sm:px-6">
              Cari destinasi
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {heroChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex h-8 items-center rounded-full border border-hairline bg-canvas px-3.5 text-xs font-medium text-ink"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="relative aspect-[14/9] overflow-hidden rounded-[24px] bg-primary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/public/landing-hero.jpg"
            alt="Pemandangan matahari terbit di pegunungan"
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
