import { createApp } from "./app";
import { loadEnv } from "./config/env";
import { closeDatabase, pingDatabase } from "./db/client";

const env = loadEnv();
const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(
    `Dolenae API running at http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
});

void pingDatabase().then((connected) => {
  console.log(connected ? "Database: connected" : "Database: NOT connected");
});

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
