# AGENTS.md — Mobile (`apps/mobile`)

Aturan kerja untuk agen AI di aplikasi Flutter Dolenae. Baca juga `AGENTS.md`
root dan `docs/specs/mobile-architecture.md` (sumber kebenaran arsitektur).

## Flag kebijakan test

```text
TEST_REQUIRED=false
```

- `TEST_REQUIRED=true` — setiap perubahan perilaku **wajib** menambah atau
  memperbarui test. `flutter test` dan `flutter analyze` harus hijau.
- `TEST_REQUIRED=false` — test baru tidak diwajibkan. `flutter analyze` tetap
  wajib hijau, dan test yang sudah ada tetap dijalankan agar tidak regresi.

Perubahan perilaku meliputi fitur baru, perbaikan bug, perubahan validasi,
navigasi, pemetaan data, dan refactor yang mengubah logika. Perubahan murni
teks/typo tidak wajib test baru meskipun flag bernilai `true`.

## Ringkasan stack

| Layer       | Teknologi                                              |
| ----------- | ------------------------------------------------------ |
| UI          | Flutter + Material 3                                   |
| State       | `provider` + `ChangeNotifier`                          |
| Navigasi    | `go_router`                                            |
| Cache lokal | Drift (SQLite) + `shared_preferences`                  |
| Sesi        | `flutter_secure_storage`                               |
| HTTP        | `http` lewat `core/network/api_client.dart`            |
| Font        | `google_fonts` dengan aset lokal (tanpa fetch runtime) |

## Arsitektur wajib

Feature-first clean architecture:

```
lib/src/
  app/          # composition root: DI, router, tema, controller wiring
  core/         # config, error, network, database, result, usecase, util
  features/<fitur>/{domain,data,presentation}
  shared/       # widget, ikon, dan komponen lintas fitur
```

| Lapisan        | Boleh bergantung pada                                   | Dilarang                            |
| -------------- | ------------------------------------------------------- | ----------------------------------- |
| `domain`       | Dart core, `core/error`, `core/result`, `core/usecases` | Flutter, `data`, `presentation`     |
| `data`         | `domain` fitur, `core/*`, paket IO                      | `presentation`                      |
| `presentation` | `domain`, `core/*`, `shared/*`, Flutter                 | `data` (kecuali lewat DI di `app/`) |
| `app`          | semua                                                   | —                                   |

- Import internal selalu `package:dolenae_mobile/src/...`.
- Jangan menyalin entity/tipe domain ke fitur lain; impor dari `domain`
  pemiliknya.
- Implementasi repository hanya diinstansiasi di
  `app/di/app_dependencies.dart`; controller dibangun di `app/app.dart`.
- `test/architecture/layering_test.dart` menjaga aturan ini — jangan dilemahkan.

## Konvensi kode

- Nama file `snake_case`, kelas `PascalCase`, variabel/metode `camelCase`.
- Controller: `*Controller` dan `extends ChangeNotifier`; panggil
  `notifyListeners()` setelah state berubah.
- Repository: kontrak `abstract interface class` di `domain/repositories/`,
  implementasi `*RepositoryImpl` di `data/repositories/`.
- DTO: `*Model`; data contoh: `abstract final class *SeedData` di fitur
  masing-masing.
- Operasi yang bisa gagal mengembalikan `Result<T>`. `ApiException` berhenti di
  lapisan `data` dan diubah menjadi `AppFailure` berpesan Bahasa Indonesia.
- Presentasi tidak memakai `try/catch` untuk error jaringan; baca `AppFailure`
  dari controller.
- Jangan menambah state library baru (Riverpod, Bloc, GetX, dsb.).
- Komentar kode: Bahasa Indonesia, singkat, hanya untuk hal yang tidak jelas.
- Jangan mengedit file generated (`*.g.dart`, `*.freezed.dart`). Regenerasi:

  ```bash
  dart run build_runner build --delete-conflicting-outputs
  ```

## UI dan tema

- Wajib memakai token di `app/theme/`: `AppColors`, `AppSpacing`,
  `AppTextStyles`, `AppRadius`, `AppShadows`. Jangan hardcode hex/ukuran bila
  token tersedia.
- Pakai widget bersama `shared/widgets/dn_*` sebelum membuat komponen baru.
- Ikon memakai `AppIcons` (Lucide-style), bukan emoji atau ikon acak.
- Semua teks UI berbahasa Indonesia. Format tanggal/angka lewat
  `core/utils/formatters.dart`.
- Header/topbar kustom wajib menghormati status bar: bungkus konten dengan
  `SafeArea` (contoh: `DnAppBar`, header Beranda). Jangan mematok tinggi total
  header tanpa inset.
- Layar dengan bottom nav harus menjaga area aman bawah.
- Target acuan layout: lebar **390 px**; uji juga layar kecil dan teks panjang.
- Jangan mengisi kredensial demo di form login/register.
- Tombol ikon beri `tooltip`/Semantics; target sentuh minimal 44×44.

## Data, API, dan offline

- Base URL: `core/config/app_config.dart` (`API_BASE_URL` bisa dioverride
  lewat `--dart-define`).
- Envelope backend `{ success, data, meta? }` ditangani `ApiClient`; jangan
  parsing envelope manual di controller/layar.
- Token disimpan di secure storage; jangan pernah menulis token/password ke
  log, test, atau kode.
- Katalog bersifat offline-first: hasil API di-cache ke Drift, dan data seed
  dipakai bila cache kosong. Pertahankan pola ini saat menambah fitur data.
- Jangan memanggil HTTP/Drift langsung dari `presentation` atau widget.

## Test

Lokasi dan nama:

- `test/features/<nama>_test.dart` untuk widget/controller per fitur.
- `test/data/*_test.dart` untuk parsing API, cache, dan repository.
- `test/shared/*_test.dart` untuk widget bersama.
- `test/architecture/layering_test.dart` untuk batas lapisan.

Aturan:

- Gunakan helper di `test/helpers/test_harness.dart`:
  `useTestFonts`, `usePhone`, `wrapScreen`, `TestStores`, `scrollTo`,
  `inputFor`.
- Operasi IO di test memakai fake/stub repository; jangan menembak backend
  sungguhan.
- Test widget memakai `pumpAndSettle` bila ada animasi/async.
- Untuk menguji status bar/SafeArea, atur `tester.view.padding` (piksel fisik,
  kalikan `devicePixelRatio`) dan reset lewat `addTearDown`.
- Jika menambah controller/provider baru, daftarkan juga di `TestStores` agar
  seluruh test tetap berjalan.
- Jangan menurunkan cakupan test hanya agar test lama lolos.

## Verifikasi sebelum selesai

Selalu jalankan dari `apps/mobile`:

```bash
dart format lib test
flutter analyze
flutter test
```

Semua harus hijau. Jika `TEST_REQUIRED=false`, `flutter test` tetap dijalankan;
yang tidak diwajibkan hanyalah penambahan test baru.

## Checklist menambah fitur

1. Buat `features/<fitur>/{domain,data,presentation}`.
2. Entity + kontrak repository di `domain` (bebas Flutter).
3. Implementasi repository di `data`; bungkus error menjadi `AppFailure`.
4. Controller di `presentation/controllers`.
5. Daftarkan repository di `AppDependencies`, controller di `app.dart`.
6. Tambah route di `presentation/routes/` lalu daftarkan di `app/router`.
7. Tambah widget/layar memakai token tema dan widget `Dn*`.
8. Tambah test sesuai `TEST_REQUIRED`, lalu jalankan verifikasi.

## Larangan cepat

- Jangan mengubah `build/`, `android/`, `ios/`, atau file generated tanpa
  kebutuhan nyata.
- Jangan menambah dependency baru tanpa alasan kuat; jelaskan di commit/PR.
- Jangan menghapus atau melemahkan test yang sudah ada.
- Jangan memakai `dart:io`/`dart:ffi` di `domain` atau `presentation`.
- Jangan mencampur logika bisnis ke widget; pindahkan ke controller/usecase.
