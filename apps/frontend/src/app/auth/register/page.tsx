import type { Metadata } from "next";
import RegisterPage from "~/features/auth/pages/register-page";

export const metadata: Metadata = {
  title: "Daftar Merchant — Dolenae.id",
  description:
    "Daftarkan usaha penginapan, transportasi, atau warung Anda di sekitar destinasi Dolenae.id.",
};

export default function Page() {
  return <RegisterPage />;
}
