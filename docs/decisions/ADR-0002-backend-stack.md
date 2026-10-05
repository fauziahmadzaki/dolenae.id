# ADR-0002 — Stack Backend (Hono + Drizzle + JWT)

- **Status:** Diterima
- **Tanggal:** 2026-10-05
- **Konteks modul:** Fondasi backend (apps/server)

## Konteks

Prototype saat ini menyajikan data dari `packages/seed` lewat Hono tanpa DB,
tanpa auth, dan tanpa konvensi API. Sebelum membangun fitur (destinasi, rute,
trip), perlu fondasi: database, standar response/error, pagination, routing,
middleware, dan auth.

## Keputusan

1. **Postgres + Drizzle ORM.** Schema-as-code TypeScript, SQL migrasi bisa
   dibaca, ringan untuk monorepo. (Prisma ditolak: generate/binary berat untuk
   workspace; Kysely ditolak: tidak schema-as-code.)
2. **JWT (`hono/jwt`, HS256)** untuk auth, bukan session/cookie. Cocok untuk
   klien terpisah (web TanStack + mobile Flutter).
3. **Hashing password `scrypt`** dari `node:crypto` — tanpa dependency native.
4. **Envelope response seragam** `{ success, data, meta }` dan
   `{ success, error: { code, message, details } }`.
5. **Global error handler + notFound handler** memetakan error ke status & kode
   stabil; detail internal disembunyikan di production.
6. **Pagination standar** (`page`, `limit` maks 100, `sort`, `order`, `search`)
   dengan meta `total/totalPages/hasNext/hasPrev`.
7. **Routing tanpa versioning**, semua di `/api`.
8. **Foldering by usage/layer**: `routes → controllers → services →
   repositories` (+ `middleware`, `utils`, `types`, `config`, `db`). Hanya
   `repositories` yang mengakses DB.
9. **Docker Compose di `apps/server/`** untuk Postgres 16 dev.

## Konsekuensi

- **Positif:** kontrak API konsisten & mudah diuji; pemisahan tanggung jawab
  rapi; bisa dikembangkan per-fitur tanpa mengubah fondasi.
- **Biaya:** token JWT stateless sulit di-revoke (butuh refresh/blacklist
  nanti); scrypt tanpa pepper config tambahan.
- Domain lengkap (destination/rute/trip) belum dimodelkan di DB — endpoint
  seed dipertahankan sementara sebagai jembatan.

## Alternatif yang ditolak

- Versioning `/api/v1` sekarang — belum perlu, menambah noise.
- Auth placeholder saja — tidak membuktikan alur end-to-end; JWT dipilih agar
  `me` dan guard role bisa diuji nyata.
