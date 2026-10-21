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
  status: "draft" as const,
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
