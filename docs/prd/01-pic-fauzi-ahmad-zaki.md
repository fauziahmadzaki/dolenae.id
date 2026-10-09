# 01 — PRD per Orang: Fauzi Ahmad Zaki

- **Peran:** Initiator & Rule Owner
- **Modul yang dipegang:** [Modul 0](04-modul-00-inisiasi-dan-aturan.md) · [Modul 1](05-modul-01-auth-dan-pengguna.md) · [Modul 2](06-modul-02-area-admin.md)
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tanggung Jawab

1. **Inisiator proyek** — memulai rebuild: hapus web & backend lama, scaffold
   `apps/frontend` (Next.js) + `apps/backend` (Express).
2. **Pendefine aturan proyek** — menulis aturan kerja (branch, PR, DoD,
   konvensi), kontrak API v1, dan konvensi struktur folder.
3. **Penjaga fondasi bersama** — memiliki `lib/api`, `components/{ui,icons,layout}`,
   kontrak API, dan skema inti. Semua perubahan fondasi lewat review Fauzi.
4. **Module Owner** Modul 0, 1, 2.

## Ringkasan Deliverable

| Modul | Deliverable inti | Durasi |
| --- | --- | --- |
| [Modul 0](04-modul-00-inisiasi-dan-aturan.md) | Repo bersih, 2 app jalan, fondasi desain & API, aturan + CI | ~2–3 hari |
| [Modul 1](05-modul-01-auth-dan-pengguna.md) | Auth (JWT), session FE, endpoint pengguna | Minggu 1 |
| [Modul 2](06-modul-02-area-admin.md) | Admin shell/guard, dashboard, halaman users | Minggu 2 |

## Rencana Commit (≥2 unit)

| # | Commit | Isi |
| --- | --- | --- |
| 1 | `chore: hapus web/server lama + scaffold frontend & backend` | Modul 0 |
| 2 | `feat(backend): envelope, error handler, health, middleware dasar` | Modul 0 |
| 3 | `feat(frontend): layout, token tema, lib/api, komponen fondasi` | Modul 0 |
| 4 | `chore: kontrak API v1, AGENTS, lint, CI` | Modul 0 |
| 5 | `feat(backend): jwt + endpoint auth & users` | Modul 1 |
| 6 | `feat(frontend): halaman login + AuthProvider/session` | Modul 1 |
| 7 | `feat(frontend): admin shell + guard layout` | Modul 2 |
| 8 | `feat(frontend): dashboard ringkas + halaman users` | Modul 2 |

## Urutan Kerja

1. Selesaikan **Modul 0** sampai `typecheck`/`build` hijau dan aturan tertulis.
2. Kabari Adi & Widan bahwa fondasi siap → mereka mulai Modul 3 & 5.
3. Kerjakan **Modul 1** lalu **Modul 2**.
4. Setelah semua modul lulus DoD: review Modul 3–6, bantu integrasi & rilis.

## Dependensi

- **Memblokir** Modul 3–6 selama Modul 0 belum selesai.
- Modul 2 (admin shell) menjadi kerangka tempat Modul 4 (admin destinasi)
  menempelkan halaman.

## Definition of Done (ringkas)

- `pnpm typecheck` hijau · `pnpm --filter <app> build` hijau.
- Smoke test endpoint + halaman modul lulus.
- Dokumentasi modul diperbarui; aturan tercermin di `AGENTS.md`.
