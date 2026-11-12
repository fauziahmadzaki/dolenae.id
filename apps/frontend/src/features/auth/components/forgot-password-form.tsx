"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useForgotPasswordForm } from "../hooks/use-forgot-password-form";

/** Forgot-password form: request a reset link by email. */
export function ForgotPasswordForm() {
  const { form, onSubmit, isSubmitting, sentTo, restart } =
    useForgotPasswordForm();
  const emailError = form.formState.errors.email?.message;

  if (sentTo) {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-canvas-subtle text-primary">
          <Mail className="h-6 w-6" aria-hidden />
        </span>

        <div className="space-y-2">
          <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
            Cek email kamu
          </h1>
          <p className="text-sm text-body">
            Jika <span className="font-semibold text-ink">{sentTo}</span>{" "}
            terdaftar, kami sudah mengirim tautan untuk membuat kata sandi baru.
          </p>
        </div>

        <p className="text-xs text-body">
          Tautan berlaku 60 menit. Tidak menemukannya? Cek folder spam, lalu
          kirim ulang.
        </p>

        <div className="space-y-4 pt-1">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={restart}
          >
            Kirim ke email lain
          </Button>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          Lupa kata sandi?
        </h1>
        <p className="text-sm text-body">
          Masukkan email yang terdaftar. Kami akan mengirim tautan untuk membuat
          kata sandi baru.
        </p>
      </div>

      <form className="space-y-5" noValidate onSubmit={onSubmit}>
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
          Kirim tautan reset
        </Button>
      </form>

      <Link
        href="/auth/login"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke halaman masuk
      </Link>
    </div>
  );
}
