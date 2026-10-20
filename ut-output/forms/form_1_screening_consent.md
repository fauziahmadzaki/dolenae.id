# Form 1 — Screening, Demografi, dan Informed Consent
## Usability Testing Dolenae.id (Aplikasi Mobile)

> **Spesifikasi Google Forms.** Nama form: `Dolenae.id — Form 1: Screening & Persetujuan`.
> Deskripsi form (tempel di kolom deskripsi):
> *"Terima kasih atas kesediaan Anda. Formulir ini digunakan untuk memastikan kesesuaian
> partisipan dan memperoleh persetujuan Anda. Pengisian membutuhkan waktu sekitar 3
> menit. Jawaban Anda bersifat rahasia dan hanya digunakan untuk analisis penelitian."*
> Setelan: **Kumpulkan email = Tidak** (agar anonim). **Satu respons = Ya**.

---

## BAGIAN A — Lembar Persetujuan (Informed Consent)

**Deskripsi bagian:** *"Mohon baca dengan saksama sebelum melanjutkan."*

**A0. [Tanpa pertanyaan / teks penjelasan]**
> Kami mengundang Anda untuk berpartisipasi dalam sesi uji kegunaan aplikasi
> **Dolenae.id**, sebuah aplikasi untuk menemukan destinasi alam Indonesia dan
> mempersiapkan perjalanan.
>
> - **Tujuan:** memahami kemudahan penggunaan aplikasi.
> - **Sukarela:** Anda boleh berhenti kapan saja tanpa alasan dan tanpa konsekuensi.
> - **Perekaman:** layar dan suara akan direkam untuk analisis; rekaman dihapus
>   maksimal 6 bulan setelah laporan selesai.
> - **Kerahasiaan:** identitas Anda diganti kode (mis. P1); tidak ada nama pada laporan.
> - **Durasi:** sekitar 60 menit.
> - **Risiko:** tidak ada risiko berarti; tidak ada konten sensitif.
> - **Kontak:** `[ISI NAMA & KONTAK PENELITI]`.

| No | Pertanyaan | Tipe | Opsi / Skala | Wajib |
| --- | --- | --- | --- | --- |
| A1 | Saya telah membaca dan memahami informasi di atas. | Pilihan ganda | Ya / Tidak | **Wajib** |
| A2 | Saya menyetujui untuk berpartisipasi dalam sesi ini. | Pilihan ganda | Ya, saya setuju / Tidak | **Wajib** |
| A3 | Saya menyetujui sesi ini direkam (layar dan suara). | Pilihan ganda | Ya, saya setuju / Tidak | **Wajib** |
| A4 | Saya memahami bahwa saya dapat berhenti kapan saja tanpa konsekuensi. | Pilihan ganda | Ya / Tidak | **Wajib** |
| A5 | Tanggal persetujuan | Tanggal | — | **Wajib** |
| A6 | Tanda tangan (nama lengkap sebagai bentuk persetujuan) | Jawaban singkat | — | **Wajib** |

> **Logika bagian:** jika A2 atau A3 = "Tidak", arahkan ke
> **Bagian Penutup (Tidak Dapat Melanjutkan)**.

---

## BAGIAN B — Kriteria Kelayakan Partisipan

**Deskripsi bagian:** *"Beberapa pertanyaan singkat untuk memastikan kesesuaian."*

| No | Pertanyaan | Tipe | Opsi / Skala | Wajib |
| --- | --- | --- | --- | --- |
| B1 | Berapa usia Anda saat ini? | Dropdown | 15–17 / 18–24 / 25–30 / 31–35 / 36–45 / >45 | **Wajib** |
| B2 | Di kota/kabupaten mana Anda berdomisili saat ini? | Jawaban singkat | — | **Wajib** |
| B3 | Dalam 12 bulan terakhir, berapa kali Anda mengunjungi destinasi alam (gunung, bukit, air terjun, danau, camping)? | Pilihan ganda | Tidak pernah / 1–2 kali / 3–5 kali / >5 kali | **Wajib** |
| B4 | Apakah Anda pernah atau sedang terlibat sebagai pengembang, desainer, atau peneliti pada produk ini? | Pilihan ganda | Ya / Tidak | **Wajib** |
| B5 | Apakah Anda bersedia mengikuti sesi ±60 menit pada jadwal yang disepakati? | Pilihan ganda | Ya / Tidak | **Wajib** |

> **Logika bagian:** (a) Jika B1 = "15–17" atau ">45" → arahkan ke penutup; (b) jika
> B3 = "Tidak pernah" → arahkan ke penutup; (c) jika B4 = "Ya" → arahkan ke penutup;
> (d) jika B5 = "Tidak" → arahkan ke penutup.

---

## BAGIAN C — Demografi

**Deskripsi bagian:** *"Digunakan hanya untuk analisis kelompok."*

| No | Pertanyaan | Tipe | Opsi / Skala | Wajib |
| --- | --- | --- | --- | --- |
| C1 | Jenis kelamin | Pilihan ganda | Laki-laki / Perempuan / Tidak ingin menyebutkan | Tidak |
| C2 | Status saat ini | Pilihan ganda | Pelajar/mahasiswa / Karyawan / Wirausaha / Lainnya | Tidak |
| C3 | Rentang pengeluaran pribadi per bulan | Dropdown | < Rp 1.000.000 / Rp 1.000.000–2.999.999 / Rp 3.000.000–5.999.999 / ≥ Rp 6.000.000 / Tidak ingin menyebutkan | Tidak |

---

## BAGIAN D — Pengalaman dan Perangkat

**Deskripsi bagian:** *"Untuk memahami latar belakang penggunaan teknologi Anda."*

| No | Pertanyaan | Tipe | Opsi / Skala | Wajib |
| --- | --- | --- | --- | --- |
| D1 | Seberapa sering Anda menggunakan aplikasi mobile dalam sehari? | Skala linear | 1 = Sangat jarang … 5 = Sangat sering | **Wajib** |
| D2 | Berapa banyak aplikasi terkait perjalanan/wisata yang pernah Anda gunakan? | Pilihan ganda | Belum pernah / 1 / 2–3 / Lebih dari 3 | **Wajib** |
| D3 | Sebutkan aplikasi perjalanan/wisata yang pernah Anda gunakan (jika ada) | Paragraf | — | Tidak |
| D4 | Dalam merencanakan perjalanan ke alam, apa yang biasanya paling menyulitkan bagi Anda? | Paragraf | — | Tidak |
| D5 | Jenis perangkat yang akan Anda pakai saat sesi | Pilihan ganda | Android / iPhone | **Wajib** |
| D6 | Versi sistem operasi perangkat Anda | Jawaban singkat | — | **Wajib** |
| D7 | Apakah Anda nyaman mengaktifkan tangkapan layar atau berbagi layar? | Pilihan ganda | Ya / Tidak | **Wajib** |

---

## BAGIAN E — Penempatan Segmen

**Deskripsi bagian:** *"Kami menempatkan Anda pada salah satu kelompok partisipan. Tidak ada jawaban benar atau salah."*

| No | Pertanyaan | Tipe | Opsi / Skala | Wajib |
| --- | --- | --- | --- | --- |
| E1 | Seberapa sering Anda mendaki atau berkemah dalam 2 tahun terakhir? | Skala linear | 1 = Belum pernah … 5 = Sangat sering | **Wajib** |
| E2 | Seberapa percaya diri Anda menyiapkan perjalanan ke alam sendiri (mengatur transportasi, biaya, perlengkapan)? | Skala linear | 1 = Tidak percaya diri … 5 = Sangat percaya diri | **Wajib** |
| E3 | Seberapa sering Anda menggunakan aplikasi untuk menyusun rencana perjalanan, bukan hanya mencari inspirasi? | Skala linear | 1 = Tidak pernah … 5 = Selalu | **Wajib** |

> **Skoring penempatan (internal, tidak dibaca partisipan):**
> - **Segmen A (Pemula):** rata-rata E1–E3 ≤ 2,5 → persona Dimas Pratama.
> - **Segmen B (Semi-berpengalaman):** rata-rata E1–E3 ≥ 3,0 → persona Rian Kusuma.
> Jumlah minimal: **5 partisipan per segmen**.

---

## BAGIAN F — Logistik Sesi

| No | Pertanyaan | Tipe | Opsi / Skala | Wajib |
| --- | --- | --- | --- | --- |
| F1 | Preferensi waktu sesi | Pilihan ganda | Pagi / Siang / Sore / Malam | **Wajib** |
| F2 | Kesediaan hadir fisik | Pilihan ganda | Bersedia / Hanya daring | **Wajib** |
| F3 | Nama atau inisial untuk dihubungi (akan diganti kode pada laporan) | Jawaban singkat | — | **Wajib** |
| F4 | Kontak yang dapat dihubungi (WhatsApp/email) | Jawaban singkat | — | **Wajib** |
| F5 | Ada kebutuhan khusus yang perlu kami siapkan? | Paragraf | — | Tidak |

---

## BAGIAN PENUTUP — Tidak Dapat Melanjutkan

**Deskripsi bagian:** *"Terima kasih atas waktu Anda. Berdasarkan jawaban, saat ini Anda belum dapat menjadi partisipan pada sesi ini. Kami sangat menghargai kesediaan Anda."*

| No | Pertanyaan | Tipe | Opsi | Wajib |
| --- | --- | --- | --- | --- |
| G1 | Apakah Anda bersedia kami hubungi untuk sesi berikutnya? | Pilihan ganda | Ya / Tidak | Tidak |
| G2 | Kontak yang dapat dihubungi (jika bersedia) | Jawaban singkat | — | Tidak |

---

## Catatan penyusunan
- Pertanyaan Bagian D **tidak menyebut** nama fitur, layar, tombol, atau ikon aplikasi
  Dolenae.id (sesuai aturan "tanpa membocorkan solusi/UI pada tahap pra-task).
- Pertanyaan segmen (Bagian E) dirancang agar penempatan partisipan tidak bergantung
  pada istilah internal aplikasi.
