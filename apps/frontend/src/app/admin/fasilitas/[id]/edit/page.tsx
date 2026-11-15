import type { Metadata } from "next";
import { FacilityFormPage } from "~/features/facilities/components/facility-form-page";

export const metadata: Metadata = {
  title: "Edit Fasilitas — Admin Dolenae.id",
  description: "Perbarui data fasilitas merchant.",
};

export default async function EditAdminFacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <FacilityFormPage facilityId={id} mode="admin" basePath="/admin/fasilitas" />
  );
}
