import { Star } from "lucide-react";
import { testimonials } from "~/features/landing/data";

export function Testimonials() {
  return (
    <section className="bg-canvas py-24">
      <div className="mx-auto max-w-[1248px] px-6">
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <h2 className="font-display text-2xl leading-8 font-bold text-ink">
            Kata mereka
          </h2>
          <p className="mt-1 text-body">
            Cerita wisatawan yang sudah menyiapkan perjalanan lewat Dolenae.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <figure
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-hairline bg-canvas-subtle p-6"
            >
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-body">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                {index !== 1 && (
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display font-bold text-on-primary">
                    {t.initial}
                  </span>
                )}
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-ink">
                    {t.name}
                  </span>
                  <span className="text-xs text-body">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
