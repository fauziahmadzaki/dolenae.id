---
name: figma-cli
description: Gunakan saat bekerja dengan Figma lewat figma-cli — membuat design system, token/variables, komponen & variant, merender frame UI, wireframe low-fi, atau memverifikasi hasil di Figma Desktop. Mencakup koneksi, import token, render/render-batch, component set + variant, verifikasi, dan jebakan yang sudah terbukti di lapangan.
---

# Skill: figma-cli (Dolenae)

Skill ini merangkum cara kerja figma-cli di project ini: apa yang sudah berhasil,
pola yang aman, dan jebakan yang mahal kalau dilewatkan. Semua contoh sudah
divalidasi di Figma Desktop.

> Dokumen pendukung:
> - Operator rules lengkap: `.cursor/rules/figma-cli.mdc`
> - Panduan integrasi AI tool: `docs/guides/figma-cli-ai-tools.md`
> - Sumber token/desain: `DESIGN.md` (root)
> - Aturan project: `AGENTS.md`

---

## 0. Kapan skill ini dipakai

- Membuat / memperbarui **design system** di Figma (frame token, komponen, varian).
- Merender layar UI (berwarna "Alam" **atau** low-fi grayscale).
- Membuat **component set dengan variant** (tombol, input, dsb.).
- Memverifikasi hasil render (ukur + screenshot + analisis pixel).

Untuk kerja yang memuat estetika/desain, baca juga
`docs/skills/design-taste-frontend/SKILL.md`.

---

## 1. Aturan emas (jangan dilanggar)

1. **Jangan hapus node milik user.** Hanya hapus node yang kamu buat sendiri.
2. **"N kartu/tombol" = N node top-level terpisah**, bukan satu wrapper berisi N
   child. Pakai `render-batch` untuk banyak node.
3. **Bind warna ke token** (`var:nama-token`) saat sistem desain aktif — **jangan
   raw hex**. Contoh: `<Frame bg="var:lofi-surface"><Text color="var:lofi-text-primary">`.
4. **Ikon pakai SVG Lucide**: `<Icon name="lucide:image" />`, bukan emoji.
5. **Selalu verifikasi** setelah membuat: `figma-cli verify "<id>" --measure`.
6. Jangan pernah panggil `figma.closePlugin()` di dalam `eval` (lihat §7).

---

## 2. Koneksi & lingkungan

```bash
figma-cli status            # cek koneksi + nama file + daemon
figma-cli connect           # mode Yolo/CDP (cepat, butuh Figma Desktop)
figma-cli connect --safe    # mode plugin (stabil untuk eval baca/tulis)
```

- figma-cli mengendalikan **Figma Desktop langsung** (tanpa API key). Buka Figma
  Desktop dulu, lalu `figma-cli connect` sekali per sesi.
- Kalau daemon gagal start, perintah tetap jalan tapi lambat; ulangi
  `figma-cli status` / `figma-cli connect`.
- **Windows:** folder temp untuk `verify` default `D:\tmp` / `C:\tmp`; buat dulu:
  `mkdir D:\tmp`. Untuk file JSX/JSON kerja, pakai
  `C:\Users\<user>\AppData\Local\Temp\opencode\`.
- **Figma belum jalan?** Nyalakan dulu:
  `"C:/Users/<user>/AppData/Local/Figma/Figma.exe" >/dev/null 2>&1 &`
  (atau `cmd //c start "" "...\Figma.exe"`), tunggu ±20 detik, lalu
  `figma-cli daemon start` → `figma-cli status` → `connect`.
  Tanpa Figma, daemon mati dan semua perintah `render`/`eval` error "fetch failed".
- **`connect` (CDP) vs `connect --safe` (plugin).** Di mode CDP, `eval` **JS murni**
  tetap jalan (`1+1` → `2`) tetapi akses `figma.*` error
  `Cannot read properties of undefined (reading 'root')`. Kalau perlu baca/tulis
  node, pakai `figma-cli connect --safe`.
- **`documentAccess: dynamic-page`.** Sebagian file memaksa akses node **async**:
  `await figma.getNodeByIdAsync(id)`, `await page.loadAsync()`,
  `await figma.loadAllPagesAsync()`. Versi sync (`getNodeById`, `page.children`
  pada page yang belum di-load) melempar
  `Cannot call with documentAccess: dynamic-page`. Jalankan skrip via
  `figma-cli run <file.js>` (bukan `eval` satu baris) supaya bisa `await`.
- **Ganti page juga async:** `figma.currentPage = p` gagal dengan
  `Use figma.setCurrentPageAsync instead`. Pakai
  `await figma.setCurrentPageAsync(p)`. Kalau lupa, `variants from` akan membuat
  set di page yang salah hanya karena `currentPage` belum berpindah.

---

## 3. Workflow token

```bash
figma-cli import DESIGN.md                     # DESIGN.md -> variables (koleksi "Dolenae (Alam)")
figma-cli var list                             # daftar semua variable
figma-cli var list | grep -i lofi              # filter
figma-cli export css                           # dump semua token (workaround eval yang tak bisa baca nilai var)
figma-cli variables visualize "Dolenae (Alam)" # swatch ke canvas
figma-cli use "Dolenae Low-Fi System"          # ganti tema (rebind var)
```

- **Jebakan pin koleksi:** `-c/--collection "X"` mem-pin resolusi `var:` ke
  koleksi itu. Variable dari koleksi **lain** jadi gagal (render abu-abu +
  warning). Workaround: render **tanpa** pin, atau override per-attr
  `var:<NamaKoleksi>:<nama>`. Contoh: `stroke="var:red/500"` (nama ber-`/`
  ditulis apa adanya) gagal saat dipin ke koleksi low-fi → render tanpa pin.
- `variables.getLocalVariableCollectionsAsync` via `eval` bisa balikin
  `missing: true`; andalkan `export css` untuk membaca nilai.
- **Nama variabel bentrok antar-koleksi = warna salah tanpa error.** Kalau dua
  koleksi sama-sama punya `primary`/`accent` (mis. `shadcn/semantic` vs
  `Dolenae (Alam)`), `var:primary` di `render` bisa resolve ke koleksi yang
  salah (gejala: header jadi near-black, aksen jadi zinc-100 sehingga CTA
  "hilang" di atas putih). Urutan perbaikan yang benar:
  1. pindahkan binding dulu: `figma-cli use "Dolenae (Alam)" --all` (per page,
     karena `--all` hanya berlaku untuk page aktif; cek dulu `--dry-run`);
  2. **baru** rename variabel duplikat di koleksi lain dengan prefix
     (`primary` → `shadcn-primary`), karena `use` mencocokkan **berdasarkan nama**;
     kalau rename duluan, rebind akan lapor `not found` dan binding tetap salah.
  Verifikasi cepat: render probe `bg="var:primary"` lalu baca
  `fills[0].boundVariables.color.id` — pastikan id itu milik koleksi target.

---

## 4. Cheat-sheet JSX `render`

```bash
figma-cli render '<Frame>...</Frame>'                    # satu frame
figma-cli render-batch '[...]' -g 40 -d row --as-component  # banyak frame -> component
figma-cli rename-batch '{"id":"Nama"}'                   # rename massal (JSON map)
figma-cli find "<nama>"                                   # cari node
figma-cli delete "<id>"                                   # HATI: satu id per perintah
```

Sintaks atribut:

```
Layout : flex="row|col" gap={16} p={24} px py pt pr pb pl justify items
Size   : w={320} h={200} w="fill" w="hug" w="60%"
Look   : bg="#fff" stroke="#000" strokeWidth={2} rounded={12} shadow opacity clip
Text   : <Text size={14} weight="semibold" color="var:ink" lineHeight={20} truncate maxLines={2}>
Ikon   : <Icon name="lucide:home" size={20} color="var:primary" />
Node   : <Rect .../>, <Ellipse .../>, <Image .../>
```

**Yang sering bikin bug:**

- **Windows PowerShell menghapus tanda kutip ganda.** Saat `render` dipanggil
  dari PowerShell, argumen JSX sampai ke `node` dengan `"` hilang, sehingga
  atribut string (`name="X"`, `flex="row"`, `bg="var:..."`) **diabaikan
  diam-diam** sementara nilai `{...}` tetap jalan — gejala: frame jadi bernama
  `Frame` dan semua kolom menumpuk **vertikal**. Solusi: tulis **semua nilai
  string dengan `{...}`** (`flex={row}`, `bg={var:surface}`, `name={Header}`,
  `w={fill}`), bukan `="..."`.
- **Font pakai `font="Inter"`** — BUKAN `fontFamily`. `fontFamily` diabaikan
  diam-diam.
- **Shadow harus format** `0 y blur #RRGGBBAA` — `rgba(...)` bikin parser JSX
  **men-drop elemen**. Contoh: `shadow="0 4 12 #0000001A"`.
- **Text wrapping:** parent **dan** tiap `<Text>` harus `w="fill"`, parent
  `flex="col"` atau `flex="row"`. Tanpa itu teks tak membungkus.
- **`w="fill"` pada semua anak flex** untuk mencegah anak collapse (bug layout
  paling sering muncul dua kali).
- **Label di dalam kontrol (tombol / segmented / kotak OTP / badge angka) wajib
  `align="center"`.** Teks anak frame auto-layout di-render `FILL` + `LEFT`;
  walau node-nya di tengah, glyph-nya menempel kiri. Tambahkan `align="center"`
  pada `<Text>`. Cek: `figma-cli eval` → cari TEXT `layoutSizingHorizontal=FILL`
  & `textAlignHorizontal=LEFT` di dalam frame berisi tinggi ≤56.
  (Teks input form tetap `LEFT` — itu benar.)
- **Tag JSX harus balance.** Frame terbuka tanpa penutup yang pas bisa membuat
  **section di belakangnya hilang diam-diam** (pernah kejadian: section elevation
  drop). Setelah render, cek `verify --measure` apakah semua section ada.
- **Frame top-level tidak boleh `w="fill"`.** Render gagal dengan
  `ReferenceError: frame is not defined` (tanpa petunjuk jelas). Anak di dalam
  frame tetap boleh `w="fill"`; untuk top-level pakai lebar tetap
  (`w={390}`), atau rakit bertahap dengan `--parent` lalu set
  `layoutSizingHorizontal` via `eval`.
- **Batas ukuran JSX (±6 KB).** Argumen `render` yang terlalu besar bisa
  terpotong dan gagal dengan error yang sama (`frame is not defined`) walau
  sebagian node sudah terlanjur dibuat. Untuk layar besar: render **shell** dulu,
  set `layoutMode`/`itemSpacing`/padding via `eval`, lalu render tiap bagian
  dengan `--parent <id>` (potongan < 6 KB).
- **Auto-split wrapper flex.** `render` memecah frame flex yang punya banyak anak
  menjadi node terpisah (chip row 4 item, nav 5 item, baris tabel). Hasilnya node
  nyasar + duplikat. Selalu `--keep-wrapper` saat merender bagian layar/komponen.

Generator JSX via Python — **hati-hati kurung kurawal f-string**:

```python
# ingin output: w={320}
f'w={{{320}}}'      # -> w={320}   (literal, OK)
f'w={{320}}'        # -> w={320}   (literal, OK)
f'w={var}'          # -> w=320     (one brace lost! SALAH untuk JSX)
f'w={{{var}}}'      # -> w={320}   (benar, nilai interaktif)
```

---

## 5. Component set + variant

**Alur standar:**

```bash
# 1. render tiap varian sebagai TOP-LEVEL frame terpisah, langsung jadi component
figma-cli render-batch "$(cat varian.json)" --as-component

# 2. beri nama node dengan pola "Prop1=Val, Prop2=Val2" saat render:
#    <Frame name="Ukuran=M, State=Default" ...>

# 3. gabung multi-axis (baca properti dari nama node)
figma-cli variants from "<id1,id2,id3>" --multi -n "Input (Low-Fi)"
# 3b. single-axis
figma-cli variants from "<id1,id2,id3>" -p Variant -v A,B,C -n "Button"
```

- **Nama node menentukan axis:** gunakan `Prop=Value` agar `--multi` bisa
  menurunkan **semua** properti otomatis.
- **`--as-component` menggeser id.** Id yang dicetak `render` belum tentu id
  komponen final (pernah meleset beberapa nomor). Jangan menyimpan id dari
  stdout untuk `variants from`; **kumpulkan id lewat nama** dengan `eval`:
  ```js
  p.children.filter(n => n.type === 'COMPONENT' && /^Tipe=/.test(n.name)).map(n => n.id).join(',')
  ```
- **Selalu `--keep-wrapper`** saat render varian (kalau tidak, satu varian bisa
  terpecah jadi beberapa node dan `variants from` gagal "Need at least 2 nodes").
- **`figma-cli variants from` membuat set di `currentPage`**, bukan di page node
  variannya. Set `figma.currentPage` ke page target lewat `eval` sebelum memanggil
  (kalau tidak, set muncul di page yang sedang aktif di UI).
- **Auto-split sisa.** Setelah `variants from`, cek page target dan hapus node
  nyasar (FRAME hasil split, `Nested Frame` 24×3, dll). Pernah ada 16 node sisa
  yang ikut terhitung sebagai "anak page".
- **Varian yang terlepas bukan "orphan biasa".** Sebuah varian bisa muncul sebagai
  `COMPONENT` top-level bernama `"<NamaSet>/<Varian>"` (mis.
  `AIRecommendCard (Alam)/Lengkap`). Ia **terlihat** seperti node nyasar, tetapi
  menghapusnya = menghapus varian itu dari layanan (pernah kejadian: set
  `AIRecommendCard (Alam)` tinggal 1 varian). Sebelum menghapus, bandingkan
  `set.children.length` dengan jumlah `variantOptions`. Pemulihan: render ulang
  JSX varian (`name="Prop=Value"`) → `--as-component` → lalu
  `set.appendChild(component)`; axis-nya otomatis terdaftar kembali.
- Menghapus **`COMPONENT_SET`** otomatis menghapus komponen varian di dalamnya
  (delete satu id `COMPONENT_SET` saja).
- **Verifikasi persistensi setelah `variants from`.** Pernah kejadian: CLI
  melaporkan "Created Variant Set" + pengecekan langsung menunjukkan 23 set,
  tetapi beberapa perintah kemudian set-nya **hilang** (kemungkinan dokumen
  Figma reload/sync dan perubahan belum tersimpan). Setelah membuat set, lakukan
  pembacaan **terpisah** (`find`/`eval` daftar `COMPONENT_SET`) sebelum
  melanjutkan; kalau hilang, render ulang varian dan bikin set lagi.
- Setelah set jadi, komponen anak tetap bisa dibaca via `eval`.
- Pola nama yang sudah dipakai di project: `Button (Low-Fi)` (Tipe × Ukuran),
  `Input (Low-Fi)` (Ukuran × State), `Image Placeholder (Low-Fi)` (Aspek).

Referensi alur: `docs/guides/figma-cli-ai-tools.md` §6.

---

## 6. Verifikasi

```bash
figma-cli verify "<id>" --measure   # JSON + screenshot PNG (path di field "saved")
```

- `measure` mengembalikan dimensi tiap node — pakai untuk mendeteksi **section
  yang hilang** atau anak yang collapse.
- **`measure` TIDAK menampilkan rotasi.** Untuk cek rotasi/nilai properti lain,
  pakai `eval`.
- **Kalau model tidak bisa melihat gambar**, verifikasi visual lewat analisis
  pixel PNG pakai PIL (tersedia). Contoh: memastikan X diagonal benar.

Script cek pola X sungguhan (4 kuadran harus terisi):

```python
from PIL import Image
img = Image.open("/tmp/figma-verify-XXXX.png").convert("L")
px = img.load(); W,H = img.size; s = W/1320.0   # sesuaikan skala export
n = 40
def cell(x0,y0,w,h):
    for gy in range(n):
        print("".join("#" if px[int(x0+(gx+.5)/n*w), int(y0+(gy+.5)/n*h)] < 205 else " " for gx in range(n)))
cell(0,0,320*s,320*s)   # varian pertama
```

Dari ASCII: X = dua diagonal menyilang di tengah; arrow/V = cuma separuh.

---

## 7. Jebakan `eval` (dan cara aman)

`figma-cli eval` menjalankan JS di konteks Figma. Untuk **mutasi** node (set
rotasi, rebind, hapus) ini senjata ampuh, tapi:

- **JANGAN panggil `figma.closePlugin()`.** Ini mematikan plugin bridge dan
  semua `eval` berikutnya error
  `Attempted access to object created in plugin, but the plugin has already been closed`.
  Pulihkan dengan `figma-cli connect` ulang (dan mungkin buka ulang file).
- Ekspresi terakhir dikembalikan. **JS murni** (`1+1`, `'hi'`) selalu jalan.
  Akses `figma.*` bisa error kalau bridge sedang mati / mode CDP tanpa plugin.
- Ekspresi yang mengembalikan **objek Figma** bisa error saat serialisasi —
  kembalikan **string/angka** yang sudah di-`map`/`join`, bukan node.
- Sebagian `eval` mutasi **tidak mengeluarkan output** tapi **tetap tersimpan**.
  Verifikasi lewat `eval` baca terpisah atau `verify`/`find`.
- Kalau ragu, jangan `closePlugin`; biarkan figma-cli yang menutup sesi.
- **`node.remove()` itu final.** Node yang sudah dihapus **tidak bisa**
  di-`insertChild`/`appendChild` lagi (error `node does not exist`). Untuk
  mengurutkan ulang, pindahkan node yang **masih terpasang** dengan
  `parent.insertChild(index, node)` (memindahkan, bukan menyalin) — jangan
  remove-then-insert. (Pernah kejadian: 16 baris sheet warna hilang dan harus
  dibangun ulang.)
- **Menimpa `fontName` melepas text style.** Setelah
  `await t.setTextStyleIdAsync(id)`, jangan set `t.fontName = {...}` pada node
  yang sama — link style hilang tanpa error (gejala: `textStyleId === ''`).
  Pilih salah satu: pakai style yang memang weight-nya cocok, atau biarkan node
  tanpa style lalu set `fontName` eksplisit untuk label emphasis.

**Merotasi elemen di dalam frame** (karena `rotate` JSX tidak bisa di child):

```js
// set rotasi untuk semua komponen "Aspek=..."
figma.currentPage.children
  .filter(n => n.type === 'COMPONENT' && n.name.startsWith('Aspek='))
  .forEach(n => {
    const L = n.width, H = n.height;
    const th = Math.atan2(H, L) * 180 / Math.PI;
    const r = n.children.filter(c => c.type === 'RECTANGLE');
    r[0].rotation = th; r[1].rotation = -th;
  });
```

---

## 8. Pelajaran penting: rotasi & pivot

- Prop `rotate` di JSX **tidak andal untuk child**: nested `<Frame>` tidak
  diputar (rotate hanya diproses untuk Frame top-level), dan `<Rect>` menolak
  prop `rotate` (`Unknown prop "rotate" on <Rect> (ignored)`).
- **Pivot `node.rotation` = pojok KIRI-ATAS node**, bukan center. Positive =
  searah jarum jam. Jadi kalau kamu menghitung posisi untuk bar yang "di-center"
  lalu memutar, hasilnya bergeser (muncul bentuk "arrow", bukan X).

Kompensasi supaya pusat visual tepat di tengah frame:

```python
import math
# L = panjang diagonal, t = tebal bar, (w,h) = frame, deg = sudut
rad = math.radians(deg)
X = math.cos(rad)*(L/2) + math.sin(rad)*(t/2)
Y = -math.sin(rad)*(L/2) + math.cos(rad)*(t/2)
P = (w/2 - X, h/2 - Y)   # set sebagai x/y Rect SEBELUM rotation
```

Formula ini sudah tervalidasi: X diagonal corner-to-corner di 4 rasio
(1:1 ±45°, 4:3 ±36.87°, 16:9 ±29.36°, 3:4 ±53.13°).

---

## 9. Resep low-fi (grayscale)

Koleksi token: **`Dolenae Low-Fi System`** (19 var) —
`lofi-canvas #fafafa`, `lofi-surface #ffffff`, `lofi-border #e5e7eb`,
`lofi-border-strong #9ca3af`, `lofi-text-primary #111827`,
`lofi-text-secondary #6b7280`, `lofi-placeholder #d1d5db`,
`lofi-action-primary #1f2937`, `lofi-action-secondary #f3f4f6`,
plus radius sm/md/lg/pill dan space-1/2/3/4/6/8.

**Tombol (Primary/Secondary/Ghost × S/M/L):**

```
Primary   : bg="var:lofi-action-primary", teks var:lofi-surface
Secondary : bg="var:lofi-surface" stroke="var:lofi-border-strong" strokeWidth={1}, teks var:lofi-text-primary
Ghost     : tanpa bg, teks var:lofi-text-primary
S: px16 py8 size12 · M: px20 py10 size14 · L: px28 py12 size16 · rounded={9999}
```

**Image placeholder X diagonal:** frame `bg="var:lofi-border" rounded={12}
clip="true"` + 2 `<Rect>` (`bg="var:lofi-border-strong"`, tebal 4) diposisikan
via formula §8, lalu `rotation` diset via `eval` (§7).

---

## 10. Gambar eksternal ke Figma

Tujuan: memasang foto dari URL ke **frame placeholder yang sudah ada**
(mempertahankan auto-layout), bukan menambah node baru.

### 10.1 `figma-cli create image` sering tak bisa dipakai

```bash
figma-cli create image "<url>" -w -h -x -y -n "Nama"
```

- Ada, tetapi pada file `documentAccess: dynamic-page` pernah **lapor
  "✔ Image created from URL" tanpa membuat node apa pun**. Jangan percaya
  stdout-nya — cek dengan `eval`/`run` apakah node-nya benar-benar ada.

### 10.2 Alur yang terbukti jalan: unduh → serve lokal → `fetch` → `createImage`

```bash
# 1) unduh di sisi OS (bebas CORS, UA normal)
curl -sL "<url-gambar>" -o img/foto.jpg -w "%{http_code} %{size_download}\n"
```

```python
# 2) server lokal + header CORS (wajib, kalau tidak fetch plugin diblokir)
import http.server, socketserver, functools, os
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        http.server.SimpleHTTPRequestHandler.end_headers(self)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', 8765),
        functools.partial(H, directory=os.path.join(os.getcwd(), 'img'))) as s:
    s.serve_forever()
```

```js
// 3) eval/run: fetch -> createImage -> pasang sebagai IMAGE fill
const r = await fetch('http://127.0.0.1:8765/foto.jpg');
const img = await figma.createImage(new Uint8Array(await r.arrayBuffer()));
const ph = await figma.getNodeByIdAsync('56:10054');
ph.fills = [{ type: 'IMAGE', imageHash: img.hash, scaleMode: 'FILL' }];
ph.children.filter(c => c.name.startsWith('diag')).forEach(c => c.remove());
```

- Setelah selesai: matikan server (`Stop-Process` via PowerShell bila perlu) dan
  hapus file temp.
- `scaleMode: 'FILL'` memotong secara center. Untuk menggeser crop, set
  `imageTransform` (matriks `[[1,0,tx],[0,1,ty]]`).
- Frame placeholder: `clipsContent = true` + radius tetap dari parent/card.

### 10.3 Realita CORS di `fetch` plugin

| Sumber | `fetch` plugin |
| --- | --- |
| `picsum.photos` | OK (mengirim `Access-Control-Allow-Origin: *`) |
| `upload.wikimedia.org` | header CORS `*`, tetapi URL thumbnail bisa 400 bila UA generik |
| `commons.wikimedia.org/wiki/Special:FilePath/...` | **gagal dari plugin** ("Failed to fetch") walau `curl` 200 |
| `http://127.0.0.1:<port>` + header CORS | OK |

- Wikimedia: ambil lewat `curl` dengan
  `https://commons.wikimedia.org/wiki/Special:FilePath/<Nama_File>?width=1400`
  (server-side resize; `width=` besar memberi thumbnail, bukan file 12 MB).
- Nama file dengan spasi/koma: pakai `_` dan encode koma (`%2C`).

### 10.4 Lisensi wajib dicatat

- Publik domain / CC0 paling aman. **CC BY-SA** (umum di Wikimedia) wajib
  atribusi **dan** share-alike.
- Catat kredit (file, author, lisensi, URL) di `docs/specs/*.md`, **bukan** sebagai
  caption di UI (aturan anti-slop melarang kredit foto dekoratif).
- Tandai jelas bila foto hanya placeholder sementara yang harus diganti.

---

## 11. Urutan kerja yang direkomendasikan

1. Baca `DESIGN.md` + `packages/types`/`packages/seed` bila relevan entitas.
2. `figma-cli status` → kalau daemon mati: nyalakan Figma → `daemon start` →
   `connect --safe` (perlu `figma.*` di `eval`).
3. Untuk DS: `figma-cli import DESIGN.md` (atau pakai koleksi yang sudah ada).
   Cek `figma-cli col list` — pastikan tidak ada nama variabel yang bentrok.
4. Rancang varian **sebelum** render (tentukan axis & nama `Prop=Value`).
5. `render-batch` (semua node top-level terpisah) → `variants from`.
6. Untuk layar besar: rakit bertahap (`--parent`) dan `--keep-wrapper`.
7. Foto: §10 (unduh → server lokal ber-CORS → `fetch` + `createImage`), lalu
   catat kredit/lisensi di `docs/specs/`.
8. `verify --measure` + (bila perlu) analisis pixel PIL.
9. Bersihkan node uji coba & node nyasar hasil auto-split.
10. Update `docs/` bila ada perubahan perilaku produk yang signifikan.
