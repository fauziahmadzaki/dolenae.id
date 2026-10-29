# Seed Data Destinasi

Sumber data seed `apps/backend/src/db/seed.ts` (+ `seed-networks.ts`).

## Cakupan

13 destinasi seed (7 baru pada Okt 2026):

| Destinasi | Provinsi | Gambar | Rute | Supports |
| --- | --- | --- | --- | --- |
| Gunung Bromo | Jawa Timur | Wikimedia | ✅ | ✅ |
| Gunung Prau | Jawa Tengah | — | — | ✅ |
| Gunung Papandayan | Jawa Barat | Wikimedia | — | — |
| Bukit Moko | Jawa Barat | — | — | — |
| Ranu Kumbolo | Jawa Timur | — | — | — |
| Gunung Nglanggeran | DI Yogyakarta | Wikimedia | — | — |
| Gunung Rinjani | NTB | Wikimedia | ✅ | ✅ |
| Gunung Semeru | Jawa Timur | Wikimedia | ✅ | ✅ |
| Gunung Merbabu | Jawa Tengah | Wikimedia | ✅ | ✅ |
| Kawah Ijen | Jawa Timur | Wikimedia | ✅ | ✅ |
| Gunung Gede Pangrango | Jawa Barat | Wikimedia | — | ✅ |
| Gunung Kerinci | Jambi | Wikimedia | — | ✅ |
| Danau Kelimutu | NTT | Wikimedia | — | ✅ |

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
  untuk jaringan rute/supports.
- Destinasi tanpa gambar akan memakai placeholder di aplikasi.
- Untuk memperbarui data: ubah seed, jalankan `pnpm db:seed`.
