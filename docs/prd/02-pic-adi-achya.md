# 02 — PRD per Orang: Adi Achya

- **Peran:** Module Owner
- **Modul yang dipegang:** [Modul 3](07-modul-03-katalog-publik.md) · [Modul 4](08-modul-04-admin-destinasi-dan-kategori.md)
- **Referensi:** [Index (00)](00-index-rebuild.md)

---

## Tanggung Jawab

1. Mengerjakan **Modul 3 & 4 secara full-stack** (backend + frontend) sampai
   lulus DoD.
2. Menjaga batas modul: tidak mengubah fondasi bersama tanpa review Fauzi.
3. Mengonsumsi komponen dari Modul 5 (`map-picker`, `image-uploader`) sesuai
   kontrak props yang disepakati.

## Ringkasan Deliverable

| Modul | Deliverable inti | Durasi |
| --- | --- | --- |
| [Modul 3](07-modul-03-katalog-publik.md) | Landing, katalog publik, detail destinasi + supports | Minggu 1 |
| [Modul 4](08-modul-04-admin-destinasi-dan-kategori.md) | Admin tabel + form multi-langkah + kategori (CRUD) | Minggu 2 |

## Rencana Commit (≥2 unit)

| # | Commit | Isi |
| --- | --- | --- |
| 1 | `feat(backend): categories + destinations (list/slug) + supports` | Modul 3 |
| 2 | `feat(frontend): landing + katalog + detail destinasi` | Modul 3 |
| 3 | `feat(backend): CRUD destinations + categories (admin)` | Modul 4 |
| 4 | `feat(frontend): admin tabel destinasi + tab kategori` | Modul 4 |
| 5 | `feat(frontend): form destinasi multi-langkah (new/edit)` | Modul 4 |

## Urutan Kerja

1. Tunggu kabar **Modul 0 selesai** (fondasi dari Fauzi).
2. Backend + frontend **Modul 3** → lulus DoD.
3. Sepakati kontrak props `map-picker`/`image-uploader` dengan Widan.
4. Kerjakan **Modul 4** (memanfaatkan admin shell dari Modul 2).

## Dependensi

- **Diblokir oleh** Modul 0 (fondasi).
- **Butuh** Modul 5 (Widan) untuk peta & uploader di form destinasi.
- **Memanfaatkan** admin shell dari Modul 2 (Fauzi) untuk halaman admin.

## Definition of Done (ringkas)

- `pnpm typecheck` hijau · `pnpm --filter frontend build` & `pnpm --filter backend build` hijau.
- Smoke test: admin buat/ubah/hapus destinasi → tampil di katalog publik.
- Dokumentasi modul diperbarui.
