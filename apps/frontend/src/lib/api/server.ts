import { createApi } from "./core";

/** Server-only base URL (private; may be an internal address). */
const SERVER_API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api";

/**
 * API client for **server-side** code (server components, route handlers).
 * Uses `API_URL`. Do NOT import this from client components.
 */
export const api = createApi(SERVER_API_URL);

export const { get, post, patch, put, del } = api;
