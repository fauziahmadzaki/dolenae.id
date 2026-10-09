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
