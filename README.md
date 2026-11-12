# Dolenae.id

> **Discover More, Prepare Better.**

Platform *travel discovery* dan *trip preparation* untuk destinasi alam
Indonesia — pegunungan, perbukitan, dan wisata alam sejenis. Dolenae membantu
wisatawan dari tahap **menemukan destinasi** → **memahami kebutuhan perjalanan**
→ **mempersiapkan kunjungan** dalam satu platform.

Dolenae **bukan** marketplace booking, bukan penyedia layanan (Gojek/Grab), dan
bukan aplikasi navigasi/GPS.

---

## Apa saja isinya

Monorepo berisi tiga aplikasi dan dua paket bersama:

| Bagian | Isi |
| --- | --- |
| `apps/mobile` | **Flutter** — pengalaman Wisatawan (Android/iOS) |
| `apps/frontend` | **Next.js 16** (App Router, React 19, Tailwind v4) — landing, katalog destinasi, dashboard admin/merchant |
| `apps/backend` | **Express 5** API (TypeScript, `tsx`) — REST `/api` + PostgreSQL/Drizzle |
| `packages/types` | **Single source of truth** tipe domain (satu-satunya tempat ubah tipe) |
| `packages/seed` | Data contoh destinasi & kebutuhan pendukung (penginapan, transportasi, makanan) |
| `packages/regions` | Dataset wilayah Indonesia (provinsi/kabupaten/kecamatan) + reverse geocode |
| `figma/` + `DESIGN.md` | Aset desain: token tema "Alam", panduan & skill figma-cli |

### Domain yang dimodelkan (`packages/types`)

- **Destination** — terrain (gunung, bukit, danau, air-terjun, pantai, dll),
  aktivitas, kondisi (ramah pemula … butuh lokal guide), lokasi, akses, fasilitas.
- **TravelSupport** — penginapan, transportasi, food spot di sekitar destinasi.
- **Trip** — rencana perjalanan, item perjalanan, checklist persiapan.
- **AI** — preferensi, konteks & hasil rekomendasi, skor aturan.
- **User** — wisatawan, merchant, admin.

### Halaman web yang sudah ada (`apps/frontend/src/app`)

`/` landing · `/destinations` katalog · `/destinations/[slug]` detail ·
`/auth/login` masuk admin · `/admin` dashboard admin (guard) ·
`/admin/users` pengguna · `/admin/destinasi` destinasi & kategori ·
`/admin/destinasi/[id]/rute` route builder. Lihat `docs/specs/web-admin.md`.

### Endpoint API (`apps/backend`)

Semua di bawah `/api` (dokumentasi interaktif: `GET /api/docs`, spec:
`GET /api/openapi.json`):

`GET /api/health` · `POST /api/auth/{register,login,google,forgot-password,reset-password,verify-email,resend-verification}` ·
`GET /api/auth/me` · `GET|POST|PATCH|DELETE /api/users` (admin) ·
`/api/categories` · `/api/destinations` · `/api/supports` · `/api/regions/*` ·
`/api/uploads` · `/api/ai/{options,itineraries}` · `/api/admin/ai/{settings,models,test}` ·
`/api/destinations/:id/{route-graph,track-nodes,segments,routes}` (route builder).

> **Backend sudah memakai PostgreSQL + Drizzle** (bukan lagi data statis).
> Envelope response seragam, global error handler, pagination, JWT auth, dan
> upload S3/MinIO. Seed hanya untuk mengisi data awal (`pnpm db:seed` di
> `apps/backend`). Detail: `docs/specs/backend-setup.md`.

---

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Web FE | Next.js 16 (App Router, React 19, Tailwind CSS v4) |
| Mobile FE | Flutter (Dart SDK ^3.13) |
| Backend | Express 5 + TypeScript (tsx) |
| Database | PostgreSQL 16 + Drizzle ORM |
| Auth | JWT (`jose`) |
| Shared | `@dolenae/types`, `@dolenae/seed`, `@dolenae/regions` |
| Package manager | pnpm workspace |

---

## Prasyarat

- **Node.js** LTS 20+ (disarankan 22) dan **pnpm** (lihat `packageManager` di
  `package.json`).
- **Flutter SDK** (hanya bila menjalankan `apps/mobile`).
- Opsional: **Figma Desktop** + `figma-cli` bila mengerjakan desain.

---

## Install

Dari root project:

```bash
pnpm install
```

pnpm workspace otomatis memasang dependency `apps/*` dan `packages/*`, dan
menautkan `@dolenae/types` & `@dolenae/seed` sebagai workspace dependency.

---

## Menjalankan

Jalankan tiap aplikasi dari root (atau dari folder masing-masing paket).

### Web (Next.js) — port 3000

```bash
pnpm dev:web
# buka http://localhost:3000
```

### Backend API (Express) — port 3001

```bash
# 1) Jalankan Postgres (Docker Desktop aktif)
cd apps/backend && docker compose up -d && cd ../..

# 2) Env + migrasi + seed
cp apps/backend/.env.example apps/backend/.env
cd apps/backend
pnpm db:migrate
pnpm db:seed

# 3) Jalankan
pnpm dev:api        # dari root
# API di http://localhost:3001  (cek: http://localhost:3001/api/health)
```

Port backend bisa diubah lewat env `PORT`.

### Mobile (Flutter)

```bash
cd apps/mobile
flutter pub get
flutter run
```

> `pnpm dev:mobile` hanya menampilkan petunjuk — Flutter dijalankan dengan tool
> Flutter, bukan pnpm.

---

## Script (dari root)

| Command | Fungsi |
| --- | --- |
| `pnpm dev:web` | Jalankan web Next.js (port 3000) |
| `pnpm dev:api` | Jalankan Express API dengan `tsx watch` (port 3001) |
| `pnpm typecheck:api` | Cek tipe backend (`tsc --noEmit`) |
| `cd apps/backend && pnpm typecheck && pnpm test` | Typecheck + Vitest backend |
| `cd apps/mobile && flutter analyze` | Cek tipe/analisis Flutter |

---

## Struktur Monorepo

```
PBL/
├── apps/
│   ├── mobile/    # Flutter — pengalaman Wisatawan
│   ├── backend/   # Express API + PostgreSQL/Drizzle
│   └── frontend/  # Next.js — web Wisatawan & dashboard admin
├── packages/
│   ├── seed/      # data dummy destinasi & kebutuhan pendukung
│   ├── types/     # tipe domain (single source of truth)
│   └── regions/   # dataset wilayah + reverse geocode
├── docs/          # PRD, specs, decisions, skills
├── figma/         # aset kerja figma-cli
├── DESIGN.md      # sumber token desain tema "Alam"
└── AGENTS.md      # konteks & aturan kerja untuk AI agent
```

---

## Dokumentasi

- `docs/prd/product-overview.md` — product overview (baca dulu sebelum kerja).
- `docs/specs/architecture.md` — struktur monorepo & arsitektur.
- `docs/specs/data-model.md` — entitas domain.
- `docs/specs/backend-setup.md` — backend (Express + Drizzle + Postgres), kontrak
  API, pagination, endpoint, cara menjalankan.
- `docs/specs/web-admin.md` — halaman login & dashboard admin web.
- `docs/specs/ui-ux-low-fi-system.md` — sistem desain low-fi.
- `docs/specs/design-system-hifi.md` — design system hi-fi "Alam" di Figma.
- `docs/specs/ui-ux-hifi-mobile.md` — layar hi-fi mobile.
- `docs/specs/ui-ux-hifi-web.md` — layar hi-fi web publik (1440px).
- `docs/specs/route-builder.md` — Route Builder admin (titik, ruas, jalur,
  profil elevasi); layar Figma di deret `x=18300` page `Hi-Fi Web`.
- `docs/decisions/` — ADR (mis. `ADR-0001-route-model.md`).
- `DESIGN.md` — token warna, tipografi, spacing, radius, komponen.
- `docs/skills/` — skill lokal (mis. `figma-cli`, `design-taste-frontend`).
- `AGENTS.md` — aturan kerja untuk agent (konvensi, verifikasi, alur Figma).
