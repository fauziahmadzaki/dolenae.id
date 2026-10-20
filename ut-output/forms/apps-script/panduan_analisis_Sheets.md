# Panduan Analisis (Google Sheets)
## Panduan Rumus: TCR, ToT, Error, SUS, CSAT, NPS

> **Berkas terkait:** `analisis_template.csv` (kerangka data per partisipan × task),
> `create_forms.gs` (pembuat formulir otomatis).
>
> Seluruh panduan di bawah memakai contoh **10 partisipan (P1–P10) × 7 task (T1–T7)**
> = 70 baris data. Sesuaikan rentang sel bila jumlah berbeda.

---

## 1. Struktur data (dari `analisis_template.csv`)

| Kolom | Nama | Isi | Nilai valid |
| --- | --- | --- | --- |
| A | `partisipan` | Kode partisipan | P1…P10 |
| B | `task` | Kode task | T1…T7 |
| C | `hasil` | Hasil task | `Sukses tanpa bantuan` / `Sukses dengan bantuan` / `Gagal` / `Tidak dijalankan` |
| D | `assisted` | Perlu bantuan? | Ya / Tidak |
| E | `toT_detik` | Waktu penyelesaian (detik) | angka |
| F | `error` | Jumlah error | angka |
| G | `dead_click` | Jumlah ketukan tanpa efek | angka |
| H | `back_step` | Jumlah langkah mundur | angka |
| I | `rage_tap` | Jumlah ketukan berulang | angka |
| J | `seq` | Skor SEQ (1–7) | 1–7 |
| K | `hyps` | Hipotesis terkait | HYP-xx |
| L | `catt` | Catatan | teks |

---

## 2. Rumus per task (contoh: T1)

Misalkan data berada di baris **2–71** (`C2:C71`, `E2:E71`, dst).

### 2.1 Jumlah partisipan yang mengerjakan task
```
=COUNTIF($B$2:$B$71,"T1")
```

### 2.2 Task Completion Rate (TCR) per task
```
=IFERROR(COUNTIFS($B$2:$B$71,"T1",$C$2:$C$71,"Sukses tanpa bantuan")/COUNTIF($B$2:$B$71,"T1")*100,0)
```

### 2.3 Assisted Completion Rate per task
```
=IFERROR(COUNTIFS($B$2:$B$71,"T1",$C$2:$C$71,"Sukses dengan bantuan")/COUNTIF($B$2:$B$71,"T1")*100,0)
```

### 2.4 Gagal per task
```
=COUNTIFS($B$2:$B$71,"T1",$C$2:$C$71,"Gagal")
```

### 2.5 Time-on-Task per task — median & rata-rata (detik)
```
=IFERROR(MEDIAN(IF($B$2:$B$71="T1",$E$2:$E$71)),0)     ← array formula (Ctrl+Shift+Enter)
=IFERROR(AVERAGEIF($B$2:$B$71,"T1",$E$2:$E$71),0)
```

### 2.6 Rata-rata error / dead click / back-step / rage tap per task
```
=IFERROR(AVERAGEIF($B$2:$B$71,"T1",$F$2:$F$71),0)   ← error
=IFERROR(AVERAGEIF($B$2:$B$71,"T1",$G$2:$G$71),0)   ← dead click
=IFERROR(AVERAGEIF($B$2:$B$71,"T1",$H$2:$H$71),0)   ← back-step
=IFERROR(AVERAGEIF($B$2:$B$71,"T1",$I$2:$I$71),0)   ← rage tap
```

### 2.7 SEQ rata-rata per task
```
=IFERROR(AVERAGEIF($B$2:$B$71,"T1",$J$2:$J$71),0)
```

### 2.8 Total ketukan tanpa efek (dead click) seluruh sesi
```
=SUM($G$2:$G$71)
```

### 2.9 Persentase sesi dengan minimal satu rage tap
```
=IFERROR(COUNTIF($I$2:$I$71,">0")/COUNTA($I$2:$I$71)*100,0)
```

---

## 3. Rumus agregat (semua task)

### 3.1 TCR keseluruhan
```
=COUNTIF($C$2:$C$71,"Sukses tanpa bantuan")/COUNTA($C$2:$C$71)*100
```

### 3.2 Assisted completion rate keseluruhan
```
=COUNTIF($C$2:$C$71,"Sukses dengan bantuan")/COUNTA($C$2:$C$71)*100
```

### 3.3 Median & rata-rata ToT keseluruhan
```
=MEDIAN($E$2:$E$71)
=AVERAGE($E$2:$E$71)
```

### 3.4 ToT per segmen (jika segmen dicatat di kolom terpisah)
```
=AVERAGEIF($N$2:$N$71,"A — Pemula",$E$2:$E$71)
=AVERAGEIF($N$2:$N$71,"B — Semi-berpengalaman",$E$2:$E$71)
```

### 3.5 Rata-rata error, dead click, back-step, rage tap keseluruhan
```
=AVERAGE($F$2:$F$71)
=AVERAGE($G$2:$G$71)
=AVERAGE($H$2:$H$71)
=AVERAGE($I$2:$I$71)
```

### 3.6 SEQ keseluruhan
```
=AVERAGE($J$2:$J$71)
```

---

## 4. SUS (dari Form 3)

Misalkan jawaban S1–S10 berada di kolom **B–K**, baris **2–11** (10 partisipan).

### 4.1 Total mentah per partisipan
```
=((B2-1)+(5-C2)+(D2-1)+(5-E2)+(F2-1)+(5-G2)+(H2-1)+(5-I2)+(J2-1)+(5-K2))
```

### 4.2 Nilai SUS per partisipan
```
=((B2-1)+(5-C2)+(D2-1)+(5-E2)+(F2-1)+(5-G2)+(H2-1)+(5-I2)+(J2-1)+(5-K2))*2.5
```

### 4.3 SUS kelompok (rata-rata, standar deviasi, jumlah)
```
=AVERAGE(L2:L11)
=STDEV(L2:L11)
=COUNT(L2:L11)
```

### 4.4 Tafsir SUS otomatis
```
=IF(AVERAGE(L2:L11)>=80.3,"Unggul (A)",
  IF(AVERAGE(L2:L11)>=68,"Baik",
    IF(AVERAGE(L2:L11)>=51,"Perlu redesain","Buruk (F)")))
```

---

## 5. CSAT & NPS (dari Form 4)

Misalkan:
- `C1` (kepuasan) berada di kolom **D**
- `N1` (rekomendasi 0–10) berada di kolom **G**
- Data pada baris **2–11**

### 5.1 CSAT (% jawaban 4–5)
```
=COUNTIF(D2:D11,">=4")/COUNTA(D2:D11)*100
```

### 5.2 Rata-rata CSAT (C1–C3)
```
=AVERAGE(D2:F11)
```

### 5.3 NPS
```
=((COUNTIF(G2:G11,">=9")-COUNTIF(G2:G11,"<=6"))/COUNTA(G2:G11))*100
```

### 5.4 Distribusi kategori NPS
```
Promotor  (9–10) : =COUNTIF(G2:G11,">=9")
Pasif     (7–8)  : =COUNTIFS(G2:G11,">=7",G2:G11,"<=8")
Detraktor (0–6)  : =COUNTIF(G2:G11,"<=6")
```

### 5.5 Trust score & perceived speed
```
=AVERAGE(H2:J11)   ← T1–T3 (kepercayaan)
=AVERAGE(K2:K11)   ← S1 (persepsi kecepatan)
```

---

## 6. Perbandingan V1 vs V2

### 6.1 Selisih TCR
```
=TCR_V2 - TCR_V1
```

### 6.2 Selisih median ToT (persentase; negatif = membaik)
```
=IFERROR((ToT_V2 - ToT_V1)/ToT_V1*100, "")
```

### 6.3 Selisih SUS
```
=SUS_V2 - SUS_V1
```

### 6.4 Uji Mann-Whitney U (non-parametrik, n kecil)

Google Sheets tidak memiliki fungsi bawaan langsung. Gunakan **Add-on** berikut:

| Add-on | Fungsi | Cara |
| --- | --- | --- |
| **XLMiner Analysis ToolPak** | `t-Test`, `Mann-Whitney` | Extensions → Add-ons |
| **Statistical Analysis** | uji non-parametrik | cari di Workspace Marketplace |
| **R / Python (Colab)** | `scipy.stats.mannwhitneyu` | ekspor CSV dari Sheets |

Alternatif: gunakan `T.TEST` untuk perbandingan rata-rata (kurang tepat untuk n kecil,
tetapi dipakai bila uji non-parametrik tidak tersedia):
```
=T.TEST(range_V1; range_V2; 2; 3)
```

### 6.5 Tabel pelaporan (tempel ke laporan)

| Metrik | V1 | V2 | Selisih | Target (usulan) | Lulus? |
| --- | --- | --- | --- | --- | --- |
| TCR (%) | `[ISI]` | `[ISI]` | `[ISI]` | ≥ 85% | `[ ]` |
| Median ToT (s) | `[ISI]` | `[ISI]` | `[ISI]` | −15%…−25% | `[ ]` |
| Error rate | `[ISI]` | `[ISI]` | `[ISI]` | ≤ 1,0 | `[ ]` |
| Dead click rate | `[ISI]` | `[ISI]` | `[ISI]` | ≤ 0,5 | `[ ]` |
| SUS | `[ISI]` | `[ISI]` | `[ISI]` | ≥ 75 | `[ ]` |
| SEQ | `[ISI]` | `[ISI]` | `[ISI]` | ≥ 5,5 | `[ ]` |
| CSAT (%) | `[ISI]` | `[ISI]` | `[ISI]` | ≥ 80% | `[ ]` |
| NPS | `[ISI]` | `[ISI]` | `[ISI]` | ≥ 20 | `[ ]` |

---

## 7. Perhitungan severity (rubrik)

Dipakai untuk mengisi kolom severity final pada `01_laporan_UT.md` BAB 9.

```
skor = frekuensi × dampak × persistensi

frekuensi   : rendah(1) | sedang(2) | tinggi(3)
dampak      : rendah(1) | sedang(2) | tinggi(3)
persistensi : sporadik(1) | konsisten(2) | selalu(3)

≥18 → 4 Critical | 12–17 → 3 Major | 6–11 → 2 Medium | ≤5 → 1 Minor
```

**Rumus Sheets:**
```
=IF(A2*B2*C2>=18,4,IF(A2*B2*C2>=12,3,IF(A2*B2*C2>=6,2,1)))
```

---

## 8. Daftar periksa sebelum menyusun laporan

- [ ] Tidak ada sel `[ISI]` yang tertinggal kosong.
- [ ] Jumlah partisipan per segmen minimal 5.
- [ ] SUS dihitung **tepat 10** pernyataan; tidak ada yang dihilangkan.
- [ ] ToT dinyatakan dalam detik, bukan mm:ss mentah.
- [ ] Task gagal karena masalah teknis dicatat terpisah (tidak dihitung sebagai kegagalan kegunaan).
- [ ] Seluruh kutipan think-aloud sudah dianonimkan (tidak ada nama).
- [ ] Severity final dihitung dengan rubrik, bukan estimasi pra-UT.
