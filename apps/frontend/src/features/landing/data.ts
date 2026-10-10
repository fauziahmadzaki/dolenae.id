export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "Destinasi", href: "/#destinations" },
  { label: "Fasilitas Sekitar", href: "/#support" },
  { label: "Persiapan AI", href: "/#ai" },
  { label: "Tentang Kami", href: "/tentang-kami" },
];

export const heroChips = ["Gunung", "Bukit", "Camping", "Sunrise"];

export const filters = [
  "Semuanya",
  "Ramah Pemula",
  "Area Camping",
  "Spot Sunrise",
  "Transport Mudah",
];

export type Difficulty = "Ramah pemula" | "Menengah" | "Sulit";

export interface Destination {
  name: string;
  difficulty: Difficulty;
  meta: string;
  price: string;
  tag: string;
  seed: string;
}

export const destinations: Destination[] = [
  {
    name: "Gunung Bromo",
    difficulty: "Menengah",
    meta: "2.329 mdpl · Probolinggo",
    price: "Rp 29.000",
    tag: "Surga sunrise",
    seed: "bromo",
  },
  {
    name: "Gunung Prau",
    difficulty: "Ramah pemula",
    meta: "2.565 mdpl · Wonosobo",
    price: "Rp 25.000",
    tag: "Camping Dieng",
    seed: "prau",
  },
  {
    name: "Gunung Papandayan",
    difficulty: "Sulit",
    meta: "2.665 mdpl · Garut",
    price: "Rp 30.000",
    tag: "Savana Tegal Alun",
    seed: "papandayan",
  },
];

export interface Support {
  name: string;
  type: string;
  price: string;
}

export const supports: Support[] = [
  {
    name: "Homestay Cemoro Indah",
    type: "Penginapan · 1,2 km dari basecamp",
    price: "Rp 250.000/malam",
  },
  {
    name: "Bromo Jeep Tour Probolinggo",
    type: "Transportasi · sewa jeep & open trip",
    price: "Harga menengah",
  },
  {
    name: "Warung Edelweiss Basecamp",
    type: "Tempat makan · masakan lokal",
    price: "Harga ekonomis",
  },
];

export const aiFeatures = [
  "Checklist perlengkapan lengkap, sehat, dan konservasi",
  "Estimasi akses, jarak, dan waktu tempuh",
  "Rekomendasi destinasi sesuai preferensi",
];

export interface Step {
  n: string;
  title: string;
  body: string;
}

export const steps: Step[] = [
  {
    n: "1",
    title: "Temukan destinasi",
    body: "Jelajahi gunung dan bukit sesuai minat, medan, dan waktu luangmu.",
  },
  {
    n: "2",
    title: "Pahami kebutuhan",
    body: "Lihat akses, fasilitas sekitar, dan kondisi perjalanan dalam satu tampilan.",
  },
  {
    n: "3",
    title: "Siapkan perjalanan",
    body: "Susun checklist persiapan agar tidak ada yang terlewat sebelum naik.",
  },
];

export interface Testimonial {
  initial: string;
  name: string;
  role: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    initial: "R",
    name: "Rani Pradita",
    role: "Pendaki, Yogyakarta",
    quote:
      "Dolenae bikin kami nggak panik menyiapkan Bromo. Checklist-nya lengkap dan aksesnya jelas.",
  },
  {
    initial: "B",
    name: "Bagas Nugraha",
    role: "Traveler, Surabaya",
    quote:
      "Suka fitur rencana perjalanan. Semua kebutuhan trip terkumpul di satu tempat lewat Dolenae.",
  },
  {
    initial: "S",
    name: "Sinta Maharani",
    role: "Camping enthusiast, Bandung",
    quote:
      "Info fasilitas sekitar sangat membantu. Waktu sampai di sana tidak perlu bingung lagi.",
  },
];

export const footerColumns: { title: string; links: string[] }[] = [
  { title: "JELAJAHI", links: ["Destinasi", "Fasilitas Sekitar", "Persiapan AI", "Rencana"] },
  { title: "BANTUAN", links: ["Pusat Bantuan", "Kirim Masukan", "Privasi & Keamanan"] },
  { title: "PERUSAHAAN", links: ["Tentang Kami", "Kontak", "Karier"] },
];

export const difficultyStyles: Record<Difficulty, string> = {
  "Ramah pemula": "bg-success/10 text-success",
  Menengah: "bg-warning/10 text-warning",
  Sulit: "bg-danger/10 text-danger",
};
