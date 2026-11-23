import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/cn";

interface KpiCardProps {
  label: string;
  value: number;
  hint?: string;
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
    <div className="flex items-start gap-3 rounded-[20px] border border-hairline bg-surface p-4">
      <span
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
          tone,
        )}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-body">{label}</p>
        <p className="mt-1 font-sans text-xl leading-6 font-bold text-ink">
          {isLoading ? "—" : value.toLocaleString("id-ID")}
        </p>
        {hint && <p className="mt-1 text-xs text-body">{hint}</p>}
      </div>
    </div>
  );
}
