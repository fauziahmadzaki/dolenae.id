"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bed, Car, Download, Layers, Plus, Search, Utensils } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toaster";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { useUsers } from "~/features/users/hooks/use-users";
import { cn } from "~/lib/cn";
import { exportCsv } from "~/lib/export-csv";
import {
  FacilitiesTable,
  formatFacilityPriceRange,
} from "./components/facilities-table";
import { ProductDialog } from "./components/product-dialog";
import { useFacilityMutation, useMyFacilities } from "./hooks/use-facilities";
import {
  categoryLabels,
  statusLabels,
  statusOptions,
  type Facility,
  type FacilityCategory,
} from "./types";

type CategoryTab = "all" | FacilityCategory;

const CATEGORY_TABS: {
  value: CategoryTab;
  label: string;
  icon: typeof Bed;
}[] = [
  { value: "all", label: "Semua", icon: Layers },
  { value: "accommodation", label: "Penginapan", icon: Bed },
  { value: "transport", label: "Transportasi", icon: Car },
  { value: "food", label: "Makanan", icon: Utensils },
];

export function AdminFacilitiesPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("all");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [productFacility, setProductFacility] = useState<Facility | null>(null);

  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "admin";
  const list = useMyFacilities({ limit: 100 }, auth.token, enabled);
  const usersList = useUsers({ page: 1, limit: 100 }, auth.token, enabled);
  const facilities = list.data?.data ?? [];

  const merchantNames = useMemo(
    () => new Map((usersList.data?.data ?? []).map((u) => [u.id, u.name])),
    [usersList.data],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return facilities.filter((facility) => {
      if (categoryTab !== "all" && facility.category !== categoryTab) return false;
      if (statusFilter && facility.status !== statusFilter) return false;
      if (!query) return true;
      const merchant = facility.ownerId
        ? (merchantNames.get(facility.ownerId) ?? "").toLowerCase()
        : "";
      return (
        facility.name.toLowerCase().includes(query) ||
        facility.destinationName.toLowerCase().includes(query) ||
        facility.type.toLowerCase().includes(query) ||
        merchant.includes(query)
      );
    });
  }, [facilities, categoryTab, statusFilter, search, merchantNames]);

  const mutation = useFacilityMutation({
    token: auth.token ?? undefined,
    onSaved: (message) => toast({ title: message, variant: "success" }),
    onUnauthorized: () => {
      auth.logout();
      router.replace("/auth/login");
    },
    onError: (error) =>
      toast({
        title: "Aksi gagal",
        description: error instanceof Error ? error.message : "Permintaan gagal.",
        variant: "danger",
      }),
  });

  const handleExport = () => {
    exportCsv("fasilitas.csv", [
      ["Fasilitas", "Kategori", "Destinasi", "Merchant", "Harga", "Status", "Diperbarui"],
      ...filtered.map((item) => [
        item.name,
        categoryLabels[item.category],
        item.destinationName,
        (item.ownerId && merchantNames.get(item.ownerId)) || item.contact,
        formatFacilityPriceRange(item),
        statusLabels[item.status],
        item.updatedAt,
      ]),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-body">Admin / Fasilitas</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold text-ink">
            Fasilitas
          </h1>
          <p className="mt-1 text-sm text-body">
            Kelola layanan penginapan, transportasi, dan kuliner dari merchant.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            disabled={!filtered.length}
            onClick={handleExport}
            title="Ekspor daftar fasilitas"
          >
            <Download aria-hidden className="h-4 w-4" /> Ekspor
          </Button>
          <Button
            onClick={() => router.push("/admin/fasilitas/baru")}
            className="gap-1.5"
          >
            <Plus aria-hidden className="h-4 w-4" /> Tambah fasilitas
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Kategori fasilitas">
          {CATEGORY_TABS.map((item) => {
            const active = categoryTab === item.value;
            const Icon = item.icon;
            const count =
              item.value === "all"
                ? facilities.length
                : facilities.filter((f) => f.category === item.value).length;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategoryTab(item.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-on-primary"
                    : "border-hairline bg-surface text-body hover:text-ink",
                )}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    active
                      ? "bg-accent text-on-accent"
                      : "bg-canvas-subtle text-body",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-44">
            <Select
              size="sm"
              ariaLabel="Filter status fasilitas"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "", label: "Semua status" },
                ...statusOptions,
              ]}
            />
          </div>
          <label className="relative flex h-10 w-full items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 sm:w-64">
            <Search aria-hidden className="h-4 w-4 text-body" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari fasilitas atau merchant…"
              className="h-8 border-0 bg-transparent px-0 focus-visible:border-0"
            />
          </label>
        </div>
      </div>

      <FacilitiesTable
        mode="admin"
        facilities={filtered}
        merchantNames={merchantNames}
        pending={list.isLoading}
        onEdit={(facility) =>
          router.push(`/admin/fasilitas/${facility.id}/edit`)
        }
        onProducts={(facility) => setProductFacility(facility)}
        onDelete={(facility) =>
          mutation.mutate({ kind: "delete", id: facility.id })
        }
        onStatus={(facility, status) =>
          mutation.mutate({ kind: "status", id: facility.id, status })
        }
        deleting={mutation.isPending}
      />

      {productFacility && auth.token && (
        <ProductDialog
          facility={productFacility}
          token={auth.token}
          onClose={() => setProductFacility(null)}
          onSaved={(message) => toast({ title: message, variant: "success" })}
          onUnauthorized={() => {
            auth.logout();
            router.replace("/auth/login");
          }}
        />
      )}
    </div>
  );
}
