"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Package,
  Plus,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { cn } from "~/lib/cn";
import { FacilityStatusBadge } from "./components/facility-status-badge";
import { useMyFacilities, useMyProducts } from "./hooks/use-facilities";

export function MerchantDashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "merchant";

  const facilities = useMyFacilities({ limit: 100 }, auth.token, enabled);
  const products = useMyProducts({ limit: 1 }, auth.token, enabled);

  const items = facilities.data?.data ?? [];
  const stats = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      published: items.filter((item) => item.status === "published").length,
      products: Number(products.data?.meta?.total ?? 0),
    }),
    [items, products.data?.meta?.total],
  );

  const recent = useMemo(
    () =>
      [...items]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5),
    [items],
  );

  const cards = [
    {
      label: "Total fasilitas",
      value: stats.total,
      icon: Building2,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Menunggu verifikasi",
      value: stats.pending,
      icon: Clock,
      tone: "bg-warning/15 text-warning",
    },
    {
      label: "Tayang",
      value: stats.published,
      icon: CheckCircle2,
      tone: "bg-success/15 text-success",
    },
    {
      label: "Total produk",
      value: stats.products,
      icon: Package,
      tone: "bg-accent/10 text-accent",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Dashboard merchant
          </h1>
          <p className="text-sm text-body">
            Ringkasan usaha Anda di sekitar destinasi Dolenae.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => router.push("/merchant/fasilitas/baru")}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" /> Daftarkan fasilitas
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/merchant/produk")}
            className="gap-1.5"
          >
            <Package className="h-4 w-4" /> Lihat produk
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-hairline bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-body">{card.label}</p>
                <span
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg",
                    card.tone,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-ink">
                {facilities.isLoading || products.isLoading ? "—" : card.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="rounded-xl border border-hairline bg-surface">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Fasilitas terbaru</h2>
            <p className="text-xs text-body">5 fasilitas yang terakhir diperbarui.</p>
          </div>
          <Link
            href="/merchant/fasilitas"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
          >
            Lihat semua <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-body">
            {facilities.isLoading
              ? "Memuat fasilitas…"
              : "Belum ada fasilitas. Mulai dengan mendaftarkan usaha Anda."}
          </p>
        ) : (
          <div className="divide-y divide-hairline">
            {recent.map((facility) => (
              <div
                key={facility.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {facility.name}
                  </p>
                  <p className="text-xs text-body">
                    {facility.destinationName} · {facility.type}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <FacilityStatusBadge status={facility.status} />
                  <Link
                    href={`/merchant/fasilitas/${facility.id}/edit`}
                    className="text-xs font-semibold text-primary hover:text-primary-hover"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/merchant/fasilitas/${facility.id}/produk`}
                    className="text-xs font-semibold text-primary hover:text-primary-hover"
                  >
                    Produk
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
