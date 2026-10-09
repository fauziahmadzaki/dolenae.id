# Panduan figma-cli untuk AI Coding Tools

Dokumen ini menjelaskan cara memakai **figma-cli** dari berbagai AI coding
tools (Claude Code, Cursor, opencode, GitHub Copilot, Codex, Cline, dan lain
lain), bukan hanya dari tool tempat `init-agent` dijalankan.

> Sumber resmi: repo `github.com/silships/figma-cli` (baca `REFERENCE.md` untuk
> referensi perintah lengkap).

---

## 1. Apa itu figma-cli

figma-cli mengontrol **Figma Desktop** secara langsung lewat CDP (tanpa API
key, 100% lokal, tanpa rate limit). AI coding tool cukup memanggil perintah
`figma-cli <cmd>` lewat terminal; hasilnya langsung tampil/edit di Figma yang
sedang terbuka sebagai node nyata (frame, komponen, variabel).

Karakteristik penting:

- **Tanpa plugin/bridge** — sekali `connect`, tool lain tinggal pakai.
- **Tools-agnostic** — karena ini CLI biasa, SEMUA AI coding tool yang bisa
  menjalankan shell command bisa menggunakannya.
- **Token hemat** — perintahnya pendek, tidak ada skema MCP besar.

---

## 2. Setup sekali saja

```bash
# 1. install global (bin: figma-cli)
npm install -g figma-ds-cli

# 2. buka Figma Desktop (harus terbuka)
# 3. hubungkan sekali per sesi
figma-cli connect        # yolo mode; alternatif: browser mode / safe mode
figma-cli status         # cek koneksi & daemon
```

Supaya agent tahu aturan mainnya, jalankan sekali di project:

```bash
figma-cli init-agent --tool both
```

Perintah itu menulis:
- `.cursor/rules/figma-cli.mdc` (dibaca Cursor & kebanyakan editor agentic)
- `AGENTS.md` (dibaca Claude Code, Cursor, Codex, **opencode**, dan banyak lagi)

Jika `AGENTS.md` project sudah berisi konteks sendiri, jangan `--force`;
cukup tempel bagian `# Using figma-cli` ke dalamnya (lihat `AGENTS.md` root
project ini — sudah dilakukan).

---

## 3. Prinsip utama (untuk dipegang agent)

1. **Buat visual dengan `render` / `render-batch`** — punya smart positioning.
   JANGAN `eval` untuk bikin node visual (tanpa positioning, melewati guard).
2. **"N kartu/tombol" = N node top-level terpisah**, bukan satu wrapper berisi N
   child. Gunakan `render-batch '[...]'` atau `shadcn add <c> --count N`.
3. **Jangan hapus node milik user.**
4. **Selalu verifikasi** setelah membuat: `figma-cli verify "<id>" --measure`
   (mengembalikan screenshot + ukuran asli untuk cek bug ukuran dengan angka).
5. **Bind warna dengan token** `var:NamaToken` saat sistem desain aktif, jangan
   raw hex: `<Frame bg="var:primary"><Text color="var:on-primary">Go</Text></Frame>`.
6. **Ikon pakai SVG Lucide** (`<Icon name="lucide:*" />`), bukan emoji.

---

## 4. Cheat-sheet perintah

```bash
figma-cli connect                      # hubungkan ke Figma Desktop
figma-cli import DESIGN.md             # DESIGN.md/tailwind/CSS/tokens JSON -> variables
figma-cli extract                      # scan file terbuka -> DESIGN.md
figma-cli variables visualize "Col"    # swatch warna ke canvas
figma-cli render '<Frame>...</Frame>'  # render satu frame
figma-cli render-batch '[ ... ]' -g 40 -d row --as-component
figma-cli shadcn add button --count 3  # N primitif shadcn terpisah
figma-cli node to-component "<id>"     # frame -> component
figma-cli variants from "a,b,c" -p Variant -v X,Y,Z -n Nama
figma-cli find "<nama>"                # cari node
figma-cli verify "<id>" --measure      # screenshot + ukuran
figma-cli a11y audit                   # kontras / touch / teks
figma-cli use <collection>             # ganti tema (rebind var)
```

Sintaks JSX `render` yang sering dipakai:

```
Layout  : flex="row|col" gap={16} p={24} px py pt pr pb pl justify items
Size    : w={320} h={200} w="fill" w="hug" w="60%"
Look    : bg="#fff" stroke="#000" strokeWidth={2} rounded={12} shadow opacity
Text    : <Text size={14} weight="semibold" color="var:ink" lineHeight={20} truncate maxLines={2} w="fill">
Ikon    : <Icon name="lucide:home" size={20} color="var:primary" />
```

> **Text wrapping (bug paling sering):** agar teks membungkus, parent DAN tiap
> `<Text>` harus `w="fill"`, dan parent harus `flex="col"` atau `flex="row"`.

---

## 5. Mengintegrasikan ke AI tool lain

### Claude Code / Codex / Cursor
Lewat `AGENTS.md` (semua baca file ini). Bagian `# Using figma-cli` dari
`init-agent` sudah berisi aturan yang cukup.

### opencode
- Baca `AGENTS.md` root otomatis. Bagian `## Desain & Figma (figma-cli)` di
  `AGENTS.md` project ini adalah versi ringkasnya.
- Agent cukup memanggil `figma-cli <cmd>` sebagai terminal command.
- Untuk aturan operator yang lebih detail, arahkan agent ke
  `.cursor/rules/figma-cli.mdc` (format Markdown biasa, bisa dibaca tool apa pun).

### GitHub Copilot / Cline / Windsurf / dll.
- Pastikan `AGENTS.md` (atau `CLAUDE.md`/instruksi project yang dibaca tool
  tersebut) memuat bagian `# Using figma-cli`.
- Perintah figma-cli adalah CLI biasa; tool apa pun yang bisa menjalankan
  command (Bash/terminal) bisa menggunakannya.

### Local LLM (offline, LM Studio / Ollama)
figma-cli mendukung koneksi dengan model lokal. Instruksi setup: buka repo
figma-cli dan minta agent menjalankan setup "local LLM agent" (ada di README
resmi).

---

## 6. Workflow khas "design system → komponen → prototype"

```bash
# 1. token masuk
figma-cli import DESIGN.md
figma-cli variables visualize "Dolenae Design System (Alam)"

# 2. bikin komponen dasar (bind var), lalu jadikan component
figma-cli render-batch -c "Dolenae Design System (Alam)" --as-component '[...]'

# 3. gabung varian
figma-cli variants from "<id1,id2,id3>" -p Variant -v A,B,C -n Button

# 4. pakai instans untuk layout/pose (mis. mobile 390)
figma-cli render-batch -c "Dolenae Design System (Alam)" '[<Instance ...>]'

# 5. verifikasi
figma-cli verify "<id>" --measure
```

---

## 7. Tips khusus Windows

- Pastikan folder temp sudah ada sebelum `verify` (secara default pakai
  `D:\tmp` / `C:\tmp`): `mkdir D:\tmp`.
- Kalau daemon gagal start, perintah tetap jalan tapi lebih lambat; ulangi
  `figma-cli status` / `figma-cli connect`.
- Nama collection dengan spasi/spasi di dalam kurung cukup di-quote, mis.
  `-c "Dolenae Design System (Alam)"`.

---

## 8. Aman & undo

- `figma-cli unpatch` mengembalikan Figma Desktop ke kondisi awal (yolo mode
  cuma menambah satu string pada `app.asar`; reversible).
- `figma-cli undo` menghapus node hasil `render`/`render-batch` terakhir.
- Detail keamanan per mode koneksi: file `SECURITY.md` di repo figma-cli.

---

## 9. Troubleshooting singkat

| Gejala | Solusi |
| --- | --- |
| `fetch failed` di command apa pun | Daemon/Figma belum konek. Jalankan `figma-cli connect`, cek `figma-cli status`. |
| `verify` error ENOENT | Buat folder temp (Windows: `D:\tmp`). |
| Warna tidak sesuai sistem | Pastikan `-c "NamaCollection"` dipakai dan token sudah di-import. |
| Emoji/teks aneh | Ganti ikon ke Lucide; cek `Text maxLines` dan `w="fill"`. |
| Variabel `var:name` ambigu (nama kembar antar collection) | Pin collection: `-c "Dolenae Design System (Alam)"`. |