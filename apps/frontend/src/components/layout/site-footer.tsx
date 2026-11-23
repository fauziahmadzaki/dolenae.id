import Link from "next/link";
import { BrandMark } from "~/components/brand-mark";
import { footerColumns } from "~/features/landing/data";

const publicLinks: Record<string, string> = {
  "Destinasi": "/destinations",
  "Fasilitas Sekitar": "/#support",
  "Persiapan AI": "/#ai",
  "Pusat Bantuan": "/bantuan",
  "Kirim Masukan": "/masukan",
  "Privasi & Keamanan": "/privasi-keamanan",
  "Tentang Kami": "/tentang-kami",
  "Jadi Mitra": "/mitra",
  "Kontak": "/kontak",
  "Karier": "/karier",
};
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="bg-primary text-on-primary">
        <div className="mx-auto flex min-h-18 max-w-[1248px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center font-bold">
            <BrandMark size={28} rounded="rounded-md" className="bg-primary-hover" />
            Dolenae.id
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-canvas">
            <Link href="/destinations" className="hover:underline">Destinasi</Link>
            <Link href="/bantuan" className="hover:underline">Bantuan</Link>
            <Link href="/privasi-keamanan" className="hover:underline">Privasi</Link>
            <span className="text-xs font-medium text-canvas-subtle">© 2026 Dolenae.id</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-primary text-on-primary">
      <div className="mx-auto grid max-w-[1248px] gap-10 px-6 py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <BrandMark size={32} rounded="rounded-md" className="bg-primary-hover" />
            <span className="font-display text-lg font-extrabold text-on-primary">
              Dolenae.id
            </span>
          </div>
          <p className="max-w-xs text-sm text-on-primary/75">
            Discover More, Prepare Better. Temukan destinasi alam dan siapkan
            perjalananmu.
          </p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-wider text-on-primary/60">
              {col.title}
            </h3>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link}>
                  {publicLinks[link] ? <Link href={publicLinks[link]} className="text-sm text-on-primary/85 hover:text-on-primary hover:underline">{link}</Link> : <span className="text-sm text-on-primary/85" title="Fitur belum tersedia">{link}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-on-primary/15">
        <div className="mx-auto max-w-[1248px] px-6 py-5 text-xs text-on-primary/60">
          © 2026 Dolenae.id. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
