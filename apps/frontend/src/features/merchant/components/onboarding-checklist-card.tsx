"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  X,
} from "lucide-react";
import { cn } from "~/lib/cn";
import { useMerchantOnboarding } from "../hooks/use-merchant-onboarding";

export function OnboardingChecklistCard() {
  const {
    steps,
    completedCount,
    totalCount,
    percent,
    isComplete,
    dismissed,
    dismiss,
    pendingCount,
    publishedCount,
    rejectedCount,
    isLoading,
  } = useMerchantOnboarding();

  const showRejectedBanner = rejectedCount > 0;
  const showPendingBanner =
    !showRejectedBanner && pendingCount > 0 && publishedCount === 0;
  const showChecklist = !isLoading && !isComplete && !dismissed;

  if (!showRejectedBanner && !showPendingBanner && !showChecklist) {
    return null;
  }

  return (
    <div className="space-y-3">
      {showRejectedBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-semibold text-ink">
                {rejectedCount} fasilitas perlu diperbaiki
              </p>
              <p className="text-xs text-body">
                Periksa kembali lokasi, kontak, atau foto fasilitas lalu simpan
                perubahan untuk mengajukan verifikasi ulang.
              </p>
            </div>
          </div>
          <Link
            href="/merchant/fasilitas"
            className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline"
          >
            Lihat fasilitas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {showPendingBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-semibold text-ink">
                {pendingCount} fasilitas sedang ditinjau tim Dolenae
              </p>
              <p className="text-xs text-body">
                Sambil menunggu persetujuan admin, Anda sudah bisa melengkapi
                daftar produk atau layanan fasilitas tersebut.
              </p>
            </div>
          </div>
          <Link
            href="/merchant/fasilitas"
            className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline"
          >
            Pantau status <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {showChecklist && (
        <section className="rounded-xl border border-hairline bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-ink">
                  Selesaikan persiapan usaha Anda
                </h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {completedCount}/{totalCount} selesai
                </span>
              </div>
              <p className="text-xs text-body">
                Ikuti langkah berikut agar profil dan fasilitas Anda siap tayang
                ke wisatawan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/merchant/onboarding"
                className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
              >
                Buka panduan
              </Link>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Tutup daftar persiapan"
                className="rounded-md p-1 text-body transition-colors hover:bg-canvas-subtle hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-canvas-subtle">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-4 divide-y divide-hairline rounded-lg border border-hairline">
            {steps.map((step) => (
              <div
                key={step.key}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-body/50" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        step.completed
                          ? "text-body line-through"
                          : "text-ink",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-body">{step.description}</p>
                  </div>
                </div>

                {!step.completed && (
                  <Link
                    href={step.href}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-hairline bg-canvas-subtle px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-border-strong"
                  >
                    {step.ctaLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
