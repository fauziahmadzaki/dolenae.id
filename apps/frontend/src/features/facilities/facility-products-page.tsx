"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/toaster";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { ProductFormDialog } from "./components/product-form-dialog";
import {
  useFacilityDetail,
  useProductMutation,
} from "./hooks/use-facilities";
import {
  formatRupiah,
  type FacilityProduct,
} from "./types";

export function FacilityProductsPage({ facilityId }: { facilityId: string }) {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<
    { mode: "create" } | { mode: "edit"; product: FacilityProduct } | null
  >(null);

  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "merchant";
  const detail = useFacilityDetail(facilityId, auth.token, enabled);
  const facility = detail.data?.data;
  const products = facility?.products ?? [];

  const mutation = useProductMutation({
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

  if (detail.isLoading) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-body">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuat produk…
      </p>
    );
  }

  if (!facility) {
    return (
      <div className="rounded-xl border border-hairline bg-surface p-8">
        <p className="text-sm text-danger">Fasilitas tidak ditemukan.</p>
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => router.push("/merchant/fasilitas")}
        >
          Kembali ke fasilitas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Kembali ke daftar fasilitas"
            onClick={() => router.push("/merchant/fasilitas")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface text-body hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Produk · {facility.name}
            </h1>
            <p className="text-sm text-body">
              {facility.destinationName} · {products.length} produk
            </p>
          </div>
        </div>
        <Button onClick={() => setForm({ mode: "create" })} className="gap-1.5">
          <Plus className="h-4 w-4" /> Tambah produk
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface px-4 py-10 text-center">
          <Package className="mx-auto h-8 w-8 text-body" />
          <p className="mt-2 text-sm text-body">
            Belum ada produk untuk fasilitas ini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-canvas-subtle text-xs uppercase tracking-wide text-body">
              <tr>
                <th className="px-4 py-3 font-semibold">Produk</th>
                <th className="px-4 py-3 font-semibold">Harga</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-body">{product.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-body">
                    {formatRupiah(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.isActive
                          ? "rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success"
                          : "rounded-full bg-canvas-subtle px-2 py-0.5 text-[11px] font-semibold text-body"
                      }
                    >
                      {product.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setForm({ mode: "edit", product })}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          mutation.mutate({
                            facilityId,
                            kind: "edit",
                            id: product.id,
                            payload: { isActive: !product.isActive },
                          })
                        }
                      >
                        {product.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          mutation.mutate({
                            facilityId,
                            kind: "delete",
                            id: product.id,
                          })
                        }
                        aria-label={`Hapus ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && auth.token && (
        <ProductFormDialog
          token={auth.token}
          mode={form.mode}
          product={form.mode === "edit" ? form.product : undefined}
          facilityId={facilityId}
          onClose={() => setForm(null)}
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
