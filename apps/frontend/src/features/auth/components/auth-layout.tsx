import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "~/components/brand-mark";
import { LoginHero } from "./login-hero";

/**
 * Shared shell for the auth sub-pages (forgot / reset / verify password).
 *
 * The auth segment does not render the public site header/footer: the layout is
 * full-bleed (form column + value panel) and the brand mark links back home.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-[100dvh] w-full flex-1 flex-col lg:grid lg:grid-cols-2">
      <section className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:px-[100px] lg:py-0">
        <div className="w-full max-w-[520px]">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2.5"
            aria-label="Kembali ke beranda Dolenae.id"
          >
            <BrandMark />
            <span className="font-display text-lg font-bold text-ink">
              Dolenae.id
            </span>
          </Link>
          {children}
        </div>
      </section>
      <LoginHero />
    </main>
  );
}
