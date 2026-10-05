import { serve } from "@hono/node-server";
import { app } from "./app";
import { loadEnv } from "./config/env";
import { closeDatabase, pingDatabase } from "./db/client";

const env = loadEnv();

const server = serve({
  fetch: app.fetch,
  port: env.PORT,
});

console.log(`Dolenae API running at http://localhost:${env.PORT} (${env.NODE_ENV})`);

void pingDatabase().then((ok) => {
  console.log(ok ? "Database: terhubung" : "Database: TIDAK terhubung (cek DATABASE_URL / docker compose)");
});

// Shutdown rapi
const shutdown = async (signal: string) => {
  console.log(`\n${signal} diterima, menutup server...`);
  server.close();
  await closeDatabase();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
