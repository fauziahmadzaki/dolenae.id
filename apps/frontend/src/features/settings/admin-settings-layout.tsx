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
    <div className="grid items-start gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
      <nav
        aria-label="Bagian pengaturan"
        className="flex flex-wrap gap-1 rounded-2xl border border-hairline bg-surface p-2.5 md:flex-col"
      >
        {sections.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary font-semibold text-on-primary"
                  : "font-medium text-body hover:bg-canvas-subtle hover:text-ink",
              )}
            >
              <Icon aria-hidden className="size-4 shrink-0" /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
