import { container, PageHead, PublicShell } from "~/features/public/page-shell";
export const metadata = { title: "Privasi & Keamanan | Dolenae.id" };
const sections = [
  { id: "ringkasan", title: "Ringkasan", paragraphs: ["Dolenae berkomitmen menjaga privasi dan keamanan datamu. Halaman ini menjelaskan data apa yang kami kumpulkan, bagaimana kami memakainya, dan kendali yang kamu miliki."] },
  { id: "data", title: "Data yang kami kumpulkan", paragraphs: ["Kami hanya mengumpulkan data yang diperlukan untuk menjalankan layanan."], items: ["Data akun: nama, email, dan kata sandi terenkripsi.", "Data perjalanan: destinasi tersimpan, rencana, dan checklist.", "Data perangkat: jenis perangkat dan aktivitas login untuk keamanan."] },
  { id: "penggunaan", title: "Bagaimana kami menggunakan data", paragraphs: ["Data dipakai untuk menyusun rekomendasi, menyimpan preferensimu, dan menjaga akun tetap aman."], items: ["Menampilkan destinasi dan fasilitas yang relevan.", "Menyusun checklist dan estimasi perjalanan.", "Mencegah penyalahgunaan dan aktivitas mencurigakan."] },
  { id: "berbagi", title: "Berbagi data", paragraphs: ["Kami tidak menjual datamu. Data hanya dibagikan seperlunya kepada penyedia layanan (mis. penyimpanan) dengan perjanjian kerahasiaan."] },
  { id: "keamanan", title: "Keamanan akun & data", paragraphs: ["Kami memakai langkah teknis dan praktik terbaik untuk melindungi datamu."], items: ["Enkripsi saat transit maupun saat disimpan.", "Dukungan dua faktor autentikasi pada akun.", "Pemantauan perangkat yang aktif dan sesi mencurigakan."], after: "Cara mengamankan akunmu: gunakan kata sandi kuat yang unik, aktifkan dua faktor, dan tinjau perangkat aktif secara berkala." },
  { id: "hak", title: "Hak & kendali kamu", paragraphs: ["Kamu memegang kendali atas datamu."], items: ["Melihat dan memperbarui data profil kapan saja.", "Meminta ekspor atau penghapusan akun.", "Menarik persetujuan pemakaian data non-esensial."] },
  { id: "retensi", title: "Retensi data", paragraphs: ["Kami menyimpan datamu selama akun aktif. Setelah kamu menghapus akun, data pribadi dihapus atau dianonimkan dalam waktu maksimal 30 hari, kecuali diwajibkan lain oleh hukum."] },
  { id: "kontak", title: "Kontak & perubahan", paragraphs: ["Pertanyaan soal privasi? Hubungi kami di privasi@dolenae.id. Kami akan memberi tahu bila kebijakan ini berubah, dan tanggal pembaruan selalu tercantum di atas."] },
];
export default function PrivacyPage() {
  return <PublicShell><PageHead title="Privasi & Keamanan" description="Bagaimana Dolenae mengumpulkan, menggunakan, dan melindungi datamu."><p className="text-[13px]">Terakhir diperbarui: 10 Oktober 2026</p></PageHead>
    <div className={`${container} grid items-start gap-12 pt-18 pb-24 lg:grid-cols-[260px_1fr] lg:gap-20`}>
      <nav aria-label="Daftar isi privasi" className="flex flex-col gap-3 lg:sticky lg:top-24"><h2 className="font-sans text-xs font-semibold text-body">DAFTAR ISI</h2>{sections.map(({ id, title }) => <a key={id} href={`#${id}`} className="text-sm hover:text-primary hover:underline">{title}</a>)}</nav>
      <article className="min-w-0 space-y-10">
        <aside className="rounded-lg border border-hairline bg-canvas-subtle p-4 text-sm">Rancangan kebijakan dari Figma, bukan konfirmasi fitur yang sudah tersedia. Enkripsi penyimpanan, autentikasi dua faktor, ekspor, dan penghapusan 30 hari belum diverifikasi pada versi ini. Kebijakan perlu ditinjau sebelum layanan diluncurkan.</aside>
        {sections.map(({ id, title, paragraphs, items, after }) => <section id={id} key={id} className="scroll-mt-24 space-y-3.5"><h2 className="text-[22px] font-bold">{title}</h2>{paragraphs.map((text) => <p key={text} className="text-[15px]">{text}</p>)}{items && <ul className="list-disc space-y-3.5 pl-5 text-[15px]">{items.map((text) => <li key={text}>{text}</li>)}</ul>}{after && <p className="text-[15px]">{after}</p>}</section>)}
        <a href="mailto:privasi@dolenae.id" className="text-sm text-primary underline">Email tim privasi</a>
      </article>
    </div></PublicShell>;
}
