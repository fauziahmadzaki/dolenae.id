import type { Metadata } from "next";
import { SettingsPage } from "~/features/settings/settings-page";

export const metadata: Metadata = {
  title: "Pengaturan — Admin Dolenae.id",
  description: "Kelola integrasi layanan Dolenae, termasuk API key Gemini.",
};

export default function AdminSettingsPage() {
  return <SettingsPage />;
}
