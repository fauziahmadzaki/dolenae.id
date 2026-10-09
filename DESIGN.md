# DESIGN.md — Dolenae Design System "Alam"

<!-- extraction-meta
source: Dolenae Design System (Alam)
scope: theme recommendation (brand → tokens → Figma variables)
date: 2026-09-16
generator: figma-cli (manual authoring, machine-readable token block)
-->

## 1. Identitas

**In one line:** Sistem desain travel-discovery bernuansa alam yang **mineral dan
rugged** — pine dalam sebagai jati diri, bone hangat seperti batu pagi, satu
aksen ember matahari terbit, untuk platform pegunungan/perbukitan Indonesia.

**Signature Techniques:**
- **Deep-pine brand** — `#1E3B2E`, hijau hutan yang dalam dan desaturated
  (bukan emerald terang), sebagai CTA utama dan identitas.
- **SATU aksen terbatas** — ember `#B85C2A` (burnt terracotta) sebagai
  satu-satunya warna highlight. Tidak ada multi-aksen (bukan hijau+amber+biru).
- **Kanvas bone hangat** — `#F4F1E9` (hangat seperti batu/kertas pagi, bukan
  putih-hijau pastel) agar terasa "di kaki gunung" dan nyaman dibaca.
- **Warna status desaturated** — sukses moss, warning ochre, danger brick;
  tidak memakai hijau/amber/merah Tailwind bawaan.
- **Kartu jernih** — radius 12px, shadow ringan ber-tint hangat, auto-layout
  basis 4px.
- **Travel chips** — tag/kategori pill (terrain, kesulitan, aktivitas).
- **Progressive disclosure** — discovery feed → detail destinasi → checklist
  persiapan; pola layout konsisten di tiap step.

**Spirit:** *Discover More, Prepare Better.* UI terasa seperti "pemandu
perjalanan gunung" yang tenang, tegas, dan meyakinkan — bukan SaaS pastel.

---

## 2. Warna (Palette & Semantic)

### Token Semantik (Light Mode / default)

| Token | Hex | Peran |
| --- | --- | --- |
| `canvas` | `#F4F1E9` | background utama (bone hangat) |
| `canvas-subtle` | `#E8E4D8` | seksi empowered / hero backdrop |
| `surface` | `#FFFFFF` | kartu, panel, modal |
| `surface-2` | `#ECE8DE` | area input, strip status |
| `ink` | `#17211B` | teks utama (obsidian-pine) |
| `body` | `#4A5149` | teks sekunder/paragraf |
| `primary` | `#1E3B2E` | brand, aksi utama (deep pine) |
| `on-primary` | `#FFFFFF` | teks/ikon di atas primary |
| `primary-hover` | `#163026` | hover primary |
| `accent` | `#B85C2A` | satu-satunya highlight (ember) |
| `on-accent` | `#FFFFFF` | teks di atas accent |
| `success` | `#3F6B47` | checklist selesai, status open (moss) |
| `warning` | `#A9781F` | peringatan (ochre) |
| `danger` | `#A3402E` | error, larangan (brick) |
| `hairline` | `#E0DBCF` | border biasa, divider (hangat) |
| `border-strong` | `#7C8A7E` | border fokus/aktif (sage-slate) |

> `sky` dihapus dari sistem. Informasi kondisi/ketinggian memakai `body` /
> `border-strong`, bukan warna dekoratif ketiga.

### Nilai Dark Mode (referensi, ditulis saat implementasi sistem dark)

| Token | Hex |
| --- | --- |
| `canvas` | `#10150F` |
| `canvas-subtle` | `#17201A` |
| `surface` | `#1A231D` |
| `surface-2` | `#212C25` |
| `ink` | `#EAF0E9` |
| `body` | `#ADB8AE` |
| `primary` | `#5FA87C` |
| `on-primary` | `#0F1712` |
| `primary-hover` | `#6FBA8B` |
| `accent` | `#E08A4E` |
| `on-accent` | `#2A1A10` |
| `success` | `#6FA37A` |
| `warning` | `#C99A4A` |
| `danger` | `#C4705A` |
| `hairline` | `#29352D` |
| `border-strong` | `#4E5F55` |

---

## 3. Tipografi

### Fonts
- **Display/Heading:** Poppins (800 / ExtraBold, 700 / Bold) — Google Font, di
  Flutter dipakai via package `google_fonts`.
- **Body/UI:** Inter (400 / Regular, 500 / Medium, 600 / SemiBold)

> Catatan: jika Poppins belum terinstal di Figma, gunakan Inter untuk seluruh
> skala agar rendering tetap konsisten.

### Scale

| Token | Family | Size | Weight | Line height | Penggunaan |
| --- | --- | --- | --- | --- | --- |
| `display-xl` | Poppins | 40px | 800 | 48px | Hero halaman destinasi |
| `display-lg` | Poppins | 32px | 800 | 40px | Judul halaman/landing |
| `display-md` | Poppins | 24px | 700 | 32px | Heading seksi |
| `title` | Poppins | 20px | 700 | 28px | Judul kartu/komponen |
| `body-lg` | Inter | 18px | 400 | 28px | Deskripsi hero |
| `body` | Inter | 16px | 400 | 24px | Teks utama |
| `body-sm` | Inter | 14px | 400 | 20px | Metadata, keterangan |
| `caption` | Inter | 12px | 500 | 16px | Keterangan kecil |
| `overline` | Inter | 11px | 600 | 14px | Label ber-uppercase |

---

## 4. Spacing & Radius

### Base Unit
`4px`

### Spacing Scale

| Token | Value |
| --- | --- |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |

### Border Radius

| Token | Value | Penggunaan |
| --- | --- | --- |
| `radius-sm` | 4px | chip kecil, badge |
| `radius-md` | 8px | input, tombol kecil |
| `radius-lg` | 12px | kartu destinasi, support |
| `radius-xl` | 16px | modal, panel besar |
| `radius-pill` | 9999px | tombol utama, tag, avatar |

---

## 5. Elevation

| Token | Shadow |
| --- | --- |
| `shadow-sm` | `0 1px 2px rgba(23,27,20,.05), 0 1px 4px rgba(23,27,20,.04)` |
| `shadow-md` | `0 4px 12px rgba(23,27,20,.07), 0 2px 6px rgba(23,27,20,.04)` |
| `shadow-lg` | `0 12px 32px rgba(23,27,20,.12), 0 4px 12px rgba(23,27,20,.07)` |

> Shadow ber-tint hangat (bone) mengikuti warna canvas, bukan tint hijau.

---

## 6. Komponen Inti

### Mobile (Flutter) & Web (TanStack) — komponen bersama

| Komponen | Varian / State | Catatan Penggunaan |
| --- | --- | --- |
| `Button` | Primary / Secondary / Ghost · Size S/M/L · Hover, Pressed, Disabled, Focus ring | CTA utama = `primary`; highlight promosi = `accent` (satu-satunya aksen) |
| `DestinationCard` | image hero, tagline, difficulty badge, lokasi, harga | kartu discovery; radius-lg, shadow-sm |
| `FacilityTag` | terrain · difficulty · activity · season | pill radius-pill, bg `canvas-subtle`, teks `body` |
| `SearchBar` | default / focused (border-strong) | placeholder "Mau ke mana?" |
| `SupportListItem` | accommodation / transport / food | ikon lucide, harga, verified badge |
| `PreparationChecklistItem` | pending / done (success) / warning | checkbox + kategori item |
| `DifficultyBadge` | ramah-pemula (success) · menengah (warning) · sulit (danger) | warna sesuai tingkat kesulitan |
| `TripPlanStep` | 1..n dengan connector line | progres baris per hari |
| `AIRecommendCard` | ikon sparkle, ringkasan, daftar destinasi | menandakan hasil AI |
| `BottomNav (mobile)` | Home · Explore · AI · Plan · Profile | 5 tab, icon lucide, label caption |
| `Header/Nav (web)` | logo, "Destinasi", "Inspirasi AI", "Rencana", login | sticky, bg surface, hairline bawah |

> **Status implementasi Figma** (page `Design System (Alam)`): `Button`,
> `FacilityTag`, `DifficultyBadge`, `SearchBar`, `BottomNav`,
> `PreparationChecklistItem`, `TripPlanStep`, dan `AIRecommendCard` sudah
> tersedia sebagai **component set** ber-variant (fokus mobile).
> `DestinationCard`, `SupportListItem`, dan `Header/Nav (web)` masih berupa
> dokumentasi visual. Detail: `docs/specs/design-system-hifi.md`.

---

## 7. Aturan Penggunaan

### Do
- Gunakan base unit `4px` untuk semua keputusan spacing.
- Gunakan `primary` (`#1E3B2E`) sebagai warna aksi utama dan identitas brand.
- **Satu aksen per halaman.** `accent` (`#B85C2A`) adalah satu-satunya warna
  highlight; jangan menambah biru/ungu/hijau terang untuk dekorasi.
- Warna kesulitan diselaraskan sistem: ramah-pemula → `success`, menengah →
  `warning`, sulit → `danger`.
- Bind warna ke variabel token (menggunakan `var:<nama>`), jangan hardcode hex.
- Teks deskriptif panjang gunakan Inter Regular; heading gunakan Poppins Bold.

### Don't
- Jangan menambah warna baru tanpa mencatat ke palette di dokumen ini.
- Jangan memakai aksen kedua (blue/sky/ungu) sebagai warna dekoratif.
- Jangan mencampur radius di luar skala radius.
- Jangan menggunakan bayangan gelap pekat; pertahankan tint hangat ringan.
- Jangan gunakan emoji sebagai ikon — gunakan ikon SVG (Lucide).
- Jangan menaruh snapshot/demo Figma berjumlah >2 per halaman; jaga hierarki informasi.

---

## 8. Cara Reuse

- Import ke Figma: `figma-cli import DESIGN.md` — warna, radius, dan tipografi
  menjadi Figma variable pada koleksi bernama sesuai sistem.
- **Koleksi resmi saat ini: `Dolenae (Alam)`** (16 warna + 5 radius + 10 spacing
  + 3 width = 34 variabel), dilengkapi 9 text style dan 3 effect style
  (`shadow/sm|md|lg`). Jangan biarkan `import` memunculkan koleksi duplikat —
  cek `figma-cli col list` setelah import.
- Untuk berpindah tema/brand: `figma-cli use <collection> --all` (hanya berlaku
  untuk page yang sedang aktif).
- Komponen yang sering dipakai dijaga satu sumber (web `apps/web/src/` dan
  komponen Flutter `apps/mobile/lib/features/`) agar web & mobile konsisten.

---

## 9. Machine-readable tokens

```json design-tokens
{
  "$schema": "design-tokens.v1",
  "meta": {
    "source": "Dolenae Design System (Alam)",
    "generated": "2026-09-16"
  },
  "color": {
    "canvas": "#F4F1E9",
    "canvas-subtle": "#E8E4D8",
    "surface": "#FFFFFF",
    "surface-2": "#ECE8DE",
    "ink": "#17211B",
    "body": "#4A5149",
    "primary": "#1E3B2E",
    "on-primary": "#FFFFFF",
    "primary-hover": "#163026",
    "accent": "#B85C2A",
    "on-accent": "#FFFFFF",
    "success": "#3F6B47",
    "warning": "#A9781F",
    "danger": "#A3402E",
    "hairline": "#E0DBCF",
    "border-strong": "#7C8A7E"
  },
  "width": {
    "container": 720,
    "sidebar": 264,
    "mobile": 390
  },
  "spacing": {
    "space-1": 4,
    "space-2": 8,
    "space-3": 12,
    "space-4": 16,
    "space-5": 20,
    "space-6": 24,
    "space-8": 32,
    "space-10": 40,
    "space-12": 48,
    "space-16": 64
  },
  "radius": {
    "radius-sm": "4px",
    "radius-md": "8px",
    "radius-lg": "12px",
    "radius-xl": "16px",
    "radius-pill": "9999px"
  },
  "typography": {
    "display-xl": { "fontFamily": "Poppins", "fontSize": 40, "fontWeight": 800, "lineHeight": 48 },
    "display-lg": { "fontFamily": "Poppins", "fontSize": 32, "fontWeight": 800, "lineHeight": 40 },
    "display-md": { "fontFamily": "Poppins", "fontSize": 24, "fontWeight": 700, "lineHeight": 32 },
    "title": { "fontFamily": "Poppins", "fontSize": 20, "fontWeight": 700, "lineHeight": 28 },
    "body-lg": { "fontFamily": "Inter", "fontSize": 18, "fontWeight": 400, "lineHeight": 28 },
    "body": { "fontFamily": "Inter", "fontSize": 16, "fontWeight": 400, "lineHeight": 24 },
    "body-sm": { "fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "lineHeight": 20 },
    "caption": { "fontFamily": "Inter", "fontSize": 12, "fontWeight": 500, "lineHeight": 16 },
    "overline": { "fontFamily": "Inter", "fontSize": 11, "fontWeight": 600, "lineHeight": 14 }
  },
  "shadow": {
    "shadow-sm": "0 1px 2px rgba(23,27,20,.05), 0 1px 4px rgba(23,27,20,.04)",
    "shadow-md": "0 4px 12px rgba(23,27,20,.07), 0 2px 6px rgba(23,27,20,.04)",
    "shadow-lg": "0 12px 32px rgba(23,27,20,.12), 0 4px 12px rgba(23,27,20,.07)"
  },
  "fonts": ["Poppins", "Inter"]
}
```