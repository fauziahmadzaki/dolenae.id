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

## Catatan

- Tema mengikuti `DESIGN.md` (tema "Alam"); `accent` hanya untuk penanda AI.
- Data dari `seed_data.dart` (statis). Sumber kebenaran tetap `packages/types`
  + `packages/seed` (TS); nanti diganti `@dolenae/server` (Hono API).
- Media destinasi masih placeholder (scene bukit + matahari), belum foto.
- Font memakai `google_fonts` (Poppins/Inter); saat offline bisa dibundel
  sebagai asset.
