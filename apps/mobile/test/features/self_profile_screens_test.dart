import 'package:dolenae_mobile/src/app/theme/app_theme.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_seed_data_source.dart';
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
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'self_profile_controller_test.dart'
    show ProfileAuthFake, session, updated;

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  testWidgets(
    'profile reads live identity and counts; guest has no demo identity',
    (tester) async {
      final repository = ProfileAuthFake();
      final auth = AuthController(
        repository: repository,
        initialSession: session,
      );
      final savedRepository = ProfileSavedFake();
      final saved = SavedController(savedRepository);
      final planRepository = ProfilePlanFake();
      final plans = PlanController(planRepository);
      final checklist = ChecklistController(ProfileChecklistFake());
      addTearDown(() {
        auth.dispose();
        saved.dispose();
        plans.dispose();
        checklist.dispose();
      });
      await tester.binding.setSurfaceSize(const Size(390, 844));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider.value(value: auth),
            ChangeNotifierProvider.value(value: saved),
            ChangeNotifierProvider.value(value: plans),
            ChangeNotifierProvider.value(value: checklist),
          ],
          child: MaterialApp(
            theme: AppTheme.light(),
            home: const ProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text(session.user.name), findsOneWidget);
      expect(find.text(session.user.email), findsOneWidget);
      final passwordRow = tester.widget<InkWell>(
        find
            .ancestor(
              of: find.text('Ubah kata sandi'),
              matching: find.byType(InkWell),
            )
            .first,
      );
      expect(passwordRow.onTap, isNull);
      expect(find.text('Belum tersedia'), findsWidgets);
      expect(find.text('0'), findsNWidgets(3));
      expect(find.text('Dimas'), findsNothing);
      expect(find.text('4'), findsNothing);
      expect(find.text('12'), findsNothing);

      savedRepository.destinations = List.filled(
        3,
        SavedDestination(
          id: 'saved',
          destination: DestinationSeedData.items.first,
          savedAt: DateTime(2026),
        ),
      );
      await saved.load();
      planRepository.items = List.filled(
        5,
        const TripPlan(
          id: 'plan',
          title: 'Rencana',
          dateRange: '',
          destinationCount: 0,
          estimatedBudget: '',
          aiBriefing: '',
          steps: [],
        ),
      );
      await plans.load();
      await checklist.load('destination-a');
      await tester.pumpAndSettle();
      expect(find.text('3'), findsOneWidget);
      expect(find.text('5'), findsOneWidget);
      expect(find.text('7'), findsOneWidget);
      expect(find.text('Item checklist aktif'), findsOneWidget);
      final checklistLink = tester.widget<InkWell>(
        find
            .ancestor(
              of: find.text('Item checklist aktif'),
              matching: find.byType(InkWell),
            )
            .first,
      );
      expect(checklistLink.onTap, isNotNull);
      final unloadedChecklist = ProfileChecklistFake();
      final empty = ChecklistController(unloadedChecklist);
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider.value(value: auth),
            ChangeNotifierProvider.value(value: saved),
            ChangeNotifierProvider.value(value: plans),
            ChangeNotifierProvider.value(value: empty),
          ],
          child: MaterialApp(
            theme: AppTheme.light(),
            home: const ProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        tester
            .widget<InkWell>(
              find
                  .ancestor(
                    of: find.text('Item checklist aktif'),
                    matching: find.byType(InkWell),
                  )
                  .first,
            )
            .onTap,
        isNull,
      );
      addTearDown(empty.dispose);

      final saving = auth.updateProfile('Nama Baru');
      repository.update.complete(const Success(updated));
      await saving;
      await tester.pumpAndSettle();
      expect(find.text(updated.user.name), findsOneWidget);
      expect(find.text(session.user.name), findsNothing);

      await auth.logout();
      await tester.pumpAndSettle();
      expect(find.text(updated.user.name), findsNothing);
      expect(find.text(session.user.email), findsNothing);
      expect(find.text('Belum masuk'), findsOneWidget);
      expect(find.text('0'), findsNWidgets(3));
    },
  );

  testWidgets(
    'profile edit route uses session identity; unsupported fields explicitly disabled',
    (tester) async {
      final repository = ProfileAuthFake();
      final auth = AuthController(
        repository: repository,
        initialSession: session,
      );
      final router = mount(auth);
      addTearDown(() {
        router.dispose();
        auth.dispose();
      });
      await tester.binding.setSurfaceSize(const Size(390, 844));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(tree(auth, router));
      await tester.pumpAndSettle();
      final fields = tester
          .widgetList<TextField>(find.byType(TextField))
          .toList();
      expect(fields.first.controller?.text, session.user.name);
      expect(fields[1].controller?.text, session.user.email);
      expect(fields.skip(1).every((field) => field.enabled == false), isTrue);
      expect(find.textContaining('Belum tersedia'), findsWidgets);
      final photo = tester.widget<TextButton>(
        find.widgetWithText(TextButton, 'Ganti foto'),
      );
      expect(photo.onPressed, isNull);
      final nameLabels = find
          .ancestor(of: find.text('Nama'), matching: find.byType(Column))
          .first;
      expect(
        find.descendant(of: nameLabels, matching: find.text('Belum tersedia')),
        findsNothing,
      );
      expect(find.text('Dimas'), findsNothing);
    },
  );

  testWidgets(
    'save waits for server; duplicate save disabled; success updates session and pops',
    (tester) async {
      final repository = ProfileAuthFake();
      final auth = AuthController(
        repository: repository,
        initialSession: session,
      );
      final router = mount(auth);
      addTearDown(() {
        router.dispose();
        auth.dispose();
      });
      await tester.pumpWidget(tree(auth, router));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField).first, ' Nama Baru ');
      await tester.tap(find.widgetWithText(TextButton, 'Simpan'));
      await tester.pump();
      expect(repository.name, 'Nama Baru');
      expect(find.textContaining('berhasil disimpan'), findsNothing);
      expect(
        tester
            .widget<TextButton>(find.widgetWithText(TextButton, 'Simpan'))
            .onPressed,
        isNull,
      );
      final nameLabels = find
          .ancestor(of: find.text('Nama'), matching: find.byType(Column))
          .first;
      expect(
        find.descendant(of: nameLabels, matching: find.text('Belum tersedia')),
        findsNothing,
      );
      repository.update.complete(const Success(updated));
      await tester.pumpAndSettle();
      expect(auth.user?.name, updated.user.name);
      expect(router.routeInformationProvider.value.uri.path, '/profile');
    },
  );

  testWidgets('server failure stays on editor without fake success', (
    tester,
  ) async {
    final repository = ProfileAuthFake();
    final auth = AuthController(
      repository: repository,
      initialSession: session,
    );
    final router = mount(auth);
    addTearDown(() {
      router.dispose();
      auth.dispose();
    });
    await tester.pumpWidget(tree(auth, router));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).first, 'Nama Baru');
    await tester.tap(find.widgetWithText(TextButton, 'Simpan'));
    repository.update.complete(
      const Failure(NetworkFailure('Server tidak dapat menyimpan profil.')),
    );
    await tester.pumpAndSettle();
    expect(find.text('Server tidak dapat menyimpan profil.'), findsOneWidget);
    expect(find.textContaining('berhasil disimpan'), findsNothing);
    expect(router.routeInformationProvider.value.uri.path, '/profile/edit');
    expect(auth.user?.name, session.user.name);
  });
}

GoRouter mount(AuthController auth) => GoRouter(
  initialLocation: '/profile/edit',
  routes: [
    GoRoute(
      path: '/profile',
      builder: (_, _) => const Scaffold(body: Text('Profil tujuan')),
    ),
    ...profileRoutes,
  ],
);
Widget tree(AuthController auth, GoRouter router) =>
    ChangeNotifierProvider.value(
      value: auth,
      child: MaterialApp.router(theme: AppTheme.light(), routerConfig: router),
    );

class ProfileSavedFake implements SavedRepository {
  @override
  List<SavedDestination> destinations = [];
  @override
  Future<Result<void>> load() async => const Success(null);
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class ProfilePlanFake implements PlanRepository {
  List<TripPlan> items = [];
  @override
  bool get isDemo => true;
  @override
  List<TripPlan> get initialPlans => [];
  @override
  Future<Result<List<TripPlan>>> list() async => Success(items);
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class ProfileChecklistFake implements ChecklistRepository {
  @override
  List<ChecklistItem> items = [];
  @override
  String? destinationId;
  @override
  Future<Result<void>> load(String id) async {
    destinationId = id;
    items = List.filled(
      7,
      const ChecklistItem(
        id: 'item',
        name: 'Peralatan',
        category: ChecklistCategory.perlengkapan,
        isRequired: false,
      ),
    );
    return const Success(null);
  }

  @override
  void setSession(String? userId) {
    items = [];
    destinationId = null;
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
