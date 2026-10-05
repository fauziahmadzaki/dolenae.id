# Low-Fidelity Design System & Wireframe Spec — Dolenae.id

Dokumen ini mendokumentasikan **Low-Fidelity Design System (Wireframe Level)** untuk platform **Dolenae.id**. 

Tujuan utama Low-Fidelity Design System ini adalah **memvalidasi struktur tata letak (layout), hierarki informasi, alur navigasi, dan keterbacaan (UX)** sebelum masuk ke tahap High-Fidelity (detail warna dan visual akhir).

---

## 1. Fondasi Token Netral (Low-Fi Palette)

Desain Low-Fidelity menggunakan skala netral grayscale ber-kontras tinggi untuk memfokuskan evaluasi pada alur dan fungsi.

### Palette Netral

| Token | Hex Value | Penggunaan / Elemen UI |
| --- | --- | --- |
| `lofi-canvas` | `#FAFAFA` | Canvas background wireframe |
| `lofi-surface` | `#FFFFFF` | Surface kartu, modal, header |
| `lofi-border` | `#E5E7EB` | Garis pembatas komponen & grid (1px) |
| `lofi-border-strong` | `#9CA3AF` | Garis fokus, input aktif, divider tegas (1.5px) |
| `lofi-text-primary` | `#111827` | Judul utama, heading, angka spec |
| `lofi-text-secondary` | `#6B7280` | Deskripsi, label sekunder, caption |
| `lofi-placeholder` | `#E5E7EB` | Placeholder gambar / media frame |
| `lofi-placeholder-icon` | `#9CA3AF` | Silhouette / ikon placeholder |
| `lofi-action-primary` | `#1F2937` | Tombol aksi utama (fill gelap netral) |
| `lofi-action-secondary` | `#F3F4F6` | Tombol sekunder / badge background |

### Geometry & Spacing
- **Base Grid:** 4px (Spacing: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
- **Radius Scale:**
  - `radius-sm` (4px): Badge status & chip kecil
  - `radius-md` (8px): Input field & tombol wireframe
  - `radius-lg` (12px): Kartu destinasi & panel wireframe
  - `radius-pill` (9999px): Pill filter & tombol utama

---

## 2. Blueprint Komponen Low-Fidelity Inti

### 2.1 Navigation Header Wireframe
- **Web Header (1440px):**
  - Left: Logo Wireframe Box (120x36px)
  - Center: Nav Menu (`Destinasi`, `Fasilitas Sekitar`, `Persiapan AI`, `Tentang Kami`)
  - Right: Auth CTA Button (`Masuk / Daftar`)
- **Mobile Header (390px):**
  - Left: Logo Wireframe Icon (32x32px)
  - Center: Title Screen
  - Right: Notification / Profile Wireframe Icon

### 2.2 SearchBar & Filter Bar Wireframe
- **Input Container (Height: 52px, Radius: 9999px / 12px):**
  - Search Icon Box (24x24px)
  - Text Placeholder ("Cari pegunungan, perbukitan, atau lokasi...")
  - Action Button ("Cari Destinasi")
- **Filter Chips Row:**
  - `[ Semuanya ]` `[ Ramah Pemula ]` `[ Ketinggian < 2000m ]` `[ Area Camping ]` `[ Spot Sunrise ]`

### 2.3 Destination Card Wireframe (`DestinationCard`)
- **Card Container (Width: 360px, Radius: 12px, Border: 1px `lofi-border`):**
  - Top: Image Frame Placeholder (360x200px, 16:9) + Difficulty Badge Box (Top-Left overlay)
  - Middle: Destination Name (18px Bold) + Location & Altitude Spec ("Magelang · 3.142 m dpl")
  - Bottom Row: Price & Access Info + Action Arrow / "Detail" Button

### 2.4 Travel Support Card Wireframe (`SupportCard`)
- **Card Container (Width: 360px, Radius: 8px, Padding: 16px):**
  - Left: Category Icon Frame (Penginapan / Transport / Tempat Makan)
  - Center: Name, Distance from Mountain ("1.2 km dari basecamp"), Verified Spec
  - Right: Price Range Placeholder ("Rp 150rb - 300rb/malam")

### 2.5 Preparation Checklist Item Wireframe (`ChecklistItem`)
- **Row Item (Padding: 12px 16px, Border-Bottom: 1px `lofi-border`):**
  - Left: Checkbox Frame (20x20px)
  - Center: Item Name (misal: "Jaket Windproof / Waterproof"), Category Pill ("Wajib - Suhu Ekstrem")
  - Right: Status Pill (`[ Selesai ]` / `[ Belum Ada ]`)

---

## 3. Wireframe Layout Blueprint (Desktop & Mobile)

```
================================================================================
                               DESKTOP WIREFRAME (1440px)
================================================================================
[ HEADER NAV ] Logo | Destinasi | Support Sekitar | Persiapan AI | [ Masuk ]
--------------------------------------------------------------------------------
[ HERO SECTION ]
  Col Left (60%):
    - Title: "Temukan & Persiapkan Perjalanan Alammu Tanpa Khawatir"
    - Subtitle: "Informasi lengkap destinasi pegunungan, penginapan sekitar, hingga checklist persiapan."
    - [ SEARCH BAR COMPONENT ]
  Col Right (40%):
    - [ IMAGE PLACEHOLDER 560x360px ] (Ilustrasi / Foto Basecamp)
--------------------------------------------------------------------------------
[ CATEGORY FILTER BAR ]
  [ All ] [ Ramah Pemula ] [ Spot Camping ] [ Peak Altitude <2000m ] [ Transport Mudah ]
--------------------------------------------------------------------------------
[ TRENDING DESTINATIONS GRID ] (3 Columns)
  [ Card Wireframe 1 ]      [ Card Wireframe 2 ]      [ Card Wireframe 3 ]
  - Gn. Prau                - Gn. Bromo               - Bukit Sikunir
  - 2.565 m dpl             - 2.329 m dpl             - 2.263 m dpl
--------------------------------------------------------------------------------
[ TRAVEL SUPPORT ECOSYSTEM ] (Penginapan & Transportasi Terdekat)
  [ Support Card 1 ]        [ Support Card 2 ]        [ Support Card 3 ]
  - Homestay Prau Asri      - Shuttle Basecamp        - Warung Logistik
--------------------------------------------------------------------------------
[ AI TRIP PREPARATION ASSISTANT CARD ]
  - Box Container: "Rekomendasi Persiapan Berbasis AI"
  - Interactive Form: [Pilih Destinasi] + [Jumlah Hari] + [Pengalaman]
  - Preview Output: "Checklist 12 Perlengkapan Wajib"
--------------------------------------------------------------------------------
[ FOOTER ] Logo | Nav Links | Copyright Dolenae.id
================================================================================
```

---

## 4. Pelaksanaan di Figma Desktop via `figma-cli`

Komponen dan frame Low-Fidelity ini di-render secara presisi ke Figma Canvas menggunakan perintah `figma-cli render-batch` agar tim dapat langsung me-review tata letak dan hierarki UX.

---

## 5. Inventaris Figma (implementasi saat ini)

Semua memakai koleksi `Dolenae Low-Fi System`, lebar mobile `390px`, ikon Lucide.
Node id dapat berubah setelah edit; nama node adalah acuan utama.

Struktur page di file Figma:
- **`Lo-Fi Design System`** (`41:1196`) — token frame + component set low-fi (mobile + web).
- **`Lo-Fi (Mobile)`** (`41:1194`) — 50 layar mobile.
- **`Lo-Fi Web`** (`50:4347`) — 8 layar web (4 publik + 4 dashboard, 1440px).
- **`Design System (Alam)`** (`41:1195`) — design system "Alam".
- **`Page 1`** — node sisa/kerja.

### 5.1 Layar (page `Lo-Fi (Mobile)`, deret `y=420`, `1520`, `2620`, `3620`, `4520`)

| Layar | Node | Ukuran | Posisi |
| --- | --- | --- | --- |
| `Lo-Fi - Beranda (Mobile)` | `41:2` | 390×1020 | 4100,420 |
| `Lo-Fi - Detail Destinasi (Mobile)` | `49:3970` | 390×1416 | 4540,420 |
| `Lo-Fi - Explore (Mobile)` | `41:743` | 390×844 | 4980,420 |
| `Lo-Fi - AI Preferensi (Mobile)` | `41:862` | 390×841 | 5420,420 |
| `Lo-Fi - AI Hasil (Mobile)` | `41:942` | 390×938 | 5860,420 |
| `Lo-Fi - Rencana Perjalanan (Mobile)` | `41:1038` | 390×803 | 6300,420 |
| `Lo-Fi - Checklist Persiapan (Mobile)` | `41:1229` | 390×845 | 6740,420 |
| `Lo-Fi - Fasilitas Sekitar (Mobile)` | `41:1324` | 390×584 | 7180,420 |
| `Lo-Fi - Onboarding (Mobile)` | `41:1410` | 390×844 | 7620,420 |
| `Lo-Fi - Masuk dan Daftar (Mobile)` | `41:1429` | 390×844 | 8060,420 |
| `Lo-Fi - Lupa Kata Sandi (Mobile)` | `41:1486` | 390×310 | 8500,420 |
| `Lo-Fi - Verifikasi OTP (Mobile)` | `41:1511` | 390×270 | 8940,420 |
| `Lo-Fi - Detail Fasilitas - Penginapan (Mobile)` | `41:1571` | 390×1026 | 4100,1520 |
| `Lo-Fi - Detail Fasilitas - Transport (Mobile)` | `41:1675` | 390×1046 | 4540,1520 |
| `Lo-Fi - Detail Fasilitas - Makanan (Mobile)` | `41:1781` | 390×976 | 4980,1520 |
| `Lo-Fi - Profil (Mobile)` | `41:1874` | 390×844 | 5420,1520 |
| `Lo-Fi - Tambah Rencana - Pilih (Mobile)` | `41:2004` | 390×420 | 5860,1520 |
| `Lo-Fi - Tambah Rencana - Atur (Mobile)` | `41:2049` | 390×699 | 6300,1520 |
| `Lo-Fi - Pencarian Hasil (Mobile)` | `43:2312` | 390×844 | 4100,2620 |
| `Lo-Fi - Pencarian Kosong (Mobile)` | `43:2386` | 390×844 | 4540,2620 |
| `Lo-Fi - Filter dan Urutkan (Mobile)` | `43:2420` | 390×620 | 4980,2620 |
| `Lo-Fi - Notifikasi (Mobile)` | `43:2490` | 390×844 | 5420,2620 |
| `Lo-Fi - Buat Rencana Baru (Mobile)` | `43:2562` | 390×520 | 5860,2620 |
| `Lo-Fi - Pilih Destinasi (Mobile)` | `43:2604` | 390×540 | 6300,2620 |
| `Lo-Fi - Pilih Fasilitas (Mobile)` | `43:2668` | 390×540 | 6740,2620 |
| `Lo-Fi - Detail Item Rencana (Mobile)` | `43:2735` | 390×647 | 7180,2620 |
| `Lo-Fi - Konfirmasi Hapus Item (Mobile)` | `43:2803` | 390×844 | 7620,2620 |
| `Lo-Fi - Rencana Sukses (Mobile)` | `43:2816` | 390×844 | 8060,2620 |
| `Lo-Fi - Tambah Item Checklist (Mobile)` | `43:2902` | 390×844 | 8500,2620 |
| `Lo-Fi - Checklist Selesai (Mobile)` | `43:2933` | 390×844 | 8940,2620 |
| `Lo-Fi - Usulkan Fasilitas (Mobile)` | `43:2947` | 390×675 | 9380,2620 |
| `Lo-Fi - Usulan Sukses (Mobile)` | `43:2989` | 390×844 | 9820,2620 |
| `Lo-Fi - Destinasi Tersimpan (Mobile)` | `45:3080` | 390×844 | 4100,3620 |
| `Lo-Fi - Destinasi Tersimpan Kosong (Mobile)` | `45:3142` | 390×844 | 4540,3620 |
| `Lo-Fi - Daftar Rencana (Mobile)` | `45:3158` | 390×844 | 4980,3620 |
| `Lo-Fi - Daftar Rencana Kosong (Mobile)` | `45:3228` | 390×844 | 5420,3620 |
| `Lo-Fi - Checklist Tersimpan (Mobile)` | `45:3246` | 390×844 | 5860,3620 |
| `Lo-Fi - Checklist Tersimpan Kosong (Mobile)` | `45:3305` | 390×844 | 6300,3620 |
| `Lo-Fi - Fasilitas Diusulkan (Mobile)` | `45:3323` | 390×844 | 6740,3620 |
| `Lo-Fi - Fasilitas Diusulkan Kosong (Mobile)` | `45:3395` | 390×844 | 7180,3620 |
| `Lo-Fi - Keluar Konfirmasi (Mobile)` | `45:3413` | 390×844 | 7620,3620 |
| `Lo-Fi - Pengaturan (Mobile)` | `45:3426` | 390×844 | 4100,4520 |
| `Lo-Fi - Akun (Mobile)` | `45:3512` | 390×700 | 4540,4520 |
| `Lo-Fi - Setelan Notifikasi (Mobile)` | `45:3570` | 390×640 | 4980,4520 |
| `Lo-Fi - Tema dan Bahasa (Mobile)` | `45:3631` | 390×640 | 5420,4520 |
| `Lo-Fi - Privasi dan Keamanan (Mobile)` | `45:3680` | 390×700 | 5860,4520 |
| `Lo-Fi - Bantuan FAQ (Mobile)` | `45:3737` | 390×780 | 6300,4520 |
| `Lo-Fi - Kirim Masukan (Mobile)` | `45:3779` | 390×620 | 6740,4520 |
| `Lo-Fi - Edit Profil (Mobile)` | `45:3804` | 390×760 | 7180,4520 |
| `Lo-Fi - Ubah Kata Sandi (Mobile)` | `45:3837` | 390×620 | 7620,4520 |

### 5.2 Component set (page `Lo-Fi Design System`)

| Set | Node | Axis |
| --- | --- | --- |
| `Button (Low-Fi)` | — | Tipe × Ukuran |
| `Input (Low-Fi)` | — | Ukuran × State |
| `Image Placeholder (Low-Fi)` | — | Aspek |
| `DifficultyBadge (Low-Fi)` | `41:338` | Level: Ramah pemula, Menengah, Sulit |
| `Chip (Low-Fi)` | `41:345` | State: Default, Active |
| `SupportCard (Low-Fi)` | `41:399` | Tipe: Penginapan, Transport, Makanan |
| `DestinationCard (Low-Fi)` | `41:433` | Layout: Vertical, Horizontal |
| `BottomNav (Low-Fi)` | `41:604` | Active: Beranda, Jelajahi, AI, Rencana, Profil |
| `ChecklistItem (Low-Fi)` | `41:1228` | State: Belum, Selesai, Peringatan |
| `MenuRow (Low-Fi)` | `41:1570` | Trailing: Chevron, Check, Toggle |
| `SearchBar (Low-Fi)` | `41:2144` | State: Default, Focused, Filled |
| `SectionHeader (Low-Fi)` | `43:2152` | Action: Tidak, Ya |
| `EmptyState (Low-Fi)` | `43:2181` | Tipe: Tanpa hasil, Belum ada data, Gagal |
| `BottomSheet (Low-Fi)` | `43:2253` | Ukuran: Setengah, Tinggi |
| `Dialog (Low-Fi)` | `43:2278` | Tipe: Konfirmasi, Destruktif |
| `Toast (Low-Fi)` | `43:2300` | Tipe: Sukses, Info, Gagal |
| `Loading (Low-Fi)` | `43:2311` | Tipe: Skeleton, Spinner |
| `Accordion (Low-Fi)` | `45:3016` | State: Tertutup, Terbuka |
| `PlanCard (Low-Fi)` | `45:3057` | Layout: Aktif, Arsip |
| `StatusBadge (Low-Fi)` | `45:3079` | Tipe: Menunggu, Terverifikasi, Ditolak |
| `MapView (Low-Fi)` | `49:3969` | State: Default, PinTerpilih |
| `WebHeader (Low-Fi)` | `50:4196` | State: Default, Scrolled |
| `WebFooter (Low-Fi)` | `50:4257` | Layout: Lengkap, Ringkas |
| `AICard (Low-Fi)` | `50:4329` | Layout: Split, Stack |
| `TestimonialCard (Low-Fi)` | `50:4346` | Varian: DenganFoto, TanpaFoto |
| `DashboardSidebar (Low-Fi)` | `52:5379` | Role: Admin, Merchant |
| `StatCard (Low-Fi)` | `52:5380` | Varian: Dasar, Tren |
| `TableRow (Low-Fi)` | `52:5381` | State: Default, Terpilih |

> Catatan: `<Instance>` pada `figma-cli` hanya didukung sebagai node top-level,
> sehingga layar dirakit dari primitif yang identik secara visual dengan
> component set di atas.
>
> Placeholder gambar memakai frame `name="Ph:*"` berisi dua `Rect` (`diag-a`/
> `diag-b`) yang dirotasi via `eval` (formula diagonal di skill `figma-cli` §8),
> karena `render` menerapkan auto-layout sehingga koordinat absolut ter-reset.

### 5.3 Layar web (page `Lo-Fi Web`, lebar 1440px)

| Layar | Node | Ukuran | Posisi |
| --- | --- | --- | --- |
| `Lo-Fi Web - Landing (1440)` | `50:4348` | 1440×2864 | 0,0 |
| `Lo-Fi Web - Daftar Destinasi (1440)` | `50:4646` | 1440×1193 | 1540,0 |
| `Lo-Fi Web - Detail Destinasi (1440)` | `50:4846` | 1440×2173 | 3080,0 |
| `Lo-Fi Web - Masuk (1440)` | `51:5098` | 1440×960 | 0,3000 |
| `Lo-Fi Web - Admin Overview (1440)` | `52:5382` | 1440×865 | 0,4120 |
| `Lo-Fi Web - Admin Verifikasi (1440)` | `52:8053` | 1440×670 | 1540,4120 |
| `Lo-Fi Web - Merchant Overview (1440)` | `52:8240` | 1440×987 | 0,5500 |
| `Lo-Fi Web - Merchant Kelola Layanan (1440)` | `52:8427` | 1440×730 | 1540,5500 |
| `Lo-Fi Web - Admin Detail Destinasi (1440)` | `165:6715` | 1440×1680 | 3080,4120 |
| `Lo-Fi Web - Admin Detail Destinasi - Pratinjau (1440)` | `165:7143` | 1440×1479 | 4520,4120 |

> Landing memuat 9 seksi: header, hero (search + CTA), filter bar, trending grid,
> fasilitas sekitar, AI assistant, cara kerja (3 langkah), testimoni, footer.
> Detail destinasi memakai layout dua kolom (konten + sidebar aksi) dan
> menyertakan section **Lokasi** (peta) dari `MapView`.
>
> Layar Masuk (web) memakai split-panel: kiri panel form 560px (heading,
> segmented `Masuk`/`Daftar` 400px, input Email & Kata sandi, "Ingat saya" +
> "Lupa kata sandi?", CTA utama, divider, Google, footer daftar), kanan
> placeholder gambar penuh dengan kartu caption nilai produk. Layar ini
> melengkapi varian mobile `Lo-Fi - Masuk dan Daftar (Mobile)`.

### 5.4 Layar dashboard (page `Lo-Fi Web`, baris `y=4120` dan `5500`)

Empat layar dashboard memakai **app shell** (bukan header/footer publik):
sidebar 256px + topbar 64px + area konten (`padding 32`, `gap 24`).

| Layar | Node | Ukuran | Posisi | Isi utama |
| --- | --- | --- | --- | --- |
| `Lo-Fi Web - Admin Overview (1440)` | `52:5382` | 1440×865 | 0,4120 | 4 StatCard (destinasi, merchant, verifikasi, laporan), `Ph:chart` aktivitas, panel antrean verifikasi 360px, tabel aktivitas |
| `Lo-Fi Web - Admin Verifikasi (1440)` | `52:8053` | 1440×670 | 1540,4120 | 3 StatCard status, toolbar (tab Menunggu/Disetujui/Ditolak + filter tipe), tabel pengajuan + aksi setujui/tolak, pagination |
| `Lo-Fi Web - Merchant Overview (1440)` | `52:8240` | 1440×987 | 0,5500 | banner status verifikasi akun, 4 StatCard, `Ph:chart` performa + panel pengajuan terbaru, tabel layanan |
| `Lo-Fi Web - Merchant Kelola Layanan (1440)` | `52:8427` | 1440×730 | 1540,5500 | 3 StatCard, toolbar (cari + filter tipe), CTA "Tambah layanan", tabel layanan + aksi edit/hapus, pagination |

> Isi tabel memakai data nyata dari `packages/seed` (Bromo Jeep Tour, Homestay
> Cemoro Indah, Open Trip Prau, Warung Edelweiss, Basecamp Kopi Prau) dan status
> dari field `verified` pada `TravelSupport`, sehingga variasi
> `StatusBadge` (Terverifikasi/Menunggu/Ditolak) tervalidasi.
>
> Catatan `figma-cli`: layar dashboard dirakit bertahap (shell → tiap bagian →
> tiap baris tabel) karena `render` gagal (`ReferenceError: frame is not
> defined`) untuk JSX besar atau frame top-level dengan `w="fill"`. Bagian
> di-append ke `Main`, lalu `Main` diberi `itemSpacing=24` dan `padding=32`.
>
> Layar **Admin Detail Destinasi** (+ Pratinjau) memakai app shell yang sama
> (sidebar 256 + topbar 64, `Main` padding 32/gap 24, konten 1120) dengan tab
> `Detail`/`Pratinjau`. Sidebar di-stretch penuh tinggi frame; item `Destinasi`
> aktif. Pratinjau memuat hero `action-primary` + dua kolom (konten 700 +
> panel 300) meniru tampilan publik.
