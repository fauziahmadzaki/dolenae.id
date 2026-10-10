"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { UserAvatar } from "./user-avatar";

/** Page meta rendered in the topbar left — extend as admin pages are added. */
const PAGE_META: Record<string, { breadcrumb: string; title: string }> = {
  "/admin": { breadcrumb: "Admin / Dashboard", title: "Ringkasan platform" },
};

function pageMeta(pathname: string): { breadcrumb: string; title: string } {
  const exact = PAGE_META[pathname];
  if (exact) return exact;
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
        <label className="relative hidden h-9 w-60 items-center gap-2 rounded-lg bg-surface-2 px-3 md:flex">
          <Search aria-hidden className="h-4 w-4 shrink-0 text-body" />
          <span className="sr-only">Cari pengguna, destinasi</span>
          {/* TODO(SCRUM+): wire global admin search. */}
          <input
            type="search"
            placeholder="Cari pengguna, destinasi"
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-body focus:outline-none"
          />
        </label>

        <button
          type="button"
          aria-label="Notifikasi"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-body transition-colors hover:text-ink"
        >
          <Bell aria-hidden className="h-[18px] w-[18px]" />
        </button>

        <UserAvatar name={user?.name ?? "Admin Dolenae"} />
      </div>
    </header>
  );
}