import Link from "next/link";
import { cn } from "~/lib/cn";

interface LoginTabsProps {
  active?: "login" | "register";
}

const activeClass =
  "flex h-9 flex-1 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary";
const inactiveClass =
  "flex h-9 flex-1 items-center justify-center rounded-full text-sm text-body transition-colors hover:bg-surface hover:text-ink";

/** Masuk / Daftar segmented control shared by the login and register pages. */
export function LoginTabs({ active = "login" }: LoginTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Pilih metode akses"
      className="flex w-full items-center gap-1 rounded-full border border-hairline bg-canvas-subtle p-1"
    >
      {active === "login" ? (
        <span role="tab" aria-selected="true" className={activeClass}>
          Masuk
        </span>
      ) : (
        <Link
          href="/auth/login"
          role="tab"
          aria-selected="false"
          className={cn(inactiveClass)}
        >
          Masuk
        </Link>
      )}

      {active === "register" ? (
        <span role="tab" aria-selected="true" className={activeClass}>
          Daftar
        </span>
      ) : (
        <Link
          href="/auth/register"
          role="tab"
          aria-selected="false"
          className={cn(inactiveClass)}
        >
          Daftar
        </Link>
      )}
    </div>
  );
}
