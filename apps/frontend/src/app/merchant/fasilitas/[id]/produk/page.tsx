import { FacilityProductsPage } from "~/features/facilities/facility-products-page";

export default async function MerchantFacilityProductsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FacilityProductsPage facilityId={id} />;
}
