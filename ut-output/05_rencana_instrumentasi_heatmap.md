# 05 — Rencana Instrumentasi Heatmap & Analytics

**Dokumen ini adalah rencana, bukan implementasi.** Tidak ada satu pun file kode yang
diubah. Seluruh skrip/event yang tercantum di bawah dimaksudkan untuk dieksekusi
**setelah** mendapat persetujuan manusia (lihat `00_asumsi.md`, K-7).

---

## 1. Latar belakang

Heatmap, rekaman sesi, dan *funnel* analitik dipakai untuk **triangulasi** temuan UT:
mengonfirmasi atau menolak hipotesis bottleneck `02_hipotesis_bottleneck.md` pada
populasi yang lebih besar daripada 10 partisipan UT.

### 1.1 Kondisi repo saat ini
| Aspek | Status | Bukti |
| --- | --- | --- |
| Integrasi analytics | **Tidak ada** | grep `analytics`, `firebase`, `sentry`, `amplitude`, `mixpanel` = 0 di `apps/mobile/lib` |
| Deteksi konektivitas | **Tidak ada** | grep `connectivity` = 0 |
| Event kustom | **Tidak ada** | tidak ada pemanggilan log event |
| Consent analytics | **Tidak ada** | tidak ada layar/form persetujuan analytics |
| Cache lokal | Ada (Drift) | `data/local/destination_dao.dart`, `cache_store.dart` |

**Konsekuensi:** heatmap **tidak dapat** dipakai pada sesi UT pertama. Instrumentasi
harus melalui keputusan & implementasi tersendiri.

---

## 2. Tujuan & pertanyaan yang ingin dijawab

| # | Pertanyaan | HYP terkait | Metrik heatmap |
| --- | --- | --- | --- |
| Q1 | Di mana pengguna paling sering mengetuk elemen yang tidak berfungsi? | HYP-06, HYP-02 | *Dead click map* |
| Q2 | Apakah pengguna benar-benar mencoba penyaringan, dan apakah mereka menyadari hasilnya tidak berubah? | HYP-07 | *Click map* pada area filter |
| Q3 | Seberapa dalam pengguna menggulir sebelum menemukan aksi utama? | HYP-21 | *Scroll depth* |
| Q4 | Apakah aksi penting terlewat karena tidak terlihat (kontras/tanpa penanda aksi)? | HYP-01 | *Attention/click map* |
| Q5 | Layar mana yang paling sering ditinggalkan sebelum tujuan tercapai? | HYP-04, HYP-08 | *Funnel* + *exit* |
| Q6 | Apakah pengguna berulang kali mengetuk target kecil? | HYP-05 | *Rage tap* |

---

## 3. Pilihan tool (perlu keputusan)

| Tool | Platform | Kekuatan | Biaya | Rekomendasi |
| --- | --- | --- | --- | --- |
| **UXCam** | Flutter (mobile) | Heatmap, replay, rage tap otomatis, plugin Flutter resmi | Berbayar (free tier terbatas) | **Utama untuk mobile** |
| **Smartlook** | Mobile + web | Rage tap, funnel, event | Free tier | Alternatif |
| **Firebase Analytics + BigQuery** | Mobile + web | Gratis, event kustom, integrasi luas | Gratis (kuota) | Alternatif bila ingin kontrol penuh |
| **Microsoft Clarity** | Web | Gratis, heatmap & replay | Gratis | Untuk **web dashboard** saja |
| **PostHog** | Mobile + web | Open source, autocapture | Self-host gratis | Alternatif bila ada kendala privasi |

> **Keputusan yang diminta:** pilih satu tool utama untuk mobile dan satu untuk web
> (jika dashboard ikut diukur). Lihat `00_asumsi.md` K-7.

---

## 4. Ruang lingkup instrumentasi (usulan)

### 4.1 Prinsip
1. **Minimal.** Hanya event yang menjawab Q1–Q6; hindari menambah beban performa.
2. **Tanpa data pribadi.** Tidak menempatkan identitas/nama pada event (lihat §7).
3. **Berbasis persetujuan.** Hanya aktif bila pengguna menyetujui.
4. **Tidak mengubah perilaku UI.** Instrumentasi tidak boleh mengubah alur.

### 4.2 Layar yang diinstrumentasi
| # | Layar (kode) | Event |
| --- | --- | --- |
| 1 | Beranda `features/home/presentation/beranda_screen.dart` | `home_view`, `home_search_tap`, `home_category_tap`, `home_scroll_depth` |
| 2 | Jelajah `features/explore/presentation/explore_screen.dart` | `explore_view`, `explore_query_submit`, `explore_filter_open`, `explore_filter_apply`, `explore_result_open` |
| 3 | Detail destinasi `features/destination/presentation/destination_detail_screen.dart` | `destination_view`, `destination_save_tap`, `destination_prepare_tap`, `destination_scroll_depth` |
| 4 | Detail fasilitas `features/facilities/presentation/facility_detail_screen.dart` | `facility_view`, `facility_contact_tap`, `facility_save_tap` |
| 5 | Checklist `features/checklist/presentation/checklist_screen.dart` | `checklist_view`, `checklist_toggle`, `checklist_add_open`, `checklist_mark_ready` |
| 6 | Rencana `features/plan/presentation/*` | `plan_create_open`, `plan_step_complete`, `plan_save_result` |
| 7 | Saran otomatis `features/ai/presentation/*` | `ai_preferences_open`, `ai_submit`, `ai_result_view`, `ai_result_save` |
| 8 | Profil & pengaturan `features/profile/...`, `features/settings/...` | `profile_view`, `settings_row_tap`, `settings_change` |

### 4.3 Skema event (usulan)
```yaml
common_props:
  app_version: string        # dari pubspec
  platform: string           # android | ios
  screen_w: int              # lebar logis (dp)
  text_scale: float          # pembesaran teks pengguna
  network: string            # wifi | cellular | offline (jika connectivity ditambahkan)
  session_id: uuid           # anonim, per sesi
  consent: bool              # hanya true yang dikirim

events:
  home_view: {}
  home_search_tap: { autofocus: bool }
  home_category_tap: { category: string }
  explore_query_submit: { query_len: int, result_count: int }
  explore_filter_apply: { filter_type: string, value: string, result_count_after: int }
  destination_view: { destination_id: string }        # kode internal, bukan nama pribadi
  destination_save_tap: { state_before: string, state_after: string }
  checklist_toggle: { item_id: string, completed: bool }
  dead_click_area: { screen: string, area_id: string } # dipakai bila tool mendukung
  rage_tap_area: { screen: string, area_id: string, tap_count: int }
  scroll_depth: { screen: string, percent: int }
```

### 4.4 Funnel yang dibangun
| Funnel | Tahapan | Menjawab |
| --- | --- | --- |
| Penemuan → Persiapan | Beranda → Jelajah → Detail destinasi → Checklist/Rencana | Q5, Adoption |
| Rencana | Detail destinasi → Susun rencana → Pilih destinasi → Simpan → Rencana terlihat | Q5 |
| Saran otomatis | Preferensi → Kirim → Hasil → Simpan hasil | Q5 |
| Penyaringan | Jelajah → Buka filter → Terapkan → Buka hasil | Q2 |

---

## 5. Kendala teknis yang perlu diselesaikan sebelum implementasi

| # | Kendala | Cara menangani (usulan) |
| --- | --- | --- |
| 1 | Alur AI memakai `context.go` sehingga layar menjadi *root*; sesi bisa terputus tanpa jejak | Tambahkan event `screen_view` pada setiap perubahan route via `GoRouter.observer` — **tidak** mengubah alur |
| 2 | Banyak elemen mati; dead click hanya terdeteksi bila tool mendukung deteksi area non-interaktif | Gunakan deteksi rage tap bawaan tool; untuk dead click, tambahkan listener pada area yang dicurigai **setelah** perbaikan affordance |
| 3 | `DestinationsState` menampilkan data contoh saat API gagal tanpa penanda | Tambahkan prop `data_source: seed|api|cache` pada event kunci agar funnel tidak bercampur |
| 4 | Tidak ada deteksi konektivitas | Bila ingin `network` pada event, tambahkan `connectivity_plus` (keputusan produk) |
| 5 | Tidak ada consent | Tambahkan layar/opsi persetujuan sebelum instrumentasi aktif (keputusan produk & legal) |
| 6 | Mode gelap & pembesaran teks tidak didukung | Catat `text_scale` pada prop agar heatmap dapat disegmentasi |

---

## 6. Rencana implementasi bertahap (usulan, belum dieksekusi)

| Fase | Aktivitas | Keluaran | Perlu persetujuan |
| --- | --- | --- | --- |
| I-0 | Pilih tool & tentukan cakupan | Dokumen keputusan | Produk & legal |
| I-1 | Tambahkan mekanisme persetujuan (opt-in) | Layar/opsi consent | Produk & legal |
| I-2 | Pasang SDK + event minimal (`screen_view`, `*_view`) | Data dasar kunjungan | Teknis |
| I-3 | Tambahkan event interaksi pada 8 layar prioritas | Click/tap map & funnel | Teknis |
| I-4 | Aktifkan rage tap / dead click / scroll depth | Heatmap lengkap | Teknis |
| I-5 | Validasi kualitas data (sampling, duplikasi, atribusi sesi) | Laporan QA data | QA |
| I-6 | Jalankan bersama UT kedua (V2) | Triangulasi kuantitatif | Peneliti |

**Estimasi:** I-2 s.d. I-4 adalah pekerjaan implementasi di aplikasi mobile —
**di luar lingkup dokumen ini**, dan baru boleh dikerjakan setelah persetujuan.

---

## 7. Privasi & etika instrumentasi

| Prinsip | Penerapan |
| --- | --- |
| Persetujuan | Instrumentasi hanya aktif bila pengguna menyetujui (opt-in) |
| Minimalisasi data | Tidak mengirim nama, email, nomor telepon, atau isi teks bebas |
| Anonimisasi | ID layar/destinasi memakai kode internal; sesi memakai UUID acak |
| Penyamaran input | Field teks (nama rencana, catatan, pencarian) tidak dikirim isinya, hanya panjang |
| Retensi | Data mentah maksimal 6 bulan; heatmap agregat boleh disimpan lebih lama |
| Transparansi | Pengguna dapat mematikan pelacakan kapan saja; opsi tercatat |
| Kepatuhan | Mengikuti UU PDP Indonesia; bila melibatkan pihak ketiga, pastikan DPA tersedia |

---

## 8. Alternatif bila instrumentasi tidak memungkinkan

Jika instrumentasi tidak dapat dilakukan sebelum UT, gunakan pengganti berikut
(semua **tanpa mengubah kode**):

| Tujuan | Alternatif manual |
| --- | --- |
| Click/tap map | Rekaman layar per partisipan + penandaan area secara manual pasca-sesi |
| Scroll depth | Observer mencatat posisi gulir akhir pada tiap layar kritis |
| Rage tap | Observer menghitung ketukan berulang < 2 detik (lihat lembar observer §6.2) |
| Funnel | Rekonstruksi alur dari lembar observer per task |
| Waktu per layar | Stempel waktu dari rekaman layar |

> Alternatif ini lebih mahal dan berskala kecil, tetapi cukup untuk triangulasi pada
> UT dengan 10 partisipan.

---

## 9. Keluaran yang diharapkan dari instrumentasi

| Keluaran | Dipakai untuk |
| --- | --- |
| Heatmap per layar kritis | Konfirmasi/tolak HYP-01, HYP-05, HYP-06, HYP-21 |
| Peta rage tap | HYP-02, HYP-06 |
| Funnel penemuan → persiapan | Kuantifikasi Adoption |
| Segmentasi (ukuran layar, text_scale, jaringan) | HYP-12, HYP-26, HYP-13, HYP-27 |
| Perbandingan V1 vs V2 | Rencana validasi pada `04_rencana_metrik_HEART.md` §7 |
