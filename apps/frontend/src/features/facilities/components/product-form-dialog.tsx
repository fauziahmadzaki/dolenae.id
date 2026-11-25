"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toaster";
import { useProductMutation } from "../hooks/use-facilities";
import {
  toNumberOrNull,
  type FacilityProduct,
  type MerchantProduct,
} from "../types";

interface ProductFormDialogProps {
  token: string;
  mode: "create" | "edit";
  product?: FacilityProduct | MerchantProduct;
  /** Fixed facility when opened from the per-facility page. */
  facilityId?: string;
  /** Facility chooser for the global products page. */
  facilityOptions?: { value: string; label: string }[];
  onClose: () => void;
  onSaved: (message: string) => void;
  onUnauthorized: () => void;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : "Permintaan gagal.";

export function ProductFormDialog({
  token,
  mode,
  product,
  facilityId: fixedFacilityId,
  facilityOptions = [],
  onClose,
  onSaved,
  onUnauthorized,
}: ProductFormDialogProps) {
  const { toast } = useToast();
  const [facilityId, setFacilityId] = useState(
    fixedFacilityId ?? product?.facilityId ?? "",
  );
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [bannerUrl, setBannerUrl] = useState(product?.bannerUrl ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);

  const mutation = useProductMutation({
    token,
    onSaved: (savedMessage) => {
      onSaved(savedMessage);
      onClose();
    },
    onUnauthorized,
    onError: (error) =>
      toast({
        title: "Gagal menyimpan produk",
        description: message(error),
        variant: "danger",
      }),
  });

  const submit = () => {
    const value = toNumberOrNull(price);
    if (!facilityId) {
      toast({ title: "Pilih fasilitas terlebih dahulu", variant: "danger" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Nama produk wajib diisi", variant: "danger" });
      return;
    }
    if (value == null) {
      toast({ title: "Harga produk wajib diisi", variant: "danger" });
      return;
    }

    const payload = {
      name: name.trim(),
      price: value,
      description: description.trim() || null,
      bannerUrl: bannerUrl.trim() || null,
      isActive,
    };

    mutation.mutate(
      mode === "edit" && product
        ? { facilityId, kind: "edit", id: product.id, payload }
        : { facilityId, kind: "create", payload },
    );
  };

  const showFacilitySelect = !fixedFacilityId;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit produk" : "Tambah produk"}
          </DialogTitle>
          <DialogDescription>
            Produk/layanan yang ditawarkan fasilitas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {showFacilitySelect && (
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-body">Fasilitas *</span>
              <Select
                options={facilityOptions}
                value={facilityId}
                onChange={setFacilityId}
                placeholder="Pilih fasilitas"
              />
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-body">Nama produk *</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Kamar Standard"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-body">Harga (Rp) *</span>
            <Input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="numeric"
              placeholder="250000"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-body">Deskripsi</span>
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="1 kasur queen, sarapan"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-body">Banner URL</span>
            <Input
              value={bannerUrl}
              onChange={(event) => setBannerUrl(event.target.value)}
              placeholder="https://…"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-body">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Produk aktif (tampil ke wisatawan)
          </label>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Batal
          </Button>
          <Button onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
