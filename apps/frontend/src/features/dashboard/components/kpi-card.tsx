import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { ArrowRight, MoreVertical, type LucideIcon } from "lucide-react";
import { cn } from "~/lib/cn";

interface KpiCardProps {
  label: string;
  value: number;
  hint?: string;
  href?: string;
  actionLabel?: string;
  icon: LucideIcon;
  tone: string;
  isLoading?: boolean;
}

export function KpiCard({
  label,
  value,
  hint,
  href,
  actionLabel = "Lihat semua",
  icon: Icon,
  tone,
  isLoading = false,
}: KpiCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-[20px] border border-hairline bg-surface p-4">
      <span
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
          tone,
        )}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-body">{label}</p>
        <p className="mt-1 font-sans text-xl leading-6 font-bold text-ink">
          {isLoading ? "—" : value.toLocaleString("id-ID")}
        </p>
        {hint && <p className="mt-1 text-xs text-body">{hint}</p>}
      </div>
      {href ? (
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label={`Opsi ${label}`}
              className="-mr-1 -mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-body/70 transition-colors hover:bg-canvas-subtle hover:text-ink"
            >
              <MoreVertical aria-hidden className="size-4" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={6}
              className="z-50 w-44 rounded-xl border border-hairline bg-surface p-1 shadow-md focus:outline-none"
            >
              <Link
                href={href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas-subtle"
              >
                {actionLabel}
                <ArrowRight aria-hidden className="size-3.5 text-primary" />
              </Link>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      ) : (
        <MoreVertical aria-hidden className="size-4 shrink-0 text-body/70" />
      )}
    </div>
  );
}
