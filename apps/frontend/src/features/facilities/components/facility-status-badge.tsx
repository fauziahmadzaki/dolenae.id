import { cn } from "~/lib/cn";
import type { FacilityStatus } from "../types";
import { statusLabels } from "../types";

const styles: Record<FacilityStatus, string> = {
  draft: "bg-canvas-subtle text-body",
  pending: "bg-warning/15 text-warning",
  published: "bg-success/15 text-success",
  rejected: "bg-danger/10 text-danger",
  archived: "bg-ink/10 text-body",
};

export function FacilityStatusBadge({
  status,
  className,
}: {
  status: FacilityStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        styles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
