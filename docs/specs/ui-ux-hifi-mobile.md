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

## 9. Gambar (placeholder sementara)

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

## 10. Verifikasi

- `verify --measure`: 26 layar — Beranda 390×1866, Detail Destinasi 390×1425,
  Jelajah 390×763, AI Preferensi 390×1210, AI Hasil 390×1056, Rencana 390×1045,
  Checklist 390×736, Fasilitas Sekitar 390×630, Detail Penginapan 390×1012,
  Detail Transport 390×1032, Detail Makanan 390×986, Onboarding 390×888,
  Masuk dan Daftar 390×844, Lupa Kata Sandi 390×340, Verifikasi OTP 390×844,
  Ubah Kata Sandi 390×468, Profil 390×996, Pengaturan 390×741, Akun 390×642,
  Setelan Notifikasi 390×467, Tema dan Bahasa 390×467, Privasi dan Keamanan
  390×588, Bantuan FAQ 390×641, Kirim Masukan 390×508, Edit Profil 390×737,
  Keluar Konfirmasi 390×844; tinggi tiap frame = jumlah tinggi anak + gap.
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

Layar berikutnya menyusul (Pencarian/Filter/Notifikasi, Rencana CRUD,
Checklist & Usulan, Tersimpan/empty state) memakai komponen hi-fi yang sama.
