# 05 — Modul 1: Auth & Pengguna

- **PIC:** Fauzi Ahmad Zaki ([01](01-pic-fauzi-ahmad-zaki.md))
- **Durasi:** Minggu 1
- **Dependency:** Modul 0
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tujuan

Autentikasi lengkap (BE + FE) berbasis JWT sebagai pintu masuk area admin.

## Backend

- [x] `utils/jwt.ts` memakai `jose` (issue + verify, HS256).
- [x] Middleware `authRequired` & `requireRole`.
- [x] `POST /api/auth/register` — registrasi.
- [x] `POST /api/auth/login` — login, balas `{ token, user }`.
- [x] `GET /api/auth/me` — profil dari token.
- [x] Service auth + hashing password (`scrypt`).
- [x] `POST /api/auth/google` — verifikasi Google ID token.
- [x] `POST /api/auth/forgot-password` + `POST /api/auth/reset-password` (email via Resend).
- [ ] `GET /api/users` — daftar pengguna (admin). _(modul berikutnya)_

> **Catatan (SCRUM-7):** backend auth dikerjakan **Adi** (per Jira), bukan
> mengikuti pembagian PIC di `docs/prd/01` & index. Endpoint reset memakai path
> `/api/auth/reset-password` dengan `token` di body (tiket menulis
> `forgon-password?token=`, kemungkinan typo). Set tabel `users` +
> `password_reset_tokens` dibuat lewat migrasi `drizzle/0000_parallel_toro.sql`.

## Frontend

- [ ] `app/login/page.tsx` + `login-form`.
- [ ] `AuthProvider` / `useAuth` + session store (`localStorage`).
- [ ] Redirect ke `/admin` setelah login berhasil.

## Rencana Commit

| # | Commit | Isi |
| --- | --- | --- |
| 5 | `feat(backend): jwt + endpoint auth & users` | BE auth |
| 6 | `feat(frontend): halaman login + AuthProvider/session` | FE auth |

## Output

- Login → sesi tersimpan → siap masuk area admin.
- Endpoint pengguna dipakai Modul 2 (halaman users).

## Kriteria Selesai (DoD)

- [ ] `pnpm typecheck` & `pnpm build` hijau.
- [ ] Login sukses → token tersimpan.
- [ ] Token invalid/kedaluwarsa ditolak server.
- [ ] Dokumentasi modul diperbarui.
