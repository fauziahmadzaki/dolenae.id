import { createApi } from "./core";

/** Public base URL — inlined into the browser bundle at build time. */
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/**
 * API client for **client-side** code (browser / client components).
 * Uses `NEXT_PUBLIC_API_URL`. For server components use `~/lib/api/server`.
 */
export const api = createApi(PUBLIC_API_URL);

export const { get, post, patch, put, del } = api;
