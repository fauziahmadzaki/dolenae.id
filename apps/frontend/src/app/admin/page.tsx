import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Dolenae.id",
  description: "Ringkasan platform Dolenae.id.",
};

/**
 * SCRUM-9 — dashboard shell is live (sidebar + topbar + layout).
 * The Overview content (KPI cards, activity chart, verification queue)
 * is sliced in a later ticket; this page renders the empty state.
 */
export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border-2 border-dashed border-hairline bg-surface/60 p-10 text-center">
      <p className="text-sm font-semibold text-ink">Halaman dashboard</p>
      <p className="mt-1 max-w-sm text-sm text-body">
        Konten Overview — KPI, grafik aktivitas, dan antrean verifikasi —
        menyusul di sprint berikutnya.
      </p>
    </div>
  );
}