import type { Metadata } from "next";
import { FacilityFormPage } from "~/features/facilities/components/facility-form-page";

export const metadata: Metadata = {
  title: "Edit Fasilitas — Merchant Dolenae.id",
  description: "Perbarui data fasilitas dan lokasi usaha Anda.",
};

export default async function EditMerchantFacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <FacilityFormPage facilityId={id} mode="merchant" basePath="/merchant" />
  );
}
