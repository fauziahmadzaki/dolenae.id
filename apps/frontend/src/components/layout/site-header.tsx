import Link from "next/link";
import { BrandMark } from "~/components/brand-mark";
import { navItems } from "~/features/landing/data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface">
      <div className="mx-auto flex h-[71px] max-w-[1248px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-display text-xl font-bold text-ink">
            Dolenae.id
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-body transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <details className="relative lg:hidden">
            <summary className="cursor-pointer rounded-md px-2 py-2 text-sm font-semibold text-primary">Menu</summary>
            <nav aria-label="Navigasi seluler" className="absolute right-0 top-full z-50 flex w-56 flex-col gap-4 rounded-lg border border-hairline bg-surface p-5 shadow-md">
              {navItems.map((item) => <Link key={item.label} href={item.href} className="text-sm text-body hover:underline">{item.label}</Link>)}
              <Link href="/bantuan" className="text-sm text-body">Pusat Bantuan</Link>
              <Link href="/kontak" className="text-sm text-body">Kontak</Link>
              <Link href="/karier" className="text-sm text-body">Karier</Link>
              <Link href="/privasi-keamanan" className="text-sm text-body">Privasi &amp; Keamanan</Link>
            </nav>
          </details>
          <Link
            href="/auth/login"
            prefetch={false}
            className="hidden h-10 items-center px-4 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            Masuk
          </Link>
          <Link
            href="/auth/register"
            prefetch={false}
            className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
