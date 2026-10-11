import "express";
import type { AuthPrincipal } from "./auth";

// Adds `requestId`, `validated` (Zod output) and `user` to Express Request.
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: AuthPrincipal;
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
