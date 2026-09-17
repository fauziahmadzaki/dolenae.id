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

- **Font pakai `font="Inter"`** — BUKAN `fontFamily`. `fontFamily` diabaikan
  diam-diam.
- **Shadow harus format** `0 y blur #RRGGBBAA` — `rgba(...)` bikin parser JSX
  **men-drop elemen**. Contoh: `shadow="0 4 12 #0000001A"`.
- **Text wrapping:** parent **dan** tiap `<Text>` harus `w="fill"`, parent
  `flex="col"` atau `flex="row"`. Tanpa itu teks tak membungkus.
- **`w="fill"` pada semua anak flex** untuk mencegah anak collapse (bug layout
  paling sering muncul dua kali).
- **Tag JSX harus balance.** Frame terbuka tanpa penutup yang pas bisa membuat
  **section di belakangnya hilang diam-diam** (pernah kejadian: section elevation
  drop). Setelah render, cek `verify --measure` apakah semua section ada.

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
- Menghapus **`COMPONENT_SET`** otomatis menghapus komponen varian di dalamnya
  (delete satu id `COMPONENT_SET` saja).
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

## 10. Urutan kerja yang direkomendasikan

1. Baca `DESIGN.md` + `packages/types`/`packages/seed` bila relevan entitas.
2. `figma-cli status` → pastikan koneksi.
3. Untuk DS: `figma-cli import DESIGN.md` (atau pakai koleksi yang sudah ada).
4. Rancang varian **sebelum** render (tentukan axis & nama `Prop=Value`).
5. `render-batch` (semua node top-level terpisah) → `variants from`.
6. `verify --measure` + (bila perlu) analisis pixel PIL.
7. Bersihkan node uji coba yang kamu buat (`delete` satu per satu).
8. Update `docs/` bila ada perubahan perilaku produk yang signifikan.
