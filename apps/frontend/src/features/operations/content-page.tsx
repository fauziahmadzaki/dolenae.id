"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { DataTable, useDataTableState, type DataTableColumn } from "~/components/ui/data-table";
import { Field, textareaClass } from "~/features/destinations/components/form-field";
import { patch, post } from "~/lib/api/client";
import { DeleteDialog, ErrorMessage, PageHeading, useAdminMutation, useAdminQuery } from "./shared";
import { dateTime, faqCategories, type Faq, type Feedback } from "./types";
import { faqSchema } from "./validation";

export default function ContentPage() {
  const [tab, setTab] = useState("faq");
  return <div className="space-y-6"><PageHeading title="Konten & masukan" description="Kelola FAQ publik dan baca masukan pengguna. Masukan bersifat baca-saja, tanpa status tanggapan palsu." />
    <div className="flex gap-2 border-b border-hairline pb-3" aria-label="Bagian konten">{[["faq", "FAQ"], ["feedback", "Masukan"]].map(([value, label]) => <Button key={value} variant={tab === value ? "primary" : "ghost"} aria-pressed={tab === value} onClick={() => setTab(value)}>{label}</Button>)}</div>
    {tab === "faq" ? <Faqs /> : <FeedbackList />}
  </div>;
}
function Faqs() {
  const table = useDataTableState();
  const list = useAdminQuery<Faq[]>("/admin/faqs", table.query);
  const [editing, setEditing] = useState<Faq | "new" | null>(null);
  const [deleting, setDeleting] = useState<Faq | null>(null);
  const columns: DataTableColumn<Faq>[] = [
    { id: "question", header: "Pertanyaan", cell: (r) => <p className="max-w-md whitespace-pre-wrap py-3 font-semibold text-ink">{r.question}</p> },
    { id: "category", header: "Kategori", cell: (r) => r.category },
    { id: "answer", header: "Jawaban", cell: (r) => <p className="line-clamp-3 max-w-lg py-3 text-body">{r.answer}</p> },
    { id: "actions", header: "Aksi", cell: (r) => <div className="flex gap-1"><Button size="sm" variant="ghost" aria-label={`Edit ${r.question}`} onClick={() => setEditing(r)}>Edit</Button><Button size="sm" variant="ghost" className="text-danger" aria-label={`Hapus ${r.question}`} onClick={() => setDeleting(r)}>Hapus</Button></div> },
  ];
  return <><DataTable data={list.data?.data ?? []} columns={columns} getRowId={(r) => r.id} itemLabel="FAQ" total={Number(list.data?.meta?.total ?? 0)} page={table.page} pageSize={table.pageSize} sort={table.sort} search={table.search} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} onSortChange={table.setSort} onSearchChange={table.setSearch} isLoading={list.isPending} isFetching={list.isFetching} error={list.error} onRetry={() => void list.refetch()} sortOptions={[{ value: "createdAt:desc", label: "Terbaru" }, { value: "createdAt:asc", label: "Terlama" }]} actions={<Button onClick={() => setEditing("new")}>Tambah FAQ</Button>} />
    {editing && <FaqDialog faq={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}{deleting && <DeleteDialog name={deleting.question} path={`/admin/faqs/${deleting.id}`} onClose={() => setDeleting(null)} />}
  </>;
}
function FaqDialog({ faq, onClose }: { faq?: Faq; onClose: () => void }) {
  const [category, setCategory] = useState(faq?.category ?? "akun");
  const [validation, setValidation] = useState("");
  const mutation = useAdminMutation((body: unknown, token) => faq ? patch(`/admin/faqs/${faq.id}`, body, { token }) : post("/admin/faqs", body, { token }), onClose);
  return <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}><DialogContent className="max-h-[90dvh] w-[640px] overflow-y-auto"><DialogTitle>{faq ? "Edit" : "Tambah"} FAQ</DialogTitle><DialogDescription>Informasi ini akan tampil di Pusat Bantuan publik. Gunakan jawaban yang sudah ditinjau.</DialogDescription><form className="space-y-4" onSubmit={(e) => {
    e.preventDefault(); const form = new FormData(e.currentTarget); const result = faqSchema.safeParse({ category, question: form.get("question"), answer: form.get("answer") });
    if (!result.success) { setValidation(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · ")); return; } setValidation(""); mutation.mutate(result.data);
  }}><fieldset disabled={mutation.isPending} className="space-y-4"><Field label="Kategori" htmlFor="faq-category"><Select id="faq-category" options={faqCategories} value={category} onChange={(v) => setCategory(v as typeof category)} /></Field><Field label="Pertanyaan" htmlFor="faq-question"><Input id="faq-question" name="question" required minLength={3} maxLength={500} defaultValue={faq?.question} /></Field><Field label="Jawaban" htmlFor="faq-answer"><textarea id="faq-answer" name="answer" className={textareaClass} required minLength={1} maxLength={10000} rows={7} defaultValue={faq?.answer} /></Field></fieldset>{validation && <p role="alert" className="text-sm text-danger">{validation}</p>}<ErrorMessage error={mutation.error} /><DialogFooter><Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>Batal</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Menyimpan…" : "Simpan FAQ"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
function FeedbackList() {
  const table = useDataTableState();
  const list = useAdminQuery<Feedback[]>("/admin/feedback", table.query);
  const [selected, setSelected] = useState<Feedback | null>(null);
  const columns: DataTableColumn<Feedback>[] = [
    { id: "subject", header: "Subjek", cell: (r) => <p className="font-semibold text-ink">{r.subject}</p> },
    { id: "category", header: "Kategori", cell: (r) => r.category },
    { id: "rating", header: "Penilaian", cell: (r) => r.rating == null ? "Tidak diisi" : `${r.rating}/5` },
    { id: "created", header: "Diterima", sortKey: "createdAt", cell: (r) => dateTime(r.createdAt) },
    { id: "action", header: "Aksi", cell: (r) => <Button size="sm" variant="secondary" onClick={() => setSelected(r)} aria-label={`Baca ${r.subject}`}>Baca masukan</Button> },
  ];
  return <><DataTable data={list.data?.data ?? []} columns={columns} getRowId={(r) => r.id} itemLabel="masukan" total={Number(list.data?.meta?.total ?? 0)} page={table.page} pageSize={table.pageSize} sort={table.sort} search={table.search} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} onSortChange={table.setSort} onSearchChange={table.setSearch} isLoading={list.isPending} isFetching={list.isFetching} error={list.error} onRetry={() => void list.refetch()} />
    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="max-h-[90dvh] w-[640px] overflow-y-auto"><DialogTitle>{selected?.subject}</DialogTitle><DialogDescription>{selected?.category} · {selected ? dateTime(selected.createdAt) : ""}</DialogDescription><p className="break-all text-xs text-body">Pengguna (ID): {selected?.userId}</p><p className="whitespace-pre-wrap break-words text-sm text-ink">{selected?.message}</p><DialogFooter><Button variant="secondary" onClick={() => setSelected(null)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
  </>;
}
