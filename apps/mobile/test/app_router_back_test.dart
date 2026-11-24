import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/app/router/app_router.dart';

void main() {
  testWidgets('back di root memunculkan konfirmasi, back di child pop biasa', (
    tester,
  ) async {
    final router = GoRouter(
      initialLocation: '/',
      routes: AppRouter.withExitGuard([
        GoRoute(path: '/', builder: (_, _) => const _Home()),
        GoRoute(path: '/child', builder: (_, _) => const _Child()),
      ]),
    );
    addTearDown(router.dispose);

    await tester.pumpWidget(MaterialApp.router(routerConfig: router));
    await tester.pumpAndSettle();

    // Di route paling dasar, back harus memunculkan dialog, bukan keluar.
    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    expect(find.text('Yakin ingin keluar?'), findsOneWidget);

    await tester.tap(find.text('Batal'));
    await tester.pumpAndSettle();
    expect(find.text('Yakin ingin keluar?'), findsNothing);

    // Saat ada halaman sebelumnya, back kembali ke halaman itu tanpa dialog.
    router.push('/child');
    await tester.pumpAndSettle();
    expect(find.text('Child'), findsOneWidget);

    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Yakin ingin keluar?'), findsNothing);
  });
}

class _Home extends StatelessWidget {
  const _Home();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Home')));
  }
}

class _Child extends StatelessWidget {
  const _Child();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Child')));
  }
}
