import 'package:dolenae_mobile/src/features/home/presentation/screens/beranda_screen.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);

  testWidgets('topbar beranda tidak tertutup status bar', (tester) async {
    await usePhone(tester);
    // `view.padding` memakai piksel fisik; kalikan dengan DPR agar
    // MediaQuery menghasilkan padding logis 44 px.
    tester.view.padding = FakeViewPadding(top: 44 * tester.view.devicePixelRatio);
    addTearDown(tester.view.resetPadding);

    await tester.pumpWidget(wrapScreen(const BerandaScreen()));
    await tester.pumpAndSettle();

    final logoTop = tester.getTopLeft(find.text('Dolenae.id')).dy;
    expect(logoTop, greaterThanOrEqualTo(44));
  });
}
