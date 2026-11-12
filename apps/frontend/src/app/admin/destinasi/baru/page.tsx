import type { Metadata } from "next";
import { DestinationForm } from "~/features/destinations/destination-form";

export const metadata: Metadata = {
  title: "Tambah Destinasi — Admin Dolenae.id",
  description: "Buat destinasi baru melalui formulir lima langkah.",
};

export default function NewDestinationPage() {
  return <DestinationForm />;
}
