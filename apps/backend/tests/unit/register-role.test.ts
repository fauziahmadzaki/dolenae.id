import { expect, it } from "vitest";
import { registerSchema } from "../../src/controllers/auth.schema";
it("public registration cannot grant admin", () => {
  expect(registerSchema.safeParse({ name: "Example User", email: "example@test.id", password: "password123", role: "admin" }).success).toBe(false);
});
