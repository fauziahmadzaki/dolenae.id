"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import type { UserRole } from "~/features/auth/types";
import { ShellSearchProvider } from "./shell-search-context";
import {
  ADMIN_NAV_MAIN,
  ADMIN_NAV_SYSTEM,
  Sidebar,
  type NavItem,
} from "./sidebar";
import {
  ADMIN_PAGE_META,
  Topbar,
  type TopbarMetaSource,
} from "./topbar";

function ShellLoader() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center gap-2 bg-canvas">
      <Loader2 aria-hidden className="h-6 w-6 animate-spin text-primary" />
      <span className="text-sm text-body">Memuat…</span>
    </div>
  );
}

/**
 * Admin shell (SCRUM-9): sidebar + topbar + content region.
 * Guards every /admin/* route: unauthenticated users are redirected to
 * /auth/login. On small screens the sidebar becomes a slide-in drawer.
 * TODO: refine to role-based access once the role requirement is confirmed.
 */
interface AdminShellProps {
  children: ReactNode;
  /** Role required to access this shell (default `admin`). */
  allowedRole?: UserRole;
  /** Pill label next to the brand mark. */
  roleLabel?: string;
  mainNav?: NavItem[];
  systemNav?: NavItem[];
  meta?: TopbarMetaSource;
  searchPlaceholder?: string;
}

export function AdminShell({
  children,
  allowedRole = "admin",
  roleLabel = "Admin",
  mainNav = ADMIN_NAV_MAIN,
  systemNav = ADMIN_NAV_SYSTEM,
  meta = ADMIN_PAGE_META,
  searchPlaceholder,
}: AdminShellProps) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    if (user?.role === allowedRole) return;
    if (user?.role === "admin") router.replace("/admin");
    else if (user?.role === "merchant") router.replace("/merchant");
    else router.replace("/");
  }, [hydrated, isAuthenticated, user, allowedRole, router]);

  if (!hydrated || !isAuthenticated || user?.role !== allowedRole) {
    return <ShellLoader />;
  }

  return (
    <ShellSearchProvider>
      <div className="flex h-[100dvh] overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden shrink-0 lg:block">
        <Sidebar
          roleLabel={roleLabel}
          mainNav={mainNav}
          systemNav={systemNav}
        />
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex">
            <Sidebar
              onClose={() => setMobileNavOpen(false)}
              roleLabel={roleLabel}
              mainNav={mainNav}
              systemNav={systemNav}
            />
            <button
              type="button"
              aria-label="Tutup menu navigasi"
              onClick={() => setMobileNavOpen(false)}
              className="m-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-body"
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => setMobileNavOpen(true)}
          section={roleLabel}
          meta={meta}
          searchPlaceholder={searchPlaceholder}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
    </ShellSearchProvider>
  );
}