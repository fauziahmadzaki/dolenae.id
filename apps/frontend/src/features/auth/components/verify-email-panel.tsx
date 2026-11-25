"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, Loader2, Mail } from "lucide-react";
import { verifyEmailAction } from "../api/email-verification";

type VerifyState =
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

interface VerifyEmailPanelProps {
  /** Token from the email link (`/auth/verify-email?token=...`). */
  token: string;
}

/** Verifies the token once on mount and renders the three states. */
export function VerifyEmailPanel({ token }: VerifyEmailPanelProps) {
  const [state, setState] = useState<VerifyState>({ status: "loading" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    verifyEmailAction(token).then((result) => {
      setState(
        result.ok
          ? { status: "success", message: result.message }
          : { status: "error", message: result.message },
      );
    });
  }, [token]);

  if (state.status === "loading") {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-canvas-subtle text-primary">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
            Memverifikasi email
          </h1>
          <p className="text-sm text-body">Sebentar ya, jangan tutup halaman ini.</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-canvas-subtle text-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </span>

        <div className="space-y-2">
          <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
            Verifikasi gagal
          </h1>
          <p className="text-sm text-body">{state.message}</p>
        </div>

        <p className="text-xs text-body">
          Pastikan kamu membuka tautan terbaru dari email. Kalau tautan sudah
          tidak berlaku, masuk ke aplikasi lalu minta kirim ulang.
        </p>

        <div className="space-y-4 pt-1">
          <Link
            href="/auth/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            Masuk ke akun
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-canvas-subtle text-success">
        <Check className="h-6 w-6" strokeWidth={2.5} aria-hidden />
      </span>

      <div className="space-y-2">
        <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          Email terverifikasi
        </h1>
        <p className="text-sm text-body">{state.message}</p>
      </div>

      <p className="flex items-center justify-center gap-2 text-xs text-body">
        <Mail className="h-4 w-4" aria-hidden />
        Notifikasi penting Dolenae.id sekarang bisa sampai ke inbox kamu.
      </p>

      <div className="pt-1">
        <Link
          href="/auth/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
        >
          Masuk ke akun
        </Link>
      </div>
    </div>
  );
}
