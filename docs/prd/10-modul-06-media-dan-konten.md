# 10 — Modul 6: Media & Konten

- **PIC:** Widan Ababil ([03](03-pic-widan-ababil.md))
- **Durasi:** Minggu 2
- **Dependency:** Modul 0
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tujuan

Kemampuan upload & pengelolaan media (gambar) dan editor konten untuk deskripsi
destinasi, dipakai form admin (Modul 4).

## Backend

- [ ] `POST /api/uploads` — multipart via `multer`.
- [ ] `DELETE /api/uploads`.
- [ ] `storage.service` (S3/MinIO) — port dari versi lama.

## Frontend

- [ ] `image-uploader` (slot upload + preview + hapus).
- [ ] `rich-text` editor (deskripsi destinasi).

## Rencana Commit

| # | Commit | Isi |
| --- | --- | --- |
| 3 | `feat(backend): uploads + storage service` | BE upload |
| 4 | `feat(frontend): image-uploader + rich-text` | FE media |

## Output

- Komponen upload & editor siap dikonsumsi Modul 4 (form destinasi).

## Kriteria Selesai (DoD)

- [ ] `pnpm typecheck` & `pnpm build` hijau.
- [ ] Upload gambar → URL publik tampil; hapus → hilang.
- [ ] Rich text tersimpan & tampil di detail destinasi.
- [ ] Dokumentasi modul diperbarui.

## Catatan Integrasi

- Serahkan kontrak props `image-uploader` lebih awal ke Adi (Modul 4).
