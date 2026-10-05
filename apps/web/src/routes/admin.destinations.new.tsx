import { createFileRoute } from "@tanstack/react-router";
import { DestinationFormScreen } from "~/components/admin/destination-form";

export const Route = createFileRoute("/admin/destinations/new")({
  component: NewDestinationPage,
});

function NewDestinationPage() {
  return <DestinationFormScreen id="new" />;
}
