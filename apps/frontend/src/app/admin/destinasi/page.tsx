import type { Metadata } from "next";
import DestinationsPage from "~/features/destinations/destinations-page";

export const metadata: Metadata = {
  title: "Destinasi & Kategori — Admin Dolenae.id",
  description: "Kelola katalog destinasi alam dan kategori klasifikasinya.",
};

export default function AdminDestinationsPage() {
  return <DestinationsPage />;
}
