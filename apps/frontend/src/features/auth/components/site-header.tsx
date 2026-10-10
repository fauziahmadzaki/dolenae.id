import Link from "next/link";
import { BrandMark } from "~/components/brand-mark";

const NAV_ITEMS = [
  { label: "Destinasi", href: "/destinasi" },
  { label: "Fasilitas Sekitar", href: "/fasilitas" },
  { label: "Persiapan AI", href: "/persiapan-ai" },
  { label: "Tentang Kami", href: "/tentang-kami" },
] as const;

/**
 * Site-wide header (slice of the "Masuk" frame in Figma).
 * TODO(SCRUM-9+): lift into a shared layout once the landing nav routes exist.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-hairline bg-surface">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-6 lg:px-[120px]">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-display text-[20px] font-bold text-ink">
            Dolenae.id
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-8 text-sm md:flex"
        >
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={index === 0 ? "text-ink" : "text-body hover:text-ink"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-primary transition-colors hover:bg-canvas-subtle"
          >
            Masuk
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}