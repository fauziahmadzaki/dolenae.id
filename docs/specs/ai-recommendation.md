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

Semua field opsional. Batas: `rawText` 1000 karakter, `durationDays` 1–7,
`note` 500 karakter. Kirim `refresh: true` untuk melewati cache 24 jam (dipakai
tombol “Tanya lagi”).

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
- Kartu destinasi (`recommendations`) menampilkan rank, skor, alasan, tombol
  **Lihat detail** dan **Tambah**.
- **Lihat detail** memakai `push` ke `/destination/:id`, sehingga back kembali
  ke halaman rekomendasi dengan state yang sama.
- Tombol **Tambah** masih placeholder (toast “segera hadir”).
- UI AI Hasil menampilkan itinerary per hari, briefing dua blok, warning,
  sumber data, dan checklist.
