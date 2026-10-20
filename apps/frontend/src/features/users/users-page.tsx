"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/toaster";
import { ApiError } from "~/lib/api/types";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { UserDialog } from "./components/user-dialog";
import { UsersTable } from "./components/users-table";
import { UsersToolbar } from "./components/users-toolbar";
import { useUsers } from "./hooks/use-users";
import type { UserMode } from "./schema";
import { INACTIVE_AFTER_DAYS } from "./status";

const PAGE_SIZE = 6;

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Permintaan gagal. Silakan coba lagi.";

export default function UsersPage() {
  const auth = useAuth();
  const router = useRouter();
  const cache = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<UserMode | null>(null);

  const enabled =
    auth.hydrated && !!auth.token && auth.user?.role === "admin";

  const list = useUsers(
    { page, limit: PAGE_SIZE, search, role, status },
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

  const total = Number(list.data?.meta?.total ?? 0);
  const totalPages = Number(list.data?.meta?.totalPages ?? 1);

  useEffect(() => {
    if (list.data && page > totalPages) setPage(totalPages);
  }, [list.data, page, totalPages]);

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

  const open = (next: UserMode) => setMode(next);

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

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

      <UsersToolbar
        search={search}
        role={role}
        status={status}
        total={total}
        onSearchChange={resetPage(setSearch)}
        onRoleChange={resetPage(setRole)}
        onStatusChange={resetPage(setStatus)}
      />

      <p className="text-xs text-body">
        Status dihitung otomatis: aktif bila email terverifikasi dan login dalam{" "}
        {INACTIVE_AFTER_DAYS} hari terakhir. Undangan email belum tersedia.
      </p>

      {list.isPending ? (
        <p role="status" className="text-sm text-body">
          Memuat pengguna…
        </p>
      ) : list.isError ? (
        <div
          role="alert"
          className="rounded-lg border border-hairline bg-surface p-6"
        >
          <p className="text-sm text-danger">{message(list.error)}</p>
          <Button variant="secondary" className="mt-3" onClick={() => list.refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : users.length === 0 ? (
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
      ) : (
        <UsersTable
          users={users}
          currentUserId={auth.user?.id}
          onDetail={(user) => open({ kind: "detail", user })}
          onEdit={(user) => open({ kind: "edit", user })}
          onDelete={(user) => open({ kind: "delete", user })}
        />
      )}

      {!list.isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-body">
          <p>
            Menampilkan {total ? (page - 1) * PAGE_SIZE + 1 : 0}–
            {Math.min(page * PAGE_SIZE, total)} dari {total} pengguna
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              aria-label="Halaman sebelumnya"
              disabled={page <= 1 || list.isFetching}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </Button>
            <span className="rounded-md bg-primary px-3 py-1.5 text-on-primary">
              {page}
            </span>
            <Button
              variant="secondary"
              size="sm"
              aria-label="Halaman berikutnya"
              disabled={page >= totalPages || list.isFetching}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight aria-hidden className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
