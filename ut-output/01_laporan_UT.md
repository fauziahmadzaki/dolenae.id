# LAPORAN USABILITY TESTING
## Aplikasi Mobile Dolenae.id

**Dokumen ini memiliki dua status isi yang dibedakan secara eksplisit:**

| Penanda | Arti |
| --- | --- |
| 🟢 **[TERISI DARI KODE]** | Bagian yang sudah terisi berdasarkan audit statis kode aplikasi mobile di `apps/mobile/lib` |
| 🔴 **[MENUNGGU DATA LAPANGAN]** | Bagian yang masih berupa placeholder `[ISI DARI HASIL UT]` dan wajib diisi setelah sesi UT |

> **Tidak ada satu pun angka hasil UT di dokumen ini.** Seluruh nilai hasil berupa
> placeholder. Tidak ada file source code yang diubah dalam penyusunan laporan ini.

---

## DAFTAR ISI

| Bagian | Judul |
| --- | --- |
| — | Halaman Judul & Ringkasan Eksekutif |
| BAB 1 | Latar Belakang dan Tujuan |
| BAB 2 | Gambaran Aplikasi dan Ruang Lingkup |
| BAB 3 | Metodologi Usability Testing |
| BAB 4 | Scenario Task dan Kriteria Sukses |
| BAB 5 | Kerangka Metrik HEART + GSM |
| BAB 6 | Hasil Audit Pra-UT: Hipotesis Bottleneck |
| BAB 7 | Hasil Usability Testing (Template) |
| BAB 8 | Analisis Bottleneck |
| BAB 9 | Tabel Prioritas Temuan |
| BAB 10 | Matriks Prioritas Redesain dan Rekomendasi V2 |
| BAB 11 | Rencana Validasi V2 |
| BAB 12 | Keterbatasan, Asumsi, dan Lampiran |

## DAFTAR TABEL

| No | Judul | Status |
| --- | --- | --- |
| Tabel 1 | Spesifikasi perangkat & lingkungan uji | 🔴 menunggu konfirmasi |
| Tabel 2 | Kriteria rekrutmen partisipan | 🟢 dari konteks produk |
| Tabel 3 | Ringkasan scenario task | 🟢 dari kode |
| Tabel 4 | Matriks HEART + GSM | 🟢 dari kode + target usulan |
| Tabel 5 | Sebaran hipotesis bottleneck per severity | 🟢 dari kode |
| Tabel 6 | Hasil TCR & ToT per task | 🔴 `[ISI DARI HASIL UT]` |
| Tabel 7 | Perhitungan SUS per partisipan | 🔴 `[ISI DARI HASIL UT]` |
| Tabel 8 | Ringkasan heatmap per layar kritis | 🔴 `[ISI DARI HASIL UT]` |
| Tabel 9 | Tabel prioritas temuan | 🟢 kolom temuan dari kode; severity final menunggu UT |
| Tabel 10 | Matriks prioritas redesain | 🟡 sebagian usulan |
| Tabel 11 | Rencana validasi V1 → V2 | 🟡 usulan |
| Tabel 12 | Instrumen penelitian | 🟢 dari kode |

## DAFTAR GAMBAR

| No | Judul | Status |
| --- | --- | --- |
| Gambar 1 | Alur pengguna aplikasi mobile (dari route & navigasi) | 🟢 dari kode |
| Gambar 2 | Peta layar tanpa pintu masuk UI (*orphan route*) | 🟢 dari kode |
| Gambar 3 | Diagram funnel penemuan → persiapan | 🔴 menunggu data |
| Gambar 4 | Heatmap layar kritis | 🔴 menunggu instrumentasi |

---

# RINGKASAN EKSEKUTIF

Aplikasi mobile Dolenae.id adalah produk pada fase **prototype** yang bertujuan
membantu wisatawan menemukan destinasi alam Indonesia dan mempersiapkan perjalanan
(*Discover More, Prepare Better*). Laporan ini menyajikan rencana dan kerangka
Usability Testing (UT) lengkap, sekaligus **hasil audit pra-UT terhadap kode** yang
menghasilkan **34 hipotesis bottleneck**.

**Temuan utama audit pra-UT (dari kode):**
1. **Delapan tujuan utama tidak memiliki pintu masuk antarmuka** (pengaturan,
   notifikasi, daftar tersimpan, status usulan, penyelesaian checklist, lupa kata
   sandi, OTP). **HYP-04.**
2. **Aksi visual paling penting justru tidak terlihat** — sejumlah tombol memakai
   warna latar yang sama dengan latarnya (rasio kontras 1:1). **HYP-01.**
3. **Banyak elemen yang tampak interaktif tidak berfungsi** (kartu, lonceng, peta,
   bookmark, chip, kartu peringatan AI). **HYP-06.**
4. **Hasil kerja pengguna hilang** saat berpindah layar: daftar persiapan tidak
   persisten, item baru tidak pernah masuk daftar, aksi simpan hanya memberi pesan
   semu. **HYP-03, HYP-15.**
5. **Ukuran target sentuh luas berada di bawah ambang 48×48 dp**, sebagian di pojok
   atas di luar jangkauan jempol. **HYP-05.**
6. **Penyaringan dan pengurutan tidak mengubah hasil** meski tampak berfungsi.
   **HYP-07.**

**Rencana UT:** 7 scenario task berbasis tujuan (tanpa menyebut elemen UI), 2 segmen
persona, minimal 5 partisipan per segmen (≥ 10 partisipan), kombinasi data kuantitatif
(TCR, ToT, error rate, SUS, SEQ, CSAT, NPS) dan kualitatif (think-aloud, lembar
observer).

**Target keberhasilan V2 (usulan):** TCR ≥ 85% (referensi ≥ 78%), SUS ≥ 75,
SEQ ≥ 5,5/7, CSAT ≥ 80%, NPS ≥ 20.

**Status:** seluruh angka hasil UT pada BAB 7–10 masih `[ISI DARI HASIL UT]`.

---

# BAB 1 — LATAR BELAKANG DAN TUJUAN

## 1.1 Latar Belakang

🟢 **[TERISI DARI KODE]**

Dolenae.id dikembangkan untuk menjawab permasalahan wisata alam pegunungan Indonesia
yang masih terfragmentasi: informasi destinasi tersebar, estimasi biaya dan
transportasi sulit diperkirakan oleh wisatawan pemula, serta penyusunan perlengkapan
dilakukan tanpa panduan. Produk menyasar fase pengguna **temukan destinasi → pahami
kebutuhan → siapkan kunjungan**, dengan dua platform: aplikasi mobile untuk wisatawan
dan web dashboard untuk admin/merchant (lima pengguna luar).

Pada fase saat ini aplikasi mobile masih berupa **prototype statis** yang mengandalkan
data contoh (`SeedData`) dengan sebagian state bersifat sementara. Kondisi ini membuat
**pengujian kegunaan menjadi krusial** sebelum pengembangan lanjut, karena banyak
keputusan desain masih dapat diubah dengan biaya rendah.

## 1.2 Tujuan

Mengacu pada **ISO 9241-11** yang mendefinisikan kegunaan sebagai sejauh mana sebuah
produk dapat digunakan oleh pengguna tertentu untuk mencapai tujuan tertentu dengan
**efektivitas, efisiensi, dan kepuasan** dalam konteks penggunaan tertentu, maka UT ini
bertujuan:

| No | Tujuan | Dimensi ISO 9241-11 |
| --- | --- | --- |
| 1 | Mengukur tingkat keberhasilan pengguna menyelesaikan 7 tugas utama | **Efektivitas** |
| 2 | Mengukur waktu penyelesaian tugas, jumlah error, dead click, dan back-step | **Efisiensi** |
| 3 | Mengukur kepuasan (SUS, SEQ, CSAT, NPS) dan persepsi kepercayaan | **Kepuasan** |
| 4 | Memvalidasi 34 hipotesis bottleneck hasil audit pra-UT | — |
| 5 | Menyusun prioritas redesain V2 berbasis dampak vs kesulitan teknis | — |

## 1.3 Pertanyaan Penelitian

| Kode | Pertanyaan |
| --- | --- |
| PQ-1 | Apakah pengguna dapat menemukan destinasi yang sesuai kebutuhan tanpa bantuan? |
| PQ-2 | Apakah pengguna dapat menyelesaikan alur persiapan (daftar kebutuhan & rencana) hingga tuntas? |
| PQ-3 | Hambatan apa yang paling sering muncul (penemuan, pemahaman, affordance, aksesibilitas)? |
| PQ-4 | Seberapa puas pengguna terhadap pengalaman keseluruhan, dan bagaimana tingkat kepercayaannya? |
| PQ-5 | Perbaikan mana yang memberikan dampak terbesar dengan usaha paling wajar? |

---

# BAB 2 — GAMBARAN APLIKASI DAN RUANG LINGKUP

## 2.1 Gambaran Aplikasi

🟢 **[TERISI DARI KODE]**

| Item | Keterangan |
| --- | --- |
| Nama produk | Dolenae.id |
| Platform yang diuji | **Aplikasi mobile (Flutter)** — `apps/mobile` |
| Teknologi | Flutter; navigasi `go_router`; state `Provider`/`ChangeNotifier`; cache lokal Drift |
| Backend | Hono API (`apps/server`), base `http://10.0.2.2:3001/api` |
| Sumber data | `SeedData` lokal + overlay API |
| Jumlah layar | 45 layar presentasi pada 17 fitur |
| Jumlah widget bersama | 50 widget `Dn*` |
| Bahasa UI | Bahasa Indonesia |

## 2.2 Ruang Lingkup Pengujian

**Termasuk (in scope):**

| # | Fitur | Alasan |
| --- | --- | --- |
| 1 | Onboarding & masuk | Titik masuk wajib; dinilai berlebihan/dapat dilewati |
| 2 | Beranda | Titik masuk utama dan pusat elemen mati |
| 3 | Jelajah & penyaringan | Inti alur *discovery* |
| 4 | Detail destinasi | Titik keputusan utama |
| 5 | Fasilitas sekitar & detailnya | Bagian "pahami kebutuhan" |
| 6 | Daftar persiapan (checklist) | Bagian "persiapkan kunjungan" |
| 7 | Rencana perjalanan | Alur gabungan paling kompleks |
| 8 | Saran otomatis (AI) | Fitur pembeda produk |
| 9 | Tersimpan | Menyimpan hasil |
| 10 | Profil & pengaturan | Kontrol pengguna |

**Tidak termasuk (out of scope):**

| # | Yang dikecualikan | Alasan |
| --- | --- | --- |
| 1 | Web dashboard admin | Fokus arahan: aplikasi mobile |
| 2 | Alur merchant/admin, verifikasi konten | Bukan peran wisatawan |
| 3 | Fungsionalitas backend/API | UT mengukur kegunaan, bukan kinerja server |
| 4 | Fungsionalitas pembayaran/pemesanan | Bukan ranah produk |
| 5 | Pembacaan layar (screen reader penuh) | Diuji terbatas sebagai observasi aksesibilitas |
| 6 | Kinerja pada perangkat kelas rendah secara khusus | Hanya dicatat sebagai pengamatan tambahan |

## 2.3 Karakteristik Struktur Informasi

🟢 **[TERISI DARI KODE]**

- **Navigasi utama:** 4 tab (Beranda, Jelajah, Rencana, Profil) dengan label teks
  berukuran 11 sp.
- **Kedalaman navigasi:** sebagian besar tujuan berjarak 1–4 langkah dari Beranda;
  alur usulan fasilitas mencapai 5+ langkah.
- **Pintu masuk tidak lengkap:** 8 tujuan tidak dapat dijangkau dari antarmuka
  (**HYP-04**) — hal ini harus diantisipasi dalam desain sesi UT.
- **Kondisi awal:** beberapa layar sudah terisi data contoh; sebagian data bersifat
  tidak nyata (mis. satu destinasi contoh muncul di banyak konteks) (**HYP-14,
  HYP-24**).

---

# BAB 3 — METODOLOGI USABILITY TESTING

## 3.1 Tipe dan Pendekatan

🟡 **[USULAN METODE — perlu konfirmasi]**

| Aspek | Rencana |
| --- | --- |
| Tipe | **Moderated usability testing**, *concurrent think-aloud* |
| Pendekatan | Kualitatif + kuantitatif (*mixed methods*) |
| Desain | *Within-subject* untuk 7 task; V1 vs V2 secara *between/within* (lihat BAB 11) |
| Lokasi | Tatap muka atau jarak jauh (video call + rekaman layar perangkat) |
| Jumlah task | 7 scenario task (+ task opsional bila waktu memungkinkan) |
| Perkiraan durasi | ±60 menit per partisipan |

## 3.2 Perangkat dan Lingkungan

🔴 **[MENUNGGU KONFIRMASI]** — *Tabel 1. Spesifikasi perangkat & lingkungan uji*

| Item | Rencana | Terkonfirmasi? |
| --- | --- | --- |
| Perangkat | Android fisik (1 unit 360 dp, 1 unit ≥ 400 dp) | [ ] |
| Versi OS | `[ISI VERSI OS]` | [ ] |
| Orientasi | Portret terkunci | [ ] |
| Pembesaran teks | 1,0× (sesi utama); 1,3×–1,5× (sesi tambahan aksesibilitas) | [ ] |
| Jaringan | Wi-Fi stabil (sesi utama); lambat/offline (task opsional) | [ ] |
| Server API | `apps/server` aktif dan stabil | [ ] |
| Build aplikasi | `[ISI BUILD/VERSI]` | [ ] |
| Alat rekam | Rekaman layar + audio + pencatat waktu | [ ] |
| Lingkungan | Ruang tenang, tanpa gangguan, pencahayaan memadai | [ ] |

## 3.3 Partisipan dan Kriteria Rekrutmen

🟢 **[TERISI DARI KODE + KONTEKS PRODUK]** — *Tabel 2. Kriteria rekrutmen*

| Kriteria | Inklusi | Eksklusi |
| --- | --- | --- |
| Usia | 18–35 tahun | < 18 atau > 35 |
| Domisili | Jabodetabek, Bandung, Semarang, Yogyakarta, Surabaya, Malang | Di luar area (kecuali remote) |
| Frekuensi wisata alam | Minimal 1× dalam 12 bulan terakhir | Tidak pernah & tidak berminat |
| Kemampuan perangkat | Terbiasa memakai aplikasi mobile | — |
| Keterlibatan tim | — | Anggota tim pengembang/desainer produk ini |
| Pengalaman produk serupa | Segmen A baru; Segmen B pernah memakai 2+ aplikasi | — |

**Segmen (mengikuti persona pada dokumen desain):**

| Segmen | Persona | Deskripsi | Jumlah minimal |
| --- | --- | --- | --- |
| A — Pemula | Dimas Pratama | Baru pertama/sedikit pengalaman wisata alam; butuh bimbingan langkah demi langkah | **5 partisipan** |
| B — Semi-berpengalaman | Rian Kusuma | Sudah pernah beberapa kali; mencari efisiensi & informasi lengkap | **5 partisipan** |
| **Total** | — | — | **10 partisipan** |

> Jumlah minimal mengikuti rekomendasi pada dokumen desain (minimal 5 responden per
> persona) dan anjuran Nielsen (5 partisipan per segmen hom*ogen dapat mengungkap
> mayoritas masalah kegunaan).

## 3.4 Prosedur Pelaksanaan

🟡 **[USULAN PROSEDUR]**

| Tahap | Durasi | Aktivitas |
| --- | --- | --- |
| 1 | 5 mnt | Penyambutan, pembuka, informed consent |
| 2 | 5 mnt | Pengisian Form 1 (screening & consent) |
| 3 | 8 mnt | Instruksi think-aloud + orientasi perangkat (tanpa membahas UI) |
| 4 | 30 mnt | Pelaksanaan 7 task; Form 2 setelah setiap task |
| 5 | 5 mnt | Pengisian Form 3 (SUS) |
| 6 | 5 mnt | Pengisian Form 4 (post-test happiness) |
| 7 | 5 mnt | Debrief, tanya jawab, ucapan terima kasih |
| 8 | — | Transkripsi & pengodean oleh observer (Form 5) |

**Aturan pengukuran:** pencatat waktu dimulai saat partisipan selesai membaca kartu
tugas dan berakhir saat partisipan menyatakan tugas selesai atau batas waktu tercapai.
Jeda splash (1,6 detik) tidak dihitung.

## 3.5 Etika dan Informed Consent

🟡 **[USULAN — wajib ditinjau]**

| Prinsip | Penerapan |
| --- | --- |
| Sukarela | Partisipan dapat berhenti kapan saja tanpa konsekuensi |
| Informed consent | Ditandatangani sebelum sesi (Form 1) |
| Kerahasiaan | Identitas diganti kode (P1, P2, …); tidak ada nama pada laporan |
| Perekaman | Rekaman layar & audio dengan izin; dihapus maksimal 6 bulan |
| Minimal risiko | Tidak ada konten sensitif; sesi dapat dihentikan bila tidak nyaman |
| Insentif | Dicatat transparan; tidak menimbulkan paksaan |
| Penyimpanan data | Terpisah dari data pribadi; hanya tim peneliti yang mengakses |

## 3.6 Instrumen Penelitian

🟢 **[TERISI DARI KODE]** — *Tabel 12. Instrumen penelitian*

| Instrumen | Berkas | Isi | Kapan diberikan |
| --- | --- | --- | --- |
| Form 1 | `forms/form_1_screening_consent.md` | Consent, demografi, pengalaman, perangkat | Sebelum sesi |
| Form 2 | `forms/form_2_post_task.md` | Self-reported success, SEQ 1–7, keyakinan, hambatan, kebingungan | Setelah setiap task |
| Form 3 | `forms/form_3_SUS.md` | 10 pernyataan SUS, skala 1–5 + tabel skoring | Setelah semua task |
| Form 4 | `forms/form_4_post_test_happiness.md` | CSAT, NPS 0–10, kepercayaan, kecepatan, kualitatif, adopsi | Akhir sesi |
| Form 5 | `forms/form_5_observer_sheet.md` | Catatan observer per partisipan × task | Sepanjang sesi |
| Naskah moderator | `03_scenario_task_dan_naskah_moderator.md` §5 | Pembuka, consent, think-aloud, penutup | Sepanjang sesi |

---

# BAB 4 — SCENARIO TASK DAN KRITERIA SUKSES

🟢 **[TERISI DARI KODE]** — rincian lengkap di
`03_scenario_task_dan_naskah_moderator.md`.

*Tabel 3. Ringkasan scenario task*

| ID | Tujuan partisipan | Segmen | Batas waktu | Kriteria sukses utama | HYP | HEART |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | Menemukan destinasi untuk pendakian akhir pekan dengan anggaran terbatas | A | 4 mnt | Membuka ≥1 destinasi + memilih 1 dengan ≥2 alasan | HYP-07, HYP-20, HYP-31, HYP-05 | T, H, E |
| T2 | Menyimpan destinasi lalu menemukannya kembali | A | 3 mnt | Item tersimpan **ada** di daftar tersimpan | HYP-01, HYP-04, HYP-06 | T, H |
| T3 | Mencatat perlengkapan pribadi & menandai yang sudah siap | A | 5 mnt | Item baru muncul & status selesai bertahan | HYP-03, HYP-15, HYP-17, HYP-19 | T, H, E |
| T4 | Menyusun rencana 2 hari untuk 2 orang sampai tersimpan | B | 6 mnt | Rencana tersimpan & dapat dibuka kembali dengan data benar | HYP-09, HYP-14, HYP-16, HYP-26 | T, H, A |
| T5 | Memeriksa status usulan yang pernah dikirim | B | 3 mnt | Membuka daftar usulan + menyebut status dengan benar | HYP-04, HYP-16, HYP-22 | T, H |
| T6 | Mendapatkan saran destinasi dari masukan pribadi | B | 5 mnt | Preferensi tersampaikan, hasil tampil, satu ditandai, bisa keluar | HYP-08, HYP-06, HYP-13, HYP-25 | T, H, A |
| T7 | Mengubah pengaturan sesuai preferensi pribadi | A | 4 mnt | ≥2 dari 3 tujuan selesai + dapat kembali | HYP-02, HYP-04, HYP-32, HYP-34 | T, H |

**Kriteria penghentian task:** (a) tujuan tercapai; (b) batas waktu terlampaui +
30 detik dan partisipan memilih berhenti; (c) partisipan minta dihentikan.

---

# BAB 5 — KERANGKA METRIK HEART + GSM

🟢 **[TERISI DARI KODE + USULAN]** — rincian lengkap di
`04_rencana_metrik_HEART.md`.

*Tabel 4. Matriks HEART + GSM (ringkas)*

| Dimensi | Goals | Signals | Metrics | Baseline V1 | Target V2 (usulan) |
| --- | --- | --- | --- | --- | --- |
| **Task Success** | Menyelesaikan tugas tanpa bantuan | Capaian tujuan | **TCR** | `[BELUM ADA DATA]` | **≥ 85%** (referensi ≥ 78%) |
| **Task Success** | Efisiensi | Waktu penyelesaian | **Time-on-Task** (median, lebih rendah lebih baik) | `[BELUM ADA DATA]` | **−15% … −25%** |
| **Task Success** | Akurasi | Salah ketuk/pilih/input | **Error rate** | `[BELUM ADA DATA]` | **≤ 1,0/task** |
| **Task Success** | Affordance | Ketukan tanpa efek | **Dead click rate** | `[BELUM ADA DATA]` | **≤ 0,5/task** |
| **Happiness** | Mudah digunakan | Skor SUS | **SUS** (0–100) | `[BELUM ADA DATA]` | **≥ 75** |
| **Happiness** | Mudah per task | Skor SEQ | **SEQ** (1–7) | `[BELUM ADA DATA]` | **≥ 5,5** |
| **Happiness** | Puas | CSAT | **CSAT** (% jawaban 4–5) | `[BELUM ADA DATA]` | **≥ 80%** |
| **Happiness** | Rekomendasi | NPS | **NPS** (−100…100) | `[BELUM ADA DATA]` | **≥ 20** |
| **Happiness** | Kepercayaan | Trust score | **Trust** (1–5) | `[BELUM ADA DATA]` | **≥ 4,0** |
| **Engagement** | Eksplorasi | Halaman dibuka | **Destinations viewed** | `[BELUM ADA DATA]` | **≥ 2** |
| **Engagement** | Penggunaan filter | Filter dipakai | **% partisipan memakai filter** | `[BELUM ADA DATA]` | **≥ 60%** |
| **Adoption** | Alur inti dipakai | Perpindahan temukan → persiapan | **Discovery→Preparation rate** | `[BELUM ADA DATA]` | **≥ 60%** |
| **Adoption** | Rencana tuntas | Rencana tersimpan | **Plan completion rate** | `[BELUM ADA DATA]` | **≥ 70%** |

**Rumus utama:**
```
TCR  = (task sukses tanpa bantuan) / (partisipan × task) × 100%
SUS  = (Σ(nilai−1 untuk ganjil) + Σ(5−nilai untuk genap)) × 2,5      per partisipan
NPS  = %Promotor (9–10) − %Detraktor (0–6)
```

---

# BAB 6 — HASIL AUDIT PRA-UT: HIPOTESIS BOTTLENECK

🟢 **[TERISI DARI KODE]** — rincian lengkap di `02_hipotesis_bottleneck.md`.

## 6.1 Metode Audit

Pembacaan statis seluruh 100 berkas Dart pada `apps/mobile/lib`: layar presentasi (45),
widget bersama (50), router (11 berkas), tema (6), state (8), serta layer data. Setiap
temuan dipetakan ke dimensi HEART, indikator bottleneck, estimasi severity, dan cara
validasi melalui UT.

**Indikator bottleneck:** DO (drop-off), WT (waktu tugas), MC (misclick/dead click),
RT (rage tap/back-tracking).

## 6.2 Sebaran Hipotesis

*Tabel 5. Sebaran hipotesis bottleneck per severity*

| Severity | Jumlah | ID |
| --- | --- | --- |
| 4 — Critical | 6 | HYP-01 … HYP-06 |
| 3 — Major | 10 | HYP-07 … HYP-16 |
| 2 — Medium | 11 | HYP-17 … HYP-27 |
| 1 — Minor | 7 | HYP-28 … HYP-34 |

## 6.3 Enam Temuan Kritis

| ID | Temuan | Lokasi kunci | HEART | Indikator | Sev |
| --- | --- | --- | --- | --- | --- |
| HYP-01 | Aksi penting tidak terlihat (kontras 1:1) | `notifications_screen.dart:64-74`; `saved_plans_screen.dart:49-52,142-146` | T, H | RT, DO | 4 |
| HYP-02 | Aksi berjanji navigasi, berakhir pesan sementara | `profile_screen.dart:127-134,330-379`; `plan_item_detail_screen.dart:74-85,307` | T, H | RT, MC, DO | 4 |
| HYP-03 | Hasil kerja hilang tanpa peringatan | `checklist_screen.dart:46-58,360`; `add_checklist_item_screen.dart:65-79`; `facility_detail_screen.dart:213-236` | T, H, E | DO, WT, RT | 4 |
| HYP-04 | Delapan tujuan tanpa pintu masuk antarmuka | `router/routes/{settings,saved,checklist,auth}_routes.dart`; `main_tab_routes.dart:16` | T, A | DO, RT | 4 |
| HYP-05 | Target sentuh < 48 dp & berdesakan | `dn_chip.dart:32`; `dn_segmented.dart:38-40`; `explore_screen.dart:173-206`; `destination_detail_screen.dart:94-137` | T, H | MC, WT, DO | 4 |
| HYP-06 | Elemen tampak interaktif tetapi mati | `destination_detail_screen.dart:122-137,376-441,560-591`; `beranda_screen.dart:75-81,237-303,379-391` | T, H | RT, MC, DO | 4 |

## 6.4 Sepuluh Temuan Major

| ID | Temuan | Sev |
| --- | --- | --- |
| HYP-07 | Penyaringan & pengurutan tidak mengubah hasil | 3 |
| HYP-08 | Jalan buntu navigasi pada alur saran otomatis | 3 |
| HYP-09 | Alur "buat rencana" terbelah dua & membuang masukan | 3 |
| HYP-10 | Tombol kembali tidak konsisten/tidak berfungsi | 3 |
| HYP-11 | Prasyarat masuk menambah beban awal | 3 |
| HYP-12 | Teks 10–11 sp & tanpa dukungan pembesaran teks | 3 |
| HYP-13 | Tidak ada indikator proses di luar layar masuk | 3 |
| HYP-14 | Konteks pengguna hilang antar-layar | 3 |
| HYP-15 | Umpan balik semu (sukses palsu) | 3 |
| HYP-16 | Aksi destruktif tanpa konfirmasi & navigasi bertumpuk | 3 |

## 6.5 Temuan Medium & Minor
Lihat `02_hipotesis_bottleneck.md` §4 (HYP-17 … HYP-27) dan §5 (HYP-28 … HYP-34).

## 6.6 Status Validasi
🔴 **Seluruh hipotesis belum divalidasi.** Kolom "Status" pada tabel prioritas
(BAB 9) hanya boleh diisi setelah data lapangan tersedia.

---

# BAB 7 — HASIL USABILITY TESTING (TEMPLATE)

> 🔴 **SELURUH BAGIAN BAB INI MENUNGGU DATA LAPANGAN.**
> Nilai di bawah **wajib** diisi dari hasil sesi UT, bukan dikarang.

## 7.1 Profil Partisipan

| Kode | Segmen | Usia | Perangkat | OS | Pengalaman | Catatan |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P2 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P3 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P4 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P5 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P6 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P7 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P8 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P9 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P10 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |

## 7.2 Task Completion Rate dan Time-on-Task

🔴 *Tabel 6. Hasil TCR & ToT per task*

| Task | n | Sukses tanpa bantuan | Dibantu | Gagal | **TCR (%)** | Median ToT | Mean ToT | Error rata-rata | Dead click rata-rata |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T2 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T3 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T4 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T5 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T6 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T7 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| **Total** | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |

**Perbandingan dengan referensi:** TCR total `[ISI]` vs referensi **≥ 78%** → `[ISI]`.

## 7.3 Perhitungan SUS

🔴 *Tabel 7. Perhitungan SUS per partisipan*

| P | Σ(nilai−1) ganjil | Σ(5−nilai) genap | Total raw (0–40) | **SUS (raw × 2,5)** |
| --- | --- | --- | --- | --- |
| P1 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P2 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P3 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P4 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P5 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P6 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P7 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P8 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P9 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| P10 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| **Rata-rata** | — | — | — | `[ISI]` |

**Tafsir (lingkari yang sesuai setelah data tersedia):**
`[ ] <51 buruk (F)` · `[ ] <68 perlu redesain` · `[ ] 68–79,9 baik` · `[ ] ≥80,3 unggul (A)`

## 7.4 SEQ, CSAT, dan NPS

🔴

| Metrik | Nilai | Target (usulan) | Tercapai? |
| --- | --- | --- | --- |
| SEQ rata-rata keseluruhan (1–7) | `[ISI]` | ≥ 5,5 | `[ ]` |
| SEQ per task (T1…T7) | `[ISI]` | — | — |
| CSAT (% jawaban 4–5) | `[ISI]` | ≥ 80% | `[ ]` |
| NPS | `[ISI]` | ≥ 20 | `[ ]` |
| Trust score (1–5) | `[ISI]` | ≥ 4,0 | `[ ]` |
| Perceived speed (1–5) | `[ISI]` | ≥ 4,0 | `[ ]` |

## 7.5 Ringkasan Heatmap

🔴 *Tabel 8. Ringkasan heatmap per layar kritis*

| Layar | Rage tap | Dead click | Scroll depth | Area perhatian | Temuan |
| --- | --- | --- | --- | --- | --- |
| Beranda | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| Jelajah | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| Detail destinasi | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| Detail fasilitas | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| Daftar persiapan | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| Saran otomatis | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| Profil/pengaturan | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |

> Jika instrumentasi belum tersedia, isi kolom dari rekaman layar dan lembar observer,
> lalu tandai sebagai "pengamatan manual, bukan heatmap otomatis".

## 7.6 Kutipan Think-Aloud

🔴

| Kode | Task | Kutipan | HYP terkait | Kategori |
| --- | --- | --- | --- | --- |
| Q-01 | `[ISI]` | `[ISI]` | `[ISI]` | Penemuan / Pemahaman / Affordance / Aksesibilitas / Kepercayaan |
| Q-02 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| Q-03 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| … | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |

## 7.7 Observasi Aksesibilitas (opsional)

🔴

| Aspek | Temuan | HYP |
| --- | --- | --- |
| Pembesaran teks 1,3×–1,5× | `[ISI]` | HYP-12, HYP-26 |
| Target sentuh < 48 dp | `[ISI]` | HYP-05 |
| Label/penanda untuk pembaca layar | `[ISI]` | HYP-02, HYP-19 |
| Rasio kontras | `[ISI]` | HYP-01, HYP-22 |

---

# BAB 8 — ANALISIS BOTTLENECK

## 8.1 Funnel Kuantitatif

🔴 *Gambar 3. Diagram funnel penemuan → persiapan* — menunggu data.

| Tahap funnel | Definisi | n mencapai | % dari awal | Drop-off | HYP |
| --- | --- | --- | --- | --- | --- |
| Masuk aplikasi | Membuka aplikasi & tiba di konten | `[ISI]` | 100% | — | HYP-11 |
| Menemukan | Membuka ≥1 destinasi | `[ISI]` | `[ISI]` | `[ISI]` | HYP-07 |
| Memahami | Membuka detail & membaca informasi | `[ISI]` | `[ISI]` | `[ISI]` | HYP-21 |
| Menyimpan/Menandai | Berhasil menyimpan item | `[ISI]` | `[ISI]` | `[ISI]` | HYP-01, HYP-06 |
| Mempersiapkan | Membuka daftar persiapan | `[ISI]` | `[ISI]` | `[ISI]` | HYP-03 |
| Menuntaskan | Rencana/daftar benar-benar tersimpan | `[ISI]` | `[ISI]` | `[ISI]` | HYP-09, HYP-15 |

## 8.2 Observasi Kualitatif per Tema

🔴

| Tema | Frekuensi | Kutipan pendukung | HYP | Dampak |
| --- | --- | --- | --- | --- |
| Penemuan (discoverability) | `[ISI]` | `[ISI]` | HYP-04, HYP-02 | `[ISI]` |
| Affordance menyesatkan | `[ISI]` | `[ISI]` | HYP-06 | `[ISI]` |
| Kehilangan hasil kerja | `[ISI]` | `[ISI]` | HYP-03, HYP-15 | `[ISI]` |
| Target & ketepatan sentuh | `[ISI]` | `[ISI]` | HYP-05 | `[ISI]` |
| Pemahaman konten & konteks | `[ISI]` | `[ISI]` | HYP-07, HYP-14, HYP-24 | `[ISI]` |
| Navigasi & kembali | `[ISI]` | `[ISI]` | HYP-08, HYP-10 | `[ISI]` |
| Aksesibilitas | `[ISI]` | `[ISI]` | HYP-01, HYP-12, HYP-22 | `[ISI]` |

## 8.3 Triangulasi

🔴

| Temuan kuantitatif | Observasi kualitatif | Heatmap/observer | Kesimpulan |
| --- | --- | --- | --- |
| `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |

## 8.4 Status Validasi Hipotesis

🔴 **Diisi setelah UT.** Gunakan format:

| HYP | Terkonfirmasi? | Bukti | Severity final (rubrik BAB 5 §6) |
| --- | --- | --- | --- |
| HYP-01 | `[VALID/TIDAK/SEBAGIAN]` | `[ISI]` | `[1–4]` |
| … | `[ISI]` | `[ISI]` | `[ISI]` |

---

# BAB 9 — TABEL PRIORITAS TEMUAN

## 9.1 Tabel Prioritas (Temuan dari Audit Kode)

🟢 **[TERISI DARI KODE]** — kolom severity masih estimasi pra-UT; kolom dampak
lapangan menunggu data.

| ID | Temuan | HEART | Severity (estimasi) | Dampak (menunggu UT) | Rekomendasi | Effort teknis |
| --- | --- | --- | --- | --- | --- | --- |
| HYP-01 | Aksi utama tidak terlihat (kontras 1:1) pada Notifikasi & Rencana Tersimpan | T, H | 4 | `[ISI]` | Ganti warna teks aksi ke warna kontras (mis. `onPrimary`) | Rendah |
| HYP-02 | Baris menu ber-chevron hanya memberi pesan sementara | T, H | 4 | `[ISI]` | Sambungkan ke tujuan; bila belum ada, hilangkan janji navigasi | Sedang |
| HYP-03 | Hasil kerja hilang saat berpindah layar | T, H, E | 4 | `[ISI]` | Pindahkan state ke penyimpanan bersama/persisten | Tinggi |
| HYP-04 | 8 tujuan tanpa pintu masuk antarmuka | T, A | 4 | `[ISI]` | Tambahkan pintu masuk (profil, notifikasi, tersimpan) | Sedang |
| HYP-05 | Target sentuh < 48 dp & berdesakan | T, H | 4 | `[ISI]` | Naikkan ke ≥ 48 dp, beri jarak antar-target | Sedang |
| HYP-06 | Elemen tampak interaktif tetapi mati | T, H | 4 | `[ISI]` | Aktifkan aksi atau ubah tampilan agar tidak tampak interaktif | Sedang–Tinggi |
| HYP-07 | Penyaringan/pengurutan tidak mengubah hasil | T, H | 3 | `[ISI]` | Terapkan filter pada query hasil | Sedang |
| HYP-08 | Jalan buntu navigasi pada alur saran otomatis | T, H, A | 3 | `[ISI]` | Perbaiki pola navigasi masuk-keluar alur | Sedang |
| HYP-09 | Alur rencana terbelah & membuang masukan | T, H | 3 | `[ISI]` | Satukan menjadi satu alur; simpan masukan & pilihan | Tinggi |
| HYP-10 | Tombol kembali tidak konsisten/berfungsi | T | 3 | `[ISI]` | Standarkan perilaku kembali di seluruh layar | Sedang |
| HYP-11 | Prasyarat masuk menambah beban | T, A | 3 | `[ISI]` | Perpendek splash; samakan label dengan perilaku | Rendah–Sedang |
| HYP-12 | Teks 10–11 sp & tanpa pembesaran teks | H, T | 3 | `[ISI]` | Naikkan ukuran minimum; dukung pembesaran teks | Sedang |
| HYP-13 | Tidak ada indikator proses | H, T | 3 | `[ISI]` | Tambahkan indikator proses & status nonaktif beralasan | Sedang |
| HYP-14 | Konteks hilang antar-layar | T, H | 3 | `[ISI]` | Teruskan identitas konteks pada navigasi | Sedang |
| HYP-15 | Umpan balik semu (sukses palsu) | H, T | 3 | `[ISI]` | Pastikan pesan sesuai kenyataan; simpan atau ubah pesan | Sedang |
| HYP-16 | Aksi destruktif tanpa konfirmasi | T, H | 3 | `[ISI]` | Tambahkan dialog konfirmasi/urungkan; hindari tumpukan layar | Rendah–Sedang |
| HYP-17 … HYP-27 | Temuan medium (validasi, guard, status, konten, layout, offline) | bervariasi | 2 | `[ISI]` | Lihat `02_hipotesis_bottleneck.md` §4 | Rendah–Sedang |
| HYP-28 … HYP-34 | Temuan minor (umpan balik, konsistensi, preferensi, sesi) | bervariasi | 1 | `[ISI]` | Lihat `02_hipotesis_bottleneck.md` §5 | Rendah |

## 9.2 Temuan Baru dari Lapangan

🔴 **Diisi setelah UT** — temuan yang tidak ada dalam audit pra-UT.

| ID | Temuan | HEART | Severity | Dampak | Rekomendasi | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| UP-01 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| … | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |

---

# BAB 10 — MATRIKS PRIORITAS REDESAIN DAN REKOMENDASI V2

## 10.1 Matriks Dampak vs Kesulitan Teknis

🟡 *Tabel 10. Matriks prioritas redesain* — posisi awal berdasarkan audit kode;
posisi final setelah data UT.

```
        DAMPAK TINGGI
              │
  [KERJAKAN DAHULU]         │        [RENCANAKAN]
   HYP-01 (Rendah)          │        HYP-03 (Tinggi)
   HYP-16 (Rendah–Sedang)   │        HYP-09 (Tinggi)
   HYP-05 (Sedang)          │        HYP-06 (Sedang–Tinggi)
   HYP-04 (Sedang)          │
   HYP-02, HYP-07, HYP-10,  │
   HYP-08, HYP-13, HYP-14,  │
   HYP-15 (Sedang)          │
─────────────┼────────────────────────────  KESULITAN →
              │
  [PERBAIKAN CEPAT]         │        [PERTIMBANGKAN]
   HYP-11 (Rendah–Sedang)   │        HYP-12 (Sedang, lintas layar)
   HYP-17…HYP-27 (Rendah)   │        HYP-32 (Sedang, perlu pekerjaan UI baru)
   HYP-28…HYP-34 (Rendah)   │
              │
        DAMPAK RENDAH
```

| Kuadran | Temuan | Tindakan |
| --- | --- | --- |
| **Kerjakan dahulu** (dampak tinggi, usaha rendah–sedang) | HYP-01, HYP-16, HYP-05, HYP-04, HYP-02, HYP-07, HYP-10, HYP-08, HYP-13, HYP-14, HYP-15 | Masuk V2 iterasi pertama |
| **Rencanakan** (dampak tinggi, usaha tinggi) | HYP-03, HYP-09, HYP-06 | Jadwalkan sebagai pekerjaan terjadwal |
| **Perbaikan cepat** (dampak rendah, usaha rendah) | HYP-11, HYP-17 … HYP-34 | Sisipkan saat perbaikan lain sedang dilakukan |
| **Pertimbangkan** (dampak rendah, usaha tinggi) | HYP-12, HYP-32 | Diskusikan ROI sebelum dikerjakan |

## 10.2 Rekomendasi V2 (usulan)

| # | Rekomendasi | Menjawab HYP | Dampak diharapkan pada metrik |
| --- | --- | --- | --- |
| R1 | Perbaiki kontras seluruh aksi penting (termasuk yang masih 1:1) | HYP-01, HYP-22 | TCR task T2/T5 naik; dead click turun |
| R2 | Aktifkan atau hilangkan seluruh elemen yang tampak interaktif | HYP-06, HYP-02 | Dead click rate turun; kepercayaan naik |
| R3 | Jadikan seluruh hasil kerja persisten (daftar persiapan, tersimpan, rencana) | HYP-03, HYP-15 | TCR task T3/T4 naik; back-step turun |
| R4 | Tambahkan pintu masuk untuk seluruh tujuan yang saat ini tidak terjangkau | HYP-04 | TCR task T2/T5/T7 naik signifikan |
| R5 | Naikkan seluruh target sentuh ke ≥ 48 dp dengan jarak memadai | HYP-05 | Error rate turun |
| R6 | Terapkan penyaringan & pengurutan pada hasil | HYP-07 | SEQ T1 naik; efektivitas penemuan naik |
| R7 | Satukan alur penyusunan rencana & pertahankan pilihan pengguna | HYP-09, HYP-14 | Plan completion rate naik |
| R8 | Perbaiki pola navigasi masuk-keluar alur saran otomatis | HYP-08 | Abandonment turun |
| R9 | Tambahkan validasi inline & alasan tombol nonaktif | HYP-17, HYP-19 | Submit gagal berulang turun |
| R10 | Tambahkan indikator proses dan status offline yang jelas | HYP-13, HYP-27 | Perceived speed naik; kepercayaan naik |
| R11 | Dukung pembesaran teks & naikkan ukuran teks minimum | HYP-12, HYP-33 | Aksesibilitas naik; SUS naik |
| R12 | Standarkan pola tombol kembali & navigasi antar-layar | HYP-10, HYP-16 | Back-step rate turun |

---

# BAB 11 — RENCANA VALIDASI V2

🟡 **[USULAN]**

## 11.1 Rancangan

| Aspek | Rencana |
| --- | --- |
| Desain | V1 vs V2; idealnya *within-subject* dengan partisipan sama, atau *between-subject* dengan profil setara |
| Partisipan | Minimal 5 per segmen (≥ 10), profil setara dengan UT V1 |
| Instrumen | Set identik (Form 2/3/4/5) & scenario task identik |
| Prosedur | Sama persis dengan UT V1 agar perbandingan sahih |

## 11.2 Kriteria Keberhasilan V2

*Tabel 11. Rencana validasi V1 → V2*

| Metrik | Baseline V1 | Target V2 (usulan) | Kriteria lulus |
| --- | --- | --- | --- |
| TCR | `[BELUM ADA DATA]` | ≥ 85% | TCR V2 ≥ 85% **dan** naik vs V1 |
| Median ToT | `[BELUM ADA DATA]` | −15% … −25% | Turun pada ≥ 5 dari 7 task |
| Error rate | `[BELUM ADA DATA]` | ≤ 1,0/task | ≤ 1,0/task |
| Dead click rate | `[BELUM ADA DATA]` | ≤ 0,5/task | Turun minimal 50% vs V1 |
| Back-step rate | `[BELUM ADA DATA]` | ≤ 1,0/task | Turun vs V1 |
| SUS | `[BELUM ADA DATA]` | ≥ 75 | SUS V2 ≥ 75 (dari < 68 bila V1 rendah) |
| SEQ | `[BELUM ADA DATA]` | ≥ 5,5 | Naik pada ≥ 5 task |
| CSAT | `[BELUM ADA DATA]` | ≥ 80% | ≥ 80% |
| NPS | `[BELUM ADA DATA]` | ≥ 20 | ≥ 20 |
| Temuan Critical | `[BELUM ADA DATA]` | 0 tersisa | Seluruh HYP severity 4 tertutup |

## 11.3 Analisis Statistik

- Uji **Mann-Whitney U** (non-parametrik) untuk perbandingan ToT & SUS antar versi.
- Uji **Wilcoxon signed-rank** bila desain *within-subject*.
- Interval kepercayaan 95% untuk proporsi (TCR, CSAT).
- Ukuran efek & pelaporan sebaran, bukan hanya rata-rata (n kecil).

## 11.4 Ambang Regresi

Penurunan > 5% pada metrik mana pun, atau munculnya temuan severity 4 baru,
dianggap **regresi** dan wajib diperbaiki sebelum rilis.

---

# BAB 12 — KETERBATASAN, ASUMSI, DAN LAMPIRAN

## 12.1 Keterbatasan

🟢 **[TERISI DARI KODE + KONTEKS]**

| # | Keterbatasan | Dampak |
| --- | --- | --- |
| 1 | Audit dilakukan pada **kode**, bukan pada aplikasi berjalan | Beberapa temuan tata letak (HYP-05, HYP-26) masih perkiraan |
| 2 | Aplikasi masih prototype dengan data contoh | Perilaku data nyata tidak terukur |
| 3 | Beberapa layar **tidak dapat dijangkau** tanpa jalur sementara | Task T2/T5/T7 berisiko tidak mengukur kegunaan, melainkan kegagalan penemuan |
| 4 | Banyak layar terisi data awal | Menurunkan validitas ToT |
| 5 | Belum ada instrumentasi heatmap | Triangulasi hanya dari rekaman & observer |
| 6 | Perhitungan kontras dari nilai token | Perlu verifikasi dengan pengukuran nyata |
| 7 | n kecil (10 partisipan) | Tidak dapat digeneralisasi; bersifat indikatif |
| 8 | Kanvas desain (Figma) tidak diaudit | Kemungkinan ada perbedaan desain vs implementasi |

## 12.2 Asumsi

Seluruh asumsi tercatat di `00_asumsi.md` (A-01 … A-24) dan daftar konfirmasi
manusia (K-1 … K-10).

## 12.3 Lampiran

### Lampiran A — Naskah Moderator
Lihat `03_scenario_task_dan_naskah_moderator.md` §5 (pembuka, informed consent,
think-aloud, penutup, aturan intervensi).

### Lampiran B — Lembar Observer
Lihat `03_scenario_task_dan_naskah_moderator.md` §6 (tabel per task, ringkasan
kualitatif, lembar heuristik).

### Lampiran C — Rumus Skoring

**SUS (per partisipan, 10 pernyataan skala 1–5):**
```
skor_ganjil (pernyataan 1,3,5,7,9) = nilai − 1
skor_genap  (pernyataan 2,4,6,8,10) = 5 − nilai
total_raw = Σ skor_ganjil + Σ skor_genap         # rentang 0–40
SUS = total_raw × 2,5                             # rentang 0–100
SUS_kelompok = rata-rata SUS seluruh partisipan
```

**TCR:**
```
TCR = (jumlah task sukses tanpa bantuan) / (jumlah partisipan × jumlah task) × 100%
```

**Assisted completion rate:**
```
ACR = (jumlah task sukses dengan bantuan) / (jumlah partisipan × jumlah task) × 100%
```

**NPS:**
```
NPS = %Promotor (jawaban 9–10) − %Detraktor (jawaban 0–6)
```

**CSAT:**
```
CSAT = (jumlah jawaban 4 atau 5) / (total responden) × 100%
```

**Rata-rata ToT (waktu = lebih rendah lebih baik):**
```
Mean ToT   = Σ waktu penyelesaian / jumlah task berhasil
Median ToT = nilai tengah dari kumpulan waktu penyelesaian
```

**Skor severity (rubrik BAB 5 §6):**
```
skor = frekuensi × dampak × persistensi
  ≥18 → 4 Critical | 12–17 → 3 Major | 6–11 → 2 Medium | ≤5 → 1 Minor
```

### Lampiran D — Berkas Pendukung

| Berkas | Isi |
| --- | --- |
| `00_asumsi.md` | Asumsi & daftar konfirmasi manusia |
| `00_inventaris_aplikasi.md` | Inventaris layar, route, widget, tema, data |
| `02_hipotesis_bottleneck.md` | 34 hipotesis dengan referensi kode |
| `03_scenario_task_dan_naskah_moderator.md` | 7 task, naskah, lembar observer |
| `04_rencana_metrik_HEART.md` | Kerangka HEART + GSM, target, severity |
| `05_rencana_instrumentasi_heatmap.md` | Rencana heatmap & analytics |
| `forms/*` | 5 formulir + Apps Script |

### Lampiran E — Perangkat Target (usulan)

*Tabel 1 (lengkap)* — lihat BAB 3 §3.2.

### Lampiran F — Glosarium

| Istilah | Arti |
| --- | --- |
| TCR | *Task Completion Rate* — persentase tugas yang selesai tanpa bantuan |
| ToT | *Time-on-Task* — waktu penyelesaian tugas |
| SEQ | *Single Ease Question* — penilaian kemudahan per task (1–7) |
| SUS | *System Usability Scale* — skor kegunaan sistem (0–100) |
| CSAT | *Customer Satisfaction Score* — skor kepuasan |
| NPS | *Net Promoter Score* — kemungkinan merekomendasikan |
| Dead click | Ketukan pada elemen yang tidak menghasilkan efek |
| Rage tap | Ketukan berulang cepat pada elemen yang sama karena tidak merespons |
| Back-step | Langkah mundur untuk mengulang alur |
| HEART | Kerangka metrik: Happiness, Engagement, Adoption, Retention, Task Success |
| GSM | *Goals – Signals – Metrics* |
| Affordance | Petunjuk visual bahwa sebuah elemen dapat diinteraksikan |

---

## LAMPIRAN — TAUTAN PROTOTYPE

Prototype interaktif dan materi demo (dari dokumen desain) tersedia melalui tautan
berikut:

| Item | Tautan |
| --- | --- |
| Prototype Figma | `https://www.figma.com/design/LZd45oPQ4lSp1V8UBvBlGg/UI-UX-Dolenae.id?node-id=328-6084` |
| Video Demo | `https://drive.google.com/drive/folders/1MTn1zA0JcJTdJFXsgc9dN1qusZPdxuGx` |

> **Catatan:** tautan di atas diambil dari `docs/laporan/Laporan-DesainUIUX-VTK50017.docx`
> dan **di luar lingkup audit kode** pada laporan ini.
