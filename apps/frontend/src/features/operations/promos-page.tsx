"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { DataTable, useDataTableState, type DataTableColumn } from "~/components/ui/data-table";
import { Field } from "~/features/destinations/components/form-field";
import { patch, post } from "~/lib/api/client";
import { DeleteDialog, ErrorMessage, PageHeading, StatusBadge, useAdminMutation, useAdminQuery } from "./shared";
import { dateTime, rupiah, type Promo } from "./types";
import { promoSchema } from "./validation";

export default function PromosPage() {
  const table = useDataTableState();
  const list = useAdminQuery<Promo[]>("/admin/promos", table.query);
  const [editing, setEditing] = useState<Promo | "new" | null>(null);
  const [deleting, setDeleting] = useState<Promo | null>(null);
  const columns: DataTableColumn<Promo>[] = [
    { id: "code", header: "Kode", sortKey: "code", cell: (r) => <><p className="font-semibold text-ink">{r.code}</p><p className="text-xs text-body">{r.title}</p></> },
    { id: "value", header: "Diskon", cell: (r) => <>{r.discountType === "percentage" ? `${r.value}%` : rupiah(r.value)}<p className="text-xs text-body">Min. {rupiah(r.minAmount)}{r.maxDiscount == null ? "" : ` · maks. ${rupiah(r.maxDiscount)}`}</p></> },
    { id: "dates", header: "Periode", cell: (r) => <span className="text-xs">{dateTime(r.startsAt)}<br />s.d. {dateTime(r.endsAt)}</span> },
    { id: "status", header: "Diaktifkan", cell: (r) => <StatusBadge value={r.active ? "Aktif" : "Nonaktif"} /> },
    { id: "actions", header: "Aksi", cell: (r) => <div className="flex gap-1"><Button size="sm" variant="ghost" aria-label={`Edit ${r.code}`} onClick={() => setEditing(r)}>Edit</Button><Button size="sm" variant="ghost" className="text-danger" aria-label={`Hapus ${r.code}`} onClick={() => setDeleting(r)}>Hapus</Button></div> },
  ];
  return <div className="space-y-6"><PageHeading title="Promo" description="Kelola kode promo. Server menentukan kelayakan, periode, dan diskon saat simulasi pembayaran."><Button onClick={() => setEditing("new")}>Tambah promo</Button></PageHeading>
    <DataTable data={list.data?.data ?? []} columns={columns} getRowId={(r) => r.id} itemLabel="promo" total={Number(list.data?.meta?.total ?? 0)} page={table.page} pageSize={table.pageSize} sort={table.sort} search={table.search} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} onSortChange={table.setSort} onSearchChange={table.setSearch} isLoading={list.isPending} isFetching={list.isFetching} error={list.error} onRetry={() => void list.refetch()} />
    {editing && <PromoDialog promo={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    {deleting && <DeleteDialog name={deleting.code} path={`/admin/promos/${deleting.id}`} onClose={() => setDeleting(null)} />}
  </div>;
}
// Preserve the user's local wall time when editing datetime-local inputs.
function localDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function PromoDialog({ promo, onClose }: { promo?: Promo; onClose: () => void }) {
  const [type, setType] = useState(promo?.discountType ?? "percentage");
  const [validation, setValidation] = useState("");
  const mutation = useAdminMutation((body: unknown, token) => promo ? patch(`/admin/promos/${promo.id}`, body, { token }) : post("/admin/promos", body, { token }), onClose);
  return <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}><DialogContent className="max-h-[90dvh] w-[640px] overflow-y-auto"><DialogTitle>{promo ? "Edit" : "Tambah"} promo</DialogTitle><DialogDescription>Waktu mengikuti zona perangkat Anda. Persentase 1–100 atau nominal integer rupiah.</DialogDescription>
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault(); setValidation(""); const form = new FormData(e.currentTarget);
      const iso = (key: string) => { const date = new Date(String(form.get(key))); return Number.isNaN(date.getTime()) ? "" : date.toISOString(); };
      const result = promoSchema.safeParse({ code: String(form.get("code")), title: String(form.get("title")), discountType: type, value: Number(form.get("value")), minAmount: Number(form.get("minAmount")), maxDiscount: String(form.get("maxDiscount")).trim() === "" ? null : Number(form.get("maxDiscount")), startsAt: iso("startsAt"), endsAt: iso("endsAt"), active: form.has("active") });
      if (!result.success) { setValidation(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · ")); return; }
      mutation.mutate(result.data);
    }}><fieldset disabled={mutation.isPending} className="grid gap-4 sm:grid-cols-2">
      <Field label="Kode promo" htmlFor="promo-code"><Input id="promo-code" name="code" required minLength={3} maxLength={32} pattern="[A-Z0-9_-]{3,32}" defaultValue={promo?.code} autoCapitalize="characters" /></Field>
      <Field label="Judul" htmlFor="promo-title"><Input id="promo-title" name="title" required maxLength={160} defaultValue={promo?.title} /></Field>
      <Field label="Jenis diskon" htmlFor="promo-type"><Select id="promo-type" value={type} options={[{ value: "percentage", label: "Persentase" }, { value: "fixed", label: "Nominal rupiah" }]} onChange={(v) => setType(v as typeof type)} /></Field>
      <Field label={type === "percentage" ? "Diskon (%)" : "Diskon (Rp)"} htmlFor="promo-value"><Input id="promo-value" name="value" type="number" required min={1} max={type === "percentage" ? 100 : 2147483647} step={1} defaultValue={promo?.value} /></Field>
      <Field label="Minimum transaksi (Rp)" htmlFor="promo-min"><Input id="promo-min" name="minAmount" type="number" required min={0} max={2147483647} step={1} defaultValue={promo?.minAmount ?? 0} /></Field>
      <Field label="Batas diskon (Rp)" htmlFor="promo-max" optional><Input id="promo-max" name="maxDiscount" type="number" min={0} max={2147483647} step={1} defaultValue={promo?.maxDiscount ?? ""} /></Field>
      <Field label="Mulai (waktu lokal)" htmlFor="promo-start"><Input id="promo-start" name="startsAt" type="datetime-local" required defaultValue={localDate(promo?.startsAt)} /></Field>
      <Field label="Berakhir (waktu lokal)" htmlFor="promo-end"><Input id="promo-end" name="endsAt" type="datetime-local" required defaultValue={localDate(promo?.endsAt)} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={promo?.active ?? true} />Aktif</label>
    </fieldset>{validation && <p role="alert" className="text-sm text-danger">{validation}</p>}<ErrorMessage error={mutation.error} /><DialogFooter><Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>Batal</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Menyimpan…" : "Simpan promo"}</Button></DialogFooter></form>
  </DialogContent></Dialog>;
}
