# 09 — Modul 5: Peta & Wilayah

- **PIC:** Widan Ababil ([03](03-pic-widan-ababil.md))
- **Durasi:** Minggu 1
- **Dependency:** Modul 0
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tujuan

Kemampuan peta & data wilayah yang dipakai katalog publik dan form destinasi.

## Backend

- [x] `GET /api/regions/provinces`.
- [x] `GET /api/regions/regencies?province=`.
- [x] `GET /api/regions/districts?regency=`.
- [x] `GET /api/regions/reverse?lat=&lng=` — balas wilayah dari koordinat.

> Dataset wilayah (34 provinsi, 514 kabupaten/kota, 7.230 kecamatan) di-generate
> dari `geografis` oleh `apps/backend/scripts/build-regions.mjs` dan disimpan di
> `apps/backend/src/data/regions/`. Reverse geocode memakai centroid kecamatan
> terdekat, jadi hasilnya **perkiraan**.

## Frontend

- [ ] `map-view` (publik) — Leaflet, menampilkan titik destinasi.
- [x] `map-picker` (form destinasi) — pilih titik + tampilkan koordinat/wilayah.

## Rencana Commit

| # | Commit | Isi |
| --- | --- | --- |
| 1 | `feat(backend): regions provinces + reverse geocode` | BE wilayah |
| 2 | `feat(frontend): map-view + map-picker` | FE peta |

## Output

- Komponen peta siap dikonsumsi Modul 3 (katalog) & Modul 4 (form).

## Kriteria Selesai (DoD)

- [x] `pnpm typecheck` & `pnpm build` hijau.
- [x] Pilih titik di peta → koordinat tersimpan.
- [x] Reverse geocode membalas wilayah.
- [x] Dokumentasi modul diperbarui.

## Catatan Integrasi

- Serahkan kontrak props `map-picker` lebih awal ke Adi (Modul 4).
