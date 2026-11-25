# AGENTS.md — Konteks untuk AI Agent

Repositori ini berisi **Dolenae.id**, platform *travel discovery dan trip
preparation* untuk destinasi alam Indonesia (pegunungan, perbukitan, dan
wisata alam sejenis).

## Konteks Produk Singkat

- **Core value:** *Discover More, Prepare Better.*
- **Fase pengguna:** menemukan destinasi → memahami kebutuhan perjalanan →
  mempersiapkan kunjungan. Platform membantu menjawab "mau ke mana?",
  "bagaimana ke sana?", dan "apa yang perlu disiapkan?".
- **Bukan:** marketplace booking, penyedia layanan (Gojek/Grab), navigasi/GPS.
- **Roles:** `Wisatawan` (user utama), `Merchant` (penyedia penginapan,
  transportasi, makanan, open trip), `Admin` (verifikasi & kurasi data).

## Dokumentasi

- `docs/prd/product-overview.md` — product overview (baca dulu sebelum kerja).
- `docs/specs/architecture.md` — struktur monorepo & tech stack.
- `docs/specs/data-model.md` — entitas domain.
- `docs/specs/mobile-architecture.md` — struktur & konvensi `apps/mobile`.
- `docs/specs/api-contract.md`, `docs/specs/ai-recommendation.md` — belum
  dibuat, rancang saat implementasi terkait.
- `docs/decisions/` — ADR untuk keputusan arsitektur bernilai dokumentasi.

## Arsitektur & Konvensi

- Monorepo **pnpm workspace**; distribusi: `apps/*` (backend, frontend, mobile)
  dan `packages/*` (types, seed, regions).
- **Next.js (App Router)** di `apps/frontend`, **Express 5** di `apps/backend`,
  **Flutter** di `apps/mobile`.
- Tipe domain bersama tetap di `packages/types`; backend punya tipe turunan
  sendiri per entity di `apps/backend/src/types/` (hasil Zod, patch/list params).
- Data produksi/dev kini dari **PostgreSQL + Drizzle**; `packages/seed` hanya
  contoh data. Backend memakai envelope response seragam & JWT (`jose`).
- Backend: `routes → controllers → services → repositories → db`. Hanya
  `repositories` yang menyentuh DB lewat `database.getDb()`
  (`db/DatabaseClient.ts`). Skema per entity di `db/models/`, seed di `db/seeds/`.
  File service/repository/controller = nama class (PascalCase), tanpa fungsi
  pembungkus di luar class; DTO/tipe tinggal di `apps/backend/src/types/`.
- Bahasa dokumentasi: **Bahasa Indonesia**.

## Aturan Kerja untuk Agent

1. Sebelum mengimplementasi fitur baru, periksa jenis entitas yang dipakai di
   `packages/types`, data contoh di `packages/seed`, dan model DB di
   `apps/backend/src/db/models/`.
2. Perubahan tipe domain bersama dilakukan di `packages/types`, bukan copy
   lokal. Tipe khusus backend (Zod, patch/list params) di
   `apps/backend/src/types/`.
3. Verifikasi dengan menjalankan:
   - `cd apps/backend && pnpm typecheck && pnpm test` (atau binary lokal
     `./node_modules/.bin/tsc --noEmit` + `./node_modules/.bin/vitest run`)
   - `cd apps/frontend && pnpm exec tsc --noEmit` (cek tipe web)
   - `cd apps/mobile && flutter analyze && flutter test` (Flutter)
4. UI web baru dibuat sebagai route di `apps/frontend/src/app/` (App Router).
5. Update `docs/` (PRD/spec) bila ada perubahan perilaku produk yang
   signifikan.

## Mobile (Flutter)

- Struktur **feature-first clean architecture**; detail ada di
  `docs/specs/mobile-architecture.md`.
- Fitur di `lib/src/features/<fitur>/{domain,data,presentation}`. `domain`
  bebas Flutter; hanya `data` yang menyentuh HTTP/Drift/SharedPreferences;
  `presentation` hanya lewat controller + `domain`.
- Kode lintas fitur: `core/` (config, error, network, database, result,
  usecase, util) dan `shared/` (widget/ikon/tema).
- `lib/src/app/di/app_dependencies.dart` adalah satu-satunya tempat
  instansiasi implementasi repository; controller dibangun di `app/app.dart`.
- State pakai `provider` + `ChangeNotifier` dengan nama kelas `*Controller`.
- Operasi gagal mengembalikan `Result<T>`; `ApiException` berhenti di lapisan
  data (diubah jadi `AppFailure` berpesan Bahasa Indonesia).
- Import internal memakai `package:dolenae_mobile/src/...`.
- Data contoh per fitur memakai `abstract final class ...SeedData`
  (bukan satu `seed_data.dart` global).

## Desain & Figma (figma-cli)

- **DESIGN.md** (root) adalah sumber desain/tema "Alam" Dolenae (warna,
  tipografi, spacing, radius, komponen). Sebelum mendesain, ikuti token di
  sana; import ke Figma: `figma-cli import DESIGN.md`.
- figma-cli mengontrol **Figma Desktop** langsung (tanpa API key). Buka Figma
  Desktop lalu `figma-cli connect` sekali per sesi. Dokumen lengkap:
  `REFERENCE.md` pada repo github.com/silships/figma-cli.
- Buat elemen visual dengan `render`/`render-batch` (positioning pintar) —
  jangan `eval`. "N kartu/tombol" = N node top-level terpisah. Jangan hapus
  node milik user. Setelah membuat, verifikasi dengan `figma-cli verify "<id>"
  --measure`.
- Saat sistem token aktif, bind warna dgn `var:NamaToken`, jangan raw hex.
  Ikon: SVG Lucide (`<Icon name="lucide:*" />`), bukan emoji.
- Aturan operator lengkap ada di `.cursor/rules/figma-cli.mdc`.
- **Sebelum kerja Figma (bikin design system, token, komponen/variant,
  render frame, low-fi), baca `docs/skills/figma-cli/SKILL.md`** — berisi
  workflow, pola component set + variant, dan jebakan yang sudah terbukti
  (font, shadow, tag balance, pivot rotasi, `eval`/`closePlugin`).
- Panduan integrasi figma-cli untuk AI coding tool lain (opencode, Claude
  Code, Cursor, Copilot, Codex, Cline, local LLM, dll):
  `docs/guides/figma-cli-ai-tools.md`.

## Skills (lokal, wajib)

- **Library skills project ada di `docs/skills/`** — satu folder per skill,
  berisi `SKILL.md` (format agent skill standar). Ini tempat baca & simpan
  skill, bukan `~/.agents/skills` atau `.claude/skills`.
- Sebelum kerja yang memuat gaya/desain UI (landing, redesign, kartu, dsb.),
  baca `docs/skills/design-taste-frontend/SKILL.md` dan ikuti arahannya.
- **Cara membaca skill lain:** cari di `docs/skills/<nama>/SKILL.md`.
- **Cara menambah skill baru:** install/salin lalu taruh di `docs/skills/`
  dengan nama folder = `name` di frontmatter SKILL.md. Contoh untuk skill dari
  repo `owner/repo`: `git clone --depth 1 https://github.com/owner/repo` →
  salin folder skill-nya → `docs/skills/<nama>/`. Setelah menambah, cek ada
  konflik nama. Update bagian Skills ini bila perlu.
- Jangan install skill ke lokasi global (di luar repo) kecuali diminta.

## Script Utama (dari root)

| Command | Fungsi |
| --- | --- |
| `pnpm dev:web` | jalankan web Next.js (port 3000) |
| `pnpm dev:api` | jalankan Express API (tsx watch, port 3001) |
| `pnpm typecheck:api` | cek tipe backend |
| `cd apps/backend && pnpm test` | unit + integration test backend (Vitest) |