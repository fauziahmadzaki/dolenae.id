# Form 3 — System Usability Scale (SUS)
## Usability Testing Dolenae.id (Aplikasi Mobile)

> **Spesifikasi Google Forms.** Nama form: `Dolenae.id — Form 3: Penilaian Pengalaman (SUS)`.
> Deskripsi form:
> *"Berikut adalah 10 pernyataan tentang aplikasi Dolenae.id. Untuk setiap pernyataan,
> pilih sejauh mana Anda setuju. Jawab berdasarkan pengalaman Anda hari ini, bukan
> berdasarkan harapan Anda. Tidak ada jawaban benar atau salah."*
> Setelan: **Kumpulkan email = Tidak**. **Satu respons = Ya**.
>
> **Catatan penting:** SUS adalah **instrumen standar** — jangan mengubah susunan,
> jumlah (wajib tepat 10), atau polaritas pernyataan.

---

## Bagian 0 — Identitas

| No | Pertanyaan | Tipe | Opsi | Wajib |
| --- | --- | --- | --- | --- |
| 0.1 | Kode partisipan | Dropdown | P1 … P10 | **Wajib** |

---

## Bagian 1 — 10 Pernyataan SUS

**Deskripsi bagian:** *"Pilih satu nilai pada setiap baris."*
**Skala (identik untuk semua 10 pertanyaan):**
**Tipe:** Skala linear, **rentang 1–5**
**Label:**
- **1** = `Sangat tidak setuju`
- **5** = `Sangat setuju`

| No | Pernyataan (Bahasa Indonesia) | Polaritas | Skala | Wajib |
| --- | --- | --- | --- | --- |
| **S1** | Saya ingin lebih sering menggunakan Dolenae.id. | **Positif** | 1–5 | **Wajib** |
| **S2** | Saya merasa Dolenae.id terlalu rumit dan tidak perlu. | **Negatif** | 1–5 | **Wajib** |
| **S3** | Saya merasa Dolenae.id mudah digunakan. | **Positif** | 1–5 | **Wajib** |
| **S4** | Saya merasa membutuhkan bantuan orang teknis agar bisa memakai Dolenae.id. | **Negatif** | 1–5 | **Wajib** |
| **S5** | Saya merasa bagian-bagian pada Dolenae.id sudah berjalan dengan baik dan terpadu. | **Positif** | 1–5 | **Wajib** |
| **S6** | Saya merasa Dolenae.id terlalu banyak hal yang tidak konsisten. | **Negatif** | 1–5 | **Wajib** |
| **S7** | Saya membayangkan sebagian besar pengguna akan cepat memahami Dolenae.id. | **Positif** | 1–5 | **Wajib** |
| **S8** | Saya merasa Dolenae.id sangat membingungkan saat digunakan. | **Negatif** | 1–5 | **Wajib** |
| **S9** | Saya merasa percaya diri ketika menggunakan Dolenae.id. | **Positif** | 1–5 | **Wajib** |
| **S10** | Saya perlu belajar banyak hal sebelum bisa mulai menggunakan Dolenae.id. | **Negatif** | 1–5 | **Wajib** |

> **Pola polaritas (wajib benar):** Positif pada pernyataan ganjil (S1, S3, S5, S7,
> S9); Negatif pada pernyataan genap (S2, S4, S6, S8, S10).

---

## Bagian 2 — Pertanyaan Tambahan (opsional, tidak dihitung dalam SUS)

Pertanyaan berikut **tidak** termasuk skor SUS dan boleh dihilangkan bila form terlalu
panjang.

| No | Pertanyaan | Tipe | Opsi / Skala | Wajib |
| --- | --- | --- | --- | --- |
| A1 | Sejauh mana Anda setuju bahwa tampilan aplikasi ini menyenangkan secara visual? | Skala linear | 1 = Sangat tidak setuju … 5 = Sangat setuju | Tidak |
| A2 | Sejauh mana Anda setuju bahwa aplikasi ini cocok untuk perencanaan perjalanan alam? | Skala linear | 1 = Sangat tidak setuju … 5 = Sangat setuju | Tidak |
| A3 | Menurut Anda, pernyataan mana yang paling tidak sesuai dengan pengalaman Anda? | Paragraf | — | Tidak |

---

## Tabel Skoring SUS (untuk analisis — jangan ditampilkan ke partisipan)

### Aturan skoring
```
Untuk setiap partisipan:
  • Pernyataan GANJIL (S1, S3, S5, S7, S9) → skor = nilai − 1
  • Pernyataan GENAP  (S2, S4, S6, S8, S10) → skor = 5 − nilai
  • Total mentah (raw) = jumlah seluruh skor               (rentang 0–40)
  • Nilai SUS          = total mentah × 2,5                 (rentang 0–100)
```

### Lembar perhitungan per partisipan

| Partisipan | S1 (n−1) | S2 (5−n) | S3 (n−1) | S4 (5−n) | S5 (n−1) | S6 (5−n) | S7 (n−1) | S8 (5−n) | S9 (n−1) | S10 (5−n) | Total raw | **SUS** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | | | | | | | | | | | | |
| P2 | | | | | | | | | | | | |
| P3 | | | | | | | | | | | | |
| P4 | | | | | | | | | | | | |
| P5 | | | | | | | | | | | | |
| P6 | | | | | | | | | | | | |
| P7 | | | | | | | | | | | | |
| P8 | | | | | | | | | | | | |
| P9 | | | | | | | | | | | | |
| P10 | | | | | | | | | | | | |
| **Rata-rata** | | | | | | | | | | | | **`[ISI]`** |

### Contoh perhitungan (ilustrasi angka, bukan hasil UT)

| Pernyataan | Jawaban | Polaritas | Skor |
| --- | --- | --- | --- |
| S1 | 5 | Positif | 5 − 1 = 4 |
| S2 | 2 | Negatif | 5 − 2 = 3 |
| S3 | 4 | Positif | 4 − 1 = 3 |
| S4 | 3 | Negatif | 5 − 3 = 2 |
| S5 | 4 | Positif | 3 |
| S6 | 1 | Negatif | 4 |
| S7 | 5 | Positif | 4 |
| S8 | 2 | Negatif | 3 |
| S9 | 4 | Positif | 3 |
| S10 | 2 | Negatif | 3 |
| **Total raw** | — | — | **32** |
| **SUS** | — | — | **32 × 2,5 = 80** |

> Ilustrasi di atas hanya menunjukkan cara menghitung; **bukan** data hasil UT.

---

## Referensi tafsir SUS

| Rentang SUS | Tafsir | Keterangan |
| --- | --- | --- |
| **< 51** | Buruk — **Grade F** | Perlu redesain menyeluruh |
| **< 68** | Di bawah rata-rata — **perlu redesain** | Banyak masalah kegunaan |
| **68 – 79,9** | Baik — **Grade C–B** | Dapat diterima; ada ruang perbaikan |
| **≥ 80,3** | Unggul — **Grade A** | Pengalaman sangat baik |

**Target V2 (usulan): SUS ≥ 75** — lihat `04_rencana_metrik_HEART.md`.

---

## Rumus untuk Google Sheets

```
# Kolom B–K = jawaban S1..S10 (nilai 1-5) pada baris ke-2 dan seterusnya

# Total raw
=((B2-1)+(5-C2)+(D2-1)+(5-E2)+(F2-1)+(5-G2)+(H2-1)+(5-I2)+(J2-1)+(5-K2))

# Nilai SUS satu partisipan
=((B2-1)+(5-C2)+(D2-1)+(5-E2)+(F2-1)+(5-G2)+(H2-1)+(5-I2)+(J2-1)+(5-K2))*2.5

# Rata-rata SUS kelompok (mis. baris 2..11 pada kolom L)
=AVERAGE(L2:L11)

# Standar deviasi & jumlah partisipan
=STDEV(L2:L11)
=COUNT(L2:L11)
```
