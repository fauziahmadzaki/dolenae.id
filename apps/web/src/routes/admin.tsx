import { useEffect } from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useAuth } from "~/features/auth/auth-context";
import {
  IconDashboard,
  IconMountain,
  IconBadgeCheck,
  IconStore,
  IconFileText,
  IconSettings,
  IconSearch,
  IconBell,
  IconChevronsUpDown,
  IconUsers,
} from "~/components/icons";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const MENU_UTAMA = [
  { to: "/admin", label: "Dashboard", icon: IconDashboard, exact: true },
  { to: "/admin/categories", label: "Destinasi", icon: IconMountain, exact: false },
  { to: "/admin/users", label: "Verifikasi", icon: IconBadgeCheck, exact: false, badge: "7" },
  { to: "/admin/users", label: "Merchant", icon: IconStore, exact: false },
  { to: "/admin/users", label: "Konten", icon: IconFileText, exact: false },
] as const;

const MENU_SISTEM = [
  { to: "/admin/users", label: "Pengguna", icon: IconUsers, exact: false },
  { to: "/admin", label: "Pengaturan", icon: IconSettings, exact: false },
] as const;

/** Judul topbar per rute (breadcrumb + subtitel). */
function topbarFor(pathname: string): { crumb: string; title: string } {
  if (pathname.includes("/admin/destinations/new"))
    return { crumb: "Admin / Destinasi / Tambah", title: "Tambah destinasi" };
  if (pathname.includes("/admin/destinations/"))
    return { crumb: "Admin / Destinasi / Edit", title: "Edit destinasi" };
  if (pathname.startsWith("/admin/categories"))
    return { crumb: "Admin / Destinasi", title: "Kelola kategori dan destinasi" };
  if (pathname.startsWith("/admin/users"))
    return { crumb: "Admin / Pengguna", title: "Daftar pengguna" };
  return { crumb: "Admin / Dashboard", title: "Ringkasan platform" };
}

function AdminLayout() {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { crumb, title } = topbarFor(pathname);

  useEffect(() => {
    if (ready && !user) {
      void navigate({ to: "/login" });
    }
  }, [ready, user, navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-body">
        Memeriksa sesi...
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.name || "A")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col gap-5 border-r border-hairline bg-surface p-4 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-on-primary">
            <IconMountain className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-lg font-extrabold text-ink">
            Dolenae.id
          </span>
          <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-body">
            Admin
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-5">
          <div className="space-y-1.5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-body">
              Menu Utama
            </p>
            <div className="space-y-0.5">
              {MENU_UTAMA.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-body">
              Sistem
            </p>
            <div className="space-y-0.5">
              {MENU_SISTEM.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        </nav>

        {/* UserCard */}
        <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-surface-2 p-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">
              {user.name}
            </p>
            <p className="truncate text-[11px] text-body">{user.email}</p>
          </div>
          <button
            onClick={logout}
            title="Keluar"
            className="text-body hover:text-ink"
          >
            <IconChevronsUpDown className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-hairline bg-surface px-8">
          <div className="min-w-0">
            <p className="text-xs text-body">{crumb}</p>
            <p className="truncate text-lg font-bold text-ink">{title}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden h-9 w-60 items-center gap-2 rounded-lg bg-surface-2 px-3 text-sm text-body md:flex">
              <IconSearch className="h-4 w-4" />
              Cari
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-body hover:text-ink">
              <IconBell className="h-4.5 w-4.5" />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
              {initials}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({
  item,
}: Readonly<{
  item: {
    to: string;
    label: string;
    icon: (p: { className?: string }) => React.ReactElement;
    exact: boolean;
    badge?: string;
  };
}>) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.exact }}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-body transition hover:bg-surface-2"
      activeProps={{ className: "bg-surface-2 font-semibold text-ink" }}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-on-accent">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
