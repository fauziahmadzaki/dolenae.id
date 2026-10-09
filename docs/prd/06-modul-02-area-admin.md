# 06 — Modul 2: Area Admin

- **PIC:** Fauzi Ahmad Zaki ([01](01-pic-fauzi-ahmad-zaki.md))
- **Durasi:** Minggu 2
- **Dependency:** Modul 1 (auth)
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tujuan

Kerangka area admin (shell + guard) yang menjadi tempat modul lain menempelkan
halaman, plus dashboard ringkas dan pengelolaan pengguna.

## Frontend

- [ ] `app/admin/layout.tsx` (guard: redirect `/login` bila belum login).
- [ ] `AdminShell` + sidebar + topbar + `nav-items`.
- [ ] `app/admin/page.tsx` — dashboard ringkas.
- [ ] `app/admin/users/page.tsx` — daftar pengguna.

## Rencana Commit

| # | Commit | Isi |
| --- | --- | --- |
| 7 | `feat(frontend): admin shell + guard layout` | Shell & guard |
| 8 | `feat(frontend): dashboard ringkas + halaman users` | Dashboard & users |

## Output

- Area admin dapat diakses setelah login; menjadi kerangka Modul 4.

## Kriteria Selesai (DoD)

- [ ] `pnpm typecheck` & `pnpm build` hijau.
- [ ] Belum login → redirect `/login`; sudah login → masuk `/admin`.
- [ ] Daftar user tampil.
- [ ] Dokumentasi modul diperbarui.
