"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Loader2,
  Mountain,
  RefreshCw,
  Store,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { ApiError } from "~/lib/api/types";
import { KpiCard } from "./components/kpi-card";
import { UserGrowthChart } from "./components/user-growth-chart";
import { CategoryDonut } from "./components/category-donut";
import { PopularDestinations } from "./components/popular-destinations";
import { useDashboardStats } from "./hooks/use-dashboard-stats";

export function DashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const [months, setMonths] = useState(12);

  const enabled =
    auth.hydrated && !!auth.token && auth.user?.role === "admin";
  const stats = useDashboardStats(months, auth.token, enabled);

  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);

  useEffect(() => {
    if (stats.error instanceof ApiError && stats.error.status === 401) {
      auth.logout();
      router.replace("/auth/login");
    }
  }, [stats.error, auth, router]);

  if (!auth.hydrated || !auth.token) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-body">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        Memeriksa sesi…
      </p>
    );
  }

  if (auth.user?.role !== "admin") {
    return (
      <div className="rounded-xl border border-hairline bg-surface p-8">
        <h2 className="font-display text-xl font-bold text-ink">
          Akses ditolak
        </h2>
        <p className="mt-1 text-sm text-body">Halaman ini hanya untuk admin.</p>
      </div>
    );
  }

  const data = stats.data;
  const totals = data?.totals;
  const isLoading = stats.isLoading;
  const published = totals?.destinations.published ?? 0;
  const all = totals?.destinations.total ?? 0;
  const percent = all ? Math.round(published * 100 / all) : 0;
  const pending = totals?.facilities.pending ?? 0;

  const cards = [
    {
      label: "Menunggu verifikasi",
      value: pending,
      icon: BadgeCheck,
      tone: "bg-canvas-subtle text-primary",
    },
    {
      label: "Destinasi aktif",
      value: published,
      icon: Mountain,
      tone: "bg-canvas-subtle text-primary",
    },
    {
      label: "Merchant terdaftar",
      value: totals?.merchants.total ?? 0,
      icon: Store,
      tone: "bg-canvas-subtle text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      {stats.isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-ink">
              Gagal memuat data dashboard
            </p>
            <p className="text-xs text-body">
              Periksa koneksi ke API lalu coba lagi.
            </p>
          </div>
          <Button variant="secondary" onClick={() => stats.refetch()}>
            Coba lagi
          </Button>
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="relative isolate overflow-hidden rounded-[20px] bg-primary px-6 py-7 text-on-primary sm:px-8">
            <div aria-hidden className="absolute -top-18 -right-24 -z-10 size-56 rounded-full bg-accent" />
            <p className="mb-3 text-[11px] font-semibold">HALO, ADMIN</p>
            <h2 className="font-sans text-2xl font-bold text-on-primary sm:text-[30px]">Siap kelola destinasi hari ini?</h2>
            <p className="mt-2 text-sm text-canvas">Pantau verifikasi, destinasi, dan merchant dalam satu tempat.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href="/admin/verifikasi" className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent hover:brightness-110">
                Lihat Verifikasi <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Button variant="ghost" onClick={() => stats.refetch()} disabled={stats.isFetching} className="text-on-primary hover:bg-primary-hover disabled:text-canvas">
                <RefreshCw aria-hidden className={`size-4 ${stats.isFetching ? "animate-spin" : ""}`} />
                Muat ulang
              </Button>
            </div>
          </section>
          <div className="grid gap-3 sm:grid-cols-3">
            {cards.map((card) => (
              <KpiCard key={card.label} {...card} isLoading={isLoading} />
            ))}
          </div>
          <PopularDestinations
            popular={data?.popularDestinations ?? []}
            recent={data?.recentDestinations ?? []}
            isLoading={isLoading}
          />
        </div>
        <div className="space-y-5">
          <section className="rounded-[20px] border border-hairline bg-surface p-5">
            <h2 className="font-sans font-bold">Statistik</h2>
            <div className="mx-auto my-4 grid size-26 place-items-center rounded-full p-1" style={{ background: `conic-gradient(var(--color-primary) ${percent}%, var(--color-canvas-subtle) 0)` }}>
              <span className="grid size-full place-items-center rounded-full bg-surface text-xl font-bold text-ink">{data ? `${percent}%` : "—"}</span>
            </div>
            <p className="text-center text-sm font-semibold text-ink">Destinasi terbit</p>
            <p className="text-center text-xs text-body">{data ? `${published} dari ${all} destinasi` : "Statistik belum tersedia"}</p>
          </section>
          <UserGrowthChart
            data={data?.userGrowth ?? []}
            months={months}
            onMonthsChange={setMonths}
            isLoading={isLoading}
          />
          <section className="space-y-3 rounded-[20px] border border-hairline bg-surface p-5">
            <h2 className="font-sans font-bold">Perlu tindakan</h2>
            <Link href="/admin/verifikasi" className="flex items-center gap-3 text-sm font-semibold text-primary hover:underline">
              <span className="grid size-8 place-items-center rounded-full bg-canvas-subtle"><BadgeCheck aria-hidden className="size-4" /></span>
              {data ? `${pending} fasilitas menunggu verifikasi` : "Buka antrean verifikasi"}
            </Link>
          </section>
          <CategoryDonut items={data?.categoryDistribution ?? []} totalDestinations={all} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
