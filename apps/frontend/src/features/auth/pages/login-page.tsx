"use client";

import { LoginForm } from "../components/login-form";
import { LoginHero } from "../components/login-hero";

/**
 * Login page — full-bleed split layout without the public site header/footer.
 * The auth segment owns its own chrome (brand mark lives inside the form).
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-[100dvh] w-full flex-1 flex-col lg:grid lg:grid-cols-2">
      <LoginForm />
      <LoginHero />
    </main>
  );
}
