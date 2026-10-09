import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(() async {
    GoogleFonts.config.allowRuntimeFetching = false;
    await useTestFonts();
  });

  Widget wrap({required double topPadding}) {
    return MaterialApp(
      home: Builder(
        builder: (context) => MediaQuery(
          data: MediaQuery.of(
            context,
          ).copyWith(padding: EdgeInsets.only(top: topPadding)),
          child: Scaffold(
            appBar: DnAppBar(title: 'Uji', showBack: true),
            body: const SizedBox(),
          ),
        ),
      ),
    );
  }

  testWidgets('menambahkan tinggi status bar dan menurunkan tombol back', (
    tester,
  ) async {
    const topPadding = 44.0;
    await tester.pumpWidget(wrap(topPadding: topPadding));

    expect(tester.getSize(find.byType(DnAppBar)).height, topPadding + 56);
    expect(
      tester.getTopLeft(find.byTooltip('Kembali')).dy,
      greaterThanOrEqualTo(topPadding),
    );
  });

  testWidgets('tetap 56 px saat tanpa status bar', (tester) async {
    await tester.pumpWidget(wrap(topPadding: 0));
    expect(tester.getSize(find.byType(DnAppBar)).height, 56);
  });
}
