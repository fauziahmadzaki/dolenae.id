# Task Plan: Integrasi backend, admin, mobile

## Goal
Lengkapi fitur belum selesai dari PRD/desain pada backend Express + Drizzle, admin Next.js, Flutter; integrasi nyata, test, dokumentasi batas fitur.

## Next Step
Tutup gap UI Flutter/profile dan race harga terkonfirmasi; terima hasil closure/frontend, review spesifikasi kemudian kualitas sebelum migrasi/QA browser.

## Current Phase
Phase 3

## Phases

### Phase 1: Audit kode, PRD, desain, lingkungan
- [x] Baca AGENTS root/aplikasi, PRD product overview, DESIGN.md, blueprint.
- [x] Inventaris: dashboard placeholder, support read-only, personal repositories seed; test baseline hijau.
- [x] User menyetujui instalasi lockfile; pembayaran dummy, tracking trekking/elevasi.
- **Status:** complete

### Phase 2: Kontrak dan rencana implementasi
- [x] Kontrak docs/specs/integration-contract.md, tugas terpisah backend operations/personal, frontend, mobile personal/payment.
- [x] Dummy non-QRIS, tanpa booking/GPS/provider nyata; dependency existing saja.
- **Status:** complete

### Phase 3: Implementasi vertikal
- [ ] Backend ORM/API fitur yang belum selesai, validasi, otorisasi.
- [ ] Dashboard admin terhubung API; reuse tabel/dialog/token desain.
- [ ] Flutter mengganti stub relevan dengan repository API, state kesalahan, cache aman.
- **Status:** in_progress

### Phase 4: Review dan verifikasi
- [ ] Review kesesuaian spesifikasi, kemudian kualitas/keamanan.
- [ ] Typecheck/build web/backend, test backend, flutter analyze/test, smoke integrasi.
- [ ] Laporkan keterbatasan nyata; tidak klaim fitur terblokir selesai.
- **Status:** pending

### Phase 5: Dokumentasi dan penyerahan
- [ ] Sinkronkan kontrak/spec dan checkpoint Obsidian tanpa menimpa catatan lama.
- [ ] Ringkasan hasil, verifikasi, sisa pekerjaan.
- **Status:** pending

## Decisions Made
| Decision | Rationale |
|---|---|
| Kode dan AGENTS aplikasi mengungguli dokumentasi root yang usang | Root menyebut TanStack/Hono/packages; aktual Next.js/Express, tipe manual. |
| Tidak install otomatis | Preferensi pengguna: berhenti saat perlu instalasi/manual. |
| Tidak push/merge/deploy/transaksi nyata | Permintaan hanya pengerjaan lokal; pembayaran/pelacakan perlu kontrak jelas. |

## Errors Encountered
| Error | Resolution |
|---|---|
| Salah nama skill/argumen berulang | Pemanggilan harus nama persis `planning-with-files`, bukan frasa tambahan; berhasil dimuat ulang. |
| write_file menolak overwrite hasil read default sebagai partial | Gunakan patch berdasarkan isi template penuh. |
| Output pembacaan batch terlalu besar | Audit selanjutnya dibatasi per area, ringkasan berbasis bukti. |
