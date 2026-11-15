import { and, eq } from "drizzle-orm";
import {
  destinations,
  facilities,
  facilityProducts,
  routeSegments,
  trackNodes,
  trailRouteNodes,
  trailRoutePoints,
  trailRouteSegments,
  trailRoutes,
  users,
} from "../models";
import { database } from "../DatabaseClient";

type SeedDb = ReturnType<typeof database.getDb>;

interface NetworkNode {
  name: string;
  type:
    | "basecamp"
    | "gerbang"
    | "parkir"
    | "pos"
    | "sumber-air"
    | "viewpoint"
    | "puncak"
    | "persimpangan"
    | "area-camp";
  lat: string;
  lng: string;
  elevation: number;
}

interface NetworkRoute {
  name: string;
  nodes: string[];
  surface: string;
  status: "terverifikasi" | "alternatif";
}

/** Idempotently seed track nodes, segments, and trails for one destination. */
export async function seedRouteNetwork(
  db: SeedDb,
  slug: string,
  nodes: NetworkNode[],
  routes: NetworkRoute[],
): Promise<void> {
  const [destination] = await db
    .select({ id: destinations.id })
    .from(destinations)
    .where(eq(destinations.slug, slug))
    .limit(1);
  if (!destination) return;

  const [existing] = await db
    .select({ id: trackNodes.id })
    .from(trackNodes)
    .where(eq(trackNodes.destinationId, destination.id))
    .limit(1);
  if (existing) {
    console.log(`Rute ${slug} sudah ada.`);
    return;
  }

  const nodeRows = await db
    .insert(trackNodes)
    .values(
      nodes.map((node) => ({
        destinationId: destination.id,
        name: node.name,
        type: node.type,
        latitude: node.lat,
        longitude: node.lng,
        elevationMeters: node.elevation,
      })),
    )
    .returning({
      id: trackNodes.id,
      name: trackNodes.name,
      latitude: trackNodes.latitude,
      longitude: trackNodes.longitude,
      elevationMeters: trackNodes.elevationMeters,
    });

  const byName = new Map(nodeRows.map((row) => [row.name, row]));
  const segmentByPair = new Map<string, string>();
  const pairKey = (a: string, b: string) => [a, b].sort().join("|");

  for (const route of routes) {
    for (let index = 1; index < route.nodes.length; index += 1) {
      const from = route.nodes[index - 1]!;
      const to = route.nodes[index]!;
      const key = pairKey(from, to);
      if (segmentByPair.has(key)) continue;

      const [segment] = await db
        .insert(routeSegments)
        .values({
          destinationId: destination.id,
          fromNodeId: byName.get(from)!.id,
          toNodeId: byName.get(to)!.id,
          surface: "setapak",
          grade: "sedang",
          bidirectional: true,
          estimatedDurationMinutes: 60,
        })
        .returning({ id: routeSegments.id });
      segmentByPair.set(key, segment!.id);
    }
  }

  for (const route of routes) {
    const [row] = await db
      .insert(trailRoutes)
      .values({
        destinationId: destination.id,
        name: route.name,
        description: `${route.name} · data seed Dolenae.`,
        basecampNodeId: byName.get(route.nodes[0]!)?.id ?? null,
        surface: route.surface,
        grade: "sedang",
        traversableBy: ["pejalan-kaki"],
        status: route.status,
      })
      .returning({ id: trailRoutes.id });
    if (!row) continue;

    await db.insert(trailRouteNodes).values(
      route.nodes.map((name, position) => ({
        routeId: row.id,
        nodeId: byName.get(name)!.id,
        position,
      })),
    );

    await db.insert(trailRoutePoints).values(
      route.nodes.map((name, position) => {
        const node = byName.get(name)!;
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

    const routeSegmentIds = route.nodes.slice(1).map((name, index) => {
      const key = pairKey(route.nodes[index]!, name);
      return segmentByPair.get(key)!;
    });

    await db.insert(trailRouteSegments).values(
      routeSegmentIds.map((segmentId, position) => ({
        routeId: row.id,
        segmentId,
        position,
      })),
    );
  }

  console.log(`Jaringan rute ${slug} siap: ${nodes.length} titik, ${routes.length} jalur.`);
}

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
