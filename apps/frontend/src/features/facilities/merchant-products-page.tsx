"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toaster";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { ProductFormDialog } from "./components/product-form-dialog";
import {
  useMyFacilities,
  useMyProducts,
  useProductMutation,
} from "./hooks/use-facilities";
import {
  formatRupiah,
  type MerchantProduct,
} from "./types";

export function MerchantProductsPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [facilityFilter, setFacilityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<
    { mode: "create" } | { mode: "edit"; product: MerchantProduct } | null
  >(null);

  const enabled = auth.hydrated && !!auth.token && auth.user?.role === "merchant";
  const facilities = useMyFacilities({ limit: 100 }, auth.token, enabled);
  const products = useMyProducts({ limit: 100 }, auth.token, enabled);

  const facilityList = facilities.data?.data ?? [];
  const items = products.data?.data ?? [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((product) => {
      if (facilityFilter && product.facilityId !== facilityFilter) return false;
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.facilityName.toLowerCase().includes(query) ||
        product.destinationName.toLowerCase().includes(query)
      );
    });
  }, [items, facilityFilter, search]);

  const facilityOptions = useMemo(
    () => facilityList.map((facility) => ({
      value: facility.id,
      label: `${facility.name} · ${facility.destinationName}`,
    })),
    [facilityList],
  );

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Semua produk
          </h1>
          <p className="text-sm text-body">
            Produk dari seluruh fasilitas milik Anda.
          </p>
        </div>
        <Button onClick={() => setForm({ mode: "create" })} className="gap-1.5">
          <Plus className="h-4 w-4" /> Tambah produk
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs">
          <Select
            options={[{ value: "", label: "Semua fasilitas" }, ...facilityOptions]}
            value={facilityFilter}
            onChange={setFacilityFilter}
            size="sm"
          />
        </div>
        <label className="relative flex h-10 w-full max-w-xs items-center gap-2 rounded-lg bg-surface-2 px-3">
          <Search className="h-4 w-4 text-body" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari produk…"
            className="h-8 border-0 bg-transparent px-0 focus-visible:border-0"
          />
        </label>
      </div>

      {products.isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface px-4 py-6 text-sm text-body">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat produk…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface px-4 py-10 text-center">
          <Package className="mx-auto h-8 w-8 text-body" />
          <p className="mt-2 text-sm text-body">
            {items.length === 0
              ? "Belum ada produk. Tambahkan produk pertama Anda."
              : "Tidak ada produk yang cocok dengan filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-canvas-subtle text-xs uppercase tracking-wide text-body">
              <tr>
                <th className="px-4 py-3 font-semibold">Produk</th>
                <th className="px-4 py-3 font-semibold">Fasilitas</th>
                <th className="px-4 py-3 font-semibold">Destinasi</th>
                <th className="px-4 py-3 font-semibold">Harga</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-body">{product.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-body">{product.facilityName}</td>
                  <td className="px-4 py-3 text-body">{product.destinationName}</td>
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
                            facilityId: product.facilityId,
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
                            facilityId: product.facilityId,
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
          facilityOptions={facilityOptions}
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
