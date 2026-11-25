import type { Metadata } from "next";
import { FacilityFormPage } from "~/features/facilities/components/facility-form-page";

export const metadata: Metadata = {
  title: "Tambah Fasilitas — Admin Dolenae.id",
  description: "Daftarkan fasilitas baru di sekitar destinasi.",
};

export default function NewAdminFacilityPage() {
  return <FacilityFormPage mode="admin" basePath="/admin/fasilitas" />;
}
