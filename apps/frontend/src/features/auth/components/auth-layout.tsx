import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { LoginHero } from "./login-hero";

/**
 * Shared shell for the auth sub-pages (forgot / reset password).
 * Mirrors the login split layout: form column + value panel.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:grid lg:grid-cols-2">
        <section className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:px-[100px] lg:py-0">
          <div className="w-full max-w-[520px]">{children}</div>
        </section>
        <LoginHero />
      </main>
      <SiteFooter />
    </div>
  );
}
