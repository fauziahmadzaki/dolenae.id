# UI/UX Hi-Fi Mobile — Dolenae.id

Inventaris layar **hi-fi (tema "Alam")** untuk aplikasi mobile. Berbeda dari
`ui-ux-low-fi-system.md` (wireframe grayscale, validasi tata letak), dokumen ini
mencatat layar **warna final** yang memakai token, text style, dan component set
dari `design-system-hifi.md`.

- Page: **`Hi-Fi (Mobile)`** (`53:9544`), lebar `390px`.
- Sumber data isi layar: `packages/seed` (nama, tagline, elevasi, kabupaten,
  harga) supaya tidak ada konten placeholder.

---

## 1. Inventaris layar

| Layar | Node | Ukuran | Posisi |
| --- | --- | --- | --- |
| `Hi-Fi - Beranda (Mobile)` | `56:9996` | 390×1866 | 0,0 |
| `Hi-Fi - Detail Destinasi (Mobile)` | `65:215` | 390×1425 | 520,0 |
| `Hi-Fi - Jelajah (Mobile)` | `65:389` | 390×763 | 1040,0 |
| `Hi-Fi - AI Preferensi (Mobile)` | `68:651` | 390×1210 | 1560,0 |
| `Hi-Fi - AI Hasil (Mobile)` | `68:771` | 390×1056 | 2080,0 |
| `Hi-Fi - Rencana Perjalanan (Mobile)` | `68:1182` | 390×1045 | 2600,0 |
| `Hi-Fi - Checklist Persiapan (Mobile)` | `68:1036` | 390×736 | 3120,0 |
| `Hi-Fi - Fasilitas Sekitar (Mobile)` | `69:1427` | 390×630 | 3640,0 |
| `Hi-Fi - Detail Fasilitas - Penginapan (Mobile)` | `69:1517` | 390×1012 | 4160,0 |
| `Hi-Fi - Detail Fasilitas - Transport (Mobile)` | `69:1597` | 390×1032 | 4680,0 |
| `Hi-Fi - Detail Fasilitas - Makanan (Mobile)` | `69:1679` | 390×986 | 5200,0 |
| `Hi-Fi - Onboarding (Mobile)` | `80:74` | 390×888 | 0,2100 |
| `Hi-Fi - Masuk dan Daftar (Mobile)` | `80:96` | 390×844 | 520,2100 |
| `Hi-Fi - Lupa Kata Sandi (Mobile)` | `80:203` | 390×340 | 1040,2100 |
| `Hi-Fi - Verifikasi OTP (Mobile)` | `80:144` | 390×844 | 1560,2100 |
| `Hi-Fi - Ubah Kata Sandi (Mobile)` | `80:169` | 390×468 | 2080,2100 |
| `Hi-Fi - Profil (Mobile)` | `81:257` | 390×996 | 0,3200 |
| `Hi-Fi - Pengaturan (Mobile)` | `81:877` | 390×741 | 520,3200 |
| `Hi-Fi - Akun (Mobile)` | `81:974` | 390×642 | 1040,3200 |
| `Hi-Fi - Setelan Notifikasi (Mobile)` | `81:555` | 390×467 | 1560,3200 |
| `Hi-Fi - Tema dan Bahasa (Mobile)` | `81:617` | 390×467 | 2080,3200 |
| `Hi-Fi - Privasi dan Keamanan (Mobile)` | `81:1032` | 390×588 | 0,4300 |
| `Hi-Fi - Bantuan FAQ (Mobile)` | `81:751` | 390×641 | 520,4300 |
| `Hi-Fi - Kirim Masukan (Mobile)` | `81:791` | 390×508 | 1040,4300 |
| `Hi-Fi - Edit Profil (Mobile)` | `81:824` | 390×737 | 1560,4300 |
| `Hi-Fi - Keluar Konfirmasi (Mobile)` | `81:864` | 390×844 | 2080,4300 |
| `Hi-Fi - Buat Rencana Baru (Mobile)` | `84:1177` | 390×476 | 0,5500 |
| `Hi-Fi - Pilih Destinasi (Mobile)` | `84:1221` | 390×524 | 520,5500 |
| `Hi-Fi - Pilih Fasilitas (Mobile)` | `84:1280` | 390×444 | 1040,5500 |
| `Hi-Fi - Detail Item Rencana (Mobile)` | `84:1326` | 390×483 | 1560,5500 |
| `Hi-Fi - Konfirmasi Hapus Item (Mobile)` | `85:1373` | 390×844 | 0,6500 |
| `Hi-Fi - Rencana Sukses (Mobile)` | `85:1386` | 390×844 | 520,6500 |
| `Hi-Fi - Tambah Rencana - Pilih (Mobile)` | `85:1408` | 390×420 | 1040,6500 |
| `Hi-Fi - Tambah Rencana - Atur (Mobile)` | `85:1439` | 390×660 | 1560,6500 |
| `Hi-Fi - Tambah Item Checklist (Mobile)` | `86:1513` | 390×844 | 0,7500 |
| `Hi-Fi - Checklist Selesai (Mobile)` | `86:1544` | 390×844 | 520,7500 |
| `Hi-Fi - Usulkan Fasilitas (Mobile)` | `86:1562` | 390×732 | 1040,7500 |
| `Hi-Fi - Usulan Sukses (Mobile)` | `86:1609` | 390×844 | 1560,7500 |
| `Hi-Fi - Pencarian Rekomendasi (Mobile)` | `86:2186` | 390×844 | 0,11500 |
| `Hi-Fi - Pencarian Hasil (Mobile)` | `86:2306` | 390×844 | 520,11500 |
| `Hi-Fi - Pencarian Kosong (Mobile)` | `86:2417` | 390×844 | 1040,11500 |
| `Hi-Fi - Filter Dialog (Mobile)` | `86:2485` | 390×844 | 1560,11500 |
| `Hi-Fi - Notifikasi (Mobile)` | `86:1808` | 390×844 | 1560,8500 |
| `Hi-Fi - Destinasi Tersimpan (Mobile)` | `86:1897` | 390×844 | 0,9500 |
| `Hi-Fi - Destinasi Tersimpan Kosong (Mobile)` | `86:1948` | 390×844 | 520,9500 |
| `Hi-Fi - Daftar Rencana (Mobile)` | `86:1962` | 390×844 | 1040,9500 |
| `Hi-Fi - Daftar Rencana Kosong (Mobile)` | `86:1986` | 390×844 | 1560,9500 |
| `Hi-Fi - Checklist Tersimpan (Mobile)` | `86:2003` | 390×844 | 0,10500 |
| `Hi-Fi - Checklist Tersimpan Kosong (Mobile)` | `86:2051` | 390×844 | 520,10500 |
| `Hi-Fi - Fasilitas Diusulkan (Mobile)` | `86:2067` | 390×844 | 1040,10500 |
| `Hi-Fi - Fasilitas Diusulkan Kosong (Mobile)` | `86:2104` | 390×844 | 1560,10500 |
| `Hi-Fi - Error Form (Mobile)` | `101:32` | 390×1064 | 0,12500 |
| `Hi-Fi - Empty State (Mobile)` | `101:141` | 390×1412 | 520,12500 |
| `Hi-Fi - Error dan Akses State (Mobile)` | `101:200` | 390×1124 | 1040,12500 |
| `Hi-Fi - Gagal Memuat Beranda (Mobile)` | `101:243` | 390×844 | 0,13500 |
| `Hi-Fi - Gagal Memuat Katalog (Mobile)` | `101:302` | 390×844 | 520,13500 |
| `Hi-Fi - Gagal Memuat AI (Mobile)` | `101:358` | 390×844 | 1040,13500 |

Struktur Beranda (7 section, `gap 12`, bg `canvas`):

| Section | Tinggi | Isi |
| --- | --- | --- |
| Header | 56 | **bar `primary` (pine)**: logo + nama `on-primary`; bell dalam bulatan `primary-hover`; avatar `canvas` dengan inisial `primary` |
| Search | 90 | heading `display-md` "Mau ke mana?"; field `canvas-subtle` 48px + tombol filter 32px |
| Chips | 34 | kategori; chip pertama state **aktif** (`primary`), lain `canvas-subtle` |
| AI | 180 | **kartu `primary` (pine)** + `shadow/md`: bulatan `accent` + sparkles, eyebrow `overline`, judul `on-primary`, body `canvas-subtle`, CTA `accent` full-width 44px |
| Popular | 616 | header seksi + "Lihat semua"; 2 kartu `canvas-subtle` + `shadow/sm`, media **356×180** berisi foto (lihat §7) |
| Activities | 128 | 4 tile `canvas-subtle`, ikon dalam bulatan `canvas` |
| Fasilitas sekitar | 190 | **rail horizontal** (358px, `clip`) berisi 3 `SupportCard` (200×136, `canvas-subtle` + `shadow/sm`); kartu ke-3 terpotong sebagai petunjuk scroll; + "Lihat semua" |
| Bantuan | 220 | kartu `canvas-subtle`: 3 baris `MenuRow` (ikon + label + chevron) dipisah hairline |
| CTA penutup | 180 | **band full-bleed** `primary` (pine) tanpa radius: judul, sub 1 baris, tombol `canvas` "Susun rencana" |
| BottomNav | 64 | bg `canvas` + hairline atas, indikator `primary` pada tab aktif |

---

## 2. Yang diimprove dari versi low-fi

Tata letak section **dipertahankan** (urutan dan proporsi sama dengan
`Lo-Fi - Beranda (Mobile)` `41:2`). Perubahan yang dilakukan:

1. **Token & tipografi asli.** Grayscale diganti palet "Alam" (canvas bone,
   surface, ink/body, primary pine, satu aksen ember) dan skala tipografi
   `DESIGN.md` lewat text style, bukan ukuran ad-hoc.
2. **Field pencarian punya aksi.** Ada tombol filter 32px di ujung kanan field,
   sehingga kolom pencarian tidak berhenti sebagai dekorasi.
3. **State aktif ditunjukkan.** Chip "Gunung" aktif (`primary`), bukan semua chip
   netral; sistem state ini konsisten dengan `Chip`/`BottomNav`.
4. **Kartu destinasi berisi data nyata.** Judul, tagline, `2.329 mdpl ·
   Probolinggo`, dan `Rp 29.000` diambil dari seed. Badge kesulitan dipindah ke
   **dalam body kartu** (di sebelah judul), bukan overlay di atas gambar.
5. **Hierarki elevasi.** Kartu destinasi `shadow/sm`; kartu AI `shadow/md`
   supaya kartu AI terbaca sebagai ajakan, bukan konten biasa.
6. **Satu momen aksen.** Hanya kartu AI yang memakai `accent` (ikon sparkles,
   eyebrow, dan CTA); sisa layar memakai `primary`/netral.
7. **Ikon aktivitas diberi kontainer.** Ikon duduk di bulatan `surface` di atas
   tile `canvas-subtle` supaya tile punya kedalaman, bukan kotak datar.
8. **Identitas pengguna konkret.** Avatar memakai inisial "D" (nama demo di seed
   adalah "Dimas"), bukan ikon user generik.
9. **BottomNav lokal.** Label Indonesia (Beranda, Jelajah, AI, Rencana, Profil)
   dan indikator hanya pada tab aktif; tab lain memakai spacer `canvas` agar
   ikon dan label tetap sejajar.

Revisi setelah review (3 poin):

10. **Surface tidak lagi putih.** Kartu, field, dan chip memakai `canvas-subtle`
    (warm, tonal) dengan stroke `hairline`, bukan `surface` putih. Halaman jadi
    komposisi tonal: canvas bone sebagai latar, panel warm satu tingkat di
    atasnya. `surface` disisakan untuk overlay/modal.
11. **Top bar jadi pine.** Header memakai `primary` (bukan putih) supaya brand
    langsung terbaca; bell di bulatan `primary-hover` yang subtle, avatar
    bulatan `canvas` dengan huruf `primary`. Alternatif yang bisa dicoba:
    `canvas-subtle` (netral) atau `accent` (ember) bila ingin lebih berani.
12. **Section AI jauh lebih terlihat.** Kartu AI menjadi blok `primary` (pine)
    dengan bulatan ikon `accent` 36px dan **CTA `accent` full-width 44px** plus
    `arrow-right`. Sebelumnya ikon dan tombol nyaris tak terbaca.

> Akar masalah poin 12 bukan sekadar ukuran: variabel `primary` dan `accent`
> bentrok dengan koleksi `shadcn/semantic`, sehingga `var:accent` resolve ke
> zinc-100 (hampir putih) dan `var:primary` ke near-black. Sudah diperbaiki
> dengan rename duplikat shadcn + rebind `use "Dolenae (Alam)" --all` di page
> DS dan page layar. Detail: `design-system-hifi.md` §6 butir 11.

Tambahan section (revisi kedua):

13. **Fasilitas sekitar (rail).** Menonjolkan ekosistem pendukung (penginapan,
    transport, makanan) dengan rail horizontal + badge terverifikasi. Family
    layout ini berbeda dari kartu stack Popular, jadi tidak mengulang pola.
14. **Bantuan.** Tiga pintu masuk bantuan memakai `MenuRow`, di dalam satu kartu
    bertingkat supaya tidak jadi daftar polos.
15. **CTA penutup.** Band penuh `primary` sebagai penutup scroll dengan tombol
    **`canvas`** (bukan `accent`) agar tidak ada dua tombol aksen identik dengan
    kartu AI; intent-nya juga berbeda ("Susun rencana" vs "Mulai" untuk AI).

Isi ketiga section ini **placeholder desain di Figma** (harga/nama mengacu seed &
konten lo-fi, bukan data baru di `packages/`).

Yang **tidak** dipakai (menghindari pola AI slop): em-dash, badge overlay di
atas foto, dot status dekoratif, angka statistik palsu, eyebrow di setiap
seksi (hanya satu eyebrow di kartu AI), dan lebih dari satu middle-dot per baris
meta.

---

## 3. Detail Destinasi & Jelajah (batch 1)

### `Hi-Fi - Detail Destinasi (Mobile)` (`65:215`, 390×1425)
AppBar 56 · Hero 200 · Title 84 · Specs 140 · Akses 193 · Lokasi 264 · Fasilitas 102 · Supports 208 · CTA 82

- Hero, peta, dan media lain masih placeholder X (belum dipasang foto).
- **Specs** = grid 2×2 (Tiket masuk, Ketinggian, Guide, Musim terbaik) dari seed Bromo.
- **Akses** = deskripsi + `FacilityTag` (Mobil/Jeep/Motor) + estimasi `≈4 jam` + `140 km`.
- **Lokasi** = peta placeholder + `SectionHeader` "Lokasi" dengan aksi "Buka di peta" + titik akses Cemoro Lawang.
- **Supports** = 2 baris support (Bromo Jeep Tour, Homestay Cemoro Indah) + `shadow/sm` + `SectionHeader` "Lihat semua".
- **CTA bawah** = dua aksi berbeda intent: "Checklist" (outline) dan "Tambah ke rencana" (`primary`).
- Tanpa BottomNav (halaman detail memakai CTA bawah, mengikuti lo-fi).

### `Hi-Fi - Jelajah (Mobile)` (`65:389`, 390×763)
AppBar 56 · Search 48 · Filters 32 · Meta 16 · List 492 · BottomNav 59

- `AppBar` varian Halaman (judul saja), filter `Chip` (Semuanya aktif), meta "24 destinasi · Urutkan: Populer".
- **List** = 4 kartu horizontal 358×114 (media 114 + konten) dari seed: Bromo, Papandayan, Bukit Moko, Gunung Prau; badge kesulitan + provinsi · elevasi (1 middle-dot per baris).
- BottomNav dengan tab "Jelajah" aktif.

## 4. Menu AI (batch 2)

### `Hi-Fi - AI Preferensi (Mobile)` (`68:651`, 390×1210)
AppBar 56 · Prompt 252 · Form1 278 · Form2 228 · Form3 254 · CTA 82

- **Prompt jadi hero**: heading "Ceritakan rencanamu" + sub, lalu **`PromptInput`**
  (ikon `sparkles` accent, placeholder "Mis. pengen ke gunung buat sunrise, 2 hari,
  budget 500rb", tombol kirim bulat di kanan). Di bawahnya chip saran
  (Sunrise 2 hari / Ramah pemula / Budget 500rb / Camping).
- **Atur manual** (form tetap ada, dipisah label): Wilayah · Aktivitas · Medan ·
  Tingkat kesulitan · Durasi (semua `Chip`) · Budget per orang (`Input`) ·
  Kebutuhan (2 baris label + `Switch`, "Butuh penginapan" aktif) · Catatan bebas
  (composer kedua dengan placeholder berbeda).
- Bar CTA bawah "Cari rekomendasi" (`primary` + ikon sparkles). Tanpa BottomNav,
  mengikuti lo-fi (alur dengan AppBar kembali).

### `Hi-Fi - AI Hasil (Mobile)` (`68:771`, 390×1056)
AppBar 56 · Recap 158 · Summary 94 · Results 618 · CTA 82

- **Recap prompt**: kartu berisi prompt pengguna (label `overline` "PROMPTMU") +
  chip preferensi hasil parsing (Jawa Barat · Hiking · 2-3 hari · Menengah) +
  "rule-based · 3 destinasi".
- Ringkasan AI (ikon `sparkles` accent) + 3 × `RecommendationCard` **Lengkap**
  (peringkat, nama, meta, pill **Skor** accent, tagline, blok "Mengapa cocok?",
  aksi "Lihat detail" + "Tambah"). Skor & alasan mengikuti lo-fi (placeholder).
- Bar CTA: "Ubah preferensi" (outline) + "Tanya lagi" (`primary`).

> Prompt bebas bukan tambahan di luar rencana produk: `Preference.rawText`
> ("teks natural") sudah ada di `packages/types/src/ai.ts`.

## 5. Rencana & Checklist (batch 3)

### `Hi-Fi - Rencana Perjalanan (Mobile)` (`68:1182`, 390×1045)
AppBar 56 · Summary 114 · Briefing 180 · Steps 588 · BottomNav 59

- `AppBar Tipe=Halaman` (tab root, tanpa tombol kembali) + `BottomNav` dengan tab
  **Rencana** aktif.
- **Summary**: kartu `canvas-subtle` berisi "Trip Dieng", tanggal + jumlah
  destinasi (`12-14 Jul 2026 · 3 destinasi`, satu middle-dot), dan "Estimasi
  budget" → `Rp1.250.000`. Ada aksi "Ubah" di kanan.
- **Briefing AI** (`BriefingCard (Alam)` varian Lengkap): eyebrow `overline`
  "BRIEFING AI" + aksi ghost "Perbarui", paragraf 3-4 baris tentang kondisi
  perjalanan dan urutan hari, lalu caption "Disusun dari 3 destinasi dan
  preferensi tersimpan". Isi briefing **placeholder Figma** (mengacu seed); di
  PRD ini masuk bagian "rekomendasi kondisi perjalanan".
- **Steps**: 3 baris `rail nomor + PlanCard` (Hari 1 Prau, Hari 2 Bromo, Hari 3
  Moko). PlanCard kini punya **baris meta destinasi**
  (`2.565 mdpl · akses Patak Banteng, naik 3-4 jam` — sengaja hanya satu
  middle-dot per baris). Rail hari terakhir tanpa garis lanjutan; garis rail
  disamakan dengan tinggi kartu (168px). Baris terakhir "Tambah destinasi"
  (outline + ikon plus).

### `Hi-Fi - Checklist Persiapan (Mobile)` (`68:1036`, 390×736)
AppBar 56 · Progress 88 · Tabs 32 · Group 210 · Group 148 · Add 48 · CTA 82

- `AppBar Tipe=Kembali`; tanpa BottomNav (ikut lo-fi).
- **Progress**: kartu konteks "Gunung Bromo" + `5/12 siap` (accent) + bar 8px +
  caption "5 dari 12 item selesai".
- Tab filter `Chip` (Semua aktif, Perlengkapan, Kesehatan, Konservasi) — baris
  di-`clip` supaya chip terakhir terpotong sebagai petunjuk scroll.
- 3 grup (label `overline` + kartu berisi baris checklist): PERLENGKAPAN
  (Selesai/Selesai/Belum), KESEHATAN (Belum/Selesai), ADMINISTRASI (**Cek lagi**
  = state `Warning`).
- Aksi "Tambah item" (outline) dan bar CTA "Tandai siap" (`primary`).

## 6. Fasilitas (batch 4)

### `Hi-Fi - Fasilitas Sekitar (Mobile)` (`69:1427`, 390×630)
AppBar 56 · Context 52 · Segmented 44 · Filters 32 · Groups 338 · Add 48

- Konteks "Gunung Bromo" + "4 fasilitas di sekitar destinasi".
- **`Segmented (Alam)`** (tab Semua aktif) + filter `Chip` (Terverifikasi aktif,
  Ekonomis, Kurang dari 2 km).
- 3 grup (label `overline` + `SupportRow`): PENGINAPAN, TRANSPORTASI, TEMPAT
  MAKAN. Baris memuat ikon, nama, meta, badge terverifikasi, dan harga.
- "Usulkan fasilitas" (outline + ikon plus). Tanpa BottomNav, ikut lo-fi.

### Detail Fasilitas ×3 (`69:1517` / `69:1597` / `69:1679`)
Satu template, tinggi 390×1012 / 1032 / 986: AppBar · Hero 220 · Body1 · Body2 · CTA 82.

- **Hero** berisi foto (lihat §7).
- **Body1** = Header (nama + badge verifikasi + jenis + harga/unit) · Info 2×2
  (field per jenis) · chip (label "Fasilitas"/"Termasuk"/"Tersedia") · Deskripsi.
- **Body2** = Kontak (baris WhatsApp/Telepon/Instagram, nilai rata kanan) ·
  Destinasi terkait (kartu mini + chevron).
- **CTA** = "Simpan" (outline) + "Hubungi via WhatsApp" (`primary`).
- Perbedaan per jenis: Penginapan (Kapasitas/Jarak/Harga/Tipe, fasilitas air
  hangat), Transport (Moda/Kapasitas/Rute/Harga, termasuk driver), Makanan
  (Masakan/Rentang/Lokasi/Status, belum terverifikasi).

## 7. Auth & Onboarding (batch 5)

Deret baru `y=2100`, memakai komponen `AuthTabs (Alam)`, `PasswordField (Alam)`,
`OtpInput (Alam)` + `AppBar (Alam)`/`Input (Alam)`/`Button (Alam)`.

### `Hi-Fi - Onboarding (Mobile)` (`80:74`, 390×888)
Hero 420 · Content 326 · Actions 142 (gap 0). Hero pine `primary` berisi bulatan
`primary-hover` + ikon `mountain-snow`, wordmark `Dolenae.id` (`title`), dan
tagline `on-primary`. Content: eyebrow `overline`, heading `display-lg`
"Temukan gunungmu, siapkan perjalanannya", sub `body-lg`, indikator 3 slide
(aktif `primary`, lain `hairline`). Actions: CTA `primary` "Mulai Jelajah" +
ghost "Lewati".

### `Hi-Fi - Masuk dan Daftar (Mobile)` (`80:96`, 390×844)
Head 216 (logo pine, judul `display-md` "Selamat datang", sub `body-sm`) · Form
368 · Spacer fill · Footer 68. Form: `AuthTabs` (Masuk aktif), input Email +
`PasswordField` (meniru `Input (Alam)` 48px), baris "Ingat saya" (kotak centang
`primary` + centang) dan tautan `primary` "Lupa kata sandi?", CTA `primary`,
divider "atau lanjut dengan", tombol sekunder `surface` + stroke `border-strong`
+ ikon `lucide:chrome`. Footer "Belum punya akun? Daftar" rata tengah.

### `Hi-Fi - Lupa Kata Sandi (Mobile)` (`80:203`, 390×340)
AppBar Kembali (pine) · Content 196 · Actions 88. Heading `display-md`
"Atur ulang kata sandi", sub `body-sm`, input Email, CTA `primary`
"Kirim tautan".

### `Hi-Fi - Verifikasi OTP (Mobile)` (`80:144`, 390×844)
AppBar Kembali · Content 220 · Spacer fill · Actions 88. Heading "Masukkan kode",
sub `body-sm` (email disamarkan `d***@mail.com`), enam kotak OTP 48px (3 terisi,
kotak ke-4 fokus `border-strong` 2px), baris "Tidak menerima kode? Kirim ulang
(0:45)" (`primary`), CTA `primary` "Verifikasi".

### `Hi-Fi - Ubah Kata Sandi (Mobile)` (`80:169`, 390×468)
AppBar Kembali · Content 324 · Actions 88. Tiga `PasswordField`
(saat ini/baru/konfirmasi) dengan label `caption`, hint `caption`
"Minimal 8 karakter, kombinasi huruf dan angka.", CTA `primary`
"Simpan kata sandi".

> Form auth memakai placeholder sebagai label (mengikuti komponen `Input (Alam)`);
> layar Ubah Kata Sandi menambah label di atas field karena ada tiga field
> sejenis yang perlu dibedakan.

## 8. Profil & Pengaturan (batch 6)

Layar akun wisatawan + sub-pengaturan. Pola bersama: **AppBar pine** (Kembali untuk
sub-layar), grup berlabel `overline`, dan **kartu `canvas-subtle`** + `hairline`
berisi baris setinggi 56px (ikon dalam bulatan 32px `canvas` + label + chevron /
`Switch` / kotak pilih). Ikon Lucide.

| Layar | Isi |
| --- | --- |
| `Hi-Fi - Profil (Mobile)` (`81:257`) | AppBar tab root + ikon setelan; kartu profil (avatar `primary` inisial D, nama `title`, email, badge Wisatawan, 3 stat, "Ubah profil"); grup AKUN & KEAMANAN, PREFERENSI, BANTUAN; kartu "Keluar" (`danger`); `BottomNav` tab Profil aktif |
| `Hi-Fi - Pengaturan (Mobile)` (`81:877`) | Grup AKUN, APLIKASI (termasuk toggle "Mode hemat data" off), BANTUAN, LAINNYA ("Keluar" `danger`) |
| `Hi-Fi - Akun (Mobile)` (`81:974`) | Kartu info (Nama, Email, Peran, Bergabung — nilai rata kanan dari `seedUsers.wisatawanDemo`) + tombol outline; grup KEAMANAN; kartu "Hapus akun" (`danger`) |
| `Hi-Fi - Setelan Notifikasi (Mobile)` (`81:555`) | Grup AKTIVITAS (3 toggle on) + PROMO (2 toggle off) + catatan `caption` |
| `Hi-Fi - Tema dan Bahasa (Mobile)` (`81:617`) | Grup TEMA (Terang terpilih, Ikuti sistem, Gelap) + BAHASA (Indonesia terpilih, English) memakai kota pilih centang `primary`; catatan bahwa tema gelap belum tersedia |
| `Hi-Fi - Privasi dan Keamanan (Mobile)` (`81:1032`) | Grup KEAMANAN AKUN (Kata sandi, Verifikasi dua langkah toggle, Perangkat aktif) + PRIVASI (2 toggle) + DATA SAYA |
| `Hi-Fi - Bantuan FAQ (Mobile)` (`81:751`) | Field cari + `FaqAccordion` (1 terbuka dari 5) + tombol outline "Masih butuh bantuan? Hubungi kami" |
| `Hi-Fi - Kirim Masukan (Mobile)` (`81:791`) | Chip kategori (Bug aktif), input Subjek, textarea `120px`, rating 5 bintang `primary` (4 terisi), CTA `primary` |
| `Hi-Fi - Edit Profil (Mobile)` (`81:824`) | Avatar besar + "Ganti foto"; field Nama/Email/Telepon/Kota terisi dari seed; bio textarea; CTA `primary`; aksi "Simpan" di AppBar |
| `Hi-Fi - Keluar Konfirmasi (Mobile)` (`81:864`) | Layar konfirmasi: latar `ink` gelap + `Dialog (Alam)` `surface` tengah (Batal outline + Keluar `primary`) |

> Form seting tidak memakai BottomNav (sub-alur dengan AppBar Kembali), kecuali
> Profil yang merupakan tab root. Angka stat di Profil adalah placeholder desain
> (mengacu seed), bukan data baru di `packages/`.

## 9. Rencana CRUD (batch 7)

Memakai komponen `SelectableRow (Alam)`, `DateField (Alam)`, `Stepper (Alam)`,
`Dialog (Alam)` + primitif yang sama. Isi dari `packages/seed` (Gunung Bromo,
Gunung Prau, Gunung Papandayan, Bukit Moko; Homestay Cemoro Indah, Bromo Jeep
Tour Probolinggo, Warung Edelweiss Basecamp).

| Layar | Isi |
| --- | --- |
| `Hi-Fi - Buat Rencana Baru (Mobile)` (`84:1177`) | Nama rencana, Destinasi (baris pilih + chevron), Tanggal (`DateField` terisi), Jumlah orang (`Stepper`), CTA "Buat rencana" |
| `Hi-Fi - Pilih Destinasi (Mobile)` (`84:1221`) | Field cari + 4 `SelectableRow` (Bromo & Prau terpilih), CTA "Tambahkan 2 destinasi" |
| `Hi-Fi - Pilih Fasilitas (Mobile)` (`84:1280`) | Segmented (Penginapan aktif) + 3 baris fasilitas (Homestay terpilih), CTA "Tambahkan 1 fasilitas" |
| `Hi-Fi - Detail Item Rencana (Mobile)` (`84:1326`) | Kartu item (nama, meta, chip "Hari 1" + "Menengah" `warning`), catatan, fasilitas terkait, aksi outline "Ubah urutan" + "Hapus item" (`danger`) |
| `Hi-Fi - Konfirmasi Hapus Item (Mobile)` (`85:1373`) | Layar konfirmasi: latar `ink` + `Dialog (Alam)` Destruktif (Batal + Hapus `danger`) |
| `Hi-Fi - Rencana Sukses (Mobile)` (`85:1386`) | Bulatan centang `primary`, judul `display-md`, ringkasan kartu (Rencana/Tanggal/Destinasi), CTA "Lihat rencana" + ghost "Kembali ke beranda" |
| `Hi-Fi - Tambah Rencana - Pilih (Mobile)` (`85:1408`) | Bottom sheet `surface` di atas latar `ink`: handle + judul + 3 pilihan (Pilih destinasi/fasilitas, Buat rencana baru) + Batal |
| `Hi-Fi - Tambah Rencana - Atur (Mobile)` (`85:1439`) | Nama, Tanggal, Jumlah hari & orang (`Stepper`), Estimasi budget, Catatan, CTA "Simpan rencana" |

## 10. Checklist & Usulan (batch 8)

Memakai `Toast (Alam)` + primitif yang sama. Kategori checklist mengikuti
`packages/types` (Perlengkapan, Kesehatan, Konservasi).

| Layar | Isi |
| --- | --- |
| `Hi-Fi - Tambah Item Checklist (Mobile)` (`86:1513`) | Nama item, Kategori (chip Perlengkapan aktif), toggle "Tandai sebagai wajib", Catatan, CTA "Tambah item" |
| `Hi-Fi - Checklist Selesai (Mobile)` (`86:1544`) | Toast `success` "Checklist tersimpan" di atas, bulatan centang `primary`, judul `display-md` "Checklist lengkap!", CTA "Kembali ke rencana" + ghost |
| `Hi-Fi - Usulkan Fasilitas (Mobile)` (`86:1562`) | Nama fasilitas, Tipe (chip Penginapan aktif), Destinasi terdekat (baris pilih), Alamat, tombol outline "Tambah foto", Catatan, CTA "Kirim usulan" |
| `Hi-Fi - Usulan Sukses (Mobile)` (`86:1609`) | Bulatan centang, judul "Usulan terkirim", ringkasan (Fasilitas/Tipe/Status) + badge `warning` "Menunggu tinjauan", CTA + ghost |

## 11. Pencarian, Filter, Notifikasi (batch 9)

**Pencarian satu halaman.** Tidak ada layar "Pencarian" terpisah dengan tombol
kembali: field cari duduk di bawah AppBar **Jelajahi** dan isi di bawahnya
berganti sesuai state (rekomendasi → hasil → kosong), sehingga terasa berada di
halaman yang sama. Tombol filter `sliders-horizontal` di ujung kanan field jadi
pemicu membuka **bottom sheet** filter (bukan navigasi layar).

Memakai `EmptyState (Alam)`, `NotificationItem (Alam)`, `BottomSheet (Alam)` +
primitif yang sama. Media kartu pencarian memakai ikon `mountain-snow` di atas
`canvas` sebagai placeholder (belum memasang foto baru).

| Layar | Isi |
| --- | --- |
| `Hi-Fi - Pencarian Rekomendasi (Mobile)` (`86:2186`) | State fokus: AppBar "Jelajahi" + field `border-strong` placeholder "Mau ke mana?" + clear `x`; panel **RIWAYAT PENCARIAN** (2 baris + "Hapus riwayat"), **PENCARIAN POPULER** (chip Bromo/Prau/Papandayan/Camping), **DESTINASI DISARANKAN** (3 baris); BottomNav "Jelajah" |
| `Hi-Fi - Pencarian Hasil (Mobile)` (`86:2306`) | State hasil: header Jelajahi (tanpa back) + field terisi "bromo" + tombol filter `primary`; chip "Semua" aktif, meta "5 hasil · Urutkan: Relevan", 4 kartu horizontal (media ikon 96 + nama/meta + badge kesulitan); BottomNav "Jelajah" |
| `Hi-Fi - Pencarian Kosong (Mobile)` (`86:2417`) | State kosong: header Jelajahi + field "gunung misterius"; `EmptyState` "Tidak ada hasil" di tengah + chip kata kunci populer; BottomNav "Jelajah" |
| `Hi-Fi - Filter Dialog (Mobile)` (`86:2485`) | Bottom sheet `surface` di atas latar `ink`: handle + "Filter & urutkan" + close; Urutkan (4 radio, "Paling populer"), Tingkat kesulitan (chip "Menengah"), Fasilitas (chip "Area camping"), footer Reset + "Terapkan filter" |
| `Hi-Fi - Notifikasi (Mobile)` (`86:1808`) | Grup HARI INI (2 item belum dibaca, titik `primary`) + SEBELUMNYA (2 item dibaca), aksi "Tandai dibaca" di AppBar |

> Layar `Hi-Fi - Filter dan Urutkan` lama (layar penuh) **digantikan** oleh
> `BottomSheet (Alam)` varian Filter di atas.

## 12. Tersimpan & Empty state (batch 10)

Layar daftar tersimpan + varian kosongnya. Memakai `EmptyState (Alam)`,
komponen kartu yang sudah ada, dan badge status. Semua bebas data (kosong) atau
memakai nama dari `packages/seed`.

| Layar | Isi |
| --- | --- |
| `Hi-Fi - Destinasi Tersimpan (Mobile)` (`86:1897`) | 3 kartu horizontal (media ikon + nama/meta + badge kesulitan + ikon `bookmark-check` `primary`) |
| `Hi-Fi - Destinasi Tersimpan Kosong (Mobile)` (`86:1948`) | `EmptyState` "Belum ada destinasi" + CTA "Jelajahi destinasi" |
| `Hi-Fi - Daftar Rencana (Mobile)` (`86:1962`) | 2 kartu rencana (Trip Bromo "Aktif" + progress bar, Trip Dieng "Arsip" selesai) |
| `Hi-Fi - Daftar Rencana Kosong (Mobile)` (`86:1986`) | `EmptyState` "Belum ada rencana" + CTA "Buat rencana" |
| `Hi-Fi - Checklist Tersimpan (Mobile)` (`86:2003`) | 3 kartu checklist (Bromo 5/12, Prau 8/10, Papandayan selesai `success`) + progress bar |
| `Hi-Fi - Checklist Tersimpan Kosong (Mobile)` (`86:2051`) | `EmptyState` "Belum ada checklist" + CTA "Susun checklist" |
| `Hi-Fi - Fasilitas Diusulkan (Mobile)` (`86:2067`) | 3 baris usulan (badge `Menunggu` warning, `Terverifikasi` success, `Ditolak` danger) |
| `Hi-Fi - Fasilitas Diusulkan Kosong (Mobile)` (`86:2104`) | `EmptyState` "Belum ada usulan" + CTA "Usulkan fasilitas" |

> Dengan batch ini **seluruh 50 layar lo-fi mobile sudah punya versi hi-fi**.
> Berikutnya: hi-fi web (landing + dashboard) di `docs/specs/` terpisah.

## 13. Error & Empty State (batch 11)

Layar khusus galeri status: variasi **error formulir** dan **empty state**
dengan microcopy kontekstual (menyebut konteks + langkah lanjutan), Bahasa
Indonesia fungsional tanpa em-dash. Memakai varian status baru `Input`/
`PasswordField` `State=Error` dan `EmptyState` `Tipe=Offline`/`Akses ditolak`.

| Layar | Isi |
| --- | --- |
| `Hi-Fi - Error Form (Mobile)` (`101:32`) | Grup MASUK (Email: "Masukkan email yang valid, contoh: nama@email.com"; Kata sandi: "Kata sandi minimal 8 karakter."), DAFTAR (Email: "Email ini sudah terdaftar. Masuk atau gunakan email lain."; Konfirmasi: "Konfirmasi kata sandi tidak cocok."), VERIFIKASI (OTP: "Kode salah atau sudah kedaluwarsa. Minta kode baru."), RENCANA (Tanggal: "Tanggal selesai harus setelah tanggal mulai."). Field stroke `danger` 2px + ikon `alert-circle` + baris pesan `danger`. |
| `Hi-Fi - Empty State (Mobile)` (`101:141`) | BELUM ADA DATA: destinasi tersimpan, rencana, checklist. TIDAK ADA HASIL: pencarian ("Tidak ada destinasi untuk \"gunung misterius\"…"), fasilitas sekitar. Tiap kartu: ikon, judul, microcopy, CTA outline. |
| `Hi-Fi - Error dan Akses State (Mobile)` (`101:200`) | GAGAL MEMUAT ("Periksa koneksi internet lalu coba lagi." + "Coba lagi"), OFFLINE (data tersimpan + "Muat ulang"), BUTUH AKSES ("Masuk dulu…" + "Masuk"), NOTIFIKASI (kosong, tanpa CTA). |

**Gagal memuat per layar utama** (full-page, header + BottomNav dengan tab aktif):

| Layar | Isi |
| --- | --- |
| `Hi-Fi - Gagal Memuat Beranda (Mobile)` (`101:243`) | Header pine (logo + bell + avatar) + BottomNav "Beranda" aktif; ikon `cloud-off` `danger`, judul "Gagal memuat beranda", body "Kami tidak bisa mengambil destinasi populer dan fasilitas terbaru…", CTA "Coba lagi" + ghost "Muat ulang" |
| `Hi-Fi - Gagal Memuat Katalog (Mobile)` (`101:302`) | AppBar "Jelajahi" + field cari + BottomNav "Jelajah" aktif; ikon `triangle-alert`, "Gagal memuat katalog", body menyebut muat ulang/periksa filter, CTA "Coba lagi" + ghost "Reset filter" |
| `Hi-Fi - Gagal Memuat AI (Mobile)` (`101:358`) | AppBar "AI Dolenae" + BottomNav "AI" aktif; "Rekomendasi AI gagal diproses", body "Coba lagi sebentar lagi atau ubah preferensi.", CTA "Coba lagi" + ghost "Ubah preferensi" |

## 14. Gambar (placeholder sementara)

Kartu destinasi memakai foto asli dari Wikimedia Commons. **Status: placeholder
sementara — wajib diganti foto milik sendiri/berlisensi sebelum rilis**, karena
kedua file berlisensi **CC BY-SA 4.0** (atribusi + share-alike).

| Untuk | File Commons | Author | Lisensi | Ukuran asli |
| --- | --- | --- | --- | --- |
| Gunung Bromo (Beranda, Detail hero, kartu Jelajah, media komponen) | `Smoking Gunung Bromo sunrise - Indonesia.jpg` | Thomas Fuhrmann | CC BY-SA 4.0 | 5581×3721 |
| Gunung Prau (Beranda, kartu Jelajah, media komponen) | `Gunung Prau, Dataran Tinggi Dieng, Wonosobo.jpg` | Faaizul yahya | CC BY-SA 4.0 | 4928×3264 |
| Gunung Papandayan (kartu Jelajah) | `Kabut dan Savana Tegal Alun, Gunung Papandayan, Garut.jpg` | Hugo Rio Aditya | CC BY-SA 4.0 | 5184×3456 |
| **Bukit Moko — stand-in** (kartu Jelajah) | `Tebing Keraton, Bandung, Jawa Barat, Indonesia, 27052017.jpg` | Aswaralif | CC BY-SA 4.0 | 3590×2012 |
| Detail Transport — hero | `Lautan Pasir Bromo.jpg` (jeep di lautan pasir) | Ake Widyastomo Putro | CC BY-SA 4.0 | 4000×2250 |
| Detail Penginapan — hero (stand-in) | `Bromo Cottages Java 462.jpg` | Arabsalam | CC BY-SA 4.0 | 2592×1944 |
| Detail Makanan — hero (stand-in) | `Warung Makan Sederhana Jl.Mangga Kebumen 2.jpg` | SATELIT BM | CC BY-SA 4.0 | 2560×1440 |

> **Penting:** Commons **tidak memiliki** foto Bukit Moko. Kartu Bukit Moko memakai
> foto Tebing Keraton (kawasan Cimenyan/Dago Pakar, satu punggung bukit dan akses
> yang sama) sebagai **stand-in**. Ganti dengan foto Bukit Moko asli saat foto
> sendiri sudah tersedia.

- Diambil via `https://commons.wikimedia.org/wiki/Special:FilePath/<Nama_File>?width=1400`
  (server-side resize, ±340–460 KB), dipasang sebagai **IMAGE fill** dengan
  `scaleMode: FILL` pada frame placeholder (`diag-a`/`diag-b` dihapus).
- Tinggi media dinaikkan **140 → 180** (rasio 356×180 ≈ 1,98:1) agar crop foto
  (sumber 1,5:1) tidak memotong subjek secara berlebihan.
- Cara impor (karena `figma-cli create image` di file ini lapor sukses tapi tidak
  membuat node): unduh dengan `curl` → serve lokal dengan header
  `Access-Control-Allow-Origin: *` → `fetch` + `figma.createImage()` lewat `eval`.
- **Sebaran foto (10 target):** `Ph:bromo`+`Ph:prau` (Beranda), `Ph:hero` (Detail),
  `Ph:l1`–`Ph:l4` (Jelajah), plus media komponen `DestinationCard (Alam)`
  (`Ph:card-v` ← Bromo, `Ph:card-h` ← Prau). Foto Bromo/Prau **dipakai ulang
  lewat `imageHash` yang sama**, jadi tidak ada duplikasi data gambar di file.
- **Peta Detail bukan gambar.** `Ph:map-detail` diganti frame `Map` (358×200) yang
  dirakit dari primitif: 4 garis grid `border-strong`, 3 pin, kontrol zoom
  in/out + recenter, dan chip label "Cemoro Lawang". Bebas lisensi, tanpa aset
  eksternal.

---

## 15. Verifikasi

- `verify --measure`: 57 layar — 11 layar awal (Beranda 390×1866 … Detail
  Makanan 390×986) + 46 layar lanjutan: Onboarding 390×888, Masuk dan Daftar
  390×844, Lupa Kata Sandi 390×340, Verifikasi OTP 390×844, Ubah Kata Sandi
  390×468, Profil 390×996, Pengaturan 390×741, Akun 390×642, Setelan Notifikasi
  390×467, Tema dan Bahasa 390×467, Privasi dan Keamanan 390×588, Bantuan FAQ
  390×641, Kirim Masukan 390×508, Edit Profil 390×737, Keluar Konfirmasi
  390×844, Buat Rencana Baru 390×476, Pilih Destinasi 390×524, Pilih Fasilitas
  390×444, Detail Item Rencana 390×483, Konfirmasi Hapus Item 390×844, Rencana
  Sukses 390×844, Tambah Rencana - Pilih 390×420, Tambah Rencana - Atur
  390×660, Tambah Item Checklist 390×844, Checklist Selesai 390×844, Usulkan
  Fasilitas 390×732, Usulan Sukses 390×844, Pencarian Rekomendasi 390×844,
  Pencarian Hasil 390×844, Pencarian Kosong 390×844, Filter Dialog 390×844,
  Notifikasi 390×844, Destinasi
  Tersimpan 390×844, Destinasi Tersimpan Kosong 390×844, Daftar Rencana
  390×844, Daftar Rencana Kosong 390×844, Checklist Tersimpan 390×844,
  Checklist Tersimpan Kosong 390×844, Fasilitas Diusulkan 390×844, Fasilitas
  Diusulkan Kosong 390×844, Error Form 390×1064, Empty State 390×1412,
  Error dan Akses State 390×1124, Gagal Memuat Beranda 390×844, Gagal Memuat
  Katalog 390×844, Gagal Memuat AI 390×844; tinggi tiap frame = jumlah tinggi
  anak + gap.
- Audit 3 layar Gagal Memuat per layar (batch 11b): fill ter-bind 63 / raw 0;
  stroke ter-bind 42 / raw 0; 0 node collapse; 13 teks memakai text style,
  19 label eksplisit.
- Audit 3 layar Error & Empty State (batch 11): fill ter-bind 108 / raw 0;
  stroke ter-bind 74 / raw 0; 0 node collapse; 32 teks memakai text style,
  32 label/ukuran eksplisit (judul kartu 16 semibold, body kartu 13).
- Audit 8 layar Tersimpan/empty state (batch 10): fill ter-bind 106 / raw 0;
  stroke ter-bind 62 / raw 0; 0 node collapse; 37 teks memakai text style,
  15 label emphasis eksplisit.
- Audit pencarian/filter/notifikasi (batch 9 revisi): 5 layar — Rekomendasi,
  Hasil, Kosong, Filter Dialog, Notifikasi. Aggregate fill ter-bind 172 / raw 0;
  stroke ter-bind 119 / raw 0; 0 node collapse; 66 teks memakai text style,
  25 label emphasis eksplisit. `Filter dan Urutkan` (layar penuh) dihapus,
  digantikan `BottomSheet (Alam)` Filter.
- Audit 4 layar Checklist & Usulan (batch 8): fill ter-bind 70 / raw 0; stroke
  ter-bind 24 / raw 0; 0 node collapse; 30 teks memakai text style, 12 label
  emphasis eksplisit.
- Audit 8 layar Rencana CRUD (batch 7): fill ter-bind 153 / raw 0; stroke
  ter-bind 89 / raw 0; 0 node collapse; 49 teks memakai text style, 29 label
  emphasis eksplisit.
- Audit 10 layar Profil & Pengaturan (batch 6): fill ter-bind 288 / raw 0;
  stroke ter-bind 169 / raw 0; 0 node collapse (vektor degenerat di dalam
  ikon Lucide `info`/`smartphone` diganti `file-text`/`monitor-smartphone`);
  98 teks memakai text style, 28 label emphasis eksplisit.
- Audit 5 layar auth (batch 5): fill ter-bind 75 / raw 0; stroke ter-bind 33 /
  raw 0; 0 node collapse; 28 teks memakai text style, 15 label emphasis eksplisit;
  semua label kontrol kecil (CTA/tab/divider) rata tengah, teks input tetap
  `LEFT`.
- Audit page (11 layar): **IMAGE fill 10**; fill ter-bind 294 / raw 0; stroke raw 0;
  0 node collapse; 245 teks memakai text style; 154 label emphasis Inter Semi
  Bold/Medium eksplisit; 0 em-dash; 0 baris multi middle-dot. Empat belas teks
  yang terdeteksi "uncentered" semuanya memang tidak di tengah: 11 judul AppBar,
  placeholder `Input`, dan 3 nilai kontak yang sengaja rata kanan.
- Cek pixel: hero Detail 3952 warna unik (foto Bromo), kartu Jelajah 467–719
  warna unik (foto), area peta 64 warna (struktur grid/pin, bukan foto).
- Cek warna section baru: band CTA `#1E3B2E`, tombol CTA `#F4F1E9`, kartu
  bantuan & kartu rail `#E8E4D8`; rail `clip` menampilkan 1 kartu penuh + kartu
  ke-2 sebagian (petunjuk scroll).
- Cek warna hasil export: header pine `#1E3B2E`, kartu AI `#1E3B2E`, bulatan AI
  dan CTA `#B85C2A`, kartu `#E8E4D8`.
- Cek area media: ratusan warna unik (bukan X placeholder lagi) di kedua kartu.
- BottomNav: 5 item 73×41, hanya tab aktif yang indikatornya `primary`, semua
  label center (`cx` = `itemCenter`).

Seluruh **50 layar lo-fi mobile** tercakup sebagai **51 frame hi-fi** (pencarian
jadi satu halaman + filter jadi bottom sheet). Langkah berikutnya adalah hi-fi
**web** (landing + dashboard) memakai token & komponen yang sama.

## 16. Prototype wiring (Figma)

Page `Hi-Fi (Mobile)` dihubungkan sebagai prototipe klik-saja (bukan sekadar
galeri frame statis). Ditulis lewat Figma Plugin API (`node.setReactionsAsync`),
karena `figma-cli` tidak punya perintah tulis untuk reactions.

- **Flow starting point:** `Hi-Fi - Onboarding (Mobile)` (`80:74`), nama
  `Flow 1` (flow utama). `Flow 2` pada `Hi-Fi - Filter Dialog (Mobile)`
  (`86:2485`) dipertahankan dari sebelumnya.
- **Transisi:** `DISSOLVE` 300ms, easing `EASE_OUT`, untuk setiap navigasi.
- **Cakupan:** alur inti (auth → beranda → detail → AI → rencana → checklist)
  plus tombol kembali, overlay, dan keyboard login. Hasil: **215 hotspot di 44
  frame**, tanpa destinasi dangling.

Rincian jenis aksi:

| Jenis | Jumlah | Catatan |
| --- | --- | --- |
| `NAVIGATE` | 141 | pindah layar penuh (tab, kartu, CTA, baris menu) |
| `OVERLAY` | 9 | dialog/sheet di atas layar sumber |
| `BACK` | 27 | ikon panah di AppBar (auto-deteksi `lucide:arrow-left` / `lucide:chevron-left`) |
| `CLOSE` | 4 | Batal/Keluar/close pada overlay |

Peta alur inti:

- **Auth:** Onboarding → Masuk; "Lewati" → Beranda. Masuk → Beranda,
  "Lupa kata sandi?" → Lupa, tab/footer "Daftar" → Verifikasi OTP.
  Lupa → OTP, OTP → Beranda, Ubah Kata Sandi → Masuk.
- **Beranda:** search → Pencarian Rekomendasi; kartu AI → AI Preferensi;
  bell → Notifikasi; avatar → Profil; kartu destinasi → Detail Destinasi;
  "Lihat semua" → Jelajah; rail fasilitas → Detail Fasilitas; BottomNav 5 tab.
- **Detail Destinasi:** "Checklist" → Checklist Persiapan; "Tambah ke rencana"
  → overlay Tambah Rencana - Pilih; support → Fasilitas Sekitar.
- **AI:** Preferensi → Hasil; Hasil → Preferensi / Detail / Rencana.
- **Rencana & Checklist:** Rencana ↔ Pilih Destinasi / Fasilitas / Detail Item /
  Sukses; Checklist → Tambah Item / Selesai; Tambah Rencana - Pilih → Pilih
  Destinasi / Fasilitas / Buat Rencana Baru.
- **Pencarian:** satu alur (Rekomendasi → Hasil) dengan filter sebagai overlay;
  kartu → Detail Destinasi.

Overlay memakai posisi default frame tujuan (`overlayPositionType = CENTER`)
karena properti itu read-only di Plugin API. Dialog penuh (Keluar, Hapus Item,
Filter) tampil pas; sheet `Tambah Rencana - Pilih` (420px) muncul di tengah.
Untuk menaruhnya di bawah, geser manual di panel Prototype Figma.

Node hotspot == elemen yang terlihat (kartu, baris, tombol, ikon AppBar), jadi
bukan wrapper section. Wiring belum menyertakan `SCROLL_TO`, perubahan state
(tab aktif/segment), atau perubahan variabel tema.

### 16.1 Login interaktif (keyboard on-screen + validasi)

Login di `Hi-Fi - Masuk dan Daftar (Mobile)` (`80:96`) memakai **Variables +
Expressions** Figma (advanced prototyping, butuh plan berbayar), jadi bisa
benar-benar di-ketik dan divalidasi.

- Koleksi variabel **`Prototype Input`**: string `email`, `password`,
  `emailPrev`, `passwordPrev`, `focus` (`none`/`email`/`password`); boolean
  `kbVisible`.
- Teks field Email (`80:113`) dan Kata sandi (`80:115`) di-bind ke variabel
  `characters`, jadi menampilkan isi variabel.
- **Keyboard on-screen** (`OnScreenKeyboard`) di dalam frame, `layoutPositioning
  = ABSOLUTE` di `y=612`, awalnya tersembunyi lewat binding `visible` ke
  `kbVisible`. Isi: 26 huruf, `@`, `.`, `spasi`, `Hapus`, tombol `Selesai`.
- Tap field Email/Kata sandi → set `focus` + tampilkan keyboard. Tiap tombol →
  `SET_VARIABLE` dengan **expression `ADDITION`** (`email = email + "x"`),
  diarahkan ke field sesuai `focus` (via `CONDITIONAL`).
- `Hapus` = undo satu langkah (memakai `emailPrev`/`passwordPrev`); belum
  backspace per karakter.
- **Validasi `Masuk`** (`80:127`) memakai `CONDITIONAL` +
  `AND(EQUALS(email,"user@mail.com"), EQUALS(password,"useruser"))`:
  cocok → Beranda `56:9996`; selain itu → `Hi-Fi - Masuk - Error (Mobile)`
  `104:409`.
- `Selesai` menyembunyikan keyboard (`kbVisible=false`, `focus=none`).

**Kredensial demo:** `user@mail.com` / `useruser`.
**Batasan:** advanced prototyping butuh plan berbayar; backspace 1 langkah;
field kosong tanpa placeholder.
