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

### Layar Admin (batch admin)

| Layar | Node | Ukuran | Posisi |
| --- | --- | --- | --- |
| `Hi-Fi Web Admin - Overview (1440)` | `156:144` | 1440×865 | 6580,0 |
| `Hi-Fi Web Admin - Verifikasi (1440)` | `157:373` | 1440×865 | 6580,1000 |
| `Hi-Fi Web Admin - Kategori Destinasi - Kategori (1440)` | `157:759` | 1440×865 | 8120,0 |
| `Hi-Fi Web Admin - Kategori Destinasi - Destinasi (1440)` | `158:1010` | 1440×865 | 8120,1000 |
| `Hi-Fi Web Admin - Kategori Destinasi - Card (1440)` | `158:1375` | 1440×865 | 8120,2000 |

### Layar CRUD Destinasi (multi-step) & Dialog Kategori

Halaman CRUD dibuka sebagai **halaman terpisah** (bukan modal), form multi-step
5 langkah dengan indikator step circles, dan **rich text editor** (toolbar ikon
lengkap) pada deskripsi.

| Layar | Node | Posisi |
| --- | --- | --- |
| `Admin Create Destinasi - Step 1 (1440)` | `159:1883` | 9660,0 |
| `Admin Create Destinasi - Step 2 (1440)` | `160:2106` | 9660,1050 |
| `Admin Create Destinasi - Step 3 (1440)` | `160:2335` | 9660,2100 |
| `Admin Create Destinasi - Step 4 (1440)` | `160:2556` | 9660,3150 |
| `Admin Create Destinasi - Step 5 (1440)` | `160:2753` | 9660,4200 |
| `Admin Edit Destinasi - Step 1 (1440)` | `160:2975` | 11200,0 |
| `Admin Edit Destinasi - Step 3 (1440)` | `160:3196` | 11200,1050 |
| `Admin Edit Destinasi - Step 5 (1440)` | `160:3415` | 11200,2100 |
| `Admin Edit Destinasi - Step 4 (1440)` | `162:4294` | 11200,3150 |
| `Admin Kategori - Dialog Tambah (1440)` | `160:3635` | 12740,0 |
| `Admin Fasilitas - Penginapan (1440)` | `162:4491` | 15106,0 |
| `Admin Fasilitas - Transport (1440)` | `162:4675` | 15106,1050 |
| `Admin Fasilitas - Makanan (1440)` | `162:4857` | 15106,2100 |

### Layar Detail Destinasi (Admin)

Halaman baca-saja detail destinasi dengan tab **`Detail` / `Pratinjau`**. Shell
admin sama seperti layar admin lain (`Sidebar` 256 + `Main` 1184 = `Topbar` 64 +
`Content` padding 32, lebar `1120`).

| Layar | Node | Ukuran | Posisi |
| --- | --- | --- | --- |
| `Hi-Fi Web Admin - Detail Destinasi (1440)` | `165:5358` | 1440×1816 | 16740,0 |
| `Hi-Fi Web Admin - Detail Destinasi - Pratinjau (1440)` | `165:6128` | 1440×1461 | 16740,1300 |

- **Header**: kembali, judul + slug, badge `Published` + `Terverifikasi`, aksi
  `Lihat publik` (outline), `Edit destinasi` (`primary`), kebab (`Hapus`).
- **Tab `Detail`** — 2 kolom (konten `720` + panel `360`, gap `40`):
  - Kiri: **Ringkasan** (Terrain, Kesulitan, Ketinggian, Entry fee), **Tentang**,
    **Klasifikasi** (chip terrain/aktivitas, musim, guide), **Lokasi & Akses**
    (peta placeholder + pin `accessPoint` + koordinat + provinsi/kabupaten +
    chip moda + jarak), **Fasilitas Sekitar** (5 baris `TravelSupport` + badge
    Terverifikasi/Menunggu + harga + aksi edit/hapus), **Media** (grid foto +
    badge `Utama`).
  - Kanan: **Status & Verifikasi** (status, verifikator, tanggal, aksi
    `Nonaktifkan destinasi`), **Statistik** (dilihat, disimpan, fasilitas,
    rating), **Metadata** (dibuat/diubah), **tips**.
- **Tab `Pratinjau`**: banner `Pratinjau publik` + toggle `Desktop`/`Mobile`,
  lalu wujud publik di dalam shell admin (hero `primary`; Tentang/Akses/Lokasi/
  Fasilitas + panel harga `Rp 29.000` + CTA).
- Contoh data: **Gunung Bromo** (Published, terverifikasi, 5 fasilitas).
- Item sidebar **`Destinasi` aktif** (di layar admin sebelumnya masih
  `Dashboard`).

### Layar Route Builder (Admin)

Fitur **Route Builder** (titik, ruas, jalur, profil elevasi) — spesifikasi
lengkap di `docs/specs/route-builder.md`. 6 layar di deret `x=18300`:

**2 halaman utama**: **Preview & Detail** (peta + daftar ruas + detail jalur) dan
**Peta Full Screen** (editor; semua editing via context menu → dropdown nempel).
Ruas ditampilkan di halaman Preview.

| Layar | Node | Ukuran | Posisi |
| --- | --- | --- | --- |
| `Admin - Rute & Elevasi - Preview (1440)` | `165:7562` | 1440×1225 | 18300,0 |
| `Admin - Rute & Elevasi - Peta Fullscreen (1440)` | `165:12402` | 1440×752 | 18300,1500 |
| `Admin - Peta - Menu Peta Kosong (1440)` | `165:12837` | 1440×752 | 18300,2400 |
| `Admin - Peta - Menu Titik (1440)` | `165:13029` | 1440×752 | 18300,3400 |
| `Admin - Peta - Menu Titik - Buat Jalur (1440)` | `165:13131` | 1440×752 | 18300,4350 |
| `Admin - Peta - Menu Jalur (1440)` | `165:13233` | 1440×752 | 18300,5300 |
| `Admin - Peta - Menu Tambah Titik (1440)` | `165:13611` | 1440×752 | 18300,6250 |
| `Admin - Peta - Menu Tambah Jalur (1440)` | `165:13713` | 1440×752 | 18300,7300 |

Peta digambar dari primitif (`flex="none"` + koordinat absolut; ruas = `Rect`
diputar via `eval`; menu/dropdown = anak ber-`x/y` di dalam peta). Ruas
berwarna per `grade` (`success`/`warning`/`danger`).

- **Langkah wizard**: 1 Info Dasar · 2 Klasifikasi · 3 Lokasi & Akses ·
  4 Fasilitas Sekitar · 5 Media & Publikasi (review + publikasi).
- **Step 4 (Fasilitas Sekitar)**: tab tipe `Penginapan | Transport | Makanan`
  (dengan jumlah) + tombol `+ Tambah fasilitas` + daftar fasilitas (ikon, nama,
  badge status, meta, harga, edit/hapus). Mengelola entitas `TravelSupport`.
- **Form fasilitas (3 tipe, halaman terpisah)**: field menyesuaikan tipe —
  Penginapan (harga/malam, kapasitas, fasilitas, **Lokasi** + pilih di peta,
  bagian **Fasilitas lain** dengan tombol `+ Tambah lainnya`), Transport (moda,
  kapasitas kursi, rute, harga, kontak), Makanan (**Jenis warung**
  `Makanan/Logistik/Madura` + input bebas, jenis masakan, **Lokasi** + pilih di
  peta, kontak/alamat). Tiap form punya panel foto + status verifikasi + tips.
- **Navigasi footer**: `Kembali` · `Simpan draf` (ghost) · `Lanjut`/`Publikasikan`
  (primary). Step terakhir → `Publikasikan destinasi` (Create) / `Simpan perubahan` (Edit).
- **Rich text editor**: toolbar `bold/italic/underline/strikethrough · heading ·
  list · quote · link · image · undo/redo` + area teks terisi.
- **Pilih di peta (Step 3)**: UI map (jalan, sungai, terrain, pin, kontrol zoom,
  koordinat, `Reset`) + tombol `Pilih di peta` — admin memilih titik langsung di
  peta. Peta masih **placeholder** (digambar dari primitif, bukan tile asli).
- **Upload foto (Step 5)**: dropzone utama (tarik & lepas) + baris thumbnail
  (badge `Utama`, nama file, tombol hapus `×`, tile `Tambah`).
- **Kategori** memakai **dialog** (`160:3635`, overlay gelap 45% + kartu dialog):
  Nama, Slug, Tipe (Terrain/Aktivitas), pilihan Ikon, Deskripsi, Batal/Simpan.


Komponen yang dipakai ulang: `AdminSidebar (Alam)` (`156:134`), `KpiCard (Alam)`
(`156:64`). Halaman **Kategori & Destinasi** memakai tab underline
(`[Kategori] [Destinasi]`) + toggle view `[Tabel] [Card]` pada tab Destinasi.

- **Kategori** = enum `terrain`/`activities` destinasi (Gunung, Bukit, Danau,
  Air Terjun, Camping Ground, Savana, Hutan, Pantai) — grid kartu + aksi
  edit/hapus.
- **Destinasi (Tabel)**: kolom Destinasi (thumbnail+nama+slug), Provinsi,
  Terrain (chip), Kesulitan (pill dot), Fasilitas, Status, Aksi.
- **Destinasi (Card)**: kartu bergaya `DestinationCard` mobile + elemen
  manajemen (badge status overlay, menu kebab `…`, pil kesulitan, jumlah
  fasilitas). Media **berisi foto** (lihat §8).

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
- **Hi-fi dashboard Admin sudah dibuat** (Overview, Verifikasi, Kategori &
  Destinasi, CRUD Create/Edit, Fasilitas, serta **Detail Destinasi + Pratinjau**;
  lihat §1); Merchant belum.
- CRUD Destinasi (Create 5 step + Edit 3 step) & dialog Kategori sudah dibuat;
  belum ada state **sukses/confirmation** dan **delete-confirm**.
- Detail Destinasi Admin: peta masih placeholder, tab Pratinjau memakai wujud
  publik (hero + 2 kolom) tanpa iframe sungguhan.

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
- **Detail Destinasi Admin** (Detail + Pratinjau): fill ter-bind **209 / 120**,
  stroke ter-bind **150 / 79**, **0 raw fill / 0 raw stroke**; tinggi frame =
  muat anak (1816 / 1461).

---

## 8. Gambar (kartu destinasi — placeholder sementara)

Media kartu pada **Admin - Kategori Destinasi - Card** memakai foto asli dari
**Wikimedia Commons**. **Status: placeholder sementara — wajib diganti foto
milik sendiri/berlisensi sebelum rilis**, karena file berlisensi **CC BY-SA 4.0**
(atribusi + share-alike).

| Untuk (kartu) | File Commons | Author | Lisensi |
| --- | --- | --- | --- |
| Gunung Bromo | `Smoking Gunung Bromo sunrise - Indonesia.jpg` | Thomas Fuhrmann | CC BY-SA 4.0 |
| Gunung Papandayan | `Kabut dan Savana Tegal Alun, Gunung Papandayan, Garut.jpg` | Hugo Rio Aditya | CC BY-SA 4.0 |
| Bukit Moko — **stand-in** | `Tebing Keraton, Bandung, Jawa Barat, Indonesia, 27052017.jpg` | Aswaralif | CC BY-SA 4.0 |
| Gunung Prau | `Gunung Prau, Dataran Tinggi Dieng, Wonosobo.jpg` | Faaizul yahya | CC BY-SA 4.0 |
| Bukit Sikunir | `Bukit Sikunir Dieng Plateau.jpg` | (lihat halaman Commons) | CC BY-SA 4.0 |
| Gunung Gede | `Gunung Gede Pangrango (Megamendung, Bogor).jpg` | (lihat halaman Commons) | CC BY-SA 4.0 |

> Commons **tidak memiliki** foto Bukit Moko; kartu Bukit Moko memakai Tebing
> Keraton (kawasan Cimenyan/Dago Pakar) sebagai **stand-in**.

- Metode: unduh `Special:FilePath/<Nama_File>` (UA browser; `?width=` bisa 404
  untuk nama ber-koma) → resize lokal ke lebar 800 → serve lokal ber-header
  `Access-Control-Allow-Origin: *` → `fetch` + `figma.createImage()` lewat
  `eval`, dipasang sebagai **IMAGE fill** `scaleMode: FILL` pada frame `Media`
  (badge status & kebab tetap sebagai child di atasnya).
- Kredit dicatat **di sini, bukan di UI** (aturan anti-slop melarang kredit foto
  dekoratif pada kartu).
