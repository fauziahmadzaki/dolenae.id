"use client";

import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BadgeCheck,
  ChevronsUpDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Mountain,
  Settings,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "~/components/brand-mark";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { useDashboardStats } from "~/features/dashboard/hooks/use-dashboard-stats";
import { cn } from "~/lib/cn";
import { UserAvatar } from "./user-avatar";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  /** Only highlight when the path matches exactly (e.g. dashboard roots). */
  exact?: boolean;
  /** Additional route prefixes that count as active under this nav item. */
  activePaths?: string[];
}

export const ADMIN_NAV_MAIN: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Destinasi", href: "/admin/destinasi", icon: Mountain },
  { label: "Verifikasi", href: "/admin/verifikasi", icon: BadgeCheck },
  {
    label: "Merchant",
    href: "/admin/merchant",
    icon: Store,
    activePaths: ["/admin/fasilitas"],
  },
  { label: "Konten", href: "/admin/konten", icon: FileText },
];

export const ADMIN_NAV_SYSTEM: NavItem[] = [
  { label: "Pengguna", href: "/admin/users", icon: Users },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

interface SidebarProps {
  /** Close handler for the mobile drawer. */
  onClose?: () => void;
  /** Role pill next to the brand ("Admin" / "Merchant"). */
  roleLabel?: string;
  mainNav?: NavItem[];
  systemNav?: NavItem[];
  /** Empty string to hide a group title. */
  mainGroupLabel?: string;
  systemGroupLabel?: string;
}

function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  if (pathname.startsWith(item.href)) return true;
  return item.activePaths?.some((prefix) => pathname.startsWith(prefix)) ?? false;
}

function NavList({ items, onClose }: { items: NavItem[]; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = isNavActive(pathname, item);
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-2.5 rounded-2xl px-3 text-sm transition-colors",
              isActive
                ? "bg-primary font-semibold text-on-primary"
                : "text-body hover:bg-canvas-subtle hover:text-ink",
            )}
          >
            <Icon aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="inline-flex min-w-[23px] items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-on-accent">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Admin sidebar aligned with Figma "Hi-Fi Web Admin (Alam)".
 * Two nav groups, dynamic verification count badge, and account menu.
 */
export function Sidebar({
  onClose,
  roleLabel = "Admin",
  mainNav = ADMIN_NAV_MAIN,
  systemNav = ADMIN_NAV_SYSTEM,
  mainGroupLabel = "MENU UTAMA",
  systemGroupLabel = "SISTEM",
}: SidebarProps) {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const isAdmin = roleLabel === "Admin" && user?.role === "admin";
  const stats = useDashboardStats(6, token, Boolean(token) && isAdmin);
  const pendingVerifications = stats.data?.totals.facilities.pending ?? 0;

  const resolvedMainNav = isAdmin
    ? mainNav.map((item) =>
        item.href === "/admin/verifikasi" && pendingVerifications > 0
          ? { ...item, badge: String(pendingVerifications) }
          : item,
      )
    : mainNav;

  const profileHref = isAdmin ? "/admin/pengaturan" : "/merchant/profil";

  const handleLogout = () => {
    setAccountMenuOpen(false);
    logout();
    router.push("/auth/login");
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-hairline bg-surface px-4 py-4">
      <div className="flex items-center gap-2.5">
        <BrandMark size={36} rounded="rounded-2xl" />
        <div>
          <p className="font-display text-[17px] leading-5 font-bold text-ink">
            Dolenae.id
          </p>
          <p className="text-[11px] text-body">Panel {roleLabel}</p>
        </div>
      </div>

      <div className="mt-5 space-y-6">
        <div>
          {mainGroupLabel && (
            <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-body">
              {mainGroupLabel}
            </p>
          )}
          <NavList items={resolvedMainNav} onClose={onClose} />
        </div>
        <div>
          {systemGroupLabel && (
            <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-body">
              {systemGroupLabel}
            </p>
          )}
          <NavList items={systemNav} onClose={onClose} />
        </div>
      </div>

      <div className="mt-auto" />

      <Popover.Root open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-label="Menu akun"
            className="flex w-full items-center gap-2.5 rounded-2xl border border-hairline bg-canvas-subtle p-2.5 text-left transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <UserAvatar name={user?.name ?? `Admin Dolenae`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {user?.name ?? "Admin Dolenae"}
              </p>
              <p className="truncate text-xs text-body">
                {user?.email ?? "admin@dolenae.id"}
              </p>
            </div>
            <ChevronsUpDown aria-hidden className="h-4 w-4 shrink-0 text-body" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="top"
            align="start"
            sideOffset={8}
            className="z-50 w-56 rounded-2xl border border-hairline bg-surface p-1.5 shadow-lg focus:outline-none"
          >
            <Link
              href={profileHref}
              onClick={() => {
                setAccountMenuOpen(false);
                onClose?.();
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-canvas-subtle"
            >
              <Settings aria-hidden className="h-4 w-4 text-body" />
              Pengaturan akun
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut aria-hidden className="h-4 w-4" />
              Keluar
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </aside>
  );
}
