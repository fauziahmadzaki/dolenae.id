import type { Metadata } from "next";
import VerifyEmailPage from "~/features/auth/pages/verify-email-page";

export const metadata: Metadata = {
  title: "Verifikasi Email — Dolenae.id",
  description: "Konfirmasi alamat email akun Dolenae.id kamu.",
};

interface PageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return <VerifyEmailPage token={token} />;
}
