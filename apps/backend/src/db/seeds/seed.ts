/**
 * Seed data awal untuk kategori & destinasi.
 *
 * Jalankan: `pnpm db:seed`
 * Idempoten — aman dijalankan berulang kali. Data dicocokkan lewat `slug`.
 */
import { database } from "../DatabaseClient";
import {
  categories,
  destinations,
  routeSegments,
  trackNodes,
  trailRouteNodes,
  trailRoutePoints,
  trailRouteSegments,
  trailRoutes,
  users,
  type CategoryType,
  type DestinationStatus,
  type Difficulty,
} from "../models";
import { destinationRepository } from "../../repositories/DestinationRepository";
import { hashPassword } from "../../utils/password";
import { eq } from "drizzle-orm";
import { seedFacilities } from "./seed-facilities";
import { seedRouteNetwork } from "./seed-networks";

interface SeedCategory {
  name: string;
  slug: string;
  type: CategoryType;
  icon: string;
  description: string;
}

interface SeedDestination {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  difficulty: Difficulty;
  status: DestinationStatus;
  elevationMeters: number;
  province: string;
  regency: string;
  district: string;
  latitude: string;
  longitude: string;
  accessPoint: string;
  accessDescription: string;
  accessTransport: string[];
  accessDuration: string;
  accessDistanceKm: string;
  bestSeason: string[];
  tags: string[];
  guideRequired: boolean;
  categorySlugs: string[];
}

const seedCategories: SeedCategory[] = [
  {
    name: "Gunung",
    slug: "gunung",
    type: "terrain",
    icon: "lucide:mountain",
    description: "Pendakian puncak dan jalur gunung berapi.",
  },
  {
    name: "Bukit",
    slug: "bukit",
    type: "terrain",
    icon: "lucide:mountain-snow",
    description: "Perbukitan dengan panorama terbuka dan sunrise.",
  },
  {
    name: "Danau",
    slug: "danau",
    type: "terrain",
    icon: "lucide:waves",
    description: "Danau vulkanik dan kawasan sekitar perairan.",
  },
  {
    name: "Air Terjun",
    slug: "air-terjun",
    type: "terrain",
    icon: "lucide:droplets",
    description: "Air terjun dan ngarai di kawasan hutan.",
  },
  {
    name: "Camping Ground",
    slug: "camping-ground",
    type: "activity",
    icon: "lucide:tent",
    description: "Area berkemah resmi dengan fasilitas dasar.",
  },
  {
    name: "Savana",
    slug: "savana",
    type: "terrain",
    icon: "lucide:sprout",
    description: "Padang rumput terbuka di dataran tinggi.",
  },
  {
    name: "Hutan",
    slug: "hutan",
    type: "terrain",
    icon: "lucide:trees",
    description: "Kawasan hutan lindung dan jalur interpretasi.",
  },
  {
    name: "Pantai",
    slug: "pantai",
    type: "terrain",
    icon: "lucide:sun",
    description: "Garis pantai dan tebing dengan akses terbatas.",
  },
];

const seedDestinations: SeedDestination[] = [
  {
    name: "Gunung Bromo",
    slug: "gunung-bromo",
    tagline: "Sunrise di lautan pasir",
    description:
      "Gunung Bromo terkenal dengan matahari terbit di atas lautan pasir dan kawah yang masih aktif. Jalur paling ramah dimulai dari Cemoro Lawang dengan jeep menuju Penanjakan.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 2329,
    province: "Jawa Timur",
    regency: "Probolinggo",
    district: "Sukapura",
    latitude: "-7.9425000",
    longitude: "112.9530000",
    accessPoint: "Cemoro Lawang",
    accessDescription:
      "Dari Surabaya via Probolinggo, lanjut ke Cemoro Lawang. Bisa kendaraan pribadi atau sewa jeep.",
    accessTransport: ["Mobil", "Jeep", "Motor"],
    accessDuration: "≈ 4 jam dari Surabaya",
    accessDistanceKm: "140.00",
    bestSeason: ["Kering (Jul-Okt)"],
    tags: ["sunrise", "kawah", "jeep"],
    guideRequired: false,
    categorySlugs: ["gunung", "savana"],
  },
  {
    name: "Gunung Prau",
    slug: "gunung-prau",
    tagline: "Camping di Dataran Tinggi Dieng",
    description:
      "Puncak Prau menawarkan panorama golden sunrise dan lautan awan. Pendakian bisa dimulai dari Patak Banteng atau Dieng dengan estimasi 3-4 jam.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 2565,
    province: "Jawa Tengah",
    regency: "Wonosobo",
    district: "Kejajar",
    latitude: "-7.2043000",
    longitude: "109.9203000",
    accessPoint: "Patak Banteng",
    accessDescription:
      "Dari Wonosobo menuju Desa Patak Banteng, lalu berjalan kaki menyusuri jalur hutan pinus.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 3-4 jam pendakian",
    accessDistanceKm: "12.00",
    bestSeason: ["Kering (Jun-Sep)"],
    tags: ["sunrise", "camping", "lautan awan"],
    guideRequired: false,
    categorySlugs: ["gunung", "camping-ground"],
  },
  {
    name: "Gunung Papandayan",
    slug: "gunung-papandayan",
    tagline: "Savana Tegal Alun",
    description:
      "Papandayan adalah gunung api dengan kawah belerang dan savana Tegal Alun yang dikenal sebagai surga edelweiss. Jalur pendakian relatif singkat namun menantang.",
    difficulty: "sulit",
    status: "published",
    elevationMeters: 2665,
    province: "Jawa Barat",
    regency: "Garut",
    district: "Cisurupan",
    latitude: "-7.3200000",
    longitude: "107.7300000",
    accessPoint: "Cisurupan",
    accessDescription:
      "Dari Garut menuju Cisurupan, lanjut ke basecamp Papandayan dengan kendaraan pribadi atau angkutan desa.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 2 jam dari Garut",
    accessDistanceKm: "28.00",
    bestSeason: ["Kering (Mei-Sep)"],
    tags: ["edelweiss", "kawah", "savana"],
    guideRequired: true,
    categorySlugs: ["gunung", "savana"],
  },
  {
    name: "Bukit Moko",
    slug: "bukit-moko",
    tagline: "Panorama Bandung dari ketinggian",
    description:
      "Bukit Moko berada di kawasan Bandung Barat dan cocok untuk menikmati panorama kota Bandung, terutama saat malam hari. Aksesnya relatif mudah dengan kendaraan bermotor.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 1200,
    province: "Jawa Barat",
    regency: "Bandung Barat",
    district: "Cimenyan",
    latitude: "-6.8456000",
    longitude: "107.6424000",
    accessPoint: "Cimenyan",
    accessDescription:
      "Dari pusat Kota Bandung menuju Cimenyan, jalan menanjak sempit namun bisa dilalui mobil.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 40 menit dari Bandung",
    accessDistanceKm: "10.00",
    bestSeason: ["Kemarau (Mei-Sep)"],
    tags: ["city view", "sunset", "camping"],
    guideRequired: false,
    categorySlugs: ["bukit", "camping-ground"],
  },
  {
    name: "Ranu Kumbolo",
    slug: "ranu-kumbolo",
    tagline: "Danau tenang di kaki Semeru",
    description:
      "Ranu Kumbolo adalah danau vulkanik di jalur pendakian Semeru. Area ini menjadi lokasi camp favorit dengan pemandangan bukit savana di sekelilingnya.",
    difficulty: "menengah",
    status: "published",
    elevationMeters: 2400,
    province: "Jawa Timur",
    regency: "Malang",
    district: "Senduro",
    latitude: "-8.0570000",
    longitude: "112.9350000",
    accessPoint: "Ranu Pani",
    accessDescription:
      "Dari Malang menuju Ranu Pani selama sekitar 3 jam, lalu trekking 4-5 jam menuju Ranu Kumbolo.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 3 jam dari Malang",
    accessDistanceKm: "85.00",
    bestSeason: ["Kering (Jun-Sep)"],
    tags: ["danau", "camping", "savana"],
    guideRequired: true,
    categorySlugs: ["danau", "camping-ground"],
  },
  {
    name: "Gunung Nglanggeran",
    slug: "gunung-nglanggeran",
    tagline: "Gunung api purba di Yogyakarta",
    description:
      "Gunung Nglanggeran adalah gunung api purba dengan jalur tangga dan bebatuan besar. Dari puncaknya terlihat waduk, sawah, dan kota Yogyakarta di kejauhan.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 700,
    province: "DI Yogyakarta",
    regency: "Gunungkidul",
    district: "Patuk",
    latitude: "-7.8392000",
    longitude: "110.5442000",
    accessPoint: "Desa Nglanggeran",
    accessDescription:
      "Dari Kota Yogyakarta menuju Desa Nglanggeran selama sekitar 40 menit, dilanjutkan jalan kaki ke puncak.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 40 menit dari Yogyakarta",
    accessDistanceKm: "25.00",
    bestSeason: ["Kemarau (Mei-Sep)"],
    tags: ["sunrise", "gunung api purba", "embung"],
    guideRequired: false,
    categorySlugs: ["gunung", "bukit"],
  },
  {
    name: "Gunung Rinjani",
    slug: "gunung-rinjani",
    tagline: "Danau kawah di ketinggian 3.726 mdpl",
    description:
      "Gunung Rinjani di Lombok menawarkan jalur Sembalun yang terbuka, savana luas, dan Danau Segara Anak di dalam kaldera. Puncaknya menjadi salah satu pendakian paling ikonik di Indonesia.",
    difficulty: "sulit",
    status: "published",
    elevationMeters: 3726,
    province: "Nusa Tenggara Barat",
    regency: "Lombok Timur",
    district: "Sembalun",
    latitude: "-8.4139000",
    longitude: "116.4578000",
    accessPoint: "Sembalun Lawang",
    accessDescription:
      "Dari Mataram menuju Sembalun Lawang sekitar 2,5 jam, lalu mendaki 2-3 hari menuju puncak.",
    accessTransport: ["Mobil", "Jeep", "Motor"],
    accessDuration: "≈ 2,5 jam dari Mataram",
    accessDistanceKm: "60.00",
    bestSeason: ["April - November"],
    tags: ["danau kawah", "savana", "sunrise"],
    guideRequired: true,
    categorySlugs: ["gunung", "savana", "hutan", "camping-ground"],
  },
  {
    name: "Gunung Semeru",
    slug: "gunung-semeru",
    tagline: "Atap Pulau Jawa",
    description:
      "Gunung Semeru adalah puncak tertinggi Pulau Jawa. Jalur klasik dimulai dari Ranu Pani, melewati Watu Rejeng, dan bermalam di Kalimati sebelum summit attack ke Mahameru.",
    difficulty: "sulit",
    status: "published",
    elevationMeters: 3676,
    province: "Jawa Timur",
    regency: "Malang",
    district: "Senduro",
    latitude: "-8.1077000",
    longitude: "112.9222000",
    accessPoint: "Ranu Pani",
    accessDescription:
      "Dari Malang menuju Ranu Pani sekitar 3 jam, dilanjutkan trekking 2-3 hari. Wajib izin TNBTS dan pemandu.",
    accessTransport: ["Jeep", "Motor"],
    accessDuration: "≈ 3 jam dari Malang",
    accessDistanceKm: "90.00",
    bestSeason: ["April - Oktober"],
    tags: ["mahameru", "camping", "gunung tertinggi jawa"],
    guideRequired: true,
    categorySlugs: ["gunung", "hutan", "savana", "camping-ground"],
  },
  {
    name: "Gunung Merbabu",
    slug: "gunung-merbabu",
    tagline: "Savana luas di Jawa Tengah",
    description:
      "Gunung Merbabu memiliki jalur savana yang terbuka dengan panorama Gunung Merapi di sebelah selatan. Jalur Selo dan Suwanting populer untuk pendakian singkat.",
    difficulty: "menengah",
    status: "published",
    elevationMeters: 3145,
    province: "Jawa Tengah",
    regency: "Magelang",
    district: "Selo",
    latitude: "-7.4550000",
    longitude: "110.4400000",
    accessPoint: "Selo",
    accessDescription:
      "Dari Magelang menuju basecamp Selo sekitar 1,5 jam, lalu mendaki 5-7 jam menuju puncak.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 1,5 jam dari Magelang",
    accessDistanceKm: "35.00",
    bestSeason: ["April - Oktober"],
    tags: ["savana", "sunrise", "merapi"],
    guideRequired: false,
    categorySlugs: ["gunung", "savana"],
  },
  {
    name: "Kawah Ijen",
    slug: "kawah-ijen",
    tagline: "Api biru dan danau asam",
    description:
      "Kawah Ijen terkenal dengan fenomena blue fire dan danau kawah berwarna toska. Pendakian dimulai dari Paltuding dan relatif singkat namun menanjak.",
    difficulty: "menengah",
    status: "published",
    elevationMeters: 2386,
    province: "Jawa Timur",
    regency: "Banyuwangi",
    district: "Licin",
    latitude: "-8.0580000",
    longitude: "114.2420000",
    accessPoint: "Paltuding",
    accessDescription:
      "Dari Banyuwangi menuju Paltuding sekitar 1,5 jam, lalu trekking 1,5-2 jam ke kawah.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 1,5 jam dari Banyuwangi",
    accessDistanceKm: "35.00",
    bestSeason: ["April - Oktober"],
    tags: ["blue fire", "danau kawah", "sunrise"],
    guideRequired: false,
    categorySlugs: ["gunung", "danau"],
  },
  {
    name: "Gunung Gede Pangrango",
    slug: "gunung-gede-pangrango",
    tagline: "Hutan hujan dan savana Surya Kencana",
    description:
      "Taman Nasional Gede Pangrango menyediakan jalur Cibodas yang melewati air terjun, hutan hujan, dan savana Surya Kencana sebelum menuju puncak Gede.",
    difficulty: "menengah",
    status: "published",
    elevationMeters: 2958,
    province: "Jawa Barat",
    regency: "Cianjur",
    district: "Cipanas",
    latitude: "-6.7900000",
    longitude: "106.9800000",
    accessPoint: "Cibodas",
    accessDescription:
      "Dari Jakarta menuju Cibodas sekitar 2 jam, lalu mendaki 6-8 jam menuju puncak.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 2 jam dari Jakarta",
    accessDistanceKm: "90.00",
    bestSeason: ["April - Oktober"],
    tags: ["savana", "hutan hujan", "air terjun"],
    guideRequired: true,
    categorySlugs: ["gunung", "hutan", "savana"],
  },
  {
    name: "Gunung Kerinci",
    slug: "gunung-kerinci",
    tagline: "Gunung tertinggi di Sumatera",
    description:
      "Gunung Kerinci berdiri di perbatasan Jambi dan Sumatera Barat. Jalur Kersik Tuo melewati hutan tropis lebat dan menjadi salah satu pendakian terberat di Indonesia.",
    difficulty: "sulit",
    status: "published",
    elevationMeters: 3805,
    province: "Jambi",
    regency: "Kerinci",
    district: "Kayu Aro",
    latitude: "-1.6970000",
    longitude: "101.2640000",
    accessPoint: "Kersik Tuo",
    accessDescription:
      "Dari Padang menuju Kersik Tuo sekitar 4 jam, lalu mendaki 2-3 hari menuju puncak.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 4 jam dari Padang",
    accessDistanceKm: "210.00",
    bestSeason: ["April - Oktober"],
    tags: ["gunung tertinggi sumatera", "hutan tropis"],
    guideRequired: true,
    categorySlugs: ["gunung", "hutan"],
  },
  {
    name: "Danau Kelimutu",
    slug: "danau-kelimutu",
    tagline: "Tiga danau warna di puncak gunung",
    description:
      "Danau Kelimutu di Ende memiliki tiga kawah dengan warna air yang berubah-ubah. Lokasi ini mudah diakses dari Moni dan cocok untuk sunrise.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 1639,
    province: "Nusa Tenggara Timur",
    regency: "Ende",
    district: "Detusoko",
    latitude: "-8.7660000",
    longitude: "121.8200000",
    accessPoint: "Moni",
    accessDescription:
      "Dari Ende menuju Moni sekitar 1,5 jam, lalu ke area Kelimutu dengan kendaraan.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 1,5 jam dari Ende",
    accessDistanceKm: "50.00",
    bestSeason: ["Mei - Oktober"],
    tags: ["danau", "sunrise", "warna"],
    guideRequired: false,
    categorySlugs: ["danau", "savana"],
  },
  {
    name: "Pantai Kuta",
    slug: "pantai-kuta",
    tagline: "Sunset di pesisir Badung",
    description:
      "Pantai Kuta menawarkan hamparan pasir putih, ombak yang cocok untuk surfing, dan sunset ikonik di pesisir Badung.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 0,
    province: "Bali",
    regency: "Badung",
    district: "Kuta",
    latitude: "-8.7185000",
    longitude: "115.1686000",
    accessPoint: "Pantai Kuta",
    accessDescription:
      "Dari Bandara Ngurah Rai sekitar 30 menit dengan mobil atau motor melalui Jalan Pantai Kuta.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 30 menit dari Denpasar",
    accessDistanceKm: "10.00",
    bestSeason: ["Kering (Apr-Okt)"],
    tags: ["sunset", "pantai", "surfing"],
    guideRequired: false,
    categorySlugs: ["pantai"],
  },
  {
    name: "Pantai Parangtritis",
    slug: "pantai-parangtritis",
    tagline: "Ombak selatan dan gumuk pasir",
    description:
      "Pantai Parangtritis dikenal dengan ombak Samudra Hindia, pasir hitam, dan gumuk pasir yang menjadi ciri khas pesisir Bantul.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 0,
    province: "DI Yogyakarta",
    regency: "Bantul",
    district: "Kretek",
    latitude: "-8.0254000",
    longitude: "110.3309000",
    accessPoint: "Pantai Parangtritis",
    accessDescription:
      "Dari pusat Kota Yogyakarta sekitar 1 jam dengan mobil atau bus jurusan Parangtritis.",
    accessTransport: ["Mobil", "Motor", "Bus"],
    accessDuration: "≈ 1 jam dari Yogyakarta",
    accessDistanceKm: "28.00",
    bestSeason: ["Kering (Mei-Sep)"],
    tags: ["sunset", "pantai", "gumuk pasir"],
    guideRequired: false,
    categorySlugs: ["pantai"],
  },
  {
    name: "Pantai Tanjung Tinggi",
    slug: "pantai-tanjung-tinggi",
    tagline: "Batu granit raksasa di Belitung",
    description:
      "Pantai Tanjung Tinggi memiliki air laut jernih dan formasi batu granit raksasa yang menjadi latar khas Pulau Belitung.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 0,
    province: "Kepulauan Bangka Belitung",
    regency: "Belitung",
    district: "Sijuk",
    latitude: "-2.5390000",
    longitude: "107.6400000",
    accessPoint: "Pantai Tanjung Tinggi",
    accessDescription:
      "Dari Tanjung Pandan sekitar 40 menit dengan mobil atau motor menuju kawasan Sijuk.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 40 menit dari Tanjung Pandan",
    accessDistanceKm: "30.00",
    bestSeason: ["Kering (Apr-Okt)"],
    tags: ["pantai", "batu granit", "snorkeling"],
    guideRequired: false,
    categorySlugs: ["pantai"],
  },
  {
    name: "Danau Toba",
    slug: "danau-toba",
    tagline: "Danau vulkanik terbesar di Indonesia",
    description:
      "Danau Toba adalah danau vulkanik terbesar di Indonesia dengan panorama perbukitan hijau dan budaya Batak di sekitarnya.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 905,
    province: "Sumatera Utara",
    regency: "Samosir",
    district: "Pangururan",
    latitude: "2.6845000",
    longitude: "98.8756000",
    accessPoint: "Tuktuk Siadong",
    accessDescription:
      "Dari Medan sekitar 4 jam dengan mobil menuju Parapat lalu menyeberang dengan kapal ke Samosir.",
    accessTransport: ["Mobil", "Kapal"],
    accessDuration: "≈ 4 jam dari Medan",
    accessDistanceKm: "176.00",
    bestSeason: ["Kering (Mei-Sep)"],
    tags: ["danau", "budaya", "perahu"],
    guideRequired: false,
    categorySlugs: ["danau", "hutan"],
  },
  {
    name: "Danau Sentani",
    slug: "danau-sentani",
    tagline: "Danau di kaki Pegunungan Cyclops",
    description:
      "Danau Sentani terbentang di bawah Pegunungan Cyclops dengan pulau-pulau kecil dan budaya lokal Papua yang khas.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 73,
    province: "Papua",
    regency: "Jayapura",
    district: "Sentani",
    latitude: "-2.5916000",
    longitude: "140.5148000",
    accessPoint: "Sentani",
    accessDescription:
      "Dari Kota Jayapura sekitar 40 menit dengan mobil menuju kawasan Danau Sentani.",
    accessTransport: ["Mobil", "Perahu"],
    accessDuration: "≈ 40 menit dari Jayapura",
    accessDistanceKm: "30.00",
    bestSeason: ["Kering (Jun-Sep)"],
    tags: ["danau", "papua", "perahu"],
    guideRequired: true,
    categorySlugs: ["danau", "bukit"],
  },
  {
    name: "Air Terjun Tumpak Sewu",
    slug: "air-terjun-tumpak-sewu",
    tagline: "Tirai air di kaki Semeru",
    description:
      "Tumpak Sewu adalah air terjun bertingkat selebar tebing yang mirip tirai, dikelilingi hutan tropis di lereng Semeru.",
    difficulty: "menengah",
    status: "published",
    elevationMeters: 500,
    province: "Jawa Timur",
    regency: "Malang",
    district: "Pronojiwo",
    latitude: "-8.2228000",
    longitude: "112.9260000",
    accessPoint: "Pronojiwo",
    accessDescription:
      "Dari Malang sekitar 3 jam dengan mobil menuju Pronojiwo, lalu turun ke dasar air terjun.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 3 jam dari Malang",
    accessDistanceKm: "70.00",
    bestSeason: ["Kering (Jun-Sep)"],
    tags: ["air terjun", "hutan", "fotografi"],
    guideRequired: true,
    categorySlugs: ["air-terjun", "hutan"],
  },
  {
    name: "Air Terjun Sekumpul",
    slug: "air-terjun-sekumpul",
    tagline: "Tujuh air terjun di hutan Bali",
    description:
      "Sekumpul adalah kumpulan air terjun tinggi di tengah hutan Buleleng, dikelilingi lembah hijau dan jalur tangga yang menantang.",
    difficulty: "menengah",
    status: "published",
    elevationMeters: 400,
    province: "Bali",
    regency: "Buleleng",
    district: "Sawan",
    latitude: "-8.1762000",
    longitude: "115.1692000",
    accessPoint: "Sekumpul",
    accessDescription:
      "Dari Denpasar sekitar 2 jam dengan mobil menuju Desa Sekumpul, lalu berjalan turun ke lembah.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 2 jam dari Denpasar",
    accessDistanceKm: "75.00",
    bestSeason: ["Kering (Apr-Okt)"],
    tags: ["air terjun", "hutan", "trekking"],
    guideRequired: true,
    categorySlugs: ["air-terjun", "hutan"],
  },
  {
    name: "Taman Nasional Baluran",
    slug: "taman-nasional-baluran",
    tagline: "Afrika van Java",
    description:
      "Baluran menyajikan savana Bekol yang luas dengan latar Gunung Baluran, serta pantai dan hutan mangrove di kawasan yang sama.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 50,
    province: "Jawa Timur",
    regency: "Situbondo",
    district: "Banyuputih",
    latitude: "-7.9425000",
    longitude: "114.3880000",
    accessPoint: "Gerbang Bekol",
    accessDescription:
      "Dari Surabaya sekitar 4 jam dengan mobil melalui Situbondo menuju gerbang Taman Nasional Baluran.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 4 jam dari Surabaya",
    accessDistanceKm: "200.00",
    bestSeason: ["Kering (Jun-Okt)"],
    tags: ["savana", "satwa", "sunrise"],
    guideRequired: false,
    categorySlugs: ["savana", "hutan"],
  },
  {
    name: "Pulau Padar",
    slug: "pulau-padar",
    tagline: "Tiga teluk dari puncak Padar",
    description:
      "Pulau Padar terkenal dengan panorama tiga teluk berwarna biru toska yang terlihat dari puncak bukitnya, bagian dari kawasan Komodo.",
    difficulty: "menengah",
    status: "published",
    elevationMeters: 100,
    province: "Nusa Tenggara Timur",
    regency: "Manggarai Barat",
    district: "Komodo",
    latitude: "-8.6530000",
    longitude: "119.5760000",
    accessPoint: "Labuan Bajo",
    accessDescription:
      "Dari Labuan Bajo sekitar 3 jam dengan kapal menuju Pulau Padar, lalu trekking singkat ke puncak.",
    accessTransport: ["Kapal"],
    accessDuration: "≈ 3 jam dari Labuan Bajo",
    accessDistanceKm: "45.00",
    bestSeason: ["Kering (Apr-Nov)"],
    tags: ["pantai", "trekking", "sunrise"],
    guideRequired: true,
    categorySlugs: ["pantai", "bukit"],
  },
  {
    name: "Goa Pindul",
    slug: "goa-pindul",
    tagline: "Susur goa dengan tubing",
    description:
      "Goa Pindul menawarkan susur goa bawah tanah dengan ban pelampung menyusuri sungai bawah tanah yang jernih.",
    difficulty: "ramah-pemula",
    status: "published",
    elevationMeters: 150,
    province: "DI Yogyakarta",
    regency: "Gunungkidul",
    district: "Bejiharjo",
    latitude: "-7.9360000",
    longitude: "110.6410000",
    accessPoint: "Bejiharjo",
    accessDescription:
      "Dari Yogyakarta sekitar 1 jam dengan mobil atau motor menuju Desa Bejiharjo, Gunungkidul.",
    accessTransport: ["Mobil", "Motor"],
    accessDuration: "≈ 1 jam dari Yogyakarta",
    accessDistanceKm: "35.00",
    bestSeason: ["Kering (Mei-Sep)"],
    tags: ["goa", "tubing", "sungai"],
    guideRequired: true,
    categorySlugs: ["hutan"],
  },
];

const seedImages: Record<string, string[]> = {
  "gunung-bromo": [
    "https://upload.wikimedia.org/wikipedia/commons/8/8e/Bromo-Semeru-Batok-Widodaren.jpg",
  ],
  "gunung-rinjani": [
    "https://upload.wikimedia.org/wikipedia/commons/4/4c/KAGAGAHAN_RIJANI.jpg",
  ],
  "gunung-semeru": [
    "https://upload.wikimedia.org/wikipedia/commons/e/e3/Mount_Semeru.jpg",
  ],
  "gunung-merbabu": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Gunung_Merbabu_2.jpg/1280px-Gunung_Merbabu_2.jpg",
  ],
  "kawah-ijen": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Sulfur_mining_in_Kawah_Ijen_-_Indonesia_-_20110608.jpg/1280px-Sulfur_mining_in_Kawah_Ijen_-_Indonesia_-_20110608.jpg",
  ],
  "gunung-gede-pangrango": [
    "https://upload.wikimedia.org/wikipedia/commons/9/94/Mount_Gede_01.jpg",
  ],
  "gunung-kerinci": [
    "https://upload.wikimedia.org/wikipedia/commons/f/f4/Uprising-mount_kerinci.jpg",
  ],
  "danau-kelimutu": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Kelimutu_Crater_Lake.jpg/1280px-Kelimutu_Crater_Lake.jpg",
  ],
  "gunung-papandayan": [
    "https://upload.wikimedia.org/wikipedia/commons/5/50/Indonesia_-_papandayan_4.jpg",
  ],
  "gunung-nglanggeran": [
    "https://upload.wikimedia.org/wikipedia/commons/b/bb/Bukit_Nglanggeran.jpg",
  ],
  "gunung-prau": [
    "https://upload.wikimedia.org/wikipedia/commons/9/9e/Mount_Parahu_in_the_Dieng_Plateau.jpg",
  ],
  "bukit-moko": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Fajar_di_Bukit_Moko%2C_Bandung.jpg/1280px-Fajar_di_Bukit_Moko%2C_Bandung.jpg",
  ],
  "ranu-kumbolo": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Ranu_Kumbolo.jpg/1280px-Ranu_Kumbolo.jpg",
  ],
  "pantai-kuta": [
    "https://upload.wikimedia.org/wikipedia/commons/b/bf/Pantai_Kuta_sejuta_cinta.jpg",
  ],
  "pantai-parangtritis": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Pantai_Parangtritis.jpg/1280px-Pantai_Parangtritis.jpg",
  ],
  "pantai-tanjung-tinggi": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Pantai_Tanjung_Tinggi.jpg/1280px-Pantai_Tanjung_Tinggi.jpg",
  ],
  "danau-toba": [
    "https://upload.wikimedia.org/wikipedia/commons/b/b1/Toba_zoom.jpg",
  ],
  "danau-sentani": [
    "https://upload.wikimedia.org/wikipedia/commons/1/1a/Festival_Danau_Sentani_2016.jpg",
  ],
  "air-terjun-tumpak-sewu": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Air_Terjun_Tumpak_Sewu.jpg/1280px-Air_Terjun_Tumpak_Sewu.jpg",
  ],
  "air-terjun-sekumpul": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Air_Terjun_Sekumpul.jpg/1280px-Air_Terjun_Sekumpul.jpg",
  ],
  "taman-nasional-baluran": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Golden_hour_at_bekol_savannah.jpg/1280px-Golden_hour_at_bekol_savannah.jpg",
  ],
  "pulau-padar": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Pulau_Padar_1.jpg/1280px-Pulau_Padar_1.jpg",
  ],
  "goa-pindul": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Goa_pindul_di_jogja.jpg/1280px-Goa_pindul_di_jogja.jpg",
  ],
};

async function seed(): Promise<void> {
  const db = database.getDb();

  const categoryIds = new Map<string, string>();
  for (const category of seedCategories) {
    const [row] = await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: category.name,
          type: category.type,
          icon: category.icon,
          description: category.description,
          updatedAt: new Date(),
        },
      })
      .returning({ id: categories.id, slug: categories.slug });
    if (row) categoryIds.set(row.slug, row.id);
  }
  console.log(`Kategori siap: ${categoryIds.size}`);

  const seedUsers = [
    {
      name: "Admin Dolenae",
      email: "admin@dolenae.id",
      password: "admin12345",
      role: "admin",
      phone: "0812 0000 0001",
      city: "Yogyakarta",
      bio: "Mengelola katalog dan verifikasi data destinasi Dolenae.",
    },
    {
      name: "Dimas Pratama",
      email: "wisatawan@dolenae.id",
      password: "dolenae123",
      role: "wisatawan",
      phone: "0812 1188 2233",
      city: "Yogyakarta",
      bio: "Suka mendaki gunung dan camping di dataran tinggi.",
    },
    {
      name: "Merchant Dolenae",
      email: "merchant@dolenae.id",
      password: "merchant12345",
      role: "merchant",
      phone: "0813 3390 1122",
      city: "Malang",
      bio: "Mengelola homestay dan jeep tour di kawasan Bromo.",
    },
  ] as const;

  for (const seedUser of seedUsers) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, seedUser.email))
      .limit(1);
    if (existing) {
      await db
        .update(users)
        .set({
          phone: seedUser.phone,
          city: seedUser.city,
          bio: seedUser.bio,
        })
        .where(eq(users.id, existing.id));
      console.log(`User sudah ada: ${seedUser.email} (${seedUser.role})`);
      continue;
    }
    await db.insert(users).values({
      name: seedUser.name,
      email: seedUser.email,
      passwordHash: await hashPassword(seedUser.password),
      role: seedUser.role,
      provider: "local",
      phone: seedUser.phone,
      city: seedUser.city,
      bio: seedUser.bio,
    });
    console.log(
      `User siap: ${seedUser.email} / ${seedUser.password} (${seedUser.role})`,
    );
  }

  for (const destination of seedDestinations) {
    const { categorySlugs, ...values } = destination;
    const images = seedImages[values.slug] ?? [];
    const [row] = await db
      .insert(destinations)
      .values({ ...values, images, verified: true })
      .onConflictDoUpdate({
        target: destinations.slug,
        set: { ...values, images, verified: true, updatedAt: new Date() },
      })
      .returning({ id: destinations.id, slug: destinations.slug });
    if (!row) continue;

    const linkedIds = categorySlugs
      .map((slug) => categoryIds.get(slug))
      .filter((id): id is string => Boolean(id));
    await destinationRepository.replaceCategories(row.id, linkedIds);
    console.log(`Destinasi siap: ${row.slug} (${linkedIds.length} kategori)`);
  }

  await seedBromoRoutes(db);
  await seedFacilities(db);
  await seedOtherRoutes(db);

  console.log("Seed selesai.");
}

type SeedDb = ReturnType<typeof database.getDb>;

/** Demo route network for the route builder (idempotent by destination). */
async function seedBromoRoutes(db: SeedDb) {
  const [bromo] = await db
    .select({ id: destinations.id })
    .from(destinations)
    .where(eq(destinations.slug, "gunung-bromo"))
    .limit(1);
  if (!bromo) return;

  const [existing] = await db
    .select({ id: trackNodes.id })
    .from(trackNodes)
    .where(eq(trackNodes.destinationId, bromo.id))
    .limit(1);
  if (existing) {
    console.log("Jaringan rute Bromo sudah ada.");
    return;
  }

  const nodeRows = await db
    .insert(trackNodes)
    .values([
      {
        destinationId: bromo.id,
        name: "Cemoro Lawang",
        type: "basecamp",
        latitude: "-7.9227000",
        longitude: "112.9531000",
        elevationMeters: 2200,
        notes: "Basecamp utama, banyak homestay dan jeep.",
      },
      {
        destinationId: bromo.id,
        name: "Gerbang Penanjakan",
        type: "gerbang",
        latitude: "-7.9310000",
        longitude: "112.9580000",
        elevationMeters: 2450,
      },
      {
        destinationId: bromo.id,
        name: "Penanjakan 1",
        type: "viewpoint",
        latitude: "-7.9400000",
        longitude: "112.9650000",
        elevationMeters: 2770,
        notes: "Spot sunrise utama.",
      },
      {
        destinationId: bromo.id,
        name: "Pasir Berbisik",
        type: "pos",
        latitude: "-7.9450000",
        longitude: "112.9500000",
        elevationMeters: 2150,
      },
      {
        destinationId: bromo.id,
        name: "Savana Teletubbies",
        type: "viewpoint",
        latitude: "-7.9480000",
        longitude: "112.9430000",
        elevationMeters: 2180,
      },
      {
        destinationId: bromo.id,
        name: "Kawah Bromo",
        type: "puncak",
        latitude: "-7.9420000",
        longitude: "112.9530000",
        elevationMeters: 2329,
      },
      {
        destinationId: bromo.id,
        name: "Pura Luhur Poten",
        type: "pos",
        latitude: "-7.9330000",
        longitude: "112.9510000",
        elevationMeters: 2200,
      },
    ])
    .returning({
      id: trackNodes.id,
      name: trackNodes.name,
      latitude: trackNodes.latitude,
      longitude: trackNodes.longitude,
      elevationMeters: trackNodes.elevationMeters,
    });

  const idOf = (name: string) =>
    nodeRows.find((row) => row.name === name)?.id ?? "";

  const segmentRows = await db
    .insert(routeSegments)
    .values([
      {
        destinationId: bromo.id,
        fromNodeId: idOf("Cemoro Lawang"),
        toNodeId: idOf("Gerbang Penanjakan"),
        surface: "aspal",
        grade: "sedang",
        traversableBy: ["mobil", "jeep", "motor", "pejalan-kaki"],
        estimatedDurationMinutes: 25,
      },
      {
        destinationId: bromo.id,
        fromNodeId: idOf("Gerbang Penanjakan"),
        toNodeId: idOf("Penanjakan 1"),
        surface: "aspal",
        grade: "terjal",
        traversableBy: ["jeep", "motor"],
        estimatedDurationMinutes: 20,
      },
      {
        destinationId: bromo.id,
        fromNodeId: idOf("Cemoro Lawang"),
        toNodeId: idOf("Pasir Berbisik"),
        surface: "setapak",
        grade: "landai",
        traversableBy: ["jeep", "sepeda", "pejalan-kaki"],
        estimatedDurationMinutes: 45,
      },
      {
        destinationId: bromo.id,
        fromNodeId: idOf("Pasir Berbisik"),
        toNodeId: idOf("Kawah Bromo"),
        surface: "setapak",
        grade: "sedang",
        traversableBy: ["pejalan-kaki"],
        estimatedDurationMinutes: 60,
      },
      {
        destinationId: bromo.id,
        fromNodeId: idOf("Pasir Berbisik"),
        toNodeId: idOf("Savana Teletubbies"),
        surface: "setapak",
        grade: "datar",
        traversableBy: ["pejalan-kaki"],
        estimatedDurationMinutes: 30,
      },
      {
        destinationId: bromo.id,
        fromNodeId: idOf("Cemoro Lawang"),
        toNodeId: idOf("Pura Luhur Poten"),
        surface: "aspal",
        grade: "datar",
        traversableBy: ["mobil", "motor", "pejalan-kaki"],
        estimatedDurationMinutes: 15,
      },
    ])
    .returning({ id: routeSegments.id, fromNodeId: routeSegments.fromNodeId, toNodeId: routeSegments.toNodeId });

  const segmentIdOf = (from: string, to: string) =>
    segmentRows.find(
      (row) => row.fromNodeId === idOf(from) && row.toNodeId === idOf(to),
    )?.id ?? "";

  const routes = [
    {
      name: "Jeep Sunrise",
      description: "Jalur jeep menuju spot sunrise Penanjakan 1.",
      nodes: ["Cemoro Lawang", "Gerbang Penanjakan", "Penanjakan 1"],
      segments: [
        segmentIdOf("Cemoro Lawang", "Gerbang Penanjakan"),
        segmentIdOf("Gerbang Penanjakan", "Penanjakan 1"),
      ],
      recommended: true,
      surface: "aspal",
      grade: "terjal" as const,
      traversableBy: ["jeep"],
      status: "terverifikasi" as const,
    },
    {
      name: "Trek Kawah",
      description: "Pendakian kaki dari Pasir Berbisik ke kawah.",
      nodes: ["Cemoro Lawang", "Pasir Berbisik", "Kawah Bromo"],
      segments: [
        segmentIdOf("Cemoro Lawang", "Pasir Berbisik"),
        segmentIdOf("Pasir Berbisik", "Kawah Bromo"),
      ],
      recommended: false,
      surface: "setapak",
      grade: "sedang" as const,
      traversableBy: ["pejalan-kaki"],
      status: "terverifikasi" as const,
    },
    {
      name: "Savana + Kawah",
      description: "Savana Teletubbies lalu kembali ke kawah.",
      nodes: [
        "Cemoro Lawang",
        "Pasir Berbisik",
        "Savana Teletubbies",
        "Pasir Berbisik",
        "Kawah Bromo",
      ],
      segments: [
        segmentIdOf("Cemoro Lawang", "Pasir Berbisik"),
        segmentIdOf("Pasir Berbisik", "Savana Teletubbies"),
        segmentIdOf("Pasir Berbisik", "Savana Teletubbies"),
        segmentIdOf("Pasir Berbisik", "Kawah Bromo"),
      ],
      recommended: false,
      surface: "campuran",
      grade: "sedang" as const,
      traversableBy: ["pejalan-kaki"],
      status: "alternatif" as const,
    },
  ];

  for (const route of routes) {
    const [row] = await db
      .insert(trailRoutes)
      .values({
        destinationId: bromo.id,
        name: route.name,
        description: route.description,
        basecampNodeId: idOf("Cemoro Lawang"),
        surface: route.surface,
        grade: route.grade,
        traversableBy: route.traversableBy,
        recommended: route.recommended,
        status: route.status,
      })
      .returning({ id: trailRoutes.id });
    if (!row) continue;

    await db.insert(trailRouteNodes).values(
      route.nodes.map((name, position) => ({
        routeId: row.id,
        nodeId: idOf(name),
        position,
      })),
    );
    await db.insert(trailRouteSegments).values(
      route.segments.map((segmentId, position) => ({
        routeId: row.id,
        segmentId,
        position,
      })),
    );
    await db.insert(trailRoutePoints).values(
      route.nodes.map((name, position) => {
        const node = nodeRows.find((item) => item.name === name)!;
        return {
          routeId: row.id,
          position,
          latitude: node.latitude,
          longitude: node.longitude,
          elevationMeters: node.elevationMeters,
          nodeId: node.id,
        };
      }),
    );
    console.log(`Jalur siap: ${route.name}`);
  }

  console.log(
    `Jaringan rute Bromo siap: ${nodeRows.length} titik, ${segmentRows.length} ruas.`,
  );
}

async function seedOtherRoutes(db: SeedDb): Promise<void> {
  await seedRouteNetwork(
    db,
    "gunung-rinjani",
    [
      { name: "Sembalun", type: "basecamp", lat: "-8.3530000", lng: "116.5080000", elevation: 1050 },
      { name: "Pos 1 Rinjani", type: "pos", lat: "-8.3650000", lng: "116.5000000", elevation: 1500 },
      { name: "Pos 2 Rinjani", type: "pos", lat: "-8.3800000", lng: "116.4900000", elevation: 1800 },
      { name: "Pelawangan Sembalun", type: "area-camp", lat: "-8.4000000", lng: "116.4700000", elevation: 2600 },
      { name: "Puncak Rinjani", type: "puncak", lat: "-8.4130000", lng: "116.4570000", elevation: 3726 },
    ],
    [
      { name: "Sembalun - Pelawangan", nodes: ["Sembalun", "Pos 1 Rinjani", "Pos 2 Rinjani", "Pelawangan Sembalun"], surface: "setapak", status: "terverifikasi" },
      { name: "Sembalun - Puncak Rinjani", nodes: ["Sembalun", "Pos 1 Rinjani", "Pos 2 Rinjani", "Pelawangan Sembalun", "Puncak Rinjani"], surface: "setapak", status: "terverifikasi" },
    ],
  );

  await seedRouteNetwork(
    db,
    "gunung-semeru",
    [
      { name: "Ranu Pani", type: "basecamp", lat: "-8.0200000", lng: "112.9500000", elevation: 2100 },
      { name: "Watu Rejeng", type: "pos", lat: "-8.0400000", lng: "112.9400000", elevation: 2400 },
      { name: "Kalimati", type: "area-camp", lat: "-8.0700000", lng: "112.9300000", elevation: 2700 },
      { name: "Puncak Semeru", type: "puncak", lat: "-8.1080000", lng: "112.9220000", elevation: 3676 },
    ],
    [
      { name: "Ranu Pani - Kalimati", nodes: ["Ranu Pani", "Watu Rejeng", "Kalimati"], surface: "setapak", status: "terverifikasi" },
      { name: "Ranu Pani - Mahameru", nodes: ["Ranu Pani", "Watu Rejeng", "Kalimati", "Puncak Semeru"], surface: "setapak", status: "terverifikasi" },
    ],
  );

  await seedRouteNetwork(
    db,
    "gunung-merbabu",
    [
      { name: "Selo", type: "basecamp", lat: "-7.4800000", lng: "110.4200000", elevation: 1500 },
      { name: "Pos 1 Merbabu", type: "pos", lat: "-7.4700000", lng: "110.4300000", elevation: 1900 },
      { name: "Pos 2 Merbabu", type: "pos", lat: "-7.4600000", lng: "110.4350000", elevation: 2400 },
      { name: "Puncak Merbabu", type: "puncak", lat: "-7.4550000", lng: "110.4400000", elevation: 3145 },
    ],
    [
      { name: "Selo - Puncak Merbabu", nodes: ["Selo", "Pos 1 Merbabu", "Pos 2 Merbabu", "Puncak Merbabu"], surface: "setapak", status: "terverifikasi" },
    ],
  );

  await seedRouteNetwork(
    db,
    "kawah-ijen",
    [
      { name: "Paltuding", type: "basecamp", lat: "-8.0300000", lng: "114.2500000", elevation: 1850 },
      { name: "Pos Bunder", type: "pos", lat: "-8.0450000", lng: "114.2450000", elevation: 2000 },
      { name: "Kawah Ijen", type: "puncak", lat: "-8.0580000", lng: "114.2420000", elevation: 2386 },
    ],
    [
      { name: "Paltuding - Kawah Ijen", nodes: ["Paltuding", "Pos Bunder", "Kawah Ijen"], surface: "setapak", status: "terverifikasi" },
    ],
  );
}

seed()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.close();
  });
