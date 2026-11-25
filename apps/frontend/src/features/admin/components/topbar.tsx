"use client";

import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Mail,
  Menu,
  Mountain,
  Search,
  Store,
  Users,
} from "lucide-react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { useDashboardStats } from "~/features/dashboard/hooks/use-dashboard-stats";
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
    title: "Fasilitas",
  },
  "/admin/verifikasi": { breadcrumb: "Admin / Verifikasi", title: "Verifikasi" },
  "/admin/pengaturan/integrasi": {
    breadcrumb: "Admin / Pengaturan",
    title: "Integrasi AI",
  },
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
  const router = useRouter();
  const { token, user } = useAuth();
  const { breadcrumb, title } = pageMeta(pathname, section, meta);
  const dashboard = pathname === "/admin";
  const hideHeaderText = section === "Admin" || dashboard;

  const isAdmin = section === "Admin" && user?.role === "admin";
  const stats = useDashboardStats(6, token, Boolean(token) && isAdmin);
  const totals = stats.data?.totals;
  const pendingCount = totals?.facilities.pending ?? 0;
  const draftCount = totals?.destinations.draft ?? 0;

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const navigateSearch = (basePath: string) => {
    const trimmed = query.trim();
    setSearchOpen(false);
    router.push(
      trimmed ? `${basePath}?search=${encodeURIComponent(trimmed)}` : basePath,
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigateSearch(isAdmin ? "/admin/destinasi" : "/merchant/fasilitas");
  };

  const searchTargets = isAdmin
    ? [
        { label: "Cari di Destinasi", href: "/admin/destinasi", icon: Mountain },
        { label: "Cari di Verifikasi", href: "/admin/verifikasi", icon: BadgeCheck },
        { label: "Cari di Pengguna", href: "/admin/users", icon: Users },
        { label: "Cari di Merchant", href: "/admin/merchant", icon: Store },
      ]
    : [{ label: "Cari di Fasilitas saya", href: "/merchant/fasilitas", icon: Store }];

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
        <div className={hideHeaderText ? "sr-only min-w-0" : "min-w-0"}>
          <p className="truncate text-xs text-body">{breadcrumb}</p>
          <h1 className="truncate text-[18px] font-bold text-ink">{title}</h1>
        </div>
      </div>

      <Popover.Root
        open={searchOpen && query.trim().length > 0}
        onOpenChange={setSearchOpen}
      >
        <Popover.Anchor asChild>
          <form
            onSubmit={handleSubmit}
            className="hidden h-11 w-full max-w-[420px] min-w-0 items-center gap-2.5 rounded-full border border-hairline bg-surface px-4 focus-within:ring-2 focus-within:ring-primary/25 md:flex"
          >
            <Search aria-hidden className="h-4 w-4 shrink-0 text-body" />
            <span className="sr-only">{searchPlaceholder}</span>
            <input
              type="search"
              value={query}
              onFocus={() => query.trim() && setSearchOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(event.target.value.trim().length > 0);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-[13px] text-ink placeholder:text-body focus:outline-none"
            />
          </form>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            onOpenAutoFocus={(event) => event.preventDefault()}
            className="z-50 w-72 rounded-2xl border border-hairline bg-surface p-1.5 shadow-lg focus:outline-none"
          >
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-body">
              Pencarian cepat “{query.trim()}”
            </p>
            {searchTargets.map((target) => {
              const Icon = target.icon;
              return (
                <button
                  key={target.href}
                  type="button"
                  onClick={() => navigateSearch(target.href)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-canvas-subtle"
                >
                  <Icon aria-hidden className="h-4 w-4 text-primary" />
                  <span className="flex-1">{target.label}</span>
                  <ArrowRight aria-hidden className="h-3.5 w-3.5 text-body" />
                </button>
              );
            })}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="Ringkasan aktivitas & pendaftar"
              className="inline-flex size-11 items-center justify-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:bg-canvas-subtle"
            >
              <Mail aria-hidden className="h-[18px] w-[18px]" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className="z-50 w-72 rounded-2xl border border-hairline bg-surface p-4 shadow-lg focus:outline-none"
            >
              <p className="font-display text-sm font-bold text-ink">
                Ringkasan bulan ini
              </p>
              {isAdmin && totals ? (
                <div className="mt-3 space-y-2 text-xs">
                  <Link
                    href="/admin/users"
                    className="flex items-center justify-between rounded-xl bg-canvas-subtle px-3 py-2 text-ink hover:bg-surface-2"
                  >
                    <span>Pengguna baru</span>
                    <span className="font-semibold text-primary">
                      +{totals.users.newThisMonth} akun
                    </span>
                  </Link>
                  <Link
                    href="/admin/merchant"
                    className="flex items-center justify-between rounded-xl bg-canvas-subtle px-3 py-2 text-ink hover:bg-surface-2"
                  >
                    <span>Merchant baru</span>
                    <span className="font-semibold text-primary">
                      +{totals.merchants.newThisMonth} mitra
                    </span>
                  </Link>
                </div>
              ) : (
                <p className="mt-2 text-xs text-body">
                  Pantau layanan dan profil melalui menu sebelah kiri.
                </p>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="Notifikasi"
              className="relative inline-flex size-11 items-center justify-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:bg-canvas-subtle"
            >
              <Bell aria-hidden className="h-[18px] w-[18px]" />
              {pendingCount > 0 && (
                <span
                  aria-hidden
                  className="absolute right-2.5 top-2.5 size-2 rounded-full bg-accent"
                />
              )}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className="z-50 w-76 rounded-2xl border border-hairline bg-surface p-4 shadow-lg focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-bold text-ink">Notifikasi</p>
                {pendingCount > 0 && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {pendingCount} baru
                  </span>
                )}
              </div>
              {isAdmin && totals ? (
                <div className="mt-3 space-y-2 text-xs">
                  <Link
                    href="/admin/verifikasi"
                    className="flex items-center gap-2.5 rounded-xl bg-canvas-subtle px-3 py-2.5 text-ink hover:bg-surface-2"
                  >
                    <BadgeCheck aria-hidden className="h-4 w-4 shrink-0 text-accent" />
                    <span className="flex-1">
                      {pendingCount} fasilitas menunggu verifikasi
                    </span>
                  </Link>
                  <Link
                    href="/admin/destinasi"
                    className="flex items-center gap-2.5 rounded-xl bg-canvas-subtle px-3 py-2.5 text-ink hover:bg-surface-2"
                  >
                    <Mountain aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                    <span className="flex-1">
                      {draftCount} destinasi berstatus draf
                    </span>
                  </Link>
                </div>
              ) : (
                <p className="mt-2 text-xs text-body">Tidak ada notifikasi baru.</p>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <span aria-hidden className="hidden h-7 w-px bg-hairline sm:block" />

        <Link
          href={isAdmin ? "/admin/pengaturan" : "/merchant/profil"}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-canvas-subtle"
        >
          <UserAvatar name={user?.name ?? section} className="size-10" />
          <div className="hidden max-w-44 lg:block">
            <p className="truncate text-sm font-semibold text-ink">
              {user?.name ?? section}
            </p>
            <p className="text-xs text-body">{section}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
