# AGENTS.md — config/

Pemuatan & validasi environment.

- Satu sumber env: `env.ts` (schema **Zod**). Variabel baru → tambah di schema
  + `.env.example`.
- Jangan baca `process.env` langsung di luar folder ini; pakai `loadEnv()`.
- Tidak ada logika bisnis / akses HTTP di sini.
