import { and, eq } from "drizzle-orm";
import {
  destinations,
  facilities,
  facilityProducts,
  users,
} from "../models";
import { database } from "../DatabaseClient";

type SeedDb = ReturnType<typeof database.getDb>;

type FacilitySeed = {
  name: string;
  category: "transport" | "accommodation" | "food";
  type: string;
  contact: string;
  priceMin: number;
  priceMax: number;
  latOffset: number;
  lngOffset: number;
  products: Array<{ name: string; price: number; description?: string }>;
};

const facilitySeeds: Record<string, FacilitySeed[]> = {
  "gunung-bromo": [
    {
      name: "Homestay Cemoro Indah",
      category: "accommodation",
      type: "homestay",
      contact: "081234567890",
      priceMin: 250000,
      priceMax: 400000,
      latOffset: 0.004,
      lngOffset: 0.003,
      products: [
        { name: "Kamar Standard", price: 250000, description: "1 kasur queen, sarapan" },
        { name: "Kamar Keluarga", price: 400000, description: "2 kasur, air hangat" },
      ],
    },
    {
      name: "Jeep Bromo Adventure",
      category: "transport",
      type: "jeep",
      contact: "081234567891",
      priceMin: 650000,
      priceMax: 650000,
      latOffset: -0.003,
      lngOffset: 0.005,
      products: [{ name: "Trip Sunrise Penanjakan", price: 650000 }],
    },
    {
      name: "Warung Bromo Asri",
      category: "food",
      type: "warung",
      contact: "081234567892",
      priceMin: 25000,
      priceMax: 50000,
      latOffset: 0.002,
      lngOffset: -0.004,
      products: [
        { name: "Nasi Goreng", price: 25000 },
        { name: "Mie Goreng", price: 25000 },
        { name: "Wedang Jahe", price: 10000 },
      ],
    },
  ],
  "gunung-prau": [
    {
      name: "Basecamp Prau Dieng",
      category: "accommodation",
      type: "homestay",
      contact: "081234567893",
      priceMin: 150000,
      priceMax: 300000,
      latOffset: 0.003,
      lngOffset: 0.002,
      products: [
        { name: "Kamar Standard", price: 150000 },
        { name: "Sewa Tenda", price: 100000 },
      ],
    },
    {
      name: "Ojek Dieng Pass",
      category: "transport",
      type: "ojek",
      contact: "081234567894",
      priceMin: 30000,
      priceMax: 30000,
      latOffset: -0.002,
      lngOffset: 0.003,
      products: [{ name: "Antar Patakbanteng", price: 30000 }],
    },
    {
      name: "Warung Makan Bu Djono",
      category: "food",
      type: "warung",
      contact: "081234567895",
      priceMin: 15000,
      priceMax: 30000,
      latOffset: 0.001,
      lngOffset: -0.003,
      products: [
        { name: "Nasi Campur", price: 25000 },
        { name: "Gorengan", price: 5000 },
      ],
    },
  ],
  "gunung-rinjani": [
    {
      name: "Homestay Sembalun",
      category: "accommodation",
      type: "homestay",
      contact: "081234567896",
      priceMin: 250000,
      priceMax: 400000,
      latOffset: 0.004,
      lngOffset: 0.004,
      products: [
        { name: "Kamar Standard", price: 250000 },
        { name: "Kamar Keluarga", price: 400000 },
      ],
    },
    {
      name: "Ojek Sembalun",
      category: "transport",
      type: "ojek",
      contact: "081234567897",
      priceMin: 50000,
      priceMax: 50000,
      latOffset: -0.003,
      lngOffset: 0.002,
      products: [{ name: "Antar Basecamp", price: 50000 }],
    },
    {
      name: "Warung Sembalun",
      category: "food",
      type: "warung",
      contact: "081234567898",
      priceMin: 20000,
      priceMax: 40000,
      latOffset: 0.002,
      lngOffset: -0.003,
      products: [
        { name: "Nasi Goreng", price: 25000 },
        { name: "Mie Kuah", price: 20000 },
      ],
    },
  ],
  "gunung-semeru": [
    {
      name: "Homestay Ranu Pani",
      category: "accommodation",
      type: "homestay",
      contact: "081234567899",
      priceMin: 200000,
      priceMax: 300000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [{ name: "Kamar Standard", price: 200000 }],
    },
    {
      name: "Jeep Ranu Pani",
      category: "transport",
      type: "jeep",
      contact: "081234567800",
      priceMin: 350000,
      priceMax: 350000,
      latOffset: -0.002,
      lngOffset: 0.004,
      products: [{ name: "Trip Ranu Kumbolo", price: 350000 }],
    },
    {
      name: "Warung Ranu Pani",
      category: "food",
      type: "warung",
      contact: "081234567801",
      priceMin: 15000,
      priceMax: 35000,
      latOffset: 0.001,
      lngOffset: -0.002,
      products: [{ name: "Nasi Goreng", price: 20000 }],
    },
  ],
  "gunung-merbabu": [
    {
      name: "Homestay Selo",
      category: "accommodation",
      type: "homestay",
      contact: "081234567802",
      priceMin: 175000,
      priceMax: 275000,
      latOffset: 0.004,
      lngOffset: 0.002,
      products: [{ name: "Kamar Standard", price: 175000 }],
    },
    {
      name: "Ojek Selo",
      category: "transport",
      type: "ojek",
      contact: "081234567803",
      priceMin: 40000,
      priceMax: 40000,
      latOffset: -0.002,
      lngOffset: 0.003,
      products: [{ name: "Antar Basecamp", price: 40000 }],
    },
    {
      name: "Warung Selo",
      category: "food",
      type: "warung",
      contact: "081234567804",
      priceMin: 15000,
      priceMax: 30000,
      latOffset: 0.001,
      lngOffset: -0.003,
      products: [{ name: "Nasi Campur", price: 25000 }],
    },
  ],
  "kawah-ijen": [
    {
      name: "Homestay Paltuding",
      category: "accommodation",
      type: "homestay",
      contact: "081234567805",
      priceMin: 200000,
      priceMax: 350000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [{ name: "Kamar Standard", price: 200000 }],
    },
    {
      name: "Jeep Paltuding",
      category: "transport",
      type: "jeep",
      contact: "081234567806",
      priceMin: 400000,
      priceMax: 400000,
      latOffset: -0.003,
      lngOffset: 0.004,
      products: [{ name: "Trip Kawah Ijen", price: 400000 }],
    },
    {
      name: "Warung Paltuding",
      category: "food",
      type: "warung",
      contact: "081234567807",
      priceMin: 15000,
      priceMax: 35000,
      latOffset: 0.002,
      lngOffset: -0.002,
      products: [{ name: "Nasi Goreng", price: 20000 }],
    },
  ],
  "gunung-gede-pangrango": [
    {
      name: "Homestay Cibodas",
      category: "accommodation",
      type: "homestay",
      contact: "081234567808",
      priceMin: 250000,
      priceMax: 400000,
      latOffset: 0.004,
      lngOffset: 0.002,
      products: [{ name: "Kamar Standard", price: 250000 }],
    },
    {
      name: "Ojek Cibodas",
      category: "transport",
      type: "ojek",
      contact: "081234567809",
      priceMin: 30000,
      priceMax: 30000,
      latOffset: -0.002,
      lngOffset: 0.003,
      products: [{ name: "Antar Gerbang", price: 30000 }],
    },
    {
      name: "Warung Cibodas",
      category: "food",
      type: "warung",
      contact: "081234567810",
      priceMin: 20000,
      priceMax: 45000,
      latOffset: 0.001,
      lngOffset: -0.003,
      products: [{ name: "Nasi Goreng", price: 25000 }],
    },
  ],
  "gunung-kerinci": [
    {
      name: "Homestay Kersik Tuo",
      category: "accommodation",
      type: "homestay",
      contact: "081234567811",
      priceMin: 200000,
      priceMax: 350000,
      latOffset: 0.003,
      lngOffset: 0.002,
      products: [{ name: "Kamar Standard", price: 200000 }],
    },
    {
      name: "Ojek Kersik Tuo",
      category: "transport",
      type: "ojek",
      contact: "081234567812",
      priceMin: 50000,
      priceMax: 50000,
      latOffset: -0.002,
      lngOffset: 0.003,
      products: [{ name: "Antar Basecamp", price: 50000 }],
    },
    {
      name: "Warung Kersik Tuo",
      category: "food",
      type: "warung",
      contact: "081234567813",
      priceMin: 15000,
      priceMax: 30000,
      latOffset: 0.001,
      lngOffset: -0.002,
      products: [{ name: "Nasi Campur", price: 25000 }],
    },
  ],
  "danau-kelimutu": [
    {
      name: "Homestay Moni",
      category: "accommodation",
      type: "homestay",
      contact: "081234567814",
      priceMin: 200000,
      priceMax: 350000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [{ name: "Kamar Standard", price: 200000 }],
    },
    {
      name: "Ojek Moni",
      category: "transport",
      type: "ojek",
      contact: "081234567815",
      priceMin: 50000,
      priceMax: 50000,
      latOffset: -0.002,
      lngOffset: 0.004,
      products: [{ name: "Antar Danau", price: 50000 }],
    },
    {
      name: "Warung Moni",
      category: "food",
      type: "warung",
      contact: "081234567816",
      priceMin: 20000,
      priceMax: 40000,
      latOffset: 0.001,
      lngOffset: -0.003,
      products: [{ name: "Nasi Goreng", price: 25000 }],
    },
  ],
  "pantai-kuta": [
    {
      name: "Homestay Kuta Beach",
      category: "accommodation",
      type: "homestay",
      contact: "081234567900",
      priceMin: 250000,
      priceMax: 400000,
      latOffset: 0.004,
      lngOffset: 0.003,
      products: [
        { name: "Kamar Standard", price: 250000, description: "1 kasur queen, sarapan" },
        { name: "Kamar Keluarga", price: 400000, description: "2 kasur, AC" },
      ],
    },
    {
      name: "Sewa Motor Kuta",
      category: "transport",
      type: "rental-motor",
      contact: "081234567901",
      priceMin: 75000,
      priceMax: 120000,
      latOffset: -0.003,
      lngOffset: 0.004,
      products: [
        { name: "Motor Harian", price: 75000, description: "24 jam, helm 2" },
      ],
    },
    {
      name: "Warung Segara",
      category: "food",
      type: "warung",
      contact: "081234567902",
      priceMin: 20000,
      priceMax: 50000,
      latOffset: 0.002,
      lngOffset: -0.003,
      products: [
        { name: "Nasi Campur", price: 30000 },
        { name: "Jus Kelapa", price: 20000 },
      ],
    },
  ],
  "pantai-parangtritis": [
    {
      name: "Homestay Parangtritis",
      category: "accommodation",
      type: "homestay",
      contact: "081234567903",
      priceMin: 200000,
      priceMax: 350000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [
        { name: "Kamar Standard", price: 200000 },
      ],
    },
    {
      name: "Jeep Gumuk Pasir",
      category: "transport",
      type: "jeep",
      contact: "081234567904",
      priceMin: 300000,
      priceMax: 450000,
      latOffset: -0.003,
      lngOffset: 0.005,
      products: [
        { name: "Trip Gumuk Pasir", price: 300000, description: "Maks 4 orang" },
      ],
    },
    {
      name: "Warung Kelapa",
      category: "food",
      type: "warung",
      contact: "081234567905",
      priceMin: 15000,
      priceMax: 35000,
      latOffset: 0.001,
      lngOffset: -0.004,
      products: [
        { name: "Nasi Goreng", price: 25000 },
        { name: "Es Kelapa", price: 15000 },
      ],
    },
  ],
  "pantai-tanjung-tinggi": [
    {
      name: "Villa Tanjung Tinggi",
      category: "accommodation",
      type: "villa",
      contact: "081234567906",
      priceMin: 400000,
      priceMax: 750000,
      latOffset: 0.004,
      lngOffset: 0.003,
      products: [
        { name: "Villa 2 Kamar", price: 750000, description: "4 orang, dapur" },
      ],
    },
    {
      name: "Perahu Pulau Lengkuas",
      category: "transport",
      type: "perahu",
      contact: "081234567907",
      priceMin: 250000,
      priceMax: 400000,
      latOffset: -0.002,
      lngOffset: 0.004,
      products: [
        { name: "Trip Pulau Lengkuas", price: 350000, description: "Maks 8 orang" },
      ],
    },
    {
      name: "Warung Seafood Belitung",
      category: "food",
      type: "resto",
      contact: "081234567908",
      priceMin: 35000,
      priceMax: 90000,
      latOffset: 0.002,
      lngOffset: -0.003,
      products: [
        { name: "Ikan Bakar", price: 75000 },
        { name: "Sambal Goreng", price: 35000 },
      ],
    },
  ],
  "danau-toba": [
    {
      name: "Homestay Tuktuk",
      category: "accommodation",
      type: "homestay",
      contact: "081234567909",
      priceMin: 200000,
      priceMax: 400000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [
        { name: "Kamar Danau", price: 300000, description: "Pemandangan danau" },
      ],
    },
    {
      name: "Kapal Danau Toba",
      category: "transport",
      type: "kapal",
      contact: "081234567910",
      priceMin: 50000,
      priceMax: 150000,
      latOffset: -0.002,
      lngOffset: 0.004,
      products: [
        { name: "Feri Samosir", price: 50000 },
        { name: "Kapal Charter", price: 150000 },
      ],
    },
    {
      name: "Resto Batak",
      category: "food",
      type: "resto",
      contact: "081234567911",
      priceMin: 30000,
      priceMax: 80000,
      latOffset: 0.001,
      lngOffset: -0.003,
      products: [
        { name: "Mie Gomak", price: 30000 },
        { name: "Ikan Mas Arsik", price: 70000 },
      ],
    },
  ],
  "danau-sentani": [
    {
      name: "Homestay Sentani",
      category: "accommodation",
      type: "homestay",
      contact: "081234567912",
      priceMin: 250000,
      priceMax: 400000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [
        { name: "Kamar Standard", price: 250000 },
      ],
    },
    {
      name: "Perahu Danau Sentani",
      category: "transport",
      type: "perahu",
      contact: "081234567913",
      priceMin: 100000,
      priceMax: 200000,
      latOffset: -0.002,
      lngOffset: 0.004,
      products: [
        { name: "Keliling Pulau Asei", price: 150000 },
      ],
    },
    {
      name: "Warung Ikan Sentani",
      category: "food",
      type: "warung",
      contact: "081234567914",
      priceMin: 25000,
      priceMax: 60000,
      latOffset: 0.001,
      lngOffset: -0.003,
      products: [
        { name: "Ikan Bakar", price: 50000 },
        { name: "Sagu", price: 20000 },
      ],
    },
  ],
  "air-terjun-tumpak-sewu": [
    {
      name: "Homestay Tumpak Sewu",
      category: "accommodation",
      type: "homestay",
      contact: "081234567915",
      priceMin: 150000,
      priceMax: 300000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [
        { name: "Kamar Standard", price: 150000 },
      ],
    },
    {
      name: "Ojek Tumpak Sewu",
      category: "transport",
      type: "ojek",
      contact: "081234567916",
      priceMin: 30000,
      priceMax: 50000,
      latOffset: -0.002,
      lngOffset: 0.003,
      products: [
        { name: "Antar Pronojiwo", price: 30000 },
      ],
    },
    {
      name: "Warung Kopi Pronojiwo",
      category: "food",
      type: "warung",
      contact: "081234567917",
      priceMin: 15000,
      priceMax: 30000,
      latOffset: 0.001,
      lngOffset: -0.002,
      products: [
        { name: "Kopi Panas", price: 10000 },
        { name: "Nasi Goreng", price: 20000 },
      ],
    },
  ],
  "air-terjun-sekumpul": [
    {
      name: "Homestay Sekumpul",
      category: "accommodation",
      type: "homestay",
      contact: "081234567918",
      priceMin: 200000,
      priceMax: 350000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [
        { name: "Kamar Standard", price: 200000 },
      ],
    },
    {
      name: "Sewa Motor Sekumpul",
      category: "transport",
      type: "rental-motor",
      contact: "081234567919",
      priceMin: 80000,
      priceMax: 120000,
      latOffset: -0.002,
      lngOffset: 0.004,
      products: [
        { name: "Motor Harian", price: 80000 },
      ],
    },
    {
      name: "Warung Bali Sekumpul",
      category: "food",
      type: "warung",
      contact: "081234567920",
      priceMin: 20000,
      priceMax: 45000,
      latOffset: 0.001,
      lngOffset: -0.003,
      products: [
        { name: "Nasi Campur Bali", price: 35000 },
        { name: "Jus Buah", price: 20000 },
      ],
    },
  ],
  "taman-nasional-baluran": [
    {
      name: "Homestay Banyuputih",
      category: "accommodation",
      type: "homestay",
      contact: "081234567921",
      priceMin: 175000,
      priceMax: 300000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [
        { name: "Kamar Standard", price: 175000 },
      ],
    },
    {
      name: "Jeep Baluran",
      category: "transport",
      type: "jeep",
      contact: "081234567922",
      priceMin: 350000,
      priceMax: 500000,
      latOffset: -0.003,
      lngOffset: 0.004,
      products: [
        { name: "Trip Savana Bekol", price: 400000, description: "Maks 4 orang" },
      ],
    },
    {
      name: "Warung Savana",
      category: "food",
      type: "warung",
      contact: "081234567923",
      priceMin: 20000,
      priceMax: 45000,
      latOffset: 0.001,
      lngOffset: -0.002,
      products: [
        { name: "Nasi Goreng", price: 25000 },
        { name: "Mie Kuah", price: 20000 },
      ],
    },
  ],
  "pulau-padar": [
    {
      name: "Homestay Labuan Bajo",
      category: "accommodation",
      type: "homestay",
      contact: "081234567924",
      priceMin: 250000,
      priceMax: 450000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [
        { name: "Kamar Standard", price: 250000 },
      ],
    },
    {
      name: "Kapal Komodo",
      category: "transport",
      type: "kapal",
      contact: "081234567925",
      priceMin: 450000,
      priceMax: 900000,
      latOffset: -0.002,
      lngOffset: 0.004,
      products: [
        { name: "Open Trip Padar", price: 450000 },
        { name: "Private Charter", price: 900000 },
      ],
    },
    {
      name: "Warung Seafood Labuan",
      category: "food",
      type: "resto",
      contact: "081234567926",
      priceMin: 35000,
      priceMax: 100000,
      latOffset: 0.001,
      lngOffset: -0.003,
      products: [
        { name: "Ikan Bakar", price: 75000 },
        { name: "Sate Ikan", price: 35000 },
      ],
    },
  ],
  "goa-pindul": [
    {
      name: "Homestay Bejiharjo",
      category: "accommodation",
      type: "homestay",
      contact: "081234567927",
      priceMin: 150000,
      priceMax: 250000,
      latOffset: 0.003,
      lngOffset: 0.003,
      products: [
        { name: "Kamar Standard", price: 150000 },
      ],
    },
    {
      name: "Ojek Pindul",
      category: "transport",
      type: "ojek",
      contact: "081234567928",
      priceMin: 25000,
      priceMax: 40000,
      latOffset: -0.002,
      lngOffset: 0.003,
      products: [
        { name: "Antar Goa Pindul", price: 25000 },
      ],
    },
    {
      name: "Warung Gunungkidul",
      category: "food",
      type: "warung",
      contact: "081234567929",
      priceMin: 15000,
      priceMax: 35000,
      latOffset: 0.001,
      lngOffset: -0.002,
      products: [
        { name: "Nasi Tiwul", price: 15000 },
        { name: "Gudeg", price: 25000 },
      ],
    },
  ],
};

/** Idempotently seed facilities + products for the demo destinations. */
export async function seedFacilities(db: SeedDb): Promise<void> {
  const [merchant] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "merchant@dolenae.id"))
    .limit(1);
  const ownerId = merchant?.id ?? null;

  for (const [slug, items] of Object.entries(facilitySeeds)) {
    const [destination] = await db
      .select({
        id: destinations.id,
        latitude: destinations.latitude,
        longitude: destinations.longitude,
      })
      .from(destinations)
      .where(eq(destinations.slug, slug))
      .limit(1);
    if (!destination || !destination.latitude || !destination.longitude) {
      continue;
    }

    for (const item of items) {
      const [existing] = await db
        .select({ id: facilities.id, ownerId: facilities.ownerId })
        .from(facilities)
        .where(
          and(
            eq(facilities.destinationId, destination.id),
            eq(facilities.name, item.name),
          ),
        )
        .limit(1);
      if (existing) {
        if (ownerId && !existing.ownerId) {
          await db
            .update(facilities)
            .set({ ownerId })
            .where(eq(facilities.id, existing.id));
        }
        // Idempotently add products that were introduced after the first seed.
        const existingProducts = await db
          .select({ name: facilityProducts.name })
          .from(facilityProducts)
          .where(eq(facilityProducts.facilityId, existing.id));
        const existingNames = new Set(existingProducts.map((row) => row.name));
        const missing = item.products.filter(
          (product) => !existingNames.has(product.name),
        );
        if (missing.length > 0) {
          await db.insert(facilityProducts).values(
            missing.map((product, index) => ({
              facilityId: existing.id,
              name: product.name,
              price: product.price,
              description: product.description ?? null,
              position: existingProducts.length + index,
            })),
          );
        }
        continue;
      }

      const [facility] = await db
        .insert(facilities)
        .values({
          destinationId: destination.id,
          ownerId,
          name: item.name,
          category: item.category,
          type: item.type,
          latitude: String(Number(destination.latitude) + item.latOffset),
          longitude: String(Number(destination.longitude) + item.lngOffset),
          priceMin: item.priceMin,
          priceMax: item.priceMax,
          contact: item.contact,
          status: "published",
        })
        .returning({ id: facilities.id });

      if (facility && item.products.length > 0) {
        await db.insert(facilityProducts).values(
          item.products.map((product, position) => ({
            facilityId: facility.id,
            name: product.name,
            price: product.price,
            description: product.description ?? null,
            position,
          })),
        );
      }
      console.log(`Fasilitas siap: ${item.name}`);
    }
  }
}
