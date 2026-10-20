# 04 — Rencana Metrik HEART + GSM

**Fase 3.** Dokumen ini menyusun kerangka **HEART** (Happiness, Engagement, Adoption,
Retention, Task Success) dengan metode **GSM** (Goals → Signals → Metrics) untuk
Usability Testing aplikasi mobile Dolenae.id.

> Seluruh nilai baseline masih `[BELUM ADA DATA]` dan seluruh target V2 ditandai
> **(usulan)** karena tim harus menyetujuinya terlebih dahulu (lihat `00_asumsi.md`,
> K-8).

---

## 1. Pemilihan dimensi

| Dimensi | Dipakai? | Alasan |
| --- | --- | --- |
| **Task Success** | ✅ Utama | Sesuai tujuan ISO 9241-11 (efektivitas, efisiensi) dan fokus UT pada penyelesaian tugas |
| **Happiness** | ✅ Utama | Mengukur kepuasan & persepsi (SUS, SEQ, CSAT, NPS) — inti laporan UX |
| **Engagement** | ✅ Sekunder | Prototype berfokus pada penemuan & persiapan; penting untuk melihat kedalaman eksplorasi |
| **Adoption** | ✅ Sekunder | Mengukur apakah alur inti (temukan → persiapkan → susun rencana) benar-benar dipakai |
| **Retention** | ❌ | Prototype belum punya akun persisten/riwayat kembali yang layak diukur |

**Instrumen pendukung:** Form 1 (screening), Form 2 (SEQ per task), Form 3 (SUS),
Form 4 (CSAT/NPS), Form 5 (observer sheet), heatmap (`05_rencana_instrumentasi_heatmap.md`).

---

## 2. Matriks GSM lengkap

### 2.1 Task Success (efektivitas & efisiensi)

| Goals | Signals | Metrics | Sumber | Baseline (V1) | Target (V2, usulan) |
| --- | --- | --- | --- | --- | --- |
| Pengguna menyelesaikan tugas tanpa bantuan | Partisipan mencapai tujuan task tanpa intervensi | **Task Completion Rate (TCR)** = (task sukses tanpa bantuan / total task) × 100% | Form 5 | `[BELUM ADA DATA]` | **≥ 85%** (referensi minimal **≥ 78%**) |
| Pengguna menyelesaikan tugas secara efisien | Waktu dari instruksi dibacakan hingga tujuan tercapai | **Time-on-Task (ToT)** per task: median & rata-rata (detik); **lebih rendah lebih baik** | Form 5 | `[BELUM ADA DATA]` | **−15% s.d. −25%** vs V1 untuk task prioritas |
| Pengguna tidak melakukan kesalahan berulang | Jumlah salah ketuk/salah pilih/salah input per task | **Error rate** = jumlah error / jumlah task | Form 5 | `[BELUM ADA DATA]` | **≤ 1 error/task** rata-rata |
| Pengguna tidak mengetuk elemen yang tidak berfungsi | Ketukan tanpa efek pada elemen yang tampak interaktif | **Dead click rate** = jumlah dead click / jumlah task | Form 5 + rekaman | `[BELUM ADA DATA]` | **≤ 0,5 dead click/task** |
| Pengguna tidak mundur berulang | Jumlah langkah mundur untuk memperbaiki alur | **Back-step rate** = jumlah back-step / jumlah task | Form 5 + rekaman | `[BELUM ADA DATA]` | **≤ 1 back-step/task** |
| Tugas tidak dianggap bernilai bila gagal | Penyebab kegagalan terklasifikasi | **Distribusi penyebab kegagalan** (navigasi / konten / aksesibilitas / performa) | Form 5 | `[BELUM ADA DATA]` | ≥ 80% kegagalan terklasifikasi jelas |

**Kalkulasi TCR (dipakai di laporan):**
```
TCR = (jumlah task berhasil tanpa bantuan) / (jumlah partisipan × jumlah task) × 100%
```
> Definisi: "berhasil tanpa bantuan" = kriteria sukses terpenuhi tanpa intervensi
> moderator. "Berhasil dengan bantuan" **tidak** dihitung dalam TCR murni, tetapi
> dilaporkan terpisah sebagai *assisted completion rate*.

### 2.2 Happiness (kepuasan & persepsi)

| Goals | Signals | Metrics | Sumber | Baseline (V1) | Target (V2, usulan) |
| --- | --- | --- | --- | --- | --- |
| Pengguna menilai sistem mudah digunakan secara keseluruhan | Skor kuesioner 10 pernyataan | **SUS** (0–100) | Form 3 | `[BELUM ADA DATA]` | **≥ 75** ("Good"–"Excellent") |
| Pengguna menilai setiap task mudah | Penilaian 1–7 setelah tiap task | **SEQ** rata-rata per task & keseluruhan (1–7) | Form 2 | `[BELUM ADA DATA]` | **≥ 5,5 / 7** (keseluruhan) |
| Pengguna puas terhadap keseluruhan pengalaman | Penilaian kepuasan 1–5 | **CSAT** = (jumlah jawaban 4–5 / total) × 100% | Form 4 | `[BELUM ADA DATA]` | **≥ 80%** |
| Pengguna bersedia merekomendasikan | Skor 0–10 + kategori promotor | **NPS** = %Promotor − %Detraktor | Form 4 | `[BELUM ADA DATA]` | **≥ 20** ("Good") |
| Pengguna merasa sistem bereaksi cepat | Persepsi kecepatan 1–5 | **Perceived speed score** | Form 4 | `[BELUM ADA DATA]` | **≥ 4,0 / 5** |
| Pengguna mempercayai data & transaksi | Persepsi kepercayaan 1–5 | **Trust score** | Form 4 | `[BELUM ADA DATA]` | **≥ 4,0 / 5** |

**Referensi tafsir SUS** (dipakai pada laporan):

| Rentang SUS | Tafsir |
| --- | --- |
| < 51 | Buruk — **Grade F** |
| < 68 | Perlu redesain |
| 68 – 79,9 | Baik |
| ≥ 80,3 | Unggul — **Grade A** |

**Rumus SUS:**
```
Untuk tiap partisipan:
  skor_ganjil = nilai − 1            (pernyataan 1, 3, 5, 7, 9)
  skor_genap  = 5 − nilai            (pernyataan 2, 4, 6, 8, 10)
  total_raw   = Σ skor_ganjil + Σ skor_genap   (rentang 0–40)
  SUS_partisipan = total_raw × 2,5             (rentang 0–100)

SUS_kelompok = rata-rata SUS_partisipan
```

### 2.3 Engagement

| Goals | Signals | Metrics | Sumber | Baseline (V1) | Target (V2, usulan) |
| --- | --- | --- | --- | --- | --- |
| Pengguna mengeksplorasi lebih dari satu pilihan | Jumlah halaman destinasi yang dibuka per sesi | **Destinations viewed / partisipan** | Form 5 + heatmap | `[BELUM ADA DATA]` | **≥ 2** |
| Pengguna memanfaatkan penyaringan | Penggunaan filter/pengurutan | **% partisipan yang mencoba filter** | Rekaman + heatmap | `[BELUM ADA DATA]` | **≥ 60%** |
| Pengguna menelusuri informasi secara mendalam | Kedalaman gulir pada layar detail | **Scroll depth** layar detail (median %) | Heatmap | `[BELUM ADA DATA]` | **≥ 60%** |
| Pengguna tidak keluar sebelum menyelesaikan tujuan | Keluar/menutup aplikasi di tengah task | **Abandonment rate** = sesi yang ditinggalkan / total | Form 5 | `[BELUM ADA DATA]` | **≤ 15%** |

### 2.4 Adoption

| Goals | Signals | Metrics | Sumber | Baseline (V1) | Target (V2, usulan) |
| --- | --- | --- | --- | --- | --- |
| Pengguna memakai alur inti (temukan → persiapkan) | Perpindahan dari halaman destinasi ke fitur persiapan | **Discovery→Preparation rate** | Form 5 + heatmap | `[BELUM ADA DATA]` | **≥ 60%** |
| Pengguna menyelesaikan penyusunan rencana | Rasio yang berhasil menyimpan rencana | **Plan completion rate** | Form 5 | `[BELUM ADA DATA]` | **≥ 70%** |
| Pengguna menyimpan hasil | Rasio partisipan yang berhasil menyimpan destinasi/rencana | **Save success rate** | Form 5 | `[BELUM ADA DATA]` | **≥ 70%** |
| Pengguna mencoba fitur saran otomatis | Rasio yang menyelesaikan alur saran | **AI flow completion rate** | Form 5 | `[BELUM ADA DATA]` | **≥ 60%** |

---

## 3. Tabel baseline V1 & target V2 (ringkasan untuk laporan)

| # | Metrik | Satuan | Baseline V1 | Target V2 (usulan) | Prioritas perbaikan terkait |
| --- | --- | --- | --- | --- | --- |
| M-1 | Task Completion Rate (TCR) | % | `[BELUM ADA DATA]` | **≥ 85%** (referensi ≥ 78%) | HYP-04, HYP-05, HYP-06 |
| M-2 | Assisted completion rate | % | `[BELUM ADA DATA]` | **≤ 10%** | HYP-04, HYP-17 |
| M-3 | Median Time-on-Task keseluruhan | detik | `[BELUM ADA DATA]` | **−15% s.d. −25%** vs V1 | HYP-05, HYP-07, HYP-21 |
| M-4 | Error rate | error/task | `[BELUM ADA DATA]` | **≤ 1,0** | HYP-05, HYP-17, HYP-26 |
| M-5 | Dead click rate | ketukan/task | `[BELUM ADA DATA]` | **≤ 0,5** | HYP-06, HYP-02 |
| M-6 | Back-step rate | langkah/task | `[BELUM ADA DATA]` | **≤ 1,0** | HYP-10, HYP-03 |
| M-7 | Abandonment rate | % | `[BELUM ADA DATA]` | **≤ 15%** | HYP-08, HYP-04 |
| M-8 | SUS | 0–100 | `[BELUM ADA DATA]` | **≥ 75** | seluruh temuan |
| M-9 | SEQ keseluruhan | 1–7 | `[BELUM ADA DATA]` | **≥ 5,5** | per-task |
| M-10 | CSAT (jawaban 4–5) | % | `[BELUM ADA DATA]` | **≥ 80%** | Happiness |
| M-11 | NPS | −100…100 | `[BELUM ADA DATA]` | **≥ 20** | Happiness |
| M-12 | Trust score | 1–5 | `[BELUM ADA DATA]` | **≥ 4,0** | HYP-15, HYP-24, HYP-27 |
| M-13 | Perceived speed | 1–5 | `[BELUM ADA DATA]` | **≥ 4,0** | HYP-13 |
| M-14 | Discovery→Preparation rate | % | `[BELUM ADA DATA]` | **≥ 60%** | Adoption |
| M-15 | Plan completion rate | % | `[BELUM ADA DATA]` | **≥ 70%** | HYP-09 |
| M-16 | Save success rate | % | `[BELUM ADA DATA]` | **≥ 70%** | HYP-03, HYP-06 |

> **Catatan tafsir SUS pada laporan:** nilai SUS kelompok harus diikuti sebaran
> (min–maks) dan jumlah partisipan; jangan melaporkan SUS untuk n < 5.

---

## 4. Heatmap: rencana pengumpulan

### 4.1 Layar kritis yang dipetakan
| # | Layar (kode) | Alasan | Jenis heatmap | HYP dipantau |
| --- | --- | --- | --- | --- |
| 1 | Beranda (`features/home/presentation/beranda_screen.dart`) | Titik masuk utama; banyak elemen mati | Click/tap, scroll, attention | HYP-04, HYP-06, HYP-21, HYP-31 |
| 2 | Jelajah (`features/explore/presentation/explore_screen.dart`) | Inti alur penemuan & filter | Click/tap, scroll, rage tap | HYP-07, HYP-05, HYP-20 |
| 3 | Detail destinasi (`features/destination/presentation/destination_detail_screen.dart`) | Titik keputusan utama; CTA melekat | Click/tap, scroll depth | HYP-06, HYP-21, HYP-23 |
| 4 | Detail fasilitas (`features/facilities/presentation/facility_detail_screen.dart`) | CTA panjang, kartu mati | Click/tap, rage tap | HYP-02, HYP-26 |
| 5 | Daftar persiapan/checklist (`features/checklist/presentation/checklist_screen.dart`) | Kehilangan state, target kecil | Click/tap, rage tap | HYP-03, HYP-05, HYP-19 |
| 6 | Preferensi & hasil saran (`features/ai/presentation/*`) | Jalan buntu navigasi, chip | Click/tap, rage tap, scroll | HYP-08, HYP-06 |
| 7 | Pengaturan & Profil (`features/profile/...`, `features/settings/...`) | Menu ber-chevron yang mati | Click/tap, dead click | HYP-02, HYP-04 |

### 4.2 Metrik heatmap yang diambil
| Metrik | Definisi | Interpretasi |
| --- | --- | --- |
| *Tap/click map* | Sebaran titik ketukan | Konsentrasi ketukan pada elemen mati = rage tap |
| *Rage tap* | ≥ 3 ketukan cepat pada area yang sama dalam < 2 detik | Penanda kuat HYP-06/HYP-02 |
| *Dead click* | Ketukan pada area tanpa elemen interaktif | Area "tampak tombol" namun tidak berfungsi |
| *Scroll depth* | Persentase tinggi halaman yang tergulir | Aksi melekat vs aksi di dasar gulir (HYP-21) |
| *Attention map* | Estimasi area yang dipandang (jika tool mendukung) | Bukti CTA/informasi penting terlewat (HYP-01) |

### 4.3 Tool yang cocok
| Tool | Platform | Kelebihan | Catatan |
| --- | --- | --- | --- |
| **UXCam** | Mobile (Flutter plugin) | Heatmap, session replay, rage tap otomatis | Cocok untuk aplikasi mobile native |
| **Smartlook** | Mobile + web | Rage tap, funnel, event | Gratis terbatas |
| **Firebase Analytics + BigQuery** | Mobile + web | Event kustom, funnel | Butuh penulisan event manual |
| **Microsoft Clarity** | Web | Gratis, heatmap & replay | Cocok untuk web dashboard, **bukan** aplikasi mobile |
| **PostHog** | Mobile + web | Open source, autocapture | Perlu setup hosting |

### 4.4 Status instrumentasi repo
Berdasarkan pembacaan kode (`apps/mobile/lib` dan `apps/web`):
- **Tidak ditemukan** integrasi analytics/heatmap (`analytics`, `firebase`, `sentry`,
  `connectivity` = 0 kemunculan di `apps/mobile/lib`).
- **Tidak ada** event kustom yang dilacak.
- **Tidak ada** mekanisme persetujuan (consent) analytics di aplikasi.

→ Karena itu, rencana instrumentasi disusun **terpisah** di
`05_rencana_instrumentasi_heatmap.md` **tanpa mengubah kode**. Heatmap hanya dapat
dipakai sebagai triangulasi **setelah** implementasi disetujui dan dilakukan.

---

## 5. Triangulasi data (kuantitatif + kualitatif)

| Temuan kuantitatif | Diperkuat oleh | Kesimpulan |
| --- | --- | --- |
| TCR rendah pada task tertentu | Kutipan think-aloud + dead click heatmap | Apakah masalahnya penemuan (discoverability) atau pemahaman (comprehension) |
| ToT panjang pada task tertentu | Rekaman back-step + scroll depth | Apakah masalahnya kedalaman navigasi atau konten panjang |
| Error rate tinggi | Bekas rage tap pada heatmap | Apakah target sentuh/affordance yang salah |
| SEQ rendah namun SUS tinggi | Kutipan post-task + CSAT | Task tertentu bermasalah meski kesan keseluruhan baik |

**Aturan pelaporan:** setiap temuan di laporan harus menyebutkan
(a) metrik kuantitatif, (b) kutipan/observasi pendukung, dan (c) hipotesis terkait.

---

## 6. Skala severity & rubrik penentuan

| Level | Label | Definisi | Frekuensi | Dampak | Persistensi | Aksi |
| --- | --- | --- | --- | --- | --- | --- |
| **4** | Critical | Menghambat penyelesaian tugas/kehilangan data | ≥ 40% partisipan | Tinggi (tugas gagal total) | Muncul di hampir semua task/sesi | Perbaiki sebelum rilis V2 (blocking) |
| **3** | Major | Menghambat berat atau berulang | 20–39% | Sedang–tinggi (tugas sulit selesai / kepercayaan turun) | Muncul konsisten pada task kunci | Prioritas tinggi V2 |
| **2** | Medium | Menambah beban, masih bisa diakali | 10–19% | Sedang | Muncul pada sebagian kondisi | Masuk backlog V2 |
| **1** | Minor | Mengganggu kecil / kosmetik | < 10% | Rendah | Sporadik | Backlog / nice-to-have |

**Rubrik keputusan (dipakai pada tabel prioritas laporan):**
```
Severity = f(frekuensi × dampak × persistensi)

frekuensi  : rendah(1) | sedang(2) | tinggi(3)
dampak     : rendah(1) | sedang(2) | tinggi(3)
persistensi: sporadik(1) | konsisten(2) | selalu(3)

skor = frekuensi × dampak × persistensi
  skor ≥ 18      → 4 Critical
  12 – 17        → 3 Major
   6 – 11        → 2 Medium
   ≤ 5           → 1 Minor
```
> Sev-1/2/3 untuk hipotesis **pra-UT** di `02_hipotesis_bottleneck.md` adalah
> **estimasi** dari frekuensi kemunculan elemen di kode.
> Setelah UT, severity **dihitung ulang** memakai rubrik di atas.

---

## 7. Rencana validasi V1 → V2

| Aspek | Rencana |
| --- | --- |
| **Desain** | *Longitudinal within-subject*: partisipan yang sama menguji V1 dan V2 (jika memungkinkan), atau *between-subject* dengan tugas identik bila partisipan tidak tersedia |
| **Instrumen** | Set identik (Form 2/3/4/5) + scenario task identik agar perbandingan valid |
| **Ukuran keberhasilan** | M-1 s.d. M-16 pada §3 |
| **Analisis** | (1) Bandingkan TCR & ToT per task V1 vs V2. (2) Uji Mann-Whitney (non-parametrik, n kecil) untuk ToT & SUS. (3) Bandingkan dead click rate & back-step rate. |
| **Kriteria lulus** | (a) TCR V2 ≥ 85%; (b) SUS V2 ≥ 75; (c) tidak ada regresi pada task yang sudah baik; (d) seluruh temuan Critical (4) pada V1 tertutup |
| **Ambang regresi** | Penurunan > 5% pada metrik mana pun dianggap regresi dan wajib ditindaklanjuti |
| **Bukti** | Laporan perbandingan + tabel *before/after* per HYP + klip rekaman |
| **Waktu** | Dilaksanakan setelah iterasi desain V2, dengan minimal 5 partisipan per segmen |

---

## 8. Pelaporan hasil (placeholder)

Tabel berikut **wajib diisi dari hasil UT**, tidak boleh dikarang:

| Task | Peserta (n) | Sukses tanpa bantuan | Dibantu | Gagal | TCR (%) | Median ToT (s) | Error rata-rata | SEQ rata-rata |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T2 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T3 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T4 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T5 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T6 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| T7 | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
| **Total** | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` | `[ISI]` |
