import { Check, Mountain } from "lucide-react";

const VALUE_POINTS = [
  "Rekomendasi destinasi sesuai minat dan waktu",
  "Info akses, fasilitas, dan checklist lengkap",
  "Rencana perjalanan tersimpan rapi",
] as const;

/** Right-hand value panel of the login page (desktop only, from Figma). */
export function LoginHero() {
  return (
    <aside className="hidden flex-col justify-center gap-4 bg-primary px-20 py-16 lg:flex">
      <Mountain
        aria-hidden
        className="h-[140px] w-[140px] text-canvas"
        strokeWidth={1.5}
      />

      <h2 className="mt-4 text-[28px] font-bold leading-snug text-on-primary">
        Discover More, Prepare Better
      </h2>
      <p className="max-w-[560px] text-[15px] text-canvas">
        Semua kebutuhan perjalanan alam Indonesia dalam satu tempat.
      </p>

      <ul className="mt-2 space-y-4">
        {VALUE_POINTS.map((point) => (
          <li key={point} className="flex items-center gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-hover">
              <Check aria-hidden className="h-3.5 w-3.5 text-canvas" strokeWidth={2.5} />
            </span>
            <span className="text-[15px] text-canvas">{point}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}