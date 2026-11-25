import type { Metadata } from "next";
import { FacilityFormPage } from "~/features/facilities/components/facility-form-page";

export const metadata: Metadata = {
  title: "Daftarkan Fasilitas — Merchant Dolenae.id",
  description: "Daftarkan penginapan, transportasi, atau warung di sekitar destinasi.",
};

export default function NewMerchantFacilityPage() {
  return <FacilityFormPage mode="merchant" basePath="/merchant" />;
}
