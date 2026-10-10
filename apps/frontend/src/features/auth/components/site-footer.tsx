import Link from "next/link";
import { BrandMark } from "~/components/brand-mark";

const FOOTER_LINKS = [
  { label: "Destinasi", href: "/destinasi" },
  { label: "Bantuan", href: "/bantuan" },
  { label: "Privasi", href: "/privasi" },
] as const;

/**
 * Site-wide footer (slice of the "Masuk" frame in Figma).
 * TODO(SCRUM-9+): lift into a shared layout once the landing routes exist.
 */
export function SiteFooter() {
  return (
    <footer className="bg-primary">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1440px] flex-wrap items-center justify-between gap-y-3 px-6 py-4 lg:px-[120px]">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark
            size={28}
            rounded="rounded-lg"
            className="bg-primary-hover"
          />
          <span className="text-base font-bold text-on-primary">Dolenae.id</span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-canvas">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-opacity hover:opacity-80"
            >
              {item.label}
            </Link>
          ))}
          <span className="text-xs font-medium text-canvas-subtle">
            © 2026 Dolenae.id
          </span>
        </div>
      </div>
    </footer>
  );
}