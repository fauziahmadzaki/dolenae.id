# Local Storage & Data Persistence (Mobile)

Implementasi penyimpanan lokal offline-first di `apps/mobile`, dengan
pemisahan media sesuai jenis data.

## Ringkasan Pilihan

| Jenis data | Media | Package | Alasan |
| --- | --- | --- | --- |
| Data terstruktur hasil fetch API | SQLite lokal | `drift` + `sqlite3_flutter_libs` | Type-safe, query reaktif (`watch()`), mendukung transaksi |
| Setelan kecil non-sensitif | Key-value | `shared_preferences` | Ringan, cukup untuk flag/tema/bahasa |
| Token & kredensial | Keychain / Keystore | `flutter_secure_storage` | Terenkripsi OS, tidak pernah masuk SharedPreferences |
| Profil pengguna (nama/email/role) | Key-value | `shared_preferences` | Bukan rahasia; dipakai untuk render profil saat offline |

## Struktur Lapisan

```
lib/src/
├── data/
│   ├── api/                 # ApiClient, AuthApi, DestinationApi
│   ├── local/
│   │   ├── app_database.dart          # Skema Drift + koneksi SQLite
│   │   ├── app_database.g.dart        # Hasil codegen (build_runner)
│   │   ├── destination_dao.dart       # Stream + transaksi tulis
│   │   ├── destination_cache_mapper.dart
│   │   ├── secure_token_store.dart    # flutter_secure_storage
│   │   ├── session_store.dart         # token (secure) + profil (prefs)
│   │   └── settings_store.dart        # shared_preferences
│   └── models/              # Model domain Dart
└── app/state/
    ├── auth_state.dart      # Sesi login global
    ├── destinations_state.dart
    └── settings_state.dart
```

UI tidak pernah membuka database/prefs langsung; semua lewat state/DAO.

## Drift: Cache Data Terstruktur

Tabel `cached_destinations` menyimpan seluruh field yang dipakai katalog:

- Kolom data: `id`, `slug`, `name`, `tagline`, `difficulty`, `location`,
  `access`, `facilities`, `entry_fee`, `elevation_meters`, `images`,
  `category_ids`, dan seterusnya.
- `last_fetched`: **UTC millis** saat baris diambil dari API. Dipakai untuk
  indikator "Tersimpan offline · N menit lalu" di Beranda.
- `server_updated_at`: **UTC millis** dari `updatedAt` server (opsional).
- `sort_order`: mempertahankan urutan dari API.

### Alur offline-first

1. `DestinationsState` berlangganan `DestinationDao.watch()` sejak dibuat.
2. Saat aplikasi dibuka, stream segera memancarkan isi cache (jika ada),
   sehingga Beranda tampil tanpa menunggu jaringan.
3. `load()` memanggil `GET /destinations?status=published`.
4. Respons dipetakan ke `CachedDestinationsCompanion` lalu ditulis lewat
   `DestinationDao.replaceAll()`.
5. Transaksi `DELETE` + `INSERT` batch selesai → Drift memancarkan snapshot
   baru → `notifyListeners()` → UI berubah otomatis (tanpa refresh manual).
6. Jika jaringan gagal dan cache kosong, Beranda memakai data seed sebagai
   tampilan awal, dengan penanda "Mode offline".

### Transaksi atomik

```dart
Future<void> replaceAll(
  List<CachedDestinationsCompanion> rows, {
  required int fetchedAt,
}) {
  return _db.transaction(() async {
    await _db.delete(_db.cachedDestinations).go();
    if (rows.isEmpty) return;
    await _db.batch((batch) {
      batch.insertAll(_db.cachedDestinations, rows);
    });
  });
}
```

Satu transaksi membungkus hapus + insert list, sehingga UI tidak pernah
melihat daftar setengah jadi.

### Stream reaktif

`DestinationDao.watch()` memakai `select(...).watch()` Drift dan memetakan
baris ke model domain `Destination`. `DestinationsState` menyimpan
`StreamSubscription` dan membatalkannya di `dispose()`.

## SharedPreferences: Setelan

`SettingsStore` menyimpan kunci kecil dan non-sensitif:

- `settings.theme`, `settings.language`, `settings.dataSaver`
- `settings.notif.*` (rekomendasi, pengingat, fasilitas baru, promo)
- `settings.privacy.*` (2FA, profil publik, aktivitas, analitik)

`SettingsState` menulis perubahan secara fire-and-forget
(`unawaited(store.setX(...))`) sambil langsung memperbarui state global,
sehingga semua layar yang membaca `SettingsState` ikut berubah.

## flutter_secure_storage: Token

- Kunci: `dolenae.secure.access_token`.
- Ditulis saat login/register berhasil, dihapus saat logout.
- `SessionStore` menggabungkan token dari secure storage dengan profil
  pengguna dari SharedPreferences.
- **Aturan:** token/kredensial tidak boleh ditulis ke `shared_preferences`
  atau database biasa.

## Autentikasi & Sinkronisasi

1. `main()` membaca sesi: token dari secure storage + profil dari prefs.
2. `AuthState` menyimpan salinan di memori; `GoRouter` memakai state ini
   sebagai `refreshListenable` dan guard route.
3. Login/register memanggil API, menyimpan sesi, lalu router mengarahkan ke
   `/home`.
4. Logout membersihkan secure storage + profil, lalu kembali ke `/login`.
5. `DestinationsState.load()` dipanggil saat aplikasi dibuat dan saat
   pull-to-refresh di Beranda.

## Konfigurasi API

Default base URL:

- Android emulator: `http://10.0.2.2:3001/api`
- Platform lain: `http://localhost:3001/api`

Override untuk perangkat fisik:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3001/api
```

Android manifest sudah mengizinkan INTERNET dan cleartext HTTP untuk fase
prototype.

## Seed Data & Akun Demo

Dari `apps/backend`:

```bash
pnpm db:seed
```

Seed idempoten (berdasarkan `slug`) untuk 8 kategori, 6 destinasi, dan akun
demo:

- Wisatawan: `wisatawan@dolenae.id` / `dolenae123`
- Admin (dibuat manual saat setup): `admin@dolenae.id` / `admin12345`

## Verifikasi

```bash
cd apps/mobile
flutter analyze
flutter test

cd ../backend
pnpm typecheck
pnpm test
```

Test `apps/mobile/test/data/destination_cache_test.dart` memverifikasi
transaksi tulis, penggantian cache lama, metadata `last_fetched`, dan stream
reaktif Drift.
