import Link from "next/link";
import { Mountain } from "lucide-react";
import { navItems } from "~/features/landing/data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-on-primary">
            <Mountain className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-extrabold text-ink">
            Dolenae.id
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-body transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-10 items-center px-4 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
