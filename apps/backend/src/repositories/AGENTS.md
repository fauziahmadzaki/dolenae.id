# AGENTS.md — repositories/

Akses database. **Satu-satunya** lapisan yang menyentuh DB.

- Pakai Drizzle dari `db/client.ts` (`getDb()`).
- Query terparameter (aman dari SQL injection); jangan rakit SQL dari input mentah.
- Terima/balikin tipe domain; tanpa logika HTTP maupun bisnis.
- Satu file per repository, **nama file = nama class (PascalCase)**, mis.
  `UserRepository.ts` berisi `class UserRepository` + singleton
  `export const userRepository = new UserRepository()`.
- Tipe data repository (patch/update, filter list params, hasil join) **tidak**
  ditulis di sini — taruh per entity di `src/types/`, lalu impor dengan
  `import type`. Contoh: `UserPatch` di `types/user.ts`, `JoinedTravelSupport`
  di `types/support.ts`.
- Perubahan skema → `db/schema.ts` + `pnpm db:generate`.
