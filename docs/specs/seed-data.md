# Seed Data Destinasi

Sumber data seed `apps/backend/src/db/seeds/seed.ts` (+ `seed-networks.ts` untuk rute dan `seed-facilities.ts` untuk fasilitas/produk).

## Cakupan

23 destinasi seed (10 baru pada Nov 2026, mencakup pantai, danau, air terjun,
savana, pulau, dan goa — bukan hanya gunung):

| Destinasi | Provinsi | Jenis | Gambar | Rute | Fasilitas |
| --- | --- | --- | --- | --- | --- |
| Gunung Bromo | Jawa Timur | Gunung | Wikimedia | ✅ | ✅ |
| Gunung Prau | Jawa Tengah | Gunung | Wikimedia | — | ✅ |
| Gunung Papandayan | Jawa Barat | Gunung | Wikimedia | — | — |
| Bukit Moko | Jawa Barat | Bukit | Wikimedia | — | — |
| Ranu Kumbolo | Jawa Timur | Danau | Wikimedia | — | — |
| Gunung Nglanggeran | DI Yogyakarta | Gunung | Wikimedia | — | — |
| Gunung Rinjani | NTB | Gunung | Wikimedia | ✅ | ✅ |
| Gunung Semeru | Jawa Timur | Gunung | Wikimedia | ✅ | ✅ |
| Gunung Merbabu | Jawa Tengah | Gunung | Wikimedia | ✅ | ✅ |
| Kawah Ijen | Jawa Timur | Gunung | Wikimedia | ✅ | ✅ |
| Gunung Gede Pangrango | Jawa Barat | Gunung | Wikimedia | — | ✅ |
| Gunung Kerinci | Jambi | Gunung | Wikimedia | — | ✅ |
| Danau Kelimutu | NTT | Danau | Wikimedia | — | ✅ |
| Pantai Kuta | Bali | Pantai | Wikimedia | — | ✅ |
| Pantai Parangtritis | DI Yogyakarta | Pantai | Wikimedia | — | ✅ |
| Pantai Tanjung Tinggi | Kep. Bangka Belitung | Pantai | Wikimedia | — | ✅ |
| Danau Toba | Sumatera Utara | Danau | Wikimedia | — | ✅ |
| Danau Sentani | Papua | Danau | Wikimedia | — | ✅ |
| Air Terjun Tumpak Sewu | Jawa Timur | Air terjun | Wikimedia | — | ✅ |
| Air Terjun Sekumpul | Bali | Air terjun | Wikimedia | — | ✅ |
| Taman Nasional Baluran | Jawa Timur | Savana | Wikimedia | — | ✅ |
| Pulau Padar | NTT | Pulau/pantai | Wikimedia | — | ✅ |
| Goa Pindul | DI Yogyakarta | Goa | Wikimedia | — | ✅ |

## Fasilitas

`seed-facilities.ts` mengisi 3 fasilitas per destinasi untuk 10 destinasi baru
(30 fasilitas, masing-masing dengan 1–2 produk):

| Destinasi | Fasilitas |
| --- | --- |
| Pantai Kuta | Homestay, sewa motor, warung |
| Pantai Parangtritis | Homestay, jeep gumuk pasir, warung |
| Pantai Tanjung Tinggi | Villa, perahu Pulau Lengkuas, resto seafood |
| Danau Toba | Homestay Tuktuk, kapal/feri, resto Batak |
| Danau Sentani | Homestay, perahu, warung ikan |
| Air Terjun Tumpak Sewu | Homestay, ojek, warung kopi |
| Air Terjun Sekumpul | Homestay, sewa motor, warung Bali |
| Taman Nasional Baluran | Homestay, jeep savana, warung |
| Pulau Padar | Homestay Labuan Bajo, kapal Komodo, resto seafood |
| Goa Pindul | Homestay Bejiharjo, ojek, warung Gunungkidul |

## Sumber

- **Fakta umum destinasi** (elevasi, lokasi, akses, tiket): Wikipedia
  (id/en), situs resmi taman nasional/geopark, dan dinas pariwisata daerah.
  Nilai tiket/jarak yang bervariasi ditulis sebagai perkiraan.
- **Gambar**: Wikimedia Commons via `upload.wikimedia.org` (lisensi masing-masing
  file mengikuti Commons). URL diverifikasi HTTP 200.
- **Rute**: titik/ruas/jalur disusun dari jalur pendakian populer; elevasi
  dibulatkan. Data ini untuk demo, bukan navigasi resmi.

## Catatan

- Seed bersifat **upsert by slug** untuk destinasi dan **insert-if-missing**
  untuk jaringan rute/fasilitas.
- Destinasi tanpa gambar akan memakai placeholder di aplikasi.
- Untuk memperbarui data: ubah seed, jalankan `pnpm db:seed`.
