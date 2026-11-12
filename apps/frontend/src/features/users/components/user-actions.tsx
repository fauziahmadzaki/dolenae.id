import { Pencil, Trash2 } from "lucide-react";
import type { ManagedUser } from "../schema";

interface UserActionsProps {
  user: ManagedUser;
  currentUserId?: string;
  onEdit: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
}

/** Aksi baris/kartu pengguna: edit dan hapus. */
export function UserActions({
  user,
  currentUserId,
  onEdit,
  onDelete,
}: UserActionsProps) {
  const isSelf = user.id === currentUserId;

  return (
    <div className="flex gap-1">
      <button
        type="button"
        aria-label={`Edit ${user.name}`}
        onClick={() => onEdit(user)}
        className="rounded-md p-2 text-body hover:bg-surface-2 hover:text-ink"
      >
        <Pencil aria-hidden className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={`Hapus ${user.name}`}
        title={
          isSelf
            ? "Admin tidak dapat menghapus akun sendiri"
            : "Hapus pengguna"
        }
        disabled={isSelf}
        onClick={() => onDelete(user)}
        className="rounded-md p-2 text-body hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-body"
      >
        <Trash2 aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
