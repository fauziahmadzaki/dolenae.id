# Dolenae Mobile

Flutter (Android/iOS) app untuk pengalaman **Wisatawan** di Dolenae.id:
discovery destinasi alam, detail destinasi, kebutuhan pendukung, AI
rekomendasi, dan trip planning.

Katalog destinasi tersinkron dari backend Express; fitur lain masih memakai
sebagian data prototipe.

## Struktur

```
lib/
  main.dart
  src/
    app/
      app.dart                 # MaterialApp.router
      router/app_router.dart   # go_router
      theme/                   # token "Alam": warna, tipografi, spacing, radius, shadow
    core/                    # HTTP, konfigurasi, database, Result
    features/<fitur>/
      domain/                # entitas, kontrak repository, usecase
      data/                  # HTTP, Drift/SharedPreferences, seed
      presentation/          # controller provider, layar
    shared/
      icons/app_icons.dart     # pemetaan ikon (Material; mudah ditukar)
      widgets/                 # design-system widget (DnCard, DnChip, ...)
    features/
      onboarding/presentation/ # splash + onboarding
      auth/presentation/       # login (+ error state)
      home/presentation/       # beranda
      explore/presentation/    # eksplor / katalog
      placeholder/presentation/# "segera hadir" untuk tab lain
test/                          # smoke test widget + seed
```

## Menjalankan

```bash
flutter pub get
flutter run
```

## Sinkronisasi destinasi

Jalankan backend `apps/backend` dengan database dan konfigurasi lokal yang valid.
Base URL harus berakhir `/api`:

- Emulator Android: bawaan `http://10.0.2.2:3001/api` (host komputer).
- Chrome/desktop/iOS simulator: bawaan `http://localhost:3001/api`.
- Perangkat fisik: gunakan IP LAN komputer, bukan `localhost`; perangkat dan
  komputer harus saling terhubung, backend mendengarkan antarmuka LAN dan
  firewall mengizinkan port. Contoh:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3001/api
flutter build apk --debug --dart-define=API_BASE_URL=http://192.168.1.10:3001/api
```

- Katalog `published` diperiksa segera saat mulai/resume dan setiap **5 detik
  hanya saat foreground/resumed**. Perubahan biasanya tampak dalam 5 detik
  ditambah latensi HTTP, seluruh halaman, dan penulisan cache; bukan push instan.
  Jika permintaan masih berjalan, tick dilewati, bukan ditumpuk. Timer berhenti
  saat inactive/hidden/paused/detached dan saat controller dibuang. Permintaan
  yang sudah berjalan boleh selesai dan menyimpan cache.
- Semua halaman diambil sebelum mengganti cache. Respons rusak, halaman tidak
  lengkap, atau jaringan gagal mempertahankan cache terakhir; sinkron berikutnya
  mencoba lagi. Pagination bukan snapshot transaksi server: perubahan bersamaan
  yang terdeteksi ditolak agar katalog parsial tidak mengganti cache.
- Delete/unpublish hilang dari daftar setelah sinkron berhasil, termasuk katalog
  kosong. Status kosong tersimpan lewat SharedPreferences dan tidak berubah
  menjadi seed setelah restart offline. Seed hanya untuk instalasi yang belum
  pernah menyimpan katalog. Detail yang hilang menampilkan pesan tidak tersedia.
- Sinkron ini hanya katalog/detail destinasi. Tidak menambahkan rendering jalur,
  Route Builder, profil elevasi, atau navigasi GPS.

## Cek & test

```bash
flutter analyze
flutter test
```

## Autentikasi

Layar masuk (`features/auth`) mendukung:

- **Ingat saya** — menyimpan email terakhir di `SharedPreferences`
  (`dolenae.auth.remembered_email.v1`) lalu mengisinya otomatis saat layar
  masuk dibuka lagi. Sesi login tetap disimpan di secure storage.
- **Konfirmasi kata sandi** — wajib sama dengan kata sandi saat mendaftar.
- **Lupa kata sandi** — membuka `/auth/forgot-password?email=...`; backend
  mengirim tautan reset ke email terdaftar.
- **Masuk dengan Google** — menukar `idToken` Google ke
  `POST /api/auth/google`.

### Menyiapkan Google Sign-In

Status proyek saat ini (semua di project `797381430234`):

| Platform | Status |
| --- | --- |
| Web client ID (mobile `serverClientId` + backend) | ✅ terpasang |
| Android OAuth client | ✅ terdaftar (project sama) |
| iOS OAuth client | ⚠️ opsional, belum dipasang |

> **Penting:** client ID Android **tidak dipakai di kode**. Aplikasi hanya
> mengirim `serverClientId` (web client) dan Google mencocokkan package +
> SHA-1 aplikasi dengan client Android yang terdaftar. Client Android dan web
> harus berada di **project Google Cloud yang sama**, kalau tidak Google
> membalas `DEVELOPER_ERROR` (kode 10) meskipun SHA-1 benar.

Langkah sekali jalan:

1. Google Cloud Console → **Credentials** → *Create credentials* → *OAuth client ID*
   → **Android** (di project yang sama dengan web client):
   - Package name: `id.dolenae.dolenae_mobile`
   - SHA-1 debug: `55:75:50:28:59:EC:4C:95:75:24:43:2F:FD:BF:1F:6D:D4:E3:37:56`
   - Tambahkan juga SHA-1 release bila nanti dipakai.
2. Backend: `apps/backend/.env` → `GOOGLE_CLIENT_ID=<web client id>`
   (`AUTH_GOOGLE_ID` juga diterima sebagai alias).
3. Mobile: client ID web sudah menjadi nilai bawaan. Untuk menimpa:
   ```bash
   flutter run --dart-define=GOOGLE_SERVER_CLIENT_ID=<web client id>
   ```
4. iOS: buat client *iOS*, lalu tambahkan `GIDClientID` dan
   `CFBundleURLTypes` (`REVERSED_CLIENT_ID`) di `ios/Runner/Info.plist`, dan
   jalankan dengan `--dart-define=GOOGLE_IOS_CLIENT_ID=...`.

Tanpa Client ID, tombol Google hanya menampilkan pesan "belum dikonfigurasi";
fitur lain tetap berjalan normal.

## Catatan

- Tema mengikuti `DESIGN.md` (tema "Alam"); `accent` hanya untuk penanda AI.
- Data destinasi dari API backend dan cache Drift; seed hanya fallback awal.
- Media destinasi masih placeholder (scene bukit + matahari), belum foto.
- Font memakai `google_fonts` (Poppins/Inter); saat offline bisa dibundel
  sebagai asset.
