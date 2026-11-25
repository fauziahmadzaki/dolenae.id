import { describe, expect, it } from "vitest";
import {
  decryptSecret,
  encryptSecret,
  maskSecret,
} from "../../src/utils/crypto";

describe("secret crypto", () => {
  it("encrypts and decrypts a value", () => {
    const payload = encryptSecret("gemini-key-abcdef123456");

    expect(payload.startsWith("v1:")).toBe(true);
    expect(payload).not.toContain("gemini-key");
    expect(decryptSecret(payload)).toBe("gemini-key-abcdef123456");
  });

  it("produces a different ciphertext for the same input", () => {
    expect(encryptSecret("sama")).not.toBe(encryptSecret("sama"));
  });

  it("rejects tampered payloads", () => {
    const payload = encryptSecret("rahasia");
    const parts = payload.split(":");
    parts[3] = Buffer.from("rusak").toString("base64");

    expect(() => decryptSecret(parts.join(":"))).toThrow();
  });

  it("masks all but the last four characters", () => {
    expect(maskSecret("abcdefghij")).toBe("••••••ghij");
  });
});
