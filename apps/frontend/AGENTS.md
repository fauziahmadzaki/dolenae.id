# AGENTS.md — Frontend (apps/frontend)

Aturan kerja untuk agen AI di web Dolenae (Next.js App Router). Baca juga
`AGENTS.md` root.

## Overview

Web publik + admin Dolenae. Fase sekarang: setup fondasi.

## Stack

| Layer | Teknologi |
| --- | --- |
| Framework | **Next.js (App Router)** |
| UI | React 19 |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) |
| Bahasa | TypeScript |
| Data | `apiFetch` ke backend (`NEXT_PUBLIC_API_URL`) |

## Struktur

```
src/
  app/                # route App Router (layout, page, ...)
  lib/
    api/              # klien API: client.ts (browser), server.ts (SSR)
    query/            # setup TanStack Query + helper optimistic
    cn.ts             # gabung className
  components/         # ui (button, input, select, dialog, toaster), providers
  types/              # tipe domain (manual)
  features/           # fitur web — menyusul
```

## Konvensi

- **Server Components** default; tandai `"use client"` hanya bila perlu interaksi.
- **API:**
  - `import { get, post, patch, del } from "~/lib/api/client"` — client (browser).
  - `import { get, post, patch, del } from "~/lib/api/server"` — server (SSR).
  - Base URL otomatis: server → `API_URL` (privat), browser → `NEXT_PUBLIC_API_URL`.
  - Envelope `{ success, data, meta }`; error → `ApiError`.
- **Data fetching:** TanStack Query (`useQuery`/`useMutation`).
  - Query client: `~/lib/query/client` (provider di root layout).
  - Optimistic update: `applyOptimistic` / `rollbackOptimistic` / `settleInvalidate`.
- Alias import `~/*` → `src/*`.
- Komentar kode: bahasa Inggris, secukupnya.

## Menjalankan

```bash
cd apps/frontend
cp .env.example .env.local
pnpm install
pnpm dev        # http://localhost:3000
pnpm typecheck
pnpm build
```

## Aturan kerja

- `pnpm typecheck` & `pnpm build` harus hijau sebelum selesai.
- Tipe domain **manual** (tak ada paket shared) — sinkron dengan backend.
