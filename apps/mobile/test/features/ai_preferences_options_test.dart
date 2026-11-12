import 'package:flutter_test/flutter_test.dart';

import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/presentation/screens/ai_preferences_screen.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);

  testWidgets('mengirim difficulty sebagai enum dan bisa dikosongkan', (
    tester,
  ) async {
    await usePhone(tester);
    final sent = <AiPreference>[];
    await tester.pumpWidget(
      wrapScreen(
        AiPreferencesScreen(
          initialPreference: const AiPreference(rawText: 'sunrise'),
          onSubmit: sent.add,
        ),
      ),
    );
    await tester.pumpAndSettle();

    await scrollTo(tester, find.text('Tingkat kesulitan'));
    await tester.tap(find.text('Menengah'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Cari rekomendasi'));
    await tester.pumpAndSettle();

    expect(sent.last.difficulty, 'menengah');

    await tester.tap(find.text('Menengah'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Cari rekomendasi'));
    await tester.pumpAndSettle();

    expect(sent.last.difficulty, isNull);
  });
}
