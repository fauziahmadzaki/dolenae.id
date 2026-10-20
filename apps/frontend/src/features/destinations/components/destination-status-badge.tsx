import { cn } from "~/lib/cn";
import type { Destination } from "~/types/domain";
import { statusLabels } from "../schema";

const statusClass: Record<Destination["status"], string> = {
  published: "bg-success/10 text-success",
  draft: "bg-warning/10 text-warning",
  archived: "bg-surface-2 text-body",
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
