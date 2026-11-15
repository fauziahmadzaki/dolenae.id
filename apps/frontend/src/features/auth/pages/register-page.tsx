"use client";

import { LoginHero } from "../components/login-hero";
import { RegisterForm } from "../components/register-form";

/**
 * Merchant registration page — same full-bleed split layout as login, without
 * the public site header/footer.
 */
export default function RegisterPage() {
  return (
    <main className="flex min-h-[100dvh] w-full flex-1 flex-col lg:grid lg:grid-cols-2">
      <RegisterForm />
      <LoginHero />
    </main>
  );
}
