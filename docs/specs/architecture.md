# Architecture — Dolenae.id

Dokumen ini menjelaskan struktur monorepo dan arsitektur teknis Dolenae.id.

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Mobile FE | Flutter (Android/iOS) |
| Web FE | Next.js 16 (App Router, React 19, Tailwind CSS v4) |
| Backend | Express 5 (Node.js) + TypeScript |
| Database | PostgreSQL 16 (Docker) + Drizzle ORM |
| Auth | JWT (`jose`) |
| Shared | `packages/types` (shared TS types), `packages/seed` (data dummy), `packages/regions` (dataset wilayah) |
| Package manager | pnpm workspace |

## Struktur Monorepo

```
PBL/
├── apps/
│   ├── mobile/            # Flutter - pengalaman Wisatawan
│   ├── frontend/          # Next.js (App Router) - landing, dashboard admin & merchant
│   └── backend/           # Express 5 API + PostgreSQL/Drizzle
├── packages/
│   ├── types/             # single source of truth untuk tipe data domain
│   ├── seed/              # data dummy destinasi, kebutuhan pendukung, pengguna
│   └── regions/           # dataset wilayah + reverse geocode
├── docs/
│   ├── prd/               # product overview & PRD detail per modul
│   ├── specs/             # arsitektur, data model, api contract, ai spec
│   └── decisions/         # ADR
└── AGENTS.md              # instruksi konteks untuk AI agent
```

## Prinsip

1. **TypeScript-first.** Tipe domain bersama hidup di `packages/types` dan
   dipakai `frontend` + `backend`. Flutter memiliki model Dart sendiri yang
   diselaraskan secara manual dengan shared types.
2. **Database sebagai sumber data.** Backend menyajikan data dari PostgreSQL
   via Drizzle. `packages/seed` hanya berisi contoh data untuk seeding awal.
3. **Perpisahan frontend.** Mobile (Flutter) dan web (Next.js) adalah klien
   terpisah; keduanya merupakan *thin client* terhadap API `/api`.

## Alur Data

```
┌────────────┐   ┌──────────────┐   ┌──────────────────┐
│ Flutter app│   │ Next.js web  │   │ Express API      │
│ (mobile)   │   │ (frontend)   │   │ (backend)        │
└─────┬──────┘   └──────┬───────┘   └───────┬──────────┘
      │      HTTP/JSON  │                   │ SQL (Drizzle)
      └─────────────────┴──────────────────►│
                                             ▼
                                    PostgreSQL 16
```

## Status Build

- **Fase 1:** scaffold monorepo + shared types + seed + skeleton app
  (web/server/mobile). ✅
- **Fase 1.5 (sekarang):** fondasi backend — Postgres + Drizzle, envelope API,
  global error handler, pagination, routing, middleware, JWT auth, service
  user (register/login/me). Lihat `docs/specs/backend-setup.md`. ✅
- **Fase 2:** web menyusul (landing, dashboard admin/merchant).
- **Fase 3:** mobile flow discovery end-to-end.
- **Fase 4:** AI recommendation (rule-based + adapter LLM opsional).
- **Fase 5:** trip planning + finalisasi dokumen.

## Pola Backend (`apps/backend`)

Backend saat ini memakai **Express 5 + TypeScript + Drizzle ORM** dengan alur
`routes → controllers → services → repositories → db`. Layer `repositories`,
`services`, dan `controllers` memakai pola **class-based OOP**.

- **Repository** — class dengan getter `private get db()` yang mengembalikan
  `database.getDb()`. Satu file per repository dengan **nama file = nama class**
  (PascalCase), mis. `repositories/DestinationRepository.ts`, dan satu instance
  diekspor sebagai singleton:
  `export const destinationRepository = new DestinationRepository()`.
- **Database** — `db/DatabaseClient.ts` berisi class `DatabaseClient` (pool +
  Drizzle, lazy) dengan singleton `database`: `getDb()`, `getPool()`, `ping()`,
  `close()`. Skema dipecah per entity di `db/models/<Entity>.ts`
  (`User.ts`, `Destination.ts`, `TrailRoute.ts`, …), `pgEnum` di
  `db/models/enums.ts`, dan `db/models/index.ts` jadi barrel
  (`import { users } from "../db/models"`). Seed di `db/seeds/`.
- **Service** — class dengan helper internal sebagai `private` method
  (mis. `toPublicDestination`, `resolveCategories`). Satu file per service,
  **nama file = nama class** (PascalCase), mis. `services/DestinationService.ts`,
  dengan instance singleton. Tidak ada fungsi pembungkus di luar class — semua
  pemanggil memakai singleton. Helper lintas service berbentuk class juga
  PascalCase (`ai/ChecklistUtil.ts`, `ai/AiPayloadValidator.ts`).
- **Controller** — class dengan handler berupa **arrow function property**
  bertipe `RequestHandler`, bukan method biasa, agar `this` tetap terikat saat
  dipanggil Express. Satu file per controller, **nama file = nama class**
  (PascalCase), mis. `controllers/DestinationController.ts`, dengan instance
  singleton `export const destinationController = new DestinationController()`.
  Controller AI disatukan di `AiController.ts` untuk endpoint `/api/ai/*` dan
  `/api/admin/ai/*`.
- **Types** — tipe data dipisah dari implementasi: tipe hasil Zod, tipe
  patch/update (`UserPatch`, `DestinationPatch`, `TrackNodePatch`), filter list
  params (`DestinationListParams`), hasil join (`JoinedTravelSupport`,
  `AppSettingWithUser`), dan DTO service (`PublicDestination`, `RouteGraph`,
  `UploadedImage`, `PublicAiSettings`, tipe AI) tinggal per entity di
  `src/types/`. Service & repository mengimpornya dengan `import type`.
- **Routes, middleware, schemas, utils, dan db** tetap memakai pola
  fungsi/konstanta dan tidak berubah saat refactor ini.

Nama export lama dipertahankan agar `routes/` tidak perlu diubah.

## Keputusan Terkait

Lihat `docs/decisions/` untuk ADR. Teknologi spesifik (Express, Next.js,
Flutter) memerlukan ADR tersendiri saat diimplementasikan.