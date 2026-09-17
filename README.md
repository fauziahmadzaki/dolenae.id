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
| `apps/web` | **TanStack Start** (React 19 + TanStack Router + Vite + Tailwind v4) — landing, katalog destinasi, dashboard admin/merchant |
| `apps/server` | **Hono** API (Node.js) — menyajikan data seed, nanti menggantikan data statis |
| `packages/types` | **Single source of truth** tipe domain (satu-satunya tempat ubah tipe) |
| `packages/seed` | Data contoh destinasi & kebutuhan pendukung (penginapan, transportasi, makanan) |
| `figma/` + `DESIGN.md` | Aset desain: token tema "Alam", panduan & skill figma-cli |

### Domain yang dimodelkan (`packages/types`)

- **Destination** — terrain (gunung, bukit, danau, air-terjun, pantai, dll),
  aktivitas, kondisi (ramah pemula … butuh lokal guide), lokasi, akses, fasilitas.
- **TravelSupport** — penginapan, transportasi, food spot di sekitar destinasi.
- **Trip** — rencana perjalanan, item perjalanan, checklist persiapan.
- **AI** — preferensi, konteks & hasil rekomendasi, skor aturan.
- **User** — wisatawan, merchant, admin.

### Halaman web yang sudah ada (`apps/web/src/routes`)

`/` landing · `/destinations` katalog · `/destinations/$slug` detail · `/admin`
placeholder dashboard admin.

### Endpoint API (`apps/server`)

`GET /` · `GET /health` · `GET /destinations` · `GET /destinations/:slug` ·
`GET /supports` (`?destinationId=:id`)

> **Fase sekarang: prototype statis.** Data berasal dari `packages/seed`, belum
> ada auth/DB. Web & Flutter membaca seed; server Hono menyajikan seed via API.

---

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Web FE | TanStack Start (React 19, TanStack Router, Vite 8, Tailwind CSS v4) |
| Mobile FE | Flutter (Dart SDK ^3.13) |
| Backend | Hono + `@hono/node-server` + TypeScript (tsx) |
| Shared | `@dolenae/types`, `@dolenae/seed` |
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

### Web (TanStack Start) — port 3000

```bash
pnpm dev:web
# buka http://localhost:3000
```

### Server API (Hono) — port 3001

```bash
pnpm dev:server
# API di http://localhost:3001  (cek: http://localhost:3001/health)
```

Port server bisa diubah lewat env `PORT`.

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
| `pnpm dev:web` | Jalankan web TanStack Start (port 3000) |
| `pnpm dev:server` | Jalankan Hono API dengan `tsx watch` (port 3001) |
| `pnpm build` | Build semua paket (`pnpm -r build`) |
| `pnpm typecheck` | Cek tipe semua paket TS |
| `pnpm lint` | Lint semua paket |
| `cd apps/mobile && flutter analyze` | Cek tipe/analisis Flutter |

---

## Struktur Monorepo

```
PBL/
├── apps/
│   ├── mobile/    # Flutter — pengalaman Wisatawan
│   ├── server/    # Hono API
│   └── web/       # TanStack Start — web Wisatawan & dashboard admin
├── packages/
│   ├── seed/      # data dummy destinasi & kebutuhan pendukung
│   └── types/     # tipe domain (single source of truth)
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
- `docs/specs/ui-ux-low-fi-system.md` — sistem desain low-fi.
- `DESIGN.md` — token warna, tipografi, spacing, radius, komponen.
- `docs/skills/` — skill lokal (mis. `figma-cli`, `design-taste-frontend`).
- `AGENTS.md` — aturan kerja untuk agent (konvensi, verifikasi, alur Figma).
