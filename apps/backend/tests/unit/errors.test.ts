import { describe, expect, it } from "vitest";
import {
  AppError,
  InternalError,
  NotFoundError,
  ValidationError,
} from "../../src/utils/errors";

describe("AppError", () => {
  it("carries status, code, and exposes client errors", () => {
    const err = new NotFoundError();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.expose).toBe(true);
  });

  it("hides internal errors", () => {
    const err = new InternalError();
    expect(err.statusCode).toBe(500);
    expect(err.expose).toBe(false);
  });

  it("keeps validation details", () => {
    const details = [{ path: "name", message: "required" }];
    const err = new ValidationError("invalid", details);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual(details);
  });
});
