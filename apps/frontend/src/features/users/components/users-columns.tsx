import { Mountain } from "lucide-react";
import type { DataTableColumn } from "~/components/ui/data-table";
import { formatUserDate } from "../format";
import { roleLabels, type ManagedUser } from "../schema";
import { userStatusOf } from "../status";
import { UserActions } from "./user-actions";
import { UserStatusBadge } from "./user-status-badge";

interface UserColumnOptions {
  currentUserId?: string;
  onDetail: (user: ManagedUser) => void;
  onEdit: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
}

/** Column definitions for the admin users table. */
export function userColumns({
  currentUserId,
  onDetail,
  onEdit,
  onDelete,
}: UserColumnOptions): DataTableColumn<ManagedUser>[] {
  return [
    {
      id: "name",
      header: "Pengguna",
      sortKey: "name",
      cell: (user) => (
        <button
          type="button"
          onClick={() => onDetail(user)}
          className="flex items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-canvas-subtle text-primary">
            <Mountain aria-hidden className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">
              {user.name}
            </span>
            <span className="block truncate text-xs text-body">
              {user.id.slice(0, 8)}
            </span>
          </span>
        </button>
      ),
    },
    {
      id: "email",
      header: "Email",
      sortKey: "email",
      className: "text-body",
      cell: (user) => user.email,
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => (
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink">
          {roleLabels[user.role]}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => <UserStatusBadge status={userStatusOf(user)} />,
    },
    {
      id: "createdAt",
      header: "Terdaftar",
      sortKey: "createdAt",
      className: "whitespace-nowrap text-body",
      cell: (user) => formatUserDate(user.createdAt),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: (user) => (
        <UserActions
          user={user}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
