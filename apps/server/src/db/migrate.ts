import { migrate } from "drizzle-orm/node-postgres/migrator";
import { closeDatabase, getDb } from "./client";

/**
 * Jalankan migrasi SQL yang ada di folder `drizzle/`.
 * Pakai: `pnpm --filter @dolenae/server db:migrate`
 */
async function main() {
  console.log("Menjalankan migrasi...");
  await migrate(getDb(), { migrationsFolder: "./drizzle" });
  console.log("Migrasi selesai.");
  await closeDatabase();
}

main().catch(async (error) => {
  console.error("Migrasi gagal:", error);
  await closeDatabase();
  process.exit(1);
});
