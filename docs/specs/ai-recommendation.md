# AI Recommendation & Itinerary

Dokumen kontrak fitur AI itinerary Dolenae (mobile → backend).

## Endpoint

| Method | Path | Fungsi |
| --- | --- | --- |
| GET | `/api/ai/options` | wilayah/aktivitas/medan/durasi dari katalog published |
| POST | `/api/ai/itineraries` | susun itinerary grounded (Bearer, role apa pun) |

Semua field request opsional. Filter yang tidak menemukan hasil dilonggarkan
bertahap (aktivitas → medan → budget → wilayah → difficulty) dan alasan
pelonggaran dikirim sebagai warning.

## Ringkasan

- **Endpoint:** `POST /api/ai/itineraries` (Bearer token, role apa pun).
- **Provider:** Google Gemini (opsional). Tanpa `GEMINI_API_KEY`, endpoint
  memakai builder **deterministik** dari data DB (tidak ada panggilan eksternal).
- **Retrieval:** filter SQL + lexical search atas destinasi `published`,
  kategori, travel support, dan rute. Tanpa vector DB (pgvector menyusul).
- **Grounding:** semua ID harus berasal dari konteks; LLM tidak boleh mengarang
  destinasi/rute/fasilitas. Bagian briefing dipisah menjadi fakta data dan
  pengetahuan umum.

## Request

```json
{
  "destinationIds": ["uuid-destinasi-1", "uuid-destinasi-2"],
  "originProvince": "Jawa Barat",
  "rawText": "sunrise gunung di Jawa Timur",
  "regions": ["Jawa Timur"],
  "activities": ["Sunrise"],
  "terrains": ["Gunung"],
  "difficulty": "menengah",
  "durationDays": 2,
  "budgetPerPerson": 1000000,
  "needsAccommodation": true,
  "needsTransport": true,
  "note": "bawa anak"
}
```

Semua field opsional. Batas: `rawText` 1000 karakter, `destinationIds` maks. 7,
`durationDays` 1–7, `note` 500 karakter. Kirim `refresh: true` untuk melewati
cache 24 jam (dipakai tombol “Tanya lagi”).

`destinationIds` dipakai alur **Buat Rencana** di mobile. Bila diisi, backend
mempertahankan urutan destinasi terpilih, hanya memakai destinasi `published`,
dan menjadwalkan semuanya ke hari 1–n (beberapa destinasi bisa berbagi satu
hari). ID yang tidak ditemukan dilewati dan dilaporkan sebagai warning. Output
Gemini yang tidak memakai semua destinasi terpilih ditolak dan diganti builder
deterministik.

`originProvince` diisi mobile dari lokasi user (atau input manual). Bila berbeda
dari provinsi destinasi, checklist menambahkan dua opsi transport antarprovinsi
(pesawat dan kapal laut) dengan `alternativeGroup` yang sama; hanya satu opsi
yang `selected` dan dihitung ke total.

## Response

```json
{
  "success": true,
  "data": {
    "itinerary": {
      "title": "Rencana 2 hari di Jawa Timur",
      "summary": "…",
      "days": [
        {
          "day": 1,
          "title": "Gunung Bromo",
          "items": [
            {
              "destinationId": "uuid",
              "destinationName": "Gunung Bromo",
              "routeId": "uuid",
              "supportIds": ["uuid"],
              "activity": "Ikuti jalur Jeep Sunrise",
              "startTime": "07:00",
              "costEstimate": "Rp 265.000",
              "notes": "Jeep Sunrise: 2.33 km, +570 m."
            }
          ]
        }
      ]
    },
    "briefing": {
      "grounded": ["fakta dari data Dolenae"],
      "general": ["info umum, perlu verifikasi"],
      "warnings": ["jalur rusak / data kosong"]
    },
    "checklist": ["Jaket", "Headlamp"],
    "sources": [
      { "type": "destination", "id": "uuid", "label": "Gunung Bromo" },
      { "type": "route", "id": "uuid", "label": "Jeep Sunrise" },
      { "type": "support", "id": "uuid", "label": "Homestay Cemoro Indah" }
    ],
    "engine": "gemini",
    "model": "gemini-3.5-flash",
    "notice": "Maaf, destinasi yang kamu cari (everest) belum ada di Dolenae. Berikut rekomendasi alternatif yang paling sesuai dengan preferensimu.",
    "recommendations": [
      {
        "destinationId": "uuid",
        "name": "Gunung Bromo",
        "slug": "gunung-bromo",
        "tagline": "Lautan pasir dan sunrise",
        "province": "Jawa Timur",
        "regency": "Probolinggo",
        "elevationMeters": 2329,
        "entryFee": 29000,
        "difficulty": "ramah-pemula",
        "images": ["https://..."],
        "score": 95,
        "rank": 1,
        "reasons": ["Jeep Sunrise: 2.33 km, +570 m, ±85 menit.", "Warung Bromo Asri (Rp 25.000 - 50.000)."]
      }
    ]
  }
}
```

`notice` hanya dikirim jika ada kata kunci penting di `rawText` yang tidak
ditemukan pada katalog destinasi published. Hasil tetap berisi alternatif, dan
`briefing.warnings` menambahkan detail kata kunci yang tidak ditemukan.

`engine`: `gemini` | `deterministic`.

## Aturan grounding

1. Fakta destinasi/rute/fasilitas/harga **wajib** dari context retrieval.
2. ID yang tidak ada di context dibuang server (`validateAiPayload`).
3. Jika context berisi destinasi tetapi output LLM tidak memakai satu pun
   `destinationId`, output ditolak dan builder deterministik dipakai.
4. Pengetahuan umum hanya di `briefing.general`, ditampilkan dengan label
   **“Info umum — perlu verifikasi”**.
5. Status jalur `rusak`/`terlarang`/`dalam-perbaikan` wajib memunculkan warning.
6. Data kosong (harga tiket, fasilitas, rute) wajib memunculkan warning, bukan
   angka karangan.
7. Jika kata kunci penting dari prompt tidak ada di katalog (mis. “Everest”),
   response menyertakan `notice` dan warning; itinerary tetap berisi alternatif.
8. Jika `destinationIds` dikirim, semua ID valid wajib muncul di itinerary;
   Gemini yang melewatkan salah satunya akan jatuh ke builder deterministik.

## Konfigurasi backend

```env
GEMINI_API_KEY=            # fallback env bila belum diset dari admin
AI_MODEL=gemini-3.5-flash
AI_TIMEOUT_MS=30000
AI_DAILY_LIMIT=10
AI_CACHE_TTL_HOURS=24
APP_ENCRYPTION_KEY=        # wajib, 32 byte base64
```

## Pengaturan dari admin

Halaman `/admin/pengaturan` menyimpan API key Gemini secara **terenkripsi
AES-256-GCM** di tabel `app_settings`:

| Method | Path | Fungsi |
| --- | --- | --- |
| GET | `/api/admin/ai/settings` | status key (masked), model, sumber, audit |
| PUT | `/api/admin/ai/settings` | simpan `apiKey?` / `model?` |
| GET | `/api/admin/ai/models` | daftar model Gemini (`generateContent`) |
| POST | `/api/admin/ai/test` | test prompt sederhana + output |

- API key tidak pernah dikembalikan utuh; hanya `keyPreview` (`••••••3456`).
- Semua endpoint admin-only; `updatedBy` dicatat.
- Test koneksi dibatasi 5x/menit per admin.
- Endpoint admin membutuhkan sesi admin aktif. Bila token tidak terkirim atau
  kedaluwarsa, web mengarahkan ke halaman login.
- Model default `gemini-3.5-flash`; model lain bisa dimuat dari Google lalu
  dipilih. Jika model tidak tersedia untuk key tersebut, pesan error Gemini
  ditampilkan di panel test.
- `APP_ENCRYPTION_KEY` wajib; generate:
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- Konfigurasi DB di-cache 60 detik dan fallback ke env bila belum diisi.

## Batasan data saat ini

- Destinasi seed terbatas; itinerary di luar data akan banyak memakai
  `general` knowledge.
- Cuaca aktual, jam buka, jadwal transport, dan harga presisi tidak tersedia.
- Travel support baru tersedia untuk sebagian destinasi.
- `priceMin`/`priceMax` support dipakai untuk estimasi budget; jika kosong,
  estimasi hanya dari tiket masuk.

## Mobile

- Opsi wilayah/aktivitas/medan/durasi dimuat dari `GET /ai/options`; bila gagal,
  memakai daftar fallback lokal.
- `AiRepository.run()` async → `POST /ai/itineraries` dengan timeout 60 detik.
- Setiap request baru mengosongkan hasil lama (`runId` bertambah) dan menampilkan
  skeleton layout hasil dengan shimmer; spinner tidak dipakai.
- Tombol “Tanya lagi” menjalankan ulang preferensi dengan `refresh: true`.
- Error API (422/429/5xx/timeout) ditampilkan sebagai state gagal + tombol coba
  lagi; data demo hanya dipakai saat repository berjalan tanpa remote (test).
- `difficulty` selalu dikirim sebagai enum (`ramah-pemula`/`menengah`/`sulit`).
- `notice` ditampilkan sebagai banner “Destinasi belum tersedia”; warning detail
  tetap muncul di briefing.
- UI hasil mengikuti Figma **card-first**: kartu prompt, chip preferensi,
  label engine, kartu **Ringkasan AI**, lalu maksimal 3 kartu destinasi.
- Kartu destinasi menampilkan rank, skor, alasan, tombol **Lihat detail** dan
  **Tambah**.
- **Lihat detail** memakai `push` ke `/destination/:id`, sehingga back kembali
  ke halaman rekomendasi dengan state yang sama.
- Tombol **Tambah** masih placeholder (toast “segera hadir”).
- Itinerary dan briefing tetap tersedia di response API, tetapi tidak
  ditampilkan pada layar hasil card-first.
- UI AI Hasil mengikuti layout card-first; itinerary/briefing tetap dikirim API
  untuk kebutuhan tampilan lain di masa depan.

## Mobile — tab Rencana

- `/plan` menampilkan **daftar kartu rencana** (bukan satu rencana aktif).
  Kartu berisi judul, status, tanggal, durasi, jumlah destinasi, dan budget.
- Kartu ditekan → masuk ke `/plan/:id` yang menampilkan ringkasan, itinerary
  hari 1–n, ringkasan AI, dan estimasi biaya (total + per orang).
- Rencana disimpan lokal di `SharedPreferences` (`plan.list.v1`); seed hanya
  dipakai saat penyimpanan belum ada.
- Rencana bisa dihapus dari ikon sampah di kartu daftar atau dari app bar
  halaman detail. Keduanya memakai dialog konfirmasi destruktif; setelah
  dihapus data rencana, itinerary, dan checklist ikut hilang dari penyimpanan.
- Alur buat rencana:
  1. `/plan/new` — nama, tanggal, 1–7 hari, orang, budget, catatan.
  2. `/plan/select-destination` — pilih maks. 7 destinasi.
  3. Rencana disimpan sebagai **Draft**, lalu `/plan/generating` memanggil AI
     dengan `destinationIds`. Loading memakai skeleton, bukan spinner.
  4. Sukses → `/plan/:id`; gagal → draft tetap tersimpan, detail menampilkan
     warning dan tombol **Coba lagi**.

## Mobile — checklist persiapan per rencana

- Detail rencana punya kartu **Checklist persiapan** dengan progress
  `selesai/total`; tap membuka `/plan/:id/checklist`.
- Di `/plan/new`, user dapat menekan **Gunakan lokasi saat ini** untuk mengisi
  provinsi asal. Izin ditolak / geocode gagal → isi provinsi manual.
- Provinsi asal disimpan di `TripPlan.originProvince` dan ditampilkan di
  checklist/detail rencana.
- Checklist disimpan di `TripPlan.checklist` dan ikut tersimpan di
  `SharedPreferences`.
- Pengguna bisa menambah item sendiri lewat `/plan/:id/checklist/add`
  (nama, kategori, wajib/opsional, catatan) dan mencentang item.
- Tombol **Generate dari AI** memakai ulang `POST /api/ai/itineraries` dengan
  konteks rencana (`destinationIds`, `durationDays`, `budgetPerPerson`,
  `note`), lalu mengambil array `checklistItems`.
- Response AI juga menyertakan `checklistItems` berisi
  `{ name, category, estimatedCost, note, isRequired }`.
  `estimatedCost` adalah estimasi **per orang** dalam rupiah.
- Kategori `biaya` dipakai untuk tiket masuk, transportasi, penginapan, dan
  makan; kategori lain untuk perlengkapan, kesehatan, konservasi, dan
  administrasi.
- Prompt Gemini meminta **14–18 item** yang mencakup perlengkapan, pakaian,
  kesehatan, administrasi, konservasi, dan biaya perjalanan.
- Biaya hanya diberikan untuk item yang perlu dibeli/sewa (tiket, transport,
  penginapan, makan, air minum, P3K, sewa tenda). Perlengkapan pribadi
  tahan lama memakai biaya `null` dan catatan “jika belum punya”.
- Total estimasi **tidak dipaksa mengisi budget**; hasil boleh di bawah
  budget. Jika AI mengembalikan kurang dari 12 item, checklist deterministic
  digabung agar tetap lengkap.
- Setiap item punya toggle **Sudah punya**. Item yang aktif dilewati dari
  total biaya, tetapi status selesai/progress checklist tidak berubah.
- Item transport antarprovinsi tampil sebagai dua alternatif
  (`alternativeGroup: transport-antarprovinsi`). Hanya opsi yang dipilih yang
  dihitung; opsi lain ditandai sebagai alternatif.
- Hasil AI **digabung** dengan checklist lama: duplikat nama diabaikan, item
  custom dan status centang tidak berubah.
- Header checklist menampilkan total estimasi per orang, status
  `Budget masih longgar · sisa Rp…`, `Budget terpakai penuh`, atau
  `Melebihi budget Rp…`, plus catatan biaya tak terduga.
- Saat generate, layar menampilkan skeleton baris; kegagalan AI tidak
  menghapus checklist lama.
