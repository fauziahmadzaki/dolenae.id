"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DataTable,
  useDataTableState,
  type DataTableFilter,
  type SortOption,
} from "~/components/ui/data-table";
import { useToast } from "~/components/ui/toaster";
import { ApiError } from "~/lib/api/types";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { UserDialog } from "./components/user-dialog";
import { userColumns } from "./components/users-columns";
import { useUsers } from "./hooks/use-users";
import { roleOptions, type ManagedUser, type UserMode } from "./schema";
import { INACTIVE_AFTER_DAYS, userStatusOptions } from "./status";

const SORT_OPTIONS: SortOption[] = [
  { value: "createdAt:desc", label: "Terbaru" },
  { value: "createdAt:asc", label: "Terlama" },
  { value: "name:asc", label: "Nama A–Z" },
  { value: "name:desc", label: "Nama Z–A" },
  { value: "email:asc", label: "Email A–Z" },
  { value: "email:desc", label: "Email Z–A" },
];

export default function UsersPage() {
  const auth = useAuth();
  const router = useRouter();
  const cache = useQueryClient();
  const { toast } = useToast();

  const table = useDataTableState();
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<UserMode | null>(null);

  const enabled =
    auth.hydrated && !!auth.token && auth.user?.role === "admin";

  const list = useUsers(
    { ...table.query, role, status },
    auth.token,
    enabled,
  );

  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);

  useEffect(() => {
    if (list.error instanceof ApiError && list.error.status === 401) {
      cache.removeQueries({ queryKey: ["users"] });
      auth.logout();
      router.replace("/auth/login");
    }
  }, [list.error, auth, cache, router]);

  if (!auth.hydrated || !auth.token) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-body">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        Memeriksa sesi…
      </p>
    );
  }

  if (auth.user?.role !== "admin") {
    return (
      <div className="rounded-xl border border-hairline bg-surface p-8">
        <h2 className="font-display text-xl font-bold text-ink">
          Akses ditolak
        </h2>
        <p className="mt-1 text-sm text-body">Halaman ini hanya untuk admin.</p>
        <Link
          href="/"
          className="mt-3 inline-block text-sm font-semibold text-primary underline"
        >
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const users = list.data?.data ?? [];
  const total = Number(list.data?.meta?.total ?? 0);

  const open = (next: UserMode) => setMode(next);

  const columns = userColumns({
    currentUserId: auth.user?.id,
    onDetail: (user: ManagedUser) => open({ kind: "detail", user }),
    onEdit: (user: ManagedUser) => open({ kind: "edit", user }),
    onDelete: (user: ManagedUser) => open({ kind: "delete", user }),
  });

  const resetPageOn = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    table.resetPage();
  };

  const filters: DataTableFilter[] = [
    {
      key: "role",
      label: "Role",
      value: role,
      allLabel: "Semua role",
      options: roleOptions,
      onChange: resetPageOn(setRole),
    },
    {
      key: "status",
      label: "Status",
      value: status,
      allLabel: "Semua status",
      options: userStatusOptions,
      onChange: resetPageOn(setStatus),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">
            Daftar Pengguna
          </h2>
          <p className="mt-1 text-sm text-body">
            Lihat dan atur peran serta status pengguna.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => open({ kind: "create" })}>
            <Plus aria-hidden className="h-4 w-4" />
            Tambah pengguna
          </Button>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        getRowId={(user) => user.id}
        page={table.page}
        pageSize={table.pageSize}
        total={total}
        sort={table.sort}
        search={table.search}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        onSortChange={table.setSort}
        onSearchChange={table.setSearch}
        sortOptions={SORT_OPTIONS}
        searchPlaceholder="Cari pengguna"
        itemLabel="pengguna"
        isLoading={list.isPending}
        isFetching={list.isFetching}
        error={list.error}
        onRetry={() => list.refetch()}
        filters={filters}
        emptyState={
          <div className="rounded-lg border border-dashed border-hairline bg-surface p-10 text-center">
            <h3 className="font-display font-semibold text-ink">
              Tidak ada pengguna
            </h3>
            <p className="mt-1 text-sm text-body">
              Coba ubah pencarian atau role, atau tambahkan pengguna.
            </p>
            <Button className="mt-4" onClick={() => open({ kind: "create" })}>
              <Plus aria-hidden className="h-4 w-4" />
              Tambah pengguna
            </Button>
          </div>
        }
      />

      <p className="text-xs text-body">
        Status dihitung otomatis: aktif bila email terverifikasi dan login dalam{" "}
        {INACTIVE_AFTER_DAYS} hari terakhir. Undangan email belum tersedia.
      </p>

      {mode && (
        <UserDialog
          key={mode.kind + ("user" in mode ? mode.user.id : "")}
          mode={mode}
          token={auth.token}
          onClose={() => setMode(null)}
          onSaved={(message) => {
            setMode(null);
            toast({ title: message, variant: "success" });
          }}
          onUnauthorized={() => {
            cache.removeQueries({ queryKey: ["users"] });
            auth.logout();
            router.replace("/auth/login");
          }}
        />
      )}
    </div>
  );
}
