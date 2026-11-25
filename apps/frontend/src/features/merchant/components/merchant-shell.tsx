"use client";

import type { ReactNode } from "react";
import {
  Building2,
  Globe,
  LayoutDashboard,
  Package,
  UserCircle,
} from "lucide-react";
import { AdminShell } from "~/features/admin/components/admin-shell";
import type { NavItem } from "~/features/admin/components/sidebar";
import type { TopbarMetaSource } from "~/features/admin/components/topbar";

const MERCHANT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/merchant", icon: LayoutDashboard, exact: true },
  { label: "Fasilitas", href: "/merchant/fasilitas", icon: Building2 },
  { label: "Produk", href: "/merchant/produk", icon: Package },
  { label: "Profil", href: "/merchant/profil", icon: UserCircle },
];

const MERCHANT_SYSTEM: NavItem[] = [
  { label: "Situs utama", href: "/", icon: Globe, exact: true },
];

const MERCHANT_META: TopbarMetaSource = (pathname) => {
  if (pathname === "/merchant") {
    return { breadcrumb: "Merchant / Dashboard", title: "Dashboard merchant" };
  }
  if (pathname === "/merchant/onboarding") {
    return {
      breadcrumb: "Merchant / Onboarding",
      title: "Mulai sebagai merchant",
    };
  }
  if (pathname === "/merchant/profil") {
    return { breadcrumb: "Merchant / Profil", title: "Profil merchant" };
  }
  if (pathname === "/merchant/fasilitas") {
    return { breadcrumb: "Merchant / Fasilitas", title: "Fasilitas saya" };
  }
  if (pathname === "/merchant/fasilitas/baru") {
    return {
      breadcrumb: "Merchant / Fasilitas / Baru",
      title: "Daftarkan fasilitas",
    };
  }
  if (pathname === "/merchant/produk") {
    return { breadcrumb: "Merchant / Produk", title: "Semua produk" };
  }
  if (/^\/merchant\/fasilitas\/[^/]+\/edit$/.test(pathname)) {
    return { breadcrumb: "Merchant / Fasilitas / Edit", title: "Edit fasilitas" };
  }
  if (/^\/merchant\/fasilitas\/[^/]+\/produk$/.test(pathname)) {
    return { breadcrumb: "Merchant / Fasilitas / Produk", title: "Produk fasilitas" };
  }
  return undefined;
};

/**
 * Merchant dashboard shell — same visual layout as the admin shell
 * (sidebar + topbar + drawer), with merchant-specific navigation.
 */
export function MerchantShell({ children }: { children: ReactNode }) {
  return (
    <AdminShell
      allowedRole="merchant"
      roleLabel="Merchant"
      mainNav={MERCHANT_NAV}
      systemNav={MERCHANT_SYSTEM}
      meta={MERCHANT_META}
      searchPlaceholder="Cari fasilitas, produk"
    >
      {children}
    </AdminShell>
  );
}
