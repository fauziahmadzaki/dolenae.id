# Form 5 — Observer Sheet (Moderator/Notulis)
## Usability Testing Dolenae.id (Aplikasi Mobile)

> **Spesifikasi Google Forms.** Nama form: `Dolenae.id — Form 5: Lembar Observer`.
> **Diisi oleh observer/notulis, bukan partisipan.** Satu respons = satu partisipan
> (mencakup seluruh task dalam satu sesi).
> Lembar versi cetak tersedia pada `03_scenario_task_dan_naskah_moderator.md` §6.

---

## Bagian 0 — Identitas Sesi

| No | Pertanyaan | Tipe | Opsi | Wajib |
| --- | --- | --- | --- | --- |
| 0.1 | Kode partisipan | Dropdown | P1 … P10 | **Wajib** |
| 0.2 | Segmen | Pilihan ganda | A — Pemula / B — Semi-berpengalaman | **Wajib** |
| 0.3 | Nama observer | Jawaban singkat | — | **Wajib** |
| 0.4 | Tanggal sesi | Tanggal | — | **Wajib** |
| 0.5 | Waktu mulai sesi | Waktu | — | **Wajib** |
| 0.6 | Waktu selesai sesi | Waktu | — | **Wajib** |
| 0.7 | Lokasi sesi | Pilihan ganda | Tatap muka / Daring | **Wajib** |
| 0.8 | Perangkat uji | Jawaban singkat | — | **Wajib** |
| 0.9 | Ukuran layar (dp) | Jawaban singkat | — | **Wajib** |
| 0.10 | Versi sistem operasi | Jawaban singkat | — | **Wajib** |
| 0.11 | Pembesaran teks perangkat | Dropdown | 1,0× / 1,15× / 1,3× / 1,5× / Lainnya | **Wajib** |
| 0.12 | Kondisi jaringan | Pilihan ganda | Normal / Lambat / Terputus | **Wajib** |
| 0.13 | Build/versi aplikasi | Jawaban singkat | — | **Wajib** |
| 0.14 | Modalitas bantuan tersedia? | Pilihan ganda | Tidak ada / Deep link sementara / Build khusus | **Wajib** |

---

## Bagian Task — struktur identik untuk T1 … T7

> Salin blok berikut **7 kali** (satu per task), ganti kode task di judul bagian.

**Judul bagian:** `Task T1` … `Task T7`

| No | Pertanyaan | Tipe | Opsi / Skala | Wajib |
| --- | --- | --- | --- | --- |
| 1 | Hasil task | Pilihan ganda | `Sukses tanpa bantuan` / `Sukses dengan bantuan` / `Gagal` / `Tidak dijalankan` | **Wajib** |
| 2 | Kategori kegagalan (jika gagal) | Pilihan ganda | `Penemuan (tidak ditemukan)` / `Pemahaman (salah paham)` / `Affordance (tidak merespons)` / `Kesalahan data/konteks` / `Aksesibilitas` / `Menyerah karena waktu` / `Tidak relevan` | Tidak |
| 3 | Waktu penyelesaian (mm:ss) | Jawaban singkat | — | **Wajib** |
| 4 | Apakah batas waktu terlampaui? | Pilihan ganda | Tidak / Ya | **Wajib** |
| 5 | Jumlah error (salah ketuk/pilih/input) | Jawaban singkat (angka) | — | **Wajib** |
| 6 | Jumlah dead click (ketukan tanpa efek) | Jawaban singkat (angka) | — | **Wajib** |
| 7 | Jumlah back-step (langkah mundur) | Jawaban singkat (angka) | — | **Wajib** |
| 8 | Jumlah rage tap (ketukan berulang <2 detik) | Jawaban singkat (angka) | — | **Wajib** |
| 9 | Gesture ragu yang diamati | Kotak centang | `Mengetuk berulang` / `Menggulir bolak-balik` / `Menggeser tanpa tujuan` / `Mengangkat jari tanpa mengetuk` / `Berhenti lama (>15 detik)` / `Tidak ada` | **Wajib** |
| 10 | Bantuan yang diberikan moderator | Pilihan ganda | `Tidak ada` / `Mengulang skenario` / `Mengarahkan lokasi` / `Menunjukkan langkah` / `Menghentikan task` | **Wajib** |
| 11 | Kutipan think-aloud (verbatim, maks. 3) | Paragraf | — | Tidak |
| 12 | Hipotesis yang terkonfirmasi/terbantah | Kotak centang | `HYP-01 … HYP-34` (daftar) / `Tidak ada` | Tidak |
| 13 | Catatan tambahan observer | Paragraf | — | Tidak |

---

## Bagian Penutup — Ringkasan Sesi

| No | Pertanyaan | Tipe | Opsi / Skala | Wajib |
| --- | --- | --- | --- | --- |
| R1 | Momen paling menonjol (positif) | Paragraf | — | **Wajib** |
| R2 | Momen paling menonjol (negatif) | Paragraf | — | **Wajib** |
| R3 | Elemen yang paling sering dicari tetapi tidak ditemukan | Paragraf | — | Tidak |
| R4 | Bagian yang paling sering memicu ketukan berulang | Paragraf | — | Tidak |
| R5 | Apakah partisipan menyadari data yang tidak sesuai kenyataan? | Pilihan ganda | `Tidak` / `Ya, menyadari` / `Ya, dan terganggu` | **Wajib** |
| R6 | Apakah partisipan menutup/meninggalkan aplikasi? | Pilihan ganda | `Tidak` / `Ya, pada task: ____` | **Wajib** |
| R7 | Jumlah intervensi moderator total | Jawaban singkat (angka) | — | **Wajib** |
| R8 | Gangguan teknis (crash, lag, tata letak rusak) | Paragraf | — | Tidak |
| R9 | Hipotesis baru yang belum ada di daftar | Paragraf | — | Tidak |
| R10 | Cuplikan layar/rekaman terkait | Jawaban singkat (ID berkas) | — | Tidak |

---

## Bagian Heuristik Cepat (diisi setelah sesi)

**Deskripsi bagian:** *"Penilaian cepat observer per aspek (1 = buruk, 2 = cukup, 3 = baik)."*

| No | Aspek | Skala | Wajib |
| --- | --- | --- | --- |
| H1 | Umpan balik status sistem (apakah aksi terlihat berhasil) | 1–3 | **Wajib** |
| H2 | Kesesuaian istilah dengan bahasa pengguna | 1–3 | **Wajib** |
| H3 | Kebebasan dan kendali pengguna (batal, kembali, urungkan) | 1–3 | **Wajib** |
| H4 | Konsistensi dan standar antarmuka | 1–3 | **Wajib** |
| H5 | Pencegahan error | 1–3 | **Wajib** |
| H6 | Pengenalan daripada mengingat | 1–3 | **Wajib** |
| H7 | Efisiensi penggunaan | 1–3 | **Wajib** |
| H8 | Estetika dan kesederhanaan tampilan | 1–3 | **Wajib** |
| H9 | Pemulihan dari error | 1–3 | **Wajib** |
| H10 | Ukuran target sentuh dan jarak antar-elemen | 1–3 | **Wajib** |
| H11 | Aksesibilitas (label, kontras, pembesaran teks) | 1–3 | **Wajib** |
| H12 | Kepercayaan terhadap data yang ditampilkan | 1–3 | **Wajib** |

---

## Lembar koding kualitatif (tidak di Google Forms)

> Digunakan setelah sesi untuk mengelompokkan kutipan ke tema. Berkas terpisah atau
> spreadsheet.

| Kode kutipan | Partisipan | Task | Kutipan | Tema | HYP |
| --- | --- | --- | --- | --- | --- |
| Q-01 | | | | Penemuan / Pemahaman / Affordance / Aksesibilitas / Kepercayaan / Navigasi | |
| … | | | | | |

**Tema pengodean yang disarankan:**
1. Penemuan (discoverability)
2. Pemahaman konten & konteks
3. Affordance menyesatkan
4. Kehilangan hasil kerja
5. Navigasi & kembali
6. Aksesibilitas
7. Kepercayaan & kecepatan

---

## Rumus rekap untuk Google Sheets

```
# TCR per task (mis. kolom "Hasil task" = D, baris 2..11)
=COUNTIF(D2:D11,"Sukses tanpa bantuan")/COUNTA(D2:D11)*100

# Assisted completion rate per task
=COUNTIF(D2:D11,"Sukses dengan bantuan")/COUNTA(D2:D11)*100

# Median ToT (mis. kolom waktu dalam detik = E)
=MEDIAN(E2:E11)

# Rata-rata error, dead click, back-step, rage tap
=AVERAGE(F2:F11)
=AVERAGE(G2:G11)
=AVERAGE(H2:H11)
=AVERAGE(I2:I11)

# Total dead click seluruh sesi
=SUM(G2:G11)

# Persentase sesi dengan minimal satu rage tap
=COUNTIF(I2:I11,">0")/COUNTA(I2:I11)*100
```

> **Catatan:** waktu ToT sebaiknya dicatat dalam **detik** agar mudah dihitung. Bila
> dicatat dalam format mm:ss, tambahkan kolom bantu konversi:
> `=VALUE(LEFT(E2,2))*60+VALUE(RIGHT(E2,2))`.
