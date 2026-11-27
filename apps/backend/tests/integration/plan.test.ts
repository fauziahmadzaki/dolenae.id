import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/db/DatabaseClient", () => ({
  database: {
    getDb: vi.fn(),
    getPool: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createApp } from "../../src/app";
import type { TripPlanRow } from "../../src/db/models";
import { planRepository } from "../../src/repositories/PlanRepository";
import { signAccessToken } from "../../src/utils/jwt";

const USER_A = "11111111-1111-4111-a111-111111111111";
const USER_B = "22222222-2222-4222-a222-222222222222";
const PLAN_ID = "33333333-3333-4333-a333-333333333333";
const DEST_1 = "44444444-4444-4444-a444-444444444444";
const DEST_2 = "55555555-5555-4555-a555-555555555555";

function makeRow(overrides: Partial<TripPlanRow> = {}): TripPlanRow {
  return {
    id: PLAN_ID,
    userId: USER_A,
    clientId: null,
    title: "Ekspedisi Bromo",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    peopleCount: 2,
    totalBudget: 1500000,
    originProvince: "DKI Jakarta",
    note: "Berangkat malam",
    summary: "Ringkasan perjalanan",
    engine: "deterministic",
    notice: null,
    aiWarning: null,
    destinationIds: [DEST_1],
    briefingJson: { grounded: ["Fakta"], general: [], warnings: [] },
    daysJson: [
      {
        day: 1,
        title: "Hari 1",
        items: [
          {
            destinationId: DEST_1,
            destinationName: "Gunung Bromo",
            activity: "Tiba & persiapan",
          },
        ],
      },
    ],
    sourcesJson: [{ type: "destination", id: DEST_1, label: "Gunung Bromo" }],
    checklistJson: [
      {
        id: "chk-1",
        name: "Jaket hangat",
        category: "perlengkapan",
        isRequired: true,
        isCompleted: false,
        isOwned: false,
        estimatedCost: null,
      },
    ],
    createdAt: new Date("2026-06-01T00:00:00Z"),
    updatedAt: new Date("2026-06-01T00:00:00Z"),
    ...overrides,
  };
}

describe("Trip plans API (/api/plans)", () => {
  const app = createApp();
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    tokenA = await signAccessToken({
      sub: USER_A,
      email: "a@dolenae.id",
      role: "wisatawan",
    });
    tokenB = await signAccessToken({
      sub: USER_B,
      email: "b@dolenae.id",
      role: "wisatawan",
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("requires authentication on all plan endpoints", async () => {
    await request(app).get("/api/plans").expect(401);
    await request(app).get(`/api/plans/${PLAN_ID}`).expect(401);
    await request(app).post("/api/plans").send({}).expect(401);
    await request(app).patch(`/api/plans/${PLAN_ID}`).send({}).expect(401);
    await request(app).delete(`/api/plans/${PLAN_ID}`).expect(401);
  });

  it("returns an empty list for an account with no plans", async () => {
    vi.spyOn(planRepository, "listByUser").mockResolvedValue([]);

    const res = await request(app)
      .get("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    expect(res.body).toEqual({ success: true, data: [] });
  });

  it("supports create, list, detail, patch, and delete with destinationIds reconciliation", async () => {
    const store = new Map<string, TripPlanRow>();

    vi.spyOn(planRepository, "listByUser").mockImplementation(async (userId) =>
      [...store.values()].filter((row) => row.userId === userId),
    );
    vi.spyOn(planRepository, "findByIdForUser").mockImplementation(
      async (id, userId) => {
        const row = store.get(id);
        return row && row.userId === userId ? row : undefined;
      },
    );
    vi.spyOn(planRepository, "createWithLimitForUser").mockImplementation(
      async (userId, maxPlans, input) => {
        if (input.clientId) {
          const existing = [...store.values()].find(
            (r) => r.userId === userId && r.clientId === input.clientId,
          );
          if (existing) return { status: "existing", row: existing };
        }
        const count = [...store.values()].filter((r) => r.userId === userId).length;
        if (count >= maxPlans) return { status: "limit_reached" };
        const row = makeRow({
          userId: input.userId,
          clientId: input.clientId ?? null,
          title: input.title,
          startDate: input.startDate,
          endDate: input.endDate,
          peopleCount: input.peopleCount ?? 1,
          totalBudget: input.totalBudget ?? 0,
          originProvince: input.originProvince ?? "",
          note: input.note ?? "",
          summary: input.summary ?? "",
          engine: input.engine ?? "draft",
          destinationIds: input.destinationIds ?? [],
          daysJson: input.daysJson ?? [],
        });
        store.set(row.id, row);
        return { status: "created", row };
      },
    );
    vi.spyOn(planRepository, "updateForUserLocked").mockImplementation(
      async (id, userId, buildPatch) => {
        const row = store.get(id);
        if (!row || row.userId !== userId) return undefined;
        const patch = buildPatch(row);
        const next: TripPlanRow = { ...row, ...patch };
        store.set(id, next);
        return next;
      },
    );
    vi.spyOn(planRepository, "deleteForUser").mockImplementation(
      async (id, userId) => {
        const row = store.get(id);
        if (!row || row.userId !== userId) return false;
        store.delete(id);
        return true;
      },
    );

    const createdRes = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Ekspedisi Bromo & Ijen",
        startDate: "2026-07-10",
        endDate: "2026-07-12",
        peopleCount: 2,
        totalBudget: 1500000,
        destinationIds: [DEST_1],
        days: [
          {
            day: 1,
            title: "Hari 1",
            items: [
              {
                destinationId: DEST_2,
                destinationName: "Kawah Ijen",
                activity: "Jelajah kawah",
              },
            ],
          },
        ],
      })
      .expect(201);

    expect(createdRes.body.data.destinationIds).toEqual([DEST_1, DEST_2]);
    expect(createdRes.body.data.userId).toBe(USER_A);

    const listRes = await request(app)
      .get("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);
    expect(listRes.body.data).toHaveLength(1);

    const detailRes = await request(app)
      .get(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);
    expect(detailRes.body.data.title).toBe("Ekspedisi Bromo & Ijen");

    // Cross-account isolation (IDOR): Account B sees empty list and 404 on GET/PATCH/DELETE
    const listB = await request(app)
      .get("/api/plans")
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200);
    expect(listB.body.data).toEqual([]);

    await request(app)
      .get(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(404);
    await request(app)
      .patch(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hijacked" })
      .expect(404);
    await request(app)
      .delete(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(404);

    const patchRes = await request(app)
      .patch(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "Ekspedisi Bromo Updated" })
      .expect(200);
    expect(patchRes.body.data.title).toBe("Ekspedisi Bromo Updated");

    const delRes = await request(app)
      .delete(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);
    expect(delRes.body.data).toEqual({ deleted: true, id: PLAN_ID });

    await request(app)
      .get(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(404);
  });

  it("validates calendar dates, duration <= 30 days, engine enum, and patch date consistency", async () => {
    await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Invalid Feb",
        startDate: "2026-02-31",
        endDate: "2026-03-02",
      })
      .expect(422);

    await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Reversed Dates",
        startDate: "2026-07-15",
        endDate: "2026-07-10",
      })
      .expect(422);

    await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Too Long",
        startDate: "2026-07-01",
        endDate: "2026-08-05",
      })
      .expect(422);

    await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Seed Engine Rejected",
        startDate: "2026-07-01",
        endDate: "2026-07-02",
        engine: "seed",
      })
      .expect(422);

    vi.spyOn(planRepository, "updateForUserLocked").mockImplementation(
      async (id, userId, buildPatch) => {
        const row = makeRow({ id, userId });
        const patch = buildPatch(row);
        return { ...row, ...patch };
      },
    );
    await request(app)
      .patch(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ endDate: "2026-07-01" })
      .expect(422);
  });

  it("enforces per-user cap of 100 plans atomically", async () => {
    vi.spyOn(planRepository, "createWithLimitForUser").mockResolvedValue({
      status: "limit_reached",
    });

    await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Over Limit",
        startDate: "2026-07-10",
        endDate: "2026-07-11",
      })
      .expect(422);
  });

  it("preserves omitted destinationIds on days-only PATCH and rejects >20 unique destinations", async () => {
    const existing = makeRow({ destinationIds: [DEST_1] });
    vi.spyOn(planRepository, "updateForUserLocked").mockImplementation(
      async (_id, _userId, buildPatch) => {
        const patch = buildPatch(existing);
        return { ...existing, ...patch };
      },
    );

    const daysOnlyRes = await request(app)
      .patch(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        days: [
          {
            day: 1,
            title: "Hari 1",
            items: [
              {
                destinationId: DEST_2,
                destinationName: "Kawah Ijen",
                activity: "Jelajah kawah",
              },
            ],
          },
        ],
      })
      .expect(200);
    expect(daysOnlyRes.body.data.destinationIds).toEqual([DEST_1, DEST_2]);

    const extraIds = Array.from({ length: 15 }, (_, i) => `dest-extra-${i}`);
    await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Too Many Destinations",
        startDate: "2026-07-10",
        endDate: "2026-07-12",
        destinationIds: extraIds,
        days: [
          {
            day: 1,
            title: "Hari 1",
            items: Array.from({ length: 6 }, (_, i) => ({
              destinationId: `dest-day-${i}`,
              destinationName: `Dest ${i}`,
              activity: "Explore",
            })),
          },
        ],
      })
      .expect(422);
  });

  it("enforces clientId idempotency per user and validates IDs-only PATCH against scheduled days", async () => {
    const store = new Map<string, TripPlanRow>();
    let seq = 1;
    vi.spyOn(planRepository, "createWithLimitForUser").mockImplementation(
      async (userId, maxPlans, input) => {
        if (input.clientId) {
          const dup = [...store.values()].find(
            (r) => r.userId === userId && r.clientId === input.clientId,
          );
          if (dup) return { status: "existing", row: dup };
        }
        const count = [...store.values()].filter((r) => r.userId === userId).length;
        if (count >= maxPlans) return { status: "limit_reached" };
        const id = `00000000-0000-4000-8000-00000000000${seq++}`;
        const row = makeRow({
          id,
          userId,
          clientId: input.clientId ?? null,
          title: input.title,
          destinationIds: input.destinationIds ?? [],
        });
        store.set(id, row);
        return { status: "created", row };
      },
    );

    const firstA = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        clientId: "local-draft-1",
        title: "Idempotent Plan",
        startDate: "2026-07-10",
        endDate: "2026-07-12",
      })
      .expect(201);

    const replayA = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        clientId: "local-draft-1",
        title: "Idempotent Plan",
        startDate: "2026-07-10",
        endDate: "2026-07-12",
      })
      .expect(200);
    expect(replayA.body.data.id).toBe(firstA.body.data.id);

    // Different user can safely use the same clientId
    const firstB = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        clientId: "local-draft-1",
        title: "User B Plan",
        startDate: "2026-07-10",
        endDate: "2026-07-12",
      })
      .expect(201);
    expect(firstB.body.data.id).not.toBe(firstA.body.data.id);

    // IDs-only PATCH: superset passes & reconciles, removing scheduled item returns 422
    const existing = makeRow({ destinationIds: [DEST_1] });
    vi.spyOn(planRepository, "updateForUserLocked").mockImplementation(
      async (_id, _userId, buildPatch) => {
        const patch = buildPatch(existing);
        return { ...existing, ...patch };
      },
    );

    const supersetRes = await request(app)
      .patch(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ destinationIds: [DEST_1, DEST_2] })
      .expect(200);
    expect(supersetRes.body.data.destinationIds).toEqual([DEST_1, DEST_2]);

    await request(app)
      .patch(`/api/plans/${PLAN_ID}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ destinationIds: [DEST_2] })
      .expect(422);
  });

  it("records clientId tombstone on DELETE /api/plans/client/:clientId and rejects later POST with 409", async () => {
    const store = new Map<string, TripPlanRow>();
    const tombstones = new Set<string>();
    let seq = 1;

    vi.spyOn(planRepository, "createWithLimitForUser").mockImplementation(
      async (userId, maxPlans, input) => {
        if (input.clientId && tombstones.has(`${userId}:${input.clientId}`)) {
          return { status: "deleted" };
        }
        if (input.clientId) {
          const dup = [...store.values()].find(
            (r) => r.userId === userId && r.clientId === input.clientId,
          );
          if (dup) return { status: "existing", row: dup };
        }
        const count = [...store.values()].filter((r) => r.userId === userId).length;
        if (count >= maxPlans) return { status: "limit_reached" };
        const id = `00000000-0000-4000-8000-00000000010${seq++}`;
        const row = makeRow({
          id,
          userId,
          clientId: input.clientId ?? null,
          title: input.title,
        });
        store.set(id, row);
        return { status: "created", row };
      },
    );
    vi.spyOn(planRepository, "deleteByClientIdForUser").mockImplementation(
      async (userId, clientId) => {
        tombstones.add(`${userId}:${clientId}`);
        for (const [id, row] of store.entries()) {
          if (row.userId === userId && row.clientId === clientId) {
            store.delete(id);
          }
        }
        return { deleted: true, clientId };
      },
    );

    const delRes = await request(app)
      .delete("/api/plans/client/local-del-1")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);
    expect(delRes.body.data).toEqual({ deleted: true, clientId: "local-del-1" });

    const conflictRes = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        clientId: "local-del-1",
        title: "Late Commit Should Fail",
        startDate: "2026-07-10",
        endDate: "2026-07-12",
      })
      .expect(409);
    expect(conflictRes.body.error.code).toBe("PLAN_CLIENT_DELETED");
    expect(conflictRes.body.error.message).toBe("Rencana ini sudah dihapus");

    // Another user can still create with the same clientId
    await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        clientId: "local-del-1",
        title: "User B Allowed",
        startDate: "2026-07-10",
        endDate: "2026-07-12",
      })
      .expect(201);
  });
});
