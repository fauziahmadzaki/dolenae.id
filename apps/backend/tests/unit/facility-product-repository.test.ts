import { beforeEach, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import { database } from "../../src/db/DatabaseClient";
import { facilityProductRepository } from "../../src/repositories/FacilityProductRepository";

vi.mock("../../src/db/DatabaseClient", () => ({
  database: {
    getDb: vi.fn(),
    getPool: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn().mockResolvedValue(undefined),
  },
}));

const dialect = new PgDialect();
const ownerId = "22222222-2222-4222-a222-222222222222";
const facilityId = "33333333-3333-4333-a333-333333333333";
const where = vi.fn();
const orderBy = vi.fn();
const limit = vi.fn();
const offset = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  const rows = {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: where.mockReturnThis(),
    orderBy: orderBy.mockReturnThis(),
    limit: limit.mockReturnThis(),
    offset: offset.mockResolvedValue([]),
  };
  const total = {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{ value: 0 }]),
  };
  vi.mocked(database.getDb).mockReturnValue({
    select: vi.fn().mockReturnValueOnce(rows).mockReturnValueOnce(total),
  } as unknown as ReturnType<typeof database.getDb>);
});

it("lists products of facilities owned by the merchant", async () => {
  await facilityProductRepository.listByOwner({
    ownerId,
    facilityId,
    search: "kopi",
    page: 2,
    limit: 10,
    offset: 10,
    order: "asc",
  });

  const filter = dialect.sqlToQuery(where.mock.calls[0]![0]);
  expect(filter.sql).toContain('"facilities"."owner_id" = $1');
  expect(filter.sql).toContain('"facility_products"."facility_id" = $2');
  expect(filter.sql).toContain('"facility_products"."name" ilike $3');
  expect(filter.params).toEqual([ownerId, facilityId, "%kopi%"]);
  expect(limit).toHaveBeenCalledWith(10);
  expect(offset).toHaveBeenCalledWith(10);
});
