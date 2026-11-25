import type { DataTableColumn } from "~/components/ui/data-table";
import { UserAvatar } from "~/features/admin/components/user-avatar";
import { formatUserDate } from "../format";
import { roleLabels, type ManagedUser } from "../schema";
import { userStatusLabels, userStatusOf } from "../status";
import { UserActions } from "./user-actions";
import { UserStatusBadge } from "./user-status-badge";

export interface MerchantSummary {
  serviceCount: number;
  categoriesLabel: string;
  locationLabel: string;
}

interface UserColumnOptions {
  currentUserId?: string;
  onDetail: (user: ManagedUser) => void;
  onEdit: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
}

interface MerchantColumnOptions extends UserColumnOptions {
  summaries: Map<string, MerchantSummary>;
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
          <UserAvatar name={user.name} className="bg-canvas-subtle text-primary" />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">
              {user.name}
            </span>
            <span className="block truncate text-xs text-body">
              {user.email}
            </span>
          </span>
        </button>
      ),
    },
    {
      id: "role",
      header: "Peran",
      cell: (user) => (
        <span className="rounded-full border border-hairline bg-canvas-subtle px-2.5 py-0.5 text-[11px] font-semibold text-ink">
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
      header: "Tanggal daftar",
      sortKey: "createdAt",
      className: "whitespace-nowrap text-body",
      cell: (user) => formatUserDate(user.createdAt),
    },
    {
      id: "lastLoginAt",
      header: "Terakhir aktif",
      className: "whitespace-nowrap text-body",
      cell: (user) =>
        user.lastLoginAt ? formatUserDate(user.lastLoginAt) : "Belum tercatat",
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

/** Column definitions for the admin merchants table (aligned with Figma #292:3951). */
export function merchantColumns({
  currentUserId,
  summaries,
  onDetail,
  onEdit,
  onDelete,
}: MerchantColumnOptions): DataTableColumn<ManagedUser>[] {
  return [
    {
      id: "name",
      header: "Merchant",
      sortKey: "name",
      cell: (user) => (
        <button
          type="button"
          onClick={() => onDetail(user)}
          className="flex items-center gap-3 text-left"
        >
          <UserAvatar name={user.name} className="bg-canvas-subtle text-primary" />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">
              {user.name}
            </span>
            <span className="block truncate text-xs text-body">
              {user.email}
            </span>
          </span>
        </button>
      ),
    },
    {
      id: "kind",
      header: "Jenis",
      cell: (user) => {
        const info = summaries.get(user.id);
        return (
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">
              {info?.categoriesLabel ?? "Belum ada layanan"}
            </p>
            {info && info.serviceCount > 0 && (
              <p className="text-xs text-body">{info.serviceCount} layanan</p>
            )}
          </div>
        );
      },
    },
    {
      id: "location",
      header: "Lokasi",
      className: "text-body",
      cell: (user) => summaries.get(user.id)?.locationLabel ?? "Belum diisi",
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

export { userStatusLabels };
