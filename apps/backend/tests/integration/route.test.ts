import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../../src/db/client", () => ({
  pingDatabase: vi.fn().mockResolvedValue(true),
  closeDatabase: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn(),
  getPool: vi.fn(),
}));

vi.mock("../../src/repositories/destination.repository", () => ({
  destinationRepository: { findById: vi.fn() },
}));

vi.mock("../../src/services/storage.service", () => ({
  storageService: { deleteByUrl: vi.fn().mockResolvedValue({ deleted: true }) },
}));

vi.mock("../../src/repositories/route.repository", () => ({
  routeRepository: {
    listNodes: vi.fn(),
    findNodeById: vi.fn(),
    findNodesByIds: vi.fn(),
    createNode: vi.fn(),
    updateNode: vi.fn(),
    deleteNode: vi.fn(),
    countNodeSegments: vi.fn(),
    findSegmentsForNode: vi.fn(),
    countNodeRoutes: vi.fn(),
    listSegments: vi.fn(),
    findSegmentById: vi.fn(),
    findSegmentBetween: vi.fn(),
    createSegment: vi.fn(),
    updateSegment: vi.fn(),
    deleteSegment: vi.fn(),
    countSegmentRoutes: vi.fn(),
    listRoutes: vi.fn(),
    findRouteById: vi.fn(),
    createRoute: vi.fn(),
    updateRoute: vi.fn(),
    deleteRoute: vi.fn(),
    findRouteNodeIds: vi.fn(),
    findRouteSegmentIds: vi.fn(),
    findRoutePoints: vi.fn(),
    replaceRouteNodes: vi.fn(),
    replaceRouteSegments: vi.fn(),
    replaceRoutePoints: vi.fn(),
  },
}));

import { createApp } from "../../src/app";
import { destinationRepository } from "../../src/repositories/destination.repository";
import { routeRepository } from "../../src/repositories/route.repository";
import { storageService } from "../../src/services/storage.service";
import { signAccessToken } from "../../src/utils/jwt";

const app = createApp();

const adminId = "87654321-4321-4321-a321-1234567890ab";
const destinationId = "22222222-2222-4222-a222-222222222222";
const nodeAId = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const nodeBId = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
const segmentId = "cccccccc-cccc-4ccc-cccc-cccccccccccc";
const routeId = "dddddddd-dddd-4ddd-dddd-dddddddddddd";

const now = new Date("2026-10-21T00:00:00Z");

const destinationRow = {
  id: destinationId,
  name: "Gunung Bromo",
  slug: "gunung-bromo",
};

const nodeA = {
  id: nodeAId,
  destinationId,
  name: "Cemoro Lawang",
  type: "basecamp" as const,
  latitude: "-7.9425000",
  longitude: "112.9530000",
  elevationMeters: 2200,
  notes: null,
  imageUrl: null,
  createdAt: now,
  updatedAt: now,
};

const nodeB = {
  ...nodeA,
  id: nodeBId,
  name: "Penanjakan 1",
  type: "viewpoint" as const,
  latitude: "-7.9500000",
  longitude: "112.9600000",
  elevationMeters: 2770,
};

const segmentRow = {
  id: segmentId,
  destinationId,
  fromNodeId: nodeAId,
  toNodeId: nodeBId,
  surface: "aspal" as const,
  grade: "terjal" as const,
  traversableBy: ["jeep"],
  bidirectional: true,
  distanceKm: null,
  estimatedDurationMinutes: null,
  seasonal: false,
  notes: null,
  status: "draft" as const,
  createdAt: now,
  updatedAt: now,
};

const routeRow = {
  id: routeId,
  destinationId,
  name: "Jeep Sunrise",
  description: null,
  basecampNodeId: nodeAId,
  surface: "aspal",
  grade: "terjal" as const,
  traversableBy: ["jeep"],
  difficulty: "menengah" as const,
  recommended: true,
  status: "terverifikasi" as const,
  createdAt: now,
  updatedAt: now,
};

let token = "";

beforeAll(async () => {
  token = await signAccessToken({
    sub: adminId,
    email: "admin@dolenae.id",
    role: "admin",
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(destinationRepository.findById).mockResolvedValue(
    destinationRow as never,
  );
  vi.mocked(routeRepository.findNodesByIds).mockResolvedValue([nodeA, nodeB]);
  vi.mocked(routeRepository.findNodeById).mockResolvedValue(nodeA);
  vi.mocked(routeRepository.listNodes).mockResolvedValue([nodeA, nodeB]);
  vi.mocked(routeRepository.listSegments).mockResolvedValue([segmentRow]);
  vi.mocked(routeRepository.listRoutes).mockResolvedValue([routeRow]);
  vi.mocked(routeRepository.findRouteNodeIds).mockResolvedValue([
    nodeAId,
    nodeBId,
  ]);
  vi.mocked(routeRepository.findRouteSegmentIds).mockResolvedValue([segmentId]);
  vi.mocked(routeRepository.findRoutePoints).mockResolvedValue([]);
  vi.mocked(routeRepository.replaceRoutePoints).mockResolvedValue(undefined);
  vi.mocked(routeRepository.findSegmentsForNode).mockResolvedValue([segmentRow]);
  vi.mocked(routeRepository.countSegmentRoutes).mockResolvedValue(0);
  vi.mocked(routeRepository.countNodeRoutes).mockResolvedValue(0);
  vi.mocked(routeRepository.findSegmentById).mockResolvedValue(segmentRow);
  vi.mocked(routeRepository.createSegment).mockResolvedValue(segmentRow);
  vi.mocked(routeRepository.createRoute).mockResolvedValue(routeRow);
  vi.mocked(routeRepository.createNode).mockResolvedValue(nodeA);
});

describe("Public route API", () => {
  beforeEach(() => {
    vi.mocked(destinationRepository.findById).mockResolvedValue({
      ...destinationRow, status: "published",
    } as never);
    vi.mocked(routeRepository.findRouteById).mockResolvedValue(routeRow);
  });

  it.each(["draft", "archived", undefined])("hides %s parents from anonymous and admin public reads", async (status) => {
    vi.mocked(destinationRepository.findById).mockResolvedValue(status ? { ...destinationRow, status } as never : undefined);
    for (const path of [`/api/public/destinations/${destinationId}/route-graph`, `/api/public/routes/${routeId}/profile`]) {
      for (const admin of [false, true]) {
        const req = request(app).get(path).query({ destinationId, preview: true });
        if (admin) req.auth(token, { type: "bearer" });
        const res = await req;
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
      }
    }
    expect(routeRepository.listNodes).not.toHaveBeenCalled();
    expect(routeRepository.findRoutePoints).not.toHaveBeenCalled();
  });

  it("checks profile parent from stored route, not client destination", async () => {
    const privateParent = "11111111-1111-4111-a111-111111111111";
    vi.mocked(routeRepository.findRouteById).mockResolvedValue({ ...routeRow, destinationId: privateParent });
    vi.mocked(destinationRepository.findById).mockImplementation(async (id) => ({ ...destinationRow, status: id === destinationId ? "published" : "draft" }) as never);
    const res = await request(app).get(`/api/public/routes/${routeId}/profile`).query({ destinationId });
    expect(res.status).toBe(404);
    expect(destinationRepository.findById).toHaveBeenCalledWith(privateParent);
  });

  it("returns 404 for missing route", async () => {
    vi.mocked(routeRepository.findRouteById).mockResolvedValue(undefined);
    expect((await request(app).get(`/api/public/routes/${routeId}/profile`)).status).toBe(404);
    expect(destinationRepository.findById).not.toHaveBeenCalled();
  });

  it.each(["/api/public/destinations/not-a-uuid/route-graph", "/api/public/routes/not-a-uuid/profile"])("validates UUID on %s", async (path) => {
    expect((await request(app).get(path)).status).toBe(422);
    expect(destinationRepository.findById).not.toHaveBeenCalled();
    expect(routeRepository.findRouteById).not.toHaveBeenCalled();
  });

  it("returns all trail statuses and full ordered geometry including bends", async () => {
    const statuses = ["terverifikasi", "alternatif", "dalam-perbaikan", "rusak", "terlarang"] as const;
    vi.mocked(routeRepository.listRoutes).mockResolvedValue(statuses.map((status) => ({ ...routeRow, status })));
    const points = [["0", "0"], ["0", "0.00003"], ["0.00003", "0.00003"], ["0.00003", "0.00003"]].map(([latitude, longitude], position) => ({
      routeId, position, latitude: latitude!, longitude: longitude!, elevationMeters: null, nodeId: null,
    }));
    vi.mocked(routeRepository.findRoutePoints).mockResolvedValue(points);
    const res = await request(app).get(`/api/public/destinations/${destinationId}/route-graph`).auth("invalid-token", { type: "bearer" });
    expect(res.status).toBe(200);
    expect(res.body.data.routes.map((route: { status: string }) => route.status)).toEqual(statuses);
    expect(res.body.data.routes[0].points).toEqual(points.map(({ latitude, longitude, elevationMeters, nodeId }) => ({ latitude: Number(latitude), longitude: Number(longitude), elevationMeters, nodeId })));
  });

  it("does not grant anonymous access to admin reads or mutations", async () => {
    for (const path of [`/api/destinations/${destinationId}/routes`, `/api/routes/${routeId}`, `/api/routes/${routeId}/profile`]) {
      expect((await request(app).get(path)).status).toBe(401);
    }
    expect((await request(app).post(`/api/destinations/${destinationId}/routes`).send({})).status).toBe(401);
    expect((await request(app).patch(`/api/routes/${routeId}`).send({})).status).toBe(401);
    expect((await request(app).delete(`/api/routes/${routeId}`)).status).toBe(401);
  });

  it("preserves admin route list array and draft preview access", async () => {
    vi.mocked(destinationRepository.findById).mockResolvedValue({ ...destinationRow, status: "draft" } as never);
    const list = await request(app).get(`/api/destinations/${destinationId}/routes`).auth(token, { type: "bearer" });
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect((await request(app).get(`/api/destinations/${destinationId}/route-graph`).auth(token, { type: "bearer" })).status).toBe(200);
    expect((await request(app).get(`/api/routes/${routeId}/profile`).auth(token, { type: "bearer" })).status).toBe(200);
  });

  it("accumulates short bent edges before rounding and keeps duplicates", async () => {
    const coordinates = [[0, 0], [0, 0.00003], [0.00003, 0.00003], [0.00003, 0.00003], [0.00003, 0.00006], [0, 0.00006]];
    vi.mocked(routeRepository.findRoutePoints).mockResolvedValue(coordinates.map(([latitude, longitude], position) => ({
      routeId, position, latitude: String(latitude), longitude: String(longitude), elevationMeters: 100 + position, nodeId: null,
    })));
    const res = await request(app).get(`/api/public/routes/${routeId}/profile`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalDistanceKm).toBe(0.01);
    expect(res.body.data.points).toHaveLength(6);
    expect(res.body.data.points.map((point: { distanceKm: number }) => point.distanceKm)).toEqual([0, 0, 0.01, 0.01, 0.01, 0.01]);
    expect(res.body.data.steepestGradePercent).toBe(30);
  });

  it("interpolates short edges using unrounded cumulative distances", async () => {
    vi.mocked(routeRepository.findRoutePoints).mockResolvedValue([100, null, 200].map((elevationMeters, position) => ({
      routeId, position, latitude: "0", longitude: String(position * 0.00003), elevationMeters, nodeId: null,
    })));
    const res = await request(app).get(`/api/public/routes/${routeId}/profile`);
    expect(res.body.data.points[1].elevationMeters).toBe(150);
  });

  it("does not fabricate elevations when geometry has no elevation data", async () => {
    vi.mocked(routeRepository.findRoutePoints).mockResolvedValue([0, 1].map((position) => ({
      routeId, position, latitude: "0", longitude: String(position / 100),
      elevationMeters: null, nodeId: null,
    })));
    const res = await request(app).get(`/api/public/routes/${routeId}/profile`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ elevationAvailable: false, elevationEstimated: false,
      totalGainMeters: null, totalLossMeters: null, maxElevationMeters: null,
      minElevationMeters: null, steepestGradePercent: null, estimatedDurationMinutes: null });
    expect(res.body.data.points.map((point: { elevationMeters: unknown }) => point.elevationMeters)).toEqual([null, null]);
    const admin = await request(app).get(`/api/routes/${routeId}/profile`).auth(token, { type: "bearer" });
    expect(admin.body.data.points[0].elevationMeters).toBe(0);
    expect(admin.body.data).not.toHaveProperty("elevationAvailable");
  });

  it("marks interpolated elevation as estimated", async () => {
    vi.mocked(routeRepository.findRoutePoints).mockResolvedValue([100, null, 200].map((elevationMeters, position) => ({
      routeId, position, latitude: "0", longitude: String(position / 100), elevationMeters, nodeId: null,
    })));
    const res = await request(app).get(`/api/public/routes/${routeId}/profile`);
    expect(res.body.data).toMatchObject({ elevationAvailable: true, elevationEstimated: true });
    expect(res.body.data.points[1].elevationMeters).toBe(150);
  });

  it("returns public elevation availability without authentication", async () => {
    const res = await request(app).get(`/api/public/routes/${routeId}/profile`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ routeId, elevationAvailable: true, elevationEstimated: false, totalGainMeters: 570 });
  });

  it("returns published destination graph without authentication", async () => {
    const res = await request(app).get(`/api/public/destinations/${destinationId}/route-graph`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.routes[0]).toMatchObject({ id: routeId, points: [
      { latitude: -7.9425, longitude: 112.953, elevationMeters: 2200, nodeId: nodeAId },
      { latitude: -7.95, longitude: 112.96, elevationMeters: 2770, nodeId: nodeBId },
    ] });
  });
});

describe("Route builder API", () => {
  it("requires an admin token", async () => {
    const res = await request(app).get(
      `/api/destinations/${destinationId}/route-graph`,
    );
    expect(res.status).toBe(401);
  });

  it("returns the route graph of a destination", async () => {
    const res = await request(app)
      .get(`/api/destinations/${destinationId}/route-graph`)
      .auth(token, { type: "bearer" });

    expect(res.status).toBe(200);
    expect(res.body.data.nodes).toHaveLength(2);
    expect(res.body.data.segments).toHaveLength(1);
    expect(res.body.data.routes[0]).toMatchObject({
      id: routeId,
      nodeIds: [nodeAId, nodeBId],
      segmentIds: [segmentId],
    });
  });

  it("creates a track node", async () => {
    const res = await request(app)
      .post(`/api/destinations/${destinationId}/track-nodes`)
      .auth(token, { type: "bearer" })
      .send({
        name: "Cemoro Lawang",
        type: "basecamp",
        latitude: -7.9425,
        longitude: 112.953,
        elevationMeters: 2200,
      });

    expect(res.status).toBe(201);
    expect(routeRepository.createNode).toHaveBeenCalledWith(
      expect.objectContaining({ destinationId, name: "Cemoro Lawang" }),
    );
  });

  it("rejects duplicate segments between the same pair", async () => {
    vi.mocked(routeRepository.findSegmentBetween).mockResolvedValue(segmentRow);

    const res = await request(app)
      .post(`/api/destinations/${destinationId}/segments`)
      .auth(token, { type: "bearer" })
      .send({ fromNodeId: nodeAId, toNodeId: nodeBId });

    expect(res.status).toBe(409);
  });

  it("creates a route and auto-creates missing segments", async () => {
    vi.mocked(routeRepository.findSegmentBetween).mockResolvedValue(undefined);
    vi.mocked(routeRepository.findSegmentById).mockResolvedValue(segmentRow);

    const res = await request(app)
      .post(`/api/destinations/${destinationId}/routes`)
      .auth(token, { type: "bearer" })
      .send({ name: "Jeep Sunrise", nodeIds: [nodeAId, nodeBId] });

    expect(res.status).toBe(201);
    expect(routeRepository.createSegment).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationId,
        fromNodeId: nodeAId,
        toNodeId: nodeBId,
      }),
    );
    expect(routeRepository.replaceRouteNodes).toHaveBeenCalledWith(routeId, [
      nodeAId,
      nodeBId,
    ]);
    expect(res.body.data.nodeIds).toEqual([nodeAId, nodeBId]);
  });

  it("computes the elevation profile", async () => {
    vi.mocked(routeRepository.findRouteById).mockResolvedValue(routeRow);

    const res = await request(app)
      .get(`/api/routes/${routeId}/profile`)
      .auth(token, { type: "bearer" });

    expect(res.status).toBe(200);
    expect(res.body.data.totalGainMeters).toBe(570);
    expect(res.body.data.totalLossMeters).toBe(0);
    expect(res.body.data.maxElevationMeters).toBe(2770);
    expect(res.body.data.points).toHaveLength(2);
    expect(res.body.data.totalDistanceKm).toBeGreaterThan(0);
  });

  it("creates a track node with a photo", async () => {
    vi.mocked(routeRepository.createNode).mockResolvedValueOnce({
      ...nodeA,
      imageUrl: "http://localhost:9000/dolenae/nodes/basecamp.png",
    });

    const res = await request(app)
      .post(`/api/destinations/${destinationId}/track-nodes`)
      .auth(token, { type: "bearer" })
      .send({
        name: "Cemoro Lawang",
        type: "basecamp",
        latitude: -7.9425,
        longitude: 112.953,
        elevationMeters: 2200,
        imageUrl: "http://localhost:9000/dolenae/nodes/basecamp.png",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.imageUrl).toContain("/nodes/");
  });

  it("removes the node photo when the node is deleted", async () => {
    vi.mocked(routeRepository.findNodeById).mockResolvedValue({
      ...nodeA,
      imageUrl: "http://localhost:9000/dolenae/nodes/basecamp.png",
    });
    vi.mocked(routeRepository.countNodeRoutes).mockResolvedValue(0);
    vi.mocked(routeRepository.countSegmentRoutes).mockResolvedValue(0);
    vi.mocked(routeRepository.deleteNode).mockResolvedValue(true);

    const res = await request(app)
      .delete(`/api/track-nodes/${nodeAId}`)
      .auth(token, { type: "bearer" });

    expect(res.status).toBe(200);
    expect(storageService.deleteByUrl).toHaveBeenCalledWith(
      "http://localhost:9000/dolenae/nodes/basecamp.png",
    );
  });

  it("creates a route from free bend points without named nodes", async () => {
    vi.mocked(routeRepository.createRoute).mockResolvedValueOnce({
      ...routeRow,
      name: "Garis Bebas",
    });

    const res = await request(app)
      .post(`/api/destinations/${destinationId}/routes`)
      .auth(token, { type: "bearer" })
      .send({
        name: "Garis Bebas",
        points: [
          { latitude: -7.94, longitude: 112.95 },
          { latitude: -7.945, longitude: 112.955 },
          { latitude: -7.95, longitude: 112.96 },
        ],
      });

    expect(res.status).toBe(201);
    expect(routeRepository.replaceRoutePoints).toHaveBeenCalledWith(
      routeId,
      expect.arrayContaining([
        expect.objectContaining({ latitude: "-7.94" }),
      ]),
    );
    // No anchors -> no segment metadata required.
    expect(routeRepository.createSegment).not.toHaveBeenCalled();
  });

  it("profiles a route with free bend points and interpolates elevation", async () => {
    vi.mocked(routeRepository.findRouteById).mockResolvedValue(routeRow);
    vi.mocked(routeRepository.findRoutePoints).mockResolvedValue([
      {
        routeId,
        position: 0,
        latitude: "-7.9425000",
        longitude: "112.9530000",
        elevationMeters: 2200,
        nodeId: nodeAId,
      },
      {
        routeId,
        position: 1,
        latitude: "-7.9460000",
        longitude: "112.9560000",
        elevationMeters: null,
        nodeId: null,
      },
      {
        routeId,
        position: 2,
        latitude: "-7.9500000",
        longitude: "112.9600000",
        elevationMeters: 2770,
        nodeId: nodeBId,
      },
    ]);

    const res = await request(app)
      .get(`/api/routes/${routeId}/profile`)
      .auth(token, { type: "bearer" });

    expect(res.status).toBe(200);
    expect(res.body.data.points).toHaveLength(3);
    expect(res.body.data.points[1].name).toContain("Belokan");
    expect(res.body.data.points[1].elevationMeters).toBeGreaterThan(2200);
    expect(res.body.data.points[1].elevationMeters).toBeLessThan(2770);
    expect(res.body.data.totalGainMeters).toBe(570);
  });

  it("blocks deleting a node that is still used by a route segment", async () => {
    vi.mocked(routeRepository.countNodeRoutes).mockResolvedValue(0);
    vi.mocked(routeRepository.countSegmentRoutes).mockResolvedValue(1);

    const res = await request(app)
      .delete(`/api/track-nodes/${nodeAId}`)
      .auth(token, { type: "bearer" });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain("ruas");
  });

  it("deletes a node once its segments are no longer used", async () => {
    vi.mocked(routeRepository.countNodeRoutes).mockResolvedValue(0);
    vi.mocked(routeRepository.countSegmentRoutes).mockResolvedValue(0);
    vi.mocked(routeRepository.deleteNode).mockResolvedValue(true);

    const res = await request(app)
      .delete(`/api/track-nodes/${nodeAId}`)
      .auth(token, { type: "bearer" });

    expect(res.status).toBe(200);
    expect(routeRepository.deleteNode).toHaveBeenCalledWith(nodeAId);
  });

  it("removes orphan segments when a trail is deleted", async () => {
    vi.mocked(routeRepository.findRouteById).mockResolvedValue(routeRow);
    vi.mocked(routeRepository.findRouteSegmentIds).mockResolvedValue([segmentId]);
    vi.mocked(routeRepository.countSegmentRoutes).mockResolvedValue(0);
    vi.mocked(routeRepository.deleteRoute).mockResolvedValue(true);
    vi.mocked(routeRepository.deleteSegment).mockResolvedValue(true);

    const res = await request(app)
      .delete(`/api/routes/${routeId}`)
      .auth(token, { type: "bearer" });

    expect(res.status).toBe(200);
    expect(routeRepository.deleteSegment).toHaveBeenCalledWith(segmentId);
  });
});
