# Bootstrap Flutter web

Koneksi Drift memakai WASM dan menyimpan cache di penyimpanan browser
(IndexedDB/OPFS, dipilih otomatis oleh Drift). Koneksi Android/iOS tetap native.

- `sqlite3.wasm`: aset resmi sqlite3.dart **3.5.2**, sesuai `pubspec.lock`.
  Sumber: https://github.com/simolus3/sqlite3.dart/releases/download/sqlite3-3.5.2/sqlite3.wasm
- `drift_worker.js`: hasil kompilasi `drift_worker.dart` dengan Drift **2.35.2**.
  Jika versi Drift berubah, kompilasi ulang dari `apps/mobile`:

  ```sh
  dart compile js -O2 --no-source-maps web/drift_worker.dart -o web/drift_worker.js
  ```

Jalankan `flutter run -d chrome`. Backend default: `http://localhost:3001/api`.
Tanpa backend, aplikasi tetap memakai cache/seed; error jaringan tidak berarti
kompilasi web gagal.

## Pemeriksaan browser

Dari `apps/mobile`, dengan Node.js 22+ dan Chrome terpasang:

```sh
flutter build web
dart compile js -O2 --no-source-maps tool/database_web_smoke.dart -o build/web/database_smoke.js
node tool/verify_web.cjs
```

`CHROME_EXECUTABLE` bisa menunjuk executable Chrome di luar lokasi default
Windows. Pemeriksaan membuka profil Chrome sementara, memastikan UI Flutter
muncul, dan menjalankan SQLite tulis/tutup/buka ulang/baca. Tidak memakai akun
atau profil browser pengguna. Error HTTP backend yang tidak berjalan diabaikan;
exception runtime dan error aset tetap membuat pemeriksaan gagal.
