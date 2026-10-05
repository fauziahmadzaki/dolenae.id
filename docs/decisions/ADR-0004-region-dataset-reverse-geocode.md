# ADR-0004 — Dataset Wilayah & Reverse Geocode Offline

- **Status:** Diterima
- **Tanggal:** 2026-10-05
- **Konteks modul:** `packages/regions`, `apps/server`

## Konteks

Form admin perlu mengisi **provinsi / kabupaten-kota / kecamatan** secara akurat.
Idealnya, saat admin memilih titik di peta, area administratif terisi otomatis
(**reverse geocoding**). Syarat: dapat **kecamatan**, tanpa key, dan andal saat
offline (prototipe sering dikembangkan tanpa jaringan).

Opsi yang dipertimbangkan: API Nominatim (OSM), paket `idn-area-data` (tanpa
koordinat), dan `geografis` (Node-only, 83.449 desa dengan `province`, `city`,
`district`, `latitude`, `longitude`, `elevation`).

## Keputusan

1. **Sumber: `geografis`** (MIT, data Kepmendagri) — satu-satunya yang menyertakan
   **koordinat + elevasi** sampai level desa.
2. **Dataset turunan** dibuat sekali via generator (`packages/regions/scripts/
   generate.mjs`) → `packages/regions/src/data.json`: provinsi, kabupaten/kota,
   dan **kecamatan** (centroid desa + elevasi rata-rata, ±7.230 baris, ±0.9 MB).
   `geografis` cukup sebagai **devDependency** (tidak ikut runtime).
3. **Reverse geocode = nearest-centroid** (`reverseGeocode(lat,lng)`), dijalankan
   di **server** (`GET /api/regions/reverse`), bukan di browser.
   - Bukan uji poligon: di dekat perbatasan bisa meleset satu tingkat → admin
     tetap dapat mengoreksi manual (field bisa diketik).
4. **Dropdown berjenjang** (`/api/regions/provinces|regencies|districts`) memakai
   dataset yang sama; web memakai `<input list>` + `<datalist>` (ringan).
5. **Hanya nama** yang disimpan di `Destination.location`
   (`province`/`regency`/`district`) — tanpa kode wilayah (sesuai kebutuhan).

## Konsekuensi

- **Positif:** offline & tanpa rate limit; konsisten untuk dropdown + reverse;
  sekaligus memberi **elevasi** (bisa mengisi `elevationMeters`).
- **Biaya:** dataset dari sumber yang belum memuat 4 provinsi baru di Papua
  (tercatat 34 provinsi) → perlu regenerasi bila sumber diperbarui; akurasi
  batas kecamatan hanya setingkat centroid.
- Tidak ada reverse ke tingkat desa/alamat jalan.

## Alternatif yang ditolak

- **Nominatim (OSM)** — akurat & terkini, tapi dibatasi ±1 req/s, butuh proxy +
  User-Agent, dan kategori kecamatan tidak konsisten.
- **`idn-area-data`** — rapi & terbaru, tetapi **tanpa koordinat** → tidak bisa
  reverse geocode.
- **Boundary GeoJSON** (poligon) — paling akurat, tapi berkas besar & butuh
  point-in-polygon; berlebihan untuk kebutuhan sekarang.
