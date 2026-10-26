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
  trackNodes,
  trailRouteNodes,
  trailRoutePoints,
  trailRouteSegments,
  trailRoutes,
  users,
  type CategoryType,
  type DestinationStatus,
  type Difficulty,
} from "./schema";
import { destinationRepository } from "../repositories/destination.repository";
import { hashPassword } from "../utils/password";
import { eq } from "drizzle-orm";

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
];

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
    const [row] = await db
      .insert(destinations)
      .values({ ...values, verified: true })
      .onConflictDoUpdate({
        target: destinations.slug,
        set: { ...values, verified: true, updatedAt: new Date() },
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

seed()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
