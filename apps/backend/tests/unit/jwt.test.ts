import { describe, expect, it } from "vitest";
import { UnauthorizedError } from "../../src/utils/errors";
import { signAccessToken, verifyAccessToken } from "../../src/utils/jwt";

describe("jwt", () => {
  it("signs and verifies an access token", async () => {
    const token = await signAccessToken({
      sub: "user-1",
      email: "adi@dolenae.id",
      role: "admin",
    });

    const payload = await verifyAccessToken(token);
    expect(payload).toMatchObject({
      sub: "user-1",
      email: "adi@dolenae.id",
      role: "admin",
    });
  });

  it("rejects a malformed token", async () => {
    await expect(verifyAccessToken("bukan.token")).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});
