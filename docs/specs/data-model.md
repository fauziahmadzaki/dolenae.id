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
- klasifikasi: `difficulty`, `bestSeason[]`, `tags[]`, serta `terrain[]` &
  `activities[]` yang **diturunkan** dari kategori (lihat catatan di bawah)
- geografi: `location` (provinsi, kabupaten/kota, **kecamatan `district?`**,
  koordinat, serta `accessPoint?` berupa basecamp/titik akses terdekat — dipakai
  untuk peta lokasi). Nama wilayah diambil dari dataset `@dolenae/regions`
  (reverse geocode; lihat ADR-0004).
- `access`: deskripsi akses, moda transportasi, estimasi waktu, jarak
- ketinggian: `elevationMeters`
- fasilitas sekitar (penginapan/transportasi/makanan) dikelola sebagai entitas
  `Facility` terpisah — lihat bagian Fasilitas di bawah.
- publikasi: `status` (`draft` | `published` | `archived`), `verified`
- meta: `images`, `guideRequired`, `categoryIds[]`, `createdAt`, `updatedAt`

Nilai `difficulty`: `ramah-pemula` | `menengah` | `sulit`.

> Implementasi backend (`apps/backend/src/db/models/`) menyimpan geografi dan
> akses sebagai kolom datar (`province`, `regency`, `district`, `latitude`,
> `longitude`, `accessPoint`, `accessDescription`, `accessTransport`,
> `accessDuration`, `accessDistanceKm`), sedangkan API mengeksposnya sebagai
> objek bersarang `location` dan `access`.

**Relasi:** satu destinasi memiliki banyak `Facility` (dan satu fasilitas punya banyak `FacilityProduct`)
(`DestinationDetail = Destination + supports[]`) dan banyak `Category`
lewat `categoryIds[]` (tabel pivot `destination_categories`).

### Category
Entitas kategori yang menggantikan peran enum `terrain`/`activities` sebagai
data yang bisa dikelola admin (tambah/edit/hapus).

- `type`: `terrain` | `activity`
- field: `id`, `name`, `slug`, `type`, `icon` (nama ikon Lucide, mis.
  `lucide:mountain`), `description?`, `createdAt`, `updatedAt`.

> Destinasi **tidak lagi menyimpan** `terrain[]`/`activities[]` sebagai kolom.
> Keduanya diturunkan saat read dari kategori yang terhubung
> (`type: terrain` → `terrain`, `type: activity` → `activities`), sehingga rename
> kategori langsung tercermin di API. Admin mengisi klasifikasi hanya lewat chip
> kategori; field `tags[]` tetap bebas untuk label seperti `sunrise`.

### Fasilitas (Merchant / Admin)
Fasilitas adalah usaha di sekitar destinasi (penginapan, transportasi, toko/warung)
yang didaftarkan oleh **merchant** (lewat web) atau **admin**, lalu diverifikasi
admin sebelum tampil publik.

Kategori memakai enum `facility_category`:
- `transport` — transportasi lokal (sewa jeep, ojek gunung, shuttle)
- `accommodation` — penginapan (homestay, villa, camping ground)
- `food` — toko/warung/resto

Status memakai enum `facility_status`: `draft | pending | published | rejected |
archived`.

#### Skema Tabel `facilities`
- `id` (uuid, primary key)
- `destination_id` (uuid, not null) — FK `destinations(id)` `ON DELETE CASCADE`
- `owner_id` (uuid, nullable) — FK `users(id)` `ON DELETE SET NULL` (merchant/admin pendaftar)
- `name` (varchar(120), not null)
- `category` (`facility_category`, not null)
- `type` (varchar(60), not null, default `'lainnya'`) — sub-tipe bebas (jeep, ojek, homestay, warung, …)
- `latitude`, `longitude` (numeric(10,7), not null)
- `price_min` (integer, nullable) — harga mulai (rupiah)
- `price_max` (integer, nullable) — harga termahal; **hanya boleh diisi jika `price_min` ada** dan tidak lebih kecil
- `description` (text, nullable)
- `contact` (text, not null) — kontak utama (telepon/WhatsApp)
- `contact_email` (varchar(255), nullable)
- `website` (text, nullable)
- `banner_url` (text, nullable)
- `status` (`facility_status`, not null, default `draft`)
- `created_at`, `updated_at` (timestamptz, not null)

**Index:** `facilities_destination_idx`, `facilities_owner_idx`,
`facilities_category_idx` (`destination_id`, `category`).

#### Skema Tabel `facility_products`
- `id` (uuid, primary key)
- `facility_id` (uuid, not null) — FK `facilities(id)` `ON DELETE CASCADE`
- `name` (varchar(120), not null)
- `description` (text, nullable)
- `banner_url` (text, nullable)
- `price` (integer, not null, rupiah)
- `position` (integer, not null, default 0) — urutan tampil
- `is_active` (boolean, not null, default true)
- `created_at`, `updated_at` (timestamptz, not null)

**Index:** `facility_products_facility_idx` pada `facility_id`.

#### Aturan bisnis
- **Geofence:** koordinat fasilitas maksimal **20 km** dari koordinat destinasi
  (haversine). Lebih dari itu → `422` dengan `details.distanceKm`. Destinasi
  tanpa koordinat → `422`.
- Merchant hanya bisa mengubah/menghapus fasilitas dan produk miliknya; admin
  bebas.
- Merchant create → status `pending`; admin create → `published` (default).
- Merchant edit fasilitas `rejected` → kembali `pending`; edit fasilitas
  `published` langsung berlaku (status tetap `published`).

#### Endpoint
- `GET /api/destinations/:id/facilities?category=&type=&page=&limit=` — daftar
  fasilitas `published` pada destinasi `published`.
- `GET /api/facilities/:id` — detail + produk (draft/pending hanya owner/admin).
- `GET /api/facilities/mine` — fasilitas milik merchant (admin: semua).
- `POST /api/facilities` — daftar fasilitas (merchant/admin).
- `PATCH|DELETE /api/facilities/:id` — ubah/hapus (owner/admin).
- `POST /api/facilities/:id/products`, `PATCH|DELETE /api/facilities/:id/products/:productId`.
- **Alias legacy mobile:** `GET /api/supports/:id` dan
  `GET /api/destinations/:id/supports` tetap tersedia dan menyintesis bentuk
  `travel_supports` lama dari tabel `facilities`.

### TrackNode / RouteSegment / TrailRoute (Route Builder)
Jaringan jalur destinasi dimodelkan sebagai **graf** (lihat
`docs/specs/route-builder.md` dan `docs/decisions/ADR-0001-route-model.md`).

- `TrackNode` — titik ber-nama: `type` (`basecamp|gerbang|parkir|pos|sumber-air|
  viewpoint|puncak|persimpangan|area-camp`), `coordinate`, `elevationMeters`,
  `notes?`, `supportIds?` (tautan `Facility`).
- `RouteSegment` — ruas penghubung dua titik: `fromNodeId`, `toNodeId`,
  `surface` (setapak/aspal/tanah/batu/pasir), `grade` (datar…terjal),
  `traversableBy[]`, `bidirectional`, `distanceKm?`, `estimatedDurationMinutes?`,
  `seasonal?`, `notes?`, `status`.
- `TrailRoute` — jalur bernama: `nodeIds[]` (berurutan) + `segmentIds[]`,
  `surface`/`grade`/`traversableBy` (ringkasan), `difficulty`, `recommended`,
  `status`.
- `RouteProfile` — **turunan** (jarak total, gain/loss, elevasi maks/min,
  grade terberat, estimasi waktu, titik-titik elevasi untuk grafik).

#### Public Route Endpoints & Profile Schemas
Akses publik untuk visualisasi peta & elevasi (tanpa autentikasi, hanya untuk destinasi berstatus `published`):

- `GET /api/public/destinations/:destinationId/route-graph`
  Mengembalikan graf lengkap destinasi:
  - `nodes`: daftar `TrackNode` (koordinat, nama, tipe, elevasi).
  - `segments`: ruas penghubung dengan permukaan (`surface`), kemiringan (`grade`), dan moda (`traversableBy`).
  - `routes`: daftar `TrailRoute` terkurasi beserta urutan titik koordinat (`points`).

- `GET /api/public/routes/:id/profile`
  Mengembalikan skema `PublicRouteProfile` untuk visualisasi diagram elevasi:
  - `routeId` (uuid)
  - `points[]`: daftar `PublicElevationPoint`
    - `distanceKm`: akumulasi jarak dari titik awal (km)
    - `elevationMeters`: ketinggian titik (mdpl) atau `null` bila tidak diketahui
    - `nodeId`: UUID titik anchor graf, atau string kosong `""` jika berupa belokan bebas (*unanchored bend*)
    - `name`: nama titik atau label belokan
    - `type`: `basecamp | gerbang | parkir | pos | sumber-air | viewpoint | puncak | persimpangan | area-camp | belokan`
  - `totalDistanceKm`: total jarak tempuh jalur
  - `totalGainMeters`: total kenaikan elevasi (m), bernilai `null` bila data elevasi tidak tersedia
  - `totalLossMeters`: total penurunan elevasi (m), bernilai `null` bila data elevasi tidak tersedia
  - `maxElevationMeters`: ketinggian puncak/maksimal (mdpl), `null` bila tidak ada elevasi
  - `minElevationMeters`: ketinggian terendah (mdpl), `null` bila tidak ada elevasi
  - `steepestGradePercent`: persentase kemiringan tercuram, `null` bila tidak ada elevasi
  - `estimatedDurationMinutes`: estimasi durasi tempuh (menit), `null` bila tidak ada elevasi
  - `elevationAvailable`: boolean penanda apakah jalur memiliki data elevasi
  - `elevationEstimated`: boolean penanda apakah titik-titik elevasi menggunakan hasil interpolasi/estimasi dari titik sekitar

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

## AI Itinerary (implementasi)

- `AiItinerary` — `title`, `summary`, `days[]` (`day`, `title`, `items[]`).
- `AiItineraryItem` — `destinationId?`, `destinationName`, `routeId?`,
  `supportIds[]`, `activity`, `startTime?`, `costEstimate?`, `notes?`.
- `AiBriefing` — `grounded[]` (fakta dari DB), `general[]` (info umum),
  `warnings[]`.
- `AiSource` — `type: destination|route|support`, `id`, `label`.
- Tabel `ai_itineraries` menyimpan cache/audit generasi: `user_id`,
  `request_hash`, `request_json`, `result_json`, `model`, `engine`,
  `latency_ms`, `status`, `created_at`.
- `facilities` (dulu `travel_supports`) menyimpan `price_min`/`price_max` (integer) untuk estimasi
  budget itinerary.

#### Skema Tabel `trip_plans` & Endpoint `/api/plans`
Rencana perjalanan disimpan per-akun di PostgreSQL (tabel `trip_plans`),
terpisah dari cache AI:
- Kolom utama: `id` (uuid PK), `user_id` (uuid FK `users(id)` `ON DELETE CASCADE`),
  `title` (varchar(160)), `start_date` (`date`), `end_date` (`date`),
  `people_count` (integer), `total_budget` (integer), `origin_province` (varchar(100)),
  `note` (text), `summary` (text), `briefing_json` (jsonb), `days_json` (jsonb),
  `sources_json` (jsonb), `checklist_json` (jsonb),
  `destination_ids` (`text[]`), `notice` (text), `ai_warning` (text),
  `engine` (`varchar(30)`: `'draft' | 'gemini' | 'deterministic'`),
  `created_at`, `updated_at` (timestamptz).
  Constraint: `trip_plans_date_range_check` (`end_date >= start_date`).
- Tabel tombstone `trip_plan_deletions` (`user_id`, `client_id` PK, `deleted_at`)
  mencatat penghapusan `client_id` secara atomik bersama `POST /api/plans`.
- Endpoint `/api/plans` (wajib JWT auth, terisolasi per `userId`):
  - `GET /api/plans` — daftar rencana milik user aktif (urut terbaru).
  - `POST /api/plans` — buat rencana/draft baru (409 jika `client_id` sudah di-tombstone).
  - `DELETE /api/plans/client/:clientId` — catat tombstone `client_id` & hapus baris terkait secara atomik.
  - `GET /api/plans/:id`, `PATCH /api/plans/:id`, `DELETE /api/plans/:id` —
    baca, perbarui (termasuk hasil itinerary AI & checklist), dan hapus rencana.

## Relasi Ringkas

```
User 1───* TripPlan
Destination *───* Category           (destination_categories)
Destination 1───* Facility 1───* FacilityProduct
Destination 1───* TrackNode
Destination 1───* RouteSegment        (fromNodeId/toNodeId → TrackNode)
Destination 1───* TrailRoute          (segmentIds[] → RouteSegment)
TrackNode 1───* RouteSegment
Destination 1───1 PreparationChecklist 1───* PreparationItem
TripPlan 1───* TripPlanItem (berisi Destination + Facility[] + checklist progress)
```

## Konvensi

- `ID` = string (uuid/nanoid). `ISODateString` = ISO 8601.
- Enum direpresentasikan sebagai union string literal (`"gunung" | "bukit" | ...`)
  agar mudah dipertukarkan antar aplikasi (TS ↔ Dart ↔ API).