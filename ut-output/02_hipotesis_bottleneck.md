# 02 — Audit Pra-UT: Hipotesis Bottleneck

**Fase 1.** Dokumen ini memuat hipotesis friksi yang ditemukan dari **pembacaan statis
kode** aplikasi mobile (`apps/mobile/lib`). Semua hipotesis bersifat **praduga yang
harus divalidasi melalui UT** — bukan temuan final. Tidak ada satu pun angka hasil UT
di dokumen ini.

- Dimensi HEART yang dipakai: **T** = Task Success, **H** = Happiness,
  **E** = Engagement, **A** = Adoption. (Lihat `04_rencana_metrik_HEART.md`.)
- Severity: **4 = Critical**, **3 = Major**, **2 = Medium**, **1 = Minor**
  (rubrik di `04_rencana_metrik_HEART.md` §6).
- Indikator bottleneck yang dipetakan: **DO** = drop-off, **WT** = waktu tugas
  berlebih, **MC** = misclick/dead click, **RT** = rage tap/back-tracking.

---

## 1. Ringkasan sebaran hipotesis

| Severity | Jumlah | ID |
| --- | --- | --- |
| Critical (4) | 6 | HYP-01, HYP-02, HYP-03, HYP-04, HYP-05, HYP-06 |
| Major (3) | 10 | HYP-07 … HYP-16 |
| Medium (2) | 11 | HYP-17 … HYP-27 |
| Minor (1) | 7 | HYP-28 … HYP-34 |
| **Total** | **34** | |

| Indikator | Hipotesis terkait |
| --- | --- |
| DO (drop-off) | HYP-01, 02, 03, 04, 05, 06, 11, 17, 20, 24 |
| WT (waktu tugas) | HYP-05, 07, 09, 12, 13, 21, 26 |
| MC (misclick/dead click) | HYP-05, 06, 07, 10, 14, 15, 16, 22, 23, 26, 33 |
| RT (rage tap/back) | HYP-01, 02, 03, 08, 10, 15, 16, 18, 19, 20, 22, 25, 31, 34 |

---

## 2. Temuan kritis (severity 4)

### HYP-01 — Aksi terpenting di layar Rencana & Notifikasi tidak terlihat (kontras 1:1)
| Field | Isi |
| --- | --- |
| **ID** | HYP-01 |
| **Lokasi** | `apps/mobile/lib/src/features/notifications/presentation/notifications_screen.dart:64-74`; `apps/mobile/lib/src/features/saved/presentation/saved_plans_screen.dart:49-52,142-146`; token `apps/mobile/lib/src/app/theme/app_colors.dart` |
| **Deskripsi** | Tombol "Tandai dibaca" (aksi utama layar Notifikasi) dan ikon tambah pada daftar Rencana Tersimpan diwarnai `AppColors.primary` di atas AppBar berbackground `primary` → rasio kontras **1:1** (tidak terlihat sama sekali). Bandingkan pola benar di `edit_profile_screen.dart:116` yang memakai `onPrimary`. |
| **HEART** | Task Success, Happiness |
| **Indikator** | RT, DO |
| **Severity** | 4 — Critical |
| **Validasi via UT** | Amati apakah partisipan menemukan aksi ini pada T2/T5. Catat jumlah tap pada area tersebut, waktu hingga aksi ditemukan, dan apakah partisipan menyatakan "tidak ada tombol". Ukur kegagalan task yang bergantung pada aksi ini. |

### HYP-02 — Aksi yang dijanjikan (chevron/menu) berakhir pada pesan sementara
| Field | Isi |
| --- | --- |
| **ID** | HYP-02 |
| **Lokasi** | `features/profile/presentation/profile_screen.dart:127-134,330-379`; `features/plan/presentation/plan_item_detail_screen.dart:74-85,307`; `features/plan/presentation/trip_plan_screen.dart:189-208`; `features/facilities/presentation/propose_facility_screen.dart:175-180` |
| **Deskripsi** | Tujuh baris menu Profil + ikon pengaturan, tombol "Ubah"/"Ubah urutan" pada detail item rencana, "Perbarui" pada kartu AI, dan "Tambah foto" semuanya hanya menampilkan SnackBar atau tidak melakukan apa pun, padahal seluruhnya menampilkan chevron/ikon yang menjanjikan navigasi. |
| **HEART** | Task Success, Happiness |
| **Indikator** | RT, MC, DO |
| **Severity** | 4 — Critical |
| **Validasi via UT** | Task T7 (pengaturan) & T4 (kelola rencana). Catat jumlah ketukan berulang pada elemen yang sama (rage tap), waktu hingga partisipan menyerah, dan kutipan think-aloud seperti "kok tidak buka apa-apa". |

### HYP-03 — Hasil kerja pengguna hilang tanpa peringatan (state tidak dipersistensi)
| Field | Isi |
| --- | --- |
| **ID** | HYP-03 |
| **Lokasi** | `features/checklist/presentation/checklist_screen.dart:46-58,360`; `features/checklist/presentation/add_checklist_item_screen.dart:65-79`; `features/facilities/presentation/facility_detail_screen.dart:213-236`; `app/state/saved_state.dart`; `app/state/notifications_state.dart`; `app/state/search_state.dart` |
| **Deskripsi** | Checklist memakai state lokal (`_items` dari `initState`) sehingga centang & item baru hilang saat kembali; item baru dari layar tambah di-`pop` tetapi **tidak pernah ditangkap** pemanggil (`context.push` tanpa `await`); "Simpan" pada detail fasilitas hanya menampilkan toast tanpa menulis ke `SavedState`; seluruh state Tersimpan/Notifikasi/Riwayat pencarian bersifat in-memory dan hilang saat aplikasi ditutup. |
| **HEART** | Task Success, Happiness, Engagement |
| **Indikator** | DO, WT, RT |
| **Severity** | 4 — Critical |
| **Validasi via UT** | T3 & T4: minta partisipan menambah/mengubah lalu berpindah layar dan kembali. Catat apakah partisipan memverifikasi hasil (back-tracking), jumlah pengulangan aksi, dan TCR untuk task tersebut. |

### HYP-04 — Delapan tujuan utama tidak punya jalan masuk dari antarmuka
| Field | Isi |
| --- | --- |
| **ID** | HYP-04 |
| **Lokasi** | `app/router/routes/settings_routes.dart`; `routes/main_tab_routes.dart:16`; `routes/saved_routes.dart:9-20`; `routes/checklist_routes.dart:11-14`; `routes/auth_routes.dart` |
| **Deskripsi** | Route `/settings` (+6 sub), `/notifications`, `/saved/destinations`, `/saved/plans`, `/saved/checklists`, `/checklist/done`, `/auth/otp`, `/auth/forgot-password` terdaftar tetapi **tidak dipanggil dari mana pun**. Stat "Tersimpan" di Profil justru diberi `onTap: null`; ikon lonceng di Beranda hanya `Container` tanpa gestur; "Lupa kata sandi?" hanya teks. |
| **HEART** | Task Success, Adoption |
| **Indikator** | DO, RT |
| **Severity** | 4 — Critical |
| **Validasi via UT** | T2, T5, T7 akan gagal secara struktural. Catat waktu pencarian lokasi fitur, jumlah layar yang dibuka, dan apakah partisipan bertanya kepada moderator. **Wajib:** sediakan jalur sementara agar task dapat dijalankan (lihat `00_asumsi.md` A-11). |

### HYP-05 — Ukuran target sentuh di bawah ambang dan berdesakan
| Field | Isi |
| --- | --- |
| **ID** | HYP-05 |
| **Lokasi** | `shared/widgets/dn_chip.dart:32`; `shared/widgets/dn_segmented.dart:38-40`; `shared/widgets/dn_section_header.dart:28-31`; `features/explore/presentation/explore_screen.dart:173-206`; `features/destination/presentation/destination_detail_screen.dart:94-137`; `features/plan/presentation/create_plan_screen.dart:257-266,300-341`; `features/checklist/presentation/checklist_screen.dart:171-201` |
| **Deskripsi** | Chip 32 dp, segmen efektif 36 dp, area aksi "Lihat semua" ±20 dp, tombol hapus/tutup 16–24 dp, stepper 28×28 dp, tombol kembali & bookmark 36×36 dp — semuanya di bawah 48×48 dp dan sering berjajar rapat. Sebagian berada di pojok atas (di luar *thumb-zone*). |
| **HEART** | Task Success, Happiness |
| **Indikator** | MC, WT, DO |
| **Severity** | 4 — Critical |
| **Validasi via UT** | Ukur **error rate** (salah pilih/salah ketuk), jumlah tap berulang pada target yang sama, dan jumlah *gesture ragu*. Bandingkan dengan task yang memakai target ≥48 dp (mis. CTA sticky detail destinasi). |

### HYP-06 — CTA & aksi mati yang tampak sangat interaktif (dead affordance)
| Field | Isi |
| --- | --- |
| **ID** | HYP-06 |
| **Lokasi** | `features/destination/presentation/destination_detail_screen.dart:122-137,376-380,412-441,560-591`; `features/home/presentation/beranda_screen.dart:75-81,237-263,282-303,379-391`; `features/ai/presentation/ai_results_screen.dart:164-178`; `features/facilities/presentation/facility_detail_screen.dart:162-192`; `features/onboarding/presentation/onboarding_screen.dart:82-90` |
| **Deskripsi** | Kartu AI di Beranda, lonceng & avatar, empat tile aktivitas, kartu fasilitas, zoom/recenter peta, "Buka di peta", bookmark destinasi, kartu checklist tersimpan, kartu "Destinasi terkait", chip recap di hasil AI, dan tiga titik onboarding — semuanya tampil seperti kontrol tetapi tidak merespons apa pun. |
| **HEART** | Task Success, Happiness |
| **Indikator** | RT, MC, DO |
| **Severity** | 4 — Critical |
| **Validasi via UT** | Hitung **dead click** (ketukan pada elemen tanpa efek) per task. Ini indikator rage tap paling langsung: frekuensi ketukan berulang pada elemen yang sama dalam < 2 detik, dan kutipan frustrasi. |

---

## 3. Temuan major (severity 3)

### HYP-07 — Filter dan pengurutan tidak mengubah hasil
| Field | Isi |
| --- | --- |
| **ID** | HYP-07 |
| **Lokasi** | `features/explore/presentation/explore_screen.dart:279-301,511-518`; `app/state/search_state.dart:16-28`; `features/home/presentation/beranda_screen.dart:179-183`; `features/facilities/presentation/facilities_screen.dart:145-169` |
| **Deskripsi** | Chip "Urutkan", "Tingkat kesulitan", dan "Fasilitas" menulis ke `SearchState`, tetapi `searchResults` hanya memakai `query`. Label urutan berubah, isi daftar tidak. Chip kategori di Beranda juga tidak memfilter apa pun dan chip pertama selalu aktif. |
| **HEART** | Task Success, Happiness |
| **Indikator** | MC, WT, RT |
| **Severity** | 3 — Major |
| **Validasi via UT** | T1 & T6. Catat apakah partisipan menyadari hasil tidak berubah (uji verifikasi mandiri), waktu hingga menyadari, dan kepercayaan terhadap hasil pencarian. |

### HYP-08 — Jalan buntu pada alur AI
| Field | Isi |
| --- | --- |
| **ID** | HYP-08 |
| **Lokasi** | `features/ai/presentation/ai_preferences_screen.dart:46-56,76-81,113-117,177-183`; `data/models/ai_recommendation.dart:47-52`; `features/ai/presentation/ai_results_screen.dart:53-54,95-100,247-254` |
| **Deskripsi** | Layar preferensi AI dibuka dengan `context.go` sehingga menjadi *root*; tombol kembali memakai `context.pop()` → tidak berfungsi, dan layar ini tidak menampilkan navigasi bawah. Chip durasi/kesulitan **tidak bisa dibatalkan** karena `copyWith` memakai `??`. Form terisi penuh sejak awal sehingga CTA aktif tanpa usaha. "Tanya lagi" dan "Ubah preferensi" berperilaku identik. Tombol "Tambah" menyimpan ke Favorit, bukan ke rencana. |
| **HEART** | Task Success, Happiness, Adoption |
| **Indikator** | RT, DO, WT |
| **Severity** | 3 — Major |
| **Validasi via UT** | T6. Ukur keberhasilan keluar dari alur tanpa restart aplikasi; catat jumlah ketukan pada elemen yang tidak merespons dan kebutuhan intervensi moderator. |

### HYP-09 — Alur "buat rencana" terbelah dua dan membuang masukan
| Field | Isi |
| --- | --- |
| **ID** | HYP-09 |
| **Lokasi** | `features/plan/presentation/create_plan_screen.dart:19-21,73-79,170-172,223-233,359-363`; `features/plan/presentation/select_destination_screen.dart:23,63-72`; `features/plan/presentation/plan_new_screen.dart:50,88-93,108,194-203` |
| **Deskripsi** | Dua alur paralel (`/plan/create` dan `/plan/new`) dengan perilaku berbeda. Alur `/plan/create` tidak punya validasi, membuang seluruh masukan, dan mengabaikan hasil pemilihan destinasi (`pop(_selectedIds)` tidak dibaca). Tanggal **selalu** berlabel "… Jul 2026". Stepper jumlah orang 28×28 dp. Alur `/plan/new` menampilkan layar sukses yang kosong (`0 destinasi`, "-"). |
| **HEART** | Task Success, Happiness |
| **Indikator** | DO, WT, MC |
| **Severity** | 3 — Major |
| **Validasi via UT** | T4. Ukur TCR & ToT; catat jumlah percobaan ulang dan momen partisipan menyadari pilihannya tidak tersimpan. |

### HYP-10 — Tombol kembali tidak konsisten & tidak selalu berfungsi
| Field | Isi |
| --- | --- |
| **ID** | HYP-10 |
| **Lokasi** | `shared/widgets/dn_app_bar.dart:44`; `features/destination/presentation/destination_detail_screen.dart:94-112`; `features/checklist/presentation/checklist_screen.dart:81-87`; `app/router/app_router.dart:35-40` |
| **Deskripsi** | `DnAppBar` memakai `Navigator.maybePop()` yang gagal senyap pada route hasil `context.go` (mis. alur AI); detail destinasi memakai header kustom 36×36 tanpa tooltip; tombol kembali checklist mengarah ke `/plan` bukan ke layar asal; tab memakai `context.go` sehingga back sistem keluar dari aplikasi alih-alih kembali ke Beranda. |
| **HEART** | Task Success |
| **Indikator** | RT, MC |
| **Severity** | 3 — Major |
| **Validasi via UT** | Hitung **back-step** per task dan jumlah kasus partisipan meninggalkan aplikasi tanpa sengaja. |

### HYP-11 — Prasyarat masuk (login/onboarding) menambah beban awal
| Field | Isi |
| --- | --- |
| **ID** | HYP-11 |
| **Lokasi** | `features/onboarding/presentation/splash_screen.dart:24-26`; `features/onboarding/presentation/onboarding_screen.dart:82-90,104-111`; `app/router/app_router.dart:18-44`; `features/auth/presentation/login_screen.dart:192-233,257-292` |
| **Deskripsi** | Splash menahan 1.600 ms tanpa bisa dilewati; "Lewati" pada onboarding tetap diarahkan ke login (label menyesatkan); onboarding menampilkan tiga titik indikator padahal hanya satu halaman statis; "Ingat saya" adalah kotak centang tergambar (bukan kontrol); "Lupa kata sandi?" dan "Daftar" di bawah bukan tombol; tombol "Google" tidak berfungsi. |
| **HEART** | Task Success, Adoption |
| **Indikator** | DO, RT, WT |
| **Severity** | 3 — Major |
| **Validasi via UT** | Ukur waktu hingga konten pertama terlihat, jumlah ketukan yang tidak menghasilkan apa pun sebelum masuk, dan tingkat penyelesaian tahap masuk. |

### HYP-12 — Teks kecil & ketiadaan dukungan pembesaran teks
| Field | Isi |
| --- | --- |
| **ID** | HYP-12 |
| **Lokasi** | `app/theme/app_text_styles.dart:67-73`; `shared/widgets/dn_bottom_nav.dart:90`; `shared/widgets/dn_difficulty_badge.dart`; `features/destination/presentation/destination_detail_screen.dart:260-268`; `features/checklist/presentation/checklist_screen.dart:342`; `features/plan/presentation/trip_plan_screen.dart:362,428` |
| **Deskripsi** | Ukuran 11 sp dipakai untuk label penting (navigasi bawah, badge kesulitan, label spesifikasi, timestamp) dan 10 sp inline. Tidak ada `textScaler`/`MediaQuery.textScaleFactor` sama sekali sehingga pembesaran teks sistem berpotensi menyebabkan overflow. |
| **HEART** | Happiness, Task Success |
| **Indikator** | WT, DO |
| **Severity** | 3 — Major |
| **Validasi via UT** | Sesi tambahan dengan pembesaran teks 1,3×–1,5×; catat apakah label terpotong/overflow dan apakah partisipan salah membaca status. |

### HYP-13 — Tidak ada indikator proses (loading) di seluruh alur kecuali login
| Field | Isi |
| --- | --- |
| **ID** | HYP-13 |
| **Lokasi** | seluruh `features/**/presentation/*.dart`; `features/auth/presentation/login_screen.dart:237-242`; `data/api/api_client.dart:28` |
| **Deskripsi** | Hanya login yang memiliki status memproses (itupun hanya penggantian teks tombol, tanpa spinner). Semua layar data tidak memiliki skeleton/spinner karena membaca `SeedData` secara sinkron. Tidak ada state gagal/retry pada form apa pun kecuali login. |
| **HEART** | Happiness, Task Success |
| **Indikator** | WT, DO |
| **Severity** | 3 — Major |
| **Validasi via UT** | T6 (kondisi jaringan lambat): ukur jumlah ketukan ulang pada CTA, laporan partisipan tentang "aplikasi beku", dan apakah CTA ditekan berkali-kali. |

### HYP-14 — Konteks pengguna hilang antar-layar
| Field | Isi |
| --- | --- |
| **ID** | HYP-14 |
| **Lokasi** | `app/router/routes/plan_routes.dart`; `features/plan/presentation/trip_plan_screen.dart:292-298,441`; `features/plan/presentation/plan_item_detail_screen.dart:23-28`; `features/checklist/presentation/checklist_screen.dart:22`; `features/facilities/presentation/facilities_screen.dart:43,104-110`; `features/destination/presentation/destination_detail_screen.dart:560-569` |
| **Deskripsi** | Kartu hari pada rencana selalu membuka detail "Gunung Bromo"; checklist selalu berjudul destinasi yang sama; fasilitas selalu default ke satu destinasi; baris "Kebutuhan pendukung" selalu menampilkan dua item hardcoded; membuka "Lihat semua" fasilitas tanpa membawa identitas destinasi. |
| **HEART** | Task Success, Happiness |
| **Indikator** | MC, RT |
| **Severity** | 3 — Major |
| **Validasi via UT** | T4 & T6: periksa apakah partisipan menyadari datanya tidak sesuai konteks; catat ekspresi/ucapan kebingungan dan jumlah langkah koreksi. |

### HYP-15 — Umpan balik semu (sukses palsu) pada aksi simpan/kirim
| Field | Isi |
| --- | --- |
| **ID** | HYP-15 |
| **Lokasi** | `features/checklist/presentation/checklist_screen.dart:396-408`; `features/checklist/presentation/add_checklist_item_screen.dart:44-79`; `features/profile/presentation/edit_profile_screen.dart:67-92`; `features/auth/presentation/forgot_password_screen.dart:39-58`; `features/facilities/presentation/proposal_success_screen.dart:30-41`; `features/auth/presentation/change_password_screen.dart:44-78` |
| **Deskripsi** | Banyak aksi menampilkan pesan sukses tanpa benar-benar menyimpan, tanpa memvalidasi, atau menampilkan data contoh: "Tandai siap", "Tambah item", "Simpan profil", "kirim tautan atur ulang" (email apa pun diterima), layar sukses usulan selalu memakai data hardcoded, dan ubah kata sandi sukses hanya dengan 1 karakter. |
| **HEART** | Happiness, Trust (bagian Task Success) |
| **Indikator** | RT, MC, DO |
| **Severity** | 3 — Major |
| **Validasi via UT** | T3 & T7: minta partisipan memverifikasi hasil. Catat apakah mereka menemukan data tidak tersimpan (kurva kepercayaan) dan jumlah pengulangan. |

### HYP-16 — Aksi destruktif tanpa konfirmasi & navigasi bertumpuk
| Field | Isi |
| --- | --- |
| **ID** | HYP-16 |
| **Lokasi** | `features/plan/presentation/plan_item_detail_screen.dart:307-321`; `features/saved/presentation/saved_destinations_screen.dart:91-95,152-171`; `features/facilities/presentation/proposal_success_screen.dart:93-102`; `features/plan/presentation/plan_success_screen.dart` |
| **Deskripsi** | "Hapus item" pada detail rencana langsung keluar tanpa dialog & tanpa undo, berbeda dari pola `DnDialog` yang sudah dipakai di layar Tersimpan lain; hapus destinasi tersimpan tanpa konfirmasi meski tombol menempel di area tap kartu; layar sukses di-`push` di atas form sehingga tombol kembali mengembalikan form terisi (risiko pengiriman ganda). |
| **HEART** | Task Success, Happiness |
| **Indikator** | MC, RT |
| **Severity** | 3 — Major |
| **Validasi via UT** | T4/T7: hitung penghapusan tak sengaja, jumlah back-step untuk memulihkan, dan kebutuhan bantuan moderator. |

---

## 4. Temuan medium (severity 2)

### HYP-17 — Validasi form hanya muncul setelah kirim (dan sering tak terjangkau)
| Field | Isi |
| --- | --- |
| **ID** | HYP-17 |
| **Lokasi** | `features/auth/presentation/login_screen.dart:38,162-188`; `features/auth/presentation/otp_screen.dart:69-86,180-183`; `features/plan/presentation/plan_new_screen.dart:50,88-93`; `features/facilities/presentation/propose_facility_screen.dart:56-74`; `features/checklist/presentation/add_checklist_item_screen.dart:44-54`; `shared/widgets/dn_buttons.dart:34` |
| **Deskripsi** | Error baru muncul setelah submit; sebagian pesan error **tidak pernah bisa muncul** karena CTA sudah dinonaktifkan lebih dulu (nama wajib kosong, OTP < 6 digit). Tombol nonaktif hanya berubah latar ke `canvasSubtle` tanpa penjelasan, sehingga pengguna tidak tahu apa yang kurang. Tidak ada validasi inline saat mengetik/meninggalkan field. |
| **HEART** | Task Success, Happiness |
| **Indikator** | WT, RT |
| **Severity** | 2 — Medium |
| **Validasi via UT** | Hitung jumlah submit gagal, waktu untuk memperbaiki field, dan jumlah ketukan pada CTA nonaktif. |

### HYP-18 — Tidak ada perlindungan perubahan yang belum disimpan
| Field | Isi |
| --- | --- |
| **ID** | HYP-18 |
| **Lokasi** | seluruh form (`create_plan_screen`, `plan_new_screen`, `select_destination_screen`, `select_facility_screen`, `add_checklist_item_screen`, `propose_facility_screen`, `edit_profile_screen`, `ai_preferences_screen`, `change_password_screen`) |
| **Deskripsi** | Tidak ada `PopScope`/`WillPopScope` di seluruh repo. Menekan kembali saat form terisi langsung membuang seluruh isian tanpa dialog konfirmasi. |
| **HEART** | Happiness, Task Success |
| **Indikator** | RT, WT |
| **Severity** | 2 — Medium |
| **Validasi via UT** | Amati reaksi saat kembali di tengah pengisian; hitung berapa kali partisipan harus mengulang pengisian. |

### HYP-19 — State nonaktif dan elemen pasif sulit dibedakan dari yang aktif
| Field | Isi |
| --- | --- |
| **ID** | HYP-19 |
| **Lokasi** | `shared/widgets/dn_buttons.dart:34`; `shared/widgets/dn_chip.dart`; `shared/widgets/dn_checklist_item.dart:24`; `shared/widgets/dn_menu_row.dart` |
| **Deskripsi** | Tombol nonaktif hanya berubah warna latar (mirip field biasa); chip aktif/nonaktif hanya berbeda warna; kotak centang checklist 24×24 tanpa gestur sendiri; chevron pada baris menu selalu tampil meski tanpa aksi. |
| **HEART** | Task Success, Happiness |
| **Indikator** | MC, RT |
| **Severity** | 2 — Medium |
| **Validasi via UT** | Catat salah persepsi ("saya kira tombolnya aktif") dan jumlah ketukan pada elemen nonaktif. |

### HYP-20 — Empty state tanpa jalan pemulihan
| Field | Isi |
| --- | --- |
| **ID** | HYP-20 |
| **Lokasi** | `features/facilities/presentation/facilities_screen.dart:171-179`; `features/plan/presentation/select_destination_screen.dart:77-81,111-114`; `shared/widgets/dn_empty_state.dart:42`; `features/explore/presentation/explore_screen.dart:228-233` |
| **Deskripsi** | Empty state Fasilitas tidak punya tombol reset filter; pencarian destinasi tanpa hasil tidak menampilkan apa pun; copy varian gagal meminta "Tarik ke bawah untuk mencoba lagi" padahal tidak ada pull-to-refresh di seluruh aplikasi; default filter menyembunyikan 3 dari 6 item sementara header tetap menulis "6 fasilitas". |
| **HEART** | Engagement, Task Success |
| **Indikator** | DO, WT, RT |
| **Severity** | 2 — Medium |
| **Validasi via UT** | T6/T1: ukur keberhasilan pulih dari hasil kosong tanpa bantuan; catat gestur menggeser ke bawah yang tidak menghasilkan apa pun. |

### HYP-21 — Konten panjang menenggelamkan aksi & informasi
| Field | Isi |
| --- | --- |
| **ID** | HYP-21 |
| **Lokasi** | `features/home/presentation/beranda_screen.dart:305-346`; `features/destination/presentation/destination_detail_screen.dart:42-78`; `features/ai/presentation/ai_preferences_screen.dart` |
| **Deskripsi** | CTA "Susun rencana" berada di dasar gulir (sekitar tiga layar dari atas) dan tidak melekat; konten detail destinasi berisi ±2,5 layar dengan peta & fasilitas di bawah lipatan; form preferensi AI sangat panjang dalam satu layar. |
| **HEART** | Task Success, Engagement |
| **Indikator** | WT, DO |
| **Severity** | 2 — Medium |
| **Validasi via UT** | Ukur kedalaman gulir sebelum aksi ditemukan, waktu, dan jumlah partisipan yang tidak menemukan aksi. |

### HYP-22 — Indikator status/nav yang lemah
| Field | Isi |
| --- | --- |
| **ID** | HYP-22 |
| **Lokasi** | `shared/widgets/dn_bottom_nav.dart:90`; `features/notifications/presentation/notifications_screen.dart:98-101`; `features/saved/presentation/saved_proposals_screen.dart:148-153` |
| **Deskripsi** | Tab aktif hanya ditandai garis 3 px tanpa penanda aksesibilitas; notifikasi belum dibaca hanya dibedakan titik 8 px dan latar sangat halus; status "Menunggu" memakai teks 11 sp warna `warning` yang gagal kontras. |
| **HEART** | Happiness |
| **Indikator** | WT, MC |
| **Severity** | 2 — Medium |
| **Validasi via UT** | Minta partisipan menyebutkan status item; ukur akurasi & waktu pembacaan. |

### HYP-23 — Elemen dekoratif/placeholder tampak dapat dibuka
| Field | Isi |
| --- | --- |
| **ID** | HYP-23 |
| **Lokasi** | `shared/widgets/dn_media_placeholder.dart`; `features/destination/presentation/destination_detail_screen.dart:144-153,443-475`; `features/facility/.../facility_detail_screen.dart:62-65`; `features/ai/presentation/ai_results_screen.dart:164-178` |
| **Deskripsi** | Placeholder gambar besar tanpa label, chip nama lokasi berbayang, dan chip ringkasan preferensi berbentuk sama dengan chip interaktif. |
| **HEART** | Happiness |
| **Indikator** | RT, MC |
| **Severity** | 2 — Medium |
| **Validasi via UT** | Hitung dead click pada elemen dekoratif. |

### HYP-24 — Konteks data salah mengurangi kepercayaan
| Field | Isi |
| --- | --- |
| **ID** | HYP-24 |
| **Lokasi** | `features/facilities/presentation/facility_detail_screen.dart:42-45`; `features/plan/presentation/plan_success_screen.dart:18-20`; `features/plan/presentation/create_plan_screen.dart:223-233`; `features/profile/presentation/profile_screen.dart:22`; `data/seed/seed_data.dart:283-285,532-536` |
| **Deskripsi** | Identitas tidak dikenal diam-diam jatuh ke data contoh; layar sukses menampilkan nilai kosong ("-", "0 destinasi"); tanggal selalu berlabel bulan yang sama; angka "Tersimpan" di profil di-hardcode; notifikasi menuju layar hasil AI yang masih kosong; riwayat pencarian bawaan tidak cocok dengan data katalog. |
| **HEART** | Happiness (kepercayaan), Task Success |
| **Indikator** | DO, RT |
| **Severity** | 2 — Medium |
| **Validasi via UT** | Catat momen partisipan menyadari data tidak sesuai dan dampaknya pada penyelesaian task. |

### HYP-25 — Pintasan "cs" pada form: tombol kembar & aksi ambigu
| Field | Isi |
| --- | --- |
| **ID** | HYP-25 |
| **Lokasi** | `features/profile/presentation/edit_profile_screen.dart:108-119,160-164`; `features/ai/presentation/ai_preferences_screen.dart:141-149,245-250`; `features/ai/presentation/ai_results_screen.dart:95-100` |
| **Deskripsi** | Dua tombol simpan identik pada edit profil; dua jalur kirim pada form AI (ikon kirim tanpa label di dalam kotak teks dan CTA melekat); "Tanya lagi" dan "Ubah preferensi" memiliki perilaku yang sama meski berlabel berbeda. |
| **HEART** | Happiness |
| **Indikator** | MC, WT |
| **Severity** | 2 — Medium |
| **Validasi via UT** | Catat pilihan yang diambil partisipan dan waktu ragu sebelum menekan. |

### HYP-26 — Masalah tata letak pada perangkat sempit & teks panjang
| Field | Isi |
| --- | --- |
| **ID** | HYP-26 |
| **Lokasi** | `features/facilities/presentation/facilities_screen.dart:145-169`; `features/facility_detail/.../facility_detail_screen.dart:225-236`; `shared/widgets/dn_otp_input.dart:69-103`; `shared/widgets/dn_destination_card.dart`; `features/checklist/presentation/checklist_screen.dart:171-201` |
| **Deskripsi** | Tiga chip dalam satu baris berpotensi melampaui lebar layar 360 dp; label "Hubungi via WhatsApp" berpotensi terpotong elipsis; enam kotak OTP berpotensi melampaui lebar pada 320 dp; judul kartu destinasi dibatasi satu baris. |
| **HEART** | Task Success, Happiness |
| **Indikator** | MC, WT |
| **Severity** | 2 — Medium |
| **Validasi via UT** | Verifikasi di perangkat 360 dp; catat kesan "aplikasi rusak" dan kesalahan membaca label. |

### HYP-27 — Aplikasi tidak memberi tahu kondisi data offline/bermasalah
| Field | Isi |
| --- | --- |
| **ID** | HYP-27 |
| **Lokasi** | `data/api/api_client.dart:69-87`; `app/state/destinations_state.dart:31`; `features/home/presentation/beranda_screen.dart:227-236`; `data/local/*` |
| **Deskripsi** | Tidak ada deteksi konektivitas; kegagalan API hanya menimpa data contoh secara senyap; status offline/tersimpan hanya berupa teks kecil di satu layar; kegagalan penyimpanan sesi dibungkam. |
| **HEART** | Happiness (kepercayaan), Task Success |
| **Indikator** | DO, RT |
| **Severity** | 2 — Medium |
| **Validasi via UT** | T6 pada jaringan buruk: catat apakah partisipan menyadari data yang dilihat adalah data contoh. |

---

## 5. Temuan minor (severity 1)

| ID | Lokasi | Deskripsi | HEART | Indikator |
| --- | --- | --- | --- | --- |
| **HYP-28** | `shared/widgets/dn_toast.dart` | Toast hanya 3 detik tanpa tombol tutup/urungkan, dan menjadi satu-satunya umpan balik aksi. | Happiness | WT |
| **HYP-29** | `shared/widgets/dn_dialog.dart` | `confirmLabel` default "Lanjutkan" bila pemanggil lupa mengisi; hirarki ukuran aksi destruktif tidak dibedakan. | Happiness | MC |
| **HYP-30** | `shared/widgets/dn_selectable_row.dart`, `app_theme.dart`, `app_radius.dart` | Inkonsistensi ikon (Material vs `AppIcons`), `pill` ganda, skala spacing tanpa s7/s9. | Happiness | — |
| **HYP-31** | `shared/widgets/dn_search_field.dart:11-13`, `features/home/.../beranda_screen.dart:149-161` | Field pencarian Beranda berpindah ke Jelajah tanpa fokus otomatis (butuh dua ketukan); ikon filter di dalam field hanya memicu perpindahan layar. | Task Success | RT, WT |
| **HYP-32** | `app/state/settings_state.dart`, `features/settings/presentation/settings_theme_screen.dart:27,46,61` | Preferensi tema/bahasa tersimpan tetapi tidak dihormati UI; opsi yang belum ada berlabel "Segera hadir". | Happiness | DO |
| **HYP-33** | `shared/widgets/dn_date_field.dart:116-118` | Placeholder "Pilih tanggal" memakai warna nyaris tak terlihat; hanya ikon chevron yang menandakan dapat diketuk. | Task Success | MC, WT |
| **HYP-34** | `app/router/app_router.dart:35-40`, `features/settings/presentation/settings_screen.dart:179` | Keluar sesi hanya berpindah ke layar masuk tanpa menghapus sesi, lalu guard memantulkan pengguna kembali; perangkat tanpa kredensial valid terjebak di layar masuk saat server tidak aktif. | Task Success | RT, DO |

---

## 6. Prioritas validasi di sesi UT (urutan yang disarankan)

| Prioritas | Hipotesis | Alasan |
| --- | --- | --- |
| 1 | HYP-04, HYP-06 | Menentukan apakah task bisa dijalankan sama sekali; dead affordance = rage tap terbesar |
| 2 | HYP-05, HYP-01 | Berdampak langsung pada TCT & error rate |
| 3 | HYP-03, HYP-15, HYP-02 | Kehilangan hasil kerja & kepercayaan |
| 4 | HYP-07, HYP-08, HYP-09 | Alur inti (jelajah, AI, rencana) tidak tuntas |
| 5 | HYP-17, HYP-20, HYP-16, HYP-13 | Kualitas pemulihan & pencegahan error |
| 6 | HYP-10, HYP-11, HYP-12, HYP-14 | Efisiensi & aksesibilitas |
| 7 | HYP-18 … HYP-34 | Penyempurnaan & konsistensi |

---

## 7. Cara memakai dokumen ini

1. Setiap hipotesis dipetakan ke satu atau lebih task di
   `03_scenario_task_dan_naskah_moderator.md` (kolom **titik observasi**).
2. Derajat kebenaran hipotesis ditetapkan di laporan akhir
   (`01_laporan_UT.md` §9–10) setelah data lapangan tersedia.
3. Hipotesis **tidak boleh** disajikan sebagai temuan final sebelum divalidasi.
