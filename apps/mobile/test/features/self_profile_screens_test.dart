import 'package:dolenae_mobile/src/app/theme/app_theme.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/routes/profile_routes.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/screens/profile_screen.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/domain/repositories/saved_repository.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/repositories/checklist_repository.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/screens/edit_profile_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'self_profile_controller_test.dart' show ProfileAuthFake, session, updated;

void main() {
  setUpAll(() { GoogleFonts.config.allowRuntimeFetching = false; });

  testWidgets('profile edit route uses session identity; unsupported fields explicitly disabled', (tester) async {
    final repository = ProfileAuthFake();
    final auth = AuthController(repository: repository, initialSession: session);
    final router = mount(auth);
    addTearDown(() { router.dispose(); auth.dispose(); });
    await tester.binding.setSurfaceSize(const Size(390, 844));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(tree(auth, router));
    await tester.pumpAndSettle();
    final fields = tester.widgetList<TextField>(find.byType(TextField)).toList();
    expect(fields.first.controller?.text, session.user.name);
    expect(fields[1].controller?.text, session.user.email);
    expect(fields.skip(1).every((field) => field.enabled == false), isTrue);
    expect(find.textContaining('Belum tersedia'), findsWidgets);
    final photo = tester.widget<TextButton>(find.widgetWithText(TextButton, 'Ganti foto'));
    expect(photo.onPressed, isNull);
    expect(find.text('Dimas'), findsNothing);
  });

  testWidgets('save waits for server; duplicate save disabled; success updates session and pops', (tester) async {
    final repository = ProfileAuthFake();
    final auth = AuthController(repository: repository, initialSession: session);
    final router = mount(auth);
    addTearDown(() { router.dispose(); auth.dispose(); });
    await tester.pumpWidget(tree(auth, router));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).first, ' Nama Baru ');
    await tester.tap(find.widgetWithText(TextButton, 'Simpan'));
    await tester.pump();
    expect(repository.name, 'Nama Baru');
    expect(find.textContaining('berhasil disimpan'), findsNothing);
    expect(tester.widget<TextButton>(find.widgetWithText(TextButton, 'Simpan')).onPressed, isNull);
    repository.update.complete(const Success(updated));
    await tester.pumpAndSettle();
    expect(auth.user?.name, updated.user.name);
    expect(router.routeInformationProvider.value.uri.path, '/profile');
  });

  testWidgets('server failure stays on editor without fake success', (tester) async {
    final repository = ProfileAuthFake();
    final auth = AuthController(repository: repository, initialSession: session);
    final router = mount(auth);
    addTearDown(() { router.dispose(); auth.dispose(); });
    await tester.pumpWidget(tree(auth, router));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).first, 'Nama Baru');
    await tester.tap(find.widgetWithText(TextButton, 'Simpan'));
    repository.update.complete(const Failure(NetworkFailure('Server tidak dapat menyimpan profil.')));
    await tester.pumpAndSettle();
    expect(find.text('Server tidak dapat menyimpan profil.'), findsOneWidget);
    expect(find.textContaining('berhasil disimpan'), findsNothing);
    expect(router.routeInformationProvider.value.uri.path, '/profile/edit');
    expect(auth.user?.name, session.user.name);
  });
}

GoRouter mount(AuthController auth) => GoRouter(initialLocation: '/profile/edit', routes: [
  GoRoute(path: '/profile', builder: (_, _) => const Scaffold(body: Text('Profil tujuan'))),
  ...profileRoutes,
]);
Widget tree(AuthController auth, GoRouter router) => ChangeNotifierProvider.value(value: auth,
  child: MaterialApp.router(theme: AppTheme.light(), routerConfig: router));
