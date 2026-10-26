import 'package:dolenae_mobile/src/features/home/presentation/screens/beranda_screen.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_recommendation_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);

  testWidgets(
    'pencarian Beranda menampilkan kartu rekomendasi di halaman yang sama',
    (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const BerandaScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Destinasi populer'), findsOneWidget);

      await tester.enterText(find.byType(TextField), 'gunung');
      await tester.pumpAndSettle();

      expect(find.text('Rekomendasi untuk "gunung"'), findsOneWidget);
      expect(find.byType(DnRecommendationCard), findsWidgets);
      expect(find.text('Destinasi populer'), findsNothing);
      expect(find.text('Layar lain'), findsNothing);
    },
  );

  testWidgets('kata kunci tanpa hasil menampilkan empty state', (tester) async {
    await usePhone(tester);
    await tester.pumpWidget(wrapScreen(const BerandaScreen()));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), 'pantai');
    await tester.pumpAndSettle();

    expect(find.text('Destinasi tidak ditemukan'), findsOneWidget);
  });

  testWidgets('chip kategori mengisi kolom pencarian', (tester) async {
    await usePhone(tester);
    await tester.pumpWidget(wrapScreen(const BerandaScreen()));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Bukit'));
    await tester.pumpAndSettle();

    expect(find.text('Rekomendasi untuk "bukit"'), findsOneWidget);
    expect(find.text('Bukit Moko'), findsOneWidget);
  });
}
