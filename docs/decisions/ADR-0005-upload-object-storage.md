# ADR-0005 — Upload & Object Storage (MinIO/S3)

- **Status:** Diterima
- **Tanggal:** 2026-10-05
- **Konteks modul:** `apps/server` (upload), `apps/web` (form media)

## Konteks

Foto destinasi (dan nanti fasilitas) perlu diunggah dari admin. Sebelumnya form
hanya menerima URL gambar. Dibutuhkan endpoint upload yang reusable lintas fitur
(satu endpoint global, bukan per-entitas), tanpa mengunci ke penyimpanan lokal
yang tidak layak produksi.

Catatan: backend memakai **Hono** (bukan Express), sehingga **multer tidak
relevan**.

## Keputusan

1. **Hono native `c.req.parseBody()`** untuk multipart — tanpa dependency
   parsing. Field `file` divalidasi (`File`, mime whitelist, batas ukuran).
   (Multer ditolak: middleware Express.)
2. **Object storage S3-compatible**: **MinIO self-host** via Docker Compose
   (`http://localhost:9000`), akses lewat **AWS SDK v3** (`@aws-sdk/client-s3`).
   Kontrak sama untuk S3/R2 bila nanti pindah penyedia.
   - **Tanpa driver lokal** — satu jalur penyimpanan (S3) saja.
   - MinIO butuh `forcePathStyle: true`.
3. **Endpoint global** `POST /api/uploads` (guard admin), field `file`, query
   `folder?` untuk prefix. Balikan `{ url, key, name, size, mime }`.
   - Key: `<folder>/YYYY/MM/<uuid>.<ext>` — nama acak, ekstensi dari mime
     (nama asli tidak dipercaya).
   - `DELETE /api/uploads?url=` (guard admin) menghapus berkas; dipakai saat
     melepas foto destinasi/fasilitas agar tidak ada berkas yatim.
4. **Akses publik baca**: bucket `dolenae` diberi policy `s3:GetObject` untuk
   `*` (dev). `S3_PUBLIC_URL` membentuk `url` gambar.
   - Inisialisasi: `pnpm --filter @dolenae/server storage:init` (buat bucket +
     policy).
5. **Image penyedia MinIO**: repo `minio/minio` di Docker Hub diarsip →
   dipakai mirror `tobi312/minio` (Alpine, dari rilis resmi MinIO) agar
   `docker compose up` tetap jalan.

## Konsekuensi

- **Positif:** satu endpoint untuk semua fitur; kontrak S3 → mudah ganti
  penyedia; web memakai `FormData` (upload file nyata), bukan hanya URL.
- **Biaya:** MinIO harus jalan + bucket terinisialisasi sebelum upload; bucket
  dibaca publik (dev) → untuk produksi perlu kebijakan lebih ketat (signed URL /
  CDN). Belum ada resize/kompresi gambar. Penghapusan berkas bersifat
  best-effort (jika gagal, berkas tetap ada) — belum ada pembersihan berkala.

## Alternatif yang ditolak

- **Multer** — middleware Express, tidak idiomatik di Hono.
- **Simpan ke disk + `serve-static`** — sederhana, tapi tidak layak produksi &
  tidak portabel saat deploy statis/multi-instance.
- **Upload langsung dari browser ke S3** (presigned URL) — lebih efisien untuk
  file besar, tapi menambah kompleksitas; bisa dipertimbangkan nanti.
