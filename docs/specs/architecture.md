# Architecture — Dolenae.id

Dokumen ini menjelaskan struktur monorepo dan arsitektur teknis Dolenae.id.

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Mobile FE | Flutter (Android/iOS) |
| Web FE | TanStack Start (React 19, TanStack Router, Vite) |
| Backend | Hono (Node.js) + TypeScript |
| Shared | `packages/types` (shared TS types), `packages/seed` (data dummy) |
| Package manager | pnpm workspace |

## Struktur Monorepo

```
PBL/
├── apps/
│   ├── mobile/            # Flutter - pengalaman Wisatawan
│   ├── web/               # TanStack Start - landing, dashboard admin & merchant
│   └── server/            # Hono API (fase berikutnya)
├── packages/
│   ├── types/             # single source of truth untuk tipe data domain
│   └── seed/              # data dummy destinasi, kebutuhan pendukung, pengguna
├── docs/
│   ├── prd/               # product overview & PRD detail per modul
│   ├── specs/             # arsitektur, data model, api contract, ai spec
│   └── decisions/         # ADR
└── AGENTS.md              # instruksi konteks untuk AI agent
```

## Prinsip

1. **TypeScript-first.** Semua tipe domain hidup di `packages/types` dan
   dipakai bersama oleh `web` dan `server`. Flutter memiliki model Dart
   sendiri yang diselaraskan secara manual dengan shared types.
2. **Seed sebagai single source data.** Pada fase prototype statis, baik
   Flutter maupun web membaca dari `packages/seed`. Backend Hono nanti
   menggantikan seed dengan endpoint API yang menggunakan tipe yang sama.
3. **Perpisahan frontend.** Mobile (Flutter) dan web (TanStack) adalah klien
   terpisah; keduanya merupakan *thin client* terhadap layer data.

## Alur Data (Prototype Statis)

```
┌────────────┐   ┌──────────────┐   ┌──────────────────┐
│ Flutter app│   │ TanStack web │   │ Hono server      │
│ (mobile)   │   │ (web)        │   │ (fase berikutnya)│
└─────┬──────┘   └──────┬───────┘   └───────┬──────────┘
      │   (manual/JSON) │ (loader/server fn)│
      ▼                 ▼                  ▼
        packages/seed ──────► packages/types
```

## Status Build

- **Fase 1 (sekarang):** scaffold monorepo + shared types + seed + skeleton
  app (web/server/mobile).
- **Fase 2:** web menyusul (landing, dashboard admin/merchant).
- **Fase 3:** mobile flow discovery end-to-end.
- **Fase 4:** AI recommendation (rule-based + adapter LLM opsional).
- **Fase 5:** trip planning + finalisasi dokumen.

## Keputusan Terkait

Lihat `docs/decisions/` untuk ADR. Teknologi spesifik (Hono, TanStack Start,
Flutter) memerlukan ADR tersendiri saat diimplementasikan.