import { cn } from "~/lib/cn";
import { userStatusLabels, type UserStatus } from "../status";

const statusClass: Record<UserStatus, string> = {
  active: "border border-hairline bg-canvas-subtle text-success",
  unverified: "border border-hairline bg-canvas-subtle text-warning",
  inactive: "border border-hairline bg-canvas-subtle text-body",
};

export function UserStatusBadge({
  status,
  className,
}: {
  status: UserStatus;
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
      {userStatusLabels[status]}
    </span>
  );
}
