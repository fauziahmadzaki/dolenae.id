# AI Recommendation & Itinerary

Dokumen kontrak fitur AI itinerary Dolenae (mobile → backend).

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
`note` 500 karakter.

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
    "model": "gemini-2.5-flash"
  }
}
```

`engine`: `gemini` | `deterministic`.

## Aturan grounding

1. Fakta destinasi/rute/fasilitas/harga **wajib** dari context retrieval.
2. ID yang tidak ada di context dibuang server (`validateAiPayload`).
3. Pengetahuan umum hanya di `briefing.general`, ditampilkan dengan label
   **“Info umum — perlu verifikasi”**.
4. Status jalur `rusak`/`terlarang`/`dalam-perbaikan` wajib memunculkan warning.
5. Data kosong (harga tiket, fasilitas, rute) wajib memunculkan warning, bukan
   angka karangan.

## Konfigurasi backend

```env
GEMINI_API_KEY=
AI_MODEL=gemini-2.5-flash
AI_TIMEOUT_MS=30000
AI_DAILY_LIMIT=10
AI_CACHE_TTL_HOURS=24
```

- Hasil disimpan di tabel `ai_itineraries` (cache 24 jam per hash preferensi
  dan audit).
- Rate limit harian per user; melebihi batas → `429 AI_RATE_LIMITED`.
- Timeout/error Gemini → fallback deterministik, response tetap `200`.

## Batasan data saat ini

- Destinasi seed terbatas; itinerary di luar data akan banyak memakai
  `general` knowledge.
- Cuaca aktual, jam buka, jadwal transport, dan harga presisi tidak tersedia.
- Travel support baru tersedia untuk sebagian destinasi.
- `priceMin`/`priceMax` support dipakai untuk estimasi budget; jika kosong,
  estimasi hanya dari tiket masuk.

## Mobile

- `AiRepository.run()` async → `POST /ai/itineraries`.
- Offline/error jaringan → fallback rule-based (`kind: offline`).
- UI AI Hasil menampilkan itinerary per hari, briefing dua blok, warning,
  sumber data, dan checklist.
