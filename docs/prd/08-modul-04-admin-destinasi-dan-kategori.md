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

- [ ] `POST/PATCH/DELETE /api/destinations` (admin).
- [ ] `POST/PATCH/DELETE /api/categories` (admin).
- [ ] Validasi Zod + guard role admin.

## Frontend

- [ ] `app/admin/destinations/page.tsx` — tabel + pagination + toolbar + tab kategori.
- [ ] Form destinasi multi-langkah (`new` + `[id]/edit`).
- [ ] Dialog/tab kategori.

## Rencana Commit

| # | Commit | Isi |
| --- | --- | --- |
| 3 | `feat(backend): CRUD destinations + categories (admin)` | BE admin |
| 4 | `feat(frontend): admin tabel destinasi + tab kategori` | Tabel & kategori |
| 5 | `feat(frontend): form destinasi multi-langkah (new/edit)` | Form |

## Output

- Admin dapat membuat/mengubah/menghapus destinasi & kategori.

## Kriteria Selesai (DoD)

- [ ] `pnpm typecheck` & `pnpm build` hijau.
- [ ] Admin CRUD destinasi → tampil di katalog publik.
- [ ] Form memakai `map-picker` & `image-uploader` dari Modul 5.
- [ ] Dokumentasi modul diperbarui.

## Catatan Integrasi

- Sepakati kontrak props `map-picker` & `image-uploader` dengan Widan sebelum
  integrasi form.
