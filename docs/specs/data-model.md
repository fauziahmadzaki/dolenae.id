# Data Model — Dolenae.id

Dokumen ini mendeskripsikan entitas domain Dolenae.id. Implementasi
TypeScript ada di `packages/types/src/` (single source of truth).

## Entitas Utama

### User
Peran (role): `wisatawan` | `merchant` | `admin`.

- `User`: id, nama, email, role, createdAt.
- `Merchant extends User`: bisnis, deskripsi.

### Destination
Destinasi alam (gunung, bukit, danau, air terjun, dsb).

**Field inti:**
- identitas: `id`, `name`, `slug`, `tagline`, `description`
- klasifikasi: `terrain[]`, `activities[]`, `difficulty`, `bestSeason[]`, `tags[]`
- geografi: `location` (provinsi, kabupaten, koordinat, serta `accessPoint?`
  berupa basecamp/titik akses terdekat — dipakai untuk peta lokasi)
- `access`: deskripsi akses, moda transportasi, estimasi waktu, jarak
- `facilities`: toilet, warung, mushola, parkir, homestay dekat, dll
- ekonomi: `entryFee`, `elevationMeters`
- meta: `images`, `guideRequired`, `createdAt`, `updatedAt`

**Relasi:** satu destinasi memiliki banyak `TravelSupport`
(`DestinationDetail = Destination + supports[]`).

### TravelSupport (Kebutuhan Pendukung)
Diskriminator `type`:
- `accommodation` — penginapan (harga/malam, kapasitas, fasilitas)
- `transport` — moda (motor, mobil, elf, open-trip, dll), rute, harga
- `food` — tempat makan (masakan, rentang harga)

Field umum: nama, `destinationId`, deskripsi, `priceRange`, `contact`,
`verified`, `tags`, `image`.

### Trip
- `PreparationItem` + `PreparationChecklist` — baris ceklis perlengkapan
  per destinasi (kategori: perlengkapan/kesehatan/konservasi/administrasi).
- `TripPlanItem` — satu destinasi + kebutuhan pendukung terpilih + progress
  checklist.
- `TripPlan` — kumpulan item per rencana perjalanan + estimasi budget.

### AI
- `Preference` — input preferensi (region, aktivitas, terrain, kesulitan,
  budget, durasi, musim, kebutuhan inap/transport, teks natural).
- `RuleScore` — skor + alasan per destinasi.
- `RecommendationResult` — hasil rekomendasi (rule-based | llm), berisi
  destinas terurut + ringkasan + referensi checklist.

## Relasi Ringkas

```
User 1───* TripPlan
Destination 1───* TravelSupport
Destination 1───1 PreparationChecklist 1───* PreparationItem
TripPlan 1───* TripPlanItem (berisi Destination + TravelSupport[] + checklist progress)
```

## Konvensi

- `ID` = string (uuid/nanoid). `ISODateString` = ISO 8601.
- Enum direpresentasikan sebagai union string literal (`"gunung" | "bukit" | ...`)
  agar mudah dipertukarkan antar aplikasi (TS ↔ Dart ↔ API).