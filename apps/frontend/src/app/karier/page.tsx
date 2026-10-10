import Link from "next/link";
import { container, PageHead, PublicShell } from "~/features/public/page-shell";
export const metadata = { title: "Karier | Dolenae.id" };
export default function CareersPage() {
  // ponytail: no career frame or approved vacancy data; keep route honest until supplied.
  return <PublicShell><PageHead title="Karier" description="Informasi kesempatan bergabung dengan tim Dolenae." />
    <section className={`${container} pt-18 pb-24`}><div className="max-w-[760px] space-y-4 rounded-xl border border-hairline bg-surface p-8"><h2 className="text-2xl font-bold">Informasi karier belum tersedia</h2><p>Belum ada informasi lowongan terverifikasi yang dapat ditampilkan. Halaman ini tidak menerima atau menyimpan lamaran.</p><p className="text-sm">Desain khusus Karier belum tersedia pada file Figma yang diberikan.</p><Link href="/kontak" className="inline-flex rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary hover:bg-primary-hover">Hubungi tim Dolenae</Link></div></section>
  </PublicShell>;
}
