# Mobile Architecture — `apps/mobile`

Dokumen ini menjelaskan struktur dan konvensi aplikasi Flutter Dolenae.
Tujuannya: satu pola yang jelas untuk menambah fitur tanpa mengulang
keputusan desain setiap kali.

## Ringkasan

Aplikasi memakai **feature-first clean architecture**:

- Setiap fitur punya folder sendiri di bawah `lib/src/features/<fitur>/`.
- Di dalam fitur ada tiga lapisan: `domain`, `data`, `presentation`.
- `domain` tidak boleh bergantung pada `data`, `presentation`, atau Flutter.
- `data` mengimplementasikan kontrak `domain` dan hanya lapisan ini yang
  berbicara dengan HTTP, database, atau penyimpanan lokal.
- `presentation` memakai controller (`ChangeNotifier`) dan hanya menyentuh
  `domain`.
- Kode lintas fitur tinggal di `lib/src/core/` (konfigurasi, error, jaringan,
  database, util) dan `lib/src/shared/` (widget/ikon tema).
- `lib/src/app/` adalah composition root: DI, router, tema global.

## Struktur folder

```
lib/
  main.dart                     # bootstrap: baca sesi, bangun AppDependencies
  src/
    app/
      app.dart                  # DolenaeApp: bikin controller + MultiProvider
      di/app_dependencies.dart  # satu-satunya tempat instansiasi implementasi
      router/                   # GoRouter + route tab utama
      theme/                    # warna, spacing, tipografi, radius, shadow
    core/
      config/app_config.dart
      database/app_database.dart        # Drift (schema + generated)
      error/app_failure.dart            # AppFailure + subtipe
      network/api_client.dart           # ApiClient + ApiException
      result/result.dart                # Result<T> = Success | Failure
      usecases/usecase.dart             # kontrak UseCase + NoParams
      utils/formatters.dart
    features/<fitur>/
      domain/
        entities/            # model murni Dart
        repositories/        # kontrak abstrak
        usecases/            # aksi/orchestration
      data/
        data_sources/        # remote/local/seed
        models/              # DTO + mapping (mis. DestinationModel)
        mappers/             # konversi baris database <-> entitas
        repositories/        # implementasi kontrak domain
      presentation/
        controllers/         # ChangeNotifier
        screens/             # layar (widget)
        widgets/             # widget khusus fitur
        routes/              # GoRoute milik fitur
    shared/
      icons/ widgets/
```

Fitur yang ada saat ini: `ai`, `auth`, `checklist`, `destinations`,
`explore`, `facilities`, `home`, `notifications`, `onboarding`, `placeholder`,
`plan`, `profile`, `saved`, `settings`.

Fitur `destinations` menampung entity destinasi, filter pencarian, katalog,
serta layar detail; filter pencarian berada di domain `destinations` karena
`explore` hanya memakainya, tidak memilikinya.

## Aturan dependensi

| Lapisan | Boleh import | Tidak boleh import |
| --- | --- | --- |
| `domain` | Dart core, `core/error`, `core/result`, `core/usecases` | Flutter, `data`, `presentation` |
| `data` | `domain` fitur, `core/*`, paket (http, drift, dll) | `presentation` |
| `presentation` | `domain` fitur, `core/*`, `shared/*`, Flutter | `data` kecuali lewat DI di `app/` |
| `app` | semua (composition root) | — |

Import internal selalu memakai path paket:
`package:dolenae_mobile/src/...`.

## Alur data

1. `AppDependencies.create()` membangun `ApiClient`, `AppDatabase`, dan semua
   repository.
2. `DolenaeApp` membangun controller dari repository lalu membagikannya lewat
   `MultiProvider`.
3. Controller memanggil usecase atau repository, menyimpan state di memori,
   dan memanggil `notifyListeners()`.
4. Layar membaca controller via `context.watch`/`context.read`.

Operasi yang bisa gagal mengembalikan `Result<T>`. `ApiException` hanya hidup
di lapisan data; repository mengubahnya menjadi `AppFailure` dengan pesan
Bahasa Indonesia yang siap ditampilkan. Controller mengembalikan
`AppFailure?` sehingga layar tidak perlu `try/catch` untuk error jaringan.

## Policy usecase

- **Usecase dipakai** untuk aksi dan orchestration: `LoginUseCase`,
  `RegisterUseCase`, `LogoutUseCase`, `RefreshDestinationsUseCase`,
  `SearchDestinationsUseCase`.
- **Tanpa usecase** untuk baca state sederhana: controller boleh memanggil
  method repository langsung (mis. `SavedController.toggleSavedDestination`).
- Jangan menambah usecase yang hanya meneruskan satu panggilan tanpa aturan
  tambahan.

## Pola repository

- Kontrak (`abstract interface class`) tinggal di `domain/repositories/`.
- Implementasi tinggal di `data/repositories/<nama>_repository_impl.dart`.
- Sumber data dipisah: `remote` (HTTP), `local` (Drift/SharedPreferences),
  `seed` (`abstract final class ...SeedData` untuk data prototipe offline).
- Repository menggabungkan sumber data dan menyembunyikan detailnya dari
  controller.
- Contoh penting: `DestinationRepositoryImpl.watchCatalog()` memancarkan cache
  Drift dan jatuh ke data seed bila cache masih kosong, sehingga aplikasi tetap
  terisi saat offline.

## State management

- Tetap memakai `provider` + `ChangeNotifier`. Tidak ada state library baru.
- Nama kelas controller berakhiran `Controller` (dulu `*State`).
- Widget menerima data lewat constructor bila memungkinkan (layar mudah
  diuji), controller untuk state lintas layar.
- State form yang hanya hidup di satu layar tetap boleh `setState`.

## Menambah fitur baru

1. Buat `features/<fitur>/{domain,data,presentation}`.
2. Definisikan entity dan kontrak repository di `domain`.
3. Implementasi repository di `data` (pakai `Result` untuk operasi gagal).
4. Tambah controller di `presentation/controllers`.
5. Daftarkan repository di `AppDependencies` dan controller di `app.dart`.
6. Tambah route di `presentation/routes/` lalu daftarkan di `app/router`.
7. Tambah test di `test/`.

## Verifikasi

```bash
cd apps/mobile
flutter analyze
flutter test
```

Kedua perintah harus hijau sebelum perubahan dianggap selesai. Harness uji ada
di `test/helpers/test_harness.dart` (`TestStores`, `wrapScreen`); bila
controller baru butuh provider tambahan, tambahkan di `TestStores` agar semua
test tetap berjalan.
