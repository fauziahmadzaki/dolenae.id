"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, BadgeCheck, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DataTable, useDataTableState, type DataTableColumn } from "~/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { useToast } from "~/components/ui/toaster";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { ApiError } from "~/lib/api/types";
import { exportCsv } from "~/lib/export-csv";
import { FacilityStatusBadge } from "./components/facility-status-badge";
import { useFacilityMutation, useMyFacilities } from "./hooks/use-facilities";
import { categoryLabels, statusLabels, type Facility } from "./types";

const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

function exportFacilities(items: Facility[]) {
  const rows = [["Fasilitas", "Destinasi", "Jenis", "Diajukan", "Status"], ...items.map((item) => [
    item.name, item.destinationName, categoryLabels[item.category], date.format(new Date(item.createdAt)), statusLabels[item.status],
  ])];
  exportCsv("verifikasi-fasilitas.csv", rows);
}

export function VerificationPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const table = useDataTableState();
  const [selected, setSelected] = useState<Facility | null>(null);
  const queue = useMyFacilities({ ...table.query, status: "pending" }, auth.token, auth.user?.role === "admin");
  const rows = queue.data?.data ?? [];
  const total = typeof queue.data?.meta?.total === "number" ? queue.data.meta.total : rows.length;

  const mutation = useFacilityMutation({
    token: auth.token ?? undefined,
    onSaved: (title) => {
      setSelected(null);
      toast({ title, variant: "success" });
    },
    onUnauthorized: () => {
      auth.logout();
      router.replace("/auth/login");
    },
    onError: (error) => toast({ title: error instanceof ApiError ? error.message : "Perubahan status gagal.", variant: "danger" }),
  });

  const columns: DataTableColumn<Facility>[] = [
    {
      id: "name", header: "Item", sortKey: "name",
      cell: (row) => <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-canvas-subtle text-primary"><BadgeCheck aria-hidden className="size-4" /></span>
        <div><p className="font-semibold text-ink">{row.name}</p><p className="text-xs text-body">{row.destinationName}</p></div>
      </div>,
    },
    { id: "contact", header: "Kontak", cell: (row) => row.contact },
    { id: "category", header: "Jenis", cell: (row) => categoryLabels[row.category] },
    { id: "submitted", header: "Diajukan", sortKey: "createdAt", cell: (row) => date.format(new Date(row.createdAt)) },
    { id: "status", header: "Status", cell: (row) => <FacilityStatusBadge status={row.status} /> },
    { id: "actions", header: "Aksi", align: "right", cell: (row) => <Button size="sm" onClick={() => setSelected(row)}>Tinjau <ArrowRight aria-hidden className="size-3.5" /></Button> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold">Verifikasi</h1>
          <p className="mt-1 text-sm text-body">{queue.isSuccess ? `${total} fasilitas menunggu tinjauan` : "Antrean pengajuan fasilitas"}</p>
        </div>
        <Button variant="secondary" disabled={!rows.length} onClick={() => exportFacilities(rows)} title="Ekspor halaman yang ditampilkan"><Download aria-hidden className="size-4" /> Ekspor</Button>
      </div>
      <DataTable data={rows} columns={columns} getRowId={(row) => row.id} page={table.page} pageSize={table.pageSize} total={total}
        sort={table.sort} search={table.search} onPageChange={table.setPage} onPageSizeChange={table.setPageSize}
        onSortChange={table.setSort} onSearchChange={table.setSearch} searchPlaceholder="Cari fasilitas atau destinasi"
        itemLabel="fasilitas" isLoading={queue.isPending} isFetching={queue.isFetching} error={queue.error} onRetry={() => queue.refetch()}
        emptyState={<p className="p-8 text-center text-sm text-body">Tidak ada fasilitas menunggu tinjauan yang cocok.</p>}
      />
      {selected && (
        <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) setSelected(null); }}>
          <DialogContent>
            <DialogTitle>{selected.name}</DialogTitle>
            <DialogDescription>{categoryLabels[selected.category]} · {selected.destinationName}</DialogDescription>
            {selected.description && <p className="text-sm text-body">{selected.description}</p>}
            <Link href={`/admin/fasilitas/${selected.id}/edit`} className="text-sm font-semibold text-primary underline">Lihat detail fasilitas</Link>
            <DialogFooter>
              <Button variant="secondary" disabled={mutation.isPending} onClick={() => mutation.mutate({ kind: "status", id: selected.id, status: "rejected" })}>Tolak</Button>
              <Button disabled={mutation.isPending} onClick={() => mutation.mutate({ kind: "status", id: selected.id, status: "published" })}>Tayangkan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
