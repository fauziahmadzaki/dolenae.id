# AGENTS.md — repositories/

Akses database. **Satu-satunya** lapisan yang menyentuh DB.

- Pakai Drizzle dari `db/client.ts` (`getDb()`).
- Query terparameter (aman dari SQL injection); jangan rakit SQL dari input mentah.
- Terima/balikin tipe domain; tanpa logika HTTP maupun bisnis.
- Perubahan skema → `db/schema.ts` + `pnpm db:generate`.
