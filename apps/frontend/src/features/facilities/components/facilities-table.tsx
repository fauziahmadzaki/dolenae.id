"use client";

import { useState } from "react";
import { Loader2, Pencil, Package, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { formatRelativeId } from "~/lib/format-date";
import {
  categoryLabels,
  formatRupiah,
  type Facility,
  type FacilityStatus,
} from "../types";
import { FacilityStatusBadge } from "./facility-status-badge";

interface FacilitiesTableProps {
  mode: "merchant" | "admin";
  facilities: Facility[];
  merchantNames?: Map<string, string>;
  pending?: boolean;
  onEdit: (facility: Facility) => void;
  onProducts: (facility: Facility) => void;
  onDelete: (facility: Facility) => void;
  onStatus: (facility: Facility, status: FacilityStatus) => void;
  deleting?: boolean;
}

export function formatFacilityPriceRange(facility: Facility): string {
  if (facility.priceMin == null) return "—";
  if (facility.priceMax == null || facility.priceMax === facility.priceMin) {
    return formatRupiah(facility.priceMin);
  }
  return `${formatRupiah(facility.priceMin)} – ${formatRupiah(facility.priceMax)}`;
}

export function FacilitiesTable({
  mode,
  facilities,
  merchantNames,
  pending,
  onEdit,
  onProducts,
  onDelete,
  onStatus,
  deleting,
}: FacilitiesTableProps) {
  const [confirm, setConfirm] = useState<Facility | null>(null);

  if (pending) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface px-4 py-6 text-sm text-body">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuat fasilitas…
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface px-4 py-8 text-center text-sm text-body">
        Belum ada fasilitas yang cocok.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-hairline bg-canvas-subtle/50 text-[11px] uppercase tracking-wide text-body">
            <tr>
              <th className="px-4 py-3 font-semibold">Fasilitas</th>
              <th className="px-4 py-3 font-semibold">
                {mode === "admin" ? "Merchant" : "Destinasi"}
              </th>
              <th className="px-4 py-3 font-semibold">Harga</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              {mode === "admin" && (
                <th className="px-4 py-3 font-semibold">Diperbarui</th>
              )}
              <th className="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {facilities.map((facility) => {
              const merchantName =
                (facility.ownerId && merchantNames?.get(facility.ownerId)) ||
                facility.destinationName;

              return (
                <tr key={facility.id} className="align-middle hover:bg-canvas/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{facility.name}</p>
                    <p className="text-xs text-body">
                      {categoryLabels[facility.category]} · {facility.destinationName}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-body">
                    {mode === "admin" ? (
                      <>
                        <p className="font-medium text-ink">{merchantName}</p>
                        <p className="text-xs">{facility.contact}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-ink">{facility.destinationName}</p>
                        <p className="text-xs">
                          {facility.location.latitude}, {facility.location.longitude}
                        </p>
                      </>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body">
                    {formatFacilityPriceRange(facility)}
                  </td>
                  <td className="px-4 py-3">
                    <FacilityStatusBadge status={facility.status} />
                  </td>
                  {mode === "admin" && (
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-body">
                      {formatRelativeId(facility.updatedAt)}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {mode === "merchant" &&
                        (facility.status === "draft" ||
                          facility.status === "rejected") && (
                          <Button
                            size="sm"
                            onClick={() => onStatus(facility, "pending")}
                          >
                            Ajukan verifikasi
                          </Button>
                        )}
                      {mode === "admin" && facility.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onStatus(facility, "published")}
                          >
                            Tayangkan
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onStatus(facility, "rejected")}
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                      {mode === "admin" && facility.status === "rejected" && (
                        <Button
                          size="sm"
                          onClick={() => onStatus(facility, "published")}
                        >
                          Tayangkan
                        </Button>
                      )}
                      {mode === "admin" && facility.status === "published" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onStatus(facility, "archived")}
                        >
                          Arsipkan
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(facility)}
                        aria-label={`Edit ${facility.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onProducts(facility)}
                        aria-label={`Produk ${facility.name}`}
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirm(facility)}
                        aria-label={`Hapus ${facility.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus fasilitas?</DialogTitle>
            <DialogDescription>
              {confirm?.name} beserta seluruh produknya akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (confirm) onDelete(confirm);
                setConfirm(null);
              }}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
