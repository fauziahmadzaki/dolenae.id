import type { Metadata } from "next";
import { RoutePreviewPage } from "~/features/routes/route-preview-page";

export const metadata: Metadata = {
  title: "Rute & Elevasi — Admin Dolenae.id",
  description: "Pratinjau jaringan jalur dan profil elevasi destinasi.",
};

export default async function DestinationRoutesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoutePreviewPage destinationId={id} />;
}
