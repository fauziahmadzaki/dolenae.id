import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/features/auth/auth-context";
import { listUsers } from "~/features/auth/api";
import type { ApiUser, PaginationMeta } from "~/lib/api";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const { token, user } = useAuth();
  const [items, setItems] = useState<ApiUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    setError(null);

    listUsers(token, { page, limit: 10, search: search || undefined })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setMeta(res.pagination);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, page, search]);

  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-warning/40 bg-warning/10 p-6">
        <h1 className="font-semibold text-ink">Akses dibatasi</h1>
        <p className="mt-1 text-sm text-body">
          Halaman ini hanya untuk admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Pengguna</h1>
          <p className="mt-0.5 text-sm text-body">
            Data dari API <code className="text-ink">GET /api/users</code>.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Cari nama/email..."
          className="h-10 w-64 rounded-lg border border-hairline bg-surface px-3 text-sm text-ink outline-none placeholder:text-body/60 focus:border-border-strong"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-[11px] uppercase tracking-wide text-body">
            <tr>
              <th className="px-5 py-3 font-semibold">Nama</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {loading && items.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-body" colSpan={4}>
                  Memuat...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-body" colSpan={4}>
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u.id} className="hover:bg-canvas">
                  <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-5 py-3 text-body">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-ink">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-body">
                    {new Date(u.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex items-center justify-between text-sm text-body">
          <span>
            Halaman {meta.page} dari {meta.totalPages} · total {meta.total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={!meta.hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-hairline bg-surface px-3 py-1.5 font-medium text-ink disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              disabled={!meta.hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-hairline bg-surface px-3 py-1.5 font-medium text-ink disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
