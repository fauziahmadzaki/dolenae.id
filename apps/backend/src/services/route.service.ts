import type {
  Difficulty,
  RouteGrade,
  RouteSegmentRow,
  RouteStatus,
  RouteSurface,
  TrackNodeRow,
  TrackNodeType,
  TrailRouteRow,
} from "../db/schema";
import { destinationRepository } from "../repositories/destination.repository";
import { routeRepository } from "../repositories/route.repository";
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

export interface TrailRouteDto {
  id: string;
  destinationId: string;
  name: string;
  description: string | null;
  basecampNodeId: string | null;
  nodeIds: string[];
  segmentIds: string[];
  surface: string;
  grade: RouteGrade;
  traversableBy: string[];
  difficulty: Difficulty;
  recommended: boolean;
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  nodeId: string;
  name: string;
  type: TrackNodeType;
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

export interface CreateTrailRouteDto {
  name: string;
  description?: string | null;
  basecampNodeId?: string | null;
  nodeIds: string[];
  surface?: string;
  grade?: RouteGrade;
  traversableBy?: string[];
  difficulty?: Difficulty;
  recommended?: boolean;
  status?: RouteStatus;
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

function toRouteDto(
  row: TrailRouteRow,
  nodeIds: string[],
  segmentIds: string[],
): TrailRouteDto {
  return {
    id: row.id,
    destinationId: row.destinationId,
    name: row.name,
    description: row.description,
    basecampNodeId: row.basecampNodeId,
    nodeIds,
    segmentIds,
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
          (total, segment) =>
            total + (segment.estimatedDurationMinutes ?? 0),
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

// --- Service ---------------------------------------------------------------

async function ensureDestination(destinationId: string): Promise<void> {
  const destination = await destinationRepository.findById(destinationId);
  if (!destination) throw new NotFoundError("Destinasi tidak ditemukan");
}

async function loadNodesById(
  ids: string[],
): Promise<Map<string, TrackNodeRow>> {
  const rows = await routeRepository.findNodesByIds([...new Set(ids)]);
  return new Map(rows.map((row) => [row.id, row]));
}

async function routeDto(row: TrailRouteRow): Promise<TrailRouteDto> {
  const [nodeIds, segmentIds] = await Promise.all([
    routeRepository.findRouteNodeIds(row.id),
    routeRepository.findRouteSegmentIds(row.id),
  ]);
  return toRouteDto(row, nodeIds, segmentIds);
}

/**
 * Validate the ordered route nodes and make sure every consecutive pair has a
 * segment. Missing segments are created with walking defaults.
 */
async function syncRouteSegments(
  destinationId: string,
  nodeIds: string[],
): Promise<string[]> {
  const nodes = await loadNodesById(nodeIds);

  for (const nodeId of nodeIds) {
    const node = nodes.get(nodeId);
    if (!node) throw new BadRequestError("Titik jalur tidak ditemukan");
    if (node.destinationId !== destinationId) {
      throw new BadRequestError("Semua titik harus milik destinasi yang sama");
    }
  }

  for (let index = 1; index < nodeIds.length; index += 1) {
    if (nodeIds[index] === nodeIds[index - 1]) {
      throw new BadRequestError(
        "Titik berurutan tidak boleh sama; tambahkan titik lain di antaranya",
      );
    }
  }

  const segmentIds: string[] = [];

  for (let index = 1; index < nodeIds.length; index += 1) {
    const fromNodeId = nodeIds[index - 1]!;
    const toNodeId = nodeIds[index]!;

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

  return segmentIds;
}

export const routeService = {
  async graph(destinationId: string): Promise<RouteGraph> {
    await ensureDestination(destinationId);

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
    if (input.latitude !== undefined) {
      patch.latitude = toNumeric(input.latitude)!;
    }
    if (input.longitude !== undefined) {
      patch.longitude = toNumeric(input.longitude)!;
    }
    if (input.elevationMeters !== undefined) {
      patch.elevationMeters = input.elevationMeters;
    }
    if (input.notes !== undefined) patch.notes = input.notes;

    const updated = await routeRepository.updateNode(id, patch);
    if (!updated) throw new NotFoundError("Titik tidak ditemukan");
    return toNodeDto(updated);
  },

  async deleteNode(id: string): Promise<{ id: string; deleted: true }> {
    const node = await routeRepository.findNodeById(id);
    if (!node) throw new NotFoundError("Titik tidak ditemukan");

    const [segments, routes] = await Promise.all([
      routeRepository.countNodeSegments(id),
      routeRepository.countNodeRoutes(id),
    ]);
    if (segments > 0) {
      throw new ConflictError(
        `Titik masih dipakai oleh ${segments} ruas. Hapus ruasnya dulu.`,
      );
    }
    if (routes > 0) {
      throw new ConflictError(
        `Titik masih dipakai oleh ${routes} jalur. Hapus jalurnya dulu.`,
      );
    }

    await routeRepository.deleteNode(id);
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

    const nodeIds = [...input.nodeIds];
    if (nodeIds.length < 2) {
      throw new BadRequestError("Jalur minimal terdiri dari dua titik");
    }

    if (input.basecampNodeId) {
      const basecamp = await routeRepository.findNodeById(
        input.basecampNodeId,
      );
      if (!basecamp || basecamp.destinationId !== destinationId) {
        throw new BadRequestError("Basecamp harus titik di destinasi ini");
      }
    }

    const segmentIds = await syncRouteSegments(destinationId, nodeIds);
    const nodes = await loadNodesById(nodeIds);
    const segments = await Promise.all(
      segmentIds.map((segmentId) => routeRepository.findSegmentById(segmentId)),
    );
    const profile = buildProfile(
      "preview",
      nodeIds,
      segments.filter((row): row is RouteSegmentRow => Boolean(row)),
      nodes,
    );

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
      status: input.status ?? "draft",
    });

    await routeRepository.replaceRouteNodes(row.id, nodeIds);
    await routeRepository.replaceRouteSegments(row.id, segmentIds);

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
    if (input.description !== undefined) {
      patch.description = input.description;
    }
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

    let segmentIds: string[] | undefined;
    if (input.nodeIds !== undefined) {
      const nodeIds = [...new Set(input.nodeIds)];
      if (nodeIds.length < 2) {
        throw new BadRequestError("Jalur minimal terdiri dari dua titik");
      }
      segmentIds = await syncRouteSegments(route.destinationId, nodeIds);
    }

    const updated = await routeRepository.updateRoute(id, patch);
    if (!updated) throw new NotFoundError("Jalur tidak ditemukan");

    if (input.nodeIds !== undefined && segmentIds) {
      await routeRepository.replaceRouteNodes(id, input.nodeIds);
      await routeRepository.replaceRouteSegments(id, segmentIds);
    }

    return routeDto(updated);
  },

  async deleteRoute(id: string): Promise<{ id: string; deleted: true }> {
    const route = await routeRepository.findRouteById(id);
    if (!route) throw new NotFoundError("Jalur tidak ditemukan");

    await routeRepository.deleteRoute(id);
    return { id, deleted: true };
  },

  async profile(id: string): Promise<RouteProfileDto> {
    const route = await routeRepository.findRouteById(id);
    if (!route) throw new NotFoundError("Jalur tidak ditemukan");

    const [nodeIds, segmentIds] = await Promise.all([
      routeRepository.findRouteNodeIds(id),
      routeRepository.findRouteSegmentIds(id),
    ]);
    const nodes = await loadNodesById(nodeIds);
    const segments = (
      await Promise.all(
        segmentIds.map((segmentId) =>
          routeRepository.findSegmentById(segmentId),
        ),
      )
    ).filter((row): row is RouteSegmentRow => Boolean(row));

    return buildProfile(id, nodeIds, segments, nodes);
  },
};
