import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { LoginForm } from "../components/login-form";
import { LoginHero } from "../components/login-hero";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col lg:grid lg:grid-cols-2">
        <LoginForm />
        <LoginHero />
      </main>
      <SiteFooter compact />
    </div>
  );
}
