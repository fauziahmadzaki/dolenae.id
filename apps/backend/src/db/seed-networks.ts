import { eq } from "drizzle-orm";
import {
  destinations,
  routeSegments,
  trackNodes,
  trailRouteNodes,
  trailRoutePoints,
  trailRouteSegments,
  trailRoutes,
  travelSupports,
} from "./schema";
import type { getDb } from "./client";

type SeedDb = ReturnType<typeof getDb>;

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

export async function seedExtraSupports(db: SeedDb): Promise<void> {
  const supports: Record<
    string,
    Array<{
      name: string;
      category: "accommodation" | "transport" | "food";
      locationLabel: string;
      priceLabel: string;
      priceUnit: string;
      priceMin: number;
      priceMax: number;
    }>
  > = {
    "gunung-rinjani": [
      { name: "Homestay Sembalun", category: "accommodation", locationLabel: "Sembalun Lawang", priceLabel: "Rp 250.000", priceUnit: "/malam", priceMin: 250000, priceMax: 400000 },
      { name: "Ojek Sembalun", category: "transport", locationLabel: "Sembalun", priceLabel: "Rp 50.000", priceUnit: "/trip", priceMin: 50000, priceMax: 50000 },
      { name: "Warung Sembalun", category: "food", locationLabel: "Sembalun Lawang", priceLabel: "Rp 20.000 - 40.000", priceUnit: "/porsi", priceMin: 20000, priceMax: 40000 },
    ],
    "gunung-semeru": [
      { name: "Homestay Ranu Pani", category: "accommodation", locationLabel: "Ranu Pani", priceLabel: "Rp 200.000", priceUnit: "/malam", priceMin: 200000, priceMax: 300000 },
      { name: "Jeep Ranu Pani", category: "transport", locationLabel: "Ranu Pani", priceLabel: "Rp 350.000", priceUnit: "/trip", priceMin: 350000, priceMax: 350000 },
      { name: "Warung Ranu Pani", category: "food", locationLabel: "Ranu Pani", priceLabel: "Rp 15.000 - 35.000", priceUnit: "/porsi", priceMin: 15000, priceMax: 35000 },
    ],
    "gunung-merbabu": [
      { name: "Homestay Selo", category: "accommodation", locationLabel: "Selo", priceLabel: "Rp 175.000", priceUnit: "/malam", priceMin: 175000, priceMax: 275000 },
      { name: "Ojek Selo", category: "transport", locationLabel: "Selo", priceLabel: "Rp 40.000", priceUnit: "/trip", priceMin: 40000, priceMax: 40000 },
      { name: "Warung Selo", category: "food", locationLabel: "Selo", priceLabel: "Rp 15.000 - 30.000", priceUnit: "/porsi", priceMin: 15000, priceMax: 30000 },
    ],
    "kawah-ijen": [
      { name: "Homestay Paltuding", category: "accommodation", locationLabel: "Paltuding", priceLabel: "Rp 200.000", priceUnit: "/malam", priceMin: 200000, priceMax: 350000 },
      { name: "Jeep Paltuding", category: "transport", locationLabel: "Paltuding", priceLabel: "Rp 400.000", priceUnit: "/trip", priceMin: 400000, priceMax: 400000 },
      { name: "Warung Paltuding", category: "food", locationLabel: "Paltuding", priceLabel: "Rp 15.000 - 35.000", priceUnit: "/porsi", priceMin: 15000, priceMax: 35000 },
    ],
    "gunung-gede-pangrango": [
      { name: "Homestay Cibodas", category: "accommodation", locationLabel: "Cibodas", priceLabel: "Rp 250.000", priceUnit: "/malam", priceMin: 250000, priceMax: 400000 },
      { name: "Ojek Cibodas", category: "transport", locationLabel: "Cibodas", priceLabel: "Rp 30.000", priceUnit: "/trip", priceMin: 30000, priceMax: 30000 },
      { name: "Warung Cibodas", category: "food", locationLabel: "Cibodas", priceLabel: "Rp 20.000 - 45.000", priceUnit: "/porsi", priceMin: 20000, priceMax: 45000 },
    ],
    "gunung-kerinci": [
      { name: "Homestay Kersik Tuo", category: "accommodation", locationLabel: "Kersik Tuo", priceLabel: "Rp 200.000", priceUnit: "/malam", priceMin: 200000, priceMax: 350000 },
      { name: "Ojek Kersik Tuo", category: "transport", locationLabel: "Kersik Tuo", priceLabel: "Rp 50.000", priceUnit: "/trip", priceMin: 50000, priceMax: 50000 },
      { name: "Warung Kersik Tuo", category: "food", locationLabel: "Kersik Tuo", priceLabel: "Rp 15.000 - 30.000", priceUnit: "/porsi", priceMin: 15000, priceMax: 30000 },
    ],
    "danau-kelimutu": [
      { name: "Homestay Moni", category: "accommodation", locationLabel: "Moni", priceLabel: "Rp 200.000", priceUnit: "/malam", priceMin: 200000, priceMax: 350000 },
      { name: "Ojek Moni", category: "transport", locationLabel: "Moni", priceLabel: "Rp 50.000", priceUnit: "/trip", priceMin: 50000, priceMax: 50000 },
      { name: "Warung Moni", category: "food", locationLabel: "Moni", priceLabel: "Rp 20.000 - 40.000", priceUnit: "/porsi", priceMin: 20000, priceMax: 40000 },
    ],
  };

  for (const [slug, items] of Object.entries(supports)) {
    const [destination] = await db
      .select({ id: destinations.id })
      .from(destinations)
      .where(eq(destinations.slug, slug))
      .limit(1);
    if (!destination) continue;

    const [existing] = await db
      .select({ id: travelSupports.id })
      .from(travelSupports)
      .where(eq(travelSupports.destinationId, destination.id))
      .limit(1);
    if (existing) continue;

    await db.insert(travelSupports).values(
      items.map((item) => ({
        ...item,
        destinationId: destination.id,
        verified: true,
      })),
    );
    console.log(`Travel supports ${slug} siap.`);
  }
}
