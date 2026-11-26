"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ActiveSearchChip } from "~/components/ui/active-search-chip";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/toaster";
import {
  useRegisterShellSearch,
  useUrlSearchSync,
} from "~/features/admin/components/shell-search-context";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { FacilitiesTable } from "./components/facilities-table";
import { useFacilityMutation, useMyFacilities } from "./hooks/use-facilities";
import {
  statusLabels,
  type Facility,
  type FacilityStatus,
} from "./types";

type Tab = "all" | FacilityStatus;

const TABS: Tab[] = [
  "all",
  "pending",
  "published",
  "rejected",
  "draft",
  "archived",
];

export function MerchantFacilitiesPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "merchant";
  const { clearUrlSearch } = useUrlSearchSync(
    useCallback((next: string) => setSearch(next), []),
    enabled,
  );
  const handleSearchChange = useCallback(
    (next: string) => {
      setSearch(next);
      if (!next.trim()) clearUrlSearch();
    },
    [clearUrlSearch],
  );
  useRegisterShellSearch({
    scopeKey: "merchant-fasilitas",
    value: search,
    onChange: handleSearchChange,
    placeholder: "Cari fasilitas…",
    enabled,
  });
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
          <h1 className="font-display text-2xl font-bold text-ink">Fasilitas saya</h1>
          <p className="text-sm text-body">
            Daftarkan usaha di sekitar destinasi. Fasilitas tampil setelah
            diverifikasi admin.
          </p>
        </div>
        <Button
          onClick={() => router.push("/merchant/fasilitas/baru")}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" /> Daftarkan fasilitas
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={
                tab === item
                  ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary"
                  : "rounded-full bg-canvas-subtle px-3 py-1.5 text-xs font-semibold text-body hover:text-ink"
              }
            >
              {item === "all" ? "Semua" : statusLabels[item]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <ActiveSearchChip
            query={search}
            onClear={() => handleSearchChange("")}
          />
          <span className="text-xs text-body" aria-live="polite">
            {filtered.length} fasilitas
          </span>
        </div>
      </div>

      <FacilitiesTable
        mode="merchant"
        facilities={filtered}
        pending={list.isLoading}
        onEdit={(facility) =>
          router.push(`/merchant/fasilitas/${facility.id}/edit`)
        }
        onProducts={(facility) =>
          router.push(`/merchant/fasilitas/${facility.id}/produk`)
        }
        onDelete={(facility) =>
          mutation.mutate({ kind: "delete", id: facility.id })
        }
        onStatus={(facility, status) =>
          mutation.mutate({ kind: "status", id: facility.id, status })
        }
        deleting={mutation.isPending}
      />

    </div>
  );
}
