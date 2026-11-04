"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export function PublicFetchError() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <div role="alert" className="rounded-xl border border-hairline bg-surface p-6"><p className="text-sm text-danger">Data belum dapat dimuat. Periksa koneksi atau coba lagi.</p><Button className="mt-3" variant="secondary" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? "Memuat ulang…" : "Coba lagi"}</Button></div>;
}
