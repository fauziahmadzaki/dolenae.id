import 'package:dolenae_mobile/src/features/home/presentation/screens/beranda_screen.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_activity_tile.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);

  testWidgets('topbar beranda tidak tertutup status bar', (tester) async {
    await usePhone(tester);
    // `view.padding` memakai piksel fisik; kalikan dengan DPR agar
    // MediaQuery menghasilkan padding logis 44 px.
    tester.view.padding = FakeViewPadding(
      top: 44 * tester.view.devicePixelRatio,
    );
    addTearDown(tester.view.resetPadding);

    await tester.pumpWidget(wrapScreen(const BerandaScreen()));
    await tester.pumpAndSettle();

    final logoTop = tester.getTopLeft(find.text('Dolenae.id')).dy;
    expect(logoTop, greaterThanOrEqualTo(44));
  });

  testWidgets('aktivitas beranda memakai kata kunci yang ada di destinasi', (
    tester,
  ) async {
    await usePhone(tester);
    await tester.pumpWidget(wrapScreen(const BerandaScreen()));
    await tester.pumpAndSettle();

    for (final label in ['Gunung', 'Camping Ground', 'Sunrise', 'Savana']) {
      expect(find.widgetWithText(DnActivityTile, label), findsOneWidget);
    }
    expect(find.widgetWithText(DnActivityTile, 'Hiking'), findsNothing);
    expect(find.widgetWithText(DnActivityTile, 'Foto'), findsNothing);
  });
}
