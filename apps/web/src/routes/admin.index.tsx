import { createFileRoute, Link } from "@tanstack/react-router";
import {
  IconTrendUp,
  IconAlertTriangle,
  IconMonitor,
  IconShield,
} from "~/components/icons";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const KPIS = [
  { label: "Total destinasi", value: "18", delta: "1 baru bulan ini", trend: "up" as const },
  { label: "Merchant", value: "42", delta: "2 baru bulan ini", trend: "up" as const },
  { label: "Menunggu verifikasi", value: "7", delta: "3 baru hari ini", trend: "clock" as const },
  { label: "Data dilaporkan", value: "3", delta: "Perlu tindak lanjut", trend: "warn" as const },
];

const CHART = [
  { label: "Ming 1", value: 64 },
  { label: "Ming 2", value: 92 },
  { label: "Ming 3", value: 48 },
  { label: "Ming 4", value: 120, accent: true },
  { label: "Ming 5", value: 80 },
  { label: "Ming 6", value: 104 },
];

const QUEUE = [
  { name: "Warung Edelweiss", meta: "Makanan · 2 jam lalu" },
  { name: "Homestay Sikunir View", meta: "Penginapan · 5 jam lalu" },
  { name: "Open Trip Prau", meta: "Transport · 1 hari lalu" },
  { name: "Basecamp Kopi Prau", meta: "Makanan · 2 hari lalu" },
];

const ACTIVITY = [
  { time: "10:24", actor: "Admin Dolenae", initials: "AD", action: "Menyetujui layanan", target: "Bromo Jeep Tour", status: "Terverifikasi", tone: "success" },
  { time: "09:58", actor: "Budi", initials: "B", action: "Mengajukan layanan", target: "Warung Edelweiss", status: "Menunggu", tone: "warning" },
  { time: "09:12", actor: "Admin Dolenae", initials: "AD", action: "Memperbarui destinasi", target: "Gunung Prau", status: "Selesai", tone: "success" },
  { time: "08:40", actor: "Sistem", initials: "SY", action: "Deteksi data kosong", target: "Bukit Sikunir", status: "Dilaporkan", tone: "danger" },
] as const;

const TONE: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

function AdminDashboard() {
  const maxChart = Math.max(...CHART.map((c) => c.value));

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className="flex flex-col gap-2 rounded-xl border border-hairline bg-surface p-4"
          >
            <p className="text-sm text-body">{k.label}</p>
            <p className="text-2xl font-bold text-ink">{k.value}</p>
            <div className="flex items-center gap-1.5 text-xs text-body">
              {k.trend === "up" ? (
                <IconTrendUp className="h-3.5 w-3.5" />
              ) : (
                <IconAlertTriangle className="h-3.5 w-3.5" />
              )}
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Mid row */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        {/* Chart */}
        <div className="rounded-xl border border-hairline bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">
              Aktivitas verifikasi
            </h2>
            <div className="flex rounded-full bg-surface-2 p-0.5">
              <button className="rounded-full bg-surface px-4 py-1 text-xs font-semibold text-ink">
                30 hari
              </button>
              <button className="rounded-full px-4 py-1 text-xs text-body">
                90 hari
              </button>
            </div>
          </div>

          <div className="mt-5 flex h-[220px] items-end gap-3">
            {CHART.map((c) => (
              <div key={c.label} className="flex flex-1 flex-col items-stretch gap-1.5">
                <div className="flex h-[196px] items-end">
                  <div
                    className={
                      "w-full rounded-md " +
                      (c.accent ? "bg-accent" : "bg-primary")
                    }
                    style={{ height: `${Math.round((c.value / maxChart) * 100)}%` }}
                  />
                </div>
                <span className="text-center text-[11px] text-body">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Queue */}
        <div className="flex flex-col rounded-xl border border-hairline bg-surface p-5">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-ink">
              Antrean verifikasi
            </h2>
            <span className="text-sm text-body">7</span>
          </div>

          <ul className="mt-3 flex-1 divide-y divide-hairline">
            {QUEUE.map((q) => (
              <li key={q.name} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{q.name}</p>
                  <p className="truncate text-xs text-body">{q.meta}</p>
                </div>
                <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-body">
                  Menunggu
                </span>
              </li>
            ))}
          </ul>

          <Link
            to="/admin/users"
            className="mt-2 text-center text-sm font-medium text-primary hover:underline"
          >
            Lihat semua
          </Link>
        </div>
      </div>

      {/* Aktivitas */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
        <div className="grid grid-cols-[120px_220px_1fr_180px_160px] gap-4 bg-surface-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-body">
          <span>Waktu</span>
          <span>Aktor</span>
          <span>Aktivitas</span>
          <span>Target</span>
          <span>Status</span>
        </div>

        {ACTIVITY.map((row, i) => (
          <div key={row.time + row.target}>
            <div
              className={
                "grid grid-cols-[120px_220px_1fr_180px_160px] items-center gap-4 px-5 py-3.5 text-sm " +
                (i % 2 === 1 ? "bg-canvas" : "")
              }
            >
              <span className="text-body">{row.time}</span>
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
                  {row.initials}
                </span>
                <span className="text-ink">{row.actor}</span>
              </span>
              <span className="text-body">{row.action}</span>
              <span className="text-body">{row.target}</span>
              <span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink">
                  <span className={`h-1.5 w-1.5 rounded-full ${TONE[row.tone]}`} />
                  {row.status}
                </span>
              </span>
            </div>
            {i < ACTIVITY.length - 1 && <div className="h-px bg-hairline" />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 text-xs text-body">
        <span className="flex items-center gap-1.5">
          <IconMonitor className="h-3.5 w-3.5" /> Sumber: API + seed
        </span>
        <span className="flex items-center gap-1.5">
          <IconShield className="h-3.5 w-3.5" /> Sesi admin aktif
        </span>
      </div>
    </div>
  );
}
