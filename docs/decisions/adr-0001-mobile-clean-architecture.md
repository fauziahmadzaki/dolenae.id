# ADR 0001 — Clean architecture feature-first untuk `apps/mobile`

- Status: Diterima
- Tanggal: 2026-10-20
- Konteks: `apps/mobile` (Flutter)

## Konteks

`apps/mobile` tumbuh dari prototype: entity, akses API, akses database, data
seed, dan state semua berkumpul di `lib/src/data/` dan `lib/src/app/state/`.
Akibatnya:

- Layar membaca `SeedData` dan `ApiClient` langsung, sehingga sumber data tidak
  bisa diganti tanpa mengubah UI.
- Satu file `seed_data.dart` berisi data lintas fitur.
- Sulit menambahkan endpoint/database tanpa menyentuh banyak layar.

## Keputusan

Pindah ke **feature-first clean architecture**:

1. Fitur di `lib/src/features/<fitur>/{domain,data,presentation}`.
2. Kontrak repository di `domain`, implementasi di `data`; `presentation`
   hanya menyentuh `domain`.
3. Kode lintas fitur dipisah ke `core/` (config, error, network, database,
   result, usecase, util) dan `shared/` (widget/tema).
4. `app/` menjadi composition root: `AppDependencies` untuk repository,
   `app.dart` untuk controller + provider.
5. Operasi gagal mengembalikan `Result<T>` (`Success`/`Failure`) dengan
   `AppFailure` berpesan Bahasa Indonesia; `ApiException` berhenti di lapisan
   data.
6. Tetap memakai `provider` + `ChangeNotifier`; kelas `*State` di-rename
   menjadi `*Controller`.
7. Usecase dipakai untuk aksi/orchestration; baca state sederhana boleh
   memanggil repository langsung.
8. Import internal memakai `package:dolenae_mobile/src/...` agar pemindahan
   file tidak mengubah kedalaman import relatif.

## Alternatif yang dipertimbangkan

- **Layer-first tanpa fitur** (`lib/{data,domain,presentation}`): ditolak
  karena satu fitur tersebar di banyak folder dan makin sulit dirapikan saat
  fitur bertambah.
- **Migrasi ke Riverpod/Bloc**: ditolak untuk sekarang karena menambah biaya
  besar tanpa kebutuhan yang mendesak; arsitektur baru tetap memudahkan
  penggantian state library karena UI hanya bergantung pada controller/domain.
- **Semua baca state lewat usecase**: ditolak karena menghasilkan usecase
  satu baris yang hanya menambah lapisan.

## Konsekuensi

- Menambah sumber data baru cukup menambah data source + repository, layar
  tidak berubah.
- Test bisa memakai repository fake tanpa HTTP/Drift (lihat `TestStores`).
- Data seed kini terpisah per fitur (`DestinationSeedData`,
  `FacilitySeedData`, `SavedSeedData`, `SettingsSeedData`, `AiSeedData`,
  `PlanSeedData`, `ChecklistSeedData`, `NotificationSeedData`,
  `ExploreSeedData`).
- Butuh disiplin: review harus menolak `presentation` yang import `data`, dan
  `domain` yang import Flutter.
