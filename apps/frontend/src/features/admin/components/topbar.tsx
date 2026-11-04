"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { UserAvatar } from "./user-avatar";

/** Page meta rendered in the topbar left — extend as admin pages are added. */
const PAGE_META: Record<string, { breadcrumb: string; title: string }> = {
  "/admin": { breadcrumb: "Admin / Dashboard", title: "Ringkasan platform" },
  "/admin/fasilitas": { breadcrumb: "Admin / Fasilitas", title: "Fasilitas sekitar" },
  "/admin/verifikasi": { breadcrumb: "Admin / Verifikasi", title: "Usulan fasilitas" },
  "/admin/promo": { breadcrumb: "Admin / Promo", title: "Kode promo" },
  "/admin/pembayaran": { breadcrumb: "Admin / Pembayaran", title: "Pembayaran dummy / simulasi" },
  "/admin/merchant": { breadcrumb: "Admin / Merchant", title: "Akun merchant" },
  "/admin/konten": { breadcrumb: "Admin / Konten", title: "FAQ & masukan" },
  "/admin/destinasi": {
    breadcrumb: "Admin / Destinasi",
    title: "Destinasi & kategori",
  },
  "/admin/destinasi/baru": {
    breadcrumb: "Admin / Destinasi / Tambah",
    title: "Tambah destinasi",
  },
};

function pageMeta(pathname: string): { breadcrumb: string; title: string } {
  const exact = PAGE_META[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/admin/pembayaran/")) return { breadcrumb: "Admin / Pembayaran / Detail", title: "Detail pembayaran dummy" };
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "admin";
  const pretty = segment.charAt(0).toUpperCase() + segment.slice(1);
  return { breadcrumb: `Admin / ${pretty}`, title: pretty };
}

interface TopbarProps {
  /** Opens the mobile sidebar drawer. */
  onMenuClick: () => void;
}

/** Admin topbar (slice of "Hi-Fi Web Admin - Overview" in Figma). */
export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { breadcrumb, title } = pageMeta(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-hairline bg-surface px-4 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Buka menu navigasi"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-body transition-colors hover:bg-canvas-subtle hover:text-ink lg:hidden"
        >
          <Menu aria-hidden className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs text-body">{breadcrumb}</p>
          <h1 className="truncate text-[18px] font-bold text-ink">{title}</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">

        <UserAvatar name={user?.name ?? "Admin Dolenae"} />
      </div>
    </header>
  );
}