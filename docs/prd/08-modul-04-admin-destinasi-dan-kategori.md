# 08 — Modul 4: Admin Destinasi & Kategori

- **PIC:** Adi Achya ([02](02-pic-adi-achya.md))
- **Durasi:** Minggu 2
- **Dependency:** Modul 0, Modul 2 (admin shell), Modul 5 (peta & uploader)
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tujuan

Admin dapat mengelola destinasi & kategori, dan hasilnya tampil di katalog
publik (Modul 3).

## Backend

- [x] `POST/PATCH/DELETE /api/destinations` (admin).
- [x] `POST/PATCH/DELETE /api/categories` (admin).
- [x] Validasi Zod + guard role admin.

## Frontend

- [x] `app/admin/destinasi/page.tsx` — tabel + pagination + toolbar + tab kategori.
- [x] Form destinasi multi-langkah (`new` + `[id]/edit`).
- [x] Dialog/tab kategori.

## Rencana Commit

| # | Commit | Isi |
| --- | --- | --- |
| 3 | `feat(backend): CRUD destinations + categories (admin)` | BE admin |
| 4 | `feat(frontend): admin tabel destinasi + tab kategori` | Tabel & kategori |
| 5 | `feat(frontend): form destinasi multi-langkah (new/edit)` | Form |

## Output

- Admin dapat membuat/mengubah/menghapus destinasi & kategori.

## Kriteria Selesai (DoD)

- [x] `pnpm typecheck` & `pnpm build` hijau.
- [ ] Admin CRUD destinasi → tampil di katalog publik.
- [ ] Form memakai `map-picker` & `image-uploader` dari Modul 5.
- [x] Dokumentasi modul diperbarui.

## Catatan Integrasi

- Sepakati kontrak props `map-picker` & `image-uploader` dengan Widan sebelum
  integrasi form.
- Status implementasi: CRUD backend (`/api/categories`, `/api/destinations`),
  halaman admin, wizard 5 langkah, dan dialog kategori sudah berjalan. Katalog
  publik masih memakai data statis `features/landing/data.ts`, jadi integrasi
  `GET /api/destinations` menunggu Modul 3.
- Sampai Modul 5 tersedia, wizard memakai input koordinat manual dan URL foto
  (belum peta pemilih titik / unggah berkas).
- Visual mengikuti `docs/specs/ui-ux-hifi-web.md` (node Figma `157:759`,
  `158:1010`, `160:3635`, `159:1883`–`160:2753`). Verifikasi visual langsung di
  file Figma "UI UX Dolenae.id" belum dilakukan karena file tidak terbuka di
  Figma Desktop saat implementasi.
