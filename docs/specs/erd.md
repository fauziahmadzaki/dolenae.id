# ERD — Dolenae.id

Rancangan diagram relasi entitas (Entity Relationship Diagram) untuk domain
Dolenae.id — **seluruhnya rancangan**, belum ada tabel/DB.

- **Sumber:** `packages/types/src/*`, `docs/specs/data-model.md`,
  `docs/specs/route-builder.md`, `ADR-0001`, dan layar Figma.
- **Status:** semua entitas **🔜 rancangan** (belum diimplementasi).
- **Render:** Mermaid (didukung GitHub). VS Code perlu ekstensi Markdown
  Preview Mermaid.

---

## 1. ERD Domain Lengkap (rancangan · 🔜)

Pandangan penuh domain sesuai `packages/types`, termasuk yang belum jadi tabel.

```mermaid
erDiagram
    USERS ||--o{ TRIP_PLANS : "plans"
    USERS ||--o{ SAVED_DESTINATIONS : "saves"
    USERS ||--o{ SAVED_TRIP_PLANS : "saves"
    USERS ||--o{ SAVED_CHECKLISTS : "saves"
    USERS ||--o| APP_SETTINGS : "configures"
    USERS ||--o{ ACTIVE_DEVICES : "signs in on"
    USERS ||--o{ APP_NOTIFICATIONS : "receives"

    DESTINATIONS ||--o{ DESTINATION_CATEGORIES : "classified as"
    CATEGORIES   ||--o{ DESTINATION_CATEGORIES : "categorizes"

    DESTINATIONS ||--o{ TRAVEL_SUPPORTS : "has"
    TRACK_NODES  }o--o{ TRAVEL_SUPPORTS : "support links"

    DESTINATIONS ||--o{ TRACK_NODES : "has track nodes"
    DESTINATIONS ||--o{ TRAIL_ROUTES : "has routes"
    TRACK_NODES  ||--o{ ROUTE_SEGMENTS : "from"
    TRACK_NODES  ||--o{ ROUTE_SEGMENTS : "to"
    TRAIL_ROUTES }o--o{ ROUTE_SEGMENTS : "composed of"
    TRAIL_ROUTES }o--o{ TRACK_NODES : "ordered nodes"

    DESTINATIONS ||--o| PREPARATION_CHECKLISTS : "has checklist"
    PREPARATION_CHECKLISTS ||--o{ PREPARATION_ITEMS : "contains"

    TRIP_PLANS ||--o{ TRIP_PLAN_ITEMS : "contains"
    TRIP_PLAN_ITEMS }o--|| DESTINATIONS : "visits"
    TRIP_PLAN_ITEMS }o--o{ TRAVEL_SUPPORTS : "selects"
    TRIP_PLAN_ITEMS }o--o{ PREPARATION_ITEMS : "checklist progress"

    FACILITY_PROPOSALS }o--o| DESTINATIONS : "proposes near"

    USERS {
        uuid id PK
        varchar name
        varchar email UK
        varchar password_hash
        enum role
        timestamptz created_at
        timestamptz updated_at
    }
    CATEGORIES {
        uuid id PK
        varchar name
        varchar slug UK
        enum type
        varchar icon
    }
    DESTINATIONS {
        uuid id PK
        varchar name
        varchar slug UK
        jsonb terrain
        jsonb activities
        enum difficulty
        enum status
        jsonb location
        jsonb access
        jsonb facilities
        int elevation_meters
        timestamptz created_at
    }
    DESTINATION_CATEGORIES {
        uuid destination_id FK
        uuid category_id FK
    }
    TRAVEL_SUPPORTS {
        uuid id PK
        uuid destination_id FK
        enum type
        varchar name
        enum price_range
        bool verified
    }
    TRACK_NODES {
        uuid id PK
        uuid destination_id FK
        enum type "basecamp / gerbang / parkir / pos / sumber-air / viewpoint / puncak / persimpangan / area-camp"
        jsonb coordinate
        int elevation_meters
        text notes
        jsonb support_ids
    }
    ROUTE_SEGMENTS {
        uuid id PK
        uuid from_node_id FK
        uuid to_node_id FK
        enum surface "setapak / aspal / tanah / batu / pasir"
        enum grade "datar / ... / terjal"
        jsonb traversable_by
        bool bidirectional
        float distance_km
        int estimated_duration_minutes
        bool seasonal
        enum status
    }
    TRAIL_ROUTES {
        uuid id PK
        uuid destination_id FK
        jsonb node_ids
        jsonb segment_ids
        enum difficulty
        bool recommended
        enum status
    }
    PREPARATION_CHECKLISTS {
        uuid destination_id PK
    }
    PREPARATION_ITEMS {
        uuid id PK
        uuid checklist_destination_id FK
        varchar name
        enum category "perlengkapan / kesehatan / konservasi / administrasi"
        bool required
        float weight_estimate_kg
    }
    TRIP_PLANS {
        uuid id PK
        uuid user_id FK
        varchar name
        date start_date
        date end_date
        numeric total_estimated_budget
        timestamptz created_at
        timestamptz updated_at
    }
    TRIP_PLAN_ITEMS {
        uuid id PK
        uuid trip_plan_id FK
        int order
        date date
        uuid destination_id FK
        jsonb supports_chosen
        text notes
        jsonb checklist_completed
    }
    FACILITY_PROPOSALS {
        uuid id PK
        varchar name
        enum support_type "accommodation / transport / food"
        varchar nearest_destination_name
        varchar address
        text note
        enum status "menunggu / terverifikasi / ditolak"
        timestamptz created_at
    }
    APP_NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        enum kind "rekomendasi / rencana / checklist / usulan / sistem"
        varchar title
        text body
        bool read
        varchar href
        timestamptz created_at
    }
    SAVED_DESTINATIONS {
        uuid id PK
        uuid user_id FK
        uuid destination_id FK
        timestamptz saved_at
    }
    SAVED_TRIP_PLANS {
        uuid id PK
        uuid user_id FK
        uuid trip_plan_id FK
        enum status "aktif / arsip"
        timestamptz saved_at
    }
    SAVED_CHECKLISTS {
        uuid id PK
        uuid user_id FK
        varchar name
        uuid destination_id FK
        int completed_count
        int total_count
        bool finished
        timestamptz saved_at
    }
    APP_SETTINGS {
        uuid user_id PK
        enum theme "terang / sistem / gelap"
        enum language "id / en"
        bool data_saver
        jsonb notifications
        jsonb privacy
    }
    ACTIVE_DEVICES {
        uuid id PK
        uuid user_id FK
        varchar label
        timestamptz last_active_at
        bool current
    }
    FAQ_ITEMS {
        uuid id PK
        enum category "akun / perjalanan / fasilitas / data"
        varchar question
        text answer
    }
    FEEDBACK_SUBMISSIONS {
        uuid id PK
        enum category "bug / saran / konten / lainnya"
        varchar subject
        text message
        int rating
        timestamptz created_at
    }
```

Entitas lepas (tanpa relasi): `FAQ_ITEMS`, `FEEDBACK_SUBMISSIONS`.

Entitas AI (`Preference`, `RuleScore`, `RecommendationResult`) **tidak dipersistensi**
— hanya tipe runtime untuk output rekomendasi, jadi tidak digambar sebagai tabel.

---

## 2. Kamus Entitas

| Entitas | Status | Ringkas |
| --- | --- | --- |
| **User** | 🔜 | id, name, email, role (`wisatawan`/`merchant`/`admin`). `Merchant` = User + businessName/description. |
| **Category** | 🔜 | Kategori terkelola admin; `type` = `terrain`/`activity`, `icon` Lucide. |
| **Destination** | 🔜 | Destinasi alam; klasifikasi, geografi (`location`), akses, fasilitas, status `draft`/`published`. |
| **DestinationCategory** | 🔜 | Pivot M:N destinasi ↔ kategori. |
| **TravelSupport** | 🔜 | Pendukung destinasi; diskriminator `accommodation`/`transport`/`food`. |
| **TrackNode** | 🔜 | Titik jalur (basecamp, pos, puncak, …) + elevasi + supportIds. |
| **RouteSegment** | 🔜 | Ruas antar dua node; surface, grade, traversableBy, jarak, durasi. |
| **TrailRoute** | 🔜 | Jalur bernama = rangkaian node/segment (graf, ADR-0001). |
| **PreparationChecklist** | 🔜 | Checklist per destinasi (1:1). |
| **PreparationItem** | 🔜 | Baris item perlengkapan (kategori + required + bobot). |
| **TripPlan** | 🔜 | Rencana perjalanan milik user + budget. |
| **TripPlanItem** | 🔜 | Satu destinasi dalam rencana + support terpilih + progress checklist. |
| **FacilityProposal** | 🔜 | Usulan fasilitas dari merchant/user; status verifikasi. |
| **AppNotification** | 🔜 | Notifikasi in-app (rekomendasi/rencana/checklist/usulan/sistem). |
| **SavedDestination / SavedTripPlan / SavedChecklist** | 🔜 | Item yang disimpan user. |
| **AppSettings / ActiveDevice** | 🔜 | Setelan aplikasi & perangkat aktif. |
| **FaqItem** | 🔜 | Item FAQ (kategori akun/perjalanan/fasilitas/data). |
| **FeedbackSubmission** | 🔜 | Kirim masukan/bug + rating 1–5. |

---

## 3. Relasi Ringkas

```
User 1───* TripPlan
User 1───* SavedDestination / SavedTripPlan / SavedChecklist
User 1───1 AppSettings ;  User 1───* ActiveDevice ;  User 1───* AppNotification

Destination *───* Category            (destination_categories)
Destination 1───* TravelSupport
Destination 1───* TrackNode
Destination 1───* RouteSegment        (fromNodeId/toNodeId → TrackNode)
Destination 1───* TrailRoute          (segmentIds[] / nodeIds[])
TrackNode   1───* RouteSegment
TrackNode   *───* TravelSupport       (supportIds)
Destination 1───1 PreparationChecklist 1───* PreparationItem

TripPlan 1───* TripPlanItem
TripPlanItem *───1 Destination
TripPlanItem *───* TravelSupport      (supportsChosen)
TripPlanItem *───* PreparationItem    (checklistCompleted)

FacilityProposal *───o| Destination   (via nearest name)
```

Konvensi: `ID` = string (uuid/nanoid); tanggal = ISO 8601 / `timestamptz`;
enum sebagai union string literal (TS ↔ Dart ↔ API). Mobile Flutter punya model
Dart tersendiri yang diselaraskan manual dengan `packages/types`.

---

## 4. Cakupan & Kelengkapan

**Entitas:** seluruh `interface`/`type` yang diekspor `packages/types/src/index.ts`
sudah dirancang di sini — **semua berstatus 🔜** (belum ada tabel/DB).

**Sumber entitas route.** `TrackNode`, `RouteSegment`, `TrailRoute` **belum ada
di `packages/types`** — bersumber dari `docs/specs/data-model.md`,
`docs/specs/route-builder.md`, dan `ADR-0001`. Karena itu ditandai 🔜 (rencana).

**Tidak digambar sebagai tabel (memang begitu):**

| Jenis | Contoh | Alasan |
| --- | --- | --- |
| Value object tertanam | `LocationInfo`, `AccessInfo`, `FacilityInfo`, `AccessPoint`, `ContactInfo`, `NotificationPreferences`, `PrivacySettings` | Bagian dari entitas induk (di DB sebagai `jsonb`) |
| View / turunan | `DestinationDetail` (= Destination + supports), `RouteProfile` (turunan) | Dihitung, bukan entitas |
| Runtime AI | `Preference`, `RuleScore`, `RecommendationResult`, `RecommendationContext` | Tidak dipersistensi |
| State UI | `SearchFilter`, `SortOption`, `DifficultyFilter` | State klien |
| Primitif | `ID`, `ISODateString` | Basis tipe |

**Referensi wilayah (bukan tabel DB).** `packages/regions` menyimpan dataset
`province`/`regency`/`district` (nearest-centroid + elevasi) untuk dropdown &
reverse geocode (`ADR-0004`). Dataset ini **mengisi** `Destination.location`,
bukan relasi tabel.

**Foreign key bernuansa inferensi (🔜).** Tipe domain menyimpan sebagian relasi
sebagai objek bersarang, sehingga di diagram ditarik FK eksplisit agar ERD utuh;
FK berikut **belum ada di tipe** dan perlu ditetapkan saat implementasi tabel:

- `SAVED_DESTINATIONS.user_id`, `SAVED_TRIP_PLANS.user_id`,
  `SAVED_CHECKLISTS.user_id` — konteks sesi user, bukan field tipe.
- `APP_NOTIFICATIONS.user_id` — tidak ada di tipe `AppNotification`.
- `TRIP_PLAN_ITEMS.trip_plan_id` — implisit dari `TripPlan.items[]`.
- `PREPARATION_ITEMS.checklist_destination_id` — implisit dari
  `PreparationChecklist.items[]`.

---

## 5. Entitas Back-office & Merchant (inferensi dari Figma)

Entitas di bawah ini **belum ada di `packages/types`/DB** — disimpulkan dari
layar **Figma** (page `Hi-Fi Web` & `Lo-Fi Web`). Status: 🔜. Perlu diangkat ke
`packages/types` saat implementasi.

```mermaid
erDiagram
    USERS ||--o| MERCHANT_PROFILES : "has"
    MERCHANT_PROFILES ||--o{ TRAVEL_SUPPORTS : "manages"
    TRAVEL_SUPPORTS ||--o{ ROOM_TYPES : "room types"
    TRAVEL_SUPPORTS ||--o{ VERIFICATION_REQUESTS : "subject of"
    MERCHANT_PROFILES ||--o{ VERIFICATION_REQUESTS : "submits"
    USERS ||--o{ REVIEWS : "writes"
    DESTINATIONS ||--o{ REVIEWS : "reviewed in"
    TRAVEL_SUPPORTS ||--o{ REVIEWS : "reviewed in"
    DESTINATIONS ||--o{ DATA_REPORTS : "reported in"
    USERS ||--o{ AUDIT_LOGS : "acts in"

    MERCHANT_PROFILES {
        uuid user_id PK
        varchar business_name
        text description
        bool verified
        varchar logo
        jsonb contact
    }
    VERIFICATION_REQUESTS {
        uuid id PK
        uuid support_id FK
        uuid merchant_user_id FK
        uuid destination_id FK
        enum type "accommodation / transport / food"
        enum status "menunggu / disetujui / ditolak / perlu-revisi"
        timestamptz submitted_at
        uuid reviewed_by FK
        timestamptz reviewed_at
        text note
    }
    ROOM_TYPES {
        uuid id PK
        uuid support_id FK
        varchar name
        varchar capacity
        int price_per_night
    }
    REVIEWS {
        uuid id PK
        uuid author_user_id FK
        enum target_type "destination / support / merchant"
        uuid target_id
        int rating "1..5"
        text comment
        timestamptz created_at
    }
    DATA_REPORTS {
        uuid id PK
        uuid destination_id FK
        text issue
        enum status "dilaporkan / perlu-tindak-lanjut / selesai"
        timestamptz detected_at
    }
    AUDIT_LOGS {
        uuid id PK
        timestamptz created_at
        uuid actor_user_id FK "nullable (Sistem)"
        enum actor_role "admin / merchant / sistem"
        varchar action
        varchar target_type
        uuid target_id
        varchar target_label
        varchar status
    }
```

### Bukti & catatan per entitas

| Entitas | Sumber (Figma) | Catatan |
| --- | --- | --- |
| **MerchantProfile** | Web Admin sidebar "Merchant"; Lo-Fi "Merchant Overview/Profil Bisnis" | `Merchant extends User` sudah ada di types; kini pasti punya status `verified`, statistik layanan, rating. |
| **VerificationRequest (Pengajuan)** | Hi-Fi `Admin - Verifikasi`; Lo-Fi `Merchant - Pengajuan` | Merchant mengajukan **layanan** → admin tinjau (Menunggu/Disetujui/Ditolak/Perlu revisi). Berbeda dari `FacilityProposal` (usulan wisatawan). |
| **RoomType** | Hi-Fi `Admin Fasilitas - Penginapan` | Sub-entitas penginapan: `Kamar Deluxe - kapasitas 2 - Rp350.000`. |
| **Review (Ulasan)** | Lo-Fi `Merchant - Ulasan` (rating 4.8 dari 32); sort "rating" di Jelajah | Ulasan untuk destinasi **dan** layanan; menyimpan agregat rating. |
| **DataReport ("Data dilaporkan")** | Hi-Fi `Admin - Overview` KPI + log "Deteksi data kosong → Dilaporkan" | Temuan otomatis sistem atas data tidak lengkap. |
| **AuditLog** | Hi-Fi `Admin - Overview` tabel aktivitas (Waktu/Aktor/Aktivitas/Target/Status) | Aktor: Admin / Merchant / Sistem. |

### Tambahan field pada entitas lama

- **TravelSupport** — `owner_user_id` (merchant), `verification_status`
  (menunggu/terverifikasi/ditolak/perlu-revisi), `active`, `coordinate`,
  `address`, `distance_from_basecamp`, **`view_count`** (tampilan).
  Lihat `Admin Fasilitas - Penginapan` & `Merchant - Kelola Layanan`.
- **Destination** — `highlights[]` ("Daya tarik utama" di `Create Destinasi -
  Step 1`), `primary_image` (foto utama, maks 6 foto) di Step 5.
- **Category** — sudah sesuai (`Terrain`/`Aktivitas` + jumlah destinasi).

### Menu back-office yang belum ada layarnya

Sidebar mengungkap modul yang di-*reference* tapi **belum digambar**:
- Admin: **Konten**, **Pengguna**, **Pengaturan**.
- Merchant: **Pengajuan**, **Profil Bisnis**, **Ulasan**, **Pengaturan**.

→ Perlu keputusan produk & desain sebelum masuk ERD/implementasi.

---

## 6. Route Builder — Desain Entitas (detail)

> **Hanya desain.** Belum ada tipe di `packages/types`, belum ada tabel/API/UI.
> Sumber: `docs/specs/route-builder.md` + `ADR-0001` + Figma `Hi-Fi Web`
> (Rute & Elevasi). Tidak ada kode di sini — field ditulis sebagai tabel.

### 7.1 Konsep

Jaringan jalur dimodelkan sebagai **graf**: **titik** (node) dihubungkan
**ruas** (segment), lalu dirangkai jadi **jalur** bernama (route). Ruas bisa
dipakai banyak jalur; titik bisa jadi persimpangan. Tiap titik punya elevasi →
**profil elevasi** dapat dihitung. Ini **bukan** navigasi/routing (sesuai batas
produk).

### 7.2 Diagram relasi

```mermaid
erDiagram
    DESTINATIONS ||--o{ TRACK_NODES : "has track nodes"
    DESTINATIONS ||--o{ ROUTE_SEGMENTS : "has segments"
    DESTINATIONS ||--o{ TRAIL_ROUTES : "has routes"
    TRACK_NODES  ||--o{ ROUTE_SEGMENTS : "from node"
    TRACK_NODES  ||--o{ ROUTE_SEGMENTS : "to node"
    TRAIL_ROUTES }o--o{ ROUTE_SEGMENTS : "segment ids"
    TRAIL_ROUTES }o--o{ TRACK_NODES : "node ids (ordered)"
    TRACK_NODES  }o--o{ TRAVEL_SUPPORTS : "support links"
    TRAIL_ROUTES ||--o| ROUTE_PROFILES : "derived (computed)"

    TRACK_NODES {
        uuid id PK
        uuid destination_id FK
        varchar name
        enum type
        jsonb coordinate
        int elevation_meters
        text notes
        jsonb support_ids
        timestamptz created_at
        timestamptz updated_at
    }
    ROUTE_SEGMENTS {
        uuid id PK
        uuid destination_id FK
        uuid from_node_id FK
        uuid to_node_id FK
        enum surface
        enum grade
        jsonb traversable_by
        bool bidirectional
        float distance_km
        int estimated_duration_minutes
        bool seasonal
        text notes
        enum status
        timestamptz created_at
        timestamptz updated_at
    }
    TRAIL_ROUTES {
        uuid id PK
        uuid destination_id FK
        varchar name
        text description
        uuid basecamp_node_id FK
        jsonb node_ids
        jsonb segment_ids
        enum surface
        enum grade
        jsonb traversable_by
        enum difficulty
        bool recommended
        enum status
        timestamptz created_at
        timestamptz updated_at
    }
    ROUTE_PROFILES {
        uuid route_id PK
        jsonb points
        float total_distance_km
        int total_gain_meters
        int total_loss_meters
        int max_elevation_meters
        int min_elevation_meters
        float steepest_grade_percent
        int estimated_duration_minutes
    }
```

### 7.3 Enum

| Enum | Nilai |
| --- | --- |
| **TrackNodeType** | `basecamp`, `gerbang`, `parkir`, `pos`, `sumber-air`, `viewpoint`, `puncak`, `persimpangan`, `area-camp` |
| **RouteSurface** | `setapak`, `aspal`, `tanah`, `batu`, `pasir` (+ `campuran` untuk ringkasan jalur) |
| **RouteGrade** | `datar`, `landai`, `sedang`, `terjal`, `sangat-terjal` |
| **RouteTraversal** | `pejalan-kaki`, `sepeda`, `motor`, `mobil`, `jeep`, `pickup`, `elf`, `minibus`, `ojek`, `open-trip` |
| **RouteStatus** | `draft`, `diterbitkan`, `terverifikasi` |
| **difficulty** | pakai ulang `DestinationCondition`: `ramah-pemula`, `menengah`, `sulit`, `butuh-lokal-guide` |

### 7.4 TrackNode (Titik)

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `id` | uuid | ✅ | PK |
| `destinationId` | FK → Destination | ✅ | Pemilik jaringan |
| `name` | string | ✅ | mis. "Cemoro Lawang" |
| `type` | TrackNodeType | ✅ | Jenis titik |
| `coordinate` | { latitude, longitude } | ✅ | Titik peta |
| `elevationMeters` | int | ✅ | Input manual (fase ini) |
| `notes` | text | — | Catatan |
| `supportIds` | uuid[] | — | Tautan `TravelSupport` (biasanya basecamp) |
| `createdAt` / `updatedAt` | timestamptz | ✅ | Audit |

### 7.5 RouteSegment (Ruas)

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `id` | uuid | ✅ | PK |
| `destinationId` | FK → Destination | ✅ | Harus sama dengan node |
| `fromNodeId` | FK → TrackNode | ✅ | Titik awal |
| `toNodeId` | FK → TrackNode | ✅ | Titik akhir (≠ from) |
| `surface` | RouteSurface | ✅ | Permukaan |
| `grade` | RouteGrade | ✅ | Kecuraman |
| `traversableBy` | RouteTraversal[] | ✅ | Moda yang boleh lewat |
| `bidirectional` | bool | ✅ | Dua arah / satu arah |
| `distanceKm` | float | — | Auto haversine, bisa ditimpa |
| `estimatedDurationMinutes` | int | — | Estimasi waktu |
| `seasonal` | bool | — | Bisa ditutup pada musim tertentu |
| `notes` | text | — | mis. rawan longsor |
| `status` | RouteStatus | ✅ | Status publikasi |
| `createdAt` / `updatedAt` | timestamptz | ✅ | Audit |

### 7.6 TrailRoute (Jalur)

| Field | Tipe | Wajib | Keterangan |
| --- | --- | --- | --- |
| `id` | uuid | ✅ | PK |
| `destinationId` | FK → Destination | ✅ | Pemilik |
| `name` | string | ✅ | mis. "Trek Kawah" |
| `description` | text | — | Deskripsi jalur |
| `basecampNodeId` | FK → TrackNode | — | Titik awal disarankan |
| `nodeIds` | uuid[] | ✅ | Berurutan (start → end) |
| `segmentIds` | uuid[] | ✅ | Panjang = `nodeIds.length - 1` |
| `surface` | RouteSurface / `campuran` | ✅ | Ringkasan |
| `grade` | RouteGrade | ✅ | Grade dominan/terberat |
| `traversableBy` | RouteTraversal[] | ✅ | Ringkasan |
| `difficulty` | DestinationCondition | ✅ | Diturunkan |
| `recommended` | bool | ✅ | Jalur unggulan |
| `status` | RouteStatus | ✅ | Status publikasi |
| `createdAt` / `updatedAt` | timestamptz | ✅ | Audit |

### 7.7 Turunan — RouteProfile & ElevationPoint (tidak disimpan)

| Entitas | Field | Keterangan |
| --- | --- | --- |
| **RouteProfile** | `routeId`, `points[]`, `totalDistanceKm`, `totalGainMeters`, `totalLossMeters`, `maxElevationMeters`, `minElevationMeters`, `steepestGradePercent`, `estimatedDurationMinutes` | Dihitung dari urutan node/segment |
| **ElevationPoint** | `distanceKm` (kumulatif), `elevationMeters`, `nodeId?`, `name?` | Titik data grafik |

### 7.8 Relasi & kardinalitas

```
Destination 1───* TrackNode
Destination 1───* RouteSegment
Destination 1───* TrailRoute
TrackNode   1───* RouteSegment        (via fromNodeId / toNodeId)
TrailRoute  *───* RouteSegment        (segmentIds, ordered)
TrailRoute  *───* TrackNode           (nodeIds, ordered)
TrackNode   *───* TravelSupport       (supportIds)
TrailRoute  1───1 RouteProfile        (derived, computed)
```

### 7.9 Aturan validasi & rumus (dari spec)

**Validasi**
- Ruas: `fromNodeId ≠ toNodeId`; kedua node milik `destinationId` yang sama;
  tidak boleh ada ruas duplikat untuk pasangan `(from, to)` (arah diabaikan).
- Jalur: setiap pasangan node berurutan **wajib** punya ruas (opsi buat ruas
  otomatis); jalur disarankan mulai dari `basecamp` (peringatan, bukan blokir).
- Peringatan: titik terputus (tak punya ruas); sanity check elevasi vs
  `Destination.elevationMeters`.

**Rumus turunan**
- `distanceKm` ruas = haversine antar koordinat (bisa ditimpa).
- Jarak jalur = Σ `distanceKm` ruas penyusun.
- Gain/loss = Σ selisih elevasi positif/negatif antar node berurutan.
- Grade ruas (%) = `|Δelevasi| / (distanceKm × 1000) × 100`.
- Estimasi waktu = Naismith: `jarakKm/5` jam + `totalGainMeters/600` jam
  (atau Σ `estimatedDurationMinutes` bila semua terisi).
- `difficulty` = dipetakan dari gain total, jarak, dan grade terberat.

### 7.10 Contoh data (Gunung Bromo)

| Titik | Tipe | Elevasi |
| --- | --- | --- |
| Cemoro Lawang | basecamp | 2.200 m |
| Gerbang Penanjakan | gerbang | 2.450 m |
| Penanjakan 1 | viewpoint | 2.770 m |
| Pasir Berbisik | pos | 2.150 m |
| Savana (Teletubbies) | viewpoint | 2.180 m |
| Kawah Bromo | puncak | 2.329 m |
| Pura Luhur Poten | pos | 2.200 m |

Contoh ruas: `Cemoro Lawang → Gerbang Penanjakan` (aspal/sedang),
`Gerbang Penanjakan → Penanjakan 1` (aspal/terjal),
`Cemoro Lawang → Pasir Berbisik` (setapak/landai),
`Pasir Berbisik → Kawah Bromo` (setapak/sedang).
Contoh jalur: **Jeep Sunrise**, **Trek Kawah**, **Savana + Kawah**.

### 7.11 API (rencana) & Figma

| Endpoint | Fungsi |
| --- | --- |
| `GET /destinations/:id/routes` | Daftar jalur destinasi |
| `GET /routes/:id` | Detail jalur + node/segment |
| `GET /routes/:id/profile` | `RouteProfile` (grafik elevasi) |
| `GET /track-nodes?destinationId=` | Daftar titik |
| `GET /segments?destinationId=` | Daftar ruas |
| `POST/PATCH/DELETE /track-nodes`, `/segments`, `/routes` | Editor (admin) |

Figma: `Admin - Rute & Elevasi - Preview`, `Admin - Rute & Elevasi - Peta
Fullscreen`, + 6 menu konteks peta (`Hi-Fi Web`, deret `x=18300`).

### 7.12 Status

🔜 **Desain selesai; implementasi belum.** Yang belum: tipe di
`packages/types/src/route.ts`, seed, endpoint, dan UI admin/publik. Keputusan
yang masih terbuka: siapa boleh mengedit (admin saja / merchant juga?), dan
cakupan tampilan publik (hanya grafik + daftar, atau lebih).
