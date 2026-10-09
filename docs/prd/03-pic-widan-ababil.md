# 03 — PRD per Orang: Widan Ababil

- **Peran:** Module Owner
- **Modul yang dipegang:** [Modul 5](09-modul-05-peta-dan-wilayah.md) · [Modul 6](10-modul-06-media-dan-konten.md)
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tanggung Jawab

1. Mengerjakan **Modul 5 & 6 secara full-stack** (backend + frontend) sampai
   lulus DoD.
2. Menjaga batas modul: tidak mengubah fondasi bersama tanpa review Fauzi.
3. Menyediakan komponen `map-picker`/`image-uploader` dengan kontrak props yang
   disepakati bersama Adi (dipakai di form destinasi Modul 4).

## Ringkasan Deliverable

| Modul | Deliverable inti | Durasi |
| --- | --- | --- |
| [Modul 5](09-modul-05-peta-dan-wilayah.md) | Regions + reverse geocode, map-view, map-picker | Minggu 1 |
| [Modul 6](10-modul-06-media-dan-konten.md) | Upload gambar + storage, image-uploader, rich-text | Minggu 2 |

## Rencana Commit (≥2 unit)

| # | Commit | Isi |
| --- | --- | --- |
| 1 | `feat(backend): regions provinces + reverse geocode` | Modul 5 |
| 2 | `feat(frontend): map-view + map-picker` | Modul 5 |
| 3 | `feat(backend): uploads + storage service` | Modul 6 |
| 4 | `feat(frontend): image-uploader + rich-text` | Modul 6 |

## Urutan Kerja

1. Tunggu kabar **Modul 0 selesai** (fondasi dari Fauzi).
2. Backend + frontend **Modul 5** → lulus DoD.
3. Kerjakan **Modul 6**.
4. Serahkan kontrak props `map-picker`/`image-uploader` ke Adi lebih awal.

## Dependensi

- **Diblokir oleh** Modul 0 (fondasi).
- **Menyediakan** komponen untuk Modul 4 (Adi) — komunikasikan props lebih awal.

## Definition of Done (ringkas)

- `pnpm typecheck` hijau · `pnpm --filter frontend build` & `pnpm --filter backend build` hijau.
- Smoke test: pilih titik peta tersimpan; upload gambar tampil; reverse geocode balas wilayah.
- Dokumentasi modul diperbarui.
