# Design System Hi-Fi "Alam" — Dolenae.id

Dokumen ini mencatat implementasi **design system hi-fi (tema "Alam")** di Figma.
Sumber kebenaran token tetap **`DESIGN.md`** (root); dokumen ini mendeskripsikan
wujudnya di Figma, pemetaan token, dan jebakan yang sudah terbukti.

Fokus komponen saat ini: **mobile** (web menyusul).

---

## 1. Struktur page di Figma

Page **`Design System (Alam)`** (`41:1195`) berisi 6 sheet dokumentasi + 39
component set (mobile + 4 set web). Node id dapat berubah setelah edit; **nama node adalah acuan**.

Layar aplikasi hi-fi berada di page **`Hi-Fi (Mobile)`** (`53:9544`); inventarisnya
ada di `docs/specs/ui-ux-hifi-mobile.md`.

| Sheet | Node | Ukuran | Posisi |
| --- | --- | --- | --- |
| `Cover — Dolenae Design System` | `24:556` | 720×340 | 0,0 |
| `Komponen Inti` | `24:681` | 720×570 | 820,0 |
| `Tokens — Radius & Bayangan` | `24:810` | 720×483 | 1640,0 |
| `Tokens — Tipografi` | `24:624` | 720×607 | 2460,0 |
| `Tokens — Warna (Light Mode)` | `24:568` | 720×597 | 3280,0 |
| `Tokens — Spacing & Ukuran` | `53:8706` | 720×665 | 0,700 |

`Komponen Inti` adalah **dokumentasi visual** (statis). Komponen asli yang bisa
dipakai ada sebagai component set di area `x≥4100` (lihat §4).

---

## 2. Variabel (Figma variables)

**Satu koleksi resmi: `Dolenae (Alam)` (`VariableCollectionId:22:2`) — 34 variabel.**

| Kelompok | Jumlah | Nama |
| --- | --- | --- |
| Warna | 16 | `canvas`, `canvas-subtle`, `surface`, `surface-2`, `ink`, `body`, `primary`, `on-primary`, `primary-hover`, `accent`, `on-accent`, `success`, `warning`, `danger`, `hairline`, `border-strong` |
| Radius | 5 | `radius-sm` 4, `radius-md` 8, `radius-lg` 12, `radius-xl` 16, `radius-pill` 9999 |
| Spacing | 10 | `space-1` 4 … `space-16` 64 |
| Width | 3 | `container` 720, `sidebar` 264, `mobile` 390 |

Yang **bukan** variabel: tipografi (diwakili **text style**) dan elevasi
(diwakili **effect style**).

> Aturan: bind semua warna ke `var:<nama>`, jangan raw hex. Semua sheet dan
> component set sudah memenuhi ini (audit: 0 raw fill / 0 raw stroke).

Koleksi lain di file ini (jangan dicampur): `Dolenae Low-Fi System` (wireframe
grayscale) dan `shadcn/primitives` + `shadcn/semantic` (sisa tooling).

---

## 3. Text style & effect style

**9 text style** (nama = nama token di `DESIGN.md` §3):

| Style | Font | Size / Line height |
| --- | --- | --- |
| `display-xl` | Poppins ExtraBold | 40 / 48 |
| `display-lg` | Poppins ExtraBold | 32 / 40 |
| `display-md` | Poppins Bold | 24 / 32 |
| `title` | Poppins Bold | 20 / 28 |
| `body-lg` | Inter Regular | 18 / 28 |
| `body` | Inter Regular | 16 / 24 |
| `body-sm` | Inter Regular | 14 / 20 |
| `caption` | Inter Medium | 12 / 16 |
| `overline` | Inter Semi Bold | 11 / 14 |

**3 effect style** (warm tint `rgba(23,27,20,·)`, dua layer DROP_SHADOW):

| Style | Layer |
| --- | --- |
| `shadow/sm` | `0 1 2` @5% · `0 1 4` @4% |
| `shadow/md` | `0 4 12` @7% · `0 2 6` @4% |
| `shadow/lg` | `0 12 32` @12% · `0 4 12` @7% |

---

## 4. Component set

Area `x≥4100` di page yang sama. Semua fill/stroke ter-bind ke variabel dan
radius memakai `radius-*`.

| Set | Node | Varian | Axis |
| --- | --- | --- | --- |
| `Button (Alam)` | `53:8884` | 36 | Tipe (Primary, Secondary, Ghost) × Ukuran (S, M, L) × State (Default, Hover, Focus, Disabled) |
| `FacilityTag (Alam)` | `53:9243` | 4 | Tipe (Terrain, Aktivitas, Musim, Kesulitan) |
| `DifficultyBadge (Alam)` | `53:9244` | 3 | Level (Ramah pemula, Menengah, Sulit) |
| `SearchBar (Alam)` | `53:9245` | 3 | State (Default, Focused, Filled) |
| `BottomNav (Alam)` | `53:9845` | 5 | Active (Beranda, Jelajah, AI, Rencana, Profil) |
| `PreparationChecklistItem (Alam)` | `53:9247` | 3 | State (Pending, Done, Warning) |
| `TripPlanStep (Alam)` | `53:9313` | 6 | Posisi (Pertama, Tengah, Terakhir) × State (Default, Selesai) |
| `AIRecommendCard (Alam)` | `53:9249` | 2 | Varian (Ringkas, Lengkap) |
| `DestinationCard (Alam)` | `53:9543` | 2 | Layout (Vertical, Horizontal) — media kini berisi foto (lihat `ui-ux-hifi-mobile.md` §4) |
| `SupportCard (Alam)` | `64:58` | 3 | Tipe (Penginapan, Transport, Makanan) |
| `MenuRow (Alam)` | `64:81` | 2 | Posisi (Tengah, Terakhir) |
| `AppBar (Alam)` | `65:212` | 3 | Tipe (Kembali, KembaliAksi, Halaman) |
| `Chip (Alam)` | `65:213` | 2 | State (Default, Aktif) |
| `SectionHeader (Alam)` | `65:214` | 2 | Aksi (Tidak, Ya) |
| `PromptInput (Alam)` | `67:602` | 3 | State (Kosong, Terisi, Fokus) |
| `RecommendationCard (Alam)` | `67:633` | 2 | Varian (Ringkas, Lengkap) |
| `Input (Alam)` | `68:643` | 4 | State (Default, Fokus, Terisi, Error) |
| `Switch (Alam)` | `68:650` | 2 | State (Aktif, Nonaktif) |
| `PlanCard (Alam)` | `68:1181` | 2 | Varian (DenganSupport, TanpaSupport) — ada baris meta destinasi |
| `BriefingCard (Alam)` | `68:1144` | 2 | Varian (Ringkas, Lengkap) |
| `Segmented (Alam)` | `69:1794` | 4 | Aktif (Semua, Penginapan, Transport, Makanan) |
| `SupportRow (Alam)` | `69:1850` | 3 | Tipe (Penginapan, Transport, Makanan) |
| `ProgressHeader (Alam)` | `68:908` | 2 | Ukuran (Halaman, Kartu) |
| `AuthTabs (Alam)` | `80:71` | 2 | Aktif (Masuk, Daftar) |
| `PasswordField (Alam)` | `80:72` | 4 | State (Default, Fokus, Terisi, Error) |
| `OtpInput (Alam)` | `80:73` | 3 | State (Kosong, Terisi, Error) |
| `FaqAccordion (Alam)` | `80:255` | 2 | State (Tertutup, Terbuka) |
| `Dialog (Alam)` | `80:256` | 2 | Tipe (Konfirmasi, Destruktif) |
| `SelectableRow (Alam)` | `83:1174` | 2 | State (Kosong, Terpilih) |
| `DateField (Alam)` | `83:1175` | 2 | State (Default, Terisi) |
| `Stepper (Alam)` | `83:1176` | 2 | State (Default, Disabled) |
| `Toast (Alam)` | `86:1512` | 3 | Tipe (Sukses, Info, Gagal) |
| `EmptyState (Alam)` | `86:1683` | 5 | Tipe (Tanpa hasil, Belum ada data, Gagal, Offline, Akses ditolak) |
| `NotificationItem (Alam)` | `86:1684` | 2 | State (Belum dibaca, Dibaca) |
| `BottomSheet (Alam)` | `86:2185` | 2 | Tipe (Menu, Filter) |
| `WebHeader (Alam)` | `87:2689` | 2 | State (Default, Scrolled) |
| `WebFooter (Alam)` | `87:2690` | 2 | Layout (Lengkap, Ringkas) |
| `AICard (Alam)` | `87:2691` | 2 | Layout (Split, Stack) |
| `TestimonialCard (Alam)` | `87:2692` | 2 | Varian (DenganFoto, TanpaFoto) |

Konvensi warna komponen:

- Tombol utama `primary` + teks `on-primary`; hover `primary-hover`.
- Sekunder: `surface` + stroke `border-strong` + teks `primary`.
- Ghost: tanpa fill, teks `primary` (hover `canvas-subtle`).
- Focus: stroke `border-strong` 2px. Disabled: `canvas-subtle` + teks `body` + opacity 40%.
- Kesulitan: ramah-pemula → `success`, menengah → `warning`, sulit → `danger`.
- `BottomNav`: item 390/5 px, isi `indikator 24×3 → ikon 20 → label 11`, gap 2.
  Indikator hanya `primary` pada tab aktif; tab lain memakai spacer warna
  `canvas` (sama dengan bg nav) agar ikon dan label tetap sejajar, bukan bar
  abu-abu yang terlihat.
- **Surface tonal.** Di layar mobile, kartu/field memakai `canvas-subtle`
  (bukan `surface` putih) dengan stroke `hairline`; `surface` disimpan untuk
  overlay/modal yang butuh kontras maksimum. `DestinationCard` = kartu
  `canvas-subtle` + area media `hairline`; `BottomNav` = `canvas` + hairline atas;
  `SearchBar` = `canvas-subtle`.
- Aksen `accent` **hanya** dipakai untuk penanda AI (`AIRecommendCard`, badge hasil AI).
- `DestinationCard`: media placeholder (X diagonal) → badge kesulitan di **dalam**
  body kartu (bukan overlay di atas gambar), tagline, lalu satu baris meta
  `elevasi · kabupaten` + harga + chevron. Shadow `shadow/sm`.
- Teks: pakai **text style** untuk body/heading (`display-md`, `title`, `body`,
  `body-sm`, `caption`, `overline`). Label emphasis yang tidak punya padanan
  style (chip aktif, CTA, harga, label nav aktif, inisial avatar) memakai
  **Inter Semi Bold eksplisit**; jangan `setTextStyleIdAsync` lalu menimpa
  `fontName`, karena penimpaan itu **melepas** link text style.

Belum dibuat (masih dokumentasi statis): `Header/Nav (web)`. `SupportListItem`
sudah terwujud sebagai `SupportCard (Alam)`.

---

## 5. Pemetaan token `DESIGN.md` → Figma

| `DESIGN.md` | Figma |
| --- | --- |
| §2 Semantic color | variabel COLOR di koleksi `Dolenae (Alam)` |
| §3 Tipografi (scale) | text style dengan nama token yang sama |
| §4 Spacing & Radius | variabel FLOAT `space-*` dan `radius-*` |
| §5 Elevation | effect style `shadow/sm|md|lg` |
| §4 Width | variabel FLOAT `container` / `sidebar` / `mobile` |
| §6 Komponen Inti | component set §4 (subset mobile) |

---

## 6. Jebakan yang sudah terbukti (`figma-cli`)

1. **Koleksi duplikat.** `figma-cli import DESIGN.md` membuat koleksi baru
   bernama sistem — pernah menghasilkan `Dolenae Design System (Alam)` (0
   pemakaian) di samping `Dolenae (Alam)`. Selalu cek `figma-cli col list`
   setelah import dan hapus/merge yang duplikat. Nama koleksi resmi:
   **`Dolenae (Alam)`**.
2. **`figma-cli use <koleksi> --all` hanya berlaku untuk page aktif.** Pindah
   page dulu (`figma.currentPage = ...` lewat `eval`), lalu jalankan `use --all`;
   pakai `--dry-run` untuk memastikan jumlah binding sebelum eksekusi.
3. **`node.remove()` tidak bisa di-undo lewat API** dan node yang sudah dihapus
   **tidak bisa di-`insertChild` ulang** (error “node does not exist”). Untuk
   mengurutkan ulang, pakai `insertChild` pada node yang masih terpasang.
4. **`render` memecah wrapper flex jadi node terpisah** (auto-split). Saat
   membuat varian komponen, selalu pakai `--keep-wrapper`, kalau tidak satu
   varian bisa lahir sebagai beberapa frame lepas.
5. **Frame top-level tidak boleh `w="fill"`** (gagal `ReferenceError: frame is
   not defined`). Pakai lebar tetap, atau rakit bertahap dengan `--parent` lalu
   set `layoutSizingHorizontal` via `eval`.
6. **Nama font Inter memakai spasi**: `Semi Bold`, bukan `SemiBold`
   (Poppins justru `SemiBold`). Salah nama → “font could not be loaded”.
7. **`&` di atribut `name` render tidak didekode** (`&amp;`). Betulkan lewat
   `eval` setelah render.
8. **`render` membuat `Text` default `FILL` + rata kiri.** Di dalam container
   `items="center"`, teks jadi tampak tidak center (mis. label BottomNav) —
   set `textAlignHorizontal = 'CENTER'` setelah render.
9. **Menimpa `fontName` melepas text style.** Setelah `setTextStyleIdAsync`,
   jangan set `fontName` pada node yang sama (link style hilang tanpa error).
   Untuk weight emphasis, pilih salah satu: pakai style yang memang Semi Bold
   (mis. `overline`) atau biarkan tanpa style + `fontName` eksplisit.
10. **Auto-split `render` memecah frame flex beranak banyak** menjadi node
    terpisah (chip row 4 item, nav 5 item). Selalu `--keep-wrapper` saat
    merender bagian layar/komponen.
11. **Nama variabel bentrok antar-koleksi = warna salah tanpa error.**
    `shadcn/semantic` dan `Dolenae (Alam)` sama-sama punya `primary` dan
    `accent`; `var:primary` di `render` resolve ke koleksi **shadcn** (header
    jadi near-black, `accent` jadi zinc-100 sehingga CTA AI tak terlihat).
    Urutan perbaikan yang benar:
    1. rename variabel duplikat di koleksi lain dengan prefix (`shadcn-primary`)
       **setelah** langkah 2, karena `use` mencocokkan berdasarkan nama;
    2. rebind: `figma-cli use "Dolenae (Alam)" --all` per page (DS page: 66
       binding, page layar: 16 binding);
    3. baru rename duplikatnya agar render berikutnya tidak ambigu.
    Cek cepat: `figma-cli col list` + audit `boundVariables.color` per node.

---

## 7. Verifikasi

Audit terakhir (seluruh page `Design System (Alam)` — sheet + component set):

- fill ter-bind **259** / raw **0** · stroke ter-bind **208** / raw **0**.
- 0 node collapse; semua teks di container center sudah `textAlignHorizontal`
  `CENTER`.
- Sheet `Tokens — Warna` kembali 720×597 dengan baris 322px setelah diurutkan
  ulang; 16 baris + 32 teks-nya ter-bind ke variabel.
- Koleksi: 1 × `Dolenae (Alam)` (34 var), 165 binding dari sheet lama berhasil
  dipindahkan, 2 koleksi mati dihapus.
- 39 component set dengan total 139 varian; semua fill/stroke ter-bind.
- 3 set auth (`AuthTabs`, `PasswordField`, `OtpInput`): 44 fill ter-bind /
  0 raw, 29 stroke ter-bind / 0 raw, 0 node collapse. Dipakai layar
  Auth & Onboarding (`ui-ux-hifi-mobile.md` §7).
- 2 set lanjutan (`FaqAccordion`, `Dialog`): 4 varian; dipakai layar
  Profil & Pengaturan (`ui-ux-hifi-mobile.md` §8). `Dialog` Konfirmasi memakai
  aksi `primary`, Destruktif memakai `danger` + teks `surface`.
- 3 set rencana (`SelectableRow`, `DateField`, `Stepper`): 6 varian; dipakai
  layar Rencana CRUD (`ui-ux-hifi-mobile.md` §9). `SelectableRow` terpilih
  memakai stroke `primary` 2px + kotak centang `primary`.
- 1 set notifikasi (`Toast`): 3 varian (Sukses `success`, Info `ink`, Gagal
  `danger`; teks `surface`/`canvas`). Dipakai layar Checklist & Usulan
  (`ui-ux-hifi-mobile.md` §10).
- 2 set pencarian (`EmptyState`, `NotificationItem`): 5 varian; dipakai layar
  Pencarian/Filter/Notifikasi (`ui-ux-hifi-mobile.md` §11). `EmptyState`
  Gagal memakai ikon `danger` + tombol "Coba lagi"; `NotificationItem`
  Belum dibaca punya titik `primary` + latar `canvas-subtle`.
- 1 set sheet (`BottomSheet`): 2 varian (Menu, Filter) — shell `surface`
  rounded 24 + handle; Filter dipakai layar Filter Dialog
  (`ui-ux-hifi-mobile.md` §11).
- 4 set web (`WebHeader`, `WebFooter`, `AICard`, `TestimonialCard`): 8 varian;
  dipakai layar web publik (`ui-ux-hifi-web.md`). Header `surface` + hairline
  bawah (Scrolled + `shadow`), footer band `primary`. Kontainer web: lebar
  1440 dengan padding kiri/kanan 120.
- Varian status (batch 11): `Input`/`PasswordField` + `State=Error` (stroke
  `danger` 2px + ikon `alert-circle`), `EmptyState` + `Tipe=Offline` &
  `Akses ditolak`. Dipakai layar Error Form & Empty State
  (`ui-ux-hifi-mobile.md` §15).

Audit page `Hi-Fi (Mobile)` (57 layar — seluruh layar lo-fi mobile sudah hi-fi):

- Page: SOLID fill ter-bind **1329** / raw 0 (294 dari 11 layar awal + 1035 dari
  46 layar lanjutan); **IMAGE fill 10**; stroke 46 layar lanjutan ter-bind
  **612** / raw 0; **0 node collapse** (vektor degenerat di dalam ikon Lucide
  tidak dihitung); 0 em-dash; 0 baris multi middle-dot.
- **598 teks** memakai text style; **329 label emphasis** memakai Inter Semi
  Bold/Medium eksplisit.
- 11 layar awal (Beranda … Detail Makanan) + 46 layar lanjutan (Auth 5,
  Profil/Pengaturan 10, Rencana 8, Checklist/Usulan 4, Pencarian/Filter/
  Notifikasi 5, Tersimpan/empty state 8, Error & Empty State 3, Gagal Memuat
  3) memakai koleksi `Dolenae (Alam)` + component set yang sama.
  Inventaris: `ui-ux-hifi-mobile.md` §1.

Perintah yang dipakai:

```bash
figma-cli verify "<id>" --measure        # cek dimensi + jumlah varian
figma-cli col list                       # pastikan tidak ada koleksi duplikat
figma-cli eval "..."                     # audit bound/raw fill, collapse, alignment
```
