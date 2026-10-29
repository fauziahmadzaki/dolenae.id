import type {
  Difficulty,
  RouteGrade,
  RouteSegmentRow,
  RouteStatus,
  RouteSurface,
  TrackNodeRow,
  TrackNodeType,
  TrailRoutePointRow,
  TrailRouteRow,
  TrailRouteStatus,
} from "../db/schema";
import { destinationRepository } from "../repositories/destination.repository";
import { routeRepository } from "../repositories/route.repository";
import { storageService } from "./storage.service";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";
import {
  difficultyFromEffort,
  elevationGainLoss,
  gradePercent,
  haversineKm,
  naismithMinutes,
  type Coordinate,
} from "../utils/geo";

// --- Public shapes ---------------------------------------------------------

export interface TrackNodeDto {
  id: string;
  destinationId: string;
  name: string;
  type: TrackNodeType;
  coordinate: { latitude: number; longitude: number };
  elevationMeters: number;
  notes: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RouteSegmentDto {
  id: string;
  destinationId: string;
  fromNodeId: string;
  toNodeId: string;
  surface: RouteSurface;
  grade: RouteGrade;
  traversableBy: string[];
  bidirectional: boolean;
  /** Null = computed from the node coordinates on the fly. */
  distanceKm: number | null;
  estimatedDurationMinutes: number | null;
  seasonal: boolean;
  notes: string | null;
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
}

/** One point of the trail geometry; `nodeId` is set for named anchors. */
export interface RoutePointDto {
  latitude: number;
  longitude: number;
  elevationMeters: number | null;
  nodeId: string | null;
}

export interface TrailRouteDto {
  id: string;
  destinationId: string;
  name: string;
  description: string | null;
  basecampNodeId: string | null;
  nodeIds: string[];
  segmentIds: string[];
  points: RoutePointDto[];
  surface: string;
  grade: RouteGrade;
  traversableBy: string[];
  difficulty: Difficulty;
  recommended: boolean;
  status: TrailRouteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  nodeId: string;
  name: string;
  type: TrackNodeType | "belokan";
}

export interface RouteProfileDto {
  routeId: string;
  points: ElevationPoint[];
  totalDistanceKm: number;
  totalGainMeters: number;
  totalLossMeters: number;
  maxElevationMeters: number;
  minElevationMeters: number;
  steepestGradePercent: number;
  estimatedDurationMinutes: number;
}

export type PublicRouteProfileDto = Omit<RouteProfileDto,
  "points" | "totalGainMeters" | "totalLossMeters" | "maxElevationMeters" |
  "minElevationMeters" | "steepestGradePercent" | "estimatedDurationMinutes"
> & {
  points: (Omit<ElevationPoint, "elevationMeters"> & { elevationMeters: number | null })[];
  totalGainMeters: number | null;
  totalLossMeters: number | null;
  maxElevationMeters: number | null;
  minElevationMeters: number | null;
  steepestGradePercent: number | null;
  estimatedDurationMinutes: number | null;
  elevationAvailable: boolean;
  elevationEstimated: boolean;
};

export interface RouteGraph {
  nodes: TrackNodeDto[];
  segments: RouteSegmentDto[];
  routes: TrailRouteDto[];
}

// --- DTOs -----------------------------------------------------------------

export interface CreateTrackNodeDto {
  name: string;
  type: TrackNodeType;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  notes?: string | null;
  imageUrl?: string | null;
}

export type UpdateTrackNodeDto = Partial<CreateTrackNodeDto>;

export interface CreateRouteSegmentDto {
  fromNodeId: string;
  toNodeId: string;
  surface?: RouteSurface;
  grade?: RouteGrade;
  traversableBy?: string[];
  bidirectional?: boolean;
  distanceKm?: number | null;
  estimatedDurationMinutes?: number | null;
  seasonal?: boolean;
  notes?: string | null;
  status?: RouteStatus;
}

export type UpdateRouteSegmentDto = Omit<
  Partial<CreateRouteSegmentDto>,
  "fromNodeId" | "toNodeId"
>;

export interface RoutePointInput {
  latitude: number;
  longitude: number;
  elevationMeters?: number | null;
  nodeId?: string | null;
}

export interface CreateTrailRouteDto {
  name: string;
  description?: string | null;
  basecampNodeId?: string | null;
  /** Explicit geometry; takes precedence over `nodeIds`. */
  points?: RoutePointInput[];
  /** Legacy input: anchors only, converted into points. */
  nodeIds?: string[];
  surface?: string;
  grade?: RouteGrade;
  traversableBy?: string[];
  difficulty?: Difficulty;
  recommended?: boolean;
  status?: TrailRouteStatus;
}

export type UpdateTrailRouteDto = Partial<CreateTrailRouteDto>;

// --- Mappers ---------------------------------------------------------------

const toNumber = (value: string | null): number | null =>
  value === null ? null : Number(value);

const toNumeric = (value: number | null | undefined): string | null =>
  value === null || value === undefined ? null : String(value);

const nodeCoordinate = (node: TrackNodeRow): Coordinate => ({
  latitude: Number(node.latitude),
  longitude: Number(node.longitude),
});

function toNodeDto(row: TrackNodeRow): TrackNodeDto {
  return {
    id: row.id,
    destinationId: row.destinationId,
    name: row.name,
    type: row.type,
    coordinate: nodeCoordinate(row),
    elevationMeters: row.elevationMeters,
    notes: row.notes,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toSegmentDto(row: RouteSegmentRow): RouteSegmentDto {
  return {
    id: row.id,
    destinationId: row.destinationId,
    fromNodeId: row.fromNodeId,
    toNodeId: row.toNodeId,
    surface: row.surface,
    grade: row.grade,
    traversableBy: row.traversableBy,
    bidirectional: row.bidirectional,
    distanceKm: toNumber(row.distanceKm),
    estimatedDurationMinutes: row.estimatedDurationMinutes,
    seasonal: row.seasonal,
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const toPointDto = (row: {
  latitude: string | number;
  longitude: string | number;
  elevationMeters: number | null;
  nodeId: string | null;
}): RoutePointDto => ({
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  elevationMeters: row.elevationMeters,
  nodeId: row.nodeId,
});

function toRouteDto(
  row: TrailRouteRow,
  nodeIds: string[],
  segmentIds: string[],
  points: RoutePointDto[],
): TrailRouteDto {
  return {
    id: row.id,
    destinationId: row.destinationId,
    name: row.name,
    description: row.description,
    basecampNodeId: row.basecampNodeId,
    nodeIds,
    segmentIds,
    points,
    surface: row.surface,
    grade: row.grade,
    traversableBy: row.traversableBy,
    difficulty: row.difficulty,
    recommended: row.recommended,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Distance of a segment: stored override, otherwise haversine. */
function segmentDistanceKm(
  segment: RouteSegmentRow,
  nodes: Map<string, TrackNodeRow>,
): number {
  if (segment.distanceKm !== null) return Number(segment.distanceKm);

  const from = nodes.get(segment.fromNodeId);
  const to = nodes.get(segment.toNodeId);
  if (!from || !to) return 0;

  return haversineKm(nodeCoordinate(from), nodeCoordinate(to));
}

function buildProfile(
  routeId: string,
  nodeIds: string[],
  segments: RouteSegmentRow[],
  nodes: Map<string, TrackNodeRow>,
): RouteProfileDto {
  const orderedNodes = nodeIds
    .map((id) => nodes.get(id))
    .filter((node): node is TrackNodeRow => Boolean(node));

  const points: ElevationPoint[] = [];
  let cumulative = 0;

  orderedNodes.forEach((node, index) => {
    if (index > 0) {
      const segment = segments[index - 1];
      if (segment) cumulative += segmentDistanceKm(segment, nodes);
    }
    points.push({
      distanceKm: Number(cumulative.toFixed(2)),
      elevationMeters: node.elevationMeters,
      nodeId: node.id,
      name: node.name,
      type: node.type,
    });
  });

  const elevations = orderedNodes.map((node) => node.elevationMeters);
  const { gain, loss } = elevationGainLoss(elevations);

  let steepestGrade = 0;
  orderedNodes.forEach((node, index) => {
    if (index === 0) return;
    const previous = orderedNodes[index - 1];
    const segment = segments[index - 1];
    if (!previous || !segment) return;

    const grade = gradePercent(
      node.elevationMeters - previous.elevationMeters,
      segmentDistanceKm(segment, nodes),
    );
    steepestGrade = Math.max(steepestGrade, grade);
  });

  const totalDistanceKm = Number(cumulative.toFixed(2));
  const allDurations = segments.every(
    (segment) => segment.estimatedDurationMinutes !== null,
  );
  const estimatedDurationMinutes =
    segments.length > 0 && allDurations
      ? segments.reduce(
          (total, segment) => total + (segment.estimatedDurationMinutes ?? 0),
          0,
        )
      : naismithMinutes(totalDistanceKm, gain);

  return {
    routeId,
    points,
    totalDistanceKm,
    totalGainMeters: gain,
    totalLossMeters: loss,
    maxElevationMeters: elevations.length ? Math.max(...elevations) : 0,
    minElevationMeters: elevations.length ? Math.min(...elevations) : 0,
    steepestGradePercent: steepestGrade,
    estimatedDurationMinutes,
  };
}

/**
 * Build the profile from free geometry points. Elevations missing on bends are
 * interpolated between the nearest known elevations so the chart stays smooth.
 */
function buildPointProfile(
  routeId: string,
  rows: TrailRoutePointRow[],
  nodes: Map<string, TrackNodeRow>,
): RouteProfileDto {
  const resolved = rows.map((row) => {
    const node = row.nodeId ? nodes.get(row.nodeId) : undefined;
    return {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      elevation: row.elevationMeters ?? node?.elevationMeters ?? null,
      nodeId: row.nodeId ?? "",
      name: node?.name ?? "",
      type: (node?.type ?? "belokan") as TrackNodeType | "belokan",
    };
  });

  const distances: number[] = [];
  let cumulative = 0;
  resolved.forEach((point, index) => {
    if (index > 0) {
      const previous = resolved[index - 1]!;
      cumulative += haversineKm(
        { latitude: previous.latitude, longitude: previous.longitude },
        { latitude: point.latitude, longitude: point.longitude },
      );
    }
    distances.push(cumulative);
  });

  const known = resolved
    .map((point, index) => (point.elevation !== null ? index : -1))
    .filter((index) => index >= 0);

  resolved.forEach((point, index) => {
    if (point.elevation !== null) return;

    if (known.length === 0) {
      point.elevation = 0;
      return;
    }

    const previousKnown = [...known].reverse().find((value) => value < index);
    const nextKnown = known.find((value) => value > index);

    if (previousKnown !== undefined && nextKnown !== undefined) {
      const start = resolved[previousKnown]!;
      const end = resolved[nextKnown]!;
      const startDistance = distances[previousKnown]!;
      const endDistance = distances[nextKnown]!;
      const ratio =
        endDistance === startDistance
          ? 0
          : (distances[index]! - startDistance) / (endDistance - startDistance);
      point.elevation = Math.round(
        start.elevation! + (end.elevation! - start.elevation!) * ratio,
      );
      return;
    }

    const nearest = previousKnown ?? nextKnown!;
    point.elevation = resolved[nearest]!.elevation!;
  });

  const elevations = resolved.map((point) => point.elevation ?? 0);
  const { gain, loss } = elevationGainLoss(elevations);

  let steepestGrade = 0;
  for (let index = 1; index < resolved.length; index += 1) {
    const delta = elevations[index]! - elevations[index - 1]!;
    const distance = distances[index]! - distances[index - 1]!;
    steepestGrade = Math.max(steepestGrade, gradePercent(delta, distance));
  }

  const points: ElevationPoint[] = resolved.map((point, index) => ({
    distanceKm: Number(distances[index]!.toFixed(2)),
    elevationMeters: point.elevation ?? 0,
    nodeId: point.nodeId,
    name: point.name || `Belokan ${index + 1}`,
    type: point.type,
  }));

  const totalDistanceKm = Number((distances.at(-1) ?? 0).toFixed(2));

  return {
    routeId,
    points,
    totalDistanceKm,
    totalGainMeters: gain,
    totalLossMeters: loss,
    maxElevationMeters: elevations.length ? Math.max(...elevations) : 0,
    minElevationMeters: elevations.length ? Math.min(...elevations) : 0,
    steepestGradePercent: steepestGrade,
    estimatedDurationMinutes: naismithMinutes(totalDistanceKm, gain),
  };
}

// --- Service ---------------------------------------------------------------

async function ensureDestination(destinationId: string, publicRead = false): Promise<void> {
  const destination = await destinationRepository.findById(destinationId);
  if (!destination || (publicRead && destination.status !== "published")) {
    throw new NotFoundError("Destinasi tidak ditemukan");
  }
}

async function loadNodesById(ids: string[]): Promise<Map<string, TrackNodeRow>> {
  const rows = await routeRepository.findNodesByIds([...new Set(ids)]);
  return new Map(rows.map((row) => [row.id, row]));
}

function derivedPointsFromNodes(
  nodeIds: string[],
  nodes: Map<string, TrackNodeRow>,
): RoutePointDto[] {
  return nodeIds
    .map((id) => nodes.get(id))
    .filter((node): node is TrackNodeRow => Boolean(node))
    .map((node) => ({
      latitude: Number(node.latitude),
      longitude: Number(node.longitude),
      elevationMeters: node.elevationMeters,
      nodeId: node.id,
    }));
}

async function routeDto(row: TrailRouteRow): Promise<TrailRouteDto> {
  const [nodeIds, segmentIds, pointRows] = await Promise.all([
    routeRepository.findRouteNodeIds(row.id),
    routeRepository.findRouteSegmentIds(row.id),
    routeRepository.findRoutePoints(row.id),
  ]);

  // Legacy routes created before free geometry: derive points from anchors.
  if (pointRows.length < 2 && nodeIds.length >= 2) {
    const nodes = await loadNodesById(nodeIds);
    return toRouteDto(
      row,
      nodeIds,
      segmentIds,
      derivedPointsFromNodes(nodeIds, nodes),
    );
  }

  return toRouteDto(row, nodeIds, segmentIds, pointRows.map(toPointDto));
}

interface ResolvedRoute {
  points: RoutePointDto[];
  nodeIds: string[];
  segmentIds: string[];
}

/**
 * Validate geometry points, resolve node anchors and create the segment
 * metadata between consecutive anchors (free bends have no segment).
 */
async function resolveRoutePoints(
  destinationId: string,
  input: Pick<CreateTrailRouteDto, "points" | "nodeIds">,
): Promise<ResolvedRoute> {
  let points: RoutePointDto[] = [];

  if (input.points && input.points.length > 0) {
    points = input.points.map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
      elevationMeters: point.elevationMeters ?? null,
      nodeId: point.nodeId ?? null,
    }));
  } else if (input.nodeIds && input.nodeIds.length > 0) {
    const nodes = await loadNodesById(input.nodeIds);
    points = derivedPointsFromNodes(input.nodeIds, nodes);
  }

  if (points.length < 2) {
    throw new BadRequestError("Jalur minimal terdiri dari dua titik");
  }
  if (points.length > 200) {
    throw new BadRequestError("Jalur maksimal terdiri dari 200 titik");
  }

  const anchoredIds = [
    ...new Set(
      points
        .map((point) => point.nodeId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (anchoredIds.length > 0) {
    const nodes = await loadNodesById(anchoredIds);
    for (const nodeId of anchoredIds) {
      const node = nodes.get(nodeId);
      if (!node) throw new BadRequestError("Titik jalur tidak ditemukan");
      if (node.destinationId !== destinationId) {
        throw new BadRequestError("Semua titik harus milik destinasi yang sama");
      }
    }
  }

  const nodeIds = points
    .map((point) => point.nodeId)
    .filter((id): id is string => Boolean(id));

  const segmentIds: string[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const fromNodeId = points[index - 1]!.nodeId;
    const toNodeId = points[index]!.nodeId;
    if (!fromNodeId || !toNodeId || fromNodeId === toNodeId) continue;

    let segment = await routeRepository.findSegmentBetween(
      destinationId,
      fromNodeId,
      toNodeId,
    );
    if (!segment) {
      segment = await routeRepository.createSegment({
        destinationId,
        fromNodeId,
        toNodeId,
        surface: "setapak",
        grade: "sedang",
        bidirectional: true,
      });
    }
    segmentIds.push(segment.id);
  }

  return { points, nodeIds, segmentIds };
}

function pointsToRows(
  routeId: string,
  points: RoutePointDto[],
): TrailRoutePointRow[] {
  return points.map((point, position) => ({
    routeId,
    position,
    latitude: String(point.latitude),
    longitude: String(point.longitude),
    elevationMeters: point.elevationMeters,
    nodeId: point.nodeId,
  }));
}

async function persistGeometry(
  routeId: string,
  points: RoutePointDto[],
  nodeIds: string[],
  segmentIds: string[],
): Promise<void> {
  await routeRepository.replaceRouteNodes(routeId, nodeIds);
  await routeRepository.replaceRouteSegments(routeId, segmentIds);
  await routeRepository.replaceRoutePoints(
    routeId,
    points.map((point) => ({
      latitude: String(point.latitude),
      longitude: String(point.longitude),
      elevationMeters: point.elevationMeters,
      nodeId: point.nodeId,
    })),
  );
}

export const routeService = {
  async graph(destinationId: string, publicRead = false): Promise<RouteGraph> {
    await ensureDestination(destinationId, publicRead);

    const [nodes, segments, routes] = await Promise.all([
      routeRepository.listNodes(destinationId),
      routeRepository.listSegments(destinationId),
      routeRepository.listRoutes(destinationId),
    ]);

    return {
      nodes: nodes.map(toNodeDto),
      segments: segments.map(toSegmentDto),
      routes: await Promise.all(routes.map((row) => routeDto(row))),
    };
  },

  // --- Nodes ---------------------------------------------------------------

  async listNodes(destinationId: string): Promise<TrackNodeDto[]> {
    await ensureDestination(destinationId);
    const rows = await routeRepository.listNodes(destinationId);
    return rows.map(toNodeDto);
  },

  async createNode(
    destinationId: string,
    input: CreateTrackNodeDto,
  ): Promise<TrackNodeDto> {
    await ensureDestination(destinationId);

    const row = await routeRepository.createNode({
      destinationId,
      name: input.name,
      type: input.type,
      latitude: toNumeric(input.latitude)!,
      longitude: toNumeric(input.longitude)!,
      elevationMeters: input.elevationMeters,
      notes: input.notes ?? null,
      imageUrl: input.imageUrl ?? null,
    });

    return toNodeDto(row);
  },

  async updateNode(
    id: string,
    input: UpdateTrackNodeDto,
  ): Promise<TrackNodeDto> {
    const node = await routeRepository.findNodeById(id);
    if (!node) throw new NotFoundError("Titik tidak ditemukan");

    const patch: Parameters<typeof routeRepository.updateNode>[1] = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.type !== undefined) patch.type = input.type;
    if (input.latitude !== undefined) patch.latitude = toNumeric(input.latitude)!;
    if (input.longitude !== undefined) {
      patch.longitude = toNumeric(input.longitude)!;
    }
    if (input.elevationMeters !== undefined) {
      patch.elevationMeters = input.elevationMeters;
    }
    if (input.notes !== undefined) patch.notes = input.notes;
    if (input.imageUrl !== undefined) patch.imageUrl = input.imageUrl;

    const updated = await routeRepository.updateNode(id, patch);
    if (!updated) throw new NotFoundError("Titik tidak ditemukan");

    // Remove the previous photo when it is replaced or cleared.
    if (
      input.imageUrl !== undefined &&
      node.imageUrl &&
      node.imageUrl !== input.imageUrl
    ) {
      await storageService.deleteByUrl(node.imageUrl).catch(() => undefined);
    }

    return toNodeDto(updated);
  },

  async deleteNode(id: string): Promise<{ id: string; deleted: true }> {
    const node = await routeRepository.findNodeById(id);
    if (!node) throw new NotFoundError("Titik tidak ditemukan");

    const routes = await routeRepository.countNodeRoutes(id);
    if (routes > 0) {
      throw new ConflictError(
        `Titik masih dipakai oleh ${routes} jalur. Hapus jalurnya dulu.`,
      );
    }

    // Segments are metadata between anchors. Deleting the node cascades to
    // them, but only when no other trail still depends on those segments.
    const segments = await routeRepository.findSegmentsForNode(id);
    let usedSegments = 0;
    for (const segment of segments) {
      const used = await routeRepository.countSegmentRoutes(segment.id);
      if (used > 0) usedSegments += 1;
    }
    if (usedSegments > 0) {
      throw new ConflictError(
        `Titik masih terhubung ke ${usedSegments} ruas yang dipakai jalur lain. Hapus ruasnya dulu.`,
      );
    }

    await routeRepository.deleteNode(id);
    if (node.imageUrl) {
      await storageService.deleteByUrl(node.imageUrl).catch(() => undefined);
    }
    return { id, deleted: true };
  },

  // --- Segments ------------------------------------------------------------

  async listSegments(destinationId: string): Promise<RouteSegmentDto[]> {
    await ensureDestination(destinationId);
    const rows = await routeRepository.listSegments(destinationId);
    return rows.map(toSegmentDto);
  },

  async createSegment(
    destinationId: string,
    input: CreateRouteSegmentDto,
  ): Promise<RouteSegmentDto> {
    await ensureDestination(destinationId);

    if (input.fromNodeId === input.toNodeId) {
      throw new BadRequestError("Ruas harus menghubungkan dua titik berbeda");
    }

    const nodes = await loadNodesById([input.fromNodeId, input.toNodeId]);
    const from = nodes.get(input.fromNodeId);
    const to = nodes.get(input.toNodeId);
    if (!from || !to) throw new BadRequestError("Titik ruas tidak ditemukan");
    if (
      from.destinationId !== destinationId ||
      to.destinationId !== destinationId
    ) {
      throw new BadRequestError("Semua titik harus milik destinasi yang sama");
    }

    const existing = await routeRepository.findSegmentBetween(
      destinationId,
      input.fromNodeId,
      input.toNodeId,
    );
    if (existing) {
      throw new ConflictError("Ruas untuk pasangan titik ini sudah ada");
    }

    const row = await routeRepository.createSegment({
      destinationId,
      fromNodeId: input.fromNodeId,
      toNodeId: input.toNodeId,
      surface: input.surface ?? "setapak",
      grade: input.grade ?? "sedang",
      traversableBy: input.traversableBy ?? [],
      bidirectional: input.bidirectional ?? true,
      distanceKm: toNumeric(input.distanceKm),
      estimatedDurationMinutes: input.estimatedDurationMinutes ?? null,
      seasonal: input.seasonal ?? false,
      notes: input.notes ?? null,
      status: input.status ?? "draft",
    });

    return toSegmentDto(row);
  },

  async updateSegment(
    id: string,
    input: UpdateRouteSegmentDto,
  ): Promise<RouteSegmentDto> {
    const segment = await routeRepository.findSegmentById(id);
    if (!segment) throw new NotFoundError("Ruas tidak ditemukan");

    const patch: Parameters<typeof routeRepository.updateSegment>[1] = {};
    if (input.surface !== undefined) patch.surface = input.surface;
    if (input.grade !== undefined) patch.grade = input.grade;
    if (input.traversableBy !== undefined) {
      patch.traversableBy = input.traversableBy;
    }
    if (input.bidirectional !== undefined) {
      patch.bidirectional = input.bidirectional;
    }
    if (input.distanceKm !== undefined) {
      patch.distanceKm = toNumeric(input.distanceKm);
    }
    if (input.estimatedDurationMinutes !== undefined) {
      patch.estimatedDurationMinutes = input.estimatedDurationMinutes;
    }
    if (input.seasonal !== undefined) patch.seasonal = input.seasonal;
    if (input.notes !== undefined) patch.notes = input.notes;
    if (input.status !== undefined) patch.status = input.status;

    const updated = await routeRepository.updateSegment(id, patch);
    if (!updated) throw new NotFoundError("Ruas tidak ditemukan");
    return toSegmentDto(updated);
  },

  async deleteSegment(id: string): Promise<{ id: string; deleted: true }> {
    const segment = await routeRepository.findSegmentById(id);
    if (!segment) throw new NotFoundError("Ruas tidak ditemukan");

    const routes = await routeRepository.countSegmentRoutes(id);
    if (routes > 0) {
      throw new ConflictError(
        `Ruas masih dipakai oleh ${routes} jalur. Hapus jalurnya dulu.`,
      );
    }

    await routeRepository.deleteSegment(id);
    return { id, deleted: true };
  },

  // --- Routes --------------------------------------------------------------

  async listRoutes(destinationId: string): Promise<TrailRouteDto[]> {
    await ensureDestination(destinationId);
    const rows = await routeRepository.listRoutes(destinationId);
    return Promise.all(rows.map((row) => routeDto(row)));
  },

  async getRoute(id: string): Promise<TrailRouteDto> {
    const row = await routeRepository.findRouteById(id);
    if (!row) throw new NotFoundError("Jalur tidak ditemukan");
    return routeDto(row);
  },

  async createRoute(
    destinationId: string,
    input: CreateTrailRouteDto,
  ): Promise<TrailRouteDto> {
    await ensureDestination(destinationId);

    if (input.basecampNodeId) {
      const basecamp = await routeRepository.findNodeById(input.basecampNodeId);
      if (!basecamp || basecamp.destinationId !== destinationId) {
        throw new BadRequestError("Basecamp harus titik di destinasi ini");
      }
    }

    const resolved = await resolveRoutePoints(destinationId, input);
    const nodes = await loadNodesById(resolved.nodeIds);
    const previewRows = pointsToRows("preview", resolved.points);
    const profile = buildPointProfile("preview", previewRows, nodes);

    const row = await routeRepository.createRoute({
      destinationId,
      name: input.name,
      description: input.description ?? null,
      basecampNodeId: input.basecampNodeId ?? null,
      surface: input.surface ?? "campuran",
      grade: input.grade ?? "sedang",
      traversableBy: input.traversableBy ?? [],
      difficulty:
        input.difficulty ??
        difficultyFromEffort(
          profile.totalDistanceKm,
          profile.totalGainMeters,
          profile.steepestGradePercent,
        ),
      recommended: input.recommended ?? false,
      status: input.status ?? "terverifikasi",
    });

    await persistGeometry(
      row.id,
      resolved.points,
      resolved.nodeIds,
      resolved.segmentIds,
    );

    return routeDto(row);
  },

  async updateRoute(
    id: string,
    input: UpdateTrailRouteDto,
  ): Promise<TrailRouteDto> {
    const route = await routeRepository.findRouteById(id);
    if (!route) throw new NotFoundError("Jalur tidak ditemukan");

    const patch: Parameters<typeof routeRepository.updateRoute>[1] = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.basecampNodeId !== undefined) {
      patch.basecampNodeId = input.basecampNodeId;
    }
    if (input.surface !== undefined) patch.surface = input.surface;
    if (input.grade !== undefined) patch.grade = input.grade;
    if (input.traversableBy !== undefined) {
      patch.traversableBy = input.traversableBy;
    }
    if (input.difficulty !== undefined) patch.difficulty = input.difficulty;
    if (input.recommended !== undefined) patch.recommended = input.recommended;
    if (input.status !== undefined) patch.status = input.status;

    const hasGeometry =
      (input.points && input.points.length > 0) ||
      (input.nodeIds && input.nodeIds.length > 0);

    const resolved = hasGeometry
      ? await resolveRoutePoints(route.destinationId, input)
      : null;

    const updated = await routeRepository.updateRoute(id, patch);
    if (!updated) throw new NotFoundError("Jalur tidak ditemukan");

    if (resolved) {
      await persistGeometry(
        id,
        resolved.points,
        resolved.nodeIds,
        resolved.segmentIds,
      );
    }

    return routeDto(updated);
  },

  async deleteRoute(id: string): Promise<{ id: string; deleted: true }> {
    const route = await routeRepository.findRouteById(id);
    if (!route) throw new NotFoundError("Jalur tidak ditemukan");

    const segmentIds = await routeRepository.findRouteSegmentIds(id);
    await routeRepository.deleteRoute(id);

    // Drop segments that were only used by this trail so the map stays clean
    // and their nodes become deletable again.
    for (const segmentId of segmentIds) {
      const used = await routeRepository.countSegmentRoutes(segmentId);
      if (used === 0) await routeRepository.deleteSegment(segmentId);
    }

    return { id, deleted: true };
  },

  async profile(id: string, publicRead = false): Promise<RouteProfileDto | PublicRouteProfileDto> {
    const route = await routeRepository.findRouteById(id);
    if (!route) throw new NotFoundError("Jalur tidak ditemukan");
    if (publicRead) await ensureDestination(route.destinationId, true);

    const [nodeIds, segmentIds, pointRows] = await Promise.all([
      routeRepository.findRouteNodeIds(id),
      routeRepository.findRouteSegmentIds(id),
      routeRepository.findRoutePoints(id),
    ]);

    const nodes = await loadNodesById(nodeIds);

    const publicProfile = (profile: RouteProfileDto): PublicRouteProfileDto => {
      const elevations = pointRows.length >= 2
        ? pointRows.map((point) => point.elevationMeters ??
            (point.nodeId ? nodes.get(point.nodeId)?.elevationMeters : null) ?? null)
        : profile.points.map((point) => point.elevationMeters);
      const elevationAvailable = elevations.some((elevation) => elevation !== null);
      return {
        ...profile,
        elevationAvailable,
        elevationEstimated: elevationAvailable && elevations.some((elevation) => elevation === null),
        ...(!elevationAvailable ? {
          points: profile.points.map((point) => ({ ...point, elevationMeters: null })),
          totalGainMeters: null,
          totalLossMeters: null,
          maxElevationMeters: null,
          minElevationMeters: null,
          steepestGradePercent: null,
          estimatedDurationMinutes: null,
        } : {}),
      };
    };
    if (pointRows.length >= 2) {
      const profile = buildPointProfile(id, pointRows, nodes);
      return publicRead ? publicProfile(profile) : profile;
    }

    const segments = (
      await Promise.all(
        segmentIds.map((segmentId) =>
          routeRepository.findSegmentById(segmentId),
        ),
      )
    ).filter((row): row is RouteSegmentRow => Boolean(row));

    const profile = buildProfile(id, nodeIds, segments, nodes);
    return publicRead ? publicProfile(profile) : profile;
  },
};
