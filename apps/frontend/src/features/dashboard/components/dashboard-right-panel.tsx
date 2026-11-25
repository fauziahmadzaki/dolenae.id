"use client";

import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Store,
} from "lucide-react";
import { UserAvatar } from "~/features/admin/components/user-avatar";
import type { Facility } from "~/features/facilities/types";
import { roleLabels, type ManagedUser } from "~/features/users/schema";
import { cn } from "~/lib/cn";
import type { DashboardStats } from "../schema";

function jakartaGreeting(): string {
  const hourText = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  const hour = Number(hourText);
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

interface DashboardRightPanelProps {
  adminName: string;
  stats: DashboardStats | undefined;
  facilities: Facility[];
  users: ManagedUser[];
  isFetching: boolean;
  onRefresh: () => void;
}

export function DashboardRightPanel({
  adminName,
  stats,
  facilities,
  users,
  isFetching,
  onRefresh,
}: DashboardRightPanelProps) {
  const totals = stats?.totals;
  const published = totals?.destinations.published ?? 0;
  const all = totals?.destinations.total ?? 0;
  const percent = all ? Math.round((published * 100) / all) : 0;
  const pending = totals?.facilities.pending ?? 0;
  const draftDestinations = totals?.destinations.draft ?? 0;
  const merchantsTotal = totals?.merchants.total ?? 0;
  const merchantsNew = totals?.merchants.newThisMonth ?? 0;

  const firstName = adminName.trim().split(/\s+/)[0] || "Admin";
  const barPoints = (stats?.userGrowth ?? []).slice(-6);
  const maxNew = Math.max(1, ...barPoints.map((point) => point.newUsers));

  const facilityCountByOwner = new Map<string, number>();
  for (const facility of facilities) {
    if (!facility.ownerId) continue;
    facilityCountByOwner.set(
      facility.ownerId,
      (facilityCountByOwner.get(facility.ownerId) ?? 0) + 1,
    );
  }

  const merchants = users.filter((u) => u.role === "merchant");
  const contributorPool = merchants.length ? merchants : users;
  const topContributors = [...contributorPool]
    .sort((a, b) => (facilityCountByOwner.get(b.id) ?? 0) - (facilityCountByOwner.get(a.id) ?? 0))
    .slice(0, 3);

  const actionTotal = pending + draftDestinations;

  return (
    <div className="space-y-5">
      {/* StatCard matching Figma #292:4914 */}
      <section className="rounded-[20px] border border-hairline bg-surface p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-ink">Statistik</h2>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="Opsi statistik"
                className="inline-flex size-7 items-center justify-center rounded-lg text-body transition-colors hover:bg-canvas-subtle hover:text-ink"
              >
                <MoreHorizontal aria-hidden className="size-4" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={6}
                className="z-50 w-44 rounded-xl border border-hairline bg-surface p-1 shadow-md focus:outline-none"
              >
                <button
                  type="button"
                  disabled={isFetching}
                  onClick={onRefresh}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-canvas-subtle disabled:opacity-50"
                >
                  <RefreshCw
                    aria-hidden
                    className={cn("size-3.5", isFetching && "animate-spin")}
                  />
                  Muat ulang data
                </button>
                <a
                  href="#analitik-lanjutan"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas-subtle"
                >
                  Lihat analitik
                </a>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        <div
          className="mx-auto my-4 grid size-[104px] place-items-center rounded-full p-1.5"
          style={{
            background: `conic-gradient(var(--color-primary) ${percent}%, var(--color-canvas-subtle) 0)`,
          }}
        >
          <span className="grid size-full place-items-center rounded-full bg-surface font-display text-lg font-bold text-ink">
            {stats ? `${percent}%` : "—"}
          </span>
        </div>

        <p className="text-center font-display text-base font-bold text-ink">
          {jakartaGreeting()}, {firstName}
        </p>
        <p className="mt-0.5 text-center text-xs text-body">
          {stats
            ? `${percent}% destinasi sudah terbit (${published} dari ${all})`
            : "Statistik belum tersedia"}
        </p>

        {barPoints.length > 0 && (
          <figure className="mt-5">
            <div className="flex h-24 items-end justify-between gap-2 px-1">
              {barPoints.map((point, index) => {
                const isLatest = index === barPoints.length - 1;
                const heightPx = Math.max(
                  14,
                  Math.round((point.newUsers / maxNew) * 80),
                );
                return (
                  <div
                    key={point.month}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <div
                      title={`${point.label}: ${point.newUsers} pendaftar baru`}
                      className={cn(
                        "w-[22px] rounded-[6px] transition-all",
                        isLatest ? "bg-primary" : "bg-canvas-subtle",
                      )}
                      style={{ height: `${heightPx}px` }}
                    />
                    <span className="text-[11px] font-medium text-body">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <figcaption className="mt-2 text-center text-[11px] text-body">
              Pendaftar baru 6 bulan terakhir
            </figcaption>
          </figure>
        )}
      </section>

      {/* KontribCard matching Figma #292:4948 */}
      <section className="rounded-[20px] border border-hairline bg-surface p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-ink">
            {merchants.length ? "Merchant Teratas" : "Kontributor Teratas"}
          </h2>
          <Link
            href="/admin/merchant"
            aria-label="Kelola merchant"
            className="grid size-7 place-items-center rounded-full bg-canvas-subtle text-ink transition-colors hover:bg-surface-2"
          >
            <Plus aria-hidden className="size-4" />
          </Link>
        </div>

        {topContributors.length === 0 ? (
          <p className="mt-4 text-xs text-body">
            Belum ada akun merchant atau kontributor terdaftar.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {topContributors.map((person) => {
              const serviceCount = facilityCountByOwner.get(person.id) ?? 0;
              return (
                <li
                  key={person.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <UserAvatar
                      name={person.name}
                      className="size-8 bg-canvas-subtle text-primary"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {person.name}
                      </p>
                      <p className="truncate text-xs text-body">
                        {serviceCount > 0
                          ? `${serviceCount} layanan`
                          : roleLabels[person.role]}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={person.role === "merchant" ? "/admin/merchant" : "/admin/users"}
                    className="shrink-0 rounded-full border border-hairline px-3 py-1 text-xs font-semibold text-ink transition-colors hover:bg-canvas-subtle"
                  >
                    Detail
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href="/admin/merchant"
          className="mt-4 block w-full rounded-2xl bg-canvas-subtle py-2.5 text-center text-xs font-semibold text-ink transition-colors hover:bg-surface-2"
        >
          Lihat Semua
        </Link>
      </section>

      {/* TodoCard matching Figma #292:4981 */}
      <section className="rounded-[20px] border border-hairline bg-surface p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-ink">
            Perlu Tindakan
          </h2>
          {actionTotal > 0 && (
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
              {actionTotal} baru
            </span>
          )}
        </div>

        <ul className="mt-4 space-y-3">
          <li>
            <Link
              href="/admin/verifikasi"
              className="group flex items-start gap-3 rounded-xl p-1 -m-1 transition-colors hover:bg-canvas-subtle"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas-subtle text-primary">
                <BadgeCheck aria-hidden className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink group-hover:underline">
                  {pending} fasilitas menunggu verifikasi
                </span>
                <span className="block text-xs text-body">
                  {pending > 0 ? "Perlu tinjauan admin" : "Semua antrean sudah ditinjau"}
                </span>
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/admin/destinasi"
              className="group flex items-start gap-3 rounded-xl p-1 -m-1 transition-colors hover:bg-canvas-subtle"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas-subtle text-warning">
                <AlertTriangle aria-hidden className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink group-hover:underline">
                  {draftDestinations} destinasi berstatus draf
                </span>
                <span className="block text-xs text-body">
                  {draftDestinations > 0
                    ? "Perlu dilengkapi & terbitkan"
                    : "Semua destinasi sudah dipublikasikan"}
                </span>
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/admin/merchant"
              className="group flex items-start gap-3 rounded-xl p-1 -m-1 transition-colors hover:bg-canvas-subtle"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas-subtle text-primary">
                <Store aria-hidden className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink group-hover:underline">
                  {merchantsTotal} merchant terdaftar
                </span>
                <span className="block text-xs text-body">
                  {merchantsNew > 0
                    ? `+${merchantsNew} baru bulan ini`
                    : "Kelola akun & layanan merchant"}
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
