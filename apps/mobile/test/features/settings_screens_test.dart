import 'package:dolenae_mobile/src/data/models/app_settings.dart';
import 'package:dolenae_mobile/src/data/models/faq_item.dart';
import 'package:dolenae_mobile/src/data/models/feedback.dart';
import 'package:dolenae_mobile/src/data/seed/seed_data.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/settings_account_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/settings_faq_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/settings_feedback_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/settings_notifications_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/settings_privacy_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/settings_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/settings_theme_screen.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_faq_accordion.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);

  group('Layar Pengaturan', () {
    testWidgets('menampilkan lima grup dan seluruh baris', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Pengaturan'), findsOneWidget);
      expect(find.text('AKUN'), findsOneWidget);
      expect(find.text('APLIKASI'), findsOneWidget);
      expect(find.text('BANTUAN'), findsOneWidget);
      expect(find.text('PREFERENSI'), findsOneWidget);
      expect(find.text('Akun'), findsOneWidget);
      expect(find.text('Notifikasi'), findsOneWidget);
      expect(find.text('Tema dan bahasa'), findsOneWidget);
      expect(find.text('Privasi dan keamanan'), findsOneWidget);
      expect(find.text('Bantuan dan FAQ'), findsOneWidget);
      expect(find.text('Kirim masukan'), findsOneWidget);
      expect(find.text('Mode hemat data'), findsOneWidget);

      await scrollTo(tester, find.text('Dolenae.id · versi 1.0.0'));
      expect(find.text('SESI'), findsOneWidget);
      expect(find.text('Keluar'), findsOneWidget);
    });

    testWidgets('baris tema memanggil delegate yang diberikan', (tester) async {
      await usePhone(tester);
      var opened = 0;
      await tester.pumpWidget(
        wrapScreen(SettingsScreen(onOpenTheme: () => opened++)),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Tema dan bahasa'));
      await tester.pump();
      expect(opened, 1);
    });

    testWidgets('keluar dibatalkan tidak memanggil delegate', (tester) async {
      await usePhone(tester);
      var logout = 0;
      await tester.pumpWidget(
        wrapScreen(SettingsScreen(onLogout: () => logout++)),
      );
      await tester.pumpAndSettle();

      await scrollTo(tester, find.text('Keluar'));
      await tester.tap(find.text('Keluar'));
      await tester.pumpAndSettle();
      expect(find.text('Keluar dari akun?'), findsOneWidget);

      await tester.tap(find.text('Batal'));
      await tester.pumpAndSettle();
      expect(logout, 0);
    });

    testWidgets('keluar dikonfirmasi memanggil delegate', (tester) async {
      await usePhone(tester);
      var logout = 0;
      await tester.pumpWidget(
        wrapScreen(SettingsScreen(onLogout: () => logout++)),
      );
      await tester.pumpAndSettle();

      await scrollTo(tester, find.text('Keluar'));
      await tester.tap(find.text('Keluar'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Keluar').last);
      await tester.pumpAndSettle();
      expect(logout, 1);
    });

    testWidgets('mode hemat data menulis ke store', (tester) async {
      await usePhone(tester);
      final store = newStore();
      expect(store.settings.settings.dataSaver, isFalse);

      await tester.pumpWidget(wrapScreen(const SettingsScreen(), store: store));
      await tester.pumpAndSettle();

      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();
      expect(store.settings.settings.dataSaver, isTrue);
    });
  });

  group('Layar Akun', () {
    testWidgets('menampilkan ringkasan akun, keamanan, dan zona berbahaya', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsAccountScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Akun'), findsOneWidget);
      expect(find.text('Nama'), findsOneWidget);
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Peran'), findsOneWidget);
      expect(find.text('Bergabung'), findsOneWidget);
      expect(find.text('KEAMANAN'), findsOneWidget);
      expect(find.text('Kata sandi'), findsOneWidget);
      expect(find.text('Perangkat aktif'), findsOneWidget);
      expect(find.text('ZONA BERBAHAYA'), findsOneWidget);
      expect(find.text('Hapus akun'), findsOneWidget);
      expect(find.text('Ubah profil'), findsOneWidget);
    });

    testWidgets('menampilkan daftar perangkat aktif dari seed', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsAccountScreen()));
      await tester.pumpAndSettle();

      final devices = SeedData.settings.activeDevices;
      expect(devices, isNotEmpty);

      await scrollTo(tester, find.text('PERANGKAT AKTIF'));
      expect(find.text(devices.first.label), findsOneWidget);
      expect(find.text('Perangkat ini'), findsOneWidget);
    });

    testWidgets('hapus akun memakai dialog konfirmasi', (tester) async {
      await usePhone(tester);
      var removed = 0;
      await tester.pumpWidget(
        wrapScreen(SettingsAccountScreen(onDeleteAccount: () => removed++)),
      );
      await tester.pumpAndSettle();

      await scrollTo(tester, find.text('Hapus akun'));
      await tester.tap(find.text('Hapus akun'));
      await tester.pumpAndSettle();
      expect(find.text('Hapus akun permanen?'), findsOneWidget);
      expect(removed, 0);

      await tester.tap(find.text('Hapus'));
      await tester.pumpAndSettle();
      expect(removed, 1);
    });
  });

  group('Layar Setelan Notifikasi', () {
    testWidgets('menampilkan dua grup dengan lima sakelar', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsNotificationsScreen()));
      await tester.pumpAndSettle();

      expect(find.text('AKTIVITAS'), findsOneWidget);
      expect(find.text('Rekomendasi AI'), findsOneWidget);
      expect(find.text('Pengingat rencana'), findsOneWidget);
      expect(find.text('Pengingat checklist'), findsOneWidget);

      await scrollTo(tester, find.text('Promo dan penawaran'));
      expect(find.text('PROMO'), findsOneWidget);
      expect(find.text('Fasilitas baru di sekitar'), findsOneWidget);
      expect(find.byType(Switch), findsNWidgets(5));
    });

    testWidgets('menyalakan promo menulis ke store', (tester) async {
      await usePhone(tester);
      final store = newStore();
      expect(store.settings.settings.notifications.promo, isFalse);

      await tester.pumpWidget(
        wrapScreen(const SettingsNotificationsScreen(), store: store),
      );
      await tester.pumpAndSettle();

      await scrollTo(tester, find.text('Promo dan penawaran'));
      await tester.tap(find.byType(Switch).last);
      await tester.pumpAndSettle();
      expect(store.settings.settings.notifications.promo, isTrue);
    });

    testWidgets('mematikan rekomendasi AI menulis ke store', (tester) async {
      await usePhone(tester);
      final store = newStore();
      expect(store.settings.settings.notifications.rekomendasi, isTrue);

      await tester.pumpWidget(
        wrapScreen(const SettingsNotificationsScreen(), store: store),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byType(Switch).first);
      await tester.pumpAndSettle();
      expect(store.settings.settings.notifications.rekomendasi, isFalse);
    });
  });

  group('Layar Tema dan Bahasa', () {
    testWidgets('menampilkan tiga tema dan dua bahasa', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsThemeScreen()));
      await tester.pumpAndSettle();

      expect(find.text('TEMA APLIKASI'), findsOneWidget);
      expect(find.text('Terang'), findsOneWidget);
      expect(find.text('Ikuti sistem'), findsOneWidget);
      expect(find.text('Gelap'), findsOneWidget);

      await scrollTo(tester, find.text('English'));
      expect(find.text('BAHASA'), findsOneWidget);
      expect(find.text('Bahasa Indonesia'), findsOneWidget);
    });

    testWidgets('memilih gelap menulis tema ke store', (tester) async {
      await usePhone(tester);
      final store = newStore();
      expect(store.settings.settings.theme, ThemePreference.terang);

      await tester.pumpWidget(
        wrapScreen(const SettingsThemeScreen(), store: store),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Gelap'));
      await tester.pumpAndSettle();
      expect(store.settings.settings.theme, ThemePreference.gelap);
    });

    testWidgets('memilih English menulis bahasa ke store', (tester) async {
      await usePhone(tester);
      final store = newStore();
      expect(store.settings.settings.language, LanguagePreference.id);

      await tester.pumpWidget(
        wrapScreen(const SettingsThemeScreen(), store: store),
      );
      await tester.pumpAndSettle();

      await scrollTo(tester, find.text('English'));
      await tester.tap(find.text('English'));
      await tester.pumpAndSettle();
      expect(store.settings.settings.language, LanguagePreference.en);
    });
  });

  group('Layar Privasi dan Keamanan', () {
    testWidgets('menampilkan tiga grup lengkap', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsPrivacyScreen()));
      await tester.pumpAndSettle();

      expect(find.text('KEAMANAN AKUN'), findsOneWidget);
      expect(find.text('Verifikasi dua langkah'), findsOneWidget);
      expect(find.text('Ganti kata sandi'), findsOneWidget);
      expect(find.text('PRIVASI'), findsOneWidget);
      expect(find.text('Profil publik'), findsOneWidget);
      expect(find.text('Bagikan aktivitas'), findsOneWidget);
      expect(find.text('Analitik penggunaan'), findsOneWidget);

      await scrollTo(tester, find.text('Minta salinan data'));
      expect(find.text('DATA SAYA'), findsOneWidget);
    });

    testWidgets('menyalakan verifikasi dua langkah menulis ke store', (
      tester,
    ) async {
      await usePhone(tester);
      final store = newStore();
      expect(store.settings.settings.privacy.twoFactor, isFalse);

      await tester.pumpWidget(
        wrapScreen(const SettingsPrivacyScreen(), store: store),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byType(Switch).first);
      await tester.pumpAndSettle();
      expect(store.settings.settings.privacy.twoFactor, isTrue);
    });

    testWidgets('ganti kata sandi memanggil delegate', (tester) async {
      await usePhone(tester);
      var opened = 0;
      await tester.pumpWidget(
        wrapScreen(SettingsPrivacyScreen(onChangePassword: () => opened++)),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Ganti kata sandi'));
      await tester.pump();
      expect(opened, 1);
    });
  });

  group('Layar Bantuan dan FAQ', () {
    testWidgets('menampilkan pencarian, chip kategori, dan akordeon', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsFaqScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Bantuan dan FAQ'), findsOneWidget);
      expect(find.text('Semua'), findsOneWidget);
      expect(find.text('Akun'), findsWidgets);
      expect(find.text('Cari pertanyaan'), findsOneWidget);
      expect(find.byType(DnFaqAccordion), findsWidgets);
    });

    testWidgets('memilih kategori tanpa isi memunculkan empty state', (tester) async {
      await usePhone(tester);
      final akunOnly = SeedData.faqs
          .where((item) => item.category == FaqCategory.akun)
          .toList();
      expect(akunOnly, isNotEmpty);

      await tester.pumpWidget(
        wrapScreen(SettingsFaqScreen(items: akunOnly)),
      );
      await tester.pumpAndSettle();
      expect(find.byType(DnFaqAccordion), findsWidgets);

      await tester.tap(find.text('Data'));
      await tester.pumpAndSettle();
      expect(find.byType(DnFaqAccordion), findsNothing);
      expect(
        find.textContaining('Belum ada pertanyaan yang cocok'),
        findsOneWidget,
      );
    });

    testWidgets('kueri tanpa hasil memunculkan empty state', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsFaqScreen()));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).first, 'zzzzzz');
      await tester.pumpAndSettle();

      expect(find.byType(DnFaqAccordion), findsNothing);
      expect(
        find.textContaining('Belum ada pertanyaan yang cocok'),
        findsOneWidget,
      );
    });

    testWidgets('kueri yang cocok menyaring daftar pertanyaan', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsFaqScreen()));
      await tester.pumpAndSettle();

      final total = find.byType(DnFaqAccordion).evaluate().length;
      await tester.enterText(find.byType(TextField).first, 'sandi');
      await tester.pumpAndSettle();

      expect(find.byType(DnFaqAccordion).evaluate().length, lessThan(total));
    });

    testWidgets('akordeon terbuka menampilkan jawaban', (tester) async {
      await usePhone(tester);
      final item = SeedData.faqs.first;
      await tester.pumpWidget(wrapScreen(SettingsFaqScreen(items: [item])));
      await tester.pumpAndSettle();

      expect(find.text(item.question), findsOneWidget);
      await tester.tap(find.text(item.question));
      await tester.pumpAndSettle();
      expect(find.text(item.answer), findsOneWidget);
    });
  });

  group('Layar Kirim Masukan', () {
    testWidgets('menampilkan kategori, dua field, dan lima bintang', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsFeedbackScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Kirim masukan'), findsWidgets);
      expect(find.text('Kategori'), findsOneWidget);
      expect(find.text('Bug'), findsOneWidget);
      expect(find.text('Saran'), findsOneWidget);
      expect(find.text('Konten'), findsOneWidget);
      expect(find.text('Lainnya'), findsOneWidget);
      expect(find.byType(TextField), findsNWidgets(2));
      expect(find.byIcon(AppIcons.star), findsNWidgets(5));
    });

    testWidgets('tombol kirim aktif hanya setelah form terisi', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const SettingsFeedbackScreen()));
      await tester.pumpAndSettle();

      final cta = find.widgetWithText(FilledButton, 'Kirim masukan');
      expect(tester.widget<FilledButton>(cta).onPressed, isNull);

      await tester.enterText(find.byType(TextField).at(0), 'Foto tidak muncul');
      await tester.enterText(
        find.byType(TextField).at(1),
        'Foto banner kosong di kartu destinasi Bromo.',
      );
      await tester.pumpAndSettle();

      expect(tester.widget<FilledButton>(cta).onPressed, isNotNull);
    });

    testWidgets('pesan terlalu pendek ditolak oleh validasi', (tester) async {
      await usePhone(tester);
      final drafts = <FeedbackDraft>[];
      await tester.pumpWidget(
        wrapScreen(SettingsFeedbackScreen(onSubmit: drafts.add)),
      );
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).at(0), 'Foto kosong');
      await tester.enterText(find.byType(TextField).at(1), 'pendek');
      await tester.pumpAndSettle();

      await tester.tap(find.widgetWithText(FilledButton, 'Kirim masukan'));
      await tester.pumpAndSettle();

      expect(drafts, isEmpty);
      expect(
        find.text('Tuliskan detail minimal 10 karakter.'),
        findsOneWidget,
      );
    });

    testWidgets('subjek kosong membuat tombol tetap nonaktif', (
      tester,
    ) async {
      await usePhone(tester);
      final drafts = <FeedbackDraft>[];
      await tester.pumpWidget(
        wrapScreen(SettingsFeedbackScreen(onSubmit: drafts.add)),
      );
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byType(TextField).at(1),
        'Pesan yang panjangnya cukup untuk lolos.',
      );
      await tester.pumpAndSettle();

      final cta = find.widgetWithText(FilledButton, 'Kirim masukan');
      expect(tester.widget<FilledButton>(cta).onPressed, isNull);

      await tester.tap(cta);
      await tester.pumpAndSettle();
      expect(drafts, isEmpty);
    });

    testWidgets('form valid mengirim draf beserta rating', (tester) async {
      await usePhone(tester);
      final drafts = <FeedbackDraft>[];
      await tester.pumpWidget(
        wrapScreen(SettingsFeedbackScreen(onSubmit: drafts.add)),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(AppIcons.star).at(3));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField).at(0), 'Saran fitur');
      await tester.enterText(
        find.byType(TextField).at(1),
        'Tambahkan peta offline untuk itinerary.',
      );
      await tester.pumpAndSettle();

      await tester.tap(find.widgetWithText(FilledButton, 'Kirim masukan'));
      await tester.pumpAndSettle();

      expect(drafts, hasLength(1));
      expect(drafts.single.rating, 4);
      expect(drafts.single.subject, 'Saran fitur');
      expect(find.byIcon(AppIcons.starFilled), findsNWidgets(4));
    });
  });
}
