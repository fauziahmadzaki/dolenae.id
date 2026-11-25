import { cn } from "~/lib/cn";
import type { FacilityStatus } from "../types";
import { statusLabels } from "../types";

const styles: Record<FacilityStatus, string> = {
  draft: "border border-hairline bg-canvas-subtle text-body",
  pending: "border border-hairline bg-canvas-subtle text-warning",
  published: "border border-hairline bg-canvas-subtle text-success",
  rejected: "border border-hairline bg-canvas-subtle text-danger",
  archived: "border border-hairline bg-canvas-subtle text-body",
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
