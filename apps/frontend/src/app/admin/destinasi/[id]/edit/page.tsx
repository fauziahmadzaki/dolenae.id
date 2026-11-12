import type { Metadata } from "next";
import { DestinationForm } from "~/features/destinations/destination-form";

export const metadata: Metadata = {
  title: "Edit Destinasi — Admin Dolenae.id",
  description: "Perbarui data destinasi melalui formulir lima langkah.",
};

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DestinationForm destinationId={id} />;
}
