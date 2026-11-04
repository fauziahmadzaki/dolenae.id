"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { DataTable, useDataTableState, type DataTableColumn } from "~/components/ui/data-table";
import { Field, textareaClass } from "~/features/destinations/components/form-field";
import { patch } from "~/lib/api/client";
import { ErrorMessage, PageHeading, StatusBadge, useAdminMutation, useAdminQuery } from "./shared";
import { dateTime, supportCategories, type Proposal } from "./types";

const statuses = [{ value: "menunggu", label: "Menunggu" }, { value: "terverifikasi", label: "Terverifikasi" }, { value: "ditolak", label: "Ditolak" }];
export default function ProposalsPage() {
  const table = useDataTableState();
  const [status, setStatus] = useState("menunggu");
  const [reviewing, setReviewing] = useState<Proposal | null>(null);
  const list = useAdminQuery<Proposal[]>("/admin/facility-proposals", { ...table.query, status });
  const columns: DataTableColumn<Proposal>[] = [
    { id: "name", header: "Usulan", sortKey: "name", cell: (r) => <><p className="font-semibold text-ink">{r.name}</p><p className="text-xs text-body">{supportCategories.find((c) => c.value === r.type)?.label}</p></> },
    { id: "destination", header: "Destinasi terdekat", cell: (r) => r.nearestDestinationName },
    { id: "created", header: "Diajukan", sortKey: "createdAt", cell: (r) => dateTime(r.createdAt) },
    { id: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    { id: "action", header: "Aksi", cell: (r) => <Button size="sm" variant="secondary" aria-label={`Tinjau ${r.name}`} onClick={() => setReviewing(r)}>Tinjau</Button> },
  ];
  return <div className="space-y-6"><PageHeading title="Verifikasi usulan fasilitas" description="Tinjau informasi dari pengguna. Persetujuan tidak otomatis membuat atau menerbitkan fasilitas." />
    <DataTable data={list.data?.data ?? []} columns={columns} getRowId={(r) => r.id} itemLabel="usulan" total={Number(list.data?.meta?.total ?? 0)} page={table.page} pageSize={table.pageSize} sort={table.sort} search={table.search} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} onSortChange={table.setSort} onSearchChange={table.setSearch} isLoading={list.isPending} isFetching={list.isFetching} error={list.error} onRetry={() => void list.refetch()} filters={[{ key: "status", label: "Status", value: status, options: statuses, allLabel: "Semua status", onChange: (v) => { setStatus(v); table.resetPage(); } }]} />
    {reviewing && <ReviewDialog proposal={reviewing} onClose={() => setReviewing(null)} />}
  </div>;
}
function ReviewDialog({ proposal: p, onClose }: { proposal: Proposal; onClose: () => void }) {
  const [status, setStatus] = useState(p.status === "ditolak" ? "ditolak" : "terverifikasi");
  const [note, setNote] = useState(p.reviewNote ?? "");
  const mutation = useAdminMutation((body: { status: string; reviewNote: string }, token) => patch(`/admin/facility-proposals/${p.id}`, body, { token }), onClose);
  return <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}><DialogContent className="max-h-[90dvh] w-[600px] overflow-y-auto"><DialogTitle>Tinjau {p.name}</DialogTitle><DialogDescription>Keputusan dan catatan disimpan ke server. Publikasi fasilitas dilakukan terpisah di menu Fasilitas.</DialogDescription>
    <dl className="grid gap-2 text-sm text-body"><dt className="font-semibold text-ink">Destinasi terdekat</dt><dd>{p.nearestDestinationName}</dd><dt className="font-semibold text-ink">Alamat</dt><dd className="whitespace-pre-wrap break-words">{p.address}</dd><dt className="font-semibold text-ink">Catatan pengusul</dt><dd className="whitespace-pre-wrap break-words">{p.note || "Tidak ada catatan"}</dd><dt className="font-semibold text-ink">Pengusul (ID)</dt><dd className="break-all">{p.userId}</dd><dt className="font-semibold text-ink">Status saat ini</dt><dd><StatusBadge value={p.status} /> · {dateTime(p.updatedAt)}</dd></dl>
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate({ status, reviewNote: note.trim() }); }}><fieldset disabled={mutation.isPending} className="space-y-4"><Field label="Keputusan" htmlFor="review-status"><Select id="review-status" options={statuses.filter((s) => s.value !== "menunggu")} value={status} onChange={setStatus} /></Field><Field label="Catatan tinjauan" htmlFor="review-note" optional><textarea id="review-note" className={textareaClass} rows={4} maxLength={5000} value={note} onChange={(e) => setNote(e.target.value)} /></Field></fieldset><ErrorMessage error={mutation.error} /><DialogFooter><Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>Batal</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Menyimpan…" : "Simpan keputusan"}</Button></DialogFooter></form>
  </DialogContent></Dialog>;
}
