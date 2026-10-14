import type { Metadata } from "next";
import LoginPage from "~/features/auth/pages/login-page";

export const metadata: Metadata = {
  title: "Masuk — Dolenae.id",
  description: "Masuk ke akun Dolenae.id dan lanjutkan menyiapkan perjalanan.",
};

export default function Page() {
  return <LoginPage />;
}