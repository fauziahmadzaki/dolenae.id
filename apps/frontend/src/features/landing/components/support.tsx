import { BadgeCheck, Bed, Car, Utensils, type LucideIcon } from "lucide-react";
import { supports } from "~/features/landing/data";

const icons: LucideIcon[] = [Bed, Car, Utensils];

export function Support() {
  return (
    <section id="support" className="bg-canvas-subtle py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-extrabold text-ink">
            Ekosistem pendukung
          </h2>
          <p className="mt-1 text-body">
            Penginapan, transportasi, dan tempat makan di sekitar destinasi.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {supports.map((support, i) => {
            const Icon = icons[i] ?? Bed;
            return (
              <article
                key={support.name}
                className="relative flex gap-4 rounded-xl border border-hairline bg-surface p-5"
              >
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-canvas-subtle px-2.5 py-1 text-[11px] font-semibold text-success">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Terverifikasi
                </span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-canvas-subtle text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex flex-col gap-1 pt-1">
                  <h3 className="pr-24 font-display text-base font-bold text-ink">
                    {support.name}
                  </h3>
                  <p className="text-sm text-body">{support.type}</p>
                  <span className="mt-1 text-sm font-semibold text-ink">
                    {support.price}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
