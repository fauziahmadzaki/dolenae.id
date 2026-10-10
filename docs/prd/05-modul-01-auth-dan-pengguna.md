# 05 — Modul 1: Auth & Pengguna

- **PIC:** Fauzi Ahmad Zaki ([01](01-pic-fauzi-ahmad-zaki.md))
- **Durasi:** Minggu 1
- **Dependency:** Modul 0
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tujuan

Autentikasi lengkap (BE + FE) berbasis JWT sebagai pintu masuk area admin.

## Backend

- [ ] `utils/jwt.ts` memakai `jose` (issue + verify, HS256).
- [ ] Middleware `authRequired` & `requireRole`.
- [ ] `POST /api/auth/register` — registrasi.
- [ ] `POST /api/auth/login` — login, balas `{ token, user }`.
- [ ] `GET /api/users/me` — profil dari token.
- [ ] `GET /api/users` — daftar pengguna (admin).
- [ ] Service user + hashing password.

## Frontend

- [x] Slicing "Hi-Fi Web - Masuk (1440)" ke `src/features/auth/` (`api/types/hooks/components/pages`) + route `app/auth/login/page.tsx` → URL `/auth/login` (sesuai tiket SCRUM-8).
- [x] `useAuth` + session store (`localStorage`; `sessionStorage` bila "Ingat saya" tidak dicentang).
- [x] Redirect ke `/admin` setelah login berhasil.
- [ ] Halaman `/auth/register` & `/auth/forgot-password` — menyusul (tab & link sudah mengarah).
- [ ] Login Google (GSI → `POST /api/auth/google`) — butuh `GOOGLE_CLIENT_ID`; tombol sudah tampil.

> **Catatan (SCRUM-8):** dikerjakan **Adi** (per Jira). `auth/api/login.ts` memakai
> server action (`"use server"`) sesuai tiket; `auth/hooks` = validasi zod +
> interaksi; `auth/pages/login-page.tsx` di-export default lalu dipanggil
> `app/auth/login/page.tsx`. Desain dari file Figma "UI UX Dolenae.id" →
> page "Hi-Fi Web" → frame "Masuk" (`89:3328`).

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
