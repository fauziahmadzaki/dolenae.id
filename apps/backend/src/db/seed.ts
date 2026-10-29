/**
 * Seed data awal untuk kategori & destinasi.
 *
 * Jalankan: `pnpm db:seed`
 * Idempoten — aman dijalankan berulang kali. Data dicocokkan lewat `slug`.
 */
import { closeDatabase, getDb } from "./client";
import {
  categories,
  destinations,
  routeSegments,
  supportCategoryEnum,
  trackNodes,
  trailRouteNodes,
  trailRoutePoints,
  trailRouteSegments,
  trailRoutes,
  travelSupports,
  users,
  type CategoryType,
  type DestinationStatus,
  type Difficulty,
} from "./schema";
import { destinationRepository } from "../repositories/destination.repository";
import { hashPassword } from "../utils/password";
import { eq } from "drizzle-orm";
import { seedExtraSupports, seedRouteNetwork } from "./seed-networks";

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
  facilities: string[];
  entryFee: number;
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
    facilities: ["Toilet", "Warung", "Parkir", "Homestay"],
    entryFee: 29000,
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
    facilities: ["Toilet", "Warung", "Parkir", "Camping ground"],
    entryFee: 25000,
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
    facilities: ["Toilet", "Warung", "Parkir", "Camping ground"],
    entryFee: 30000,
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
    facilities: ["Toilet", "Warung", "Parkir"],
    entryFee: 15000,
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
    facilities: ["Toilet", "Warung", "Camping ground"],
    entryFee: 35000,
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
    facilities: ["Toilet", "Warung", "Parkir", "Homestay"],
    entryFee: 10000,
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
    facilities: ["Toilet", "Warung", "Parkir", "Homestay", "Camping ground"],
    entryFee: 150000,
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
    facilities: ["Toilet", "Warung", "Parkir", "Homestay", "Camping ground"],
    entryFee: 25000,
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
    facilities: ["Toilet", "Warung", "Parkir", "Homestay"],
    entryFee: 25000,
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
    facilities: ["Toilet", "Warung", "Parkir", "Homestay"],
    entryFee: 100000,
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
    facilities: ["Toilet", "Warung", "Parkir", "Homestay"],
    entryFee: 35000,
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
    facilities: ["Toilet", "Warung", "Parkir", "Homestay"],
    entryFee: 25000,
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
    facilities: ["Toilet", "Warung", "Parkir", "Homestay"],
    entryFee: 50000,
    guideRequired: false,
    categorySlugs: ["danau", "savana"],
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
};

async function seed(): Promise<void> {
  const db = getDb();

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

  const demoEmail = "wisatawan@dolenae.id";
  const [demoUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, demoEmail))
    .limit(1);
  if (!demoUser) {
    await db.insert(users).values({
      name: "Dimas Pratama",
      email: demoEmail,
      passwordHash: await hashPassword("dolenae123"),
      role: "wisatawan",
      provider: "local",
    });
    console.log(`User demo siap: ${demoEmail} / dolenae123`);
  } else {
    console.log(`User demo sudah ada: ${demoEmail}`);
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
  await seedTravelSupports(db);
  await seedExtraSupports(db);
  await seedOtherRoutes(db);

  console.log("Seed selesai.");
}

type SeedDb = ReturnType<typeof getDb>;

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

async function seedTravelSupports(db: SeedDb) {
  const [bromo] = await db
    .select({ id: destinations.id })
    .from(destinations)
    .where(eq(destinations.slug, "gunung-bromo"))
    .limit(1);

  if (bromo) {
    const [existing] = await db
      .select({ id: travelSupports.id })
      .from(travelSupports)
      .where(eq(travelSupports.destinationId, bromo.id))
      .limit(1);

    if (!existing) {
      await db.insert(travelSupports).values([
        {
          destinationId: bromo.id,
          name: "Homestay Cemoro Indah",
          category: "accommodation",
          locationLabel: "Cemoro Lawang, Ngadisari",
          priceLabel: "Rp 250.000",
          priceUnit: "/malam",
          priceMin: 250000,
          priceMax: 250000,
          verified: true,
          contactPhone: "081234567890",
        },
        {
          destinationId: bromo.id,
          name: "Jeep Bromo Adventure",
          category: "transport",
          locationLabel: "Basecamp Cemoro Lawang",
          priceLabel: "Rp 650.000",
          priceUnit: "/trip",
          priceMin: 650000,
          priceMax: 650000,
          includesDriver: true,
          verified: true,
          contactPhone: "081234567891",
        },
        {
          destinationId: bromo.id,
          name: "Warung Bromo Asri",
          category: "food",
          locationLabel: "Cemoro Lawang",
          priceLabel: "Rp 25.000 - 50.000",
          priceUnit: "/porsi",
          priceMin: 25000,
          priceMax: 50000,
          verified: true,
        },
      ]);
      console.log("Travel supports Bromo siap.");
    } else {
      console.log("Travel supports Bromo sudah ada.");
    }
  }

  const [prau] = await db
    .select({ id: destinations.id })
    .from(destinations)
    .where(eq(destinations.slug, "gunung-prau"))
    .limit(1);

  if (prau) {
    const [existing] = await db
      .select({ id: travelSupports.id })
      .from(travelSupports)
      .where(eq(travelSupports.destinationId, prau.id))
      .limit(1);

    if (!existing) {
      await db.insert(travelSupports).values([
        {
          destinationId: prau.id,
          name: "Basecamp Prau Dieng",
          category: "accommodation",
          locationLabel: "Dieng Kulon",
          priceLabel: "Rp 150.000",
          priceUnit: "/malam",
          priceMin: 150000,
          priceMax: 150000,
          verified: true,
        },
        {
          destinationId: prau.id,
          name: "Ojek Dieng Pass",
          category: "transport",
          locationLabel: "Patakbanteng",
          priceLabel: "Rp 30.000",
          priceUnit: "/trip",
          priceMin: 30000,
          priceMax: 30000,
          verified: true,
        },
        {
          destinationId: prau.id,
          name: "Warung Makan Bu Djono",
          category: "food",
          locationLabel: "Jl. Raya Dieng",
          priceLabel: "Rp 20.000 - 45.000",
          priceUnit: "/porsi",
          priceMin: 20000,
          priceMax: 45000,
          verified: true,
        },
      ]);
      console.log("Travel supports Prau siap.");
    } else {
      console.log("Travel supports Prau sudah ada.");
    }
  }
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
    await closeDatabase();
  });
