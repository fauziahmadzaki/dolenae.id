import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dolenae_mobile/src/shared/widgets/dn_exit_guard.dart';

import '../helpers/test_harness.dart';

void main() {
  testWidgets('back di halaman root memunculkan konfirmasi keluar', (
    tester,
  ) async {
    await usePhone(tester);
    await tester.pumpWidget(
      wrapScreen(const DnExitGuard(child: Scaffold(body: Text('Halaman')))),
    );
    await tester.pumpAndSettle();

    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();

    expect(find.text('Yakin ingin keluar?'), findsOneWidget);
    expect(find.text('Keluar'), findsOneWidget);
    expect(find.text('Batal'), findsOneWidget);

    await tester.tap(find.text('Batal'));
    await tester.pumpAndSettle();

    expect(find.text('Yakin ingin keluar?'), findsNothing);
  });
}
