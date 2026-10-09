# 09 — Modul 5: Peta & Wilayah

- **PIC:** Widan Ababil ([03](03-pic-widan-ababil.md))
- **Durasi:** Minggu 1
- **Dependency:** Modul 0
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tujuan

Kemampuan peta & data wilayah yang dipakai katalog publik dan form destinasi.

## Backend

- [ ] `GET /api/regions/provinces`.
- [ ] `GET /api/regions/reverse?lat=&lng=` — balas wilayah dari koordinat.

## Frontend

- [ ] `map-view` (publik) — Leaflet, menampilkan titik destinasi.
- [ ] `map-picker` (form destinasi) — pilih titik + tampilkan koordinat/wilayah.

## Rencana Commit

| # | Commit | Isi |
| --- | --- | --- |
| 1 | `feat(backend): regions provinces + reverse geocode` | BE wilayah |
| 2 | `feat(frontend): map-view + map-picker` | FE peta |

## Output

- Komponen peta siap dikonsumsi Modul 3 (katalog) & Modul 4 (form).

## Kriteria Selesai (DoD)

- [ ] `pnpm typecheck` & `pnpm build` hijau.
- [ ] Pilih titik di peta → koordinat tersimpan.
- [ ] Reverse geocode membalas wilayah.
- [ ] Dokumentasi modul diperbarui.

## Catatan Integrasi

- Serahkan kontrak props `map-picker` lebih awal ke Adi (Modul 4).
