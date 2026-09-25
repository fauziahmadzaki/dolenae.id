# UI/UX Hi-Fi Web — Dolenae.id

Inventaris layar **hi-fi web (tema "Alam", 1440px)**. Versi web memakai token,
text/effect style, dan component set yang sama dengan mobile
(`design-system-hifi.md`), ditambah 4 component set web
(`WebHeader`, `WebFooter`, `AICard`, `TestimonialCard`).

- Page: **`Hi-Fi Web`** (`87:2535`), lebar `1440`.
- Kontainer: padding kiri/kanan `120` (konten `1200`).
- Isi dari `packages/seed` (Gunung Bromo, Prau, Papandayan, Bukit Moko;
  Homestay Cemoro Indah, Bromo Jeep Tour Probolinggo, Warung Edelweiss).

---

## 1. Inventaris layar (batch publik)

| Layar | Node | Ukuran | Posisi |
| --- | --- | --- | --- |
| `Hi-Fi Web - Landing (1440)` | `87:2693` | 1440×3143 | 0,0 |
| `Hi-Fi Web - Daftar Destinasi (1440)` | `88:3013` | 1440×1208 | 1600,0 |
| `Hi-Fi Web - Detail Destinasi (1440)` | `88:3186` | 1440×1682 | 3200,0 |
| `Hi-Fi Web - Masuk (1440)` | `89:3328` | 1440×926 | 4800,0 |

Komponen web: `WebHeader (Alam)` (`87:2689`), `WebFooter (Alam)` (`87:2690`),
`AICard (Alam)` (`87:2691`), `TestimonialCard (Alam)` (`87:2692`).

---

## 2. Landing (`87:2693`, 1440×3143)

9 section (mengikuti urutan lo-fi web), bg `canvas`:

| Section | Isi |
| --- | --- |
| Header | `WebHeader` varian Default: logo pine + nav (Destinasi/…/Tentang Kami) + Masuk & Daftar (`primary`), hairline bawah |
| Hero | 520px, `canvas-subtle`: heading `display-xl`, sub `body-lg`, search pill `surface` + tombol `primary`, chip kategori; media pine 560×360 berisi ikon vector |
| FilterBar | 66px: chip kategori, "Semuanya" aktif `primary` |
| Trending | Judul `display-md` + "Lihat semua"; 3 kartu destinasi (media 200 berisi ikon + nama/meta/harga + badge kesulitan) |
| Support | 3 kartu fasilitas `surface` (ikon, badge terverifikasi `success`, harga) |
| AI | 2 kolom: teks + 3 bullet (ikon `check`), dan kartu `primary` (media `primary-hover` + `sparkles` `accent`, CTA `accent`) — satu-satunya aksen |
| How | Band `primary`: 3 langkah, bulatan nomor `canvas` + teks `primary`, judul/body `on-primary`/`canvas` |
| Testimoni | 3 `TestimonialCard` (2 DenganFoto, 1 TanpaFoto) + bintang `primary` |
| Footer | `WebFooter` varian Lengkap: band `primary`, kolom brand + 3 kolom tautan + copyright |

---

## 3. Daftar Destinasi (`88:3013`, 1440×1164)

Header · PageHead · FilterRow · Grid 2×3 · Pagination · Footer Ringkas.

- **PageHead** (`canvas-subtle`): judul `display-lg` "Jelajahi destinasi alam",
  sub, search pill + tombol "Filter & Urutkan" (`sliders-horizontal`).
- **FilterRow**: chip kategori dengan "Semuanya" aktif.
- **ResultMeta**: "Menampilkan 6 dari 24 destinasi" + "Urutkan: Populer".
- **Grid**: 6 kartu (media 180 dengan scene bukit + matahari dari primitif;
  ikon di atasnya). Isi: Bromo, Prau, Papandayan, Bukit Moko, **Gunung
  Merbabu**, **Gunung Sindoro** — dua terakhir adalah **placeholder desain**
  (belum ada di `packages/seed`).
- **Pagination**: halaman 1 aktif `primary` + 2,3,…,8 + tombol next.
- Footer Ringkas.

---

## 4. Detail Destinasi (`88:3186`, 1440×1682)

Header · Hero 360 · TitleRow · Main (2 kolom) · Footer Ringkas.

- **Hero**: band `primary` 1440×360 dengan scene bukit (ellipse `primary-hover`)
  + matahari `canvas-subtle` + ikon vector (belum foto).
- **TitleRow** (`canvas-subtle`): breadcrumb (Destinasi › Gunung Bromo), judul
  `display-lg`, meta (2.329 mdpl · Probolinggo) + badge kesulitan `warning`.
- **Main**: konten `760` + sidebar `360`, gap 40.
  - Konten: **Tentang** (paragraf), **Akses** (paragraf + chip Mobil/Jeep/Motor
    + "≈ 4 jam · 140 km"), **Lokasi** (peta 760×280: grid `border-strong`,
    3 pin, kontrol zoom +/−/recenter, label "Cemoro Lawang", "Buka di peta"),
    **Fasilitas sekitar** (2 baris support + badge terverifikasi).
  - Sidebar: kartu harga (Rp 29.000 + info Ketinggian/Waktu/Guide), CTA
    "Tambah ke rencana" (`primary`) + "Simpan destinasi" (outline); kartu
    bantuan + "Buka panduan".

---

## 5. Masuk (`89:3328`, 1440×926)

Header · Body (split) · Footer Ringkas.

- **Body** 2 panel: kiri form `720` (bg `canvas`): wordmark, judul `display-lg`,
  segmented Masuk/Daftar, input Email & Kata sandi, "Ingat saya" + "Lupa kata
  sandi?", CTA `primary`, divider, tombol Google `surface`, footer daftar.
  Kanan media `720` **penuh tinggi body** (`primary`) dengan ikon + tagline +
  deskripsi + 3 poin nilai (checklist/akses/rencana).
- Form mewakili varian Masuk; varian Daftar mengikuti `AuthTabs (Alam)`.

---

## 6. Yang belum / catatan

- Media (hero, kartu destinasi) masih **placeholder ikon vector**, belum foto
  seperti versi mobile (foto web menyusul; lisensi wajib dicatat bila memakai
  Commons).
- Dua destinasi di Daftar (Merbabu, Sindoro) adalah placeholder desain.
- Belum dibuat: **hi-fi dashboard** (Admin/Merchant) — 4 layar lo-fi web
  (`52:5382`, `52:8053`, `52:8240`, `52:8427`) + component set
  `DashboardSidebar`, `StatCard`, `TableRow`.

---

## 7. Verifikasi

- `verify --measure`: Landing 1440×3143, Daftar Destinasi 1440×1208, Detail
  Destinasi 1440×1682, Masuk 1440×926; tinggi tiap frame = jumlah tinggi anak.
- Audit 4 layar web: fill ter-bind **412** / raw 0; stroke ter-bind **179** /
  raw 0; **0 node collapse**; 156 teks memakai text style, 87 label/ukuran
  eksplisit (mis. 28/15/13 yang tidak ada padanan text style).
- Section "Tiga langkah" memakai bulatan `canvas` + teks `primary` agar `accent`
  tetap eksklusif untuk penanda AI.
- Polesan: kartu katalog & hero Detail memakai scene bukit+matahari (primitif,
  bukan foto), peta Detail punya grid + 3 pin + kontrol zoom, panel media
  Masuk `layoutSizingVertical=FILL` agar mengisi tinggi body.
