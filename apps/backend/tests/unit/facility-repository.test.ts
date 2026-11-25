import { beforeEach, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import { database } from "../../src/db/DatabaseClient";
import { facilityRepository } from "../../src/repositories/FacilityRepository";

vi.mock("../../src/db/DatabaseClient", () => ({
  database: {
    getDb: vi.fn(),
    getPool: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn().mockResolvedValue(undefined),
  },
}));

const dialect = new PgDialect();
const destinationId = "22222222-2222-4222-a222-222222222222";
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

it("lists only published facilities of published destinations", async () => {
  await facilityRepository.list({
    destinationId,
    statuses: ["published"],
    publishedDestinationOnly: true,
    page: 2,
    limit: 10,
    offset: 10,
    order: "asc",
  });

  const filter = dialect.sqlToQuery(where.mock.calls[0]![0]);
  expect(filter.sql).toContain('"facilities"."destination_id" = $1');
  expect(filter.sql).toContain('"facilities"."status" in ($2)');
  expect(filter.sql).toContain('"destinations"."status" = $3');
  expect(filter.params).toEqual([destinationId, "published", "published"]);
});

it("applies pagination and stable name/id ordering", async () => {
  await facilityRepository.list({
    page: 3,
    limit: 5,
    offset: 10,
    order: "asc",
  });

  expect(orderBy).toHaveBeenCalled();
  expect(limit).toHaveBeenCalledWith(5);
  expect(offset).toHaveBeenCalledWith(10);
});

it("filters by owner and category when provided", async () => {
  await facilityRepository.list({
    ownerId: destinationId,
    category: "food",
    page: 1,
    limit: 20,
    offset: 0,
    order: "asc",
  });

  const filter = dialect.sqlToQuery(where.mock.calls[0]![0]);
  expect(filter.sql).toContain('"facilities"."owner_id" =');
  expect(filter.sql).toContain('"facilities"."category" =');
  expect(filter.params).toEqual([destinationId, "food"]);
});
