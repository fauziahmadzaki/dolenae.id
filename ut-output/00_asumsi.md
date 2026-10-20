# 00 — Asumsi, Batasan, dan Daftar Konfirmasi Manusia

Dokumen ini mencatat **seluruh asumsi** yang dipakai saat menyusun rencana Usability
Testing (UT) Dolenae.id versi mobile. Semua bagian yang belum dapat diverifikasi dari
kode ditandai eksplisit. Tidak ada satu pun file source code yang diubah dalam
penyusunan dokumen ini.

---

## 1. Ruang lingkup dan sumber data

| Aspek | Nilai | Status |
| --- | --- | --- |
| Platform yang diuji | **Aplikasi mobile Flutter** (`apps/mobile`) | Sesuai arahan pengguna |
| Versi aplikasi | Prototype statis berbasis `SeedData` + `DestinationsState` (offline-first) | Terverifikasi dari kode |
| Basis audit | Pembacaan statis seluruh `apps/mobile/lib` (100 file Dart) | Terverifikasi |
| Basis desain | `DESIGN.md` (tema "Alam") + tema implementasi `app/theme/*.dart` | Terverifikasi |
| Dokumen acuan format | `docs/laporan/Laporan-DesainUIUX-VTK50017.docx` (BAB 1–8 + Lampiran) | Terverifikasi |
| Data lapangan | **Belum ada** — seluruh angka hasil UT berupa placeholder | Sesuai ketentuan |

### 1.1 Konsistensi dokumen desain vs implementasi
`docs/laporan/Laporan-DesainUIUX-VTK50017.docx` mencantumkan Figma
(`UI-UX-Dolenae.id`, node 328-6084) dan daftar persona (Dimas Pratama — wisatawan
pemula; Rian Kusuma — *semi-experienced backpacker*). Rencana UT ini memakai konteks
tersebut, namun **audit teknis dikerjakan terhadap kode Flutter**, bukan terhadap
kanvas Figma.

> **A-01 (perlu konfirmasi):** apakah penguji ingin audit visual tambahan terhadap
> frame Figma (via `figma-cli`)? Jika ya, diperlukan link/file Figma agar
> perbandingan desain ↔ implementasi dapat dibuat. Saat ini tidak dapat dilakukan
> dan tidak menjadi dasar hipotesis.

> **A-02:** ditemukan **inkonsistensi** antara laporan desain dan kode aplikasi.
> Laporan menulis tagline "Discovering More, Prepare Better", sedangkan
> `docs/prd/product-overview.md` menulis "Discover More, Prepare Better". Pada UT,
> gunakan istilah produk yang disetujui tim.

---

## 2. Asumsi metode

| Kode | Asumsi | Dampak jika salah |
| --- | --- | --- |
| A-03 | UT **moderated**, *think-aloud*, tatap muka atau remote video call | Naskah moderator perlu disesuaikan untuk unmoderated |
| A-04 | Perangkat uji: **Android fisik 360–412 dp** (minimal 1 unit 360 dp dan 1 unit *low-end*) | Temuan overflow pada layar kecil (HYP-05, HYP-33) tidak dapat divalidasi |
| A-05 | Ukuran teks sistem **1.0×** (kecuali pada task aksesibilitas opsional) | Temuan `textScaler` (HYP-12) tidak terukur |
| A-06 | Sesi per partisipan ±60 menit (7 task) | Jika 45 menit, T6/T7 dijadikan opsional |
| A-07 | Partisipan memakai **akun ter-seed**, layar login hanya untuk pengamatan awal | Jika login wajib manual, server Hono (`http://10.0.2.2:3001/api`) harus hidup — lihat HYP-34 |
| A-08 | Aplikasi dibangun sebagai **debug/release build stabil**, bukan hot-reload | — |
| A-09 | Rekaman layar + audio diizinkan partisipan; tidak ada PII tersimpan | Etika & consent perlu ditinjau |
| A-10 | Sinyal jaringan **dinormalisasi baik** pada sesi utama; skenario offline diuji terpisah (T6) | Temuan ketahanan offline tidak terukur |

---

## 3. Asumsi konten & alur (turunan kode)

| Kode | Asumsi | Bukti |
| --- | --- | --- |
| A-11 | Beberapa screen tidak memiliki pintu masuk UI dan hanya dapat dibuka via *deep link*. Untuk UT, fasilitator menyiapkan **jalur sementara** (shortcut/deep link) agar task tetap dapat dijalankan. | `HYP-04` (orphan route) |
| A-12 | Karena `SeedData` memuat data contoh, partisipan dapat melihat "data palsu" pada sebagian layar. Ini **tetap diuji** karena termasuk hipotesis bottleneck (`HYP-24`), tetapi dicatat sebagai artefak prototype, bukan cacat desain. | Seluruh `data/seed/seed_data.dart` |
| A-13 | Fitur yang belum berfungsi (AI provider, unggah foto, peta interaktif, WhatsApp) diuji sebagai **task yang memang ditujukan untuk gagal**, untuk mengukur persepsi dan pemulihan, bukan fungsionalitas. | `HYP-06`, `HYP-08`, `HYP-15` |
| A-14 | Baseline V1 belum tersedia; seluruh kolom baseline diisi `[BELUM ADA DATA]`. | Permintaan pengguna |
| A-15 | Target V2 bersifat **usulan**, ditandai "(usulan)". | Permintaan pengguna |
| A-16 | Rekrutmen minimal **5 partisipan/segmen**, dengan **2 segmen persona** (pemula & semi-berpengalaman) → minimal 10 partisipan. | Template BAB 8 + permintaan pengguna |

---

## 4. Asumsi tooling

| Kode | Asumsi | Catatan |
| --- | --- | --- |
| A-17 | Repository **belum memiliki** instrumentasi analytics/heatmap (grep `connectivity`, `analytics`, `firebase`, `sentry` = 0 hasil). | Lihat `05_rencana_instrumentasi_heatmap.md` |
| A-18 | Usulan tool heatmap: **Microsoft Clarity / PostHog (web-dashboard)** untuk versi web; **UXCam** untuk mobile; **Smartlook/Firebase + BigQuery** sebagai alternatif mobile. | Perlu keputusan manusia |
| A-19 | Google Forms dipakai untuk instrumen; Apps Script disediakan sebagai *helper* pembuatan otomatis. | Lihat `forms/apps-script/create_forms.gs` |
| A-20 | Untuk menghitung SUS, gunakan rumus standar (ganjil = nilai−1; genap = 5−nilai; jumlah × 2,5). | `forms/form_3_SUS.md` |

---

## 5. Asumsi etika & legal

| Kode | Asumsi |
| --- | --- |
| A-21 | Informed consent tertulis (Google Form) sebelum sesi; partisipan berhak berhenti kapan saja. |
| A-22 | Data yang direkam bersifat anonim; nama partisipan diganti kode (P1, P2, …). |
| A-23 | Rekaman dihapus maksimal 6 bulan setelah laporan diserahkan, kecuali disetujui lain. |
| A-24 | Tidak ada insentif yang menimbulkan *undue influence*; insentif/ucapan terima kasih dicatat transparan. |

---

## 6. Daftar hal wajib dikonfirmasi manusia sebelum UT dijalankan

| No | Pertanyaan konfirmasi | Mengapa penting |
| --- | --- | --- |
| K-1 | Apakah tersedia akses **Figma** untuk audit visual pendamping? | Menentukan kelengkapan audit desain (A-01) |
| K-2 | Apakah UT **moderated** atau **unmoderated**? | Menyesuaikan naskah moderator & observer sheet (A-03) |
| K-3 | Perangkat & OS yang akan dipakai (Android/iOS, ukuran layar, versi OS) | Menentukan validitas temuan target sentuh & overflow (A-04) |
| K-4 | Apakah diperbolehkan menyiapkan **build khusus** dengan pintu masuk sementara ke layar *orphan* (Notifikasi, Tersimpan, Settings)? | Tanpa itu, task T2/T5/T7 tidak dapat dijalankan (A-11, HYP-04) |
| K-5 | Apakah server API (`apps/server`) akan dijalankan & stabil selama sesi? | Menentukan validitas HYP-06/HYP-34 (login & katalog) |
| K-6 | Berapa jumlah partisipan final dan apakah 2 segmen persona dipakai? | Menentukan ukuran sampel & rekrutmen (A-16) |
| K-7 | Tool heatmap mana yang dipilih, dan apakah akan diinstrumentasi sebelum UT? | Menentukan apakah heatmap bisa dipakai sebagai triangulasi (A-17/A-18) |
| K-8 | Apakah tim setuju dengan **target V2 usulan** (TCR ≥85%, SUS ≥75, SEQ ≥5,5)? | Menentukan definisi keberhasilan redesain (A-15) |
| K-9 | Insentif & durasi sesi final | Etika & kenyamanan partisipan |
| K-10 | Siapa yang akan menjadi moderator, observer, dan notulis? | Kualitas pengumpulan data |

---

## 7. Catatan kepatuhan pada ketentuan tugas

- [x] Tidak ada satu pun file source code yang diubah.
- [x] Tidak ada angka hasil UT yang dikarang; semua berupa `[ISI DARI HASIL UT]` / `[BELUM ADA DATA]`.
- [x] Setiap hipotesis dan task merujuk path di codebase.
- [x] Scenario task tidak menyebut label tombol, ikon, atau lokasi elemen UI.
- [x] Form SUS berisi tepat 10 pernyataan dengan pola positif–negatif bergantian.
- [x] Laporan memuat matriks HEART, tabel severity, dan rencana validasi V1→V2.
