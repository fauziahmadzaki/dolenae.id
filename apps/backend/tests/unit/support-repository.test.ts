import { beforeEach, expect, it, vi } from "vitest";
import { sql } from "drizzle-orm";
import { getTableConfig, PgDialect } from "drizzle-orm/pg-core";
import { getDb } from "../../src/db/client";
import { travelSupports } from "../../src/db/schema";
import { supportRepository } from "../../src/repositories/support.repository";

vi.mock("../../src/db/client", () => ({ getDb: vi.fn() }));
const dialect = new PgDialect();
const id = "22222222-2222-4222-a222-222222222222";
const where = vi.fn();
const orderBy = vi.fn();
const limit = vi.fn();
const offset = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  const rows = { from: vi.fn().mockReturnThis(), innerJoin: vi.fn().mockReturnThis(), where: where.mockReturnThis(), orderBy: orderBy.mockReturnThis(), limit: limit.mockReturnThis(), offset: offset.mockResolvedValue([]) };
  const total = { from: vi.fn().mockReturnThis(), innerJoin: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([{ value: 0 }]) };
  vi.mocked(getDb).mockReturnValue({ select: vi.fn().mockReturnValueOnce(rows).mockReturnValueOnce(total) } as unknown as ReturnType<typeof getDb>);
});

it("lists only published destination supports with stable category/name/id order", async () => {
  await supportRepository.list(id, { page: 2, limit: 10, offset: 10, order: "desc", sort: "name" });
  const filter = dialect.sqlToQuery(where.mock.calls[0]![0]);
  expect(filter.sql).toContain('"travel_supports"."destination_id" = $1');
  expect(filter.sql).toContain('"destinations"."status" = $2');
  expect(filter.params).toEqual([id, "published"]);
  expect(dialect.sqlToQuery(sql.join(orderBy.mock.calls[0]!, sql`, `)).sql).toBe('"travel_supports"."category" asc, "travel_supports"."name" asc, "travel_supports"."id" asc');
  expect(limit).toHaveBeenCalledWith(10);
  expect(offset).toHaveBeenCalledWith(10);
});

it.each(["findById", "hasPublishedDestination"] as const)("%s always filters published status", async (method) => {
  limit.mockResolvedValue([]);
  await supportRepository[method](id);
  const filter = dialect.sqlToQuery(where.mock.calls[0]![0]);
  expect(filter.params).toEqual([id, "published"]);
  expect(filter.sql).toContain('"destinations"."status" = $2');
});

it("schema has cascading destination FK, index and non-null array/boolean defaults", () => {
  const config = getTableConfig(travelSupports);
  expect(config.foreignKeys[0]!.onDelete).toBe("cascade");
  expect(config.foreignKeys[0]!.reference().foreignColumns[0]!.name).toBe("id");
  expect(config.indexes[0]!.config.columns[0]).toMatchObject({ name: "destination_id" });
  for (const column of [travelSupports.facilities, travelSupports.routes, travelSupports.cuisine]) {
    expect(column.notNull).toBe(true);
    expect(column.default).toEqual([]);
  }
  for (const column of [travelSupports.includesDriver, travelSupports.verified]) {
    expect(column.notNull).toBe(true);
    expect(column.default).toBe(false);
  }
  expect(travelSupports.category.enumValues).toEqual(["accommodation", "transport", "food"]);
});
