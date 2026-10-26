import type { Metadata } from "next";
import { RouteEditorPage } from "~/features/routes/route-editor-page";

export const metadata: Metadata = {
  title: "Kelola Peta Rute — Admin Dolenae.id",
  description: "Editor titik, ruas, dan jalur destinasi.",
};

export default async function DestinationRouteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RouteEditorPage destinationId={id} />;
}
