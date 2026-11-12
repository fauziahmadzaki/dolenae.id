"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useResetPasswordForm } from "../hooks/use-reset-password-form";

interface ResetPasswordFormProps {
  /** One-time token from the email link (`/auth/reset-password?token=...`). */
  token: string;
}

/** Reset-password form: set a new password using the emailed token. */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { form, onSubmit, isSubmitting, done, serverError } =
    useResetPasswordForm(token);
  const [showPassword, setShowPassword] = useState(false);

  const passwordError = form.formState.errors.password?.message;
  const confirmError = form.formState.errors.confirmPassword?.message;

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-canvas-subtle text-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </span>

        <div className="space-y-2">
          <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
            Tautan tidak valid
          </h1>
          <p className="text-sm text-body">
            Tautan reset tidak lengkap atau sudah kedaluwarsa. Minta tautan baru
            untuk melanjutkan.
          </p>
        </div>

        <div className="space-y-4 pt-1">
          <Link
            href="/auth/forgot-password"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            Minta tautan baru
          </Link>
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

  if (done) {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-canvas-subtle text-success">
          <Check className="h-6 w-6" strokeWidth={2.5} aria-hidden />
        </span>

        <div className="space-y-2">
          <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
            Kata sandi diperbarui
          </h1>
          <p className="text-sm text-body">
            Kata sandi baru sudah tersimpan. Kamu bisa masuk sekarang.
          </p>
        </div>

        <div className="pt-1">
          <Link
            href="/auth/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            Masuk sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-canvas-subtle text-primary">
          <KeyRound className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="pt-1 font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          Atur kata sandi baru
        </h1>
        <p className="text-sm text-body">
          Buat kata sandi baru untuk akunmu. Minimal 8 karakter.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-xs text-danger"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            {serverError}{" "}
            <Link
              href="/auth/forgot-password"
              className="font-semibold underline"
            >
              Minta tautan baru
            </Link>
          </span>
        </div>
      )}

      <form className="space-y-5" noValidate onSubmit={onSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-body"
          >
            Kata sandi baru
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
            Ulangi kata sandi baru
          </label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Ketik ulang kata sandi"
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
          Simpan kata sandi
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
