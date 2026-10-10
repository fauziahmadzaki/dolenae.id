"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { get, post, patch, del } from "~/lib/api/client";
import { ApiError } from "~/lib/api/types";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { roleLabels, userFormSchema, type ManagedUser, type UserForm } from "./schema";

type Mode = { kind: "create" } | { kind: "edit" | "detail" | "delete"; user: ManagedUser };
const asset = (name: string) => `/admin-assets/${name}.svg`;
function Icon({ name }: { name: string }) { return <img src={asset(name)} alt="" aria-hidden="true" />; }
const date = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
const message = (error: unknown) => error instanceof Error ? error.message : "Permintaan gagal. Silakan coba lagi.";

export default function UsersPage() {
  const auth = useAuth();
  const router = useRouter();
  const cache = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [view, setView] = useState("table");
  const [mode, setMode] = useState<Mode | null>(null);
  const [notice, setNotice] = useState("");
  const params = new URLSearchParams({ page: String(page), limit: "6", sort: "createdAt", order: "desc" });
  if (search.trim()) params.set("search", search.trim());
  if (role) params.set("role", role);
  const list = useQuery({
    queryKey: ["users", auth.token, page, search, role],
    queryFn: ({ signal }) => get<ManagedUser[]>(`/users?${params}`, { token: auth.token!, signal }),
    enabled: auth.hydrated && !!auth.token && auth.user?.role === "admin",
    retry: false,
  });
  useEffect(() => {
    if (auth.hydrated && !auth.token) router.replace("/auth/login");
  }, [auth.hydrated, auth.token, router]);
  useEffect(() => {
    if (list.error instanceof ApiError && list.error.status === 401) {
      cache.removeQueries({ queryKey: ["users"] });
      auth.logout();
      router.replace("/auth/login");
    }
  }, [list.error, auth.logout, cache, router]);
  const total = Number(list.data?.meta?.total ?? 0);
  const pages = Number(list.data?.meta?.totalPages ?? 1);
  useEffect(() => { if (list.data && page > pages) setPage(pages); }, [list.data, page, pages]);
  if (!auth.hydrated || !auth.token) return <main className="p-8" role="status">Memeriksa sesi…</main>;
  if (auth.user?.role !== "admin") return <main className="p-8"><h1 className="text-xl font-bold">Akses ditolak</h1><p>Halaman ini hanya untuk admin.</p><Link href="/">Kembali ke beranda</Link><Button variant="ghost" onClick={() => { cache.removeQueries({ queryKey: ["users"] }); auth.logout(); }}>Keluar</Button></main>;
  const users = list.data?.data ?? [];
  const open = (next: Mode) => { setNotice(""); setMode(next); };
  const actions = (user: ManagedUser) => <div className="flex gap-2"><button className="rounded-md bg-surface-2 p-2" aria-label={`Edit ${user.name}`} onClick={() => open({ kind: "edit", user })}><Icon name="imgLucidePencil" /></button><button className="rounded-md bg-surface-2 p-2 disabled:opacity-40" aria-label={`Hapus ${user.name}`} disabled={user.id === auth.user?.id} title={user.id === auth.user?.id ? "Admin tidak dapat menghapus akun sendiri" : "Hapus pengguna"} onClick={() => open({ kind: "delete", user })}><Icon name="imgLucideTrash2" /></button></div>;
  return <div className="min-h-dvh md:grid md:grid-cols-[256px_minmax(0,1fr)]">
    <aside className="flex flex-col gap-5 border-r border-hairline bg-surface p-4 md:min-h-dvh">
      <div className="flex h-11 items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-lg bg-primary"><Icon name="imgGroup" /></span><strong className="text-lg text-ink">Dolenae.id</strong><span className="rounded-full bg-surface-2 px-2 py-1 text-[11px]">Admin</span></div>
      <nav aria-label="Navigasi admin" className="hidden space-y-5 md:block">
        <div><p className="mb-2 text-[11px] font-semibold">MENU UTAMA</p>{[["Dashboard","imgGroup1"],["Destinasi","imgLucideMountain"],["Verifikasi","imgGroup2"],["Merchant","imgGroup3"],["Konten","imgGroup4"]].map(([label, icon]) => <button key={label} disabled title="Modul belum tersedia" className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-body"><Icon name={icon} />{label}</button>)}</div>
        <div><p className="mb-2 text-[11px] font-semibold">SISTEM</p><Link href="/admin/users" aria-current="page" className="flex items-center gap-2.5 rounded-md bg-surface-2 px-3 py-2 text-sm"><Icon name="imgGroup5" />Pengguna</Link><button disabled title="Modul belum tersedia" className="flex items-center gap-2.5 px-3 py-2 text-sm"><Icon name="imgGroup6" />Pengaturan</button></div>
      </nav>
      <div className="mt-auto hidden items-center gap-3 rounded-lg bg-surface-2 p-3 md:flex"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-on-primary">{auth.user.name.slice(0,2).toUpperCase()}</span><div className="min-w-0 text-xs"><strong className="block truncate text-sm text-ink">{auth.user.name}</strong><span className="block truncate">{auth.user.email}</span></div></div>
    </aside>
    <div className="min-w-0">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-hairline bg-surface px-4 md:px-8"><div><p className="text-xs">Admin / Pengguna</p><h1 className="font-sans text-lg font-bold">Kelola pengguna</h1></div><Button size="sm" variant="ghost" onClick={() => { cache.removeQueries({ queryKey: ["users"] }); auth.logout(); }}>Keluar</Button></header>
      <main className="space-y-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-sans text-xl font-bold">Daftar Pengguna</h2><p className="mt-1 text-sm">Lihat dan atur peran serta status pengguna.</p></div><Button className="h-[38px]" onClick={() => open({ kind: "create" })}><Icon name="imgLucidePlus" />Tambah pengguna</Button></div>
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-3"><label className="flex h-[38px] w-full items-center gap-2 rounded-lg border border-hairline bg-surface px-3 sm:w-[300px]"><Icon name="imgGroup7" /><input aria-label="Cari pengguna" placeholder="Cari pengguna" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-primary" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></label><select aria-label="Filter role" className="h-[38px] rounded-lg border border-hairline bg-surface px-3 text-[13px]" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}><option value="">Semua role</option>{Object.entries(roleLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select><button disabled title="Status akun belum tersedia di API" className="h-[38px] rounded-lg border border-hairline bg-surface px-3 text-[13px]">Status</button></div><div className="flex items-center gap-3"><span className="text-[13px]" aria-live="polite">{total} pengguna</span><div className="flex gap-1 rounded-lg bg-surface-2 p-1">{[["table","imgGroup8","Tabel"],["card","imgGroup9","Card"]].map(([value,icon,label]) => <button key={value} aria-pressed={view === value} onClick={() => setView(value)} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs ${view === value ? "bg-surface text-ink" : ""}`}><Icon name={icon} />{label}</button>)}</div></div></div>
        <p className="text-xs">Status akun dan undangan email belum didukung API. Tambah pengguna membuat akun dengan kata sandi.</p>
        {notice && <p role="status" className="text-sm text-success">{notice}</p>}
        {list.isPending ? <p role="status">Memuat pengguna…</p> : list.isError ? <div role="alert"><p>{message(list.error)}</p><Button variant="secondary" onClick={() => list.refetch()}>Coba lagi</Button></div> : users.length === 0 ? <div className="rounded-lg border border-hairline bg-surface p-8 text-center"><h3 className="font-sans font-semibold">Tidak ada pengguna</h3><p className="mt-2 text-sm">Coba ubah pencarian atau role, atau tambahkan pengguna.</p></div> : view === "table" ? <div className="overflow-x-auto rounded-lg border border-hairline bg-surface" aria-busy={list.isFetching}><table className="w-full min-w-[960px] text-left text-sm"><thead className="h-12 bg-surface-2 text-[11px]"><tr>{["PENGGUNA","EMAIL","ROLE","STATUS","TERDAFTAR","AKSI"].map((s) => <th key={s} scope="col" className="px-6 font-semibold">{s}</th>)}</tr></thead><tbody>{users.map((user) => <tr key={user.id} className="h-16 border-t border-hairline even:bg-canvas/50"><td className="px-6"><button className="flex items-center gap-3 text-left" onClick={() => open({ kind: "detail", user })}><span className="flex size-9 items-center justify-center rounded-md bg-canvas-subtle"><Icon name="imgLucideMountain1" /></span><span><strong className="block text-ink">{user.name}</strong><span className="text-xs" title={user.id}>{user.id.slice(0,8)}</span></span></button></td><td className="px-6">{user.email}</td><td className="px-6"><span className="rounded-full bg-surface-2 px-2 py-1 text-xs">{roleLabels[user.role]}</span></td><td className="px-6 text-xs">Belum tersedia</td><td className="whitespace-nowrap px-6">{date(user.createdAt)}</td><td className="px-6">{actions(user)}</td></tr>)}</tbody></table></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{users.map((user) => <article key={user.id} className="space-y-3 rounded-lg border border-hairline bg-surface p-5"><button className="text-left font-semibold text-ink" onClick={() => open({kind:"detail",user})}>{user.name}</button><p className="break-all text-sm">{user.email}</p><p className="text-xs">{roleLabels[user.role]} · {date(user.createdAt)}</p>{actions(user)}</article>)}</div>}
        {!list.isError && <div className="flex flex-wrap items-center justify-between gap-4 text-sm"><p>Menampilkan {total ? (page-1)*6+1 : 0}-{Math.min(page*6,total)} dari {total} pengguna</p><div className="flex items-center gap-2"><Button aria-label="Halaman sebelumnya" variant="secondary" size="sm" disabled={page <= 1 || list.isFetching} onClick={() => setPage(page-1)}><Icon name="imgLucideChevronLeft" /></Button><span aria-current="page" className="rounded-md bg-primary px-3 py-2 text-on-primary">{page}</span><Button aria-label="Halaman berikutnya" variant="secondary" size="sm" disabled={page >= pages || list.isFetching} onClick={() => setPage(page+1)}><Icon name="imgLucideChevronRight" /></Button></div></div>}
      </main>
    </div>
    {mode && <UserDialog key={mode.kind + ("user" in mode ? mode.user.id : "")} mode={mode} token={auth.token} onClose={() => setMode(null)} onSaved={() => { setMode(null); setNotice("Perubahan pengguna berhasil disimpan."); cache.invalidateQueries({ queryKey: ["users"] }); }} onUnauthorized={() => { cache.removeQueries({ queryKey: ["users"] }); auth.logout(); router.replace("/auth/login"); }} />}
  </div>;
}

function UserDialog({ mode, token, onClose, onSaved, onUnauthorized }: { mode: Mode; token: string; onClose: () => void; onSaved: () => void; onUnauthorized: () => void }) {
  const user = "user" in mode ? mode.user : null;
  const form = useForm<UserForm>({ defaultValues: { name: user?.name ?? "", email: user?.email ?? "", role: user?.role ?? "wisatawan", password: "" } });
  const detail = useQuery({ queryKey: ["user-detail", token, user?.id], queryFn: ({signal}) => get<ManagedUser>(`/users/${user!.id}`, {token,signal}), enabled: mode.kind === "detail", retry: false });
  const mutation = useMutation({ mutationFn: async (values?: UserForm) => {
    if (mode.kind === "delete") return del(`/users/${user!.id}`, {token});
    if (!values) return;
    const { password, ...fields } = values;
    const payload = password ? {...fields,password} : fields;
    return mode.kind === "create" ? post("/users", payload, {token}) : patch(`/users/${user!.id}`, payload, {token});
  }, onSuccess: onSaved, onError: (error) => { if (error instanceof ApiError && error.status === 401) onUnauthorized(); } });
  const submit = form.handleSubmit((values) => {
    const parsed = userFormSchema.safeParse(values);
    if (!parsed.success) { for (const issue of parsed.error.issues) form.setError(issue.path[0] as keyof UserForm, {message:issue.message}); return; }
    if (mode.kind === "create" && !parsed.data.password) { form.setError("password", {message:"Kata sandi wajib diisi"}); return; }
    mutation.mutate(parsed.data);
  });
  const titles = { create: "Tambah pengguna", edit: "Edit pengguna", detail: "Detail pengguna", delete: "Hapus pengguna" };
  const record = detail.data?.data;
  return <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}><DialogContent className="w-[480px] max-h-[90dvh] overflow-y-auto"><DialogTitle>{titles[mode.kind]}</DialogTitle><DialogDescription>{mode.kind === "delete" ? `Hapus ${user?.name}? Tindakan ini tidak dapat dibatalkan.` : mode.kind === "create" ? "Buat akun baru. Undangan email belum tersedia." : "Data pengguna dari Dolenae API."}</DialogDescription>
    {mutation.isError && <p role="alert" className="text-sm text-danger">{message(mutation.error)}</p>}
    {mode.kind === "detail" ? <>{detail.isPending ? <p role="status">Memuat detail…</p> : detail.isError ? <p role="alert">{message(detail.error)}</p> : record && <dl className="space-y-3 text-sm">{[["Nama",record.name],["Email",record.email],["Role",roleLabels[record.role]],["ID",record.id],["Terdaftar",date(record.createdAt)],["Diperbarui",date(record.updatedAt)]].map(([label,value]) => <div key={label}><dt className="font-semibold text-ink">{label}</dt><dd className="break-all">{value}</dd></div>)}</dl>}<Button variant="secondary" onClick={onClose}>Tutup</Button></> : mode.kind === "delete" ? <div className="flex justify-end gap-2"><Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>Batal</Button><Button className="bg-danger hover:bg-danger/90" disabled={mutation.isPending} onClick={() => mutation.mutate(undefined)}>{mutation.isPending ? "Menghapus…" : "Hapus permanen"}</Button></div> : <form onSubmit={submit} className="space-y-4" noValidate><fieldset disabled={mutation.isPending} className="space-y-4">{(["name","email","password"] as const).map((field) => <div key={field}><label htmlFor={`user-${field}`} className="mb-1 block text-sm font-semibold">{{name:"Nama",email:"Email",password:mode.kind === "create" ? "Kata sandi" : "Kata sandi baru (opsional)"}[field]}</label><Input id={`user-${field}`} type={field === "password" ? "password" : field === "email" ? "email" : "text"} autoComplete={field === "password" ? "new-password" : "off"} aria-invalid={!!form.formState.errors[field]} aria-describedby={form.formState.errors[field] ? `error-${field}` : undefined} {...form.register(field)} />{form.formState.errors[field] && <p id={`error-${field}`} role="alert" className="mt-1 text-xs text-danger">{form.formState.errors[field]?.message}</p>}</div>)}<label className="block text-sm font-semibold" htmlFor="user-role">Role</label><select id="user-role" className="h-12 w-full rounded-lg border border-hairline bg-surface-2 px-3" {...form.register("role")}>{Object.entries(roleLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></fieldset><div className="flex justify-end gap-2"><Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>Batal</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Menyimpan…" : "Simpan"}</Button></div></form>}
  </DialogContent></Dialog>;
}
