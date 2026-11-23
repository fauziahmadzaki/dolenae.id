"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plug, UserRound } from "lucide-react";
import { cn } from "~/lib/cn";

const sections = [
  { label: "Profil", href: "/admin/pengaturan", icon: UserRound },
  { label: "Integrasi AI", href: "/admin/pengaturan/integrasi", icon: Plug },
];

export function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="grid items-start gap-5 md:grid-cols-[200px_minmax(0,1fr)]">
      <nav aria-label="Bagian pengaturan" className="flex flex-wrap gap-1 rounded-2xl border border-hairline bg-surface p-2 md:flex-col">
        {sections.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
            pathname === href ? "bg-primary text-on-primary" : "text-body hover:bg-canvas-subtle",
          )}>
            <Icon aria-hidden className="size-4" /> {label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
