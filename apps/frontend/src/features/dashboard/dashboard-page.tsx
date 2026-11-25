"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, Loader2, Mountain, Store } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/features/auth/hooks/use-auth";
import {
  useCategories,
  useDestinations,
} from "~/features/destinations/hooks/use-destinations";
import { useMyFacilities } from "~/features/facilities/hooks/use-facilities";
import { useUsers } from "~/features/users/hooks/use-users";
import { ApiError } from "~/lib/api/types";
import { CategoryDonut } from "./components/category-donut";
import { DashboardRightPanel } from "./components/dashboard-right-panel";
import { KpiCard } from "./components/kpi-card";
import {
  AiPopularDestinationsCard,
  RecentDestinationsSection,
  mapDestinationCards,
} from "./components/popular-destinations";
import {
  RecentActivityTable,
  buildRecentActivities,
} from "./components/recent-activity-table";
import { UserGrowthChart } from "./components/user-growth-chart";
import { useDashboardStats } from "./hooks/use-dashboard-stats";

export function DashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const [months, setMonths] = useState(12);

  const enabled =
    auth.hydrated && !!auth.token && auth.user?.role === "admin";
  const stats = useDashboardStats(months, auth.token, enabled);
  const destList = useDestinations(
    { page: 1, limit: 9, sort: "updatedAt", order: "desc" },
    auth.token,
    enabled,
  );
  const categories = useCategories(enabled);
  const facilitiesList = useMyFacilities(
    { page: 1, limit: 20, sort: "createdAt", order: "desc" },
    auth.token,
    enabled,
  );
  const usersList = useUsers(
    { page: 1, limit: 20, sort: "createdAt", order: "desc" },
    auth.token,
    enabled,
  );

  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);

  useEffect(() => {
    if (stats.error instanceof ApiError && stats.error.status === 401) {
      auth.logout();
      router.replace("/auth/login");
    }
  }, [stats.error, auth, router]);

  const categoryNameMap = useMemo(() => {
    const map = new Map(
      (categories.data?.data ?? []).map((cat) => [cat.id, cat.name]),
    );
    return (id: string) => map.get(id);
  }, [categories.data]);

  const data = stats.data;
  const recentDestinationCards = useMemo(
    () =>
      mapDestinationCards(
        destList.data?.data,
        data?.recentDestinations ?? [],
        categoryNameMap,
      ),
    [destList.data, data?.recentDestinations, categoryNameMap],
  );

  const activities = useMemo(
    () =>
      buildRecentActivities({
        destinations: destList.data?.data ?? [],
        facilities: facilitiesList.data?.data ?? [],
        users: usersList.data?.data ?? [],
      }),
    [destList.data, facilitiesList.data, usersList.data],
  );

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

  const totals = data?.totals;
  const isLoading = stats.isLoading;
  const published = totals?.destinations.published ?? 0;
  const all = totals?.destinations.total ?? 0;
  const pending = totals?.facilities.pending ?? 0;

  const cards = [
    {
      label: "Menunggu verifikasi",
      value: pending,
      href: "/admin/verifikasi",
      actionLabel: "Buka verifikasi",
      icon: BadgeCheck,
      tone: "bg-canvas-subtle text-primary",
    },
    {
      label: "Destinasi aktif",
      value: published,
      href: "/admin/destinasi",
      actionLabel: "Kelola destinasi",
      icon: Mountain,
      tone: "bg-canvas-subtle text-primary",
    },
    {
      label: "Merchant terdaftar",
      value: totals?.merchants.total ?? 0,
      href: "/admin/merchant",
      actionLabel: "Kelola merchant",
      icon: Store,
      tone: "bg-canvas-subtle text-primary",
    },
  ];

  const handleRefreshAll = () => {
    stats.refetch();
    destList.refetch();
    facilitiesList.refetch();
    usersList.refetch();
  };

  const hasAnalytics =
    (data?.userGrowth.length ?? 0) > 0 ||
    (data?.categoryDistribution.length ?? 0) > 0 ||
    (data?.popularDestinations.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Ringkasan platform</h1>

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
          <Button variant="secondary" onClick={handleRefreshAll}>
            Coba lagi
          </Button>
        </div>
      )}

      {/* Primary Figma fold (#292:4655): Center column + 328px Right panel */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_328px]">
        <div className="min-w-0 space-y-5">
          <section className="relative isolate flex min-h-[196px] flex-col justify-center overflow-hidden rounded-[20px] bg-primary px-6 py-7 text-on-primary sm:px-8">
            <div
              aria-hidden
              className="absolute -top-18 -right-24 -z-10 size-56 rounded-full bg-accent"
            />
            <p className="mb-2 text-[11px] font-semibold tracking-wider uppercase">
              HALO, ADMIN
            </p>
            <h2 className="font-display text-2xl leading-[34px] font-bold text-on-primary sm:text-[30px] sm:leading-[38px]">
              Siap kelola destinasi hari ini?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-canvas/90">
              Pantau verifikasi, destinasi, dan merchant dalam satu tempat.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/verifikasi"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent transition-all hover:brightness-110"
              >
                Lihat Verifikasi <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            {cards.map((card) => (
              <KpiCard key={card.label} {...card} isLoading={isLoading} />
            ))}
          </div>

          <RecentDestinationsSection
            items={recentDestinationCards}
            isLoading={isLoading && destList.isLoading}
          />

          <RecentActivityTable
            items={activities}
            isLoading={
              destList.isLoading && facilitiesList.isLoading && usersList.isLoading
            }
          />
        </div>

        <DashboardRightPanel
          adminName={auth.user?.name ?? "Admin"}
          stats={data}
          facilities={facilitiesList.data?.data ?? []}
          users={usersList.data?.data ?? []}
          isFetching={stats.isFetching}
          onRefresh={handleRefreshAll}
        />
      </div>

      {/* Additional backend-powered analytics preserved cleanly below the main fold */}
      {hasAnalytics && (
        <section id="analitik-lanjutan" className="space-y-4 pt-2">
          <h2 className="font-display text-lg font-bold text-ink">
            Analitik Platform
          </h2>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-5">
              <UserGrowthChart
                data={data?.userGrowth ?? []}
                months={months}
                onMonthsChange={setMonths}
                isLoading={isLoading}
              />
              <AiPopularDestinationsCard
                popular={data?.popularDestinations ?? []}
              />
            </div>
            <CategoryDonut
              items={data?.categoryDistribution ?? []}
              totalDestinations={all}
              isLoading={isLoading}
            />
          </div>
        </section>
      )}
    </div>
  );
}
