"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

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
export function AdminShell({ children }: { children: ReactNode }) {
  const { hydrated, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace("/auth/login");
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return <ShellLoader />;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
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
            <Sidebar onClose={() => setMobileNavOpen(false)} />
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
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}