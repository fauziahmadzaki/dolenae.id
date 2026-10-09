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
- `docs/specs/api-contract.md`, `docs/specs/ai-recommendation.md` — belum
  dibuat, rancang saat implementasi terkait.
- `docs/decisions/` — ADR untuk keputusan arsitektur bernilai dokumentasi.

## Arsitektur & Konvensi

- Monorepo **pnpm workspace**; distribusi: `apps/*` dan `packages/*`.
- **TypeScript-first.** Tipe domain tinggal di `packages/types` (satu sumber
  kebenaran) dan dipakai `apps/web` + `apps/server`.
- Fase sekarang: **prototype statis** — data dari `packages/seed`, tanpa
  auth/DB. Backend Hono (`apps/server`) menyajikan seed via API dan nanti
  menggantikan data statis.
- Bahasa dokumentasi: **Bahasa Indonesia**.

## Aturan Kerja untuk Agent

1. Sebelum mengimplementasi fitur baru, periksa jenis entitas yang dipakai di
   `packages/types` dan data contoh di `packages/seed`.
2. Perubahan tipe domain dilakukan di `packages/types`, bukan copy lokal.
3. Verifikasi dengan menjalankan:
   - `pnpm typecheck` (semua paket TS)
   - `cd apps/mobile && flutter analyze` (Flutter)
4. UI baru untuk web dibuat sebagai route file di `apps/web/src/routes/`.
5. Update `docs/` (PRD/spec) bila ada perubahan perilaku produk yang
   signifikan.

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
| `pnpm dev:web` | jalankan web TanStack Start (port 3000) |
| `pnpm dev:server` | jalankan Hono API (tsx watch) |
| `pnpm typecheck` / `pnpm build` | cek tipe / build semua paket |