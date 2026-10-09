import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

/** Attach a request id (from `x-request-id` or a new UUID) and echo it back. */
export function requestId(): RequestHandler {
  return (req, res, next) => {
    const id = req.header("x-request-id")?.trim() || randomUUID();
    req.requestId = id;
    res.locals.requestId = id;
    res.setHeader("x-request-id", id);
    next();
  };
}
