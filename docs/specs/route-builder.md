# Route Builder (Admin) — Dolenae.id

Spesifikasi fitur **Route Builder** di sisi admin: admin menyusun **titik**
(basecamp, pos, puncak, dsb.) yang dihubungkan **ruas**, lalu dirangkai menjadi
**jalur** bernama. Karena tiap titik punya **elevasi**, sistem dapat menggambar
**profil elevasi** tiap jalur.

> Status implementasi: **desain (Figma) + spesifikasi**. Kode
> (`packages/types`, `packages/seed`, API, UI) menyusul sebagai fase lanjutan.
> Bagian publik (web/mobile) belum dirancang.

---

## 1. Konsep

Model data berbentuk **graf kecil** (bukan satu daftar titik linear):

```
        (Cemoro Lawang)  basecamp 2.200
          /          \
   aspal /            \ setapak
        /              \
(Gerbang Penanjakan)  (Pasir Berbisik) 2.150
   terjal |              /        \
          |        setapak|        | setapak
   (Penanjakan 1)   (Kawah Bromo) (Savana)
     2.770             2.329       2.180
```

- **Titik (node)** — lokasi ber-nama dengan koordinat + elevasi.
- **Ruas (segment)** — sambungan **dua titik**; punya kategori (`surface`,
  `grade`) dan daftar moda yang boleh lewat. Geometri = **garis lurus**
  antar-titik (node-to-node).
- **Jalur (route)** — rangkaian ruas bernama dari **start → end**. Satu ruas
  bisa dipakai banyak jalur, dan sebuah titik bisa menjadi **persimpangan**
  (percabangan).

**Alasan pakai graf:** pada gunung nyata satu ruas sering dipakai bersama
(mis. `Cemoro Lawang → Pasir Berbisik` dipakai jalur jeep *dan* jalur kaki),
dan dari satu titik bisa bercabang ke beberapa tujuan. Graf memberi *reuse*
ruas sekaligus memungkinkan banyak jalur dari jaringan yang sama — sesuai
kebutuhan "start point dan end point tapi bisa disambung-sambung per titik".

**Basecamp** adalah titik dengan `type = "basecamp"`. Ia dapat menautkan
`TravelSupport` (penginapan/transport/makanan) lewat `supportIds`, sehingga
jaringan rute terhubung dengan ekosistem fasilitas yang sudah ada.

---

## 2. Entitas domain

Detail tipe (rencana `packages/types/src/route.ts`):

### 2.1 TrackNode (Titik)

```ts
export type TrackNodeType =
  | "basecamp" | "gerbang" | "parkir" | "pos" | "sumber-air"
  | "viewpoint" | "puncak" | "persimpangan" | "area-camp";

export interface TrackNode {
  id: ID;
  destinationId: ID;
  name: string;
  type: TrackNodeType;
  coordinate: { latitude: number; longitude: number };
  elevationMeters: number;          // input manual (prototype)
  notes?: string;
  supportIds?: ID[];                // tautan TravelSupport di basecamp
}
```

### 2.2 RouteSegment (Ruas)

```ts
export type RouteSurface = "setapak" | "aspal" | "tanah" | "batu" | "pasir";
export type RouteGrade   = "datar" | "landai" | "sedang" | "terjal" | "sangat-terjal";

export type RouteTraversal =
  | "pejalan-kaki" | "sepeda" | "motor" | "mobil" | "jeep"
  | "pickup" | "elf" | "minibus" | "ojek" | "open-trip";

export type RouteStatus = "draft" | "diterbitkan" | "terverifikasi";

export interface RouteSegment {
  id: ID;
  destinationId: ID;
  fromNodeId: ID;
  toNodeId: ID;
  surface: RouteSurface;            // permukaan (setapak, aspal, …)
  grade: RouteGrade;                // kecuraman (…, terjal, …)
  traversableBy: RouteTraversal[];  // "apa saja yang bisa lewat"
  bidirectional: boolean;           // dua arah / satu arah
  distanceKm?: number;              // auto dari koordinat, bisa ditimpa
  estimatedDurationMinutes?: number;
  seasonal?: boolean;               // bisa ditutup pada musim tertentu
  notes?: string;                   // mis. rawan longsor
  status: RouteStatus;
}
```

> **Keputusan (ADR-0001):** permukaan dan kecuraman **dipisah** menjadi dua
> field. Label "setapak"/"aspal" masuk `surface`, "terjal" masuk `grade`.
> Ini lebih benar daripada satu enum campuran, tanpa menghilangkan label yang
> diminta.

### 2.3 TrailRoute (Jalur)

```ts
export interface TrailRoute {
  id: ID;
  destinationId: ID;
  name: string;                     // mis. "Trek Kawah"
  description?: string;
  basecampNodeId?: ID;
  nodeIds: ID[];                    // berurutan, start → end
  segmentIds: ID[];                 // panjang = nodeIds.length - 1
  surface: RouteSurface | "campuran";
  grade: RouteGrade;                // grade dominan/terberat
  traversableBy: RouteTraversal[];
  difficulty: DestinationCondition;
  recommended: boolean;
  status: RouteStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

### 2.4 Turunan (dihitung, tidak disimpan)

```ts
export interface ElevationPoint {
  distanceKm: number;               // jarak kumulatif dari start
  elevationMeters: number;
  nodeId?: ID;                      // terisi pada titik node
  name?: string;
}

export interface RouteProfile {
  routeId: ID;
  points: ElevationPoint[];
  totalDistanceKm: number;
  totalGainMeters: number;
  totalLossMeters: number;
  maxElevationMeters: number;
  minElevationMeters: number;
  steepestGradePercent: number;
  estimatedDurationMinutes: number;
}
```

---

## 3. Aturan & perhitungan

### 3.1 Validasi

- **Ruas:** `fromNodeId ≠ toNodeId`; kedua titik ada dan `destinationId`-nya
  sama; tidak boleh ada ruas duplikat untuk pasangan `(from, to)` yang sama
  (arah diabaikan untuk deteksi duplikat; arah ditangani `bidirectional`).
- **Jalur:** setiap pasangan titik berurutan **wajib** punya ruas. Jika belum
  ada saat menyusun jalur, builder menawarkan **buat ruas otomatis** (dengan
  kategori default).
- **Jalur** disarankan mulai dari `basecamp` (peringatan, bukan blokir).
- Deteksi **titik terputus** (tidak punya ruas) dan tampilkan sebagai
  peringatan di panel daftar titik.
- Elevasi dibandingkan dengan `Destination.elevationMeters` sebagai sanity
  check (peringatan bila titik puncak < elevasi destinasi, dsb.).

### 3.2 Rumus derivasi

- **Jarak ruas** (`distanceKm`): haversine antar dua koordinat (auto; bisa
  ditimpa manual).
- **Jarak jalur** = jumlah `distanceKm` ruas penyusun.
- **Gain / loss** = jumlah selisih elevasi positif / negatif antar titik
  berurutan.
- **Grade ruas (%)** = `|Δelevasi| / (distanceKm × 1000) × 100`
  (kemiringan rata-rata ruas).
- **Estimasi waktu** = Naismith:
  `jarakKm / 5` jam + `totalGainMeters / 600` jam (default), atau jumlah
  `estimatedDurationMinutes` ruas bila semua terisi.
- **Kesulitan** (`difficulty`) diturunkan dari kombinasi gain total, jarak,
  dan grade terberat — dipetakan ke union `DestinationCondition`
  (`ramah-pemula`, `menengah`, `sulit`, `butuh-lokal-guide`).

### 3.3 Profil elevasi

- **Titik data:** satu `ElevationPoint` per node (`distanceKm` kumulatif,
  `elevationMeters` node). Opsional interpolasi linear di tengah ruas untuk
  kurva lebih halus.
- **Visual:** area/line chart, sumbu-x jarak (km), sumbu-y elevasi (mdpl),
  marker di tiap node (label nama), ringkasan: total naik, total turun,
  titik tertinggi, jarak, estimasi waktu.

---

## 4. Contoh data — Gunung Bromo

Titik:

| Titik | Tipe | Elevasi |
| --- | --- | --- |
| Cemoro Lawang | basecamp | 2.200 m |
| Gerbang Penanjakan | gerbang | 2.450 m |
| Penanjakan 1 | viewpoint | 2.770 m |
| Pasir Berbisik | pos | 2.150 m |
| Savana (Teletubbies) | viewpoint | 2.180 m |
| Kawah Bromo | puncak | 2.329 m |
| Pura Luhur Poten | pos | 2.200 m |

Ruas (contoh):

| Dari → Ke | Surface | Grade | Bisa lewat |
| --- | --- | --- | --- |
| Cemoro Lawang → Gerbang Penanjakan | aspal | sedang | mobil, jeep, motor, pejalan-kaki |
| Gerbang Penanjakan → Penanjakan 1 | aspal | terjal | jeep, motor |
| Cemoro Lawang → Pasir Berbisik | setapak | landai | jeep, sepeda, pejalan-kaki |
| Pasir Berbisik → Kawah Bromo | setapak | sedang | pejalan-kaki |
| Pasir Berbisik → Savana | setapak | datar | pejalan-kaki |
| Cemoro Lawang → Pura Luhur Poten | aspal | datar | mobil, motor, pejalan-kaki |

Jalur:

- **Jeep Sunrise** — Cemoro Lawang → Gerbang Penanjakan → Penanjakan 1
  (aspal/terjal, jeep).
- **Trek Kawah** — Cemoro Lawang → Pasir Berbisik → Kawah Bromo
  (setapak, pejalan-kaki).
- **Savana + Kawah** — Cemoro Lawang → Pasir Berbisik → Savana → (kembali) →
  Kawah Bromo (setapak, pejalan-kaki).

---

## 5. Layar admin (Figma)

Shell admin memakai `AdminSidebar (Alam)` (256) + `Main` (1184), `Content`
padding 32 / lebar konten 1120, sama seperti layar admin lain
(`docs/specs/ui-ux-hifi-web.md`).

### 5.1 Struktur: 2 halaman utama

Fitur dipecah menjadi **dua halaman** dengan peran berbeda:

1. **Preview & Detail** — halaman baca/detail: peta jaringan, daftar jalur,
   **ruas penyusun ditampilkan di sini**, dan profil elevasi jalur terpilih.
   Ini tempat "ruas" ditampilkan. Ada tombol `Kelola di peta`.
2. **Peta Full Screen (Kelola peta)** — halaman editor: peta besar, **tanpa
   panel tetap**. Semua editing lewat **context menu → dropdown nempel**.

### 5.2 Interaksi editor peta

- **Pan / zoom:** klik kiri tahan + geser = pan; scroll/pinch = zoom (toolbar
  `+` / `−` / reset di kanan atas peta).
- **Klik kanan pada peta** → context menu **di posisi kursor**; isinya
  bergantung pada objek di bawahnya:
  - **Area kosong:** `Tambah titik di sini`, `Tambah jalur dari sini`,
    `Salin koordinat`.
  - **Titik:** `Buat jalur dari sini`, `Edit titik`, `Hapus titik`.
  - **Jalur:** `Lihat detail jalur`, `Edit jalur`, `Hapus jalur`.
  - **Sedang menyambung:** `Jadikan titik akhir`, `Titik baru di sini`,
    `Batal menyambung`.
- **Memilih `Tambah titik` / `Tambah jalur`** → **dropdown form** (nempel di
  posisi menu, bukan modal besar) untuk mengisi field.
- **Menyambung jalur:** dari titik asal, klik titik lain yang ada **atau** buat
  titik akhir baru. **Titik terakhir otomatis menjadi titik akhir** jalur.

> Catatan: Figma adalah desain **statis**; pan/zoom/klik-kanan tidak benar-benar
> berfungsi — setiap menu diwakili **frame terpisah**.

### 5.3 Inventaris layar (Figma)

**Status: sudah dibuat** (page `Hi-Fi Web`, deret `x=18300`, tema "Alam").
Peta digambar dari primitif (`flex="none"` + koordinat absolut; garis ruas
`Rect` diputar via `eval`; menu/dropdown nempel sebagai anak ber-`x/y` di peta).

| # | Layar | Node | Ukuran | Posisi |
| --- | --- | --- | --- | --- |
| 1 | `Admin - Rute & Elevasi - Preview (1440)` | `165:7562` | 1440×1225 | 18300,0 |
| 2 | `Admin - Rute & Elevasi - Peta Fullscreen (1440)` | `165:12402` | 1440×752 | 18300,1500 |
| 3 | `Admin - Peta - Menu Peta Kosong (1440)` | `165:12837` | 1440×752 | 18300,2400 |
| 4 | `Admin - Peta - Menu Titik (1440)` | `165:13029` | 1440×752 | 18300,3400 |
| 5 | `Admin - Peta - Menu Titik - Buat Jalur (1440)` | `165:13131` | 1440×752 | 18300,4350 |
| 6 | `Admin - Peta - Menu Jalur (1440)` | `165:13233` | 1440×752 | 18300,5300 |
| 7 | `Admin - Peta - Menu Tambah Titik (1440)` | `165:13611` | 1440×752 | 18300,6250 |
| 8 | `Admin - Peta - Menu Tambah Jalur (1440)` | `165:13713` | 1440×752 | 18300,7300 |

Semua state Route Builder lama (`Route Builder`, `- Context Menu`,
`- Membuat Jalur`, `- Tambah Titik`, `- Kosong`) dan layar
`Admin - Editor Jalur`, `Admin - Tambah Titik`, `Admin - Tambah Ruas`
sudah **dihapus**.

**Isi tiap layar:**

1. **Preview** — peta jaringan + legenda, tombol `Kelola di peta` /
   `Tambah titik`; baris 3 kartu jalur; panel detail jalur terpilih
   (statistik jarak/naik/turun/estimasi, profil elevasi, **daftar ruas
   penyusun**, "jalur lain di titik ini").
2. **Peta Fullscreen (dasar)** — shell admin, peta 1120×560 dengan toolbar
   `Tambah titik`/`Tambah jalur` (kiri atas) + kontrol zoom (kanan atas);
   header `Kelola peta` dengan `Preview` & `Publikasikan`.
3–6. **Menu context** — peta kosong / titik / menyambung / jalur.
7–8. **Dropdown form** — `Tambah titik` (nama, elevasi, koordinat, tipe) dan
   `Tambah jalur` (nama, titik awal, metode menyambung, permukaan, kecuraman)
   + `Mulai menyambung`.

**Audit Figma:** **0 raw fill / 0 raw stroke**, **0 node collapse** (semua
8 frame).

Komponen DS baru:

- `ElevationChart (Alam)` — area + marker node + ringkasan statistik.
- `RouteCategoryBadge (Alam)` — menampilkan `surface` dan `grade` sebagai
  dua chip.
- `TraversalChip (Alam)` — moda yang bisa lewat.
- `TrackNodeRow (Alam)` — baris titik (ikon tipe, nama, elevasi).
- `SegmentRow (Alam)` — baris ruas (dari→ke, kategori, jarak).
- `RouteCard (Alam)` — kartu jalur (nama, start→end, jarak, gain, status).

Opsi integrasi: menjadikan Route Builder sebagai sub-tab **"Jalur & Elevasi"**
di dalam CRUD Destinasi (Step 3 Lokasi & Akses).

---

## 6. API (rencana fase mendatang)

- `GET /destinations/:slug/routes` — daftar jalur destinasi.
- `GET /routes/:id` — detail jalur + node/segment penyusun.
- `GET /routes/:id/profile` — `RouteProfile` (untuk grafik elevasi).
- `GET /track-nodes?destinationId=:id`
- `GET /segments?destinationId=:id`

Pada fase prototype, data dilayani dari `packages/seed`. Endpoint tulis
(POST/PATCH/DELETE) menyusul bersamaan dengan database/auth.

---

## 7. Fase lanjutan (belum dirancang)

- **Publik (web + mobile):** section "Jalur & Profil Elevasi" pada detail
  destinasi; pemilihan jalur + grafik.
- **Trip planning & AI:** lampirkan jalur ke `TripPlanItem`; rekomendasi
  memakai `difficulty` + `traversableBy`.
- **Merchant:** usulan basecamp/ruas + antrean verifikasi (mengikuti pola
  "Usulkan Fasilitas").
- **Elevasi otomatis:** ambil dari elevation API/DEM saat memilih titik di
  peta (sekarang manual).
- **Geometri polyline:** `shapePoints` per ruas agar mengikuti jalur asli
  (sekarang garis lurus node-to-node).
