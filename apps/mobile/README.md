# Dolenae Mobile

Flutter (Android/iOS) app untuk pengalaman **Wisatawan** di Dolenae.id:
discovery destinasi alam, detail destinasi, kebutuhan pendukung, AI
rekomendasi, dan trip planning.

Saat ini berisi **slice awal 4 halaman** (data statis): splash/onboarding,
login, beranda, dan eksplor.

## Struktur

```
lib/
  main.dart
  src/
    app/
      app.dart                 # MaterialApp.router
      router/app_router.dart   # go_router
      theme/                   # token "Alam": warna, tipografi, spacing, radius, shadow
    data/
      models/                  # Destination, TravelSupport (subset packages/types)
      seed/seed_data.dart      # data statis sementara (mirror packages/seed)
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
- Data dari `seed_data.dart` (statis). Sumber kebenaran tetap `packages/types`
  + `packages/seed` (TS); nanti diganti `@dolenae/server` (Hono API).
- Media destinasi masih placeholder (scene bukit + matahari), belum foto.
- Font memakai `google_fonts` (Poppins/Inter); saat offline bisa dibundel
  sebagai asset.
