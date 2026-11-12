# AGENTS.md — db/

Koneksi, skema, dan seed database (PostgreSQL + Drizzle).

- `DatabaseClient.ts`: class `DatabaseClient` — `getPool()`, `getDb()`, `ping()`,
  `close()`. Satu instance diekspor sebagai `database` (lazy, tanpa koneksi saat
  import). Pemakaian: `database.getDb()`.
- `models/`: satu file per entity, nama file = nama entity PascalCase
  (`User.ts`, `Destination.ts`, `TrailRoute.ts`, …). Semua `pgEnum` di
  `models/enums.ts`. `models/index.ts` adalah barrel — impor tabel/tipe dari
  `db/models`, jangan dari file model langsung.
- `seeds/`: `seed.ts` (+ `seed-networks.ts`) dijalankan lewat `pnpm db:seed`.
  Idempoten, dicocokkan lewat `slug`.
- Ubah skema → edit model, `pnpm db:generate`, lalu migrasi. `drizzle.config.ts`
  menunjuk ke `src/db/models/index.ts`.
- Hanya **repository** yang mengakses DB; jangan import `DatabaseClient` dari
  controller/route. Pengecualian: `health.controller.ts` (ping) dan `seeds/`.
