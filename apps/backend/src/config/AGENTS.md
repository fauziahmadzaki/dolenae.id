# AGENTS.md — config/

Schema dan akses environment.

- `AppConfig.ts`: loader, cache, validasi production, dan getter env.
- Schema Zod ada di `schemas/env.schema.ts`.
- Variabel baru: tambah di `schemas/env.schema.ts` + `.env.example` + getter
  `AppConfig`.
- Jangan baca `process.env` langsung di luar folder ini; pakai
  `AppConfig.load()`.
- Tidak ada logika bisnis / akses HTTP di sini.
