# 00 — Inventaris Aplikasi Dolenae.id (Mobile)

Dokumen ini adalah hasil **Fase 0 (inventarisasi)** dan menjadi basis seluruh
hipotesis pada `02_hipotesis_bottleneck.md` serta jalur ideal pada
`03_scenario_task_dan_naskah_moderator.md`. Seluruh isi diturunkan dari pembacaan
statis kode di `apps/mobile/lib` (100 file Dart). **Tidak ada file yang diubah.**

---

## 1. Ringkasan produk

| Item | Keterangan | Sumber |
| --- | --- | --- |
| Produk | Dolenae.id — *travel discovery* & *trip preparation* destinasi alam Indonesia | `docs/prd/product-overview.md` |
| Core value | *Discover More, Prepare Better* | `docs/prd/product-overview.md` |
| Fase pengguna | Temukan destinasi → pahami kebutuhan perjalanan → siapkan kunjungan | `docs/prd/product-overview.md` |
| Platform uji | Aplikasi mobile Flutter (`apps/mobile`) | Arahan pengguna |
| Backend | Hono API (`apps/server`), base `http://10.0.2.2:3001/api` (emulator Android) | `app/config/app_config.dart` |
| Data | `SeedData` lokal + cache Drift (offline-first) | `data/seed/seed_data.dart`, `data/local/*` |
| State management | Provider (`ChangeNotifier`) + go_router | `app/app.dart`, `app/router/app_router.dart` |
| Bahasa UI | Bahasa Indonesia | — |

---

## 2. Arsitektur folder mobile

```
apps/mobile/lib/
├── main.dart                         # init SharedPreferences + SessionStore sebelum runApp
└── src/
    ├── app/
    │   ├── app.dart                  # MaterialApp.router + 7 Provider
    │   ├── config/app_config.dart    # base URL API
    │   ├── router/                   # app_router.dart + routes/*.dart (11 file route)
    │   ├── state/                    # 8 ChangeNotifier (auth, destinations, search, saved, ...)
    │   └── theme/                    # app_colors, app_text_styles, app_spacing, app_radius, app_shadows, app_theme
    ├── data/
    │   ├── api/                      # api_client, auth_api, destination_api
    │   ├── local/                    # cache_store, session_store, secure_token_store, settings_store, drift DAO
    │   ├── models/                   # 14 model domain
    │   └── seed/seed_data.dart       # seluruh data contoh prototype
    ├── features/                     # 17 feature × presentation (screen)
    └── shared/
        ├── icons/app_icons.dart
        └── widgets/                  # 50 widget Dn* (design system implementasi)
```

---

## 3. Peta route & tab (dari `app/router/`)

### 3.1 Tab utama (`routes/main_tab_routes.dart`)
| Tab | Route | Screen | Ikon berlabel |
| --- | --- | --- | --- |
| Beranda | `/home` | `BerandaScreen` | ya (teks 11 sp) |
| Jelajah | `/explore` | `ExploreScreen` | ya |
| Rencana | `/plan` | `TripPlanScreen` | ya |
| Profil | `/profile` | `ProfileScreen` | ya |

### 3.2 Route lain
| Route | Screen | Pintu masuk UI |
| --- | --- | --- |
| `/splash`, `/onboarding` | `SplashScreen`, `OnboardingScreen` | otomatis |
| `/login` | `LoginScreen` (tab Masuk/Daftar) | guard auth |
| `/auth/forgot-password` | `ForgotPasswordScreen` | **tidak ada** |
| `/auth/otp` | `OtpScreen` | **tidak ada** |
| `/auth/change-password` | `ChangePasswordScreen` | hanya dari `/settings/privacy` |
| `/destination/:id` | `DestinationDetailScreen` | kartu destinasi |
| `/explore` → detail | `ExploreScreen` | tab |
| `/facilities` | `FacilitiesScreen` | header "Lihat semua" di detail destinasi |
| `/facilities/propose`, `/facilities/propose/success` | form usulan | tombol di Fasilitas |
| `/plan/create` | `CreatePlanScreen` | CTA "Tambah ke rencana" |
| `/plan/new` | `PlanNewScreen` | "Ubah" ringkasan rencana / Saved |
| `/plan/select-destination` | `SelectDestinationScreen` | field destinasi |
| `/plan/select-facility` | `SelectFacilityScreen` | detail item rencana |
| `/plan/item` | `PlanItemDetailScreen` | kartu hari di rencana |
| `/plan/success` | `PlanSuccessScreen` | submit rencana baru |
| `/checklist` | `ChecklistScreen` | CTA di detail destinasi |
| `/checklist/add` | `AddChecklistItemScreen` | tombol tambah item |
| `/checklist/done` | `ChecklistDoneScreen` | **tidak ada** |
| `/ai/preferences`, `/ai/results` | AI | kartu AI / tab |
| `/saved/destinations` | `SavedDestinationsScreen` | **tidak ada** |
| `/saved/plans` | `SavedPlansScreen` | **tidak ada** |
| `/saved/checklists` | `SavedChecklistsScreen` | **tidak ada** |
| `/saved/proposals` | `SavedProposalsScreen` | hanya dari layar sukses usulan |
| `/notifications` | `NotificationsScreen` | **tidak ada** |
| `/settings` + 6 sub-route | Settings | **tidak ada** (menu profil hanya SnackBar) |

> **Catatan penting untuk UT:** 8 route tidak memiliki pintu masuk UI (*orphan*).
> Lihat `HYP-04`. Tanpa jalur sementara dari fasilitator, task yang menyasar layar
> tersebut tidak dapat dijalankan.

---

## 4. Inventaris screen per fitur (17 fitur)

| Fitur | Screen | Jumlah langkah dari Beranda | CTA utama | State loading/empty/error |
| --- | --- | --- | --- | --- |
| Onboarding | `SplashScreen`, `OnboardingScreen` | 0 (otomatis) | "Mulai Jelajah" / "Lewati" | splash spinner; tanpa error |
| Auth | `LoginScreen` (+tab Daftar) | 1 | "Masuk"/"Daftar" | loading (label), banner error, tanpa spinner |
| Auth | `ForgotPasswordScreen`, `OtpScreen`, `ChangePasswordScreen` | tak terjangkau | — | hanya toast |
| Home | `BerandaScreen` | — | "Susun rencana" (di dasar scroll) | empty/error ada tapi *dead code* |
| Explore | `ExploreScreen` | 1 | tidak ada CTA | empty `tanpaHasil`; error *dead code* |
| Destination | `DestinationDetailScreen` | 1 | **sticky**: "Checklist" + "Tambah ke rencana" | tanpa loading; fallback seed |
| Facilities | `FacilitiesScreen`, `FacilityDetailScreen` | 3–4 | **sticky**: "Simpan" + "Hubungi via WhatsApp" | empty tanpa reset |
| Facilities | `ProposeFacilityScreen`, `ProposalSuccessScreen` | 5 | "Kirim usulan" | sukses dengan data hardcoded |
| Plan | `TripPlanScreen` | 1 (tab) | "Tambah destinasi" | data demo |
| Plan | `CreatePlanScreen`, `SelectDestinationScreen`, `PlanNewScreen`, `PlanSuccessScreen` | 2–3 | "Buat rencana" | tanpa validasi; sukses kosong |
| Plan | `PlanItemDetailScreen`, `SelectFacilityScreen` | 3–4 | "Ubah" (mati) | — |
| Checklist | `ChecklistScreen`, `AddChecklistItemScreen`, `ChecklistDoneScreen` | 2–3 | "Tandai siap" (toast) | tanpa error; done *orphan* |
| AI | `AiPreferencesScreen`, `AiResultsScreen` | 2 | "Cari rekomendasi" | prefill penuh; error *dead code* |
| Saved | 4 layar tersimpan | tak terjangkau | bervariasi | empty + CTA |
| Notifications | `NotificationsScreen` | tak terjangkau | "Tandai dibaca" (kontras 1:1) | empty ada |
| Profile | `ProfileScreen`, `EditProfileScreen` | 1 | "Simpan" | toast palsu |
| Settings | `SettingsScreen` + 6 sub | tak terjangkau | — | "Segera hadir" untuk dark mode |
| Placeholder | `ComingSoonScreen` | — | — | — |

---

## 5. Design system implementasi (dari `app/theme/`)

### 5.1 Warna (`app_colors.dart`) — nilai & rasio kontras terhitung
| Token | Hex | Dipakai untuk | Kontras vs pasangan utama |
| --- | --- | --- | --- |
| `primary` | #1E3B2E | AppBar, CTA utama | `onPrimary` 12,4:1 (aman) |
| `onPrimary` | #FFFFFF | Teks di atas primary | — |
| `canvas` | #F4F1E9 | Latar utama | — |
| `canvasSubtle` | #E8E4D8 | Latar kartu/field | — |
| `ink` | mengikuti tema gelap-alam | Judul | ±7,3:1 vs canvas (aman) |
| `body` | #4A5149 | Teks isi/hint utama | ±7,5:1 vs canvas (aman) |
| `hairline` | #E0DBCF | Border, divider | **±1,2:1 vs canvas** (gagal ambang 3:1) |
| `borderStrong` | #7C8A7E | Placeholder/hint | **±2,86:1 vs canvasSubtle** (gagal 4,5:1) |
| `warning` | #A9781F | Badge "Menengah", status "Menunggu" | **±3,3–3,5:1** (gagal untuk teks kecil) |
| `danger` | #A3402E | Aksi destruktif | ±4,4:1 (di batas ambang) |
| `success` | — | Status selesai | ±4,9:1 (lolos tipis) |
| `primary` di atas `primary` | — | Tombol "Tandai dibaca" | **1:1 (tak terlihat)** |

### 5.2 Tipografi (`app_text_styles.dart`)
| Token | Ukuran | Catatan |
| --- | --- | --- |
| `overline` | **11 sp** | dipakai untuk label bottom nav, timestamp, badge kesulitan, label spesifikasi |
| Inline non-token | **10 sp** | `checklist_screen.dart`, `trip_plan_screen.dart` |
| Gaya inline non-token | 17/13/12/15/14 | `dn_destination_card.dart` → dua sumber kebenaran tipografi |
| `textScaler` | **0 kemunculan** | tidak ada dukungan pembesaran teks sistem |

### 5.3 Spacing & radius
- `app_spacing.dart`: skala 4 px (s1–s16), **tanpa s7/s9** → memaksa nilai inline.
- `app_radius.dart`: `pill = 9999` dipakai bergantian dengan `BorderRadius.circular(99)`.

---

## 6. Widget bersama (`shared/widgets`, 50 file `Dn*`)

| Widget | Fungsi | Catatan audit |
| --- | --- | --- |
| `DnPrimaryButton` / `DnOutlineButton` / `DnGhostButton` | tombol | 48 / 44 / 44 dp; tanpa `Semantics(button:)` |
| `DnBottomNav` | navigasi 4 tab | label 11 sp, `overflow: clip`, tanpa `Semantics(selected:)` |
| `DnSearchField` | pencarian | dua mode (TextField vs tombol) → terlihat bisa diketik tapi diam |
| `DnChip` | filter/pilihan | tinggi **32 dp** |
| `DnSegmented` | filter kategori | target efektif 36 dp, tanpa ripple |
| `DnSectionHeader` | judul seksi + aksi | area tap "Lihat semua" ±20 dp, bisa tanpa `onAction` |
| `DnDestinationCard` | kartu destinasi | gaya teks inline, judul 1 baris ellipsis |
| `DnMenuRow` | baris menu | chevron selalu tampil meski `onTap` null |
| `DnEmptyState` | empty/error | 5 varian; varian `gagal` menyebut "Tarik ke bawah" padahal tak ada pull-to-refresh |
| `DnDialog` | konfirmasi | `confirmLabel` default "Lanjutkan"; tidak dipakai untuk hapus item rencana |
| `DnToast` | umpan balik | durasi 3 s, tanpa tombol tutup/tindakan |
| `DnAppBar` | app bar | tooltip "Kembali" ada; `maybePop` bisa gagal pada route hasil `context.go` |
| `DnOtpInput` | input OTP | 6 kotak 48 px, `TextField` `Opacity(0)` |
| `DnStepper` | stepper | tombol 40×40 |
| `DnDateField` | tanggal | placeholder nyaris tak terlihat |
| `DnChecklistItem` | item checklist | kotak centang 24×24 tanpa gestur sendiri |

**Aksesibilitas (hasil grep seluruh `lib`):**
| Properti | Jumlah |
| --- | --- |
| `Semantics(` | **0** |
| `MergeSemantics` | **0** |
| `ExcludeSemantics` | **0** |
| `semanticLabel` | **0** |
| `tooltip:` | **8** (7 widget + 1 layar) |

---

## 7. Layer data & ketahanan koneksi

| Komponen | Perilaku | Catatan |
| --- | --- | --- |
| `ApiClient` | timeout **15 detik**, tanpa retry/backoff | pesan timeout & koneksi kontekstual |
| Connectivity listener | **tidak ada** (`connectivity_plus` tidak dipakai) | state offline tak terdeteksi |
| `DestinationsState` | context terisi `SeedData.destinations`, lalu ditimpa API; `error` tersimpan tapi tak ditampilkan | error senyap |
| Cache Drift (`destination_dao`) | menyimpan `fetchedAt` | teks kecil "Tersimpan offline · …" di Beranda |
| `SessionStore` + `SecureTokenStore` | kegagalan dibungkam (`catch (_)`) | pengguna bisa "tiba-tiba" jadi tamu |
| `SettingsStore` | satu-satunya state persist (SharedPreferences) | `theme`/`language` tidak dihormati UI |
| `AuthState` | `logout()` benar, tetapi tombol logout memakai `context.go('/login')` | dikembalikan guard ke `/home` |

---

## 8. Kondisi awal data untuk UT (pra-pengisian yang memengaruhi validitas)

| Layar | Pra-pengisian | Dampak |
| --- | --- | --- |
| Login | email & password terisi kredensial demo | partisipan bisa menekan Masuk tanpa memahami |
| `CreatePlanScreen` | "Trip Bromo", "Gunung Bromo", "12 - 14 Jul 2026" | form terlihat sudah selesai |
| `SelectDestinationScreen` | 2 destinasi terpilih | CTA "Tambahkan 2 destinasi" sebelum memilih |
| `SelectFacilityScreen` | 1 fasilitas terpilih | CTA menghitung lintas kategori |
| `AddChecklistItemScreen` | nama & catatan terisi | memicu duplikasi |
| `AiPreferencesScreen` | prompt + seluruh chip + budget terisi | CTA aktif sejak awal, tanpa usaha |
| `EditProfileScreen` | profil contoh terisi | — |
| Checklist | 7 item, 5 selesai | tidak mengukur alur awal |
| Pencarian | riwayat "gunung di jawa barat" yang tidak cocok dengan data | hasil kosong seketika |
| Splash | jeda tetap 1.600 ms | menambah waktu setiap tugas |

---

## 9. Batasan inventarisasi

1. Audit dilakukan pada **kode**, bukan pada build yang berjalan; overflow/rendering
   (HYP-05, HYP-33) masih berupa **perkiraan** dan wajib diverifikasi di perangkat.
2. Perhitungan kontras memakai rumus WCAG dari nilai hex token; nilai `ink` yang
   bergantung tema perlu diukur ulang dengan *color picker*.
3. Kanvas Figma tidak diakses (A-01).
4. Perilaku *runtime* (ripple, animasi, kecepatan render) belum diverifikasi.
