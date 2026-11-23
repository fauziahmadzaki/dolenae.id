"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { BrandMark } from "~/components/brand-mark";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useRegisterForm } from "../hooks/use-register-form";
import { LoginTabs } from "./login-tabs";

/** Merchant registration form (left column of the auth split layout). */
export function RegisterForm() {
  const { form, onSubmit, isSubmitting } = useRegisterForm();
  const [showPassword, setShowPassword] = useState(false);

  const nameError = form.formState.errors.name?.message;
  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const confirmError = form.formState.errors.confirmPassword?.message;

  return (
    <section
      aria-label="Form daftar merchant"
      className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:items-end lg:px-[min(7vw,100px)] lg:py-20"
    >
      <div className="w-full max-w-[520px]">
        <div className="space-y-5">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-lg font-bold text-ink">Dolenae.id</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight text-ink">
              Daftar sebagai merchant
            </h1>
            <p className="text-[15px] text-body">
              Kelola penginapan, transportasi, atau warung di sekitar destinasi
              dan jangkau wisatawan Dolenae.
            </p>
          </div>

          <LoginTabs active="register" />

          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="name" className="block text-xs font-medium text-body">
                Nama
              </label>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Nama Anda atau pengelola"
                aria-invalid={nameError ? true : undefined}
                disabled={isSubmitting}
                {...form.register("name")}
              />
              {nameError && (
                <p role="alert" className="text-xs text-danger">
                  {nameError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-medium text-body">
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
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  aria-invalid={passwordError ? true : undefined}
                  disabled={isSubmitting}
                  className="pr-11"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  className="absolute inset-y-0 right-3 flex items-center text-body transition-colors hover:text-ink"
                  onClick={() => setShowPassword((value) => !value)}
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

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-body"
              >
                Konfirmasi kata sandi
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Ulangi kata sandi"
                aria-invalid={confirmError ? true : undefined}
                disabled={isSubmitting}
                {...form.register("confirmPassword")}
              />
              {confirmError && (
                <p role="alert" className="text-xs text-danger">
                  {confirmError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              )}
              Buat akun merchant
            </Button>
          </form>

          <p className="text-center text-sm text-body">
            Sudah punya akun?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
