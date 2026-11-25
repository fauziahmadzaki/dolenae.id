import Link from "next/link";
import { ArrowRight, Mountain, Store, UserRound } from "lucide-react";
import { UserAvatar } from "~/features/admin/components/user-avatar";
import type { Facility } from "~/features/facilities/types";
import { roleLabels, type ManagedUser } from "~/features/users/schema";
import { cn } from "~/lib/cn";
import { formatActivityTimeId } from "~/lib/format-date";
import type { Destination } from "~/types/domain";

export interface ActivityRowItem {
  id: string;
  actor: string;
  kind: "facility" | "destination" | "user";
  activity: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "neutral";
  timestamp: string;
  href: string;
}

const TONE_CLASS: Record<ActivityRowItem["statusTone"], string> = {
  success: "bg-success/12 text-success",
  warning: "bg-accent/12 text-accent",
  danger: "bg-danger/12 text-danger",
  neutral: "bg-canvas-subtle text-body",
};

function facilityStatusUi(status: Facility["status"]): {
  label: string;
  tone: ActivityRowItem["statusTone"];
} {
  switch (status) {
    case "published":
      return { label: "Disetujui", tone: "success" };
    case "pending":
      return { label: "Menunggu", tone: "warning" };
    case "rejected":
      return { label: "Ditolak", tone: "danger" };
    default:
      return { label: "Draf", tone: "neutral" };
  }
}

export function buildRecentActivities({
  destinations,
  facilities,
  users,
}: {
  destinations: Destination[];
  facilities: Facility[];
  users: ManagedUser[];
}): ActivityRowItem[] {
  const userMap = new Map(users.map((u) => [u.id, u.name]));
  const items: ActivityRowItem[] = [];

  for (const fac of facilities.slice(0, 6)) {
    const status = facilityStatusUi(fac.status);
    items.push({
      id: `fac-${fac.id}`,
      actor: (fac.ownerId && userMap.get(fac.ownerId)) || fac.destinationName,
      kind: "facility",
      activity:
        fac.status === "pending"
          ? `Mengajukan layanan ${fac.name}`
          : `Memperbarui layanan ${fac.name}`,
      statusLabel: status.label,
      statusTone: status.tone,
      timestamp: fac.updatedAt || fac.createdAt,
      href: fac.status === "pending" ? "/admin/verifikasi" : `/admin/fasilitas/${fac.id}/edit`,
    });
  }

  for (const dest of destinations.slice(0, 6)) {
    items.push({
      id: `dest-${dest.id}`,
      actor: "Katalog",
      kind: "destination",
      activity: `Memperbarui destinasi ${dest.name}`,
      statusLabel:
        dest.status === "published"
          ? "Terbit"
          : dest.status === "draft"
            ? "Draf"
            : "Arsip",
      statusTone:
        dest.status === "published"
          ? "success"
          : dest.status === "draft"
            ? "warning"
            : "neutral",
      timestamp: dest.updatedAt || dest.createdAt,
      href: `/admin/destinasi/${dest.id}/edit`,
    });
  }

  for (const user of users.slice(0, 4)) {
    items.push({
      id: `usr-${user.id}`,
      actor: user.name,
      kind: "user",
      activity: `Akun ${roleLabels[user.role]} terdaftar`,
      statusLabel: user.emailVerifiedAt ? "Aktif" : "Baru",
      statusTone: user.emailVerifiedAt ? "success" : "neutral",
      timestamp: user.createdAt,
      href: "/admin/users",
    });
  }

  return items
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 4);
}

function ActorAvatar({ kind, actor }: { kind: ActivityRowItem["kind"]; actor: string }) {
  if (kind === "user" || kind === "facility") {
    return (
      <UserAvatar
        name={actor}
        className="size-7 bg-canvas-subtle text-primary"
        textClassName="text-[11px]"
      />
    );
  }

  const Icon = kind === "destination" ? Mountain : kind === "facility" ? Store : UserRound;
  return (
    <span
      aria-hidden
      className="grid size-7 shrink-0 place-items-center rounded-full bg-canvas-subtle text-primary"
    >
      <Icon className="size-3.5" />
    </span>
  );
}

export function RecentActivityTable({
  items,
  isLoading,
}: {
  items: ActivityRowItem[];
  isLoading: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-ink">
          Aktivitas Terbaru
        </h2>
        <Link
          href="/admin/verifikasi"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
        >
          Lihat semua <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-hairline bg-surface">
        {isLoading ? (
          <p role="status" className="px-5 py-6 text-sm text-body">
            Memuat aktivitas…
          </p>
        ) : items.length === 0 ? (
          <p className="px-5 py-6 text-sm text-body">
            Belum ada aktivitas terbaru pada platform.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead className="bg-canvas-subtle/60 text-[11px] font-semibold uppercase tracking-wide text-body">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Aktor
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Aktivitas
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Waktu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-canvas/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <ActorAvatar kind={item.kind} actor={item.actor} />
                        <span className="max-w-[130px] truncate font-medium text-ink">
                          {item.actor}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={item.href}
                        className="line-clamp-1 text-body hover:text-ink hover:underline"
                      >
                        {item.activity}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          TONE_CLASS[item.statusTone],
                        )}
                      >
                        {item.statusLabel}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right text-xs text-body tabular-nums">
                      {formatActivityTimeId(item.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
