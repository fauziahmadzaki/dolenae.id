import { eq } from "drizzle-orm";
import {
  destinations,
  routeSegments,
  trackNodes,
  trailRouteNodes,
  trailRoutePoints,
  trailRouteSegments,
  trailRoutes,
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
