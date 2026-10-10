import { Mountain } from "lucide-react";
import { footerColumns } from "~/features/landing/data";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-on-primary">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-on-primary text-primary">
              <Mountain className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold text-on-primary">
              Dolenae.id
            </span>
          </div>
          <p className="max-w-xs text-sm text-on-primary/75">
            Discover More, Prepare Better. Temukan destinasi alam dan siapkan
            perjalananmu.
          </p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-wider text-on-primary/60">
              {col.title}
            </h3>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link}>
                  <span className="text-sm text-on-primary/85 hover:text-on-primary">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-on-primary/15">
        <div className="mx-auto max-w-[1200px] px-6 py-5 text-xs text-on-primary/60">
          © 2026 Dolenae.id. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
