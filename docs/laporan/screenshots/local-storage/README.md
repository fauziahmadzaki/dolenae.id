# Screenshot Implementasi Local Storage & Data Persistence

Screenshot code implementasi untuk laporan PBL — memetakan langsung ke
requirement tugas penyimpanan data lokal.

## 1. Penyimpanan Terstruktur (Database Lokal — Drift)

| File | Requirement yang dipenuhi |
| --- | --- |
| `01-drift-skema-cache.png` | Package **drift**; tabel `cached_destinations`; atribut penanda cache **`last_fetched` (UTC millis)** dan `server_updated_at` |
| `02-drift-dao-transaksi-stream.png` | **Stream reaktif** `watch()`; **Database Transaction** untuk operasi tulis multi-baris (DELETE + INSERT batch atomik) |
| `03-offline-first-state.png` | Lapisan data **offline-first**: cache dibaca dulu saat app dibuka, lalu disinkronkan dengan API; UI otomatis ter-update dari stream Drift |

## 2. Pengaturan (Settings — SharedPreferences)

| File | Requirement yang dipenuhi |
| --- | --- |
| `04-shared-preferences-settings.png` | **shared_preferences hanya untuk data kecil non-sensitif** (tema, bahasa, notifikasi, privasi) |
| `05-settings-state-global.png` | Perubahan settings reaktif ke semua layar via global state (`SettingsState`) + langsung dipersist |

## 3. Keamanan Rahasia (Secrets — flutter_secure_storage)

| File | Requirement yang dipenuhi |
| --- | --- |
| `06-secure-storage-token.png` | **flutter_secure_storage** khusus menyimpan access token (Keychain/Keystore) |
| `07-session-store.png` | Pemisahan eksplisit: token → secure storage, profil (non-sensitif) → SharedPreferences |
| `08-auth-state-integrasi.png` | Token dipakai pada request API; logout menghapus token dari secure storage |

## Bonus: Integrasi Aplikasi

| File | Keterangan |
| --- | --- |
| `09-bootstrap-main.png` | Bootstrap: baca sesi (secure + prefs) dan init `AppDatabase` sebelum `runApp()` |
| `10-ui-cache-beranda.png` | UI Beranda: indikator status cache (offline/terakhir sinkron) + pull-to-refresh |

## Sumber kode

Semua screenshot diambil dari kode asli di `apps/mobile`:

- `lib/src/data/local/app_database.dart` — skema Drift
- `lib/src/data/local/destination_dao.dart` — stream + transaksi
- `lib/src/app/state/destinations_state.dart` — state offline-first
- `lib/src/data/local/settings_store.dart` — SharedPreferences
- `lib/src/app/state/settings_state.dart` — state settings
- `lib/src/data/local/secure_token_store.dart` — token secure storage
- `lib/src/data/local/session_store.dart` — gabungan sesi
- `lib/src/app/state/auth_state.dart` — state autentikasi
- `lib/main.dart` — bootstrap
- `lib/src/features/home/presentation/beranda_screen.dart` — UI beranda

Penjelasan lengkap arsitektur: `docs/specs/local-storage.md`.
