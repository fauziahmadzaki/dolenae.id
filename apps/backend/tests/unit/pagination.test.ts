import { describe, expect, it } from "vitest";
import {
  buildMeta,
  paginationSchema,
  toPagination,
} from "../../src/utils/pagination";

describe("pagination", () => {
  it("applies defaults", () => {
    const q = paginationSchema.parse({});
    expect(q).toMatchObject({ page: 1, limit: 20, order: "asc" });
  });

  it("rejects limit above the maximum", () => {
    expect(() => paginationSchema.parse({ limit: "500" })).toThrow();
  });

  it("computes offset from page and limit", () => {
    const p = toPagination({ page: 3, limit: 10, order: "asc" });
    expect(p.offset).toBe(20);
  });

  it("builds meta with hasNext/hasPrev", () => {
    expect(buildMeta(45, 2, 20)).toMatchObject({
      page: 2,
      limit: 20,
      total: 45,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
  });

  it("marks last page correctly", () => {
    expect(buildMeta(40, 2, 20)).toMatchObject({
      totalPages: 2,
      hasNext: false,
      hasPrev: true,
    });
  });
});
