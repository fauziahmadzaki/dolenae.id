import type { Metadata } from "next";
import { AdminProfilePage } from "~/features/settings/admin-profile-page";

export const metadata: Metadata = {
  title: "Pengaturan — Admin Dolenae.id",
  description: "Kelola informasi profil akun admin Dolenae.",
};

export default function AdminSettingsPage() {
  return <AdminProfilePage />;
}
