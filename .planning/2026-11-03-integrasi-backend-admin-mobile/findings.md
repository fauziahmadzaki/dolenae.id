# Findings & Decisions

## Requirements
Pengguna meminta seluruh integrasi belum selesai: fasilitas, tracking, promo, paid, QR, REST API, AI, ORM; wajib mengikuti contoh kode, PRD, DESIGN.md.

## Verified discovery
- Git branch `dev`, working tree awal bersih.
- Aplikasi aktual `apps/backend` (Express 5, Zod, PostgreSQL + Drizzle), `apps/frontend` (Next.js 16, React 19), `apps/mobile` (Flutter).
- `README.md` dan AGENTS root masih mengacu arsitektur Hono/TanStack/packages yang tidak ada; aturan subdirektori lebih akurat.
- Backend memiliki node_modules dan .env (isi rahasia tidak dibaca); frontend dependencies kini terpasang frozen lockfile setelah izin pengguna. .env.local tidak ada; default localhost API existing berlaku.
- Klarifikasi user: payment dummy, provider nyata tim; tracking jalur trekking/elevasi.
- Dashboard existing placeholder, sidebar verifikasi badge 7 palsu; support public read API sudah real, admin CRUD belum. Personal plan/checklist/saved/notifications masih seed/in-memory.
- DB real berhasil diping setelah docker desktop start; baseline backend 190/mobile 284 tests hijau.
- Node, pnpm, Flutter, Dart, Docker tersedia di PATH; keberhasilan runtime belum diuji.
- PRD melarang marketplace booking dan live GPS tracking; request paid/promo/QR/tracking belum memiliki spesifikasi/provider dalam product overview/blueprint yang dibaca.
- Blueprint merinci fasilitas/usulan, trip/checklist, saved, notifikasi, FAQ/feedback, admin metrics/activity/verifikasi sebagai cakupan integrasi.
- DESIGN.md: tema Alam, deep-pine/bone, satu aksen ember, reuse dialog/tabel/widget, ikon Lucide, teks Indonesia.

## Additional findings
- AI options/retrieval sebelumnya hanya page 1 limit 100; kini helper menelusuri metadata halaman penuh (33 tests reverified).
- DB backup dan smoke terisolasi tersedia; jangan seed ulang DB asli.

- Handoff mobile personal mengakui UI parsial; inspeksi parent membuktikan checklist timestamp-ID/sukses lokal, profil defaultDimas/sukses palsu, 2FA toggle palsu masih tersisa. Ditugaskan closure UI, bukan klaim selesai berdasarkan test lama.
- Blueprint profil GET/PATCH users/me belum ada. Addendum minimal name saja memakai kolom users existing; field belum didukung dinonaktifkan jujur. Tidak menambah scope penyedia pembayaran/GPS.

## Technical Decisions
| Decision | Rationale |
|---|---|
| Audit bukti implementasi sebelum menambah fitur | Blueprint/ERD banyak status usang. |
| Satu pemilik shared plan (parent) | Hindari bentrok penulisan parallel. |

## Resources
AGENTS.md; apps/{backend,frontend,mobile}/AGENTS.md; docs/prd/product-overview.md; docs/specs/product-blueprint.md; DESIGN.md.
