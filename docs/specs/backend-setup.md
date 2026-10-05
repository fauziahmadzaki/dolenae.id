# Backend Setup — Dolenae.id

Panduan menjalankan backend (Hono + Drizzle + PostgreSQL) dan konvensi API.

## 1. Stack

| Layer | Teknologi |
| --- | --- |
| Server | Hono + `@hono/node-server` |
| DB | PostgreSQL 16 (Docker) |
| ORM | Drizzle ORM + `pg` |
| Validasi | Zod |
| Auth | JWT (`hono/jwt`), HS256 |
| Hashing password | `scrypt` (`node:crypto`) |
| Test | Vitest |

## 2. Menjalankan

```bash
# 1) Dari root — pasang dependency
pnpm install

# 2) Jalankan Postgres (Docker Desktop harus aktif)
cd apps/server
docker compose up -d

# 3) Siapkan env
cp .env.example .env      # Windows: copy .env.example .env

# 4) Migrasi + seed (opsional)
pnpm --filter @dolenae/server db:migrate
pnpm --filter @dolenae/server db:seed

# 5) Jalankan server (watch)
pnpm --filter @dolenae/server dev
# -> http://localhost:3001
```

Script DB:

| Command | Fungsi |
| --- | --- |
| `db:generate` | Generate file migrasi dari perubahan `src/db/schema.ts` |
| `db:migrate` | Jalankan migrasi ke DB |
| `db:push` | Push skema langsung (dev, tanpa file migrasi) |
| `db:studio` | Drizzle Studio |
| `db:seed` | Seed user demo |

| S3_ENDPOINT | `http://localhost:9000` | endpoint S3/MinIO |
| S3_BUCKET | `dolenae` | nama bucket |
| S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY | `minioadmin` | kredensial |
| S3_PUBLIC_URL | `http://localhost:9000/dolenae` | base URL publik file |
| S3_FORCE_PATH_STYLE | `true` | wajib untuk MinIO |
| MAX_UPLOAD_MB | `5` | batas ukuran upload |

Kredensial dev (dari `docker-compose.yml`): DB `dolenae`, user `dolenae`,
password `dolenae`, port `5432`.

## 3. Struktur folder (by usage/layer)

```
apps/server/src/
  config/env.ts          # validasi env (zod) + pemuat .env
  db/                    # client, schema, migrate, seed
  types/                 # tipe transport (envelope, pagination, auth)
  routes/                # definisi path + pasang middleware
  controllers/           # ambil input → panggil service → bentuk response
  services/              # aturan bisnis
  repositories/          # akses DB (hanya di sini query Drizzle)
  middleware/            # request-id, error-handler, auth, validate
  utils/                 # response, pagination, errors, password, jwt
  app.ts                 # rakit middleware + router + error handler
  index.ts               # entry: loadEnv + serve + shutdown
```

Alur: **route → controller → service → repository**.

## 4. Kontrak API

Semua endpoint di bawah **`/api`** (tanpa versioning).

**Sukses:**
```json
{ "success": true, "data": { }, "meta": { } }
```

**Gagal:**
```json
{ "success": false, "error": { "code": "CODE", "message": "...", "details": [] } }
```

Kode error yang dipakai: `BAD_REQUEST` (400), `UNAUTHORIZED` (401),
`FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409),
`VALIDATION_ERROR` (422), `INTERNAL_ERROR` (500).

### Pagination

Query: `?page=1&limit=20&sort=createdAt&order=desc&search=kata`.
`limit` maksimum 100. Meta balikan:

```json
{
  "pagination": {
    "page": 1, "limit": 20, "total": 45, "totalPages": 3,
    "hasNext": true, "hasPrev": false
  }
}
```

## 5. Endpoint

| Method | Path | Auth | Keterangan |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Status server + koneksi DB |
| POST | `/api/auth/register` | – | Daftar (nama, email, password, role?) |
| POST | `/api/auth/login` | – | Masuk → `{ token, user }` |
| GET | `/api/users/me` | Bearer | Profil dari token |
| GET | `/api/users` | Bearer (admin) | Daftar user + pagination |
| GET | `/api/categories` | – | Daftar kategori (`?type=&search=` + pagination) |
| GET | `/api/categories/all` | – | Semua kategori (tanpa pagination) |
| GET | `/api/categories/:id` | – | Detail kategori |
| POST | `/api/categories` | Bearer (admin) | Buat kategori |
| PATCH | `/api/categories/:id` | Bearer (admin) | Ubah kategori |
| DELETE | `/api/categories/:id` | Bearer (admin) | Hapus kategori |
| GET | `/api/destinations` | – | Daftar (`?status=&province=&categoryId=&terrain=&search=` + pagination) |
| GET | `/api/destinations/stats` | – | Ringkasan `{ total, published, draft }` |
| GET | `/api/destinations/slug/:slug` | – | Detail + supports |
| GET | `/api/destinations/:id` | – | Detail by id |
| POST | `/api/destinations` | Bearer (admin) | Buat destinasi |
| PATCH | `/api/destinations/:id` | Bearer (admin) | Ubah destinasi |
| DELETE | `/api/destinations/:id` | Bearer (admin) | Hapus destinasi (cascade) |
| GET | `/api/regions/provinces` | – | Daftar provinsi (dataset wilayah) |
| GET | `/api/regions/regencies` | – | Kabupaten/kota (`?province=`) |
| GET | `/api/regions/districts` | – | Kecamatan (`?regency=&province=`) |
| GET | `/api/regions/reverse` | – | Reverse geocode (`?lat=&lng=`) → `{ province, regency, district, elevation? }` |
| GET | `/api/supports` | – | Daftar support (`?destinationId=` + pagination) || GET | `/api/supports/:id` | – | Detail support |
| POST | `/api/supports` | Bearer (admin) | Buat support |
| PATCH | `/api/supports/:id` | Bearer (admin) | Ubah support |
| DELETE | `/api/supports/:id` | Bearer (admin) | Hapus support |

Header auth: `Authorization: Bearer <token>`. Endpoint tulis (`POST`/`PATCH`/
`DELETE`) dijaga `authRequired` + `requireRole("admin")` dan divalidasi Zod.

### Upload gambar

`POST /api/uploads` (admin, `multipart/form-data`, field `file`, query
`folder?`) → `{ url, key, name, size, mime }`. Disimpan ke object storage
S3-compatible (MinIO self-host; lihat ADR-0005). Batas ukuran `MAX_UPLOAD_MB`
(default 5). Mime diizinkan: `image/jpeg|png|webp|gif|avif`.

`DELETE /api/uploads?url=<publicUrl>` (admin) — hapus berkas (hanya URL dari
base publik kita). Dipakai saat melepas foto destinasi/fasilitas.

Setup storage (sekali):

```bash
cd apps/server && docker compose up -d      # Postgres + MinIO
pnpm --filter @dolenae/server storage:init  # buat bucket + policy baca publik
```

> Data domain kini dilayani dari **tabel DB** (bukan lagi `@dolenae/seed`);
> seed hanya dipakai untuk mengisi awal via `db:seed`.

## 6. Schema DB

Migrasi di `apps/server/drizzle/` (Drizzle ORM).

- `users` — `id`, `name`, `email` (unique), `password_hash`, `role`
  (enum `user_role`), `created_at`, `updated_at`.
- `categories` — `id`, `name`, `slug` (unique), `type`
  (enum `category_type`: `terrain|activity`), `icon`, `description`, timestamps.
- `destinations` — data destinasi (kolom JSONB untuk `location`, `access`,
  `facilities`, `terrain`, `activities`, `images`, `tags`, `best_season`) +
  `difficulty`, `status`, `guide_required`, `elevation_meters`, timestamps.
- `destination_categories` — pivot many-to-many `destination_id` × `category_id`
  (composite PK, cascade delete).
- `travel_supports` — fasilitas/pendukung dengan diskriminator `type`; kolom
  spesifik per tipe (`price_per_night`, `mode`, `cuisine`, dst).

Tabel fase berikutnya (route builder): `track_node`, `route_segment`,
`trail_route`, `trip`.

## 7. Test

```bash
pnpm --filter @dolenae/server test
```

Test API-level tidak menyentuh DB: kontrak envelope, error handler, 404,
validasi, dan auth guard. Ditambah test skema katalog + `slugify`.

Test integrasi DB (regresi CRUD destinasi) dilewati secara default; jalankan
dengan Postgres aktif:

```bash
TEST_DB=1 pnpm --filter @dolenae/server test
```
