import type { Metadata } from "next";
import { MerchantLandingPage } from "~/features/merchant/pages/merchant-landing-page";

export const metadata: Metadata = {
  title: "Jadi Mitra Merchant — Dolenae.id",
  description:
    "Daftarkan penginapan, transportasi lokal, atau warung Anda di sekitar destinasi alam Dolenae.id.",
};

export default function MitraPage() {
  return <MerchantLandingPage />;
}
