import { cn } from "~/lib/cn";
import { userStatusLabels, type UserStatus } from "../status";

const statusClass: Record<UserStatus, string> = {
  active: "bg-success/10 text-success",
  unverified: "bg-warning/10 text-warning",
  inactive: "bg-surface-2 text-body",
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
