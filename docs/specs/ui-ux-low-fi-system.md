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
