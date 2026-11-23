"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Loader2,
  Mountain,
  RefreshCw,
  Store,
  Users,
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

  const cards = [
    {
      label: "Destinasi",
      value: totals?.destinations.total ?? 0,
      hint: `${totals?.destinations.published ?? 0} terbit · ${
        totals?.destinations.draft ?? 0
      } draft`,
      icon: Mountain,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Fasilitas",
      value: totals?.facilities.total ?? 0,
      hint: `${totals?.facilities.pending ?? 0} menunggu verifikasi`,
      icon: Building2,
      tone: "bg-accent/10 text-accent",
    },
    {
      label: "Pengguna",
      value: totals?.users.total ?? 0,
      hint: `+${totals?.users.newThisMonth ?? 0} bulan ini`,
      icon: Users,
      tone: "bg-success/15 text-success",
    },
    {
      label: "Merchant",
      value: totals?.merchants.total ?? 0,
      hint: `+${totals?.merchants.newThisMonth ?? 0} bulan ini`,
      icon: Store,
      tone: "bg-warning/15 text-warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Ringkasan platform
          </h1>
          <p className="text-sm text-body">
            Pantau katalog destinasi, fasilitas, dan pertumbuhan pengguna
            Dolenae.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => stats.refetch()}
          disabled={stats.isFetching}
          className="gap-1.5"
        >
          <RefreshCw
            aria-hidden
            className={`h-4 w-4 ${stats.isFetching ? "animate-spin" : ""}`}
          />
          Muat ulang
        </Button>
      </div>

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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <KpiCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
            tone={card.tone}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <UserGrowthChart
          data={data?.userGrowth ?? []}
          months={months}
          onMonthsChange={setMonths}
          isLoading={isLoading}
        />
        <CategoryDonut
          items={data?.categoryDistribution ?? []}
          totalDestinations={totals?.destinations.total ?? 0}
          isLoading={isLoading}
        />
      </div>

      <PopularDestinations
        popular={data?.popularDestinations ?? []}
        recent={data?.recentDestinations ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
