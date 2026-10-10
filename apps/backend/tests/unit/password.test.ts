import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../src/utils/password";

describe("password", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("rahasia123");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash).not.toContain("rahasia123");
    expect(await verifyPassword("rahasia123", hash)).toBe(true);
    expect(await verifyPassword("salah-sekali", hash)).toBe(false);
  });

  it("uses a fresh salt for every hash", async () => {
    expect(await hashPassword("sama")).not.toBe(await hashPassword("sama"));
  });

  it("rejects malformed stored hashes", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
  });
});
