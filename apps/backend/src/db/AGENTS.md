# AGENTS.md — db/

Koneksi & skema database (PostgreSQL + Drizzle).

- `client.ts`: `getPool()`, `getDb()`, `pingDatabase()`, `closeDatabase()` (singleton).
- `schema.ts`: definisi tabel Drizzle. Ubah skema → `pnpm db:generate` lalu migrasi.
- Hanya **repository** yang mengakses DB; jangan import `client.ts` dari controller/route.
