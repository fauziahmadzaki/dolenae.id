# Dolenae Mobile

Flutter (Android/iOS) app untuk pengalaman **Wisatawan** di Dolenae.id:
discovery destinasi alam, detail destinasi, kebutuhan pendukung, AI
rekomendasi, dan trip planning.

## Struktur

```
lib/
  main.dart          # entry point + theme
  features/          # per-fitur (discovery, destination, ai, trip, dll)
  shared/            # widget & util yang dipakai bersama
```

## Menjalankan

```bash
flutter pub get
flutter run
```

Data saat ini dari seed lokal (nanti diarahkan ke `@dolenae/server` / Hono API).