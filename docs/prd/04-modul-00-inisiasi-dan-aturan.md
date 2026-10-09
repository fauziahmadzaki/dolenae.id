# 04 — Modul 0: Inisiasi & Aturan Proyek

- **PIC:** Fauzi Ahmad Zaki ([01](01-pic-fauzi-ahmad-zaki.md))
- **Durasi:** ~2–3 hari
- **Dependency:** —
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tujuan

Repo siap dikerjakan + aturan & fondasi bersama terkunci, sehingga Modul 1–6
bisa dikerjakan tanpa saling mengunci.

## Backend

- [ ] Scaffold `apps/backend` (Express + TypeScript + `tsx`).
- [ ] `config/env.ts` + middleware: `requestId`, logger, `helmet`, `cors`, JSON limit.
- [ ] Envelope response `{ success, data, meta? }` + global error handler + `AppError`.
- [ ] Endpoint `GET /api/health`.

## Frontend

- [ ] Scaffold `apps/frontend` (Next.js App Router + TS + Tailwind v4 + alias `~/*`).
- [ ] Bawa token tema dari `git show HEAD:apps/web/src/styles/app.css` + `app/layout.tsx`.
- [ ] Port fondasi bersama: `lib/api.ts`, `lib/cn.ts`, `components/{ui,icons,layout}`.
- [ ] Halaman `app/design-system/page.tsx` untuk verifikasi komponen.

## Aturan & Repo

- [ ] Backup `apps/server/.env` (gitignored) ke lokasi aman.
- [ ] `git rm -r apps/web apps/server`; bersihkan sisa `node_modules`.
- [ ] Tulis **kontrak API v1** di `docs/specs/api-contract.md`.
- [ ] Tulis aturan di `AGENTS.md` root + `apps/frontend/AGENTS.md` + `apps/backend/AGENTS.md`.
- [ ] **ADR:** tandai `ADR-0002` digantikan, tulis **ADR-0006** (FE Next.js) &
      **ADR-0007** (BE Express), amandemen `ADR-0003` (env peta) & `ADR-0005` (multer).
- [ ] Update root `package.json` (`dev:web`, `dev:api`), `pnpm-workspace.yaml`, `pnpm install`.
- [ ] Setup ESLint + Prettier + CI (GitHub Actions: install + typecheck + build).

## Rencana Commit

| # | Commit | Isi |
| --- | --- | --- |
| 1 | `chore: hapus web/server lama + scaffold frontend & backend` | Hapus + scaffold |
| 2 | `feat(backend): envelope, error handler, health, middleware dasar` | Backend fondasi |
| 3 | `feat(frontend): layout, token tema, lib/api, komponen fondasi` | Frontend fondasi |
| 4 | `chore: kontrak API v1, ADR, AGENTS, lint, CI` | Aturan, ADR & tooling |

## Output

- Dua app hello-world berjalan.
- Fondasi desain & API siap dikonsumsi modul lain.
- Kontrak API v1 & aturan tertulis.

## Kriteria Selesai (DoD)

- [ ] `pnpm typecheck` hijau.
- [ ] `pnpm build` hijau.
- [ ] Dev server `apps/frontend` & `apps/backend` menyala.
- [ ] Aturan & kontrak API dapat ditinjau Adi & Widan.
