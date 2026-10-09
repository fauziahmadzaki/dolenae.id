# AGENTS.md — Backend (apps/backend)

Aturan kerja untuk agen AI di backend Dolenae. Baca juga `AGENTS.md` root.

## Overview

**Dolenae API** — backend untuk web publik + admin (Next.js) dan mobile
(Flutter). Fase sekarang: prototype, tapi fondasi sudah produksi-minded
(envelope, error, validasi, pagination, DB).

## Stack

| Layer | Teknologi |
| --- | --- |
| Runtime | Node.js (ESM), `tsx` untuk dev |
| Framework | **Express 5** |
| Bahasa | TypeScript |
| Validasi | **Zod** |
| Database | **PostgreSQL** + **Drizzle ORM** (`pg`) |
| Lain | `helmet`, `cors`, `pino`/`pino-http`, `dotenv` |

## Struktur

```
src/
  index.ts              # bootstrap: ping DB, listen, graceful shutdown
  app.ts                # Express app: middleware → routes → 404 → error handler
  config/env.ts         # env divalidasi Zod (.env)
  db/client.ts          # Pool + Drizzle; pingDatabase()/closeDatabase()
  db/schema.ts          # definisi tabel Drizzle
  middleware/
    request-id.ts       # x-request-id
    validate.ts         # validation pipe Zod (req.validated)
    error-handler.ts    # notFound + error handler global
  routes/               # definisi endpoint (tipis)
  controllers/          # handler request/response
  services/             # logika bisnis
  repositories/         # satu-satunya lapisan yang akses DB
  utils/
    response.ts         # ok() / fail() envelope
    errors.ts           # AppError + turunannya
    pagination.ts       # skema query + buildMeta()
  types/                # api.ts, express.d.ts
```

## Arsitektur & konvensi

- **Alur:** `routes → controllers → services → repositories`. Hanya
  `repositories` yang menyentuh DB.
- **Envelope response:** sukses `{ success: true, data, meta? }`, gagal
  `{ success: false, error: { code, message, details? } }`. Pakai `ok()`/`fail()`.
- **Error:** `throw` `AppError` (atau turunannya); ditangkap global error handler.
  Detail internal disembunyikan di production.
- **Validasi:** `validate({ body?, query?, params? })`; hasil bersih dibaca via
  `getValidated<T>(req, "query")`. Di Express 5 `req.query` read-only, jadi hasil
  disimpan di `req.validated`.
- **Pagination:** `paginationSchema` (`page`, `limit` maks 100, `sort`, `order`,
  `search`) + `buildMeta(total, page, limit)`.
- **Komentar kode: bahasa Inggris, secukupnya.**

## Env & menjalankan

```bash
cd apps/backend
cp .env.example .env          # DATABASE_URL, JWT_SECRET, dst.
docker compose up -d          # PostgreSQL 16
pnpm install
pnpm dev                      # http://localhost:3001
```

Cek kesehatan: `GET /api/health` (status service + konektivitas DB).
Docs API (Scalar): `GET /api/docs` (spec di `GET /api/openapi.json`).

## Scripts

| Command | Fungsi |
| --- | --- |
| `pnpm dev` | Jalankan dengan `tsx watch` |
| `pnpm start` | Jalankan tanpa watch |
| `pnpm typecheck` / `pnpm build` | Cek tipe (`tsc --noEmit`) |
| `pnpm test` / `pnpm test:watch` | Unit & integration test (Vitest) |
| `pnpm db:generate` | Generate migrasi Drizzle dari `db/schema.ts` |
| `pnpm db:migrate` / `pnpm db:push` / `pnpm db:studio` | Migrasi / push / studio |

## Aturan kerja

- Kontrak API di `/api` + envelope **wajib stabil** (dipakai web & mobile).
- Tipe domain **manual** (tak ada paket shared) — sinkron dengan web.
- `pnpm typecheck` harus hijau sebelum selesai.
- Jangan commit `.env` (gitignored).
