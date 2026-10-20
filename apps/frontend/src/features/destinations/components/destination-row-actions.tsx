import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { Destination } from "~/types/domain";

/** Aksi baris/kartu destinasi: edit dan hapus. */
export function DestinationRowActions({
  destination,
  onDelete,
}: {
  destination: Destination;
  onDelete: (destination: Destination) => void;
}) {
  return (
    <div className="flex gap-1">
      <Link
        href={`/admin/destinasi/${destination.id}/edit`}
        aria-label={`Edit ${destination.name}`}
        className="rounded-md p-2 text-body hover:bg-surface-2 hover:text-ink"
      >
        <Pencil aria-hidden className="h-4 w-4" />
      </Link>
      <button
        type="button"
        aria-label={`Hapus ${destination.name}`}
        onClick={() => onDelete(destination)}
        className="rounded-md p-2 text-body hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
