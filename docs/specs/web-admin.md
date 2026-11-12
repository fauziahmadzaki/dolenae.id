# Web Admin — Dolenae.id

Halaman **login** dan **dashboard admin** pada `apps/frontend` (Next.js App
Router), memakai API dari `apps/backend`.

## 1. Menjalankan

```bash
# Backend (wajib) — Postgres + API
cd apps/backend && docker compose up -d && cd ../..
pnpm dev:api                           # http://localhost:3001

# Web
cp apps/frontend/.env.example apps/frontend/.env.local # sekali saja
pnpm dev:web                           # http://localhost:3000
```

Akun demo (dari `db:seed`):

| Email | Kata sandi | Role |
| --- | --- | --- |
| `admin@dolenae.id` | `admin12345` | admin |
| `dimas@dolenae.id` | `wisatawan123` | wisatawan |

## 2. Halaman & rute

| Rute | Isi |
| --- | --- |
| `/auth/login` | Form masuk admin — slicing desain Figma `Hi-Fi Web - Masuk` (`89:3328`) |
| `/admin` | Dashboard (guard) — ringkasan kartu |
| `/admin/destinasi` | Destinasi — tab Kategori (CRUD) + tab Destinasi (tabel/card, CRUD). Tab aktif via `?tab=kategori` |
| `/admin/destinasi/baru` | Form tambah destinasi (5 langkah) + fasilitas |
| `/admin/destinasi/[id]/edit` | Form edit destinasi |
| `/admin/destinasi/[id]/rute` | Route builder (titik, ruas, jalur, profil elevasi) |
| `/admin/users` | Tabel pengguna + pagination + pencarian (khusus admin) |
| `/admin/pengaturan` | Pengaturan AI (Gemini) + koneksi |
| `/design-system` | Katalog komponen DS "Alam" (warna, Button, Input, Badge/Chip, Select, Dropdown, Card, Dialog, Toaster, Image uploader) |

> **Kategori & Destinasi** di-slicing dari Figma page **`Hi-Fi Web`**:
> `157:759` (Kategori), `158:1010` (Destinasi/Tabel), `158:1375` (Card),
> `160:3635` (Dialog). Struktur: PageHead + tab underline (ikon `tags`/`mountain`),
> segmented `Terrain/Aktivitas` pada tab Kategori (grid 4 kolom: kotak ikon,
> aksi edit/hapus, nama, jumlah destinasi), toolbar Destinasi (search, filter
> Terrain/Status, toggle Tabel/Card, jumlah), tabel 7 kolom (Destinasi,
> Provinsi, Terrain, Kesulitan, Fasilitas, Status, Aksi) dengan baris selang-seling
> `canvas`, kartu destinasi (media 140px + badge status + kebab menu; nama, chip
> terrain, meta provinsi·mdpl, pil kesulitan, jumlah fasilitas), dan pagination.
> Kebab pada kartu membuka **dropdown aksi**: `Edit destinasi`,
> `Lihat publik` (tab baru), dan `Hapus destinasi`.
> Shell admin (`admin.tsx`) memakai label nav **Destinasi** + topbar dinamis per rute.
>
> **Form Create/Edit Destinasi** di-slicing dari frame `Admin Create Destinasi
> Step 1-5` (`159:1883`, `160:2106`, `160:2335`, `160:2556`, `160:2753`) dan
> `Admin Edit Destinasi` (`160:2975`, dst.). Struktur: **indikator langkah**
> (circle 1-5 + garis penghubung, bisa diklik), **kartu form** + **side panel**
> (kartu tips per langkah + kartu "Kelengkapan" dengan progress bar `20%×langkah`),
> dan **footer** (`Kembali` · `Simpan draf` · `Lanjut`/`Publikasikan`). Langkah:
> 1 Info Dasar (nama, slug ber-prefix `dolenae.id/destinasi/`, tagline, deskripsi
> dengan toolbar RTE), 2 Klasifikasi (chip terrain/aktivitas, segmented kesulitan,
> musim, guide), 3 Lokasi & Akses (**peta Leaflet** — klik untuk menaruh pin;
> combobox **provinsi → kabupaten → kecamatan** + elevasi; **reverse geocode**
> otomatis mengisi wilayah dari koordinat; basecamp, deskripsi akses, chip moda,
> estimasi waktu), 4 Fasilitas (tab Penginapan/Transport/Makanan + jumlah, baris
> fasilitas dengan status/harga/aksi, tambah inline **+ unggah foto fasilitas**,
> hapus fasilitas sekaligus membersihkan berkas, fasilitas umum), 5 Media &
> Publikasi (**unggah foto** ke object storage via dropzone/pilih file — fallback
> tempel URL, thumbnail + badge `Utama`, hapus foto membersihkan berkas, tags,
> harga tiket, radio status, ringkasan).
>
> `/auth/login` sengaja **di luar** layout guard `/admin` agar tidak ikut proses
> proteksi.
>
> Halaman admin memakai komponen DS dari `components/ui/` (Button, Input, Badge,
> Select, DropdownMenu, Card, Dialog) — bukan markup ad-hoc. Konfirmasi hapus
> memakai `Dialog` (bukan `window.confirm`), dan notifikasi memakai `useToast()`.
>
> Desain login mengikuti Figma: split **720/720** (form kiri bg `canvas`, panel
> media kanan bg `primary`), header (`surface` + hairline) & footer (band
> `primary`), tab Masuk/Daftar, input `canvas-subtle` radius 12, CTA pill
> `primary`, divider "atau lanjut dengan", tombol Google, dan 3 poin nilai.
> Token tema "Alam" ada di `src/app/globals.css` (`@theme`), komponen chrome di
> `src/components/layout/`.

## 3. Struktur

Prinsip: **route tipis** (`app/**/page.tsx` hanya menyusun halaman), UI & logic
tinggal di `features/<name>/` — `components/`, `hooks/`, `api/`, `types.ts`.
`components/ui` (design system), `components/layout`, dan `components/icons`
tetap **shared**.

```
apps/frontend/src/
  app/                             # Next.js App Router
    layout.tsx, page.tsx, globals.css
    auth/{login,forgot-password,reset-password,verify-email}/page.tsx
    admin/layout.tsx               # AdminShell + auth guard
    admin/page.tsx
    admin/destinasi/{page.tsx,baru/page.tsx,[id]/edit/page.tsx,[id]/rute/page.tsx}
    admin/users/page.tsx
    admin/pengaturan/page.tsx
    bantuan, karier, kontak, privasi-keamanan, tentang-kami, design-system
  lib/                             # api/ (fetch + envelope), cn.ts, pagination, query
  components/
    ui/                            # Design System "Alam"
    layout/                        # admin shell, sidebar, topbar
    icons/                         # 1 ikon = 1 file + barrel
    map/, media/, providers/
  features/
    admin/      components/        # shell pieces (sidebar, topbar, avatar)
    auth/       hooks/use-auth · api · session
    users/      api + komponen tabel pengguna
    destinations/                  # katalog publik + CRUD admin + kategori
    routes/                        # route builder (titik, ruas, jalur, profil)
    regions/    api/regions
    settings/   api pengaturan AI
    public/     halaman informasi
    landing/    komponen landing
    media/      upload gambar
```

## 4. Autentikasi (fase prototype)

- Token JWT disimpan di **localStorage** (`dolenae.admin.token`) dan user di
  `dolenae.admin.user`.
- `AuthProvider` memulihkan sesi saat mount: validasi token (klaim `exp`) lalu
  verifikasi ke `GET /api/auth/me`.
- Route `/admin` melakukan redirect ke `/auth/login` bila belum ada sesi.
- `Authorization: Bearer <token>` dikirim dari `lib/api/client.ts`.

### Validasi form

Form login memakai **React Hook Form + Zod** (`zodResolver`), bukan validasi
HTML (`noValidate` di form, tanpa atribut `required`). Pesan error ditampilkan
per-field; error dari server (mis. kredensial salah) ditampilkan terpisah.

- Skema: `apps/frontend/src/features/auth/types/login-schema.ts` (`loginSchema`).
- Dependency: `react-hook-form`, `@hookform/resolvers`, `zod`.
- Validasi sisi server tetap ada di `apps/backend` (`middleware/validate.ts`)
  memakai skema Zod yang sama polanya.

**Catatan:** proteksi ini bersifat **client-side**. Untuk produksi, guard harus
dipindah ke server (cookie httpOnly / beforeLoad SSR). Ini menyusul.

## 5. Alur API yang dipakai

| Aksi | Endpoint |
| --- | --- |
| Masuk | `POST /api/auth/login` → `{ token, user }` |
| Validasi sesi | `GET /api/auth/me` |
| Daftar pengguna | `GET /api/users?page&limit&search` |
| Kategori (daftar/CRUD) | `GET/POST /api/categories`, `PATCH/DELETE /api/categories/:id` |
| Destinasi admin | `GET /api/destinations?page&limit&search` |
| Detail destinasi | `GET /api/destinations/:id` |
| Buat/ubah/hapus destinasi | `POST /api/destinations`, `PATCH/DELETE /api/destinations/:id` |
| Fasilitas destinasi | `GET /api/destinations/:id/supports`, `GET /api/supports/:id` |
| Wilayah & reverse geocode | `GET /api/regions/provinces`, `/regencies?province=`, `/districts?regency=`, `/reverse?lat=&lng=` |
| Route builder | `GET/POST /api/destinations/:id/{track-nodes,segments,routes}`, `GET /api/routes/:id/profile` |
| Pengaturan AI | `GET/PUT /api/admin/ai/settings`, `GET /api/admin/ai/models`, `POST /api/admin/ai/test` |

Env frontend: `NEXT_PUBLIC_API_URL` (default `http://localhost:3001/api`) untuk
komponen client, `API_URL` untuk server component/SSR.

### Data destinasi (web publik)

`apps/frontend/src/features/destinations/` memakai `api` dari `lib/api/client`
ke backend Express (`/api/destinations`), **bukan** `@dolenae/seed` langsung.
Halaman detail memanggil `notFound()` bila destinasi tidak ada.

> Catatan: `/api/destinations` di backend **dilayani dari tabel DB** (Drizzle).
> `@dolenae/seed` hanya dipakai untuk mengisi awal via `db:seed`.
> `categoryIds` pada form diturunkan dari chip terrain/aktivitas (dipetakan ke
> kategori berdasarkan `slug`), sehingga destinasi baru ikut memiliki relasi
> `destination_categories`.
