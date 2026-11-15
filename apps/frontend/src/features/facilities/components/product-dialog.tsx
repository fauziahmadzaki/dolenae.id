"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/toaster";
import {
  useFacilityDetail,
  useProductMutation,
} from "../hooks/use-facilities";
import { formatRupiah, toNumberOrNull, type Facility } from "../types";

interface ProductDialogProps {
  facility: Facility;
  token: string;
  onClose: () => void;
  onSaved: (message: string) => void;
  onUnauthorized: () => void;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : "Permintaan gagal.";

export function ProductDialog({
  facility,
  token,
  onClose,
  onSaved,
  onUnauthorized,
}: ProductDialogProps) {
  const { toast } = useToast();
  const detail = useFacilityDetail(facility.id, token, true);
  const products = detail.data?.data.products ?? [];

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useProductMutation({
    token,
    onSaved,
    onUnauthorized,
    onError: (error) =>
      toast({ title: "Gagal menyimpan produk", description: message(error), variant: "danger" }),
  });

  const add = () => {
    const value = toNumberOrNull(price);
    if (!name.trim() || value == null) {
      toast({ title: "Nama dan harga produk wajib diisi", variant: "danger" });
      return;
    }
    mutation.mutate({
      facilityId: facility.id,
      kind: "create",
      payload: {
        name: name.trim(),
        price: value,
        description: description.trim() || null,
      },
    });
    setName("");
    setPrice("");
    setDescription("");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] w-[620px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Produk · {facility.name}</DialogTitle>
          <DialogDescription>
            Daftar produk/layanan yang ditawarkan fasilitas ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {detail.isLoading && (
            <div className="flex items-center gap-2 text-sm text-body">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat produk…
            </div>
          )}
          {!detail.isLoading && products.length === 0 && (
            <p className="rounded-lg bg-canvas-subtle px-3 py-3 text-sm text-body">
              Belum ada produk.
            </p>
          )}
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {product.name}
                </p>
                <p className="text-xs text-body">
                  {formatRupiah(product.price)} ·{" "}
                  {product.isActive ? "Aktif" : "Nonaktif"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    mutation.mutate({
                      facilityId: facility.id,
                      kind: "edit",
                      id: product.id,
                      payload: { isActive: !product.isActive },
                    })
                  }
                >
                  {product.isActive ? "Nonaktifkan" : "Aktifkan"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Hapus ${product.name}`}
                  onClick={() =>
                    mutation.mutate({
                      facilityId: facility.id,
                      kind: "delete",
                      id: product.id,
                    })
                  }
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 rounded-lg bg-canvas-subtle p-3">
          <p className="text-xs font-semibold text-body">Tambah produk</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama produk"
            />
            <Input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="numeric"
              placeholder="Harga (Rp)"
            />
          </div>
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Deskripsi singkat (opsional)"
          />
          <Button
            size="sm"
            onClick={add}
            disabled={mutation.isPending}
            className="gap-1"
          >
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
