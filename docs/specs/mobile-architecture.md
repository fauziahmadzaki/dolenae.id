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

Fitur `facilities` bersifat **read-only** di mobile dan memakai endpoint
`GET /api/destinations/:id/facilities` + `GET /api/facilities/:id`
(cache `facilities.v2.*`, termasuk produk). Merchant mengelola fasilitas
lewat web; field lama `travel_supports` hanya tersedia sebagai alias backend.

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
  `RegisterUseCase`, `LogoutUseCase`, `VerifySessionUseCase`,
  `ForgotPasswordUseCase`, `RefreshDestinationsUseCase`,
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

## Integrasi backend

Base URL diatur lewat `AppConfig.apiBaseUrl`. Default-nya
`http://10.0.2.2:3001/api` untuk emulator Android dan
`http://localhost:3001/api` untuk platform lain. Untuk perangkat fisik:

```bash
flutter run --dart-define=API_BASE_URL=http://<ip-lokal>:3001/api
```

Semua respons mengikuti envelope backend
`{ success: true, data, meta? }`; `ApiClient` hanya mengembalikan `data` dan
mengubah error envelope menjadi `ApiException` dengan pesan dari server.

Endpoint yang dipakai mobile:

| Fitur | Endpoint | Catatan |
| --- | --- | --- |
| Auth | `POST /auth/login` | `{ email, password }` → `{ token, user }` |
| Auth | `POST /auth/register` | selalu mengirim role `wisatawan` |
| Auth | `GET /auth/me` | validasi token saat aplikasi dibuka |
| Auth | `POST /auth/forgot-password` | pesan dari backend ditampilkan apa adanya |
| Destinasi | `GET /destinations?status=published&limit=50` | hasil di-cache ke Drift |

### Alur sesi

1. `main.dart` membaca token dari secure storage, lalu mengisi
   `ApiClient.token` lewat `AuthRepository.restore()`.
2. Setelah aplikasi tampil, `AuthController.verifySession()` memanggil
   `GET /auth/me` di background dan memperbarui profil pengguna.
3. Token ditolak (`401/403/404`) → sesi lokal dihapus dan router mengarahkan
   pengguna ke `/login`.
4. Gangguan jaringan saat verifikasi **tidak** menghapus sesi, supaya aplikasi
   tetap bisa dibuka offline dengan data tersimpan.

### Alur katalog destinasi

1. `DestinationsController.load()` menjalankan `RefreshDestinationsUseCase`.
2. `DestinationRemoteDataSource` mengambil destinasi berstatus `published`.
3. Baris hasil dipetakan ke cache Drift, lalu stream `watchCatalog()`
   memancarkan daftar baru ke Beranda dan Jelajah tanpa reload manual.
4. Bila cache kosong (pertama kali buka atau offline), repository memakai
   `DestinationSeedData` sebagai fallback.

### Akurasi filter Jelajah

- `SearchDestinationsUseCase` mencocokkan setiap kata kueri dengan seluruh data
  destinasi yang tersedia di entity: nama, slug, tagline, wilayah, musim, akses,
  medan, aktivitas, dan tag yang sudah dikirim API.
- Kategori dicocokkan lebih dulu lewat `categoryIds`. Bila destinasi belum
  memiliki UUID tersebut (seed/offline), nama kategori dari chip dipakai sebagai
  fallback terhadap medan, aktivitas, dan tag. Kategori dan teks bisa digabung.
- Tile aktivitas Beranda memakai label yang memang ada di data destinasi
  (`Gunung`, `Camping Ground`, `Sunrise`, `Savana`) dan mengirimkannya sebagai
  kueri Jelajah. Filter yang tersisa dari kunjungan sebelumnya dibersihkan
  sebelum kueri baru diterapkan.

### Ringkasan Profil

Angka **Tersimpan**, **Rencana**, dan **Checklist** berturut-turut diambil dari
`SavedController.savedDestinations`, `PlanController.plans`, dan
`ChecklistController.items` — sama dengan halaman tujuan masing-masing. Tidak
ada angka contoh statis. Profil meminta `PlanController.load()` bila rencana
masih kosong agar halaman yang dibuka langsung tidak menampilkan nol sebelum
data selesai dimuat.

Menu **Perjalanan** mengarah ke halaman yang memang memiliki data:
“Destinasi tersimpan” → `/saved/destinations`, “Rencana” → `/plan`, dan
“Checklist” → `/checklist`. Tidak ada menu yang mengarah ke daftar
`savedPlans`/`savedChecklists` yang tidak pernah diisi. Menu “Edit profil” di
grup **AKUN & KEAMANAN** dihapus karena tujuannya sama dengan tombol “Ubah
profil”; satu-satunya pintu ke `/profile/edit` adalah tombol tersebut.

Filter lain dari `dev` (medan, tingkat kesulitan, fasilitas, dan urutan) tetap
berjalan bersama pencarian kata kunci dan fallback kategori di atas.

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
