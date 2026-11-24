import type { Metadata } from "next";

import { PublicShell } from "~/features/public/page-shell";
import { CatalogPage } from "~/features/public-destinations/catalog-page";

export const metadata: Metadata = {
  title: "Destinasi Alam | Dolenae.id",
  description:
    "Jelajahi destinasi gunung, bukit, dan wisata alam Indonesia. Cari berdasarkan tingkat kesulitan dan lihat info akses, fasilitas, serta musim terbaik.",
};

export default function DestinationsPage() {
  return (
    <PublicShell>
      <CatalogPage />
    </PublicShell>
  );
}
