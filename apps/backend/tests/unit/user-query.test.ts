import { expect, it } from "vitest";
import { userListQuerySchema } from "../../src/controllers/user.schema";
it("preserves role filter across server pagination", () => {
  expect(userListQuerySchema.parse({ role: "admin", search: "Fauzi", page: "2" })).toMatchObject({ role: "admin", search: "Fauzi", page: 2 });
  expect(userListQuerySchema.safeParse({ role: "owner" }).success).toBe(false);
});
