import type { Metadata } from "next";
import ResetPasswordPage from "~/features/auth/pages/reset-password-page";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi — Dolenae.id",
  description: "Buat kata sandi baru untuk akun Dolenae.id.",
};

interface PageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return <ResetPasswordPage token={token} />;
}
