import type { Request, RequestHandler } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import { ValidationError } from "../utils/errors";

interface ValidateSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/** Zod validation pipe; parsed values are stored in `req.validated`. */
export function validate(schemas: ValidateSchemas): RequestHandler {
  return (req, _res, next) => {
    try {
      const validated: NonNullable<Request["validated"]> = {};

      if (schemas.params) validated.params = schemas.params.parse(req.params);
      if (schemas.query) validated.query = schemas.query.parse(req.query);
      if (schemas.body) validated.body = schemas.body.parse(req.body);

      req.validated = validated;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          new ValidationError(
            "Data permintaan tidak valid",
            err.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          ),
        );
        return;
      }
      next(err);
    }
  };
}

export function getValidated<T>(
  req: Request,
  key: "body" | "query" | "params",
): T {
  return (req.validated?.[key] ?? {}) as T;
}
