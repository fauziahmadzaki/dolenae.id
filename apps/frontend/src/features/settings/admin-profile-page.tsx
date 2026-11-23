"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/toaster";
import { UserAvatar } from "~/features/admin/components/user-avatar";
import { updateMe } from "~/features/auth/api/profile";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { ApiError } from "~/lib/api/types";

export function AdminProfilePage() {
  const { user, token, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const save = useMutation({
    mutationFn: (payload: { name: string; phone: string | null }) => {
      if (!token) throw new Error("Sesi berakhir. Silakan masuk kembali.");
      return updateMe(payload, token);
    },
    onSuccess: (profile) => {
      updateUser(profile);
      toast({ title: "Profil admin disimpan", variant: "success" });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        router.replace("/auth/login");
      }
      toast({ title: error instanceof Error ? error.message : "Profil gagal disimpan", variant: "danger" });
    },
  });

  if (!user || user.role !== "admin") return null;

  return (
    <form
      key={JSON.stringify([user.id, user.name, user.phone])}
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (save.isPending) return;
        const fields = new FormData(event.currentTarget);
        const name = String(fields.get("name") ?? "").trim();
        if (name.length < 2) {
          toast({ title: "Nama minimal 2 karakter", variant: "danger" });
          return;
        }
        save.mutate({ name, phone: String(fields.get("phone") ?? "").trim() || null });
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-sans text-2xl font-bold">Pengaturan</h1>
        <div className="flex flex-wrap gap-2">
          <Button type="reset" variant="secondary" disabled={save.isPending}>Batal</Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Check aria-hidden className="size-4" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>
      <section aria-labelledby="admin-profile-title" className="overflow-hidden rounded-xl border border-hairline bg-surface">
        <div className="border-b border-hairline px-6 py-4">
          <h2 id="admin-profile-title" className="font-sans font-bold">Profil Admin</h2>
          <p className="mt-1 text-sm text-body">Informasi akun yang tampil di panel admin.</p>
        </div>
        <div className="flex items-center gap-4 border-b border-hairline px-6 py-5">
          <UserAvatar name={user.name} className="size-16" textClassName="text-xl" />
          <div>
            <p className="text-sm font-semibold text-ink">Profil akun</p>
            <p className="text-xs text-body">{user.email}</p>
          </div>
        </div>
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-ink"><span>Nama lengkap</span><Input name="name" autoComplete="name" defaultValue={user.name} minLength={2} maxLength={120} required /></label>
          <label className="space-y-1.5 text-sm font-medium text-ink"><span>Email</span><Input type="email" value={user.email} readOnly /></label>
          <label className="space-y-1.5 text-sm font-medium text-ink"><span>Peran</span><Input value="Admin" readOnly /></label>
          <label className="space-y-1.5 text-sm font-medium text-ink"><span>Telepon</span><Input name="phone" type="tel" autoComplete="tel" defaultValue={user.phone ?? ""} maxLength={30} /></label>
        </div>
      </section>
    </form>
  );
}
