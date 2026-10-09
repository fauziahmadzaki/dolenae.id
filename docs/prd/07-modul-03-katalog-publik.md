# 07 — Modul 3: Katalog Publik

- **PIC:** Adi Achya ([02](02-pic-adi-achya.md))
- **Durasi:** Minggu 1
- **Dependency:** Modul 0
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tujuan

Sisi wisatawan: landing, menjelajah katalog, dan melihat detail destinasi.

## Backend

- [ ] `GET /api/categories` — daftar kategori.
- [ ] `GET /api/destinations` — daftar (filter status published).
- [ ] `GET /api/destinations/slug/:slug` — detail + supports.
- [ ] `GET /api/supports` (penginapan/transportasi/makanan).

## Frontend

- [ ] `app/(public)/layout.tsx`.
- [ ] `app/(public)/page.tsx` — landing/beranda.
- [ ] `app/(public)/destinations/page.tsx` — katalog + search/filter.
- [ ] `app/(public)/destinations/[slug]/page.tsx` — detail + supports.

## Rencana Commit

| # | Commit | Isi |
| --- | --- | --- |
| 1 | `feat(backend): categories + destinations (list/slug) + supports` | BE katalog |
| 2 | `feat(frontend): landing + katalog + detail destinasi` | FE publik |

## Output

- Wisatawan dapat menjelajah katalog & detail destinasi dari API.

## Kriteria Selesai (DoD)

- [ ] `pnpm typecheck` & `pnpm build` hijau.
- [ ] Halaman `/`, `/destinations`, `/destinations/[slug]` membalas 200 & render data.
- [ ] Dokumentasi modul diperbarui.
