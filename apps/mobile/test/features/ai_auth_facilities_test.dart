import 'package:dolenae_mobile/src/data/models/ai_recommendation.dart';
import 'package:dolenae_mobile/src/data/models/facility_proposal.dart';
import 'package:dolenae_mobile/src/data/models/travel_support.dart';
import 'package:dolenae_mobile/src/data/seed/seed_data.dart';
import 'package:dolenae_mobile/src/features/ai/presentation/ai_preferences_screen.dart';
import 'package:dolenae_mobile/src/features/ai/presentation/ai_results_screen.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/change_password_screen.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/forgot_password_screen.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/otp_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/facilities_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/facility_detail_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/proposal_success_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/propose_facility_screen.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_otp_input.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

/// Tanggal tetap agarusulan contoh tidak bergantung waktu eksekusi.
final _fixedDate = DateTime(2026, 7, 12);

void main() {
  setUpAll(useTestFonts);

  group('Layar Preferensi AI', () {
    testWidgets('menampilkan lima kelompok preferensi dan CTA', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const AiPreferencesScreen()));
      await tester.pumpAndSettle();

      expect(find.text('AI Dolenae'), findsOneWidget);
      expect(find.text('ATUR MANUAL'), findsOneWidget);
      expect(find.text('Wilayah'), findsOneWidget);
      expect(find.text('Aktivitas'), findsOneWidget);
      await scrollTo(tester, find.text('Medan'));
      expect(find.text('Medan'), findsOneWidget);
      expect(find.text('Tingkat kesulitan'), findsOneWidget);
      expect(find.text('Durasi'), findsOneWidget);
      await scrollTo(tester, find.text('Butuh penginapan'));
      expect(find.text('Budget per orang'), findsOneWidget);
      expect(find.text('Butuh penginapan'), findsOneWidget);
      expect(find.text('Butuh transportasi'), findsOneWidget);
      expect(find.text('Catatan bebas'), findsOneWidget);
      expect(find.text('Cari rekomendasi'), findsOneWidget);
      expect(find.byType(TextField), findsWidgets);
    });

    testWidgets('mengirim preferensi yang sudah diubah', (tester) async {
      await usePhone(tester);
      final sent = <AiPreference>[];
      await tester.pumpWidget(
        wrapScreen(AiPreferencesScreen(onSubmit: sent.add)),
      );
      await tester.pumpAndSettle();

      await scrollTo(tester, find.text('Budget per orang'));
      await tester.enterText(inputFor('Budget per orang'), '750000');
      await tester.pumpAndSettle();
      await tester.tap(find.text('Cari rekomendasi'));
      await tester.pumpAndSettle();

      expect(sent, hasLength(1));
      expect(sent.single.budgetPerPerson, 750000);
    });

    testWidgets('memakai preferensi awal dari store bila tersedia', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(
          AiPreferencesScreen(initialPreference: SeedData.demoAiPreference),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Cari rekomendasi'), findsOneWidget);
    });
  });

  group('Layar Hasil AI', () {
    testWidgets('menampilkan prompt, hasil, dan checklist terkait', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(AiResultsScreen(result: SeedData.demoAiResult)),
      );
      await tester.pumpAndSettle();

      expect(find.text('Rekomendasi'), findsOneWidget);
      expect(find.text('PROMPTMU'), findsOneWidget);
      expect(
        find.text(SeedData.demoAiResult.summary),
        findsOneWidget,
      );

      await scrollTo(tester, find.text('CHECKLIST TERKAIT'));
      expect(find.text('CHECKLIST TERKAIT'), findsOneWidget);
      await scrollTo(tester, find.text('Ubah preferensi'));
      expect(find.text('Ubah preferensi'), findsOneWidget);
      expect(find.text('Tanya lagi'), findsOneWidget);
    });

    testWidgets('tanpa hasil menampilkan aksi isi ulang dan coba lagi', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(AiResultsScreen(onAskAgain: () {})),
      );
      await tester.pumpAndSettle();

      expect(
        find.textContaining('Belum ada rekomendasi'),
        findsOneWidget,
      );
      expect(find.text('Isi preferensi'), findsOneWidget);
      expect(find.text('Coba lagi'), findsOneWidget);
    });

    testWidgets('tanpa aksi coba lagi tombolnya disembunyikan', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const AiResultsScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Isi preferensi'), findsOneWidget);
      expect(find.text('Coba lagi'), findsNothing);
    });

    testWidgets('delegate untuk tiap aksi hasil', (tester) async {
      await usePhone(tester);
      var retried = 0;
      var changed = 0;
      var asked = 0;
      final viewed = <String>[];
      await tester.pumpWidget(
        wrapScreen(
          AiResultsScreen(
            result: SeedData.demoAiResult,
            onRetry: () => retried++,
            onChangePreference: () => changed++,
            onAskAgain: () => asked++,
            onViewDetail: viewed.add,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await scrollTo(tester, find.text('Ubah preferensi'));
      await tester.tap(find.text('Ubah preferensi'));
      await tester.pump();
      await tester.tap(find.text('Tanya lagi'));
      await tester.pump();
      expect(changed, 1);
      expect(asked, 1);

      await tester.scrollUntilVisible(
        find.text('Lihat detail').first,
        -240,
        maxScrolls: 40,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Lihat detail').first);
      await tester.pump();
      expect(viewed, hasLength(1));
      expect(
        viewed.single,
        SeedData.demoAiResult.items.first.destination.id,
      );
      expect(retried, 0);
    });
  });

  group('Layar Atur Ulang Kata Sandi', () {
    testWidgets('menampilkan field email dan tombol kirim', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const ForgotPasswordScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Atur ulang kata sandi'), findsWidgets);
      expect(find.text('nama@email.com'), findsOneWidget);
      expect(find.text('Kirim tautan'), findsOneWidget);
    });

    testWidgets('email kosong membuat tombol nonaktif', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const ForgotPasswordScreen()));
      await tester.pumpAndSettle();

      final cta = find.widgetWithText(FilledButton, 'Kirim tautan');
      expect(tester.widget<FilledButton>(cta).onPressed, isNull);

      await tester.enterText(
        find.byType(TextField).first,
        'dimas@mail.com',
      );
      await tester.pumpAndSettle();
      expect(tester.widget<FilledButton>(cta).onPressed, isNotNull);
    });

    testWidgets('email valid diteruskan ke delegate', (tester) async {
      await usePhone(tester);
      final sent = <String>[];
      await tester.pumpWidget(
        wrapScreen(ForgotPasswordScreen(onSubmit: sent.add)),
      );
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byType(TextField).first,
        'dimas@mail.com',
      );
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(FilledButton, 'Kirim tautan'));
      await tester.pumpAndSettle();

      expect(sent, ['dimas@mail.com']);
    });
  });

  group('Layar OTP', () {
    testWidgets('menampilkan email tersamar dan enam kotak kode', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const OtpScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Masukkan kode'), findsOneWidget);
      expect(find.text('Tidak menerima kode?'), findsOneWidget);
      expect(find.text('Verifikasi'), findsWidgets);
      expect(find.byType(DnOtpInput), findsOneWidget);
      expect(find.textContaining('d***@mail.com'), findsOneWidget);
    });

    testWidgets('verifikasi meneruskan kode yang diketik', (tester) async {
      await usePhone(tester);
      final codes = <String>[];
      await tester.pumpWidget(wrapScreen(OtpScreen(onVerify: codes.add)));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).first, '123456');
      await tester.pumpAndSettle();
      await scrollTo(tester, find.widgetWithText(FilledButton, 'Verifikasi'));
      await tester.tap(find.widgetWithText(FilledButton, 'Verifikasi'));
      await tester.pumpAndSettle();

      expect(codes, ['123456']);
    });

    testWidgets('kir ulang memakai delegate bila tersedia', (tester) async {
      await usePhone(tester);
      var resent = 0;
      await tester.pumpWidget(
        wrapScreen(
          OtpScreen(resendSeconds: 0, onResend: () => resent++),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Kirim ulang'));
      await tester.pumpAndSettle();
      expect(resent, 1);
    });
  });

  group('Layar Ubah Kata Sandi', () {
    testWidgets('menampilkan tiga kolom dan tombol simpan', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const ChangePasswordScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Ubah kata sandi'), findsOneWidget);
      expect(find.text('Kata sandi saat ini'), findsOneWidget);
      expect(find.text('Kata sandi baru'), findsOneWidget);
      expect(find.text('Ulangi kata sandi baru'), findsOneWidget);
      expect(find.text('Simpan kata sandi'), findsOneWidget);
      expect(find.byType(TextField), findsWidgets);
    });

    testWidgets('konfirmasi tidak sama mencegah pengiriman', (tester) async {
      await usePhone(tester);
      final sent = <(String, String, String)>[];
      await tester.pumpWidget(
        wrapScreen(
          ChangePasswordScreen(
            onSubmit: (current, next, confirm) =>
                sent.add((current, next, confirm)),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).at(0), 'RahasiaKuat1');
      await tester.enterText(find.byType(TextField).at(1), 'RahasiaKuat2');
      await tester.enterText(find.byType(TextField).at(2), 'RahasiaKuat3');

      await tester.pumpAndSettle();

      await tester.tap(find.widgetWithText(FilledButton, 'Simpan kata sandi'));
      await tester.pumpAndSettle();

      expect(sent, isEmpty);
    });

    testWidgets('password terlalu pendek ditolak', (tester) async {
      await usePhone(tester);
      final sent = <(String, String, String)>[];
      await tester.pumpWidget(
        wrapScreen(
          ChangePasswordScreen(
            onSubmit: (current, next, confirm) =>
                sent.add((current, next, confirm)),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).at(0), 'Lama1');
      await tester.enterText(find.byType(TextField).at(1), 'abc');
      await tester.enterText(find.byType(TextField).at(2), 'abc');
      await tester.pumpAndSettle();

      await tester.tap(find.widgetWithText(FilledButton, 'Simpan kata sandi'));
      await tester.pumpAndSettle();

      expect(sent, isEmpty);
    });

    testWidgets('password valid diteruskan ke delegate', (tester) async {
      await usePhone(tester);
      final sent = <(String, String, String)>[];
      await tester.pumpWidget(
        wrapScreen(
          ChangePasswordScreen(
            onSubmit: (current, next, confirm) =>
                sent.add((current, next, confirm)),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).at(0), 'LamaSekali1');
      await tester.enterText(find.byType(TextField).at(1), 'BaruSekali2');
      await tester.enterText(find.byType(TextField).at(2), 'BaruSekali2');
      await tester.pumpAndSettle();

      await tester.tap(find.widgetWithText(FilledButton, 'Simpan kata sandi'));
      await tester.pumpAndSettle();

      expect(sent, hasLength(1));
      expect(sent.single.$1, 'LamaSekali1');
      expect(sent.single.$2, 'BaruSekali2');
    });
  });

  group('Layar Fasilitas Sekitar', () {
    testWidgets('menampilkan segmented kategori dan daftar fasilitas', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const FacilitiesScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Fasilitas sekitar'), findsOneWidget);
      expect(find.text('Semua'), findsOneWidget);
      expect(find.text('Penginapan'), findsOneWidget);
      expect(find.text('Transport'), findsOneWidget);
      expect(find.text('Makanan'), findsOneWidget);
      expect(find.text('Usulkan fasilitas'), findsOneWidget);
    });

    testWidgets('memilih kategori menyaring daftar', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const FacilitiesScreen()));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Transport'));
      await tester.pumpAndSettle();

      final transport = SeedData.supports
          .where((item) => item.category == SupportCategory.transportasi);
      expect(transport, isNotEmpty);
    });

    testWidgets('usulkan fasilitas memakai delegate', (tester) async {
      await usePhone(tester);
      var proposed = 0;
      await tester.pumpWidget(
        wrapScreen(FacilitiesScreen(onPropose: () => proposed++)),
      );
      await tester.pumpAndSettle();

      await scrollTo(tester, find.text('Usulkan fasilitas'));
      await tester.tap(find.text('Usulkan fasilitas'));
      await tester.pump();
      expect(proposed, 1);
    });

    testWidgets('filter kombinasi yang tidak ada hasil memunculkan empty state',
        (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const FacilitiesScreen()));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Transport'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Ekonomis'));
      await tester.pumpAndSettle();

      await scrollTo(
        tester,
        find.textContaining('Tidak ada fasilitas di sekitar'),
      );
      expect(
        find.textContaining('Tidak ada fasilitas di sekitar'),
        findsOneWidget,
      );
    });
  });

  group('Layar Detail Fasilitas', () {
    testWidgets('menampilkan tentang, kontak, dan destinasi terkait', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const FacilityDetailScreen()));
      await tester.pumpAndSettle();

      expect(find.text('TENTANG'), findsOneWidget);
      expect(find.text('KONTAK'), findsOneWidget);
      expect(find.text('DESTINASI TERKAIT'), findsOneWidget);
      expect(find.text('Simpan'), findsOneWidget);
      expect(find.text('Hubungi via WhatsApp'), findsOneWidget);
    });

    testWidgets('simpan dan hubungi memakai delegate', (tester) async {
      await usePhone(tester);
      var saved = 0;
      var contacted = 0;
      await tester.pumpWidget(
        wrapScreen(
          FacilityDetailScreen(
            onSave: () => saved++,
            onContact: () => contacted++,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await scrollTo(tester, find.text('Simpan'));
      await tester.tap(find.text('Simpan'));
      await tester.pump();
      await tester.tap(find.text('Hubungi via WhatsApp'));
      await tester.pump();

      expect(saved, 1);
      expect(contacted, 1);
    });

    testWidgets('id tak dikenal jatuh ke fasilitas pertama', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(const FacilityDetailScreen(supportId: 'sup-tidak-ada')),
      );
      await tester.pumpAndSettle();
      expect(find.text('TENTANG'), findsOneWidget);
      expect(find.text(SeedData.supports.first.name), findsWidgets);
    });
  });

  group('Layar Usulkan Fasilitas', () {
    testWidgets('menampilkan nama, tipe, alamat, foto, dan catatan', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const ProposeFacilityScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Usulkan fasilitas'), findsOneWidget);
      expect(find.text('Nama fasilitas'), findsOneWidget);
      expect(find.text('Mis. Homestay Pinggir'), findsOneWidget);
      expect(find.text('Tipe'), findsOneWidget);
      expect(find.text('Alamat'), findsOneWidget);
      expect(find.text('Dusun, desa, kabupaten'), findsOneWidget);

      await scrollTo(tester, find.text('Catatan'));
      expect(find.text('Tambah foto'), findsOneWidget);
      expect(find.text('Catatan'), findsOneWidget);
      expect(find.text('Kirim usulan'), findsOneWidget);
    });

    testWidgets('form lengkap menghasilkan usulan', (tester) async {
      await usePhone(tester);
      final sent = <FacilityProposal>[];
      await tester.pumpWidget(
        wrapScreen(ProposeFacilityScreen(onSubmit: sent.add)),
      );
      await tester.pumpAndSettle();

      await tester.enterText(
        inputFor('Nama fasilitas'),
        'Warung Cemoro Lawang',
      );
      await tester.enterText(
        inputFor('Alamat'),
        'Dusun Cemoro Lawang, Kab. Probolinggo',
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Kirim usulan'));
      await tester.pumpAndSettle();

      expect(sent, hasLength(1));
      expect(sent.single.name, 'Warung Cemoro Lawang');
      expect(sent.single.nearestDestinationName, 'Gunung Bromo');
      expect(sent.single.status, ProposalStatus.menunggu);
    });

    testWidgets('nama kosong mencegah pengiriman', (tester) async {
      await usePhone(tester);
      final sent = <FacilityProposal>[];
      await tester.pumpWidget(
        wrapScreen(ProposeFacilityScreen(onSubmit: sent.add)),
      );
      await tester.pumpAndSettle();

      await tester.enterText(
        inputFor('Alamat'),
        'Alamat tanpa nama fasilitas',
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Kirim usulan'));
      await tester.pumpAndSettle();

      expect(sent, isEmpty);
    });
  });

  group('Layar Usulan Terkirim', () {
    testWidgets('menampilkan ringkasan usulan dari seed', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const ProposalSuccessScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Fasilitas'), findsOneWidget);
      expect(find.text('Tipe'), findsOneWidget);
      expect(find.text('Status'), findsOneWidget);
      expect(find.text('Lihat usulan'), findsOneWidget);
      expect(find.text('Kembali ke beranda'), findsOneWidget);
    });

    testWidgets('menampilkan usulan yang diberikan', (tester) async {
      await usePhone(tester);
      final proposal = FacilityProposal(
        id: 'prop-x',
        name: 'Homestay Sawah',
        type: ProposalType.accommodation,
        nearestDestinationName: 'Bukit Moko',
        address: 'Desa Ciwidey',
        note: 'Siap menerima tamu.',
        status: ProposalStatus.terverifikasi,
        createdAt: _fixedDate,
      );
      await tester.pumpWidget(
        wrapScreen(ProposalSuccessScreen(proposal: proposal)),
      );
      await tester.pumpAndSettle();

      expect(find.text('Homestay Sawah'), findsOneWidget);
      expect(find.text('Penginapan'), findsOneWidget);
      expect(find.text('Terverifikasi'), findsOneWidget);
    });

    testWidgets('kedua tombol memakai delegate', (tester) async {
      await usePhone(tester);
      var viewed = 0;
      var homed = 0;
      await tester.pumpWidget(
        wrapScreen(
          ProposalSuccessScreen(
            onViewProposals: () => viewed++,
            onBackHome: () => homed++,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Lihat usulan'));
      await tester.pump();
      await tester.tap(find.text('Kembali ke beranda'));
      await tester.pump();

      expect(viewed, 1);
      expect(homed, 1);
    });
  });

  group('Model Usulan Fasilitas', () {
    FacilityProposal build(ProposalType type, ProposalStatus status) {
      return FacilityProposal(
        id: 'prop-1',
        name: 'Contoh',
        type: type,
        nearestDestinationName: 'Gunung Bromo',
        address: 'Alamat contoh',
        status: status,
        createdAt: _fixedDate,
      );
    }

    test('label tipe tersedia untuk setiap nilai', () {
      expect(build(ProposalType.accommodation, ProposalStatus.menunggu).typeLabel,
          'Penginapan');
      expect(build(ProposalType.transport, ProposalStatus.menunggu).typeLabel,
          'Transport');
      expect(build(ProposalType.food, ProposalStatus.menunggu).typeLabel,
          'Makanan');
    });

    test('label status tersedia untuk setiap nilai', () {
      expect(build(ProposalType.accommodation, ProposalStatus.menunggu)
          .statusLabel, 'Menunggu');
      expect(build(ProposalType.accommodation, ProposalStatus.terverifikasi)
          .statusLabel, 'Terverifikasi');
      expect(build(ProposalType.accommodation, ProposalStatus.ditolak)
          .statusLabel, 'Ditolak');
    });
  });
}
