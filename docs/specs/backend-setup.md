# Backend Setup — Dolenae.id

Panduan menjalankan backend (Express 5 + Drizzle + PostgreSQL) dan konvensi API.

## 1. Stack

| Layer | Teknologi |
| --- | --- |
| Server | Express 5 |
| DB | PostgreSQL 16 (Docker) |
| ORM | Drizzle ORM + `pg` |
| Validasi | Zod |
| Auth | JWT (`jose`), HS256 |
| Hashing password | `scrypt` (`node:crypto`) |
| Upload | `multer` + S3/MinIO (`@aws-sdk/client-s3`) |
| AI | Gemini API (opsional) + rule-based fallback |
| Test | Vitest |

## 2. Menjalankan

```bash
# 1) Dari root — pasang dependency
pnpm install

# 2) Jalankan Postgres (Docker Desktop harus aktif)
cd apps/backend
docker compose up -d

# 3) Siapkan env
cp .env.example .env      # Windows: copy .env.example .env

# 4) Migrasi + seed (opsional)
pnpm db:migrate
pnpm db:seed

# 5) Jalankan server (watch) — dari root atau folder ini
pnpm dev                  # -> http://localhost:3001
```

Script DB:

| Command | Fungsi |
| --- | --- |
| `db:generate` | Generate file migrasi dari perubahan `src/db/models/` |
| `db:migrate` | Jalankan migrasi ke DB |
| `db:push` | Push skema langsung (dev, tanpa file migrasi) |
| `db:studio` | Drizzle Studio |
| `db:seed` | Seed data awal (kategori, destinasi, route network, user demo) |

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
apps/backend/src/
  config/AppConfig.ts     # loader env (schema Zod di schemas/env.schema.ts)
  db/DatabaseClient.ts    # class DatabaseClient + singleton `database`
  db/models/              # satu file per entity (User.ts, Destination.ts, …) + enums.ts + index.ts
  db/seeds/               # seed.ts + seed-networks.ts (idempoten, `pnpm db:seed`)
  types/                  # tipe domain, z.infer, patch/list params
  schemas/                # schema validasi Zod
  routes/                 # definisi path + pasang middleware
  controllers/            # ambil input → panggil service → bentuk response
  services/               # aturan bisnis
  repositories/           # akses DB (hanya di sini query Drizzle), file = nama class
  middleware/             # request-id, error-handler, auth, validate
  utils/                  # response, pagination, errors, password, jwt, storage
  openapi/                # spec OpenAPI + Scalar
  app.ts                  # rakit middleware + router + error handler
  index.ts                # entry: AppConfig + listen + shutdown
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
| POST | `/api/auth/google` | – | Login Google (id token) |
| POST | `/api/auth/forgot-password` | – | Kirim tautan reset |
| POST | `/api/auth/reset-password` | – | Reset dengan token |
| POST | `/api/auth/verify-email` | – | Verifikasi email (soft) |
| POST | `/api/auth/resend-verification` | – | Kirim ulang tautan verifikasi |
| GET | `/api/auth/me` | Bearer | Profil dari token |
| GET | `/api/users` | Bearer (admin) | Daftar user + pagination/filter |
| POST | `/api/users` | Bearer (admin) | Buat user |
| GET | `/api/users/:id` | Bearer (admin) | Detail user |
| PATCH | `/api/users/:id` | Bearer (admin) | Ubah user |
| DELETE | `/api/users/:id` | Bearer (admin) | Hapus user |
| GET | `/api/categories` | – | Daftar kategori (`?type=&search=` + pagination) |
| GET | `/api/categories/:id` | – | Detail kategori |
| POST/PATCH/DELETE | `/api/categories[/:id]` | Bearer (admin) | CRUD kategori |
| GET | `/api/destinations` | – | Daftar (`?status=&difficulty=&categoryId=&search=` + pagination) |
| GET | `/api/destinations/:id` | – | Detail destinasi (+ kategori) |
| POST/PATCH/DELETE | `/api/destinations[/:id]` | Bearer (admin) | CRUD destinasi (cascade) |
| GET | `/api/regions/provinces` | – | Daftar provinsi |
| GET | `/api/regions/regencies` | – | Kabupaten/kota (`?province=`) |
| GET | `/api/regions/districts` | – | Kecamatan (`?regency=&province=`) |
| GET | `/api/regions/reverse` | – | Reverse geocode (`?lat=&lng=`) → wilayah + elevasi |
| GET | `/api/destinations/:id/supports` | – | Support milik destinasi (pagination) |
| GET | `/api/supports/:id` | – | Detail support |
| POST/DELETE | `/api/uploads` | Bearer (admin) | Upload/hapus gambar (multipart / `?url=`) |
| GET | `/api/ai/options` | – | Pilihan filter AI (wilayah, aktivitas, terrain) |
| POST | `/api/ai/itineraries` | Bearer (opsional) | Rencana perjalanan AI + checklist biaya |
| GET/PUT | `/api/admin/ai/settings` | Bearer (admin) | Baca/simpan konfigurasi Gemini |
| GET | `/api/admin/ai/models` | Bearer (admin) | Daftar model Gemini |
| POST | `/api/admin/ai/test` | Bearer (admin) | Tes koneksi Gemini (rate limited) |
| GET | `/api/public/destinations/:id/route-graph` | – | Graf jalur untuk peta publik |
| GET | `/api/public/routes/:id/profile` | – | Profil elevasi publik |
| GET | `/api/destinations/:id/route-graph` | Bearer (admin) | Graf jalur (editor) |
| GET/POST | `/api/destinations/:id/{track-nodes,segments,routes}` | Bearer (admin) | CRUD route builder |
| PATCH/DELETE | `/api/{track-nodes,segments,routes}/:id` | Bearer (admin) | Ubah/hapus node, segmen, jalur |
| GET | `/api/routes/:id/profile` | Bearer (admin) | Profil elevasi jalur |

Header auth: `Authorization: Bearer <token>`. Endpoint tulis (`POST`/`PATCH`/
`DELETE`) dijaga `authRequired` + `requireRole("admin")` dan divalidasi Zod.
Dokumentasi interaktif: `GET /api/docs`; spec: `GET /api/openapi.json`.

### Upload gambar

`POST /api/uploads` (admin, `multipart/form-data`, field `file`, query
`folder?`) → `{ url, key, name, size, mime }`. Disimpan ke object storage
S3-compatible (MinIO self-host; lihat ADR-0005). Batas ukuran `MAX_UPLOAD_MB`
(default 5). Mime diizinkan: `image/jpeg|png|webp|gif|avif`.

`DELETE /api/uploads?url=<publicUrl>` (admin) — hapus berkas (hanya URL dari
base publik kita). Dipakai saat melepas foto destinasi/fasilitas.

Driver storage dipilih lewat `STORAGE_DRIVER`:

| Nilai | Perilaku |
| --- | --- |
| `s3` (default) | Upload ke MinIO/S3, URL dari `S3_PUBLIC_URL` |
| `local` | Simpan di `UPLOAD_DIR` dan sajikan lewat `/uploads` (`PUBLIC_API_URL`) — fallback dev saat image Docker tidak tersedia |

Setup storage (sekali):

```bash
cd apps/backend && docker compose up -d          # Postgres + MinIO
pnpm --filter @dolenae/backend storage:init      # buat bucket + policy baca publik
```

> Data domain dilayani dari **tabel DB** (bukan lagi `@dolenae/seed`);
> seed hanya dipakai untuk mengisi awal via `db:seed`.

## 6. Schema DB

Model per entity di `apps/backend/src/db/models/` (barrel: `models/index.ts`,
enum: `models/enums.ts`). Migrasi di `apps/backend/drizzle/` (Drizzle ORM).

- `users` — profil + auth (`password_hash`, `role`, `provider`, `google_id`,
  `email_verified_at`, `last_login_at`).
- `password_reset_tokens`, `email_verification_tokens` — token hash (SHA-256),
  FK cascade ke `users`.
- `categories` — `name`, `slug` (unique), `type` (`terrain|activity`), `icon`,
  `description`.
- `destinations` — data destinasi dengan kolom datar (`province`, `regency`,
  `district`, `latitude`, `longitude`, `access_*`), plus `difficulty`, `status`,
  `guide_required`, `elevation_meters`, `best_season`, `tags`, `images`.
- `destination_categories` — pivot many-to-many (composite PK, cascade delete).
- `travel_supports` — pendukung destinasi dengan enum `support_category`
  (`accommodation|transport|food`) + kolom harga/kontak/fasilitas.
- Route builder: `track_nodes`, `route_segments`, `trail_routes`,
  `trail_route_nodes`, `trail_route_segments`, `trail_route_points`.
- `ai_itineraries` — cache/audit hasil AI (`request_hash`, `request_json`,
  `result_json`, `engine`, `model`, `latency_ms`).
- `app_settings` — konfigurasi admin (`key`, `value`, `encrypted`, `updated_by`).

## 7. Test

```bash
pnpm --filter @dolenae/backend test
```

Test API-level tidak menyentuh DB sungguhan (mock `db/DatabaseClient`): kontrak
envelope, error handler, 404, validasi, auth guard, dan query repository.

Test integrasi DB (regresi CRUD) dilewati secara default; jalankan dengan
Postgres aktif:

```bash
TEST_DB=1 pnpm --filter @dolenae/backend test
```
