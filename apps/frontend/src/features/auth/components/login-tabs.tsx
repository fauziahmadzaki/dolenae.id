import Link from "next/link";
import { cn } from "~/lib/cn";

/**
 * Masuk / Daftar segmented control (from the "Masuk" frame in Figma).
 * "Daftar" is not in scope for SCRUM-8 — it links to the future route.
 */
export function LoginTabs() {
  return (
    <div
      role="tablist"
      aria-label="Pilih metode akses"
      className="flex w-full items-center gap-1 rounded-full border border-hairline bg-canvas-subtle p-1"
    >
      <span
        role="tab"
        aria-selected="true"
        className="flex h-9 flex-1 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary"
      >
        Masuk
      </span>
      <Link
        href="/auth/register"
        role="tab"
        aria-selected="false"
        className="flex h-9 flex-1 items-center justify-center rounded-full text-sm text-body transition-colors hover:bg-surface hover:text-ink"
      >
        Daftar
      </Link>
    </div>
  );
}