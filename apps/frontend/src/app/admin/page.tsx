import type { Metadata } from "next";
import { DashboardPage } from "~/features/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard — Dolenae.id",
  description: "Ringkasan platform Dolenae.id.",
};

export default function AdminDashboardPage() {
  return <DashboardPage />;
}
