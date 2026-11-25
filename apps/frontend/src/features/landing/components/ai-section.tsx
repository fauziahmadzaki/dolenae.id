import { ArrowRight, Check, Sparkles } from "lucide-react";
import { aiFeatures } from "~/features/landing/data";

export function AiSection() {
  return (
    <section id="ai" className="bg-canvas py-24">
      <div className="mx-auto grid max-w-[1248px] items-center gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-16">
        <div className="flex flex-col items-start gap-5">
          <span className="text-[11px] leading-[14px] font-semibold text-primary">
            PERSIAPAN AI
          </span>
          <h2 className="font-display text-2xl leading-8 font-bold text-ink">
            Jangan lupa bawa apa? Tanya Dolenae.
          </h2>
          <p className="text-body">
            AI menyusun checklist perlengkapan dan memberi gambaran kondisi
            perjalanan sesuai destinasi dan gaya kamu.
          </p>
          <ul className="flex flex-col gap-3">
            {aiFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-body"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-canvas-subtle text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-start gap-4 rounded-[20px] bg-primary p-6 text-on-primary">
          <div className="grid h-40 w-full place-items-center rounded-xl bg-primary-hover">
            <Sparkles aria-hidden className="size-14 text-accent" strokeWidth={1.25} />
          </div>
          <span className="text-xs font-semibold tracking-wide text-on-primary/70">
            RENCANA 2 HARI, BUDGET 500RB
          </span>
          <p className="font-display text-xl leading-7 font-bold text-on-primary">
            Temukan 3 destinasi dan 12 item checklist
          </p>
          <p className="text-sm text-on-primary/75">
            Contoh hasil rekomendasi berbasis aturan dari preferensi yang kamu
            isi.
          </p>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
          >
            Mulai sekarang
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
