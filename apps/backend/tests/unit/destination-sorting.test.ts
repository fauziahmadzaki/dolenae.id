import { beforeEach, expect, it, vi } from "vitest";
import { sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { getDb } from "../../src/db/client";
import { destinationRepository } from "../../src/repositories/destination.repository";

vi.mock("../../src/db/client", () => ({ getDb: vi.fn() }));

const orderBy = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  const rows = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: orderBy.mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue([]),
  };
  const total = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{ value: 0 }]),
  };
  vi.mocked(getDb).mockReturnValue({
    select: vi.fn().mockReturnValueOnce(rows).mockReturnValueOnce(total),
  } as unknown as ReturnType<typeof getDb>);
});

it.each(["asc", "desc"] as const)("honors explicit id sort %s", async (order) => {
  await destinationRepository.list({ page: 1, limit: 100, offset: 0, sort: "id", order });

  const query = new PgDialect().sqlToQuery(sql.join(orderBy.mock.calls[0]!, sql`, `));
  expect(query.sql).toBe(`"destinations"."id" ${order}`);
});

it.each([
  ["createdAt", "created_at"],
  ["name", "name"],
  ["updatedAt", "updated_at"],
  ["elevationMeters", "elevation_meters"],
  [undefined, "created_at"],
  ["unsupported", "created_at"],
].flatMap(([sort, column]) =>
  (["asc", "desc"] as const).map((order) => ({ sort, column, order })),
))("uses id to break ties for sort $sort $order", async ({ sort, column, order }) => {
  await destinationRepository.list({ page: 2, limit: 100, offset: 100, sort, order });

  const query = new PgDialect().sqlToQuery(sql.join(orderBy.mock.calls[0]!, sql`, `));
  expect(query.sql).toBe(`"destinations"."${column}" ${order}, "destinations"."id" ${order}`);
});
