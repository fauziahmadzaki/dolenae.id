import { Mountain } from "lucide-react";
import { formatUserDate } from "../format";
import { roleLabels, type ManagedUser } from "../schema";
import { userStatusOf } from "../status";
import { UserActions } from "./user-actions";
import { UserStatusBadge } from "./user-status-badge";

interface UsersTableProps {
  users: ManagedUser[];
  currentUserId?: string;
  onDetail: (user: ManagedUser) => void;
  onEdit: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
}

const HEADINGS = ["Pengguna", "Email", "Role", "Status", "Terdaftar", "Aksi"];

export function UsersTable({
  users,
  currentUserId,
  onDetail,
  onEdit,
  onDelete,
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="h-12 bg-surface-2 text-[11px] uppercase tracking-wide text-body">
          <tr>
            {HEADINGS.map((heading) => (
              <th key={heading} scope="col" className="px-5 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="h-16 border-t border-hairline align-middle"
            >
              <td className="px-5">
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
              </td>
              <td className="px-5 text-body">{user.email}</td>
              <td className="px-5">
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink">
                  {roleLabels[user.role]}
                </span>
              </td>
              <td className="px-5">
                <UserStatusBadge status={userStatusOf(user)} />
              </td>
              <td className="whitespace-nowrap px-5 text-body">
                {formatUserDate(user.createdAt)}
              </td>
              <td className="px-5">
                <UserActions
                  user={user}
                  currentUserId={currentUserId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
