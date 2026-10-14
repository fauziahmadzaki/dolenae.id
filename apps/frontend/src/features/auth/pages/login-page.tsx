"use client";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { LoginForm } from "../components/login-form";
import { LoginHero } from "../components/login-hero";

/**
 * SCRUM-8 — login page (slice of "Hi-Fi Web - Masuk (1440)").
 * Composition layer: header + split body (form | value panel) + footer.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:grid lg:grid-cols-2">
        <LoginForm />
        <LoginHero />
      </main>
      <SiteFooter />
    </div>
  );
}