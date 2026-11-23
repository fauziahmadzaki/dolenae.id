import { BadgeCheck, Bed, Car, Utensils, type LucideIcon } from "lucide-react";
import { supports } from "~/features/landing/data";

const icons: LucideIcon[] = [Bed, Car, Utensils];

export function Support() {
  return (
    <section id="support" className="bg-canvas-subtle py-24">
      <div className="mx-auto max-w-[1248px] px-6">
        <div className="mb-6">
          <h2 className="font-display text-2xl leading-8 font-bold text-ink">
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
                className="flex flex-col gap-3.5 rounded-xl border border-hairline bg-surface p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-canvas text-primary">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-canvas-subtle px-2.5 py-1 text-[11px] font-semibold text-success">
                    <BadgeCheck aria-hidden className="size-3.5" />
                    Terverifikasi
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-sans text-base font-semibold text-ink">
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
