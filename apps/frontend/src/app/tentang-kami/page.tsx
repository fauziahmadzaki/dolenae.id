import Image from "next/image";
import Link from "next/link";
import { Leaf, ShieldCheck, Compass } from "lucide-react";
import { container, PageHead, PublicShell } from "~/features/public/page-shell";

export const metadata = { title: "Tentang Kami | Dolenae.id" };
export default function AboutPage() {
  return <PublicShell>
    <PageHead title="Tentang Kami" description="Dolenae membantu wisatawan menemukan destinasi alam dan menyiapkan perjalanan dengan lebih tenang." />
    <section className={`${container} grid items-center gap-16 pt-18 pb-10 lg:grid-cols-[1fr_520px]`}>
      <div className="space-y-4"><h2 className="text-[28px] font-bold">Dari hobi mendaki jadi platform</h2>
        <p>Dolenae lahir dari pengalaman menyiapkan perjalanan gunung yang sering bikin bingung: info akses tersebar, fasilitas tidak jelas, dan checklist dibuat belakangan.</p>
        <p>Kami merapikannya jadi satu tempat supaya kamu bisa lebih banyak menghabiskan waktu menikmati perjalanan, bukan menyiapkannya.</p></div>
      <Image src="/images/public/about-story.png" alt="Puncak gunung di atas awan saat matahari terbenam" width={520} height={360} className="h-[360px] w-full rounded-xl object-cover" />
    </section>
    <section className="bg-primary text-on-primary" aria-label="Dolenae dalam angka"><dl className={`${container} flex flex-wrap gap-10 py-14`}>
      {[["120+", "destinasi terkurasi"], ["42", "merchant terverifikasi"], ["12rb+", "wisatawan terbantu"], ["4.8", "rating pengguna"]].map(([value, label]) => <div key={label}><dd className="font-display text-4xl font-bold">{value}</dd><dt className="mt-1.5 text-sm">{label}</dt></div>)}
    </dl></section>
    <div className={`${container} space-y-14 pt-18 pb-10`}>
      <section><h2 className="mb-7 text-2xl font-bold">Nilai kami</h2><div className="grid gap-12 sm:grid-cols-3">
        {[[Leaf, "Peduli alam", "Mendorong perjalanan yang bertanggung jawab."], [ShieldCheck, "Terpercaya", "Info akses dan fasilitas yang terkurasi."], [Compass, "Sederhana", "Persiapan jelas tanpa bikin bingung."]].map(([Icon, title, text]) => { const ValueIcon = Icon as typeof Leaf; return <div key={String(title)} className="flex flex-col items-center gap-2.5 text-center"><span className="flex size-10 items-center justify-center rounded-md bg-canvas-subtle text-primary"><ValueIcon size={20} /></span><h3 className="text-[17px] font-bold">{String(title)}</h3><p className="text-sm">{String(text)}</p></div>; })}
      </div></section>
      <section><h2 className="mb-7 text-2xl font-bold">Tim</h2><div className="grid gap-12 sm:grid-cols-3">
        {[["F", "Fauzi Ahmad Zaki", "Founder"], ["A", "Adi Achya", "Product"], ["W", "Widan Ababil", "Engineering"]].map(([initial, name, role], i) => <div key={name} className="flex flex-col items-center gap-2.5"><span className={`flex size-14 items-center justify-center rounded-full font-display text-xl font-bold ${i === 0 ? "bg-primary text-on-primary" : "bg-canvas-subtle text-primary"}`}>{initial}</span><h3 className="text-base font-bold">{name}</h3><p className="text-[13px]">{role}</p></div>)}
      </div></section>
    </div>
    <section className="bg-canvas-subtle"><div className={`${container} flex flex-col items-start gap-6 pt-16 pb-18 sm:flex-row sm:items-center`}><div><h2 className="text-[28px] font-bold">Mari siapkan perjalananmu</h2><p className="mt-1.5">Temukan destinasi dan susun persiapan dalam satu tempat.</p></div><Link href="/#destinations" className="rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-on-primary hover:bg-primary-hover">Mulai jelajah</Link></div></section>
  </PublicShell>;
}
