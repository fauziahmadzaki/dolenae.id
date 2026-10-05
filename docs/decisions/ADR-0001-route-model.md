# ADR-0001 — Model Rute Berbasis Graf Titik & Ruas

- **Status:** Diterima (untuk fase desain)
- **Tanggal:** 2026-10-05
- **Konteks modul:** Route Builder (admin)

## Konteks

Admin perlu menggambarkan jalur menuju/seputar destinasi alam, termasuk
basecamp, pos, dan puncak. Kebutuhan yang dinyatakan:

- Menambah **basecamp** dan **rute** untuk sebuah destinasi.
- Rute punya **kategori** (setapak, aspal, terjal).
- Menyatakan **apa saja yang bisa lewat** (moda kendaraan/kaki).
- Rute memiliki **start point** dan **end point**, dan **dapat disambung-sambung
  per titik**.
- Tiap titik punya **elevasi**, sehingga dapat digambar **profil elevasi** jalur.

Data model saat ini hanya punya `LocationInfo.accessPoint` (satu titik akses)
dan `AccessInfo.transportModes` (daftar string). Ini tidak cukup untuk
memodelkan jaringan jalur, percabangan, maupun profil elevasi.

## Keputusan

1. **Graf titik–ruas.** Modelkan jaringan sebagai `TrackNode` (titik) +
   `RouteSegment` (ruas yang menghubungkan dua titik), lalu `TrailRoute`
   (jalur bernama = rangkaian ruas dari start ke end). Ruas dapat dipakai
   bersama oleh beberapa jalur; titik dapat menjadi persimpangan.
2. **Geometri ruas = garis lurus node-to-node.** Tidak memakai polyline
   `shapePoints` pada fase ini (struktur tetap disiapkan untuk pengembangan).
3. **Kategori dipisah:** `surface` (permukaan: setapak/aspal/tanah/batu/pasir)
   dan `grade` (kecuraman: datar…terjal). Label yang diminta tetap tampil,
   tetapi tidak dicampur dalam satu enum.
4. **Traversability** disimpan sebagai `traversableBy: RouteTraversal[]`
   (pejalan-kaki, sepeda, motor, mobil, jeep, pickup, elf, minibus, ojek,
   open-trip).
5. **Elevasi diinput manual per titik** (`TrackNode.elevationMeters`) pada fase
   ini; integrasi elevation API/DEM menyusul.
6. **Peta bersifat informatif** (placeholder primitif), konsisten dengan
   batas produk: bukan navigasi/routing turn-by-turn.
7. **Profil elevasi bersifat turunan** (`RouteProfile`) — dihitung dari urutan
   titik, bukan disimpan.

## Konsekuensi

- **Positif:** mendukung percabangan & reuse ruas; profil elevasi & metrik
  (jarak, gain/loss, grade, estimasi waktu) dapat diturunkan konsisten;
  `DestinationDetail` dapat diperluas dengan `trackNodes`, `segments`,
  `routes` tanpa mengubah entitas lama secara destruktif.
- **Negatif/biaya:** builder UI lebih kompleks (editor graf); perlu validasi
  keterhubungan; `accessPoint` lama berpotensi tumpang tindih dengan
  `TrackNode` basecamp (perlu migrasi/normalisasi di fase implementasi).
- **Netral:** tipe ditulis sebagai union string literal (TS ↔ Dart ↔ API),
  mengikuti konvensi `docs/specs/data-model.md`.

## Alternatif yang ditolak

- **Satu jalur linear berurutan** — tidak mendukung percabangan/reuse ruas.
- **Polyline penuh sekarang** — lebih realistis tetapi menambah kompleksitas
  editor & data sebelum kebutuhan dasar terverifikasi.
- **Satu enum kategori campuran** (setapak/aspal/terjal) — mencampur permukaan
  dan kecuraman; lebih sulit difilter/dihitung.
