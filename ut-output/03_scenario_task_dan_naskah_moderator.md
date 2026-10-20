# 03 — Scenario Task, Naskah Moderator, dan Lembar Observer

**Fase 2.** Dokumen ini memuat 7 scenario task berbasis tujuan, naskah moderator, dan
lembar observer untuk Usability Testing aplikasi mobile Dolenae.id.

> **Aturan penulisan scenario:** seluruh kalimat yang dibacakan kepada partisipan
> **tidak menyebut** nama tombol, ikon, menu, atau lokasi elemen antarmuka. Jalur ideal
> dicantumkan hanya untuk moderator/observer dan tidak dibacakan.

---

## 1. Prinsip desain task

| Prinsip | Penerapan |
| --- | --- |
| Berbasis tujuan | Setiap task menyatakan **hasil akhir** yang diinginkan partisipan, bukan langkah UI |
| Kontekstual | Disertai motivasi, batasan anggaran/waktu, dan kendala realistis |
| Bebas bias UI | Tidak menyebut label tombol, ikon, nama menu, atau posisi elemen |
| Terukur | Memiliki kriteria sukses/gagal eksplisit + batas waktu maksimum |
| Tertelusur | Setiap task dipetakan ke `HYP-xx` dan dimensi HEART |

**Konvensi:** "Berhasil" = tujuan tercapai **tanpa bantuan**. "Berhasil dengan bantuan"
= tujuan tercapai setelah moderator memberi petunjuk (dihitung gagal untuk TCR murni).
"Gagal" = tujuan tidak tercapai dalam batas waktu, atau partisipan menyerah.

---

## 2. Matriks ringkas 7 task

| ID | Segmen | Tujuan | Batas waktu | Jalur ideal | HYP terkait | HEART |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | Pemula | Menemukan satu destinasi alam untuk pendakian akhir pekan dengan anggaran terbatas | 4 menit | Beranda → Jelajah → hasil → kartu destinasi | HYP-07, HYP-20, HYP-31, HYP-05 | T, H, E |
| T2 | Pemula | Menyimpan satu destinasi untuk ditinjau kembali nanti | 3 menit | Beranda → detail destinasi → simpan → Profil → daftar tersimpan | HYP-01, HYP-04, HYP-06, HYP-05 | T, H |
| T3 | Pemula | Mencatat perlengkapan pribadi yang perlu dibawa dan menandai yang sudah siap | 5 menit | Beranda → detail destinasi → daftar persiapan → tambah item → tandai selesai | HYP-03, HYP-15, HYP-17, HYP-19 | T, H, E |
| T4 | Semi | Menyusun rencana perjalanan dua hari untuk dua orang dan memastikan rencana tersimpan | 6 menit | Beranda → detail destinasi → susun rencana → pilih destinasi → isi detail → simpan → lihat rencana | HYP-09, HYP-14, HYP-16, HYP-26 | T, H, A |
| T5 | Semi | Memeriksa status usulan yang pernah dikirim | 3 menit | Profil/Beranda → (jalur tersimpan) → status usulan | HYP-04, HYP-16, HYP-22, HYP-02 | T, H |
| T6 | Semi | Mendapatkan saran destinasi dari masukan pribadi lalu menyimpan satu saran | 5 menit | Beranda → saran otomatis → isi masukan → hasil → simpan | HYP-08, HYP-06, HYP-13, HYP-27, HYP-25 | T, H, A |
| T7 | Pemula | Mengubah pengaturan aplikasi sesuai preferensi pribadi | 4 menit | Profil → pengaturan → ubah preferensi → kembali | HYP-02, HYP-04, HYP-32, HYP-34, HYP-17 | T, H |

Total perkiraan durasi task: ±30 menit (tanpa jeda & instrumen). Sisa waktu sesi
60 menit digunakan untuk pembuka, informed consent, instrumen, dan debrief.

---

## 3. Detail scenario task

### T1 — Menemukan destinasi untuk pendakian akhir pekan
| Field | Isi |
| --- | --- |
| **ID** | T1 |
| **Segmen** | Wisatawan pemula (persona: Dimas Pratama) |
| **Skenario kepada partisipan** | *"Akhir pekan depan Anda ingin mendaki gunung untuk pertama kali bersama seorang teman. Anda mencari tempat yang cocok untuk pemula, masih terjangkau dengan anggaran sekitar Rp 300.000 per orang, dan bisa ditempuh dari kota Anda. Tunjukkan bagaimana Anda menemukan satu tempat yang menurut Anda paling cocok, dan jelaskan alasan Anda memilih tempat itu."* |
| **Prasyarat / data uji** | Akun wisatawan aktif; koneksi stabil; katalog berisi minimal 4 destinasi (termasuk level pemula); aplikasi dibuka dari Beranda |
| **Jalur ideal (moderator)** | Beranda → Jelajah → (opsional mempersempit hasil) → membaca hasil → membuka kartu destinasi → menyebut alasan (biaya, tingkat kesulitan, lokasi) |
| **Kriteria sukses** | (1) Membuka minimal satu halaman destinasi. (2) Menyebut **≥2 kriteria pembanding** yang sesuai kebutuhan (biaya/kesulitan/lokasi). (3) Memilih satu destinasi final dengan alasan yang masuk akal. |
| **Kriteria gagal** | Tidak menemukan destinasi apa pun dalam batas waktu; hanya melihat daftar tanpa membuka detail; memilih acak tanpa alasan; menyerah karena hasil tidak berubah saat mempersempit |
| **Batas waktu maksimum** | 4 menit |
| **Titik observasi** | Apakah partisipan menyadari mempersempit hasil tidak mengubah daftar (**HYP-07**); apakah hasil kosong memunculkan jalan pemulihan (**HYP-20**); berapa kali ketukan pada hasil pencarian sebelum mengetik (**HYP-31**); salah ketuk pada filter berdesakan (**HYP-05**) |
| **HEART** | Task Success, Happiness, Engagement |
| **Instrumen** | Post-Task Form (SEQ), Observer Sheet, Think-Aloud |

### T2 — Menyimpan destinasi untuk ditinjau kembali
| Field | Isi |
| --- | --- |
| **ID** | T2 |
| **Segmen** | Wisatawan pemula |
| **Skenario kepada partisipan** | *"Dari hasil pencarian sebelumnya, Anda belum sepenuhnya yakin dan ingin menandai satu tempat agar bisa Anda lihat lagi nanti malam saat berdiskusi dengan teman. Tunjukkan bagaimana Anda menandainya, lalu tunjukkan cara Anda menemukannya kembali setelah itu."* |
| **Prasyarat / data uji** | Minimal satu destinasi dibuka pada task sebelumnya; tersedia jalur sementara menuju daftar tersimpan (lihat catatan fasilitator) |
| **Jalur ideal (moderator)** | Halaman destinasi → menandai untuk disimpan → berpindah ke area profil → membuka daftar tersimpan → memverifikasi item ada di sana |
| **Kriteria sukses** | (1) Menandai satu destinasi. (2) Menemukan kembali destinasi tersebut di daftar tersimpan. (3) Menyatakan item memang tersimpan. |
| **Kriteria gagal** | Tanda simpan tidak menghasilkan perubahan yang terlihat; tidak menemukan daftar tersimpan dan menyerah; menemukan daftar tetapi item yang ditandai **tidak ada** |
| **Batas waktu maksimum** | 3 menit |
| **Titik observasi** | Ketukan pada penanda simpan yang tidak merespons (**HYP-06**); jumlah ketukan berulang (rage tap); waktu mencari pintu masuk daftar tersimpan (**HYP-04**); apakah partisipan kehilangan item setelah menutup aplikasi (**HYP-03**) |
| **HEART** | Task Success, Happiness |
| **Instrumen** | Post-Task Form (SEQ), Observer Sheet |

### T3 — Menyiapkan perlengkapan pribadi
| Field | Isi |
| --- | --- |
| **ID** | T3 |
| **Segmen** | Wisatawan pemula |
| **Skenario kepada partisipan** | *"Anda akan berangkat minggu depan. Anda ingin membuat daftar sendiri berisi barang pribadi yang wajib Anda bawa — misalnya obat pribadi dan jaket cadangan — lalu menandai barang yang sudah Anda kemas. Tunjukkan bagaimana Anda melakukannya dan pastikan daftar itu benar-benar tersimpan."* |
| **Prasyarat / data uji** | Satu destinasi sudah dipilih pada T1; halaman persiapan dapat dijangkau dari halaman destinasi |
| **Jalur ideal (moderator)** | Halaman destinasi → daftar persiapan → menambahkan dua item baru → kembali ke daftar → memastikan kedua item muncul → menandai item sudah siap |
| **Kriteria sukses** | (1) Kedua item baru **terlihat di daftar**. (2) Status selesai berubah dan tetap tersimpan setelah berpindah layar. (3) Partisipan dapat menyatakan daftar sudah siap. |
| **Kriteria gagal** | Item baru tidak pernah muncul; status kembali seperti semula saat kembali ke layar; partisipan mengulang penambahan lebih dari dua kali; partisipan menyatakan berhasil padahal daftar tidak berubah |
| **Batas waktu maksimum** | 5 menit |
| **Titik observasi** | Apakah item baru muncul (**HYP-03**); kehilangan centang saat keluar-masuk layar (**HYP-03**); apakah pesan sukses sesuai kenyataan (**HYP-15**); pesan error yang tidak terlihat/kurang jelas (**HYP-17**); salah ketuk pada target kecil (**HYP-05**, **HYP-19**) |
| **HEART** | Task Success, Happiness, Engagement |
| **Instrumen** | Post-Task Form (SEQ), Observer Sheet, Think-Aloud |

### T4 — Menyusun rencana perjalanan dua hari untuk dua orang
| Field | Isi |
| --- | --- |
| **ID** | T4 |
| **Segmen** | *Semi-experienced backpacker* (persona: Rian Kusuma) |
| **Skenario kepada partisipan** | *"Anda akan mengajak satu teman mendaki selama dua hari dengan total anggaran sekitar Rp 2.000.000. Anda ingin menyusun rencana perjalanan yang bisa Anda lihat lagi kapan saja, lengkap dengan perkiraan biaya dan satu tempat menginap. Tunjukkan bagaimana Anda menyusun rencana itu dari awal sampai rencana tersebut benar-benar tersimpan dan bisa Anda buka kembali."* |
| **Prasyarat / data uji** | Akun aktif; tersedia jalur sementara menuju dan dari daftar rencana tersimpan; minimal 4 destinasi & 6 fasilitas di katalog |
| **Jalur ideal (moderator)** | Beranda → halaman destinasi → menyusun rencana → memilih destinasi → melengkapi nama/tanggal/jumlah orang/anggaran → menyimpan → membuka rencana → memeriksa fasilitas |
| **Kriteria sukses** | (1) Rencana dengan nama, tanggal, jumlah orang, dan anggaran terisi. (2) Rencana dapat dibuka kembali dengan data yang benar. (3) Partisipan menyatakan rencana siap dipakai. |
| **Kriteria gagal** | Rencana tidak tersimpan; data rencana tidak sesuai isian; pilihan destinasi/fasilitas tidak muncul; partisipan menyelesaikan task dengan mengandalkan bantuan moderator |
| **Batas waktu maksimum** | 6 menit |
| **Titik observasi** | Apakah pilihan yang dibuat muncul kembali (**HYP-09**); data tanggal/konteks tidak sesuai (**HYP-14**, **HYP-24**); penghapusan tak sengaja tanpa konfirmasi (**HYP-16**); overflow/tumpang tindih pada perangkat sempit (**HYP-26**); target kecil pada pengatur jumlah (**HYP-05**) |
| **HEART** | Task Success, Happiness, Adoption |
| **Instrumen** | Post-Task Form (SEQ), Observer Sheet, Think-Aloud |

### T5 — Memeriksa status usulan
| Field | Isi |
| --- | --- |
| **ID** | T5 |
| **Segmen** | *Semi-experienced backpacker* |
| **Skenario kepada partisipan** | *"Beberapa waktu lalu Anda mengirimkan usulan tempat menginap baru ke pengelola aplikasi. Sekarang Anda ingin mengetahui apakah usulan itu sudah ditindaklanjuti. Tunjukkan bagaimana Anda memeriksa status usulan tersebut dari aplikasi."* |
| **Prasyarat / data uji** | Terdapat satu usulan berstatus menunggu; fasilitator menyediakan jalur sementara (karena tidak ada pintu masuk alami) |
| **Jalur ideal (moderator)** | Beranda/Profil → daftar usulan → membaca status tiap usulan |
| **Kriteria sukses** | (1) Membuka daftar usulan. (2) Menyebutkan status usulan dengan benar. |
| **Kriteria gagal** | Tidak menemukan daftar usulan dalam batas waktu; salah menyebutkan status; meminta moderator menunjukkan lokasinya |
| **Batas waktu maksimum** | 3 menit |
| **Titik observasi** | Keberadaan jalur alami menuju daftar usulan (**HYP-04**); kejelasan status (**HYP-22**); ketukan pada item yang tampak bisa dibuka (**HYP-02**, **HYP-16**) |
| **HEART** | Task Success, Happiness |
| **Instrumen** | Post-Task Form (SEQ), Observer Sheet |

### T6 — Mendapatkan saran destinasi dari masukan pribadi
| Field | Isi |
| --- | --- |
| **ID** | T6 |
| **Segmen** | *Semi-experienced backpacker* |
| **Skenario kepada partisipan** | *"Anda ingin mendapatkan usulan tempat baru yang sesuai selera Anda. Anda tertarik pada suasana pegunungan, perjalanan santai dua hari, dan tidak ingin menghabiskan lebih dari Rp 1.000.000. Masukkan preferensi Anda, peroleh usulannya, lalu tandai satu usulan yang paling menarik untuk Anda."* |
| **Prasyarat / data uji** | Akun aktif; form preferensi dikosongkan terlebih dahulu oleh fasilitator (lihat catatan); daftar usulan tersedia |
| **Jalur ideal (moderator)** | Beranda → fitur saran → mengisi/mengubah preferensi → melihat hasil → menandai satu hasil |
| **Kriteria sukses** | (1) Masukan preferensi tersampaikan. (2) Hasil usulan tampil. (3) Satu usulan ditandai. (4) Partisipan dapat keluar dari alur tanpa menutup aplikasi. |
| **Kriteria gagal** | Tidak bisa keluar dari alur; hasil tidak muncul; penandaan tidak menghasilkan perubahan yang jelas; partisipan harus menutup aplikasi |
| **Batas waktu maksimum** | 5 menit |
| **Titik observasi** | Jalan buntu navigasi (**HYP-08**); chip yang tidak bisa dibatalkan (**HYP-08**); ketukan pada ringkasan preferensi yang tidak merespons (**HYP-06**); tidak ada indikator proses (**HYP-13**); dua jalur kirim yang membingungkan (**HYP-25**) |
| **HEART** | Task Success, Happiness, Adoption |
| **Instrumen** | Post-Task Form (SEQ), Observer Sheet, Think-Aloud |

### T7 — Mengubah pengaturan aplikasi
| Field | Isi |
| --- | --- |
| **ID** | T7 |
| **Segmen** | Wisatawan pemula |
| **Skenario kepada partisipan** | *"Anda ingin mengatur aplikasi ini agar lebih nyaman untuk Anda: Anda ingin mengubah tampilan tema, mengatur agar pemberitahuan tidak terlalu sering mengganggu, dan membaca bantuan tentang cara memakai aplikasi ini. Tunjukkan bagaimana Anda melakukan ketiganya."* |
| **Prasyarat / data uji** | Akun aktif; fasilitator menyediakan jalur sementara menuju area pengaturan (lihat catatan); opsi tema gelap & bahasa Inggris belum tersedia |
| **Jalur ideal (moderator)** | Profil → pengaturan → mengubah tampilan → membuka preferensi pemberitahuan → membuka bantuan |
| **Kriteria sukses** | (1) Membuka area pengaturan. (2) Menyelesaikan minimal 2 dari 3 tujuan. (3) Dapat kembali ke layar sebelumnya. |
| **Kriteria gagal** | Tidak menemukan area pengaturan; ketiga tujuan berakhir tanpa hasil; partisipan menyerah atau meminta moderator menunjukkan lokasinya |
| **Batas waktu maksimum** | 4 menit |
| **Titik observasi** | Menu ber-chevron yang berakhir tanpa navigasi (**HYP-02**); tidak adanya pintu masuk pengaturan (**HYP-04**); opsi tersimpan tapi tidak berlaku (**HYP-32**); sesi keluar yang tidak benar-benar keluar (**HYP-34**); validasi nonaktif tanpa alasan (**HYP-17**) |
| **HEART** | Task Success, Happiness |
| **Instrumen** | Post-Task Form (SEQ), Observer Sheet |

---

## 4. Catatan fasilitator (bukan dibacakan)

| No | Catatan |
| --- | --- |
| F-1 | **Jalur sementara wajib** untuk T2, T5, dan T7, karena daftar tersimpan, notifikasi, usulan, dan pengaturan tidak memiliki pintu masuk alami (**HYP-04**). Gunakan *deep link* atau build khusus; jangan mengubah kode produksi. |
| F-2 | **Kosongkan pra-pengisian** sebelum T4, T6, dan T3 (form rencana, preferensi, item checklist) agar partisipan benar-benar mengisi. Jika tidak memungkinkan, catat sebagai keterbatasan. |
| F-3 | Splash menahan ±1,6 detik; **jangan hitung** sebagai bagian waktu task. Mulai pengukuran saat layar konten pertama muncul. |
| F-4 | Sediakan **server API aktif** agar layar masuk tidak terjebak; jika tidak, gunakan akun tersimpan (sesi) agar sesi dimulai dari dalam aplikasi. |
| F-5 | Untuk T6, siapkan sesi **jaringan buruk** hanya jika ingin menguji HYP-13/HYP-27; jika tidak, jalankan pada jaringan normal dan tandai sebagai tidak diuji. |
| F-6 | Untuk HYP-12, jalankan sesi tambahan dengan **pembesaran teks sistem 1,3×–1,5×** pada minimal 2 partisipan. |
| F-7 | Batas waktu adalah *soft stop*: setelah lewat 30 detik dari batas, tanyakan apakah partisipan ingin melanjutkan atau menyerah; catat keputusannya. |

---

## 5. Naskah moderator

### 5.1 Pembuka (dibacakan)
> "Selamat datang dan terima kasih sudah bersedia meluangkan waktu. Nama saya
> [nama moderator]. Hari ini saya akan meminta Anda mencoba sebuah aplikasi
> bernama **Dolenae.id** — sebuah aplikasi untuk menemukan destinasi alam
> Indonesia dan mempersiapkan perjalanan ke sana.
>
> Yang perlu Anda ketahui: **yang diuji adalah aplikasinya, bukan Anda.** Tidak ada
> jawaban benar atau salah, dan tidak ada penilaian terhadap kemampuan Anda.
> Semua masukan Anda justru yang paling berharga bagi kami.
>
> Sesi ini akan berlangsung sekitar 60 menit. Saya akan meminta Anda menyelesaikan
> beberapa tugas sambil berbicara, lalu di akhir Anda akan mengisi beberapa
> kuesioner singkat.
>
> Sebelum kita mulai, saya bacakan lembar persetujuan."

### 5.2 Informed consent (dibacakan lalu ditandatangani)
> "Poin-poin persetujuan:
> 1. **Tujuan.** Kami ingin memahami kemudahan penggunaan aplikasi ini.
> 2. **Partisipasi sukarela.** Anda boleh berhenti kapan saja tanpa alasan dan
>    tanpa konsekuensi apa pun.
> 3. **Perekaman.** Layar dan suara Anda akan direkam untuk keperluan analisis.
>    Rekaman hanya diakses tim peneliti dan dihapus paling lambat 6 bulan setelah
>    laporan diserahkan.
> 4. **Kerahasiaan.** Identitas Anda diganti kode (misalnya P1). Data demografi
>    digunakan hanya untuk analisis kelompok.
> 5. **Tidak ada risiko berarti.** Sesi ini tidak berisi konten sensitif.
> 6. **Komunikasi.** Anda dapat menghubungi [kontak] bila ada pertanyaan setelah
>    sesi ini.
>
> Apakah Anda setuju untuk berpartisipasi dan direkam? Jika ya, mohon isi
> formulir persetujuan digital ini."

### 5.3 Instruksi think-aloud (dibacakan)
> "Selama mengerjakan tugas, saya ingin Anda **berbicara terus seperti sedang
> berpikir keras**. Contohnya: 'Saya mencari bagian untuk menyimpan ini…',
> 'Hmm, saya tidak melihat cara ke sana…', atau 'Oh, ternyata di sini.'
>
> Anda tidak perlu menjelaskan teorinya, cukup katakan apa yang Anda lihat, cari,
> dan rasakan. Jangan khawatir bila kalimatnya tidak rapi.
>
> Beberapa aturan penting:
> - Saya **tidak akan membantu** Anda menemukan sesuatu. Jika Anda bertanya, saya
>   hanya akan menjawab 'apa menurut Anda?'.
> - Jika Anda **benar-benar berhenti** lebih dari satu menit, saya akan bertanya
>   'apa yang sedang Anda pikirkan?' — itu bukan bantuan.
> - Tidak apa-apa jika tugasnya tidak selesai. Itu pun informasi berharga.
>
> Saya akan menyerahkan tugas satu per satu dalam bentuk kartu. Setelah setiap
> tugas, saya akan minta Anda mengisi satu pertanyaan singkat. Silakan mulai kapan
> pun Anda siap."

### 5.4 Selama sesi — aturan intervensi moderator
| Situasi | Respons moderator yang diizinkan |
| --- | --- |
| Partisipan diam > 60 detik | "Apa yang sedang Anda pikirkan?" |
| Partisipan bertanya "di mana tombolnya?" | "Menurut Anda, di mana kira-kira?" |
| Partisipan tampak frustrasi berat / minta berhenti | Hentikan task, tanyakan perasaan, lanjut ke task berikutnya |
| Partisipan salah paham terhadap tugas (bukan UI) | Ulangi skenario sekali, **catat sebagai klarifikasi** |
| Partisipan menemukan masalah teknis (aplikasi menutup, dsb.) | Catat, lanjutkan dari titik terakhir |

### 5.5 Penutup & debrief (dibacakan)
> "Terima kasih banyak, kita sudah selesai. Dua hal terakhir:
>
> Pertama, dari semua yang Anda coba tadi — **[sebutkan 2–3 task yang dikerjakan]** —
> bagian mana yang paling membuat Anda kesal atau bingung?
>
> Kedua, jika aplikasi ini ingin Anda rekomendasikan ke teman, hal apa yang harus
> diperbaiki lebih dulu?
>
> Setelah ini mohon isi tiga kuesioner terakhir: penilaian singkat setelah setiap
> tugas, satu kuesioner tentang pengalaman keseluruhan, dan satu lagi tentang
> kepuasan Anda. Rekaman akan kami hentikan setelah kuesioner selesai.
>
> Terima kasih sekali lagi — masukan Anda akan langsung dipakai untuk perbaikan
> versi berikutnya."

---

## 6. Lembar observer

### 6.1 Identitas sesi
| Field | Isi |
| --- | --- |
| Kode partisipan | P__ |
| Segmen | [ ] Pemula [ ] Semi-berpengalaman |
| Tanggal & waktu | |
| Perangkat / OS / ukuran layar | |
| Total durasi sesi | |
| Kondisi jaringan | [ ] Normal [ ] Lambat [ ] Offline |
| Pembesaran teks | [ ] 1,0× [ ] Lain: ____ |
| Observer / notulis | |

### 6.2 Tabel pencatatan per task
Isi satu baris per task. **Jangan** mencatat identitas nyata partisipan.

| Task | Hasil (S/G/B) | Bantuan (ya/tidak) | Waktu (mm:ss) | Jumlah error | Jumlah dead click | Jumlah back-step | Gesture ragu (mis. tap berulang, geser, mundur-maju) | Kutipan think-aloud | HYP terkonfirmasi | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | | | | | | | | | | |
| T2 | | | | | | | | | | |
| T3 | | | | | | | | | | |
| T4 | | | | | | | | | | |
| T5 | | | | | | | | | | |
| T6 | | | | | | | | | | |
| T7 | | | | | | | | | | |

**Keterangan kolom:**
- **Hasil:** `S` = sukses tanpa bantuan; `G` = sukses setelah dibantu; `B` = berhasil? tidak → gunakan `G` untuk dibantu dan `B` untuk benar-benar gagal/menyerah.
- **Jumlah error:** salah ketuk, salah pilih, salah input, atau langkah salah yang harus diperbaiki.
- **Jumlah dead click:** ketukan pada elemen yang tidak menghasilkan efek apa pun.
- **Jumlah back-step:** mundur untuk mengulang/meperbaiki langkah yang sudah dilakukan.
- **Gesture ragu:** ketukan berulang pada elemen sama (<2 detik), menggeser-geser tanpa tujuan, mengangkat jari tanpa menyentuh, menggulir naik-turun berulang.

### 6.3 Ringkasan kualitatif sesi
| Pertanyaan observer | Catatan |
| --- | --- |
| Momen paling menonjol (positif) | |
| Momen paling menonjol (negatif) | |
| Bagian yang paling sering memicu ketukan berulang | |
| Elemen yang paling sering dicari tetapi tidak ditemukan | |
| Apakah partisipan menyadari data yang tidak sesuai kenyataan? | |
| Apakah partisipan sempat menutup/meninggalkan aplikasi? Kapan? | |
| Intervensi moderator yang dilakukan | |
| Kondisi teknis yang mengganggu (crash, lag, layout rusak) | |
| Hipotesis baru yang muncul (belum ada di `02_hipotesis_bottleneck.md`) | |

### 6.4 Lembar heuristik cepat (diisi setelah sesi)
| Aspek | Baik | Cukup | Buruk | Bukti/kutipan |
| --- | --- | --- | --- | --- |
| Visibilitas status sistem (umpan balik aksi) | | | | |
| Kesesuaian dengan dunia nyata (istilah pengguna) | | | | |
| Kebebasan & kendali pengguna (batal, kembali) | | | | |
| Konsistensi & standar | | | | |
| Pencegahan error | | | | |
| Pengenalan daripada mengingat | | | | |
| Efisiensi penggunaan | | | | |
| Estetika & desain minimalis | | | | |
| Pemulihan dari error | | | | |
| Bantuan & dokumentasi | | | | |
| Ukuran target sentuh & jarak antar-elemen | | | | |
| Aksesibilitas (label, kontras, pembesaran teks) | | | | |

---

## 7. Pemetaan task → instrumen

| Instrumen | Kapan diberikan | Task terkait |
| --- | --- | --- |
| Form 1 — Screening & Consent | Sebelum sesi | semua |
| Form 2 — Post-Task (SEQ per task) | Setelah setiap task | T1 … T7 |
| Form 3 — SUS | Setelah seluruh task | semua |
| Form 4 — Post-Test Happiness | Akhir sesi | semua |
| Form 5 — Observer Sheet | Sepanjang sesi | T1 … T7 |
