"use client";

import Link from "next/link";
import { DataTable, useDataTableState, type DataTableColumn } from "~/components/ui/data-table";
import { Button } from "~/components/ui/button";
import { ErrorMessage, PageHeading, useAdminQuery } from "./shared";
import { dateTime, rupiah, type Activity, type Metrics } from "./types";

export default function DashboardPage() {
  const metrics = useAdminQuery<Metrics>("/admin/metrics");
  const table = useDataTableState();
  const activity = useAdminQuery<Activity[]>("/admin/activity", table.query);
  const columns: DataTableColumn<Activity>[] = [
    { id: "date", header: "Waktu", sortKey: "createdAt", cell: (row) => dateTime(row.createdAt) },
    { id: "action", header: "Aktivitas", cell: (row) => row.action },
    { id: "target", header: "Objek", cell: (row) => <><p className="font-semibold text-ink">{row.targetLabel}</p><p className="text-xs text-body">{row.targetType}</p></> },
    { id: "actor", header: "Pelaku (ID)", cell: (row) => <span className="break-all text-xs">{row.actorId ?? "Sistem"}</span> },
  ];
  const cards = metrics.data ? [
    ["Pengguna", metrics.data.data.users, "/admin/users"],
    ["Destinasi", metrics.data.data.destinations, "/admin/destinasi"],
    ["Destinasi terbit", metrics.data.data.publishedDestinations, "/admin/destinasi"],
    ["Fasilitas", metrics.data.data.supports, "/admin/fasilitas"],
    ["Usulan menunggu", metrics.data.data.pendingProposals, "/admin/verifikasi"],
    ["Pembayaran menunggu (dummy)", metrics.data.data.pendingPayments, "/admin/pembayaran"],
    ["Pembayaran lunas (dummy)", metrics.data.data.paidPayments, "/admin/pembayaran"],
    ["Total simulasi, bukan pendapatan", rupiah(metrics.data.data.dummyRevenue), "/admin/pembayaran"],
  ] as const : [];
  return <div className="space-y-6">
    <PageHeading title="Ringkasan platform" description="Angka dari database dan riwayat mutasi tercatat. Pembayaran hanya simulasi."><Button variant="secondary" disabled={metrics.isFetching || activity.isFetching} onClick={() => { void metrics.refetch(); void activity.refetch(); }}>Muat ulang</Button></PageHeading>
    {metrics.isPending && <p role="status" className="text-sm text-body">Memuat ringkasan…</p>}
    <ErrorMessage error={metrics.error} retry={() => void metrics.refetch()} />
    {metrics.data && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy={metrics.isFetching}>{cards.map(([label, value, href]) => <Link key={label} href={href} className="rounded-xl border border-hairline bg-surface p-5 shadow-sm hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary"><p className="text-sm text-body">{label}</p><p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p></Link>)}</div>}
    <h3 className="font-display text-xl font-bold text-ink">Aktivitas terbaru</h3>
    <DataTable data={activity.data?.data ?? []} columns={columns} getRowId={(row) => row.id} itemLabel="aktivitas" total={Number(activity.data?.meta?.total ?? 0)} page={table.page} pageSize={table.pageSize} sort={table.sort} search={table.search} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} onSortChange={table.setSort} onSearchChange={table.setSearch} isLoading={activity.isPending} isFetching={activity.isFetching} error={activity.error} onRetry={() => void activity.refetch()} searchPlaceholder="Cari aktivitas" />
  </div>;
}
