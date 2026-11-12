import { createApp } from "./app";
import { AppConfig } from "./config/AppConfig";
import { database } from "./db/DatabaseClient";

const config = AppConfig.load();
const app = createApp();

const server = app.listen(config.port, () => {
  console.log(
    `Dolenae API running at http://localhost:${config.port} (${config.nodeEnv})`,
  );
});

void database.ping().then((connected) => {
  console.log(connected ? "Database: connected" : "Database: NOT connected");
});

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await database.close();
    process.exit(0);
  });
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
