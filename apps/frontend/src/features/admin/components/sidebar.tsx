"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Mountain,
  Settings,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { BrandMark } from "~/components/brand-mark";
import { cn } from "~/lib/cn";
import { UserAvatar } from "./user-avatar";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional count pill (e.g. pending verifications). TODO: bind to API. */
  badge?: string;
}

const NAV_MAIN: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Destinasi", href: "/admin/destinasi", icon: Mountain },
  { label: "Verifikasi", href: "/admin/verifikasi", icon: BadgeCheck, badge: "7" },
  { label: "Merchant", href: "/admin/merchant", icon: Store },
  { label: "Konten", href: "/admin/konten", icon: FileText },
];

const NAV_SYSTEM: NavItem[] = [
  { label: "Pengguna", href: "/admin/pengguna", icon: Users },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

interface SidebarProps {
  /** Close handler for the mobile drawer. */
  onClose?: () => void;
}

function NavList({ items, onClose }: { items: NavItem[]; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-[33px] items-center gap-2.5 rounded-lg px-3 text-sm transition-colors",
              isActive
                ? "bg-surface-2 font-semibold text-ink"
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
 * Admin sidebar (slice of "Hi-Fi Web Admin - Overview" in Figma).
 * Two nav groups + user card; used by the desktop shell and the mobile drawer.
 */
export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-hairline bg-surface px-4 py-4">
      <div className="flex items-center gap-2.5">
        <BrandMark size={32} />
        <span className="text-[18px] font-bold text-ink">Dolenae.id</span>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-body">
          Admin
        </span>
      </div>

      <div className="mt-5 space-y-6">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-body">
            MENU UTAMA
          </p>
          <NavList items={NAV_MAIN} onClose={onClose} />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-body">
            SISTEM
          </p>
          <NavList items={NAV_SYSTEM} onClose={onClose} />
        </div>
      </div>

      <div className="mt-auto" />

      <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 p-2.5">
        <UserAvatar name={user?.name ?? "Admin Dolenae"} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {user?.name ?? "Admin Dolenae"}
          </p>
          <p className="truncate text-xs text-body">
            {user?.email ?? "admin@dolenae.id"}
          </p>
        </div>
        <button
          type="button"
          aria-label="Keluar"
          title="Keluar"
          onClick={handleLogout}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-body transition-colors hover:bg-surface hover:text-danger"
        >
          <LogOut aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}