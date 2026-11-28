import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/data/repositories/ai_repository_impl.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/plan/data/models/plan_model.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/user_location.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/location_repository.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_checklist_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_checklists_screen.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/screens/profile_screen.dart';
import 'package:dolenae_mobile/src/features/saved/data/repositories/saved_repository_impl.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';

const Size _phone = Size(390, 844);

class _FakePlanRepository implements PlanRepository {
  _FakePlanRepository({List<TripPlan>? initialPlans})
      : _plansByUser = {
          'user-a': [...?initialPlans],
        };

  final Map<String, List<TripPlan>> _plansByUser;
  String _userId = 'user-a';
  Completer<Result<List<TripPlan>>>? pendingLoad;
  String? nextLoadError;
  int updateCount = 0;

  @override
  void setUserId(String? userId) {
    _userId = (userId == null || userId.trim().isEmpty) ? 'anon' : userId.trim();
  }

  List<TripPlan> get _current => _plansByUser.putIfAbsent(_userId, () => []);

  void setPlansForUser(String userId, List<TripPlan> plans) {
    _plansByUser[userId] = [...plans];
  }

  @override
  Future<Result<List<TripPlan>>> load() async {
    if (pendingLoad != null) {
      final completer = pendingLoad!;
      pendingLoad = null;
      return completer.future;
    }
    if (nextLoadError != null) {
      final msg = nextLoadError!;
      nextLoadError = null;
      return Failure(NetworkFailure(msg));
    }
    return Success(List.unmodifiable(_current));
  }

  @override
  Future<Result<TripPlan>> create(TripPlan plan) async {
    _current.add(plan);
    return Success(plan);
  }

  @override
  Future<Result<TripPlan>> update(TripPlan plan) async {
    updateCount++;
    final idx = _current.indexWhere((p) => p.id == plan.id);
    if (idx < 0) {
      return const Failure(UnknownFailure('Rencana tidak ditemukan.'));
    }
    _current[idx] = plan;
    return Success(plan);
  }

  @override
  Future<Result<void>> delete(String planId) async {
    _current.removeWhere((p) => p.id == planId);
    return const Success(null);
  }
}

class _NoopLocationRepository implements LocationRepository {
  const _NoopLocationRepository();

  @override
  Future<Result<UserLocation>> detectCurrent() async {
    return const Failure(UnknownFailure('Lokasi tidak tersedia'));
  }
}

TripPlan _buildPlan({
  required String id,
  required String title,
  required String destinationName,
  List<ChecklistItem> checklist = const [],
  bool checklistReady = false,
  List<PlanSource>? sources,
}) {
  return TripPlan(
    id: id,
    title: title,
    startDate: DateTime(2026, 8, 10),
    endDate: DateTime(2026, 8, 12),
    peopleCount: 2,
    totalBudget: 1500000,
    destinationIds: ['dest-$id'],
    days: [
      PlanDay(
        day: 1,
        title: destinationName,
        items: [
          PlanItem(
            destinationId: 'dest-$id',
            destinationName: destinationName,
            activity: 'Pendakian',
          ),
        ],
      ),
    ],
    sources: sources ??
        [
          PlanSource(
            type: 'destination',
            id: 'dest-$id',
            label: destinationName,
          ),
        ],
    checklist: checklist,
    checklistReady: checklistReady,
  );
}

Widget _buildRouterApp({
  required PlanController planController,
  String initialLocation = '/profile',
}) {
  final saved = SavedController(SavedRepositoryImpl());
  final router = GoRouter(
    initialLocation: initialLocation,
    routes: [
      GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
      GoRoute(
        path: '/checklist',
        builder: (_, _) => const PlanChecklistsScreen(),
      ),
      GoRoute(
        path: '/plan/new',
        builder: (_, _) => const Scaffold(body: Center(child: Text('Plan Baru'))),
      ),
      GoRoute(
        path: '/plan/:id',
        builder: (_, state) => Scaffold(
          body: Center(child: Text('Detail ${state.pathParameters['id']}')),
        ),
        routes: [
          GoRoute(
            path: 'checklist',
            builder: (_, state) =>
                PlanChecklistScreen(planId: state.pathParameters['id'] ?? ''),
          ),
        ],
      ),
    ],
  );

  return MultiProvider(
    providers: [
      ChangeNotifierProvider<SavedController>.value(value: saved),
      ChangeNotifierProvider<PlanController>.value(value: planController),
    ],
    child: MaterialApp.router(routerConfig: router),
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('0 rencana: stat Checklist 0 dan /checklist tampil empty state', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(_phone);
    addTearDown(() => tester.binding.setSurfaceSize(null));

    final repo = _FakePlanRepository(initialPlans: const []);
    final controller = PlanController(
      repo,
      AiRepositoryImpl(),
      const _NoopLocationRepository(),
    );
    await controller.load();

    await tester.pumpWidget(_buildRouterApp(planController: controller));
    await tester.pumpAndSettle();

    final checklistTile = find.ancestor(
      of: find.text('Checklist').first,
      matching: find.byType(InkWell),
    );
    expect(
      find.descendant(of: checklistTile, matching: find.text('0')),
      findsOneWidget,
    );

    await tester.tap(checklistTile);
    await tester.pumpAndSettle();

    expect(find.byType(PlanChecklistsScreen), findsOneWidget);
    expect(find.text('Belum ada rencana perjalanan'), findsOneWidget);
    expect(find.text('Buat rencana'), findsOneWidget);
  });

  testWidgets(
    '1 rencana (Naik Gunung Prau): centang semua item N/N tidak menaikkan stat Profil; Tandai siap menaikkan stat menjadi 1',
    (tester) async {
      await tester.binding.setSurfaceSize(_phone);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      final prauPlan = _buildPlan(
        id: 'plan-prau',
        title: 'Naik Gunung Prau',
        destinationName: 'Gunung Prau',
        checklist: const [
          ChecklistItem(
            id: 'c1',
            name: 'Jaket gunung',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
          ),
          ChecklistItem(
            id: 'c2',
            name: 'Headlamp',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
          ),
        ],
      );
      final repo = _FakePlanRepository(initialPlans: [prauPlan]);
      final controller = PlanController(
        repo,
        AiRepositoryImpl(),
        const _NoopLocationRepository(),
      );
      await controller.load();

      await tester.pumpWidget(_buildRouterApp(planController: controller));
      await tester.pumpAndSettle();

      // Buka daftar checklist dari menu Profil.
      final menuChecklist = find.text('Checklist').last;
      await tester.scrollUntilVisible(
        menuChecklist,
        120,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(menuChecklist);
      await tester.pumpAndSettle();

      expect(find.byType(PlanChecklistsScreen), findsOneWidget);
      expect(find.text('0 dari 1 rencana siap'), findsOneWidget);
      expect(find.text('Naik Gunung Prau'), findsOneWidget);
      expect(find.text('Gunung Prau'), findsOneWidget);
      expect(find.text('Belum siap'), findsOneWidget);

      // Tap kartu Naik Gunung Prau -> swap ke PlanChecklistScreen.
      await tester.tap(find.text('Naik Gunung Prau'));
      await tester.pumpAndSettle();

      expect(find.byType(PlanChecklistScreen), findsOneWidget);
      expect(find.text('Tandai siap'), findsOneWidget);

      // Centang kedua item satu per satu.
      await tester.tap(find.text('Jaket gunung'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Headlamp'));
      await tester.pumpAndSettle();

      // 2/2 item tercentang, tapi checklistReady masih false dan tombol Tandai siap tetap tampil.
      expect(controller.readyChecklistCount, 0);
      expect(find.text('2/2 siap'), findsOneWidget);
      expect(find.text('Tandai siap'), findsOneWidget);

      // Tekan tombol Tandai siap.
      final readyButton = find.widgetWithText(FilledButton, 'Tandai siap');
      expect(tester.getSize(readyButton).height, greaterThanOrEqualTo(44));
      await tester.tap(readyButton);
      await tester.pumpAndSettle();

      expect(find.text('Rencana ditandai siap'), findsOneWidget);
      expect(find.text('Sudah ditandai siap'), findsOneWidget);
      expect(find.text('Batalkan siap'), findsOneWidget);
      expect(controller.readyChecklistCount, 1);

      // Kembali ke PlanChecklistsScreen.
      await tester.tap(find.byTooltip('Kembali'));
      await tester.pumpAndSettle();

      expect(find.byType(PlanChecklistsScreen), findsOneWidget);
      expect(find.text('1 dari 1 rencana siap'), findsOneWidget);
      expect(find.text('Siap'), findsOneWidget);

      // Kembali ke ProfileScreen.
      await tester.tap(find.byTooltip('Kembali'));
      await tester.pumpAndSettle();

      expect(find.byType(ProfileScreen), findsOneWidget);
      final checklistTile = find.ancestor(
        of: find.text('Checklist').first,
        matching: find.byType(InkWell),
      );
      expect(
        find.descendant(of: checklistTile, matching: find.text('1')),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'Banyak rencana (Prau, Bromo, Rinjani): tandai siap 2 dari 3 rencana -> Rencana=3, Checklist=2 dan ketuk kartu buka detail tepat',
    (tester) async {
      await tester.binding.setSurfaceSize(_phone);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      final plans = [
        _buildPlan(
          id: 'p1',
          title: 'Naik Gunung Prau',
          destinationName: 'Gunung Prau',
        ),
        _buildPlan(
          id: 'p2',
          title: 'Sunrise Bromo',
          destinationName: 'Gunung Bromo',
        ),
        _buildPlan(
          id: 'p3',
          title: 'Trekking Rinjani',
          destinationName: 'Gunung Rinjani',
        ),
      ];
      final repo = _FakePlanRepository(initialPlans: plans);
      final controller = PlanController(
        repo,
        AiRepositoryImpl(),
        const _NoopLocationRepository(),
      );
      await controller.load();
      await controller.markAllChecklistReady('p1');
      await controller.markAllChecklistReady('p3');

      await tester.pumpWidget(_buildRouterApp(planController: controller));
      await tester.pumpAndSettle();

      final planTile = find.ancestor(
        of: find.text('Rencana').first,
        matching: find.byType(InkWell),
      );
      final checklistTile = find.ancestor(
        of: find.text('Checklist').first,
        matching: find.byType(InkWell),
      );
      expect(
        find.descendant(of: planTile, matching: find.text('3')),
        findsOneWidget,
      );
      expect(
        find.descendant(of: checklistTile, matching: find.text('2')),
        findsOneWidget,
      );

      await tester.tap(checklistTile);
      await tester.pumpAndSettle();

      expect(find.text('2 dari 3 rencana siap'), findsOneWidget);
      expect(find.text('Naik Gunung Prau'), findsOneWidget);
      expect(find.text('Sunrise Bromo'), findsOneWidget);
      expect(find.text('Trekking Rinjani'), findsOneWidget);

      await tester.tap(find.text('Sunrise Bromo'));
      await tester.pumpAndSettle();
      expect(find.byType(PlanChecklistScreen), findsOneWidget);
      expect(find.text('Sunrise Bromo'), findsOneWidget);
      expect(find.text('Tandai siap'), findsOneWidget);
    },
  );

  testWidgets(
    'Checklist kosong [] tetap bisa Tandai siap dan Batalkan siap, serta uncheck/tambah item belum selesai reset checklistReady',
    (tester) async {
      await tester.binding.setSurfaceSize(_phone);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      final emptyPlan = _buildPlan(
        id: 'p-empty',
        title: 'Camping Ranca Upas',
        destinationName: 'Ranca Upas',
        checklist: const [],
      );
      final repo = _FakePlanRepository(initialPlans: [emptyPlan]);
      final controller = PlanController(
        repo,
        AiRepositoryImpl(),
        const _NoopLocationRepository(),
      );
      await controller.load();

      await tester.pumpWidget(
        _buildRouterApp(
          planController: controller,
          initialLocation: '/plan/p-empty/checklist',
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Belum ada item'), findsOneWidget);
      await tester.tap(find.text('Tandai siap'));
      await tester.pumpAndSettle();

      expect(controller.readyChecklistCount, 1);
      expect(find.text('Sudah ditandai siap'), findsOneWidget);

      await tester.pump(const Duration(seconds: 5));
      await tester.pumpAndSettle();

      final cancelButton = find.widgetWithText(OutlinedButton, 'Batalkan siap');
      expect(tester.getSize(cancelButton).height, greaterThanOrEqualTo(44));
      await tester.tap(cancelButton);
      await tester.pumpAndSettle();

      expect(controller.readyChecklistCount, 0);
      expect(find.text('Status siap dibatalkan'), findsOneWidget);
      expect(find.text('Tandai siap'), findsOneWidget);

      // Tambah item selesai -> tandai siap -> uncheck item -> checklistReady jadi false.
      await controller.addChecklistItem(
        'p-empty',
        const ChecklistItem(
          id: 'c-new',
          name: 'Matras',
          category: ChecklistCategory.perlengkapan,
          isRequired: true,
          isCompleted: true,
        ),
      );
      await controller.markAllChecklistReady('p-empty');
      expect(controller.readyChecklistCount, 1);

      await controller.toggleChecklistItem('p-empty', 'c-new');
      expect(controller.readyChecklistCount, 0);

      await controller.markAllChecklistReady('p-empty');
      expect(controller.readyChecklistCount, 1);

      await controller.addChecklistItem(
        'p-empty',
        const ChecklistItem(
          id: 'c-pending',
          name: 'Kompor portable',
          category: ChecklistCategory.perlengkapan,
          isRequired: false,
          isCompleted: false,
        ),
      );
      expect(controller.readyChecklistCount, 0);
    },
  );

  testWidgets(
    'Deep-link /plan/missing/checklist: loading spinner, error muat saat plans lama ada, dan Rencana tidak ditemukan',
    (tester) async {
      await tester.binding.setSurfaceSize(_phone);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      final existingPlan = _buildPlan(
        id: 'p-existing',
        title: 'Rencana Lama',
        destinationName: 'Kawah Ijen',
      );
      final repo = _FakePlanRepository(initialPlans: [existingPlan]);
      final completer = Completer<Result<List<TripPlan>>>();
      repo.pendingLoad = completer;

      final controller = PlanController(
        repo,
        AiRepositoryImpl(),
        const _NoopLocationRepository(),
      );

      await tester.pumpWidget(
        _buildRouterApp(
          planController: controller,
          initialLocation: '/plan/missing/checklist',
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      completer.complete(const Failure(NetworkFailure('Koneksi gagal')));
      await tester.pumpAndSettle();

      expect(find.text('Gagal memuat checklist'), findsOneWidget);
      expect(find.text('Coba lagi'), findsOneWidget);

      await tester.tap(find.text('Coba lagi'));
      await tester.pumpAndSettle();

      expect(find.text('Rencana tidak ditemukan'), findsOneWidget);
    },
  );

  testWidgets(
    'Judul & daftar destinasi panjang tidak overflow pada viewport 390x844',
    (tester) async {
      await tester.binding.setSurfaceSize(_phone);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      final longPlan = _buildPlan(
        id: 'p-long',
        title:
            'Ekspedisi Lintas Pegunungan Jawa Tengah dan Jawa Timur Selama Libur Panjang Akhir Tahun',
        destinationName: 'Gunung Prau',
        sources: const [
          PlanSource(type: 'destination', id: 'd1', label: 'Gunung Prau'),
          PlanSource(type: 'destination', id: 'd2', label: 'Bukit Sikunir'),
          PlanSource(type: 'destination', id: 'd3', label: 'Kawah Sikidang'),
          PlanSource(type: 'destination', id: 'd4', label: 'Telaga Warna Dieng'),
          PlanSource(type: 'destination', id: 'd5', label: 'Gunung Merbabu'),
        ],
        checklistReady: true,
      );
      final repo = _FakePlanRepository(initialPlans: [longPlan]);
      final controller = PlanController(
        repo,
        AiRepositoryImpl(),
        const _NoopLocationRepository(),
      );
      await controller.load();

      await tester.pumpWidget(
        _buildRouterApp(
          planController: controller,
          initialLocation: '/checklist',
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(find.text('Siap'), findsOneWidget);
      expect(find.text('1 dari 1 rencana siap'), findsOneWidget);
    },
  );

  test('Isolasi akun setUserId & PlanModel.fromJson untuk checklistReady', () async {
    final repo = _FakePlanRepository(
      initialPlans: [
        _buildPlan(
          id: 'pa',
          title: 'Plan A',
          destinationName: 'Gunung Prau',
          checklistReady: true,
        ),
      ],
    );
    repo.setPlansForUser('user-b', [
      _buildPlan(
        id: 'pb',
        title: 'Plan B',
        destinationName: 'Gunung Bromo',
        checklistReady: false,
      ),
    ]);
    final controller = PlanController(
      repo,
      AiRepositoryImpl(),
      const _NoopLocationRepository(),
    );

    await controller.setUserId('user-a');
    expect(controller.readyChecklistCount, 1);

    await controller.setUserId('user-b');
    expect(controller.readyChecklistCount, 0);

    final missingField = PlanModel.fromJson({
      'id': '1',
      'title': 'Lama',
      'startDate': '2026-07-01',
      'endDate': '2026-07-02',
    });
    expect(missingField.checklistReady, isFalse);

    final corruptType = PlanModel.fromJson({
      'id': '2',
      'title': 'Korup',
      'startDate': '2026-07-01',
      'endDate': '2026-07-02',
      'checklistReady': 'yes',
    });
    expect(corruptType.checklistReady, isFalse);

    final validTrue = PlanModel.fromJson({
      'id': '3',
      'title': 'Siap',
      'startDate': '2026-07-01',
      'endDate': '2026-07-02',
      'checklistReady': true,
    });
    expect(validTrue.checklistReady, isTrue);
  });

  test('Batas 100 item checklist menolak item ke-101 dan menjaga checklistReady', () async {
    List<ChecklistItem> buildItems(int count, {bool completed = true}) => [
      for (var i = 0; i < count; i++)
        ChecklistItem(
          id: 'item-$i',
          name: 'Item $i',
          category: ChecklistCategory.perlengkapan,
          isRequired: true,
          isCompleted: completed,
        ),
    ];

    final plan100 = _buildPlan(
      id: 'p-100',
      title: 'Rencana 100 Item',
      destinationName: 'Gunung Prau',
      checklist: buildItems(100),
      checklistReady: true,
    );
    final repo = _FakePlanRepository(initialPlans: [plan100]);
    final controller = PlanController(
      repo,
      AiRepositoryImpl(),
      const _NoopLocationRepository(),
    );
    await controller.load();

    final res101 = await controller.addChecklistItem(
      'p-100',
      const ChecklistItem(
        id: 'item-101',
        name: 'Item 101',
        category: ChecklistCategory.perlengkapan,
        isRequired: true,
        isCompleted: false,
      ),
    );
    expect(res101.isFailed, isTrue);
    expect(repo.updateCount, 0);
    expect(controller.findPlanById('p-100')!.checklist, hasLength(100));
    expect(controller.findPlanById('p-100')!.checklistReady, isTrue);

    final gen100 = await controller.generateChecklist('p-100');
    expect(gen100.isFailed, isTrue);
    expect(repo.updateCount, 0);
    expect(controller.findPlanById('p-100')!.checklist, hasLength(100));
    expect(controller.findPlanById('p-100')!.checklistReady, isTrue);

    // 99 item siap + item ke-100 belum selesai -> tersimpan 100 item via PlanModel.toUpdateJson & checklistReady=false.
    final plan99 = _buildPlan(
      id: 'p-99',
      title: 'Rencana 99 Item',
      destinationName: 'Gunung Bromo',
      checklist: buildItems(99),
      checklistReady: true,
    );
    repo.setPlansForUser('user-a', [plan99]);
    await controller.load();

    final res100 = await controller.addChecklistItem(
      'p-99',
      const ChecklistItem(
        id: 'item-100',
        name: 'Item 100',
        category: ChecklistCategory.perlengkapan,
        isRequired: true,
        isCompleted: false,
      ),
    );
    expect(res100.isSuccess, isTrue);
    final updated = controller.findPlanById('p-99')!;
    expect(updated.checklist, hasLength(100));
    expect(updated.checklistReady, isFalse);
    final payload = PlanModel.toUpdateJson(updated);
    expect(payload['checklist'] as List, hasLength(100));
    expect(payload['checklistReady'], isFalse);
  });

  testWidgets(
    'Deep-link frame pertama menampilkan spinner dan refresh gagal dengan daftar lama non-kosong menampilkan Coba lagi',
    (tester) async {
      await tester.binding.setSurfaceSize(_phone);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      final planA = _buildPlan(
        id: 'plan-a',
        title: 'Rencana A',
        destinationName: 'Gunung Prau',
      );
      final planB = _buildPlan(
        id: 'plan-b',
        title: 'Rencana B',
        destinationName: 'Gunung Rinjani',
        checklist: const [
          ChecklistItem(
            id: 'cb-1',
            name: 'Carrier 60L',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
          ),
        ],
      );
      final repo = _FakePlanRepository(initialPlans: [planA]);
      final controller = PlanController(
        repo,
        AiRepositoryImpl(),
        const _NoopLocationRepository(),
      );

      // Frame pertama sebelum load() berjalan -> wajib tampil CircularProgressIndicator, bukan Rencana tidak ditemukan.
      await tester.pumpWidget(
        _buildRouterApp(
          planController: controller,
          initialLocation: '/plan/plan-b/checklist',
        ),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Rencana tidak ditemukan'), findsNothing);
      await tester.pumpAndSettle();

      // Muat daftar lama [planA], lalu refresh kedua gagal (error != null & plans.isNotEmpty).
      await controller.load();
      expect(controller.plans, hasLength(1));
      repo.nextLoadError = 'Gagal terhubung ke server';
      await controller.load();
      expect(controller.plans, hasLength(1));
      expect(controller.error, isNotNull);

      await tester.pumpWidget(
        _buildRouterApp(
          planController: controller,
          initialLocation: '/plan/plan-b/checklist',
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Gagal memuat checklist'), findsOneWidget);
      expect(find.text('Coba lagi'), findsOneWidget);
      expect(find.text('Rencana tidak ditemukan'), findsNothing);

      // Pulihkan repo dengan [planA, planB] dan ketuk Coba lagi.
      repo.setPlansForUser('user-a', [planA, planB]);
      await tester.tap(find.text('Coba lagi'));
      await tester.pumpAndSettle();

      expect(find.text('Rencana B'), findsOneWidget);
      expect(find.text('Carrier 60L'), findsOneWidget);
    },
  );

  testWidgets(
    '_CostToggle memiliki target sentuh >=44x44dp dan hanya mengubah isOwned tanpa mengubah isCompleted',
    (tester) async {
      await tester.binding.setSurfaceSize(_phone);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      final plan = _buildPlan(
        id: 'p-cost',
        title: 'Rencana Biaya',
        destinationName: 'Gunung Prau',
        checklist: const [
          ChecklistItem(
            id: 'c-cost',
            name: 'Sewa tenda',
            category: ChecklistCategory.perlengkapan,
            isRequired: true,
            isCompleted: false,
            isOwned: false,
            estimatedCost: 50000,
          ),
        ],
      );
      final repo = _FakePlanRepository(initialPlans: [plan]);
      final controller = PlanController(
        repo,
        AiRepositoryImpl(),
        const _NoopLocationRepository(),
      );
      await controller.load();

      await tester.pumpWidget(
        _buildRouterApp(
          planController: controller,
          initialLocation: '/plan/p-cost/checklist',
        ),
      );
      await tester.pumpAndSettle();

      final toggleTarget = find
          .ancestor(
            of: find.text('Sudah punya'),
            matching: find.byType(InkWell),
          )
          .first;
      final size = tester.getSize(toggleTarget);
      expect(size.width, greaterThanOrEqualTo(44));
      expect(size.height, greaterThanOrEqualTo(44));

      await tester.tap(toggleTarget);
      await tester.pumpAndSettle();

      final item = controller.findPlanById('p-cost')!.checklist.single;
      expect(item.isOwned, isTrue);
      expect(item.isCompleted, isFalse);
      expect(tester.takeException(), isNull);
    },
  );
}
