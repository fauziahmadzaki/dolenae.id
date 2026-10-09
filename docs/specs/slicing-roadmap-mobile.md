# Roadmap Slicing Mobile — Dolenae.id

Pemetaan **halaman mana yang sudah sliced dan mana yang belum**, plus urutan
pengerjaan yang disarankan. Sumber:

- Desain: page `Hi-Fi (Mobile)` (`53:9544`) — 57 frame, inventaris + node id di
  [`ui-ux-hifi-mobile.md`](./ui-ux-hifi-mobile.md).
- Kode: `apps/mobile/lib/src` (Flutter, `go_router`, tema "Alam").
- Komponen: 39 component set di page `Design System (Alam)`, 35 di antaranya
  mobile — [`design-system-hifi.md`](./design-system-hifi.md) §4.

Legenda status: ✅ sliced · 🟡 ada tapi belum tuntas · ⬜ belum ada kodenya.

---

## 1. Ringkasan

| | Jumlah |
| --- | --- |
| Frame desain mobile | 57 |
| Route yang dibutuhkan | 38 |
| Route sudah ada | **38** |
| Route belum ada | **0** |
| Sheet / dialog (bukan route) | 4 |
| State (varian layar, bukan route) | 10 |
| Galeri status (referensi, bukan route) | 3 |
| Component set mobile | 35 |
| Sudah jadi widget `dn_*` | **35** |
| Sebagian | 0 |
| Belum ada | **0** |

Kode saat ini: 16.487 baris Dart, 39 widget `dn_*`, 39 route terdaftar
(termasuk `/` splash), 125 test widget.

Semua 57 frame hi-fi sudah ada implementasinya. Yang belum ada hanya pemanggilan
jaringan sungguhan: seluruh data masih datang dari `SeedData`.

> Catatan: `SplashScreen` ada di kode tapi **tidak punya frame hi-fi** di
> `ui-ux-hifi-mobile.md`. Kalau mau ikut di-review desainnya, perlu frame
> baru atau dib cataract dari peta ini.

---

## 2. Peta halaman (57 frame)

### 2.1 Onboarding & Auth (5 frame)

| Frame | Node | Bentuk | Route | Status |
| --- | --- | --- | --- | --- |
| Onboarding (Mobile) | `80:74` | route | `/onboarding` | ✅ |
| Masuk dan Daftar (Mobile) | `80:96` | route | `/login` | ✅ |
| Lupa Kata Sandi (Mobile) | `80:203` | route | `/auth/forgot-password` | ✅ |
| Verifikasi OTP (Mobile) | `80:144` | route | `/auth/otp` | ✅ |
| Ubah Kata Sandi (Mobile) | `80:169` | route | `/auth/change-password` | ✅ sudah dihubungkan dari Privasi |

### 2.2 Beranda & Jelajah + pencarian (8 frame)

| Frame | Node | Bentuk | Route | Status |
| --- | --- | --- | --- | --- |
| Beranda (Mobile) | `56:9996` | route | `/home` | ✅ 10 section lengkap |
| Jelajah (Mobile) | `65:389` | route | `/explore` | ✅ |
| Pencarian Rekomendasi (Mobile) | `86:2186` | state | state fokus `/explore` | ✅ |
| Pencarian Hasil (Mobile) | `86:2306` | state | state hasil `/explore` | ✅ |
| Pencarian Kosong (Mobile) | `86:2417` | state | state kosong `/explore` | ✅ |
| Filter Dialog (Mobile) | `86:2485` | sheet | `DnBottomSheet` tipe Filter | ✅ |
| Gagal Memuat Beranda (Mobile) | `101:243` | state | error `/home` | ✅ `hasError` + `onRetry`/`onReload` |
| Gagal Memuat Katalog (Mobile) | `101:302` | state | error `/explore` | ✅ `hasError` + `onRetry`/`onResetFilter` |

Desainnya memang **satu halaman** untuk pencarian (lihat §11 `ui-ux-hifi-mobile.md`):
field cari di bawah AppBar Jelajah, isi berganti per state, filter jadi bottom
sheet — bukan layar penuh. Jangan dibuat 4 route terpisah.

### 2.3 Detail Destinasi (1 frame)

| Frame | Node | Bentuk | Route | Status |
| --- | --- | --- | --- | --- |
| Detail Destinasi (Mobile) | `65:215` | route | `/destination/:id` | ✅ 9 section, CTA "Fasilitas" → `/facilities` |

### 2.4 Fasilitas (8 frame)

| Frame | Node | Bentuk | Route | Status |
| --- | --- | --- | --- | --- |
| Fasilitas Sekitar (Mobile) | `69:1427` | route | `/facilities` | ✅ |
| Detail Fasilitas - Penginapan (Mobile) | `69:1517` | route | `/facilities/:type` | ✅ |
| Detail Fasilitas - Transport (Mobile) | `69:1597` | route | *(satu route, param tipe)* | ✅ |
| Detail Fasilitas - Makanan (Mobile) | `69:1679` | route | *(satu route, param tipe)* | ✅ |
| Usulkan Fasilitas (Mobile) | `86:1562` | route | `/facilities/propose` | ✅ |
| Usulan Sukses (Mobile) | `86:1609` | route | `/facilities/propose/success` | ✅ |
| Fasilitas Diusulkan (Mobile) | `86:2067` | route | `/saved/proposals` | ✅ |
| Fasilitas Diusulkan Kosong (Mobile) | `86:2104` | state | empty state `/saved/proposals` | ✅ |

Tiga frame "Detail Fasilitas" memakai **satu template** dengan tinggi berbeda
(1012 / 1032 / 986) → cukup 1 route + 1 parameter tipe.

### 2.5 AI (3 frame)

| Frame | Node | Bentuk | Route | Status |
| --- | --- | --- | --- | --- |
| AI Preferensi (Mobile) | `68:651` | route | `/ai/preferences` | ✅ |
| AI Hasil (Mobile) | `68:771` | route | `/ai/results` | ✅ |
| Gagal Memuat AI (Mobile) | `101:358` | state | error `/ai/results` | ✅ `hasError` + `onRetry`/`onChangePreference` |

**Hole ini sudah ditutup.** Tab `AI` dan kartu AI di Beranda, Jelajah,
Rencana, dan Profil semuanya sudah punya tujuan.

### 2.6 Rencana (11 frame)

| Frame | Node | Bentuk | Route | Status |
| --- | --- | --- | --- | --- |
| Rencana Perjalanan (Mobile) | `68:1182` | route | `/plan` | ✅ |
| Buat Rencana Baru (Mobile) | `84:1177` | route | `/plan/create` | ✅ |
| Pilih Destinasi (Mobile) | `84:1221` | route | `/plan/select-destination` | ✅ |
| Pilih Fasilitas (Mobile) | `84:1280` | route | `/plan/select-facility` | ✅ |
| Detail Item Rencana (Mobile) | `84:1326` | route | `/plan/item` | ✅ |
| Konfirmasi Hapus Item (Mobile) | `85:1373` | dialog | `DnDialog` tipe Destruktif | ✅ |
| Rencana Sukses (Mobile) | `85:1386` | route | `/plan/success` | ✅ |
| Tambah Rencana - Pilih (Mobile) | `85:1408` | sheet | `DnBottomSheet` tipe Menu | ✅ |
| Tambah Rencana - Atur (Mobile) | `85:1439` | route | `/plan/new` | ✅ |
| Daftar Rencana (Mobile) | `86:1962` | route | `/saved/plans` | ✅ |
| Daftar Rencana Kosong (Mobile) | `86:1986` | state | empty state `/saved/plans` | ✅ |

### 2.7 Checklist & Usulan (5 frame)

| Frame | Node | Bentuk | Route | Status |
| --- | --- | --- | --- | --- |
| Checklist Persiapan (Mobile) | `68:1036` | route | `/checklist` | ✅ |
| Tambah Item Checklist (Mobile) | `86:1513` | route | `/checklist/add` | ✅ |
| Checklist Selesai (Mobile) | `86:1544` | route | `/checklist/done` | ✅ |
| Checklist Tersimpan (Mobile) | `86:2003` | route | `/saved/checklists` | ✅ |
| Checklist Tersimpan Kosong (Mobile) | `86:2051` | state | empty state `/saved/checklists` | ✅ |

### 2.8 Profil & Pengaturan (10 frame)

| Frame | Node | Bentuk | Route | Status |
| --- | --- | --- | --- | --- |
| Profil (Mobile) | `81:257` | route | `/profile` | ✅ |
| Edit Profil (Mobile) | `81:824` | route | `/profile/edit` | ✅ |
| Pengaturan (Mobile) | `81:877` | route | `/settings` | ✅ |
| Akun (Mobile) | `81:974` | route | `/settings/account` | ✅ |
| Setelan Notifikasi (Mobile) | `81:555` | route | `/settings/notifications` | ✅ |
| Tema dan Bahasa (Mobile) | `81:617` | route | `/settings/theme` | ✅ |
| Privasi dan Keamanan (Mobile) | `81:1032` | route | `/settings/privacy` | ✅ |
| Bantuan FAQ (Mobile) | `81:751` | route | `/settings/faq` | ✅ |
| Kirim Masukan (Mobile) | `81:791` | route | `/settings/feedback` | ✅ |
| Keluar Konfirmasi (Mobile) | `81:864` | dialog | `DnDialog` tipe Konfirmasi | ✅ |

Pola sub-layar ini seragam: AppBar pine "Kembali", grup berlabel `overline`,
kartu `canvas-subtle` + `hairline` berisi baris 56px (ikon bulatan 32px +
label + chevron / Switch / kotak pilih) → **1 grup baris reusable** cukup untuk
8 layar sekaligus.

### 2.9 Notifikasi & Tersimpan (3 frame)

| Frame | Node | Bentuk | Route | Status |
| --- | --- | --- | --- | --- |
| Notifikasi (Mobile) | `86:1808` | route | `/notifications` | ✅ |
| Destinasi Tersimpan (Mobile) | `86:1897` | route | `/saved/destinations` | ✅ |
| Destinasi Tersimpan Kosong (Mobile) | `86:1948` | state | empty state `/saved/destinations` | ✅ |

### 2.10 Galeri status (3 frame — bukan route)

| Frame | Node | Isi | Status |
| --- | --- | --- | --- |
| Error Form (Mobile) | `101:32` | 9 field dengan state `Error` (grup MASUK / DAFTAR / VERIFIKASI / RENCANA) | ✅ microcopy identik, tampil lewat validasi form |
| Empty State (Mobile) | `101:141` | 6 kartu `EmptyState` (3 "belum ada data" + 3 "tidak ada hasil") | ✅ `DnEmptyVariant` 5 tipe |
| Error dan Akses State (Mobile) | `101:200` | Gagal memuat / Offline / Butuh akses / Notifikasi kosong | ✅ 4 dari 4 |

Ketiganya **galeri referensi** untuk nilai status, bukan halaman. Yang
perlu dibangun adalah varian status-nya (`Input`/`PasswordField` state
Error, `EmptyState` tipe Offline dan Akses ditolak) yang dipakai di route
terkait. Semua sudah ada di `DnInput.errorText` dan `DnEmptyVariant`.

---

## 3. Component set (35 dari 35)

Semua 35 component set mobile sudah punya widget `dn_*` di
`apps/mobile/lib/src/shared/widgets/`. Pemetaannya:

| Component set | Widget | Component set | Widget |
| --- | --- | --- | --- |
| `Buttons (Alam)` | `DnPrimaryButton`, `DnOutlineButton`, `DnGhostButton` | `Input (Alam)` | `DnInput` |
| `Switch (Alam)` | `DnSwitch` | `Segmented (Alam)` | `DnSegmented` |
| `SelectableRow (Alam)` | `DnSelectableRow` | `DateField (Alam)` | `DnDateField` |
| `Stepper (Alam)` | `DnStepper` | `PasswordField (Alam)` | `DnInput.obscure` |
| `OtpInput (Alam)` | `DnOtpInput` | `Dialog (Alam)` | `DnDialog` |
| `BottomSheet (Alam)` | `DnBottomSheet` | `Toast (Alam)` | `showDnToast` |
| `NotificationItem (Alam)` | `DnNotificationItem` | `FaqAccordion (Alam)` | `DnFaqAccordion` |
| `PromptInput (Alam)` | `DnPromptInput` | `RecommendationCard (Alam)` | `DnRecommendationCard` |
| `AIRecommendCard (Alam)` | `DnAiCard` | `PlanCard (Alam)` | `DnPlanCard` |
| `TripPlanStep (Alam)` | `DnTripPlanStep` | `BriefingCard (Alam)` | `DnBriefingCard` |
| `SupportRow (Alam)` | `DnSupportRow` | `FacilityTag (Alam)` | `DnFacilityTag` |
| `AuthTabs (Alam)` | `DnAuthTabs` | `PreparationChecklistItem (Alam)` | `DnChecklistItem` |
| `ProgressHeader (Alam)` | `DnProgressHeader` | `EmptyState (Alam)` | `DnEmptyState` + `DnEmptyVariant` (5 tipe) |

Sembilan widget lain tanpa component set tersendiri dipakai bersama:
`DnAppBar` · `DnCard` · `DnChip` · `DnSearchField` · `DnBottomNav` ·
`DnDestinationCard` · `DnSupportCard` · `DnMenuRow` · `DnSectionHeader` ·
`DnDifficultyBadge` · `DnProgressBar` · `DnActivityTile` · `DnIconCircle` ·
`DnMediaPlaceholder`.

---

## 4. Urutan pengerjaan (selesai)

Rencana awal dipecah 9 fase; semuanya sudah dikerjakan dalam satu kali jalan
menurut urutan berikut:

1. **State management** — `provider ^6.1.2` + `DolenaeStore` (ChangeNotifier)
   di `lib/src/app/state/`, dipasang di `MaterialApp.router`. Menyatukan
   preferensi AI, 4 daftar tersimpan, notifikasi, setelan, dan pencarian.
2. **Model data** — 7 file entity baru di `packages/types/src` + 9 model Dart
   di `lib/src/data/models/`, plus perluasan `TravelSupport`.
3. **Fase 0, komponen dasar** — `Input`, `Switch`, `Segmented`, `SelectableRow`,
   `DateField`, `Stepper`, `Dialog`, `BottomSheet`, `Toast`.
4. **Fase 1, AI** — `/ai/preferences` dan `/ai/results`, menutup hole tab `AI`.
5. **Fase 2, Fasilitas** — `/facilities`, `/facilities/:type`, `/facilities/propose`,
   `/facilities/propose/success`.
6. **Fase 3, Pengaturan & Profil** — 8 route setelan.
7. **Fase 4, Auth** — forgot password, OTP, ubah kata sandi; semua `/soon`
   di Profil hilang.
8. **Fase 5, Rencana pelengkap** — `/plan/new`, `/plan/success`, sheet Tambah
   Rencana, dialog Konfirmasi Hapus.
9. **Fase 6, Checklist & Usulan** — `/checklist/done`, daftar usulan.
10. **Fase 7, Tersimpan & Notifikasi** — 4 daftar tersimpan + `/notifications`.
11. **Fase 8, State & galeri status** — pencarian (3 state), kosong (4 state),
    gagal memuat (3 state), `EmptyState` 5 tipe.

Pencarian tidak dipisah jadi route baru: state fokus/hasil/kosong + sheet
filter hidup di dalam `/explore`, sesuai satu frame `Pencarian
Rekomendasi` di desain.

---

## 5. Catatan

- **Gambar masih placeholder berlisensi.** 7 foto dari Wikimedia Commons
  (`ui-ux-hifi-mobile.md` bagian 14) berstatus CC BY-SA 4.0, wajib diganti
  foto milik sendiri sebelum rilis.
- **Peta di Detail Destinasi** masih frame `Map` dirakit dari primitif, belum
  peta interaktif. Peta Leaflet interaktif ada di sisi web
  (`apps/web/src/components/map-view-leaflet.tsx`) dan belum dipakai di mobile.
- **Data seed sudah siap** (`packages/seed`), jadi tidak ada alasan layar baru
  diisi data placeholder.
- **State management sudah ditambahkan.** `provider ^6.1.2` plus
  `DolenaeStore` (ChangeNotifier) di `lib/src/app/state/dolenae_store.dart`,
  dipasang di `MaterialApp.router`. Kalau skalanya nanti perlu tumbuh,
  `DolenaeStore` adalah satu-satunya titik ganti tanpa menyentuh layar.
- **Pengujian.** 125 test widget di `apps/mobile/test` (empat berkas per fitur
  plus `app_smoke_test.dart`). `test/helpers/test_harness.dart` mendaftarkan
  font proporsional asli ke nama keluarga `Inter_100` sampai `Inter_700`,
  `Inter_regular`, `Poppins_300` sampai `Poppins_700`, `Poppins_regular`, dan
  `Inter` serta `Poppins` polos. Tanpa itu font kotak bawaan `flutter test`
  membuat teks tampak dua kali lebih lebar dan memicu `RenderFlex overflow`
  palsu pada 390 piksel. Berkas font dicari di lokasi sistem; kalau tidak
  ketemu, test tetap jalan dengan font bawaan dan hanya beberapa asersi lebar
  yang bisa gagal.
- **Line ending belum dirapikan.** - diff yang ada di 232 berkas muncul karena
  core.autocrlf di mesin lokal, bukan karena isi berkas berubah. Tambah
  `.gitattributes` (`* text=auto eol=lf`) lalu `git add --renormalize .`
  supaya satu kali saja, sebelum file pertama masuk review.
