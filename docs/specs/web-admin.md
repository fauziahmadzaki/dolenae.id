# Web Admin — Dolenae.id

Halaman **login** dan **dashboard admin** pada `apps/web` (TanStack Start),
memakai API dari `apps/server`.

## 1. Menjalankan

```bash
# Backend (wajib) — Postgres + API
cd apps/server && docker compose up -d && cd ../..
pnpm --filter @dolenae/server dev      # http://localhost:3001

# Web
cp apps/web/.env.example apps/web/.env # sekali saja
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
| `/login` | Form masuk admin — slicing desain Figma `Hi-Fi Web - Masuk` (`89:3328`) |
| `/admin` | Dashboard (guard) — ringkasan kartu |
| `/admin/destinations` | Destinasi — tab Kategori (CRUD) + tab Destinasi (tabel/card, CRUD). Tab aktif via `?tab=destinasi` |
| `/admin/destinations/new` | Form tambah destinasi (5 langkah) + fasilitas |
| `/admin/destinations/$id/edit` | Form edit destinasi |
| `/admin/users` | Tabel pengguna + pagination + pencarian (khusus admin) |
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
> `/login` sengaja **di luar** layout guard `/admin` agar tidak ikut proses
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
> Token tema "Alam" ada di `src/styles/app.css` (`@theme`), komponen chrome di
> `src/components/site-chrome.tsx`.

## 3. Struktur

Prinsip: **route tipis** (hanya `createFileRoute` + wiring), UI & logic tinggal di
`features/<name>/` — `pages/` (komponen halaman), `components/` (komponen fitur),
`hooks/` (state & logic), `api/` (kontrak API), `types.ts`, `index.ts` (public API).
`components/ui` (design system) & `components/icons` tetap **shared**.

```
apps/web/src/
  styles/app.css                   # token tema "Alam" (@theme Tailwind v4) + font + animasi
  lib/
    api.ts                         # fetch + envelope + ApiError
    cn.ts                          # clsx + tailwind-merge
  components/                      # SHARED lintas fitur
    site-chrome.tsx, mountain-scene.tsx
    map-view.tsx, map-view-leaflet.tsx
    icons/                         # 1 ikon = 1 file + barrel
    layout/                        # admin-shell/sidebar/topbar/nav-items
    ui/                            # Design System "Alam"
      button, input, badge, card, dialog, toast,
      select, dropdown-menu, image-uploader, searchable-select
  features/
    auth/         pages/login-page · hooks/use-auth · api/auth · session · types
    users/        pages/users-page · hooks/use-users · api/users · types
    dashboard/    pages/dashboard-page · components/* · data
    discovery/    pages/{home,catalog,destination-detail}-page · lib/map-points
    destinations/ api/{catalog,admin,categories,query} · types   (+ katalog publik & CRUD admin)
    destinations-admin/
                  pages/destinations-admin-page · components/{destination-form,
                  category-dialog,category-grid,destination-table,destinations-toolbar,
                  destinations-pagination,difficulty-pill,terrain-chips}
                  · hooks/use-destinations-admin
    regions/      api/regions                (provinsi/kabupaten/kecamatan + reverse)
    uploads/      api/uploads                (uploadImage/deleteUpload)
    design-system/pages/design-system-page
  routes/                          # TIPIS — hanya createFileRoute + wiring
    _public.tsx, _public.index.tsx, _public.destinations.tsx, _public.destinations.$slug.tsx
    login.tsx
    admin.tsx, admin.index.tsx, admin.destinations.index.tsx,
    admin.destinations.new.tsx, admin.destinations.$id.edit.tsx, admin.users.tsx
    design-system.tsx
```

## 4. Autentikasi (fase prototype)

- Token JWT disimpan di **localStorage** (`dolenae.admin.token`) dan user di
  `dolenae.admin.user`.
- `AuthProvider` memulihkan sesi saat mount: validasi token (klaim `exp`) lalu
  verifikasi ke `GET /api/users/me`.
- Route `/admin` melakukan redirect ke `/login` bila belum ada sesi.
- `Authorization: Bearer <token>` dikirim dari `lib/api.ts`.

### Validasi form

Form login memakai **React Hook Form + Zod** (`zodResolver`), bukan validasi
HTML (`noValidate` di form, tanpa atribut `required`). Pesan error ditampilkan
per-field; error dari server (mis. kredensial salah) ditampilkan terpisah.

- Skema: `apps/web/src/routes/login.tsx` (`loginSchema`).
- Dependency: `react-hook-form`, `@hookform/resolvers`, `zod`.
- Validasi sisi server tetap ada di `apps/server` (`middleware/validate.ts`)
  memakai skema Zod yang sama polanya.

**Catatan:** proteksi ini bersifat **client-side**. Untuk produksi, guard harus
dipindah ke server (cookie httpOnly / beforeLoad SSR). Ini menyusul.

## 5. Alur API yang dipakai

| Aksi | Endpoint |
| --- | --- |
| Masuk | `POST /api/auth/login` → `{ token, user }` |
| Validasi sesi | `GET /api/users/me` |
| Daftar pengguna | `GET /api/users?page&limit&search` |
| Kategori (daftar/CRUD) | `GET/POST /api/categories`, `PATCH/DELETE /api/categories/:id` |
| Destinasi admin | `GET /api/destinations?page&limit&search`, `GET /api/destinations/stats` |
| Detail destinasi | `GET /api/destinations/:id` atau `GET /api/destinations/slug/:slug` |
| Buat/ubah/hapus destinasi | `POST /api/destinations`, `PATCH/DELETE /api/destinations/:id` |
| Fasilitas (CRUD) | `GET/POST /api/supports`, `PATCH/DELETE /api/supports/:id` |
| Wilayah & reverse geocode | `GET /api/regions/provinces`, `/regencies?province=`, `/districts?regency=`, `/reverse?lat=&lng=` |

Env: `VITE_API_URL` (default `http://localhost:3001/api`).

### Data destinasi (web publik)

`apps/web/src/features/destinations/api.ts` memakai `apiFetch` ke backend Hono
(`/api/destinations`), **bukan** `@dolenae/seed` langsung. Loader route
memanggilnya, dan slug yang tidak ada melempar `notFound()` (HTTP 404).

> Catatan: `/api/destinations` di server kini **dilayani dari tabel DB**
> (Drizzle). `@dolenae/seed` hanya dipakai untuk mengisi awal via `db:seed`.
> `categoryIds` pada form diturunkan dari chip terrain/aktivitas (dipetakan ke
> kategori berdasarkan `slug`), sehingga destinasi baru ikut memiliki relasi
> `destination_categories`.
