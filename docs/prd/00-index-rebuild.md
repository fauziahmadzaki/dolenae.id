# 00 — Rebuild Dolenae.id: Index & Ringkasan

- **Versi:** 0.4
- **Tanggal:** 09 Oktober 2026
- **PIC:** Fauzi Ahmad Zaki (Initiator), Adi Achya, Widan Ababil
- **Status:** Disetujui untuk eksekusi

> Dokumen ini adalah **index**. Detail per orang dan per modul ada di dokumen
> terpisah (lihat §10 Peta Dokumen).

---

## 1. Latar Belakang

Web (`apps/web`, TanStack Start) dan backend (`apps/server`, Hono) tidak
memenuhi aturan proyek: **web wajib Next.js** dan **backend wajib Express**.
Web & backend akan **dibangun ulang dari nol**. Aplikasi **mobile (Flutter)
tidak disentuh**.

## 2. Tujuan

1. Web baru: **Next.js (App Router)** di `apps/frontend`.
2. Backend baru: **Express** di `apps/backend`.
3. **Kontrak API & envelope tetap identik** agar mobile tidak rusak.
4. Kode modular, `typecheck`/`build` hijau, terdokumentasi.

## 3. Non-Tujuan

- Tidak menyentuh `apps/mobile`.
- Tidak menambah fitur di luar paritas versi lama.
- Bukan marketplace/booking/navigasi.

## 4. Aset yang Dipertahankan

| Aset | Lokasi | Perlakuan |
| --- | --- | --- |
| Tipe domain | `packages/types` | Tetap (single source of truth) |
| Data contoh | `packages/seed` | Tetap |
| Dataset wilayah | `packages/regions` | Tetap |
| Mobile | `apps/mobile` | Tetap (Flutter) |
| Token desain | `DESIGN.md`, `apps/web/src/styles/app.css` | Diambil via git |
| Komponen UI/Ikon | `apps/web/src/components/{ui,icons}` | Port ke frontend baru |
| Skema & migrasi DB | `apps/server/src/db/schema.ts`, `apps/server/drizzle/` | Dipakai ulang |
| Domain backend | `apps/server/src/{repositories,services}` | Port ke backend baru |

## 5. Tech Stack Target

| Layer | Teknologi |
| --- | --- |
| Web FE | Next.js (App Router) + React 19 + Tailwind v4 |
| Backend | Express + TypeScript (`tsx`) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT (`jose`) |
| Shared | `@dolenae/types`, `@dolenae/seed`, `@dolenae/regions` |
| Package manager | pnpm workspace |

## 6. Struktur Monorepo Target

```
PBL/
├── apps/
│   ├── mobile/            # Flutter (tetap)
│   ├── frontend/          # Next.js App Router  (@dolenae/frontend)
│   └── backend/           # Express + Drizzle    (@dolenae/backend)
├── packages/
│   ├── types/  seed/  regions/
└── docs/
```

## 7. Metode Kerja — 1 Modul = 1 Orang (Full-stack)

1. **Satu modul dikerjakan utuh oleh satu orang** — backend *dan* frontend
   modul itu, sehingga tidak ada handoff FE↔BE di tengah jalan.
2. **Maju modul demi modul.** Sebuah modul harus lulus DoD sebelum pemiliknya
   pindah ke modul berikutnya.
3. **Setiap orang minimal 2 modul (≥2 unit commit)** — lihat §10.
4. Modul dikerjakan **paralel antar orang**, tapi berurutan pada orang yang sama.
5. **Fauzi sebagai initiator**: menyiapkan repo + aturan + fondasi bersama
   (Modul 0) sebelum modul lain dimulai. Semua modul bergantung pada Modul 0.

**Aturan batas modul:** setiap modul boleh menambah endpoint/komponen miliknya,
tapi tidak boleh mengubah fondasi bersama (`lib/api`, `components/ui`, kontrak
API, skema inti) — perubahan fondasi lewat review Fauzi. Tipe domain baru tetap
ditulis di `packages/types`.

## 8. Peran & Kepemilikan

| PIC | Peran | Modul | Dokumen |
| --- | --- | --- | --- |
| **Fauzi Ahmad Zaki** | Initiator & Rule Owner | Modul 0, 1, 2 | [01](01-pic-fauzi-ahmad-zaki.md) |
| **Adi Achya** | Module Owner | Modul 3, 4 | [02](02-pic-adi-achya.md) |
| **Widan Ababil** | Module Owner | Modul 5, 6 | [03](03-pic-widan-ababil.md) |

## 9. Aturan Kolaborasi (didefinisikan Fauzi di Modul 0)

- **Branch:** `main` (protected) + `feat/<modul>-<nama>` / `fix/<modul>-<nama>`.
- **PR wajib**, review ≥1 PIC lain. Tidak ada push langsung ke `main`.
- **Definition of Done (DoD):**
  1. `pnpm typecheck` hijau.
  2. `pnpm --filter <app> build` hijau.
  3. Smoke test endpoint + halaman modul lulus.
  4. Dokumentasi modul diperbarui.
- **Konvensi:** komentar & teks UI Bahasa Indonesia; identifier kode Bahasa Inggris.
- **Kontrak API v1 dibekukan** di Modul 0; perubahan butuh persetujuan bertiga.

## 10. Peta Dokumen

### Index & orang

| No | Dokumen | Isi |
| --- | --- | --- |
| 00 | `00-index-rebuild.md` | Index & ringkasan (dokumen ini) |
| 01 | [01-pic-fauzi-ahmad-zaki.md](01-pic-fauzi-ahmad-zaki.md) | PRD per orang — Fauzi |
| 02 | [02-pic-adi-achya.md](02-pic-adi-achya.md) | PRD per orang — Adi |
| 03 | [03-pic-widan-ababil.md](03-pic-widan-ababil.md) | PRD per orang — Widan |

### Modul (komponen commit)

| No | Modul | PIC | Dokumen |
| --- | --- | --- | --- |
| 04 | Modul 0 — Inisiasi & Aturan | Fauzi | [04](04-modul-00-inisiasi-dan-aturan.md) |
| 05 | Modul 1 — Auth & Pengguna | Fauzi | [05](05-modul-01-auth-dan-pengguna.md) |
| 06 | Modul 2 — Area Admin | Fauzi | [06](06-modul-02-area-admin.md) |
| 07 | Modul 3 — Katalog Publik | Adi | [07](07-modul-03-katalog-publik.md) |
| 08 | Modul 4 — Admin Destinasi & Kategori | Adi | [08](08-modul-04-admin-destinasi-dan-kategori.md) |
| 09 | Modul 5 — Peta & Wilayah | Widan | [09](09-modul-05-peta-dan-wilayah.md) |
| 10 | Modul 6 — Media & Konten | Widan | [10](10-modul-06-media-dan-konten.md) |

### Rekap commit per orang

| PIC | Modul | Perkiraan commit |
| --- | --- | --- |
| Fauzi | 0, 1, 2 | 4 + 2 + 2 = **8** |
| Adi | 3, 4 | 2 + 3 = **5** |
| Widan | 5, 6 | 2 + 2 = **4** |

## 11. Timeline (estimasi, sprint 1 minggu)

| Minggu | Fauzi | Adi | Widan |
| --- | --- | --- | --- |
| 0 | Modul 0 (Inisiasi & aturan) | menunggu Modul 0 | menunggu Modul 0 |
| 1 | Modul 1 (Auth) | Modul 3 (Katalog Publik) | Modul 5 (Peta & Wilayah) |
| 2 | Modul 2 (Area Admin) | Modul 4 (Admin Destinasi) | Modul 6 (Media & Konten) |
| 3 | QA + review Modul 3–6 | QA Modul 3–4 | QA Modul 5–6 |
| 4 | Integrasi lintas modul + rilis | Integrasi + rilis | Integrasi + rilis |

## 12. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Modul 0 belum selesai | Semua modul tertunda | Fauzi selesaikan & review dulu; hard dependency |
| Kontrak API berubah | Mobile rusak | Bekukan di Modul 0; perubahan butuh persetujuan bertiga |
| Fondasi bersama diubah sepihak | Conflict & regresi | Batas modul (§7); perubahan fondasi via review Fauzi |
| Modul 4 & 5 saling bergantung (form/map) | Blocking | Kontrak props disepakati awal (owner jelas) |
| `.env` hilang saat hapus | DB & JWT tak jalan | Backup sebelum hapus |
| DB lokal belum siap | Backend tertunda | `docker-compose` + dokumentasi setup |

## 13. Kriteria Sukses

1. `apps/frontend` (Next.js) & `apps/backend` (Express) jalan; `typecheck` & `build` hijau.
2. Paritas halaman & endpoint versi lama tercapai.
3. `apps/mobile` (Flutter) tetap berfungsi terhadap API baru.
4. Setiap modul lulus DoD; setiap orang ≥2 unit commit; aturan proyek tertulis di `AGENTS.md`.

## 14. Lampiran

### 14.1 Kontrak API v1 (ringkas)

Semua di bawah `/api`; envelope sukses `{ success, data, meta? }`, gagal
`{ success: false, error: { code, message, details? } }`.

- `GET /api/health`
- `POST /api/auth/register` · `POST /api/auth/login`
- `GET /api/users/me` · `GET /api/users` (admin)
- `GET /api/categories` · `POST /api/categories` (admin)
- `GET /api/destinations` · `GET /api/destinations/slug/:slug`
- `POST /api/destinations` (admin)
- `GET /api/supports`
- `GET /api/regions/provinces` · `GET /api/regions/reverse?lat=&lng=`
- `POST /api/uploads` (admin, multipart `file`)

### 14.2 Pemetaan route TanStack → Next.js

| Lama (TanStack) | Baru (Next.js App Router) | Modul |
| --- | --- | --- |
| `login` | `app/login/page.tsx` | 1 |
| `admin` | `app/admin/layout.tsx` | 2 |
| `admin.index` | `app/admin/page.tsx` | 2 |
| `admin.users` | `app/admin/users/page.tsx` | 2 |
| `_public.index` | `app/(public)/page.tsx` | 3 |
| `_public.destinations` | `app/(public)/destinations/page.tsx` | 3 |
| `_public.destinations.$slug` | `app/(public)/destinations/[slug]/page.tsx` | 3 |
| `admin.destinations.index` | `app/admin/destinations/page.tsx` | 4 |
| `admin.destinations.new` | `app/admin/destinations/new/page.tsx` | 4 |
| `admin.destinations.$id.edit` | `app/admin/destinations/[id]/edit/page.tsx` | 4 |
| `design-system` | `app/design-system/page.tsx` | 0 |
