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
- `facilities`: toilet, warung, mushola, parkir, homestay dekat, dll
- ekonomi: `entryFee`, `elevationMeters`
- publikasi: `status` (`draft` | `published` | `archived`), `verified`
- meta: `images`, `guideRequired`, `categoryIds[]`, `createdAt`, `updatedAt`

Nilai `difficulty`: `ramah-pemula` | `menengah` | `sulit`.

> Implementasi backend (`apps/backend/src/db/schema.ts`) menyimpan geografi dan
> akses sebagai kolom datar (`province`, `regency`, `district`, `latitude`,
> `longitude`, `accessPoint`, `accessDescription`, `accessTransport`,
> `accessDuration`, `accessDistanceKm`), sedangkan API mengeksposnya sebagai
> objek bersarang `location` dan `access`.

**Relasi:** satu destinasi memiliki banyak `TravelSupport`
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

### TravelSupport (Kebutuhan Pendukung)
Layanan pendukung di sekitar destinasi dikelompokkan lewat enum `support_category`:
- `accommodation` — penginapan (homestay, villa, camping ground sekitar basecamp)
- `transport` — transportasi lokal (sewa jeep, ojek gunung, shuttle, elf)
- `food` — tempat makan atau kuliner lokal

#### Skema Tabel `travel_supports`
- `id` (uuid, primary key, default `gen_random_uuid()`)
- `destination_id` (uuid, not null) — foreign key ke `destinations(id)` dengan `ON DELETE CASCADE`
- `name` (varchar(120), not null)
- `category` (`support_category` enum: `'accommodation' | 'transport' | 'food'`, not null)
- `description` (text, opsional)
- `location_label` (text, opsional) — label lokasi singkat (mis. "Cemoro Lawang, Ngadisari")
- `capacity` (text, opsional) — kapasitas kamar/penumpang
- `distance_label` (text, opsional) — jarak relatif ke basecamp/titik kumpul
- `price_label` (text, opsional) — tampilan harga (mis. "Rp 250.000")
- `price_unit` (text, opsional) — satuan harga (mis. "/malam", "/trip", "/porsi")
- `contact_phone` (text, opsional)
- `contact_whatsapp` (text, opsional)
- `contact_instagram` (text, opsional)
- `image_url` (text, opsional)
- `facilities` (text[], not null, default `[]`) — fasilitas kamar/unit
- `routes` (text[], not null, default `[]`) — rute transportasi yang dilayani
- `cuisine` (text[], not null, default `[]`) — jenis masakan/menu
- `includes_driver` (boolean, not null, default `false`)
- `verified` (boolean, not null, default `false`)
- `created_at` (timestamp with time zone, not null, default `now()`)
- `updated_at` (timestamp with time zone, not null, default `now()`)

**Index:**
- `travel_supports_destination_idx` pada `destination_id`

**Public Endpoints:**
- `GET /api/destinations/:id/supports?page=1&limit=20` — daftar kebutuhan pendukung untuk destinasi published (diurutkan berdasarkan `category`, `name`, `id`; menyertakan field `relatedDestinationName`).
- `GET /api/supports/:id` — detail satu kebutuhan pendukung (hanya jika destinasi induk berstatus `published`; menyertakan `relatedDestinationName`).

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
- `travel_supports` menambah `price_min`/`price_max` (integer) untuk estimasi
  budget itinerary.

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