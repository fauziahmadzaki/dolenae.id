import { and, asc, count, eq, inArray, or } from "drizzle-orm";
import { getDb } from "../db/client";
import {
  routeSegments,
  trackNodes,
  trailRouteNodes,
  trailRouteSegments,
  trailRoutes,
  type NewRouteSegmentRow,
  type NewTrackNodeRow,
  type NewTrailRouteRow,
  type RouteSegmentRow,
  type TrackNodeRow,
  type TrailRouteRow,
} from "../db/schema";

export type TrackNodePatch = Partial<
  Pick<
    NewTrackNodeRow,
    | "name"
    | "type"
    | "latitude"
    | "longitude"
    | "elevationMeters"
    | "notes"
  >
>;

export type RouteSegmentPatch = Partial<
  Pick<
    NewRouteSegmentRow,
    | "surface"
    | "grade"
    | "traversableBy"
    | "bidirectional"
    | "distanceKm"
    | "estimatedDurationMinutes"
    | "seasonal"
    | "notes"
    | "status"
  >
>;

export type TrailRoutePatch = Partial<
  Pick<
    NewTrailRouteRow,
    | "name"
    | "description"
    | "basecampNodeId"
    | "surface"
    | "grade"
    | "traversableBy"
    | "difficulty"
    | "recommended"
    | "status"
  >
>;

export const routeRepository = {
  // --- Track nodes ---------------------------------------------------------

  async listNodes(destinationId: string): Promise<TrackNodeRow[]> {
    return getDb()
      .select()
      .from(trackNodes)
      .where(eq(trackNodes.destinationId, destinationId))
      .orderBy(asc(trackNodes.createdAt));
  },

  async findNodeById(id: string): Promise<TrackNodeRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(trackNodes)
      .where(eq(trackNodes.id, id))
      .limit(1);
    return row;
  },

  async findNodesByIds(ids: string[]): Promise<TrackNodeRow[]> {
    if (ids.length === 0) return [];
    return getDb().select().from(trackNodes).where(inArray(trackNodes.id, ids));
  },

  async createNode(data: NewTrackNodeRow): Promise<TrackNodeRow> {
    const [row] = await getDb().insert(trackNodes).values(data).returning();
    return row!;
  },

  async updateNode(
    id: string,
    patch: TrackNodePatch,
  ): Promise<TrackNodeRow | undefined> {
    const [row] = await getDb()
      .update(trackNodes)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(trackNodes.id, id))
      .returning();
    return row;
  },

  async deleteNode(id: string): Promise<boolean> {
    const [row] = await getDb()
      .delete(trackNodes)
      .where(eq(trackNodes.id, id))
      .returning({ id: trackNodes.id });
    return Boolean(row);
  },

  async countNodeSegments(nodeId: string): Promise<number> {
    const [row] = await getDb()
      .select({ value: count() })
      .from(routeSegments)
      .where(
        or(
          eq(routeSegments.fromNodeId, nodeId),
          eq(routeSegments.toNodeId, nodeId),
        ),
      );
    return Number(row?.value ?? 0);
  },

  async countNodeRoutes(nodeId: string): Promise<number> {
    const [row] = await getDb()
      .select({ value: count() })
      .from(trailRouteNodes)
      .where(eq(trailRouteNodes.nodeId, nodeId));
    return Number(row?.value ?? 0);
  },

  // --- Segments ------------------------------------------------------------

  async listSegments(destinationId: string): Promise<RouteSegmentRow[]> {
    return getDb()
      .select()
      .from(routeSegments)
      .where(eq(routeSegments.destinationId, destinationId))
      .orderBy(asc(routeSegments.createdAt));
  },

  async findSegmentById(id: string): Promise<RouteSegmentRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(routeSegments)
      .where(eq(routeSegments.id, id))
      .limit(1);
    return row;
  },

  /** Segment between two nodes, regardless of direction. */
  async findSegmentBetween(
    destinationId: string,
    firstNodeId: string,
    secondNodeId: string,
  ): Promise<RouteSegmentRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(routeSegments)
      .where(
        and(
          eq(routeSegments.destinationId, destinationId),
          or(
            and(
              eq(routeSegments.fromNodeId, firstNodeId),
              eq(routeSegments.toNodeId, secondNodeId),
            ),
            and(
              eq(routeSegments.fromNodeId, secondNodeId),
              eq(routeSegments.toNodeId, firstNodeId),
            ),
          ),
        ),
      )
      .limit(1);
    return row;
  },

  async createSegment(data: NewRouteSegmentRow): Promise<RouteSegmentRow> {
    const [row] = await getDb().insert(routeSegments).values(data).returning();
    return row!;
  },

  async updateSegment(
    id: string,
    patch: RouteSegmentPatch,
  ): Promise<RouteSegmentRow | undefined> {
    const [row] = await getDb()
      .update(routeSegments)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(routeSegments.id, id))
      .returning();
    return row;
  },

  async deleteSegment(id: string): Promise<boolean> {
    const [row] = await getDb()
      .delete(routeSegments)
      .where(eq(routeSegments.id, id))
      .returning({ id: routeSegments.id });
    return Boolean(row);
  },

  async countSegmentRoutes(segmentId: string): Promise<number> {
    const [row] = await getDb()
      .select({ value: count() })
      .from(trailRouteSegments)
      .where(eq(trailRouteSegments.segmentId, segmentId));
    return Number(row?.value ?? 0);
  },

  // --- Routes --------------------------------------------------------------

  async listRoutes(destinationId: string): Promise<TrailRouteRow[]> {
    return getDb()
      .select()
      .from(trailRoutes)
      .where(eq(trailRoutes.destinationId, destinationId))
      .orderBy(asc(trailRoutes.createdAt));
  },

  async findRouteById(id: string): Promise<TrailRouteRow | undefined> {
    const [row] = await getDb()
      .select()
      .from(trailRoutes)
      .where(eq(trailRoutes.id, id))
      .limit(1);
    return row;
  },

  async createRoute(data: NewTrailRouteRow): Promise<TrailRouteRow> {
    const [row] = await getDb().insert(trailRoutes).values(data).returning();
    return row!;
  },

  async updateRoute(
    id: string,
    patch: TrailRoutePatch,
  ): Promise<TrailRouteRow | undefined> {
    const [row] = await getDb()
      .update(trailRoutes)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(trailRoutes.id, id))
      .returning();
    return row;
  },

  async deleteRoute(id: string): Promise<boolean> {
    const [row] = await getDb()
      .delete(trailRoutes)
      .where(eq(trailRoutes.id, id))
      .returning({ id: trailRoutes.id });
    return Boolean(row);
  },

  async findRouteNodeIds(routeId: string): Promise<string[]> {
    const rows = await getDb()
      .select({ nodeId: trailRouteNodes.nodeId })
      .from(trailRouteNodes)
      .where(eq(trailRouteNodes.routeId, routeId))
      .orderBy(asc(trailRouteNodes.position));
    return rows.map((row) => row.nodeId);
  },

  async findRouteSegmentIds(routeId: string): Promise<string[]> {
    const rows = await getDb()
      .select({ segmentId: trailRouteSegments.segmentId })
      .from(trailRouteSegments)
      .where(eq(trailRouteSegments.routeId, routeId))
      .orderBy(asc(trailRouteSegments.position));
    return rows.map((row) => row.segmentId);
  },

  async replaceRouteNodes(routeId: string, nodeIds: string[]): Promise<void> {
    const db = getDb();
    await db
      .delete(trailRouteNodes)
      .where(eq(trailRouteNodes.routeId, routeId));
    if (nodeIds.length > 0) {
      await db.insert(trailRouteNodes).values(
        nodeIds.map((nodeId, position) => ({ routeId, nodeId, position })),
      );
    }
  },

  async replaceRouteSegments(
    routeId: string,
    segmentIds: string[],
  ): Promise<void> {
    const db = getDb();
    await db
      .delete(trailRouteSegments)
      .where(eq(trailRouteSegments.routeId, routeId));
    if (segmentIds.length > 0) {
      await db.insert(trailRouteSegments).values(
        segmentIds.map((segmentId, position) => ({
          routeId,
          segmentId,
          position,
        })),
      );
    }
  },
};
