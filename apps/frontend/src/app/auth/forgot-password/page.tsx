import type { Metadata } from "next";
import ForgotPasswordPage from "~/features/auth/pages/forgot-password-page";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi — Dolenae.id",
  description: "Minta tautan reset kata sandi untuk akun Dolenae.id.",
};

export default function Page() {
  return <ForgotPasswordPage />;
}
