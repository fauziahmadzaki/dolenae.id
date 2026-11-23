"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/toaster";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { FacilitiesTable } from "./components/facilities-table";
import { ProductDialog } from "./components/product-dialog";
import { useFacilityMutation, useMyFacilities } from "./hooks/use-facilities";
import { statusLabels, type Facility, type FacilityStatus } from "./types";

type Tab = "all" | FacilityStatus;

const TABS: Tab[] = [
  "pending",
  "published",
  "rejected",
  "draft",
  "archived",
  "all",
];

export function AdminFacilitiesPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [productFacility, setProductFacility] = useState<Facility | null>(null);

  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "admin";
  const list = useMyFacilities({ limit: 100 }, auth.token, enabled);
  const facilities = list.data?.data ?? [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return facilities.filter((facility) => {
      if (tab !== "all" && facility.status !== tab) return false;
      if (!query) return true;
      return (
        facility.name.toLowerCase().includes(query) ||
        facility.destinationName.toLowerCase().includes(query) ||
        facility.type.toLowerCase().includes(query)
      );
    });
  }, [facilities, tab, search]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-body">Admin / Fasilitas</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold text-ink">
            Verifikasi fasilitas
          </h1>
          <p className="text-sm text-body">
            Tinjau pendaftaran merchant. Tayangkan yang valid atau tolak dengan
            alasan.
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/fasilitas/baru")}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" /> Tambah fasilitas
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => {
            const active = tab === item;
            const count =
              item === "all"
                ? facilities.length
                : facilities.filter((f) => f.status === item).length;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={
                  active
                    ? "inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-on-primary transition-colors"
                    : "inline-flex items-center gap-2 rounded-xl border border-hairline bg-surface px-3.5 py-2 text-xs font-semibold text-body transition-colors hover:text-ink"
                }
              >
                {item === "all" ? "Semua" : statusLabels[item]}
                <span
                  className={
                    active
                      ? "rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-on-accent"
                      : "rounded-full bg-canvas-subtle px-2 py-0.5 text-[11px] font-semibold text-body"
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <label className="relative flex h-10 w-full max-w-xs items-center gap-2 rounded-full border border-hairline bg-surface px-3.5">
          <Search className="h-4 w-4 text-body" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari fasilitas…"
            className="h-8 border-0 bg-transparent px-0 focus-visible:border-0"
          />
        </label>
      </div>

      <FacilitiesTable
        mode="admin"
        facilities={filtered}
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
