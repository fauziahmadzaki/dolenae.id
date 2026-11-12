import Link from "next/link";
import { Mountain } from "lucide-react";
import type { DataTableColumn } from "~/components/ui/data-table";
import { cn } from "~/lib/cn";
import type { Destination } from "~/types/domain";
import { difficultyLabels } from "../schema";
import { DestinationRowActions } from "./destination-row-actions";
import { DestinationStatusBadge } from "./destination-status-badge";

interface DestinationColumnOptions {
  categoryName: (id: string) => string;
  onDelete: (destination: Destination) => void;
}

/** Column definitions for the admin destinations table. */
export function destinationColumns({
  categoryName,
  onDelete,
}: DestinationColumnOptions): DataTableColumn<Destination>[] {
  return [
    {
      id: "name",
      header: "Destinasi",
      sortKey: "name",
      cell: (destination) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-canvas-subtle text-primary">
            {destination.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={destination.images[0]}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Mountain aria-hidden className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0">
            <Link
              href={`/admin/destinasi/${destination.id}/edit`}
              className="block truncate font-semibold text-ink hover:underline"
            >
              {destination.name}
            </Link>
            <span className="block truncate text-xs text-body">
              /{destination.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "province",
      header: "Provinsi",
      className: "text-body",
      cell: (destination) => destination.location.province ?? "—",
    },
    {
      id: "categories",
      header: "Kategori",
      cell: (destination) => (
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {destination.categoryIds.length === 0 ? (
            <span className="text-xs text-body">—</span>
          ) : (
            destination.categoryIds.slice(0, 3).map((id) => (
              <span
                key={id}
                className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink"
              >
                {categoryName(id)}
              </span>
            ))
          )}
        </div>
      ),
    },
    {
      id: "difficulty",
      header: "Kesulitan",
      cell: (destination) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink">
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              destination.difficulty === "sulit"
                ? "bg-danger"
                : destination.difficulty === "menengah"
                  ? "bg-warning"
                  : "bg-success",
            )}
          />
          {difficultyLabels[destination.difficulty]}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (destination) => (
        <DestinationStatusBadge status={destination.status} />
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: (destination) => (
        <DestinationRowActions
          destination={destination}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
