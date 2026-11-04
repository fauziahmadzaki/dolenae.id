"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
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
 * The backend independently enforces the admin role on protected endpoints.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace("/auth/login");
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return <ShellLoader />;
  if (user?.role !== "admin") return <div className="p-8"><h1 className="font-display text-xl font-bold text-ink">Akses ditolak</h1><p className="mt-2 text-sm text-body">Halaman ini hanya untuk admin.</p><a href="/" className="mt-4 inline-block text-sm text-primary underline">Kembali ke beranda</a></div>;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="left-0 top-0 h-[100dvh] w-64 max-w-full translate-x-0 translate-y-0 gap-0 rounded-none p-0">
          <DialogTitle className="sr-only">Navigasi admin</DialogTitle>
          <DialogDescription className="sr-only">Pilih halaman pengelolaan Dolenae.</DialogDescription>
          <Button variant="secondary" className="m-3 shrink-0" onClick={() => setMobileNavOpen(false)}>Tutup menu navigasi</Button>
          <div className="min-h-0 flex-1"><Sidebar onClose={() => setMobileNavOpen(false)} /></div>
        </DialogContent>
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}