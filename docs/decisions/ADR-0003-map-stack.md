# ADR-0003 — Peta: Leaflet + OpenStreetMap

- **Status:** Diterima
- **Tanggal:** 2026-10-05
- **Konteks modul:** Web (`apps/web`) — peta destinasi (admin & publik)

## Konteks

Dolenae menampilkan **peta informatif** (posisi destinasi/basecamp, `accessPoint`,
jarak, tombol "Buka di peta") — **bukan navigasi/GPS** (lihat batas produk di
`docs/prd/product-overview.md`). Desain Figma sebelumnya menggambar peta sebagai
placeholder primitif. Sekarang dibutuhkan peta interaktif nyata untuk:

- admin memilih titik destinasi (Step 3 form) → mengisi koordinat;
- publik melihat lokasi destinasi + titik akses;
- (menyusul) menampilkan sebaran destinasi rekomendasi.

Batasan: web memakai TanStack Start (SSR), preferensi tanpa API key, ringan, dan
sesuai lisensi.

## Keputusan

1. **Leaflet + `react-leaflet`** (v5, kompatibel React 19). Ringan (±40 KB gzip),
   tanpa API key, cukup untuk marker/popup/cluster.
2. **Tile OpenStreetMap** standar (`https://{s}.tile.openstreetmap.org/...`) untuk
   prototipe; URL bisa di-override lewat `VITE_MAP_TILE_URL`. Atribusi
   `© OpenStreetMap` wajib ditampilkan.
3. **Client-only**: implementasi Leaflet dimuat lewat `import()` di `useEffect`
   (file `map-view-leaflet.tsx`), dibungkus komponen `MapView` yang aman-SSR.
   Alasan: TanStack Start memblokir impor `*.client.*` dari kode server; pola
   dynamic-import menghindari Leaflet menyentuh `window` saat SSR.
4. **Pin memakai `L.divIcon`** (bulat, warna tema `primary`; aksen untuk basecamp)
   → tanpa aset gambar, selaras tema "Alam".

## Konsekuensi

- **Positif:** nol biaya & tanpa key; SSR aman; bundel kecil.
- **Biaya:** OSM tile punya *usage policy* (volume/atribusi) → untuk produksi
  sebaiknya pindah ke penyedia ber-key (MapTiler/Stadia) atau self-host.
- Geometri hanya titik (pin), bukan poligon/jejak jalur.

## Alternatif yang ditolak

- **MapLibre GL** — vektor/zoom halus, tapi lebih berat (±200 KB) & butuh
  penyedia tile ber-key untuk style bagus; kebutuhan sekarang cukup pin.
- **Google Maps JS API** — butuh key + billing; menambah ketergantungan vendor.
- **Tetap placeholder + "Buka di peta"** — paling murah, tapi tak bisa
  memilih titik secara visual (dibutuhkan form admin).
