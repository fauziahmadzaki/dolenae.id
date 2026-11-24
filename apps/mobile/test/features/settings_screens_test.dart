import 'package:dolenae_mobile/src/features/settings/data/data_sources/settings_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/faq_item.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_faq_screen.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_faq_accordion.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);

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

    testWidgets('memilih kategori tanpa isi memunculkan empty state', (
      tester,
    ) async {
      await usePhone(tester);
      final akunOnly = SettingsSeedData.faqs
          .where((item) => item.category == FaqCategory.akun)
          .toList();
      expect(akunOnly, isNotEmpty);

      await tester.pumpWidget(wrapScreen(SettingsFaqScreen(items: akunOnly)));
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
      final item = SettingsSeedData.faqs.first;
      await tester.pumpWidget(wrapScreen(SettingsFaqScreen(items: [item])));
      await tester.pumpAndSettle();

      expect(find.text(item.question), findsOneWidget);
      await tester.tap(find.text(item.question));
      await tester.pumpAndSettle();
      expect(find.text(item.answer), findsOneWidget);
    });
  });
}
