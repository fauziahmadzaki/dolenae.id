import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Car,
  CheckCircle2,
  ChevronDown,
  MapPin,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";

const CATEGORIES = [
  {
    icon: BedDouble,
    title: "Penginapan",
    subtitle: "Homestay, villa, dan camping ground",
    description:
      "Tampilkan kamar, tarif mulai, dan jarak dari basecamp agar pendaki mudah memilih tempat bermalam.",
  },
  {
    icon: Car,
    title: "Transportasi Lokal",
    subtitle: "Sewa jeep, ojek gunung, dan shuttle",
    description:
      "Bantu wisatawan dari luar kota menemukan akses transportasi menuju titik awal pendakian.",
  },
  {
    icon: UtensilsCrossed,
    title: "Kuliner & Warung",
    subtitle: "Warung makan, kedai kopi, dan perbekalan",
    description:
      "Perkenalkan menu lokal dan logistik perjalanan kepada wisatawan sebelum dan sesudah mendaki.",
  },
] as const;

const JOIN_STEPS = [
  {
    step: "1",
    title: "Buat akun & lengkapi profil",
    description:
      "Daftar gratis sebagai merchant, lalu isi nomor WhatsApp aktif dan kota domisili usaha Anda.",
  },
  {
    step: "2",
    title: "Pin lokasi & isi katalog",
    description:
      "Tentukan titik lokasi usaha dalam radius 20 km dari destinasi, tambahkan foto, dan daftar produk.",
  },
  {
    step: "3",
    title: "Verifikasi & langsung tayang",
    description:
      "Tim Dolenae meninjau data Anda. Setelah disetujui, usaha tampil di halaman destinasi web dan mobile.",
  },
] as const;

const BENEFITS = [
  "Tanpa potongan komisi transaksi — wisatawan menghubungi WhatsApp atau kontak Anda langsung.",
  "Muncul di halaman detail destinasi dan rekomendasi rencana perjalanan wisatawan.",
  "Kelola banyak cabang fasilitas dan daftar produk dalam satu dashboard.",
] as const;

const FAQS = [
  {
    question: "Apakah ada biaya pendaftaran atau komisi?",
    answer:
      "Tidak ada biaya pendaftaran maupun komisi transaksi. Dolenae berfokus membantu wisatawan menemukan fasilitas terverifikasi dan menghubungi Anda secara langsung.",
  },
  {
    question: "Mengapa lokasi usaha maksimal 20 km dari destinasi?",
    answer:
      "Kami menjaga relevansi radius agar penginapan, transportasi, dan warung yang tampil benar-benar berada di sekitar area akses destinasi terkait.",
  },
  {
    question: "Berapa lama proses verifikasi fasilitas?",
    answer:
      "Tim admin meninjau kelengkapan nama, kontak, foto, dan kesesuaian titik koordinat. Jika ada data yang perlu diperbaiki, Anda dapat langsung mengedit dan mengajukannya kembali.",
  },
] as const;

export function MerchantLandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero Split-Screen */}
        <section className="bg-canvas-subtle">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-20">
            <div className="flex flex-col items-start gap-5">
              <span className="text-xs font-semibold tracking-[0.2em] text-primary">
                MITRA DOLENAE.ID
              </span>
              <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
                Perkenalkan usaha Anda ke wisatawan alam
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-body sm:text-lg">
                Jangkau pendaki dan pelancong yang sedang merencanakan perjalanan
                ke pegunungan dan perbukitan Indonesia.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/auth/register"
                  prefetch={false}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
                >
                  Daftar sebagai mitra
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/auth/login"
                  prefetch={false}
                  className="inline-flex h-11 items-center rounded-full border border-hairline bg-surface px-6 text-sm font-semibold text-ink transition-colors hover:border-border-strong"
                >
                  Masuk ke dashboard
                </Link>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-primary lg:min-h-[400px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1120&h=800&fit=crop&q=80"
                alt="Penginapan kayu di kawasan pegunungan"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Kategori Usaha */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
                Kategori usaha yang dapat bergabung
              </h2>
              <p className="text-base text-body">
                Setiap fasilitas ditautkan langsung ke destinasi alam agar mudah
                ditemukan saat wisatawan menyusun persiapan perjalanan.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.title}
                    className="flex flex-col justify-between rounded-2xl border border-hairline bg-canvas-subtle p-6"
                  >
                    <div>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-5 font-display text-xl font-bold text-ink">
                        {category.title}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-primary">
                        {category.subtitle}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-body">
                        {category.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Alur Bergabung 3 Langkah */}
        <section className="border-y border-hairline bg-canvas-subtle py-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
                Tiga langkah menuju tayang
              </h2>
              <p className="text-base text-body">
                Proses pendaftaran dirancang ringkas agar usaha Anda cepat siap
                ditemukan wisatawan.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {JOIN_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-hairline bg-surface p-6"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-on-primary">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Keunggulan & FAQ */}
        <section className="bg-surface py-16">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
                  Transparan untuk pengelola lokal
                </h2>
                <p className="text-base text-body">
                  Dolenae bukan perantara transaksi. Kami menghubungkan wisatawan
                  yang butuh persiapan matang langsung ke kontak usaha Anda.
                </p>
              </div>

              <ul className="space-y-4">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm leading-relaxed text-ink">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4 pt-2 text-xs text-body">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-canvas-subtle px-3.5 py-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Radius maksimal 20 km dari destinasi
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-canvas-subtle px-3.5 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Kurasi & verifikasi admin
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-xl font-bold text-ink">
                Pertanyaan yang sering diajukan
              </h3>
              <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-canvas-subtle">
                {FAQS.map((faq) => (
                  <details key={faq.question} className="group px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                      {faq.question}
                      <ChevronDown className="h-4 w-4 shrink-0 text-body transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2.5 text-sm leading-relaxed text-body">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Penutup */}
        <section className="bg-surface pb-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-8 py-10 text-on-primary md:flex-row md:items-center">
              <div className="max-w-xl space-y-2">
                <h2 className="font-display text-2xl font-bold sm:text-3xl">
                  Siap menjangkau lebih banyak wisatawan?
                </h2>
                <p className="text-sm text-on-primary/80 sm:text-base">
                  Daftarkan akun merchant Anda sekarang dan mulai lengkapi profil
                  serta fasilitas pertama dalam beberapa menit.
                </p>
              </div>
              <Link
                href="/auth/register"
                prefetch={false}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-surface px-6 text-sm font-semibold text-primary transition-colors hover:bg-canvas-subtle"
              >
                Daftar sebagai mitra
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
