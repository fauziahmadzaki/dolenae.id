import 'package:flutter_test/flutter_test.dart';

import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/presentation/screens/ai_results_screen.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_seed_data_source.dart';

import '../helpers/test_harness.dart';

AiResult _resultWithCard() {
  final destination = DestinationSeedData.items.first;
  return AiResult(
    preference: const AiPreference(rawText: 'gunung'),
    summary: 'Ringkasan',
    items: [
      AiRecommendation(
        destination: destination,
        score: 94,
        reasons: const ['Jalur mudah diakses.', 'Homestay tersedia.'],
        rank: 1,
      ),
    ],
    relatedChecklist: const [],
  );
}

void main() {
  setUpAll(useTestFonts);

  testWidgets('renders destination card and returns from detail', (
    tester,
  ) async {
    await usePhone(tester);
    await tester.pumpWidget(
      wrapScreen(AiResultsScreen(result: _resultWithCard())),
    );
    await tester.pumpAndSettle();

    expect(find.text('Skor 94'), findsOneWidget);
    expect(find.text('Lihat detail'), findsOneWidget);
    expect(find.text('Tambah'), findsOneWidget);

    await tester.tap(find.text('Lihat detail'));
    await tester.pumpAndSettle();
    expect(find.text('Layar lain'), findsOneWidget);

    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();

    expect(find.text('Rekomendasi'), findsOneWidget);
    expect(find.text('Lihat detail'), findsOneWidget);
  });

  testWidgets('Tambah shows a placeholder toast', (tester) async {
    await usePhone(tester);
    await tester.pumpWidget(
      wrapScreen(AiResultsScreen(result: _resultWithCard())),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Tambah'));
    await tester.pump();

    expect(find.text('Fitur tambah destinasi segera hadir.'), findsOneWidget);
  });
}
