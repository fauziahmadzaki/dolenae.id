import { cn } from "~/lib/cn";
import type { Destination } from "~/types/domain";
import { statusLabels } from "../schema";

const statusClass: Record<Destination["status"], string> = {
  published: "border border-hairline bg-canvas-subtle text-success",
  draft: "border border-hairline bg-canvas-subtle text-warning",
  archived: "border border-hairline bg-canvas-subtle text-body",
};

export function DestinationStatusBadge({
  status,
  className,
}: {
  status: Destination["status"];
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
        statusClass[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
