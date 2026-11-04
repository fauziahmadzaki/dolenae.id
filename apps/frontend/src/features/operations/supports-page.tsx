"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { DataTable, useDataTableState, type DataTableColumn } from "~/components/ui/data-table";
import { ImageUploader } from "~/components/media/image-uploader";
import { LocationPicker } from "~/components/map/location-picker";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { Field, textareaClass } from "~/features/destinations/components/form-field";
import { uploadsApi } from "~/features/media/api";
import { patch, post } from "~/lib/api/client";
import type { Destination } from "~/types/domain";
import { DeleteDialog, ErrorMessage, PageHeading, StatusBadge, useAdminMutation, useAdminQuery } from "./shared";
import { supportCategories, rupiah, type TravelSupport } from "./types";
import { supportSchema } from "./validation";

export default function SupportsPage() {
  const table = useDataTableState();
  const [category, setCategory] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const list = useAdminQuery<TravelSupport[]>("/admin/supports", { ...table.query, category, destinationId });
  const [editing, setEditing] = useState<TravelSupport | "new" | null>(null);
  const [deleting, setDeleting] = useState<TravelSupport | null>(null);
  const columns: DataTableColumn<TravelSupport>[] = [
    { id: "name", header: "Fasilitas", sortKey: "name", cell: (r) => <><p className="font-semibold text-ink">{r.name}</p><p className="text-xs text-body">{r.locationLabel}</p></> },
    { id: "destination", header: "Destinasi", cell: (r) => <Link href={`/admin/destinasi/${r.destinationId}/edit`} className="text-primary underline">{r.relatedDestinationName ?? "Lihat destinasi"}</Link> },
    { id: "type", header: "Kategori", cell: (r) => supportCategories.find((c) => c.value === r.category)?.label },
    { id: "price", header: "Harga", cell: (r) => r.priceLabel ?? (r.priceMin == null ? "Belum tersedia" : rupiah(r.priceMin)) },
    { id: "verified", header: "Verifikasi", cell: (r) => <StatusBadge value={r.verified ? "terverifikasi" : "menunggu"} /> },
    { id: "actions", header: "Aksi", cell: (r) => <div className="flex gap-1"><Button size="sm" variant="ghost" aria-label={`Edit ${r.name}`} onClick={() => setEditing(r)}>Edit</Button><Button size="sm" variant="ghost" className="text-danger" aria-label={`Hapus ${r.name}`} onClick={() => setDeleting(r)}>Hapus</Button></div> },
  ];
  return <div className="space-y-6"><PageHeading title="Fasilitas sekitar" description="Kelola penginapan, transportasi, dan makanan. Fasilitas destinasi draf tidak tampil publik."><Button onClick={() => setEditing("new")}>Tambah fasilitas</Button></PageHeading>
    <div className="max-w-xl space-y-2"><DestinationPicker value={destinationId} name={destinationSearch} onChange={(id, name) => { setDestinationId(id); setDestinationSearch(name); table.resetPage(); }} allowAll /></div>
    <DataTable data={list.data?.data ?? []} columns={columns} getRowId={(r) => r.id} itemLabel="fasilitas" total={Number(list.data?.meta?.total ?? 0)} page={table.page} pageSize={table.pageSize} sort={table.sort} search={table.search} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} onSortChange={table.setSort} onSearchChange={table.setSearch} isLoading={list.isPending} isFetching={list.isFetching} error={list.error} onRetry={() => void list.refetch()} filters={[{ key: "category", label: "Kategori", value: category, options: supportCategories, allLabel: "Semua kategori", onChange: (v) => { setCategory(v); table.resetPage(); } }]} />
    {editing && <SupportDialog support={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    {deleting && <DeleteDialog name={deleting.name} path={`/admin/supports/${deleting.id}`} onClose={() => setDeleting(null)} />}
  </div>;
}

function DestinationPicker({ value, name, onChange, allowAll = false }: { value: string; name: string; onChange: (id: string, name: string) => void; allowAll?: boolean }) {
  const table = useDataTableState({ initialPageSize: 10, initialSort: { sort: "name", order: "asc" } });
  const list = useAdminQuery<Destination[]>("/destinations", table.query);
  const options = (list.data?.data ?? []).map((d) => ({ value: d.id, label: `${d.name} (${d.status})` }));
  if (value && !options.some((o) => o.value === value)) options.unshift({ value, label: name || value });
  if (allowAll) options.unshift({ value: "", label: "Semua destinasi" });
  return <fieldset className="space-y-2"><legend className="mb-1 text-sm font-semibold text-ink">Destinasi</legend>
    <Input aria-label="Cari destinasi untuk fasilitas" type="search" placeholder="Cari destinasi…" value={table.search} onChange={(e) => table.setSearch(e.target.value)} />
    <Select ariaLabel="Destinasi fasilitas" value={value} options={options} onChange={(id) => onChange(id, options.find((o) => o.value === id)?.label ?? "")} disabled={list.isPending} />
    {list.isPending && <p role="status" className="text-xs text-body">Memuat destinasi…</p>}
    <ErrorMessage error={list.error} retry={() => void list.refetch()} />
    {list.data && <div className="flex items-center gap-2 text-xs text-body"><Button size="sm" variant="ghost" disabled={table.page === 1 || list.isFetching} onClick={() => table.setPage(table.page - 1)}>Sebelumnya</Button><span>Halaman {table.page} · {Number(list.data.meta?.total ?? 0)} destinasi</span><Button size="sm" variant="ghost" disabled={table.page * table.pageSize >= Number(list.data.meta?.total ?? 0) || list.isFetching} onClick={() => table.setPage(table.page + 1)}>Berikutnya</Button></div>}
  </fieldset>;
}

function SupportDialog({ support, onClose }: { support?: TravelSupport; onClose: () => void }) {
  const { token } = useAuth();
  const [destinationId, setDestinationId] = useState(support?.destinationId ?? "");
  const [destinationName, setDestinationName] = useState(support?.relatedDestinationName ?? "");
  const [category, setCategory] = useState(support?.category ?? "accommodation");
  const [images, setImages] = useState<string[]>(support?.imageUrl ? [support.imageUrl] : []);
  const [uploading, setUploading] = useState(false);
  const uploaded = useRef(new Set<string>());
  const [locationLabel, setLocationLabel] = useState(support?.locationLabel ?? "");
  const [map, setMap] = useState(false);
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [validation, setValidation] = useState("");
  const mutation = useAdminMutation(async (body: unknown, authToken) => {
    if (support) await patch(`/admin/supports/${support.id}`, body, { token: authToken });
    else await post("/admin/supports", body, { token: authToken });
    // Existing image is retained until the record has been saved successfully.
    if (support?.imageUrl && support.imageUrl !== images[0]) void uploadsApi.remove(support.imageUrl, authToken).catch(() => undefined);
    for (const url of uploaded.current) if (url !== images[0]) void uploadsApi.remove(url, authToken).catch(() => undefined);
  }, onClose);
  const close = () => { if (!mutation.isPending && !uploading) { for (const url of uploaded.current) void uploadsApi.remove(url, token).catch(() => undefined); onClose(); } };
  const optional = [
    ["description", "Deskripsi"], ["capacity", "Kapasitas"], ["distanceLabel", "Jarak dari destinasi"],
    ["priceLabel", "Label harga"], ["priceUnit", "Satuan harga (malam/porsi/trip)"],
    ["contactPhone", "Telepon"], ["contactWhatsapp", "WhatsApp"], ["contactInstagram", "Instagram"],
    ["facilities", "Fasilitas (pisahkan koma)"], ["routes", "Rute layanan (pisahkan koma)"], ["cuisine", "Masakan (pisahkan koma)"],
  ] as const;
  return <Dialog open onOpenChange={(open) => { if (!open) close(); }}><DialogContent className="max-h-[90dvh] w-[800px] overflow-y-auto"><DialogTitle>{support ? "Edit" : "Tambah"} fasilitas</DialogTitle><DialogDescription>Harga integer rupiah. Kosong berarti belum tersedia, bukan gratis. Pin peta hanya disimpan sebagai label lokasi.</DialogDescription>
    <form className="space-y-5" onSubmit={(e) => {
      e.preventDefault(); setValidation(""); const form = new FormData(e.currentTarget);
      const text = (key: string) => String(form.get(key) ?? "").trim() || null;
      const number = (key: string) => text(key) === null ? null : Number(form.get(key));
      const array = (key: string) => String(form.get(key) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      const result = supportSchema.safeParse({ destinationId, category, name: text("name"), locationLabel: locationLabel.trim() || null, imageUrl: images[0] ?? null,
        ...Object.fromEntries(optional.map(([key]) => [key, ["facilities", "routes", "cuisine"].includes(key) ? array(key) : text(key)])), priceMin: number("priceMin"), priceMax: number("priceMax"), verified: form.has("verified"), includesDriver: form.has("includesDriver") });
      if (!result.success) { setValidation(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · ")); return; }
      mutation.mutate(result.data);
    }}>
      <fieldset disabled={mutation.isPending || uploading} className="space-y-5">
        <DestinationPicker value={destinationId} name={destinationName} onChange={(id, name) => { setDestinationId(id); setDestinationName(name); }} />
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Nama" htmlFor="support-name"><Input id="support-name" name="name" required maxLength={120} defaultValue={support?.name} /></Field><Field label="Kategori" htmlFor="support-category"><Select id="support-category" value={category} options={supportCategories} onChange={(v) => setCategory(v as typeof category)} /></Field>
        {optional.map(([key, label]) => <Field key={key} label={label} htmlFor={`support-${key}`} optional>{key === "description" ? <textarea id={`support-${key}`} name={key} maxLength={5000} className={textareaClass} defaultValue={support?.description ?? ""} /> : <Input id={`support-${key}`} name={key} maxLength={5000} defaultValue={Array.isArray(support?.[key]) ? (support[key] as string[]).join(", ") : (support?.[key] as string | null) ?? ""} />}</Field>)}
        {(["priceMin", "priceMax"] as const).map((key) => <Field key={key} label={key === "priceMin" ? "Harga minimum (Rp)" : "Harga maksimum (Rp)"} htmlFor={`support-${key}`} optional><Input id={`support-${key}`} name={key} type="number" min={0} max={2147483647} step={1} defaultValue={support?.[key] ?? ""} /></Field>)}
        <Field label="Label lokasi / alamat" htmlFor="support-location" optional><Input id="support-location" value={locationLabel} maxLength={5000} onChange={(e) => setLocationLabel(e.target.value)} /></Field><Button variant="secondary" onClick={() => setMap(!map)}>{map ? "Tutup peta" : "Pilih koordinat di peta"}</Button></div>
        {map && <LocationPicker latitude={pin?.[0] ?? null} longitude={pin?.[1] ?? null} onChange={(lat, lng) => { setPin([lat, lng]); setLocationLabel(`${lat.toFixed(6)}, ${lng.toFixed(6)}`); }} onClear={() => setPin(null)} />}
        <div className="flex flex-wrap gap-6"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="verified" defaultChecked={support?.verified ?? false} />Terverifikasi</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="includesDriver" defaultChecked={support?.includesDriver ?? false} />Termasuk pengemudi</label></div>
      </fieldset>
      <ImageUploader images={images} onChange={(urls) => { for (const url of urls) if (url !== support?.imageUrl) uploaded.current.add(url); setImages(urls); }} token={token} folder="destinations" max={1} disabled={mutation.isPending} deleteRemovedFiles={false} onBusyChange={setUploading} />
      {validation && <p role="alert" className="text-sm text-danger">{validation}</p>}<ErrorMessage error={mutation.error} />
      <DialogFooter><Button variant="secondary" disabled={mutation.isPending || uploading} onClick={close}>Batal</Button><Button type="submit" disabled={mutation.isPending || uploading}>{mutation.isPending ? "Menyimpan…" : "Simpan fasilitas"}</Button></DialogFooter>
    </form></DialogContent></Dialog>;
}
