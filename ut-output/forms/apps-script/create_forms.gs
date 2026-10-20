/**
 * Dolenae.id — Generator Google Forms untuk Usability Testing
 * ============================================================
 *
 * Skrip ini MEMBUAT OTOMATIS kelima formulir UT yang dispesifikasikan pada folder
 * `forms/`. Skrip ini TIDAK menyentuh kode aplikasi (apps/mobile) — hanya bekerja di
 * Google Apps Script.
 *
 * CARA PAKAI
 * ----------
 * 1. Buka https://script.google.com → New project.
 * 2. Tempelkan seluruh isi berkas ini ke Code.gs.
 * 3. (Opsional) ubah CFG di bawah sesuai kebutuhan.
 * 4. Jalankan fungsi `createAllForms()`.
 * 5. Izinkan akses saat diminta (scope: Forms).
 * 6. Buka View → Logs untuk melihat tautan kelima formulir.
 *
 * CATATAN
 * -------
 * - Setiap form dibuat mandiri (bukan satu form raksasa) agar mudah dipakai.
 * - Form 2 (post-task) dibuat DENGAN 7 bagian task; tiap bagian berisi pertanyaan
 *   identik (sesuai spesifikasi).
 * - Form 3 (SUS) berisi TEPAT 10 pernyataan dengan polaritas ganjil-positif /
 *   genap-negatif.
 * - Form 5 (observer) dibuat dengan 7 bagian task + bagian penutup + heuristik.
 *
 * @author Tim Dolenae.id
 */

var CFG = {
  APP_NAME: 'Dolenae.id',
  STUDY_NAME: 'Usability Testing Aplikasi Mobile',
  PARTICIPANT_CODES: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'],
  TASK_CODES: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  CONTACT: '[ISI NAMA & KONTAK PENELITI]',
  HYP_IDS: [
    'HYP-01', 'HYP-02', 'HYP-03', 'HYP-04', 'HYP-05', 'HYP-06', 'HYP-07', 'HYP-08',
    'HYP-09', 'HYP-10', 'HYP-11', 'HYP-12', 'HYP-13', 'HYP-14', 'HYP-15', 'HYP-16',
    'HYP-17', 'HYP-18', 'HYP-19', 'HYP-20', 'HYP-21', 'HYP-22', 'HYP-23', 'HYP-24',
    'HYP-25', 'HYP-26', 'HYP-27', 'HYP-28', 'HYP-29', 'HYP-30', 'HYP-31', 'HYP-32',
    'HYP-33', 'HYP-34'
  ]
};

/* ============================================================
 * UTILITAS
 * ============================================================ */

function setupForm_(form) {
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setShuffleQuestions(false);
  return form;
}

function mcItem_(form, title, choices, required, help) {
  var item = form.addMultipleChoiceItem();
  item.setTitle(title).setChoiceValues(choices).setRequired(!!required);
  if (help) item.setHelpText(help);
  return item;
}

function scaleItem_(form, title, low, high, lowLabel, highLabel, required) {
  var item = form.addScaleItem();
  item.setTitle(title)
      .setBounds(low, high)
      .setLabels(lowLabel, highLabel)
      .setRequired(!!required);
  return item;
}

function textItem_(form, title, required, help) {
  var item = form.addTextItem().setTitle(title).setRequired(!!required);
  if (help) item.setHelpText(help);
  return item;
}

function paraItem_(form, title, required) {
  return form.addParagraphTextItem().setTitle(title).setRequired(!!required);
}

function checkboxItem_(form, title, choices, required) {
  return form.addCheckboxItem().setTitle(title).setChoiceValues(choices).setRequired(!!required);
}

function dropdownItem_(form, title, choices, required) {
  return form.addListItem().setTitle(title).setChoiceValues(choices).setRequired(!!required);
}

function dateItem_(form, title, required) {
  return form.addDateItem().setTitle(title).setRequired(!!required);
}

function timeItem_(form, title, required) {
  return form.addTimeItem ? form.addTimeItem().setTitle(title).setRequired(!!required) : null;
}

function section_(form, title, help) {
  var item = form.addSectionHeaderItem().setTitle(title);
  if (help) item.setHelpText(help);
}

function pageBreak_(form, title, help) {
  var pb = form.addPageBreakItem().setTitle(title);
  if (help) pb.setHelpText(help);
  return pb;
}

function logLink_(label, form) {
  Logger.log('%s → %s', label, form.getPublishedUrl());
  Logger.log('%s (edit) → %s', label, form.getEditUrl());
}

/* ============================================================
 * FORM 1 — SCREENING & CONSENT
 * ============================================================ */

function createForm1_() {
  var form = setupForm_(FormApp.create(CFG.APP_NAME + ' — Form 1: Screening & Persetujuan'));
  form.setDescription(
    'Terima kasih atas kesediaan Anda. Formulir ini memastikan kesesuaian ' +
    'partisipan dan memperoleh persetujuan Anda. Sekitar 3 menit.'
  );

  // Bagian A — Consent
  pageBreak_(form, 'Bagian A — Lembar Persetujuan',
    'Kami mengundang Anda berpartisipasi dalam sesi uji kegunaan ' + CFG.APP_NAME +
    '. Tujuan: memahami kemudahan penggunaan aplikasi. Partisipasi sukarela — Anda ' +
    'boleh berhenti kapan saja. Layar & suara direkam untuk analisis dan dihapus ' +
    'maksimal 6 bulan. Identitas Anda diganti kode. Durasi ±60 menit. Tidak ada ' +
    'risiko berarti. Kontak: ' + CFG.CONTACT + '.'
  );
  mcItem_(form, 'A1. Saya telah membaca dan memahami informasi di atas.', ['Ya', 'Tidak'], true);
  mcItem_(form, 'A2. Saya menyetujui untuk berpartisipasi dalam sesi ini.', ['Ya, saya setuju', 'Tidak'], true);
  mcItem_(form, 'A3. Saya menyetujui sesi ini direkam (layar dan suara).', ['Ya, saya setuju', 'Tidak'], true);
  mcItem_(form, 'A4. Saya memahami bahwa saya dapat berhenti kapan saja tanpa konsekuensi.', ['Ya', 'Tidak'], true);
  dateItem_(form, 'A5. Tanggal persetujuan', true);
  textItem_(form, 'A6. Nama lengkap (sebagai tanda persetujuan)', true);

  // Bagian B — Kelayakan
  pageBreak_(form, 'Bagian B — Kriteria Kelayakan',
    'Beberapa pertanyaan singkat untuk memastikan kesesuaian.');
  dropdownItem_(form, 'B1. Berapa usia Anda saat ini?',
    ['15–17', '18–24', '25–30', '31–35', '36–45', '>45'], true);
  textItem_(form, 'B2. Di kota/kabupaten mana Anda berdomisili saat ini?', true);
  mcItem_(form, 'B3. Dalam 12 bulan terakhir, berapa kali Anda mengunjungi destinasi alam (gunung, bukit, air terjun, danau, camping)?',
    ['Tidak pernah', '1–2 kali', '3–5 kali', '>5 kali'], true);
  mcItem_(form, 'B4. Apakah Anda pernah atau sedang terlibat sebagai pengembang, desainer, atau peneliti pada produk ini?',
    ['Ya', 'Tidak'], true);
  mcItem_(form, 'B5. Apakah Anda bersedia mengikuti sesi ±60 menit pada jadwal yang disepakati?',
    ['Ya', 'Tidak'], true);

  // Bagian C — Demografi
  pageBreak_(form, 'Bagian C — Demografi', 'Digunakan hanya untuk analisis kelompok.');
  mcItem_(form, 'C1. Jenis kelamin', ['Laki-laki', 'Perempuan', 'Tidak ingin menyebutkan'], false);
  mcItem_(form, 'C2. Status saat ini', ['Pelajar/mahasiswa', 'Karyawan', 'Wirausaha', 'Lainnya'], false);
  dropdownItem_(form, 'C3. Rentang pengeluaran pribadi per bulan',
    ['< Rp 1.000.000', 'Rp 1.000.000–2.999.999', 'Rp 3.000.000–5.999.999', '≥ Rp 6.000.000', 'Tidak ingin menyebutkan'], false);

  // Bagian D — Pengalaman & perangkat
  pageBreak_(form, 'Bagian D — Pengalaman dan Perangkat',
    'Untuk memahami latar belakang penggunaan teknologi Anda.');
  scaleItem_(form, 'D1. Seberapa sering Anda menggunakan aplikasi mobile dalam sehari?', 1, 5, 'Sangat jarang', 'Sangat sering', true);
  mcItem_(form, 'D2. Berapa banyak aplikasi terkait perjalanan/wisata yang pernah Anda gunakan?',
    ['Belum pernah', '1', '2–3', 'Lebih dari 3'], true);
  paraItem_(form, 'D3. Sebutkan aplikasi perjalanan/wisata yang pernah Anda gunakan (jika ada)', false);
  paraItem_(form, 'D4. Dalam merencanakan perjalanan ke alam, apa yang biasanya paling menyulitkan bagi Anda?', false);
  mcItem_(form, 'D5. Jenis perangkat yang akan Anda pakai saat sesi', ['Android', 'iPhone'], true);
  textItem_(form, 'D6. Versi sistem operasi perangkat Anda', true);
  mcItem_(form, 'D7. Apakah Anda nyaman mengaktifkan tangkapan layar atau berbagi layar?', ['Ya', 'Tidak'], true);

  // Bagian E — Segmen
  pageBreak_(form, 'Bagian E — Penempatan Segmen',
    'Kami menempatkan Anda pada salah satu kelompok partisipan. Tidak ada jawaban benar atau salah.');
  scaleItem_(form, 'E1. Seberapa sering Anda mendaki atau berkemah dalam 2 tahun terakhir?', 1, 5, 'Belum pernah', 'Sangat sering', true);
  scaleItem_(form, 'E2. Seberapa percaya diri Anda menyiapkan perjalanan ke alam sendiri?', 1, 5, 'Tidak percaya diri', 'Sangat percaya diri', true);
  scaleItem_(form, 'E3. Seberapa sering Anda menggunakan aplikasi untuk menyusun rencana perjalanan?', 1, 5, 'Tidak pernah', 'Selalu', true);

  // Bagian F — Logistik
  pageBreak_(form, 'Bagian F — Logistik Sesi', 'Terakhir, pengaturan jadwal sesi.');
  mcItem_(form, 'F1. Preferensi waktu sesi', ['Pagi', 'Siang', 'Sore', 'Malam'], true);
  mcItem_(form, 'F2. Kesediaan hadir fisik', ['Bersedia', 'Hanya daring'], true);
  textItem_(form, 'F3. Nama atau inisial untuk dihubungi (akan diganti kode pada laporan)', true);
  textItem_(form, 'F4. Kontak yang dapat dihubungi (WhatsApp/email)', true);
  paraItem_(form, 'F5. Ada kebutuhan khusus yang perlu kami siapkan?', false);

  logLink_('FORM 1', form);
  return form;
}

/* ============================================================
 * FORM 2 — POST-TASK (7 BAGIAN)
 * ============================================================ */

function addPostTaskQuestions_(form, taskCode, scenario) {
  mcItem_(form, taskCode + '.Q1. Apakah Anda berhasil menyelesaikan tugas ini sesuai yang Anda inginkan?',
    ['Ya, berhasil sepenuhnya', 'Berhasil sebagian', 'Tidak berhasil'], true);
  scaleItem_(form, taskCode + '.Q2. Secara keseluruhan, seberapa mudah atau sulit tugas ini bagi Anda?',
    1, 7, 'Sangat sulit', 'Sangat mudah', true);
  scaleItem_(form, taskCode + '.Q3. Seberapa yakin Anda bahwa hasil pekerjaan Anda sudah benar dan tersimpan?',
    1, 5, 'Tidak yakin sama sekali', 'Sangat yakin', true);
  mcItem_(form, taskCode + '.Q4. Menurut perasaan Anda, tugas ini memakan waktu…',
    ['Lebih cepat dari yang saya bayangkan', 'Sesuai perkiraan saya', 'Lebih lama dari yang saya bayangkan'], true);
  paraItem_(form, taskCode + '.Q5. Bagian mana dari tugas ini yang paling menghambat Anda?', true);
  paraItem_(form, taskCode + '.Q6. Apakah ada hal yang membingungkan atau tidak sesuai harapan Anda?', false);
  mcItem_(form, taskCode + '.Q7. Apakah Anda perlu mengulang langkah yang sama berkali-kali?',
    ['Tidak', 'Ya, sekali', 'Ya, lebih dari satu kali'], true);
  mcItem_(form, taskCode + '.Q8. Apakah Anda percaya bahwa hasil tugas ini benar-benar tersimpan/diterapkan?',
    ['Ya, saya percaya', 'Tidak yakin', 'Tidak percaya'], true);
  mcItem_(form, taskCode + '.Q9. Apakah Anda membutuhkan arahan dari pendamping untuk menyelesaikan tugas ini?',
    ['Tidak, selesai sendiri', 'Ya, sedikit arahan', 'Ya, banyak arahan'], true);
  checkboxItem_(form, taskCode + '.Q10. Apa yang paling menggambarkan perasaan Anda saat mengerjakan tugas ini?',
    ['Tenang', 'Netral', 'Bingung', 'Kesal', 'Tertekan', 'Puas', 'Tertarik'], true);

  if (taskCode === 'T6' || taskCode === 'T7') {
    scaleItem_(form, taskCode + '.Q11. Jika Anda sempat menemui hambatan, seberapa mudah Anda berhasil melanjutkan tugas?',
      1, 5, 'Sangat sulit melanjutkan', 'Sangat mudah melanjutkan', false);
    scaleItem_(form, taskCode + '.Q12. Setelah mencoba tugas ini, apakah Anda ingin memakai bagian ini lagi di masa depan?',
      1, 5, 'Tidak ingin', 'Sangat ingin', false);
  }
}

function createForm2_() {
  var form = setupForm_(FormApp.create(CFG.APP_NAME + ' — Form 2: Penilaian Setiap Tugas'));
  form.setDescription(
    'Formulir ini diisi setelah Anda menyelesaikan setiap tugas. Tidak ada jawaban ' +
    'benar atau salah — kami ingin mengetahui pengalaman Anda sebenarnya.'
  );

  // Bagian identitas
  pageBreak_(form, 'Identitas Pengisian', 'Pastikan kode partisipan dan kode tugas sudah benar.');
  dropdownItem_(form, 'Kode partisipan', CFG.PARTICIPANT_CODES, true);
  mcItem_(form, 'Kode tugas yang baru selesai', CFG.TASK_CODES, true);

  var scenarios = {
    T1: 'Anda mencari satu tempat untuk pendakian akhir pekan pemula dengan anggaran terbatas.',
    T2: 'Anda menandai satu tempat agar dapat dilihat lagi nanti, lalu mencarinya kembali.',
    T3: 'Anda membuat daftar barang pribadi yang perlu dibawa dan menandai yang sudah siap.',
    T4: 'Anda menyusun rencana perjalanan dua hari untuk dua orang sampai rencana itu tersimpan.',
    T5: 'Anda ingin tahu apakah usulan tempat menginap yang pernah Anda kirim sudah ditindaklanjuti.',
    T6: 'Anda memasukkan preferensi pribadi untuk memperoleh usulan tempat, lalu menandai satu usulan.',
    T7: 'Anda mengubah pengaturan aplikasi sesuai kenyamanan Anda dan mencari bantuan pemakaian.'
  };
  var titles = {
    T1: 'Tugas 1 — Menemukan tempat',
    T2: 'Tugas 2 — Menandai dan menemukan kembali',
    T3: 'Tugas 3 — Menyiapkan perlengkapan pribadi',
    T4: 'Tugas 4 — Menyusun rencana perjalanan',
    T5: 'Tugas 5 — Memeriksa status usulan',
    T6: 'Tugas 6 — Mendapatkan saran tempat',
    T7: 'Tugas 7 — Mengatur aplikasi'
  };

  for (var i = 0; i < CFG.TASK_CODES.length; i++) {
    var t = CFG.TASK_CODES[i];
    pageBreak_(form, titles[t], scenarios[t]);
    addPostTaskQuestions_(form, t, scenarios[t]);
  }

  logLink_('FORM 2', form);
  return form;
}

/* ============================================================
 * FORM 3 — SUS (TEPAT 10 PERNYATAAN)
 * ============================================================ */

function createForm3_() {
  var form = setupForm_(FormApp.create(CFG.APP_NAME + ' — Form 3: Penilaian Pengalaman (SUS)'));
  form.setDescription(
    'Berikut adalah 10 pernyataan tentang aplikasi ' + CFG.APP_NAME + '. Untuk setiap ' +
    'pernyataan, pilih sejauh mana Anda setuju. Jawab berdasarkan pengalaman Anda ' +
    'hari ini. Tidak ada jawaban benar atau salah.'
  );

  pageBreak_(form, 'Identitas', '');
  dropdownItem_(form, 'Kode partisipan', CFG.PARTICIPANT_CODES, true);

  pageBreak_(form, '10 Pernyataan', 'Pilih satu nilai pada setiap baris.');

  // PERNYATAAN SUS — susunan baku: ganjil positif, genap negatif.
  // JANGAN mengubah urutan atau polaritas.
  var sus = [
    'S1. Saya ingin lebih sering menggunakan ' + CFG.APP_NAME + '.',            // positif
    'S2. Saya merasa ' + CFG.APP_NAME + ' terlalu rumit dan tidak perlu.',      // negatif
    'S3. Saya merasa ' + CFG.APP_NAME + ' mudah digunakan.',                    // positif
    'S4. Saya merasa membutuhkan bantuan orang teknis agar bisa memakai ' + CFG.APP_NAME + '.', // negatif
    'S5. Saya merasa bagian-bagian pada ' + CFG.APP_NAME + ' sudah berjalan dengan baik dan terpadu.', // positif
    'S6. Saya merasa ' + CFG.APP_NAME + ' terlalu banyak hal yang tidak konsisten.', // negatif
    'S7. Saya membayangkan sebagian besar pengguna akan cepat memahami ' + CFG.APP_NAME + '.', // positif
    'S8. Saya merasa ' + CFG.APP_NAME + ' sangat membingungkan saat digunakan.', // negatif
    'S9. Saya merasa percaya diri ketika menggunakan ' + CFG.APP_NAME + '.',     // positif
    'S10. Saya perlu belajar banyak hal sebelum bisa mulai menggunakan ' + CFG.APP_NAME + '.' // negatif
  ];
  for (var i = 0; i < sus.length; i++) {
    scaleItem_(form, sus[i], 1, 5, 'Sangat tidak setuju', 'Sangat setuju', true);
  }

  pageBreak_(form, 'Pertanyaan Tambahan (opsional)', 'Tidak dihitung dalam skor SUS.');
  scaleItem_(form, 'A1. Sejauh mana Anda setuju bahwa tampilan aplikasi ini menyenangkan secara visual?',
    1, 5, 'Sangat tidak setuju', 'Sangat setuju', false);
  scaleItem_(form, 'A2. Sejauh mana Anda setuju bahwa aplikasi ini cocok untuk perencanaan perjalanan alam?',
    1, 5, 'Sangat tidak setuju', 'Sangat setuju', false);
  paraItem_(form, 'A3. Menurut Anda, pernyataan mana yang paling tidak sesuai dengan pengalaman Anda?', false);

  logLink_('FORM 3', form);
  return form;
}

/* ============================================================
 * FORM 4 — POST-TEST HAPPINESS
 * ============================================================ */

function createForm4_() {
  var form = setupForm_(FormApp.create(CFG.APP_NAME + ' — Form 4: Penilaian Akhir'));
  form.setDescription(
    'Terima kasih telah menyelesaikan seluruh tugas. Beberapa pertanyaan terakhir ' +
    'untuk mengetahui pendapat Anda secara keseluruhan.'
  );

  pageBreak_(form, 'Identitas', '');
  dropdownItem_(form, 'Kode partisipan', CFG.PARTICIPANT_CODES, true);
  mcItem_(form, 'Segmen partisipan', ['A — Pemula', 'B — Semi-berpengalaman'], true);

  pageBreak_(form, 'Bagian 1 — Kepuasan Keseluruhan', '');
  scaleItem_(form, 'C1. Secara keseluruhan, seberapa puas Anda dengan aplikasi ini?', 1, 5, 'Sangat tidak puas', 'Sangat puas', true);
  scaleItem_(form, 'C2. Seberapa sesuai aplikasi ini dengan kebutuhan Anda saat merencanakan perjalanan ke alam?', 1, 5, 'Sangat tidak sesuai', 'Sangat sesuai', true);
  scaleItem_(form, 'C3. Seberapa mudah aplikasi ini dipakai tanpa bantuan siapa pun?', 1, 5, 'Sangat sulit', 'Sangat mudah', true);

  pageBreak_(form, 'Bagian 2 — Rekomendasi', '');
  scaleItem_(form, 'N1. Seberapa besar kemungkinan Anda merekomendasikan ' + CFG.APP_NAME + ' kepada teman yang ingin merencanakan perjalanan ke alam?', 0, 10, 'Sangat tidak mungkin', 'Sangat mungkin', true);
  paraItem_(form, 'N2. Apa alasan utama dari nilai yang Anda berikan?', true);

  pageBreak_(form, 'Bagian 3 — Kepercayaan terhadap Data dan Transaksi', '');
  scaleItem_(form, 'T1. Seberapa percaya Anda bahwa informasi tempat dan fasilitas yang ditampilkan akurat?', 1, 5, 'Tidak percaya sama sekali', 'Sangat percaya', true);
  scaleItem_(form, 'T2. Seberapa percaya Anda bahwa data pribadi dan konfirmasi Anda akan aman?', 1, 5, 'Tidak percaya sama sekali', 'Sangat percaya', true);
  scaleItem_(form, 'T3. Seberapa percaya Anda bahwa perubahan yang Anda lakukan benar-benar tersimpan?', 1, 5, 'Tidak percaya sama sekali', 'Sangat percaya', true);
  mcItem_(form, 'T4. Apakah ada momen ketika Anda merasa ragu terhadap informasi yang ditampilkan aplikasi?', ['Tidak ada', 'Ada, sekali', 'Ada, beberapa kali'], true);
  paraItem_(form, 'T5. Jika ada, pada bagian mana keraguan itu muncul?', false);

  pageBreak_(form, 'Bagian 4 — Persepsi Kecepatan dan Kestabilan', '');
  scaleItem_(form, 'S1. Seberapa cepat aplikasi ini merespons tindakan Anda?', 1, 5, 'Sangat lambat', 'Sangat cepat', true);
  mcItem_(form, 'S2. Apakah aplikasi pernah terasa berhenti merespons atau membeku?', ['Tidak pernah', 'Pernah, sebentar', 'Pernah, cukup lama'], true);
  mcItem_(form, 'S3. Apakah Anda pernah mengulang tindakan yang sama karena merasa tindakan sebelumnya tidak berhasil?', ['Tidak pernah', 'Pernah, sekali', 'Pernah, beberapa kali'], true);

  pageBreak_(form, 'Bagian 5 — Adopsi dan Niat Penggunaan', '');
  scaleItem_(form, 'AD1. Seberapa besar keinginan Anda memakai aplikasi ini saat benar-benar merencanakan perjalanan?', 1, 5, 'Tidak ingin', 'Sangat ingin', true);
  var adOpts = ['Menemukan tempat', 'Memahami kebutuhan perjalanan', 'Menyusun perlengkapan',
    'Menyusun rencana perjalanan', 'Mencari tempat menginap dan layanan sekitar',
    'Mendapatkan saran tempat', 'Menyimpan dan meninjau kembali'];
  checkboxItem_(form, 'AD2. Bagian mana yang menurut Anda paling bermanfaat untuk perjalanan Anda?', adOpts, true);
  checkboxItem_(form, 'AD3. Bagian mana yang menurut Anda paling tidak bermanfaat?', adOpts, false);
  scaleItem_(form, 'AD4. Apakah Anda merasa lebih siap berangkat setelah memakai aplikasi ini?', 1, 5, 'Tidak lebih siap', 'Jauh lebih siap', true);
  mcItem_(form, 'AD5. Apakah Anda akan membuka aplikasi ini lagi dalam 7 hari ke depan?', ['Ya, pasti', 'Mungkin', 'Tidak'], true);

  pageBreak_(form, 'Bagian 6 — Pendapat Kualitatif', '');
  paraItem_(form, 'K1. Apa hal yang paling Anda sukai dari aplikasi ini?', true);
  paraItem_(form, 'K2. Apa hal yang paling mengganggu Anda saat memakai aplikasi ini?', true);
  paraItem_(form, 'K3. Bagian mana yang menurut Anda paling membingungkan?', false);
  paraItem_(form, 'K4. Fitur apa yang Anda harapkan ada tetapi belum Anda temukan?', false);
  paraItem_(form, 'K5. Jika Anda boleh mengubah satu hal saja, apa yang Anda ubah dan mengapa?', true);
  paraItem_(form, 'K6. Saran perbaikan lain untuk aplikasi ini', false);

  logLink_('FORM 4', form);
  return form;
}

/* ============================================================
 * FORM 5 — OBSERVER SHEET
 * ============================================================ */

function addObserverTaskQuestions_(form, taskCode) {
  mcItem_(form, taskCode + '.1. Hasil task',
    ['Sukses tanpa bantuan', 'Sukses dengan bantuan', 'Gagal', 'Tidak dijalankan'], true);
  mcItem_(form, taskCode + '.2. Kategori kegagalan (jika gagal)',
    ['Penemuan (tidak ditemukan)', 'Pemahaman (salah paham)', 'Affordance (tidak merespons)',
     'Kesalahan data/konteks', 'Aksesibilitas', 'Menyerah karena waktu', 'Tidak relevan'], false);
  textItem_(form, taskCode + '.3. Waktu penyelesaian (mm:ss)', true);
  mcItem_(form, taskCode + '.4. Apakah batas waktu terlampaui?', ['Tidak', 'Ya'], true);
  textItem_(form, taskCode + '.5. Jumlah error (angka)', true);
  textItem_(form, taskCode + '.6. Jumlah dead click (angka)', true);
  textItem_(form, taskCode + '.7. Jumlah back-step (angka)', true);
  textItem_(form, taskCode + '.8. Jumlah rage tap (angka)', true);
  checkboxItem_(form, taskCode + '.9. Gesture ragu yang diamati',
    ['Mengetuk berulang', 'Menggulir bolak-balik', 'Menggeser tanpa tujuan',
     'Mengangkat jari tanpa mengetuk', 'Berhenti lama (>15 detik)', 'Tidak ada'], true);
  mcItem_(form, taskCode + '.10. Bantuan yang diberikan moderator',
    ['Tidak ada', 'Mengulang skenario', 'Mengarahkan lokasi', 'Menunjukkan langkah', 'Menghentikan task'], true);
  paraItem_(form, taskCode + '.11. Kutipan think-aloud (maks. 3, verbatim)', false);
  checkboxItem_(form, taskCode + '.12. Hipotesis yang terkonfirmasi/terbantah',
    CFG.HYP_IDS.concat(['Tidak ada']), false);
  paraItem_(form, taskCode + '.13. Catatan tambahan observer', false);
}

function createForm5_() {
  var form = setupForm_(FormApp.create(CFG.APP_NAME + ' — Form 5: Lembar Observer'));
  form.setDescription(
    'Diisi oleh OBSERVER/NOTULIS, bukan partisipan. Satu respons = satu partisipan.'
  );

  pageBreak_(form, 'Identitas Sesi', '');
  dropdownItem_(form, 'Kode partisipan', CFG.PARTICIPANT_CODES, true);
  mcItem_(form, 'Segmen', ['A — Pemula', 'B — Semi-berpengalaman'], true);
  textItem_(form, 'Nama observer', true);
  dateItem_(form, 'Tanggal sesi', true);
  textItem_(form, 'Waktu mulai sesi (HH:MM)', true);
  textItem_(form, 'Waktu selesai sesi (HH:MM)', true);
  mcItem_(form, 'Lokasi sesi', ['Tatap muka', 'Daring'], true);
  textItem_(form, 'Perangkat uji', true);
  textItem_(form, 'Ukuran layar (dp)', true);
  textItem_(form, 'Versi sistem operasi', true);
  dropdownItem_(form, 'Pembesaran teks perangkat', ['1,0×', '1,15×', '1,3×', '1,5×', 'Lainnya'], true);
  mcItem_(form, 'Kondisi jaringan', ['Normal', 'Lambat', 'Terputus'], true);
  textItem_(form, 'Build/versi aplikasi', true);
  mcItem_(form, 'Modalitas bantuan tersedia?', ['Tidak ada', 'Deep link sementara', 'Build khusus'], true);

  for (var i = 0; i < CFG.TASK_CODES.length; i++) {
    var t = CFG.TASK_CODES[i];
    pageBreak_(form, 'Task ' + t, '');
    addObserverTaskQuestions_(form, t);
  }

  pageBreak_(form, 'Ringkasan Sesi', '');
  paraItem_(form, 'R1. Momen paling menonjol (positif)', true);
  paraItem_(form, 'R2. Momen paling menonjol (negatif)', true);
  paraItem_(form, 'R3. Elemen yang paling sering dicari tetapi tidak ditemukan', false);
  paraItem_(form, 'R4. Bagian yang paling sering memicu ketukan berulang', false);
  mcItem_(form, 'R5. Apakah partisipan menyadari data yang tidak sesuai kenyataan?',
    ['Tidak', 'Ya, menyadari', 'Ya, dan terganggu'], true);
  mcItem_(form, 'R6. Apakah partisipan menutup/meninggalkan aplikasi?', ['Tidak', 'Ya'], true);
  textItem_(form, 'R7. Jumlah intervensi moderator total', true);
  paraItem_(form, 'R8. Gangguan teknis (crash, lag, tata letak rusak)', false);
  paraItem_(form, 'R9. Hipotesis baru yang belum ada di daftar', false);
  textItem_(form, 'R10. Cuplikan layar/rekaman terkait (ID berkas)', false);

  pageBreak_(form, 'Penilaian Heuristik Cepat', '1 = buruk, 2 = cukup, 3 = baik.');
  var heur = [
    ['H1', 'Umpan balik status sistem (apakah aksi terlihat berhasil)'],
    ['H2', 'Kesesuaian istilah dengan bahasa pengguna'],
    ['H3', 'Kebebasan dan kendali pengguna (batal, kembali, urungkan)'],
    ['H4', 'Konsistensi dan standar antarmuka'],
    ['H5', 'Pencegahan error'],
    ['H6', 'Pengenalan daripada mengingat'],
    ['H7', 'Efisiensi penggunaan'],
    ['H8', 'Estetika dan kesederhanaan tampilan'],
    ['H9', 'Pemulihan dari error'],
    ['H10', 'Ukuran target sentuh dan jarak antar-elemen'],
    ['H11', 'Aksesibilitas (label, kontras, pembesaran teks)'],
    ['H12', 'Kepercayaan terhadap data yang ditampilkan']
  ];
  for (var j = 0; j < heur.length; j++) {
    scaleItem_(form, heur[j][0] + '. ' + heur[j][1], 1, 3, 'Buruk', 'Baik', true);
  }

  logLink_('FORM 5', form);
  return form;
}

/* ============================================================
 * ENTRY POINT
 * ============================================================ */

/**
 * Membuat kelima formulir sekaligus dan mencatat tautannya di Logs.
 */
function createAllForms() {
  Logger.log('=== Membuat formulir UT %s ===', CFG.APP_NAME);
  var f1 = createForm1_();
  var f2 = createForm2_();
  var f3 = createForm3_();
  var f4 = createForm4_();
  var f5 = createForm5_();
  Logger.log('=== Selesai. 5 formulir dibuat. ===');
  return {
    form1: f1.getPublishedUrl(),
    form2: f2.getPublishedUrl(),
    form3: f3.getPublishedUrl(),
    form4: f4.getPublishedUrl(),
    form5: f5.getPublishedUrl()
  };
}

/** Hapus fungsi di bawah bila tidak diperlukan. */
function createOnlyForm3SUS() {
  return createForm3_().getPublishedUrl();
}
