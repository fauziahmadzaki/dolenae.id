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

Struktur Beranda (7 section, `gap 12`, bg `canvas`):

| Section | Tinggi | Isi |
| --- | --- | --- |
| Header | 56 | **bar `primary` (pine)**: logo + nama `on-primary`; bell dalam bulatan `primary-hover`; avatar `canvas` dengan inisial `primary` |
| Search | 90 | heading `display-md` "Mau ke mana?"; field `canvas-subtle` 48px + tombol filter 32px |
| Chips | 34 | kategori; chip pertama state **aktif** (`primary`), lain `canvas-subtle` |
| AI | 180 | **kartu `primary` (pine)** + `shadow/md`: bulatan `accent` + sparkles, eyebrow `overline`, judul `on-primary`, body `canvas-subtle`, CTA `accent` full-width 44px |
| Popular | 616 | header seksi + "Lihat semua"; 2 kartu `canvas-subtle` + `shadow/sm`, media **356×180** berisi foto (lihat §3) |
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

## 3. Gambar (placeholder sementara)

Kartu destinasi memakai foto asli dari Wikimedia Commons. **Status: placeholder
sementara — wajib diganti foto milik sendiri/berlisensi sebelum rilis**, karena
kedua file berlisensi **CC BY-SA 4.0** (atribusi + share-alike).

| Kartu | File Commons | Author | Lisensi | Ukuran asli |
| --- | --- | --- | --- | --- |
| Gunung Bromo | `Smoking Gunung Bromo sunrise - Indonesia.jpg` | Thomas Fuhrmann | CC BY-SA 4.0 | 5581×3721 |
| Gunung Prau | `Gunung Prau, Dataran Tinggi Dieng, Wonosobo.jpg` | Faaizul yahya | CC BY-SA 4.0 | 4928×3264 |

- Diambil via `https://commons.wikimedia.org/wiki/Special:FilePath/<Nama_File>?width=1400`
  (server-side resize, ±340–460 KB), dipasang sebagai **IMAGE fill** dengan
  `scaleMode: FILL` pada frame placeholder (`diag-a`/`diag-b` dihapus).
- Tinggi media dinaikkan **140 → 180** (rasio 356×180 ≈ 1,98:1) agar crop foto
  (sumber 1,5:1) tidak memotong subjek secara berlebihan.
- Cara impor (karena `figma-cli create image` di file ini lapor sukses tapi tidak
  membuat node): unduh dengan `curl` → serve lokal dengan header
  `Access-Control-Allow-Origin: *` → `fetch` + `figma.createImage()` lewat `eval`.
- Komponen `DestinationCard (Alam)` belum ikut (media masih 320×160, placeholder
  X); propagasi menyusul.

---

## 4. Verifikasi

- `verify --measure`: 390×1866; tinggi frame = jumlah tinggi anak + gap.
- Audit: IMAGE fill 2; fill ter-bind 45 / raw 0; stroke raw 0; 0 node collapse;
  0 teks salah rata; 43 teks memakai text style; 15 label emphasis Inter Semi
  Bold/Medium eksplisit; 0 em-dash; 0 baris multi middle-dot.
- Cek warna section baru: band CTA `#1E3B2E`, tombol CTA `#F4F1E9`, kartu
  bantuan & kartu rail `#E8E4D8`; rail `clip` menampilkan 1 kartu penuh + kartu
  ke-2 sebagian (petunjuk scroll).
- Cek warna hasil export: header pine `#1E3B2E`, kartu AI `#1E3B2E`, bulatan AI
  dan CTA `#B85C2A`, kartu `#E8E4D8`.
- Cek area media: ratusan warna unik (bukan X placeholder lagi) di kedua kartu.
- BottomNav: 5 item 73×41, hanya tab aktif yang indikatornya `primary`, semua
  label center (`cx` = `itemCenter`).

Layar berikutnya menyusul (Detail Destinasi, Jelajah, AI, Rencana, Checklist,
Fasilitas Sekitar, Profil) memakai komponen hi-fi yang sama.
