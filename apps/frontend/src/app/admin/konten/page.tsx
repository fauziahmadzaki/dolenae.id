import type { Metadata } from "next";
import { AdminContentPage } from "~/features/content/admin-content-page";

export const metadata: Metadata = {
  title: "Konten — Admin Dolenae.id",
  description: "Kelola artikel, panduan, tips, dan galeri foto Dolenae.id.",
};

export default function AdminContentRoute() {
  return <AdminContentPage />;
}
