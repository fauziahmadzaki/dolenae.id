import { createFileRoute } from "@tanstack/react-router";
import { DestinationFormScreen } from "~/components/admin/destination-form";

export const Route = createFileRoute("/admin/destinations/$id/edit")({
  component: EditDestinationPage,
});

function EditDestinationPage() {
  const { id } = Route.useParams();
  return <DestinationFormScreen id={id} />;
}
