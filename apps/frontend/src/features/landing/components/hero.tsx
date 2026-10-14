import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { heroChips } from "~/features/landing/data";

export function Hero() {
  return (
    <section className="bg-canvas-subtle">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-5">
          <span className="text-xs font-semibold tracking-[0.2em] text-primary">
            DISCOVER MORE, PREPARE BETTER
          </span>
          <h1 className="font-display text-5xl font-extrabold leading-[1.08] text-ink">
            Temukan destinasi alam, siapkan perjalanannya
          </h1>
          <p className="max-w-lg text-lg text-body">
            Info akses, fasilitas sekitar, dan checklist persiapan pegunungan
            Indonesia dalam satu tempat.
          </p>

          <form className="flex w-full max-w-lg items-center gap-2 rounded-full border border-hairline bg-surface p-1.5 shadow-sm">
            <Search className="ml-3 h-5 w-5 shrink-0 text-body" />
            <input
              aria-label="Cari destinasi"
              placeholder="Mau ke mana?"
              className="h-10 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-body"
            />
            <Button type="submit" className="h-10">
              Cari destinasi
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {heroChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-hairline bg-surface px-4 py-1.5 text-sm text-body"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="relative h-full min-h-[360px] overflow-hidden rounded-2xl bg-primary">
          {/* Hero photo — Unsplash (placeholder, ganti dgn aset final bila ada). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1120&h=720&fit=crop&q=80"
            alt="Pemandangan pegunungan Indonesia"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
