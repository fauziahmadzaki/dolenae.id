# Data Model — Dolenae.id

Dokumen ini mendeskripsikan entitas domain Dolenae.id. Implementasi
TypeScript ada di `packages/types/src/` (single source of truth).

## Entitas Utama

### User
Peran (role): `wisatawan` | `merchant` | `admin`.

- `User`: id, nama, email, role, createdAt.
- `Merchant extends User`: bisnis, deskripsi.

### Destination
Destinasi alam (gunung, bukit, danau, air terjun, dsb).

**Field inti:**
- identitas: `id`, `name`, `slug`, `tagline`, `description`
- klasifikasi: `terrain[]`, `activities[]`, `difficulty`, `bestSeason[]`, `tags[]`
- geografi: `location` (provinsi, kabupaten/kota, **kecamatan `district?`**,
  koordinat, serta `accessPoint?` berupa basecamp/titik akses terdekat — dipakai
  untuk peta lokasi). Nama wilayah diambil dari dataset `@dolenae/regions`
  (reverse geocode; lihat ADR-0004).
- `access`: deskripsi akses, moda transportasi, estimasi waktu, jarak
- `facilities`: toilet, warung, mushola, parkir, homestay dekat, dll
- ekonomi: `entryFee`, `elevationMeters`
- meta: `images`, `guideRequired`, `categoryIds[]`, `createdAt`, `updatedAt`

**Relasi:** satu destinasi memiliki banyak `TravelSupport`
(`DestinationDetail = Destination + supports[]`) dan banyak `Category`
lewat `categoryIds[]` (tabel pivot `destination_categories`).

### Category
Entitas kategori yang menggantikan peran enum `terrain`/`activities` sebagai
data yang bisa dikelola admin (tambah/edit/hapus).

- `type`: `terrain` | `activity`
- field: `id`, `name`, `slug`, `type`, `icon` (nama ikon Lucide, mis.
  `lucide:mountain`), `description?`, `createdAt`, `updatedAt`.

> Destinasi masih menyimpan `terrain[]`/`activities[]` (union string) untuk
> kompatibilitas tampilan, sementara relasi resmi ke kategori disimpan di
> `categoryIds`/`destination_categories`. Saat seed, tiap nilai
> terrain/aktivitas dibuatkan satu kategori dengan `slug` sama sehingga
> keduanya konsisten.

### TravelSupport (Kebutuhan Pendukung)
Diskriminator `type`:
- `accommodation` — penginapan (harga/malam, kapasitas, fasilitas)
- `transport` — moda (motor, mobil, elf, open-trip, dll), rute, harga
- `food` — tempat makan (masakan, rentang harga)

Field umum: nama, `destinationId`, deskripsi, `priceRange`, `contact`,
`verified`, `tags`, `image`.

### TrackNode / RouteSegment / TrailRoute (Route Builder)
Jaringan jalur destinasi dimodelkan sebagai **graf** (lihat
`docs/specs/route-builder.md` dan `docs/decisions/ADR-0001-route-model.md`).

- `TrackNode` — titik ber-nama: `type` (`basecamp|gerbang|parkir|pos|sumber-air|
  viewpoint|puncak|persimpangan|area-camp`), `coordinate`, `elevationMeters`,
  `notes?`, `supportIds?` (tautan `TravelSupport`).
- `RouteSegment` — ruas penghubung dua titik: `fromNodeId`, `toNodeId`,
  `surface` (setapak/aspal/tanah/batu/pasir), `grade` (datar…terjal),
  `traversableBy[]`, `bidirectional`, `distanceKm?`, `estimatedDurationMinutes?`,
  `seasonal?`, `notes?`, `status`.
- `TrailRoute` — jalur bernama: `nodeIds[]` (berurutan) + `segmentIds[]`,
  `surface`/`grade`/`traversableBy` (ringkasan), `difficulty`, `recommended`,
  `status`.
- `RouteProfile` — **turunan** (jarak total, gain/loss, elevasi maks/min,
  grade terberat, estimasi waktu, titik-titik elevasi untuk grafik).

### Trip
- `PreparationItem` + `PreparationChecklist` — baris ceklis perlengkapan
  per destinasi (kategori: perlengkapan/kesehatan/konservasi/administrasi).
- `TripPlanItem` — satu destinasi + kebutuhan pendukung terpilih + progress
  checklist.
- `TripPlan` — kumpulan item per rencana perjalanan + estimasi budget.

### AI
- `Preference` — input preferensi (region, aktivitas, terrain, kesulitan,
  budget, durasi, musim, kebutuhan inap/transport, teks natural).
- `RuleScore` — skor + alasan per destinasi.
- `RecommendationResult` — hasil rekomendasi (rule-based | llm), berisi
  destinas terurut + ringkasan + referensi checklist.

## Relasi Ringkas

```
User 1───* TripPlan
Destination *───* Category           (destination_categories)
Destination 1───* TravelSupport
Destination 1───* TrackNode
Destination 1───* RouteSegment        (fromNodeId/toNodeId → TrackNode)
Destination 1───* TrailRoute          (segmentIds[] → RouteSegment)
TrackNode 1───* RouteSegment
Destination 1───1 PreparationChecklist 1───* PreparationItem
TripPlan 1───* TripPlanItem (berisi Destination + TravelSupport[] + checklist progress)
```

## Konvensi

- `ID` = string (uuid/nanoid). `ISODateString` = ISO 8601.
- Enum direpresentasikan sebagai union string literal (`"gunung" | "bukit" | ...`)
  agar mudah dipertukarkan antar aplikasi (TS ↔ Dart ↔ API).