"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, Globe, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/toaster";
import { cn } from "~/lib/cn";
import { useLoginForm } from "../hooks/use-login-form";
import { BrandMark } from "./brand-mark";
import { LoginTabs } from "./login-tabs";

/** Login form (left column of the "Masuk" frame in Figma). */
export function LoginForm() {
  const { form, onSubmit, isSubmitting } = useLoginForm();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const remember = form.watch("remember");
  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;

  const handleGoogle = () => {
    // TODO(post-SCRUM-8): wire Google Identity Services → POST /api/auth/google.
    toast({
      title: "Masuk dengan Google",
      description: "Fitur ini menyusul di sprint berikutnya.",
      variant: "info",
    });
  };

  return (
    <section
      aria-label="Form masuk"
      className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:px-[100px] lg:py-0"
    >
      <div className="w-full max-w-[520px]">
        <div className="space-y-5">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-lg font-bold text-ink">Dolenae.id</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight text-ink">
              Masuk ke akunmu
            </h1>
            <p className="text-[15px] text-body">
              Lanjutkan menyiapkan perjalanan yang sudah kamu mulai.
            </p>
          </div>

          <LoginTabs />

          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-body"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                aria-invalid={emailError ? true : undefined}
                disabled={isSubmitting}
                {...form.register("email")}
              />
              {emailError && (
                <p role="alert" className="text-xs text-danger">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-body"
              >
                Kata sandi
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Kata sandi Anda"
                  aria-invalid={passwordError ? true : undefined}
                  disabled={isSubmitting}
                  className="pr-11"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute inset-y-0 right-3 flex items-center text-body transition-colors hover:text-ink"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p role="alert" className="text-xs text-danger">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={remember}
                  onChange={(e) => form.setValue("remember", e.target.checked)}
                />
                <span
                  aria-hidden
                  className={cn(
                    "inline-flex h-[18px] w-[18px] items-center justify-center rounded",
                    remember ? "bg-primary" : "border border-hairline bg-surface",
                  )}
                >
                  {remember && (
                    <Check className="h-3 w-3 text-on-primary" strokeWidth={3} />
                  )}
                </span>
                Ingat saya
              </label>

              {/* TODO: forgot-password page */}
              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold text-primary hover:text-primary-hover"
              >
                Lupa kata sandi?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              )}
              Masuk
            </Button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-hairline" />
              <span className="text-xs font-medium text-body">
                atau lanjut dengan
              </span>
              <span className="h-px flex-1 bg-hairline" />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleGoogle}
              disabled={isSubmitting}
            >
              <Globe className="h-[18px] w-[18px]" aria-hidden />
              Google
            </Button>

            <p className="pt-2 text-center text-sm text-body">
              Belum punya akun?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-primary hover:text-primary-hover"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}