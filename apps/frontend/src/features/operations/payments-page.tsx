"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { DataTable, useDataTableState, type DataTableColumn } from "~/components/ui/data-table";
import { post } from "~/lib/api/client";
import { ErrorMessage, PageHeading, StatusBadge, useAdminMutation, useAdminQuery } from "./shared";
import { qrGeometry } from "./qr-geometry";
import { dateTime, rupiah, type Payment } from "./types";

export function DummyNotice() {
  return <p className="rounded-lg border border-warning/40 bg-surface p-4 text-sm font-semibold text-ink">DUMMY / SIMULASI. Tidak memindahkan uang, bukan QRIS, tidak membuat booking. Jangan gunakan aplikasi pembayaran atau memasukkan kartu/PIN.</p>;
}
export default function PaymentsPage() {
  const table = useDataTableState();
  const list = useAdminQuery<Payment[]>("/admin/payments", table.query);
  const columns: DataTableColumn<Payment>[] = [
    { id: "support", header: "Fasilitas", cell: (r) => <><p className="font-semibold text-ink">{r.supportName}</p><p className="text-xs text-body">{r.quantity} unit · DUMMY</p></> },
    { id: "id", header: "Pembayaran (ID)", cell: (r) => <span className="break-all text-xs">{r.id}</span> },
    { id: "total", header: "Total simulasi", cell: (r) => rupiah(r.total) },
    { id: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
    { id: "date", header: "Dibuat", sortKey: "createdAt", cell: (r) => dateTime(r.createdAt) },
    { id: "action", header: "Aksi", cell: (r) => <Link href={`/admin/pembayaran/${r.id}`} className="font-semibold text-primary underline">Detail simulasi</Link> },
  ];
  return <div className="space-y-6"><PageHeading title="Pembayaran simulasi" description="Daftar transaksi dummy dari server. Tidak ada integrasi provider pembayaran nyata." /><DummyNotice />
    <DataTable data={list.data?.data ?? []} columns={columns} getRowId={(r) => r.id} itemLabel="pembayaran dummy" total={Number(list.data?.meta?.total ?? 0)} page={table.page} pageSize={table.pageSize} sort={table.sort} search={table.search} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} onSortChange={table.setSort} onSearchChange={table.setSearch} isLoading={list.isPending} isFetching={list.isFetching} error={list.error} onRetry={() => void list.refetch()} />
  </div>;
}
export function PaymentDetail({ id }: { id: string }) {
  const detail = useAdminQuery<Payment>(`/payments/${id}`);
  const [target, setTarget] = useState<"paid" | "cancelled" | null>(null);
  const mutation = useAdminMutation((status: "paid" | "cancelled", token) => post(`/payments/${id}/simulate`, { status }, { token }), () => setTarget(null));
  const p = detail.data?.data;
  const qr = p?.isDummy === true && p.method === "dummy_qr" && /DUMMY|DEMO/.test(p.qrPayload) ? qrGeometry(p.qrMatrix) : null;
  return <div className="space-y-6"><Link href="/admin/pembayaran" className="text-sm font-semibold text-primary underline">Kembali ke pembayaran</Link><PageHeading title="Detail pembayaran dummy" description={id}><Button variant="secondary" disabled={detail.isFetching} onClick={() => void detail.refetch()}>Muat ulang status</Button></PageHeading><DummyNotice />
    {detail.isPending && <p role="status" className="text-sm text-body">Memuat pembayaran…</p>}<ErrorMessage error={detail.error} retry={() => void detail.refetch()} />
    {p && <div className="grid gap-6 lg:grid-cols-2"><section className="space-y-4 rounded-xl border border-hairline bg-surface p-6"><h3 className="font-display text-xl font-bold text-ink">{p.supportName}</h3><StatusBadge value={p.status} />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm text-body">{[["Pengguna (ID)", p.userId], ["Jumlah", p.quantity], ["Subtotal simulasi", rupiah(p.subtotal)], ["Diskon", rupiah(p.discount)], ["Kode promo", p.promoCode ?? "Tidak digunakan"], ["Total simulasi", rupiah(p.total)], ["Dibuat", dateTime(p.createdAt)], ["Diperbarui", dateTime(p.updatedAt)], ["Lunas simulasi", dateTime(p.paidAt)]].map(([key, value]) => <div key={key} className="contents"><dt className="font-semibold text-ink">{key}</dt><dd className="break-all">{value}</dd></div>)}</dl>
      {p.status === "pending" && p.isDummy === true && p.method === "dummy_qr" ? <div className="flex flex-wrap gap-2"><Button disabled={mutation.isPending} onClick={() => setTarget("paid")}>Simulasikan lunas</Button><Button variant="secondary" disabled={mutation.isPending} onClick={() => setTarget("cancelled")}>Batalkan simulasi</Button></div> : <p className="text-sm text-body">Status akhir tidak dapat diubah.</p>}
    </section><section className="space-y-4 rounded-xl border border-hairline bg-surface p-6"><h3 className="font-display text-xl font-bold text-ink">QR teks simulasi</h3>{qr ? <svg role="img" aria-label="QR berisi teks DUMMY, bukan pembayaran atau QRIS" viewBox={`0 0 ${qr.size} ${qr.size}`} shapeRendering="crispEdges" className="mx-auto w-full max-w-72" style={{ forcedColorAdjust: "none" }}><title>QR DUMMY / SIMULASI</title><rect width={qr.size} height={qr.size} fill="#fff" />{qr.modules.map(({ x, y }) => <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#000" />)}</svg> : <p role="alert" className="text-sm text-danger">QR simulasi tidak tersedia atau format server tidak valid. Muat ulang data.</p>}<p className="text-xs text-body">Matriks dari backend, tanpa layanan QR eksternal. Teks alternatif:</p><pre className="whitespace-pre-wrap break-all rounded-lg bg-canvas-subtle p-3 text-xs text-ink">{p.qrPayload}</pre></section></div>}
    <Dialog open={target !== null} onOpenChange={(open) => { if (!open && !mutation.isPending) setTarget(null); }}><DialogContent><DialogTitle>{target === "paid" ? "Simulasikan lunas?" : "Batalkan simulasi?"}</DialogTitle><DialogDescription>Hanya status dummy yang berubah. Tidak ada uang atau booking. Status akhir tidak dapat diubah kembali.</DialogDescription><ErrorMessage error={mutation.error} /><DialogFooter><Button variant="secondary" disabled={mutation.isPending} onClick={() => setTarget(null)}>Kembali</Button><Button disabled={mutation.isPending} onClick={() => { if (target) mutation.mutate(target); }}>{mutation.isPending ? "Memproses…" : "Konfirmasi simulasi"}</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
