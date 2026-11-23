"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { UserAvatar } from "./user-avatar";

export interface TopbarMeta {
  breadcrumb: string;
  title: string;
}

export type TopbarMetaSource =
  | Record<string, TopbarMeta>
  | ((pathname: string) => TopbarMeta | undefined);

/** Page meta rendered in the topbar left — extend as admin pages are added. */
export const ADMIN_PAGE_META: Record<string, TopbarMeta> = {
  "/admin": { breadcrumb: "Admin / Dashboard", title: "Ringkasan platform" },
  "/admin/destinasi": {
    breadcrumb: "Admin / Destinasi",
    title: "Destinasi & kategori",
  },
  "/admin/destinasi/baru": {
    breadcrumb: "Admin / Destinasi / Tambah",
    title: "Tambah destinasi",
  },
  "/admin/fasilitas": {
    breadcrumb: "Admin / Fasilitas",
    title: "Verifikasi fasilitas",
  },
  "/admin/verifikasi": { breadcrumb: "Admin / Verifikasi", title: "Verifikasi" },
  "/admin/pengaturan/integrasi": { breadcrumb: "Admin / Pengaturan", title: "Integrasi AI" },
  "/admin/merchant": { breadcrumb: "Admin / Merchant", title: "Merchant" },
  "/admin/users": { breadcrumb: "Admin / Pengguna", title: "Pengguna" },
};

function pageMeta(
  pathname: string,
  section: string,
  meta: TopbarMetaSource,
): TopbarMeta {
  const exact = typeof meta === "function" ? meta(pathname) : meta[pathname];
  if (exact) return exact;
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? section.toLowerCase();
  const pretty = segment.charAt(0).toUpperCase() + segment.slice(1);
  return { breadcrumb: `${section} / ${pretty}`, title: pretty };
}

interface TopbarProps {
  /** Opens the mobile sidebar drawer. */
  onMenuClick: () => void;
  section?: string;
  meta?: TopbarMetaSource;
  searchPlaceholder?: string;
}

/** Shared topbar for the admin and merchant shells. */
export function Topbar({
  onMenuClick,
  section = "Admin",
  meta = ADMIN_PAGE_META,
  searchPlaceholder = "Cari pengguna, destinasi",
}: TopbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { breadcrumb, title } = pageMeta(pathname, section, meta);
  const dashboard = pathname === "/admin";

  return (
    <header className="flex h-[76px] shrink-0 items-center gap-4 bg-canvas px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Buka menu navigasi"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-body transition-colors hover:bg-canvas-subtle hover:text-ink lg:hidden"
        >
          <Menu aria-hidden className="h-5 w-5" />
        </button>
        <div className={dashboard ? "min-w-0 lg:sr-only" : "min-w-0"}>
          <p className="truncate text-xs text-body">{breadcrumb}</p>
          <h1 className="truncate text-[18px] font-bold text-ink">{title}</h1>
        </div>
      </div>

      <label className="hidden h-11 w-full max-w-[420px] min-w-0 items-center gap-2.5 rounded-full border border-hairline bg-surface px-4 focus-within:ring-2 focus-within:ring-primary/25 md:flex">
          <Search aria-hidden className="h-4 w-4 shrink-0 text-body" />
          <span className="sr-only">{searchPlaceholder}</span>
          {/* TODO(SCRUM+): wire global search. */}
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-body focus:outline-none"
          />
      </label>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <button
          type="button"
          aria-label="Notifikasi"
          className="inline-flex size-11 items-center justify-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:bg-canvas-subtle"
        >
          <Bell aria-hidden className="h-[18px] w-[18px]" />
        </button>

        <div className="flex items-center gap-2.5">
          <UserAvatar name={user?.name ?? section} className="size-10" />
          <div className="hidden max-w-44 lg:block">
            <p className="truncate text-sm font-semibold text-ink">{user?.name ?? section}</p>
            <p className="text-xs text-body">{section}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
