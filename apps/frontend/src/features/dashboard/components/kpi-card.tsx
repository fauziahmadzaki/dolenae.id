import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/cn";

interface KpiCardProps {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: string;
  isLoading?: boolean;
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  isLoading = false,
}: KpiCardProps) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-body">{label}</p>
        <span
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            tone,
          )}
        >
          <Icon aria-hidden className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-ink">
        {isLoading ? "—" : value.toLocaleString("id-ID")}
      </p>
      <p className="mt-1 text-xs text-body">{hint}</p>
    </div>
  );
}
