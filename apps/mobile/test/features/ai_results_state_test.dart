import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/presentation/screens/ai_results_screen.dart';
import 'package:dolenae_mobile/src/features/ai/presentation/widgets/ai_results_skeleton.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);

  testWidgets('skeleton replaces the spinner while loading', (tester) async {
    await usePhone(tester);
    await tester.pumpWidget(wrapScreen(const AiResultsSkeleton()));
    await tester.pump();

    expect(find.byKey(const ValueKey('ai-results-skeleton')), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsNothing);

    await tester.pump(const Duration(milliseconds: 400));
    expect(tester.takeException(), isNull);
  });

  testWidgets('shows the not-found notice above the result', (tester) async {
    await usePhone(tester);
    const notice =
        'Maaf, destinasi yang kamu cari belum ada di Dolenae. Berikut '
        'rekomendasi alternatif yang paling sesuai dengan preferensimu.';
    final result = AiResult(
      preference: const AiPreference(rawText: 'gunung Everest'),
      summary: 'Rencana alternatif',
      items: const [],
      relatedChecklist: const [],
      notice: notice,
    );

    await tester.pumpWidget(wrapScreen(AiResultsScreen(result: result)));
    await tester.pumpAndSettle();

    expect(find.text('Destinasi belum tersedia'), findsOneWidget);
    expect(find.textContaining('gunung Everest'), findsWidgets);
    expect(find.text(notice), findsOneWidget);
  });
}
