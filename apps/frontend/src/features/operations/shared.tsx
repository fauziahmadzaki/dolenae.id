"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { del, get } from "~/lib/api/client";
import { ApiError } from "~/lib/api/types";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { useToast } from "~/components/ui/toaster";

export function useAdminQuery<T>(path: string, params: Record<string, string | number> = {}) {
  const auth = useAuth();
  const router = useRouter();
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", path, params, auth.user?.id],
    queryFn: ({ signal }) => get<T>(`${path}?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "").map(([k, v]) => [k, String(v)]))}`, { token: auth.token ?? undefined, signal }),
    enabled: auth.hydrated && !!auth.token && auth.user?.role === "admin",
    placeholderData: (previous, previousQuery) => previousQuery?.queryKey[1] === path && previousQuery.queryKey.at(-1) === auth.user?.id ? previous : undefined,
    retry: false,
  });
  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 401) {
      cache.removeQueries({ queryKey: ["admin"] });
      auth.logout();
      router.replace("/auth/login");
    }
  }, [query.error, auth.logout, router, cache]);
  return query;
}

export function useAdminMutation<T>(action: (input: T, token: string) => Promise<unknown>, onSaved: () => void) {
  const { token, logout } = useAuth();
  const cache = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (input: T) => {
      if (!token) throw new Error("Sesi berakhir. Silakan masuk kembali.");
      return action(input, token);
    },
    onSuccess: async () => {
      await Promise.all([cache.invalidateQueries({ queryKey: ["admin"] }), cache.invalidateQueries({ queryKey: ["public"] })]);
      toast({ title: "Perubahan tersimpan", variant: "success" });
      onSaved();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        cache.removeQueries({ queryKey: ["admin"] });
        logout();
        router.replace("/auth/login");
      }
    },
  });
}

export function PageHeading({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-display text-2xl font-bold text-ink">{title}</h2><p className="mt-1 text-sm text-body">{description}</p></div>{children}</div>;
}
export function ErrorMessage({ error, retry }: { error: unknown; retry?: () => void }) {
  if (!error) return null;
  return <div role="alert" className="rounded-lg border border-danger/30 bg-surface p-4"><p className="text-sm text-danger">{error instanceof TypeError ? "Koneksi ke server gagal. Periksa jaringan lalu coba lagi." : error instanceof Error ? error.message : "Permintaan gagal. Silakan coba lagi."}</p>{retry && <Button variant="secondary" className="mt-3" onClick={retry}>Coba lagi</Button>}</div>;
}
export function StatusBadge({ value }: { value: string }) {
  const tone = ["paid", "terverifikasi", "Aktif"].includes(value) ? "text-success bg-success/10" : ["cancelled", "ditolak", "Nonaktif"].includes(value) ? "text-danger bg-danger/10" : "text-body bg-surface-2";
  const label: Record<string, string> = { pending: "Menunggu", paid: "Lunas (simulasi)", cancelled: "Dibatalkan", menunggu: "Menunggu", terverifikasi: "Terverifikasi", ditolak: "Ditolak" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label[value] ?? value}</span>;
}
export function DeleteDialog({ name, path, onClose }: { name: string; path: string; onClose: () => void }) {
  const mutation = useAdminMutation((_: void, token) => del(path, { token }), onClose);
  return <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}><DialogContent><DialogTitle>Hapus {name}?</DialogTitle><DialogDescription>Data yang dihapus tidak dapat dikembalikan. Relasi yang masih digunakan dapat ditolak server.</DialogDescription><ErrorMessage error={mutation.error} /><DialogFooter><Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>Batal</Button><Button className="bg-danger hover:bg-danger/90" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Menghapus…" : "Hapus"}</Button></DialogFooter></DialogContent></Dialog>;
}
