import 'dart:async';
import 'dart:convert';

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/data/data_sources/ai_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_itinerary.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_options.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/screens/destination_detail_screen.dart';
import 'package:dolenae_mobile/src/features/plan/data/data_sources/plan_local_data_source.dart';
import 'package:dolenae_mobile/src/features/plan/data/data_sources/plan_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/plan/data/models/plan_model.dart';
import 'package:dolenae_mobile/src/features/plan/data/repositories/plan_repository_impl.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/plan_draft.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/user_location.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/location_repository.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/routes/plan_routes.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_checklist_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_detail_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_new_screen.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_plans_screen.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_stepper.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../helpers/test_harness.dart';

TripPlan _samplePlan({
  String id = 'plan-1',
  String title = 'Trip Bromo',
  List<String> destinationIds = const ['dest-bromo'],
  int totalBudget = 1500000,
  String engine = 'draft',
  List<PlanDay> days = const [],
  List<PlanSource> sources = const [],
  List<ChecklistItem> checklist = const [],
}) {
  final start = DateTime(2026, 8, 1);
  final end = DateTime(2026, 8, 3);
  return TripPlan(
    id: id,
    title: title,
    startDate: start,
    endDate: end,
    peopleCount: 2,
    totalBudget: totalBudget,
    summary: 'Ringkasan perjalanan',
    briefing: const PlanBriefing(
      grounded: ['Data jalur terverifikasi dari katalog Dolenae.'],
    ),
    days: days.isNotEmpty
        ? days
        : [
            const PlanDay(
              day: 1,
              title: 'Hari 1: Gunung Bromo',
              items: [
                PlanItem(
                  destinationId: 'dest-bromo',
                  destinationName: 'Gunung Bromo',
                  routeId: 'route-bromo-1',
                  supportIds: ['sup-1'],
                  activity: 'Sunrise Penanjakan',
                  startTime: '04:00',
                  costEstimate: 'Rp350.000',
                  notes: 'Bawa jaket tebal',
                ),
              ],
            ),
          ],
    sources: sources,
    checklist: checklist,
    destinationIds: destinationIds,
    engine: engine,
    createdAt: DateTime(2026, 7, 1),
  );
}

class _FakePlanRemoteDataSource extends PlanRemoteDataSource {
  _FakePlanRemoteDataSource() : super(ApiClient(baseUrl: 'http://localhost'));

  final Map<String, List<TripPlan>> byUser = {};
  String activeUser = 'user-a';

  @override
  Future<List<TripPlan>> fetchPlans({String? authToken}) async => [
        ...(byUser[activeUser] ?? const []),
      ];

  @override
  Future<({TripPlan plan, bool replayed})> createPlanWithMeta(
    TripPlan plan, {
    String? authToken,
    String? clientId,
  }) async => (
    plan: await createPlan(plan, authToken: authToken, clientId: clientId),
    replayed: false,
  );

  @override
  Future<TripPlan> createPlan(
    TripPlan plan, {
    String? authToken,
    String? clientId,
  }) async {
    final list = [...(byUser[activeUser] ?? const <TripPlan>[])];
    final created = plan.id.isEmpty
        ? plan.copyWith(id: 'srv-${list.length + 1}', clientId: clientId)
        : plan.copyWith(clientId: clientId ?? plan.clientId);
    byUser[activeUser] = [created, ...list];
    return created;
  }

  @override
  Future<TripPlan> updatePlan(TripPlan plan, {String? authToken}) async {
    final list = [...(byUser[activeUser] ?? const <TripPlan>[])];
    final idx = list.indexWhere((p) => p.id == plan.id);
    if (idx >= 0) {
      list[idx] = plan;
    } else {
      list.insert(0, plan);
    }
    byUser[activeUser] = list;
    return plan;
  }

  @override
  Future<void> deletePlan(String id, {String? authToken}) async {
    final list = [...(byUser[activeUser] ?? const <TripPlan>[])];
    byUser[activeUser] = list.where((p) => p.id != id).toList();
  }

  @override
  Future<void> deletePlanByClientId(
    String clientId, {
    String? authToken,
  }) async {
    final list = [...(byUser[activeUser] ?? const <TripPlan>[])];
    byUser[activeUser] = list
        .where((p) => p.clientId != clientId && p.id != clientId)
        .toList();
  }
}

class _StubLocationRepo implements LocationRepository {
  const _StubLocationRepo();
  @override
  Future<Result<UserLocation>> detectCurrent() async => const Success(
        UserLocation(
          latitude: -6.2,
          longitude: 106.8,
          province: 'DKI Jakarta',
          city: 'Jakarta',
        ),
      );
}

class _CapturingAiRepo implements AiRepository {
  AiPreference? lastPreference;
  bool? lastRefresh;
  int calls = 0;

  @override
  AiPreference get defaultPreference => const AiPreference(
        regions: [],
        activities: [],
        terrains: [],
        durationDays: 2,
        rawText: '',
      );

  @override
  AiOptions get defaultOptions => const AiOptions();

  @override
  List<String> get promptSuggestions => const [];

  @override
  Future<Result<AiOptions>> loadOptions() async => Success(defaultOptions);

  @override
  Future<Result<AiResult>> run(
    AiPreference preference, {
    bool refresh = false,
  }) async {
    calls++;
    lastPreference = preference;
    lastRefresh = refresh;
    return Success(
      AiResult(
        preference: preference,
        items: const [],
        relatedChecklist: const ['Jaket gunung'],
        summary: 'Rencana AI tersusun',
        kind: 'gemini',
        itinerary: const AiItinerary(
          title: 'Trip Bromo AI',
          summary: 'Itinerary disusun oleh Gemini',
          days: [
            AiItineraryDay(
              day: 1,
              title: 'Hari 1: Eksplorasi Bromo',
              items: [
                AiItineraryItem(
                  destinationId: 'dest-bromo',
                  destinationName: 'Gunung Bromo',
                  routeId: 'route-bromo-cemoro',
                  supportIds: ['sup-jeep-1', 'sup-stay-1'],
                  activity: 'Pendakian kawah via Cemoro Lawang',
                  startTime: '05:00',
                  costEstimate: 'Rp450.000',
                ),
              ],
            ),
          ],
        ),
        briefing: const AiBriefing(
          grounded: ['Jalur Cemoro Lawang aktif dan tersedia jeep.'],
        ),
        sources: const [
          AiSource(
            type: 'destination',
            id: 'dest-bromo',
            label: 'Gunung Bromo',
          ),
          AiSource(
            type: 'route',
            id: 'route-bromo-cemoro',
            label: 'Jalur Cemoro Lawang',
          ),
        ],
      ),
    );
  }
}

class _DelayedSwitchPlanRepo implements PlanRepository {
  final Completer<Result<List<TripPlan>>> firstLoad = Completer();
  String? currentUser;
  int updateCalls = 0;

  @override
  void setUserId(String? userId) {
    currentUser = userId;
  }

  @override
  Future<Result<List<TripPlan>>> load() {
    if (currentUser == 'user-a') {
      return firstLoad.future;
    }
    return Future.value(
      Success([_samplePlan(id: 'plan-b', title: 'Trip Akun B')]),
    );
  }

  @override
  Future<Result<TripPlan>> create(TripPlan plan) async =>
      Success(plan.copyWith(id: 'plan-created-1'));

  @override
  Future<Result<TripPlan>> update(TripPlan plan) async {
    updateCalls++;
    return Success(plan);
  }

  @override
  Future<Result<void>> delete(String id) async => const Success(null);
}

void main() {
  setUpAll(useTestFonts);

  group('PlanRepositoryImpl & isolasi per akun', () {
    test(
      'akun baru tanpa data tidak mendapat PlanSeedData dan membersihkan seed lama',
      () async {
        final legacySeed = _samplePlan(
          id: 'plan-dieng-01',
          title: 'Trip Dieng',
          engine: 'seed',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(legacySeed),
          ]),
        });
        final prefs = await SharedPreferences.getInstance();
        final remote = _FakePlanRemoteDataSource();
        final repo = PlanRepositoryImpl(PlanLocalDataSource(prefs), remote);
        repo.setUserId('user-a');

        final result = await repo.load();
        expect(result.isSuccess, isTrue);
        expect(result.valueOrNull, isEmpty);

        // Pastikan entri seed lama sudah dibersihkan dari local cache.
        final local = PlanLocalDataSource(prefs)..setUserId('user-a');
        expect(local.read(), isEmpty);
      },
    );

    test('loadEpoch mencegah hasil akun lama menimpa akun baru', () async {
      final repo = _DelayedSwitchPlanRepo();
      final controller = PlanController(
        repo,
        _CapturingAiRepo(),
        const _StubLocationRepo(),
      );

      final pendingA = controller.setUserId('user-a');
      await controller.setUserId('user-b');
      expect(controller.plans.map((p) => p.id), ['plan-b']);

      // Selesaikan load akun A yang terlambat — harus diabaikan.
      repo.firstLoad.complete(
        Success([_samplePlan(id: 'plan-a', title: 'Trip Akun A')]),
      );
      await pendingA;
      expect(controller.plans.map((p) => p.id), ['plan-b']);
    });
  });

  group('PlanController AI & Retry', () {
    test(
      'generateAi dan retryAi mengirim parameter lengkap dan menyimpan routeId/supportIds',
      () async {
        final aiRepo = _CapturingAiRepo();
        final planRepo = _DelayedSwitchPlanRepo();
        final controller = PlanController(
          planRepo,
          aiRepo,
          const _StubLocationRepo(),
        );
        final created = await controller.createDraft(
          PlanDraft(
            name: 'Liburan Bromo',
            startDate: DateTime(2026, 8, 1),
            days: 3,
            peopleCount: 2,
            totalBudget: 1500000,
          ),
          [DestinationSeedData.items.firstWhere((d) => d.id == 'dest-bromo')],
        );
        expect(created.isSuccess, isTrue);
        final planId = created.plan!.id;
        planRepo.updateCalls = 0;

        await controller.generateAi(planId);

        final pref = aiRepo.lastPreference!;
        expect(aiRepo.lastRefresh, isFalse);
        expect(pref.destinationIds, ['dest-bromo']);
        expect(pref.peopleCount, 2);
        expect(pref.startDate, '2026-08-01');
        expect(pref.planTitle, 'Liburan Bromo');
        expect(pref.needsAccommodation, isTrue);
        expect(pref.needsTransport, isTrue);
        expect(pref.rawText, isEmpty);

        final updated = controller.plans.firstWhere((p) => p.id == planId);
        expect(updated.engine, 'gemini');
        expect(updated.destinationIds, ['dest-bromo']);
        expect(updated.days.first.items.first.routeId, 'route-bromo-cemoro');
        expect(
          updated.days.first.items.first.supportIds,
          ['sup-jeep-1', 'sup-stay-1'],
        );
        expect(planRepo.updateCalls, 1);

        await controller.retryAi(planId);
        expect(aiRepo.lastRefresh, isTrue);
      },
    );
  });

  group('DestinationDetailScreen -> AddToPlanSheet & PlanNewScreen', () {
    testWidgets('0 rencana membuka PlanNewScreen dengan destinasi terpilih', (
      tester,
    ) async {
      await usePhone(tester);
      final store = TestStores(plans: const []);
      await store.plan.load();
      final dest = DestinationSeedData.items.first;

      final router = GoRouter(
        initialLocation: '/',
        routes: [
          GoRoute(
            path: '/',
            builder: (_, _) => DestinationDetailScreen(destinationId: dest.id),
          ),
          ...planRoutes,
        ],
      );

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider.value(value: store.auth),
            ChangeNotifierProvider.value(value: store.categoriesController),
            ChangeNotifierProvider.value(value: store.notifications),
            ChangeNotifierProvider.value(value: store.saved),
            ChangeNotifierProvider.value(value: store.ai),
            ChangeNotifierProvider.value(value: store.settings),
            ChangeNotifierProvider.value(value: store.search),
            ChangeNotifierProvider.value(value: store.destinations),
            ChangeNotifierProvider.value(value: store.facilities),
            ChangeNotifierProvider.value(value: store.routes),
            ChangeNotifierProvider.value(value: store.plan),
            ChangeNotifierProvider.value(value: store.checklist),
          ],
          child: MaterialApp.router(routerConfig: router),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Tambah ke rencana'));
      await tester.pumpAndSettle();

      expect(find.byType(PlanNewScreen), findsOneWidget);
      expect(find.text('Destinasi dipilih'), findsOneWidget);
      expect(find.text('Buat & susun rencana AI'), findsOneWidget);
    });

    testWidgets(
      '>=1 rencana membuka AddToPlanSheet, tandai Sudah ada, dan menambah ke rencana lain',
      (tester) async {
        await usePhone(tester);
        final dest = DestinationSeedData.items.first;
        final existingPlan = _samplePlan(
          id: 'plan-existing',
          title: 'Rencana Sudah Ada',
          destinationIds: [dest.id],
        );
        final targetPlan = _samplePlan(
          id: 'plan-target',
          title: 'Rencana Tujuan Baru',
          destinationIds: const ['dest-lain'],
          days: const [
            PlanDay(
              day: 1,
              title: 'Hari 1',
              items: [
                PlanItem(
                  destinationId: 'dest-lain',
                  destinationName: 'Destinasi Lain',
                ),
              ],
            ),
          ],
        );
        final store = TestStores(plans: [existingPlan, targetPlan]);
        await store.plan.load();

        await tester.pumpWidget(
          wrapScreen(
            DestinationDetailScreen(destinationId: dest.id),
            store: store,
          ),
        );
        await tester.pumpAndSettle();

        await tester.tap(find.text('Tambah ke rencana'));
        await tester.pumpAndSettle();

        expect(find.text('Tambah ke rencana'), findsWidgets);
        expect(find.text('Sudah ada'), findsOneWidget);

        await tester.tap(find.text('Rencana Tujuan Baru'));
        await tester.pumpAndSettle();

        final updated = store.plan.plans.firstWhere(
          (p) => p.id == 'plan-target',
        );
        expect(updated.destinationIds, contains(dest.id));
      },
    );
  });

  group('PlanDetailScreen UI & SavedPlansScreen dinamis', () {
    testWidgets(
      'PlanDetailScreen menampilkan SUMBER DATA, perbandingan budget, dan >=44dp tap target tanpa overflow',
      (tester) async {
        await usePhone(tester);
        final plan = _samplePlan(
          id: 'plan-ui-1',
          title: 'Ekspedisi Bromo',
          engine: 'gemini',
          sources: const [
            PlanSource(
              type: 'destination',
              id: 'dest-bromo',
              label: 'Gunung Bromo',
            ),
            PlanSource(
              type: 'route',
              id: 'route-1',
              label: 'Cemoro Lawang',
            ),
          ],
          checklist: const [
            ChecklistItem(
              id: 'chk-1',
              name: 'Sewa Jeep',
              category: ChecklistCategory.biaya,
              isRequired: true,
              estimatedCost: 400000,
            ),
          ],
        );
        final store = TestStores(plans: [plan]);
        await store.plan.load();

        await tester.pumpWidget(
          wrapScreen(const PlanDetailScreen(planId: 'plan-ui-1'), store: store),
        );
        await tester.pumpAndSettle();

        expect(find.text('SUMBER DATA'), findsOneWidget);
        expect(find.textContaining('Cemoro Lawang'), findsOneWidget);

        final addDestFinder = find.text('Tambah destinasi');
        await scrollTo(tester, addDestFinder);
        expect(addDestFinder, findsOneWidget);
        final addButton = find.ancestor(
          of: addDestFinder,
          matching: find.byType(InkWell),
        );
        expect(
          tester.getSize(addButton.first).height,
          greaterThanOrEqualTo(44),
        );

        await scrollTo(tester, find.text('Target budget total'));
        expect(find.text('Target budget total'), findsOneWidget);
        expect(find.text('Estimasi AI total'), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );

    testWidgets(
      'SavedPlansScreen membaca PlanController.plans secara dinamis saat items null',
      (tester) async {
        await usePhone(tester);
        final store = TestStores(
          plans: [_samplePlan(id: 'plan-dyn', title: 'Rencana Dinamis Akun')],
        );
        await store.plan.load();

        await tester.pumpWidget(
          wrapScreen(const SavedPlansScreen(), store: store),
        );
        await tester.pumpAndSettle();

        expect(find.text('Rencana Dinamis Akun'), findsOneWidget);
      },
    );
  });

  group('Round 1 AppSec & QA Regressions', () {
    test(
      'delayed load & create across account switch never pollute Account B online or offline cache',
      () async {
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();
        final delayedRemote = _DelayedSwitchRemote();
        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          delayedRemote,
        );
        final controller = PlanController(
          repo,
          _CapturingAiRepo(),
          const _StubLocationRepo(),
        );

        await controller.setUserId('user-a');
        // Start delayed create for Account A while switching to Account B
        delayedRemote.delayCreate = Completer<TripPlan>();
        final pendingCreateA = controller.createDraft(
          PlanDraft(
            name: 'Privat Akun A',
            startDate: DateTime(2026, 9, 1),
            days: 2,
            peopleCount: 1,
            totalBudget: 500000,
          ),
          [DestinationSeedData.items.first],
        );

        delayedRemote.activeUser = 'user-b';
        await controller.setUserId('user-b');
        expect(controller.plans, isEmpty);

        // Complete Account A's delayed create AFTER switch to Account B
        delayedRemote.delayCreate!.complete(
          _samplePlan(id: 'srv-a-private', title: 'Privat Akun A'),
        );
        final createdResult = await pendingCreateA;
        expect(createdResult.isCancelled, isTrue);
        expect(createdResult.plan, isNull);
        expect(controller.plans, isEmpty);

        // Reopen Account B offline: local cache must remain unpolluted
        final offlineRepo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          _FailingRemote(),
        )..setUserId('user-b');
        final offlineLoaded = await offlineRepo.load();
        expect(offlineLoaded.valueOrNull, isEmpty);
      },
    );

    test(
      'ownerless plan.list.v1 stays in guest, while scoped local plans migrate idempotently without seeds',
      () async {
        final seedPlan = _samplePlan(
          id: 'plan-dieng-01',
          title: 'Trip Dieng',
          engine: 'seed',
        );
        final guestPlan = _samplePlan(
          id: 'local-guest-1',
          title: 'Rencana Guest Lokal',
          engine: 'draft',
        );
        final userPlan = _samplePlan(
          id: 'local-user-1',
          title: 'Rencana Lokal Pengguna',
          engine: 'draft',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1': jsonEncode([
            PlanModel.toLocalJson(seedPlan),
            PlanModel.toLocalJson(guestPlan),
          ]),
          'plan.list.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(seedPlan),
            PlanModel.toLocalJson(userPlan),
          ]),
        });
        final prefs = await SharedPreferences.getInstance();
        final remote = _FakePlanRemoteDataSource();
        final repo = PlanRepositoryImpl(PlanLocalDataSource(prefs), remote)
          ..setUserId('user-a');

        final first = await repo.load();
        expect(first.isSuccess, isTrue);
        expect(first.valueOrNull?.map((p) => p.title), [
          'Rencana Lokal Pengguna',
        ]);
        expect(remote.byUser['user-a']?.length, 1);

        // Retry load: must stay idempotent and never duplicate on server
        final second = await repo.load();
        expect(second.valueOrNull?.length, 1);
        expect(remote.byUser['user-a']?.length, 1);

        // Ownerless plan.list.v1 stayed local in guest scope (never uploaded to user-a)
        final guestLocal = PlanLocalDataSource(prefs).read(scope: 'guest');
        expect(guestLocal?.map((p) => p.title), ['Rencana Guest Lokal']);
      },
    );

    test(
      'enforces 7-destination AI cap and truncates >80 province / >500 note in AiRemoteDataSource',
      () async {
        final repo = _DelayedSwitchPlanRepo();
        final controller = PlanController(
          repo,
          _CapturingAiRepo(),
          const _StubLocationRepo(),
        );

        final tooMany = List.generate(8, (i) {
          final base = DestinationSeedData.items.first;
          return base;
        });
        final rejected = await controller.createDraft(
          PlanDraft(
            name: '8 Destinasi',
            startDate: DateTime(2026, 8, 1),
            days: 3,
            peopleCount: 1,
            totalBudget: 1000000,
          ),
          tooMany,
        );
        expect(rejected.isFailed, isTrue);
        expect(rejected.plan, isNull);
        expect(controller.error, contains('Maksimal 7'));

        Map<String, dynamic>? capturedBody;
        final mockHttp = MockClient((req) async {
          capturedBody = jsonDecode(req.body) as Map<String, dynamic>;
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'engine': 'deterministic',
                'itinerary': {
                  'title': 'OK',
                  'summary': 'OK',
                  'days': [],
                },
                'briefing': {'grounded': [], 'general': [], 'warnings': []},
                'checklist': [],
                'sources': [],
              },
            }),
            200,
          );
        });
        final ds = AiRemoteDataSource(
          ApiClient(httpClient: mockHttp, baseUrl: 'http://localhost'),
        );
        await ds.generate(
          AiPreference(
            destinationIds: List.generate(9, (i) => 'dest-$i'),
            originProvince: 'P' * 100,
            note: 'N' * 650,
            planTitle: 'T' * 150,
          ),
        );
        expect((capturedBody!['destinationIds'] as List).length, 7);
        expect((capturedBody!['originProvince'] as String).length, 80);
        expect((capturedBody!['note'] as String).length, 500);
        expect((capturedBody!['planTitle'] as String).length, 120);
      },
    );

    testWidgets(
      'AI persistence failure rolls back to baseline, PlanChecklistScreen surfaces failure, and DnStepper >=44dp',
      (tester) async {
        await usePhone(tester);
        final failRepo = _FailingUpdatePlanRepo([
          _samplePlan(
            id: 'plan-fail-1',
            title: 'Baseline Plan',
            engine: 'draft',
            checklist: const [
              ChecklistItem(
                id: 'c1',
                name: 'Tenda',
                category: ChecklistCategory.perlengkapan,
                isRequired: true,
              ),
            ],
          ),
        ]);
        final controller = PlanController(
          failRepo,
          _CapturingAiRepo(),
          const _StubLocationRepo(),
        );
        await controller.load();

        await controller.generateAi('plan-fail-1');
        final afterFail = controller.plans.first;
        // Baseline must remain 'draft' (not unsaved 'gemini') on persistence failure
        expect(afterFail.engine, 'draft');
        expect(afterFail.aiWarning, contains('Gagal'));

        final failController = PlanController(
          failRepo,
          _CapturingAiRepo(),
          const _StubLocationRepo(),
        );
        await failController.load();
        await tester.pumpWidget(
          ChangeNotifierProvider<PlanController>.value(
            value: failController,
            child: MaterialApp(
              home: Scaffold(
                body: Column(
                  children: [
                    DnStepper(
                      value: 2,
                      min: 1,
                      max: 7,
                      onChanged: (_) {},
                    ),
                    const Expanded(
                      child: PlanChecklistScreen(planId: 'plan-fail-1'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();

        final stepButtons = find.descendant(
          of: find.byType(DnStepper),
          matching: find.byType(InkWell),
        );
        expect(tester.getSize(stepButtons.first).width, greaterThanOrEqualTo(44));
        expect(
          tester.getSize(stepButtons.first).height,
          greaterThanOrEqualTo(44),
        );

        await tester.tap(find.text('Tandai semua siap'));
        await tester.pumpAndSettle();
        expect(find.text('Semua item ditandai siap'), findsNothing);
        expect(find.textContaining('Gagal'), findsOneWidget);
      },
    );
  });

  group('Round 2 AppSec & QA Regressions', () {
    test(
      'real HTTP delayed GET across account switch sends zero POSTs with Account B token and keeps Account B isolated offline',
      () async {
        final pendingA = _samplePlan(
          id: 'local-a-1',
          title: 'Privat Pending Akun A',
          engine: 'draft',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.user-a': jsonEncode([PlanModel.toLocalJson(pendingA)]),
        });
        final prefs = await SharedPreferences.getInstance();
        final delayedGetA = Completer<http.Response>();
        final requests = <Map<String, String>>[];

        final mockHttp = MockClient((req) async {
          requests.add({
            'method': req.method,
            'path': req.url.path,
            'auth': req.headers['Authorization'] ?? '',
          });
          if (req.method == 'GET' &&
              req.headers['Authorization'] == 'Bearer token-a') {
            return delayedGetA.future;
          }
          return http.Response(
            jsonEncode({'success': true, 'data': []}),
            200,
          );
        });

        final client = ApiClient(httpClient: mockHttp, baseUrl: 'http://localhost')
          ..token = 'token-a';
        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          PlanRemoteDataSource(client),
        );
        final controller = PlanController(
          repo,
          _CapturingAiRepo(),
          const _StubLocationRepo(),
        );

        final loadA = controller.setUserId('user-a');
        await Future<void>.delayed(Duration.zero);

        // Switch to Account B with token-b while Account A's GET is in flight
        client.token = 'token-b';
        await controller.setUserId('user-b');
        expect(controller.plans, isEmpty);

        // Complete Account A's delayed GET
        delayedGetA.complete(
          http.Response(jsonEncode({'success': true, 'data': []}), 200),
        );
        await loadA;

        // Zero POSTs should have fired, and Account B remains empty online & offline
        expect(
          requests.where((r) => r['method'] == 'POST'),
          isEmpty,
        );
        expect(controller.plans, isEmpty);

        final offlineRepo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          _FailingRemote(),
        )..setUserId('user-b');
        expect((await offlineRepo.load()).valueOrNull, isEmpty);
      },
    );

    test(
      'pending queue retries partial failure across non-empty server list and handles lost ACK idempotently via clientId',
      () async {
        final local1 = _samplePlan(id: 'local-1', title: 'Lokal Satu');
        final local2 = _samplePlan(id: 'local-2', title: 'Lokal Dua');
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(local1),
            PlanModel.toLocalJson(local2),
          ]),
        });
        final prefs = await SharedPreferences.getInstance();
        final serverRows = <Map<String, dynamic>>[];
        var dropSecondPostAck = true;
        var seq = 1;

        final mockHttp = MockClient((req) async {
          if (req.method == 'GET') {
            return http.Response(
              jsonEncode({'success': true, 'data': serverRows}),
              200,
            );
          }
          if (req.method == 'POST') {
            final body = jsonDecode(req.body) as Map<String, dynamic>;
            final clientId = body['clientId'] as String?;
            final existing = serverRows.cast<Map<String, dynamic>?>().firstWhere(
              (r) => clientId != null && r?['clientId'] == clientId,
              orElse: () => null,
            );
            if (existing != null) {
              return http.Response(
                jsonEncode({'success': true, 'data': existing}),
                200,
              );
            }
            final created = {
              ...body,
              'id': 'srv-${seq++}',
              'userId': 'user-a',
              'createdAt': '2026-08-01T00:00:00.000Z',
              'updatedAt': '2026-08-01T00:00:00.000Z',
            };
            serverRows.add(created);
            if (clientId == 'local-2' && dropSecondPostAck) {
              dropSecondPostAck = false;
              // Simulate lost ACK after server committed!
              throw http.ClientException('Connection reset');
            }
            return http.Response(
              jsonEncode({'success': true, 'data': created}),
              201,
            );
          }
          return http.Response('{}', 404);
        });

        final client = ApiClient(httpClient: mockHttp, baseUrl: 'http://localhost')
          ..token = 'token-a';
        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          PlanRemoteDataSource(client),
        )..setUserId('user-a');

        // First sync: local-1 succeeds, local-2 loses ACK after commit
        final first = await repo.load();
        expect(first.isSuccess, isTrue);
        expect(first.valueOrNull?.length, 2);

        // Second sync: server returns non-empty [srv-1, srv-2] with clientIds;
        // local-2 is matched by clientId, NOT duplicated on server!
        final second = await repo.load();
        expect(second.isSuccess, isTrue);
        expect(serverRows.length, 2);
        expect(
          PlanLocalDataSource(prefs).readPendingMigration('user-a'),
          isEmpty,
        );
      },
    );

    test(
      'PlanController queues updateOriginProvince with checklist, preserves baseline notice on AI error, and returns cancelled on account switch',
      () async {
        final initial = _samplePlan(
          id: 'plan-q-1',
          title: 'Queued Plan',
          checklist: const [
            ChecklistItem(
              id: 'c1',
              name: 'Kompas',
              category: ChecklistCategory.perlengkapan,
              isRequired: true,
            ),
          ],
        ).copyWith(notice: 'Catatan tersimpan penting');
        final repo = _SlowUpdateRepo([initial]);
        final aiRepo = _FailingAiRepo();
        final controller = PlanController(
          repo,
          aiRepo,
          const _StubLocationRepo(),
        );
        await controller.load();

        // Overlapping updateOriginProvince + toggleChecklistItem must serialize without clobbering
        final originFut = controller.updateOriginProvince(
          'plan-q-1',
          'Jawa Barat',
        );
        final toggleFut = controller.toggleChecklistItem('plan-q-1', 'c1');
        final originRes = await originFut;
        final toggleRes = await toggleFut;
        expect(originRes.isSuccess, isTrue);
        expect(toggleRes.isSuccess, isTrue);
        expect(controller.plans.first.originProvince, 'Jawa Barat');
        expect(controller.plans.first.checklist.first.isCompleted, isTrue);

        // AI failure must roll back while preserving saved notice
        await controller.generateAi('plan-q-1');
        expect(controller.plans.first.notice, 'Catatan tersimpan penting');
        expect(controller.plans.first.aiWarning, contains('AI gagal'));

        // Account switch while markAllChecklistReady is in flight returns cancelled (never success)
        final beforeSwitch = controller.plans.first;
        repo.delayNextUpdate = Completer<TripPlan>();
        final markFut = controller.markAllChecklistReady('plan-q-1');
        await Future<void>.delayed(Duration.zero);
        final switchFut = controller.setUserId('user-other');
        repo.delayNextUpdate!.complete(beforeSwitch);
        final markRes = await markFut;
        await switchFut;
        expect(markRes.isCancelled, isTrue);
        expect(markRes.isSuccess, isFalse);
      },
    );
  });

  group('Round 3 AppSec & QA Regressions', () {
    test(
      'legacy migration retries after failed guest write and preserves scoped plans when writePendingMigration fails',
      () async {
        final legacyPlan = _samplePlan(id: 'leg-1', title: 'Rencana Legacy');
        final scopedPlan = _samplePlan(id: 'scp-1', title: 'Rencana Akun A');
        SharedPreferences.setMockInitialValues({
          'plan.list.v1': jsonEncode([PlanModel.toLocalJson(legacyPlan)]),
          'plan.list.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(scopedPlan),
          ]),
        });
        final realPrefs = await SharedPreferences.getInstance();
        final failingPrefs = _FailingWritePrefs(
          realPrefs,
          failSetStringKeys: {'plan.list.v1.guest', 'plan.pending.v1.user-a'},
        );

        // 1. Failing guest write keeps plan.list.v1 intact across restart
        final ds1 = PlanLocalDataSource(failingPrefs);
        expect(await ds1.migrateLegacyIfNeeded(), isFalse);
        expect(realPrefs.containsKey('plan.list.v1'), isTrue);

        // Fresh instance (restart) with working prefs succeeds cleanly
        final ds2 = PlanLocalDataSource(realPrefs);
        expect(await ds2.migrateLegacyIfNeeded(), isTrue);
        expect(realPrefs.containsKey('plan.list.v1'), isFalse);
        expect(ds2.read(scope: 'guest')?.map((p) => p.id), ['leg-1']);

        // 2. Failing writePendingMigration keeps hasSeededPendingMigration false
        // and preserves plan.list.v1.user-a intact
        final repoFailPending = PlanRepositoryImpl(
          PlanLocalDataSource(failingPrefs),
          _FakePlanRemoteDataSource(),
        )..setUserId('user-a');
        final res = await repoFailPending.load();
        expect(res.isFailure, isTrue);
        expect(res.failureOrNull?.code, 'local_cache_sync_failed');
        expect(
          PlanLocalDataSource(realPrefs).hasSeededPendingMigration('user-a'),
          isFalse,
        );
        expect(
          PlanLocalDataSource(realPrefs).read(scope: 'user-a')?.map((p) => p.id),
          ['scp-1'],
        );
      },
    );

    test(
      'failed local writes on pending edit/delete and guest create/update/delete return Failure and stay retryable',
      () async {
        final existingGuest = _samplePlan(
          id: 'guest-1',
          title: 'Guest Awal',
        );
        final existingPending = _samplePlan(
          id: 'pend-fail-1',
          title: 'Pending Awal',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.guest': jsonEncode([
            PlanModel.toLocalJson(existingGuest),
          ]),
          'plan.list.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(existingPending),
          ]),
          'plan.pending.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(existingPending),
          ]),
          'plan.pending_seeded.v1.user-a': true,
        });
        final realPrefs = await SharedPreferences.getInstance();

        // Guest create/update/delete with failing write
        final failingGuestRepo = PlanRepositoryImpl(
          PlanLocalDataSource(
            _FailingWritePrefs(
              realPrefs,
              failSetStringKeys: const {'plan.list.v1.guest'},
            ),
          ),
        );
        final guestCreate = await failingGuestRepo.create(
          _samplePlan(id: 'guest-2', title: 'Guest Baru'),
        );
        expect(guestCreate.isFailure, isTrue);

        final guestUpdate = await failingGuestRepo.update(
          existingGuest.copyWith(title: 'Guest Diubah'),
        );
        expect(guestUpdate.isFailure, isTrue);

        final guestDelete = await failingGuestRepo.delete('guest-1');
        expect(guestDelete.isFailure, isTrue);

        // Reopen fresh store: original guest plan survived intact
        final guestAfter = PlanLocalDataSource(realPrefs).read(scope: 'guest');
        expect(guestAfter?.map((p) => p.title), ['Guest Awal']);

        // Pending edit & delete with failing write
        final failingAuthRepo = PlanRepositoryImpl(
          PlanLocalDataSource(
            _FailingWritePrefs(
              realPrefs,
              failSetStringKeys: const {'plan.pending.v1.user-a'},
              failSetStringListKeys: const {'plan.pending_delete.v1.user-a'},
            ),
          ),
          _FailingRemote(),
        )..setUserId('user-a');

        final pendingEdit = await failingAuthRepo.update(
          existingPending.copyWith(title: 'Pending Diubah'),
        );
        expect(pendingEdit.isFailure, isTrue);

        final pendingDelete = await failingAuthRepo.delete('pend-fail-1');
        expect(pendingDelete.isFailure, isTrue);

        // Reopen fresh store: original pending queue & local list intact
        final reopened = PlanLocalDataSource(realPrefs);
        expect(
          reopened.readPendingMigration('user-a').map((p) => p.title),
          ['Pending Awal'],
        );
        expect(
          reopened.read(scope: 'user-a')?.map((p) => p.title),
          ['Pending Awal'],
        );
      },
    );

    test(
      'pre-commit upload failure keeps pending update/delete free of non-UUID PATCH/DELETE requests',
      () async {
        final localPlan = _samplePlan(
          id: 'local-temp-1',
          title: 'Rencana Pending Lokal',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.user-a': jsonEncode([PlanModel.toLocalJson(localPlan)]),
        });
        final prefs = await SharedPreferences.getInstance();

        final methodsCalled = <String>[];
        final preCommitHttp = MockClient((req) async {
          methodsCalled.add('${req.method} ${req.url.path}');
          if (req.method == 'GET') {
            return http.Response(jsonEncode({'success': true, 'data': []}), 200);
          }
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {'message': 'Server sibuk'},
            }),
            503,
          );
        });
        final preCommitRepo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          PlanRemoteDataSource(
            ApiClient(httpClient: preCommitHttp, baseUrl: 'http://localhost')
              ..token = 'token-a',
          ),
        )..setUserId('user-a');

        await preCommitRepo.load();
        final updatedPending = localPlan.copyWith(title: 'Judul Diedit Lokal');
        final updateRes = await preCommitRepo.update(updatedPending);
        expect(updateRes.isSuccess, isTrue);
        expect(updateRes.valueOrNull?.title, 'Judul Diedit Lokal');

        final deleteRes = await preCommitRepo.delete('local-temp-1');
        expect(deleteRes.isSuccess, isTrue);
        expect(
          methodsCalled.where(
            (m) =>
                m.startsWith('PATCH') ||
                (m.startsWith('DELETE') &&
                    !m.startsWith('DELETE /plans/client/')),
          ),
          isEmpty,
        );
        expect(PlanLocalDataSource(prefs).readPendingMigration('user-a'), isEmpty);
      },
    );

    test(
      'lost ACK on POST dispatches second POST with same clientId and upgrades local ID to server UUID',
      () async {
        final localPlan = _samplePlan(
          id: 'local-temp-2',
          title: 'Rencana Lost ACK',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.user-a': jsonEncode([PlanModel.toLocalJson(localPlan)]),
        });
        final prefs = await SharedPreferences.getInstance();
        final serverRows = <Map<String, dynamic>>[];
        var postCalls = 0;
        var dropFirstAck = true;

        final replayHttp = MockClient((req) async {
          if (req.method == 'GET') {
            return http.Response(
              jsonEncode({'success': true, 'data': []}),
              200,
            );
          }
          if (req.method == 'POST') {
            postCalls++;
            final body = jsonDecode(req.body) as Map<String, dynamic>;
            final clientId = body['clientId'] as String?;
            final existing = serverRows.cast<Map<String, dynamic>?>().firstWhere(
              (r) => clientId != null && r?['clientId'] == clientId,
              orElse: () => null,
            );
            if (existing != null) {
              return http.Response(
                jsonEncode({'success': true, 'data': existing}),
                200,
              );
            }
            final created = {
              ...body,
              'id': '00000000-0000-4000-8000-000000000099',
              'userId': 'user-a',
              'createdAt': '2026-08-01T00:00:00.000Z',
              'updatedAt': '2026-08-01T00:00:00.000Z',
            };
            serverRows.add(created);
            if (dropFirstAck) {
              dropFirstAck = false;
              throw http.ClientException('Lost ACK');
            }
            return http.Response(
              jsonEncode({'success': true, 'data': created}),
              201,
            );
          }
          return http.Response('{}', 404);
        });

        final replayRepo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          PlanRemoteDataSource(
            ApiClient(httpClient: replayHttp, baseUrl: 'http://localhost')
              ..token = 'token-a',
          ),
        )..setUserId('user-a');

        await replayRepo.load();
        expect(postCalls, 1);
        expect(
          PlanLocalDataSource(prefs).readPendingMigration('user-a').length,
          1,
        );

        final secondSync = await replayRepo.load();
        expect(postCalls, 2);
        expect(serverRows.length, 1);
        expect(
          PlanLocalDataSource(prefs).readPendingMigration('user-a'),
          isEmpty,
        );
        expect(
          secondSync.valueOrNull?.map((p) => p.id),
          ['00000000-0000-4000-8000-000000000099'],
        );
      },
    );

    test(
      'pending edit after lost-ACK committed POST reconciles PATCH on update and retries failed PATCH on next load',
      () async {
        final localPlan = _samplePlan(
          id: 'local-edit-ack-1',
          title: 'Judul Lama',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.user-a': jsonEncode([PlanModel.toLocalJson(localPlan)]),
        });
        final prefs = await SharedPreferences.getInstance();
        final serverRows = <Map<String, dynamic>>[];
        var dropFirstPostAck = true;
        var failNextPatch = true;
        var patchCalls = 0;

        final mockHttp = MockClient((req) async {
          if (req.method == 'GET') {
            return http.Response(
              jsonEncode({'success': true, 'data': serverRows}),
              200,
            );
          }
          if (req.method == 'POST') {
            final body = jsonDecode(req.body) as Map<String, dynamic>;
            final clientId = body['clientId'] as String?;
            final existing = serverRows.cast<Map<String, dynamic>?>().firstWhere(
              (r) => clientId != null && r?['clientId'] == clientId,
              orElse: () => null,
            );
            if (existing != null) {
              return http.Response(
                jsonEncode({'success': true, 'data': existing}),
                200,
              );
            }
            final created = {
              ...body,
              'id': '00000000-0000-4000-8000-000000000101',
              'userId': 'user-a',
              'createdAt': '2026-08-01T00:00:00.000Z',
              'updatedAt': '2026-08-01T00:00:00.000Z',
            };
            serverRows.add(created);
            if (dropFirstPostAck) {
              dropFirstPostAck = false;
              throw http.ClientException('Lost ACK');
            }
            return http.Response(
              jsonEncode({'success': true, 'data': created}),
              201,
            );
          }
          if (req.method == 'PATCH') {
            patchCalls++;
            if (failNextPatch) {
              failNextPatch = false;
              return http.Response(
                jsonEncode({'success': false, 'error': {'message': 'Sibuk'}}),
                503,
              );
            }
            final id = req.url.pathSegments.last;
            final body = jsonDecode(req.body) as Map<String, dynamic>;
            final idx = serverRows.indexWhere((r) => r['id'] == id);
            serverRows[idx] = {...serverRows[idx], ...body};
            return http.Response(
              jsonEncode({'success': true, 'data': serverRows[idx]}),
              200,
            );
          }
          return http.Response('{}', 404);
        });

        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          PlanRemoteDataSource(
            ApiClient(httpClient: mockHttp, baseUrl: 'http://localhost')
              ..token = 'token-a',
          ),
        )..setUserId('user-a');

        // 1. Initial load commits POST on server then drops ACK
        await repo.load();
        expect(serverRows.length, 1);
        expect(serverRows.first['title'], 'Judul Lama');

        // 2. Edit pending row: POST replays 200 (old title), PATCH fails 503 -> stays dirty & pending
        final edited = localPlan.copyWith(title: 'Judul Baru Terkini');
        final updateRes = await repo.update(edited);
        expect(updateRes.isSuccess, isTrue);
        expect(patchCalls, 1);
        expect(
          PlanLocalDataSource(prefs).readPendingDirtyIds('user-a'),
          contains('local-edit-ack-1'),
        );

        // 3. Next load() reconciles dirty pending edit via PATCH /plans/<serverUuid>
        final reloaded = await repo.load();
        expect(patchCalls, 2);
        expect(serverRows.first['title'], 'Judul Baru Terkini');
        expect(
          reloaded.valueOrNull?.map((p) => p.title),
          ['Judul Baru Terkini'],
        );
        expect(PlanLocalDataSource(prefs).readPendingMigration('user-a'), isEmpty);
        expect(PlanLocalDataSource(prefs).readPendingDirtyIds('user-a'), isEmpty);
      },
    );

    test(
      'pending delete after lost-ACK committed POST sends DELETE /plans/<serverUuid> and never resurrects',
      () async {
        final localPlan = _samplePlan(
          id: 'local-del-ack-1',
          title: 'Rencana Dihapus',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.user-a': jsonEncode([PlanModel.toLocalJson(localPlan)]),
        });
        final prefs = await SharedPreferences.getInstance();
        final serverRows = <Map<String, dynamic>>[];
        var dropFirstPostAck = true;
        var offlineForDelete = true;
        var deleteCalls = 0;

        final mockHttp = MockClient((req) async {
          if (req.method == 'GET') {
            if (offlineForDelete) {
              throw http.ClientException('Offline');
            }
            return http.Response(
              jsonEncode({'success': true, 'data': serverRows}),
              200,
            );
          }
          if (req.method == 'POST') {
            final body = jsonDecode(req.body) as Map<String, dynamic>;
            final created = {
              ...body,
              'id': '00000000-0000-4000-8000-000000000202',
              'userId': 'user-a',
              'createdAt': '2026-08-01T00:00:00.000Z',
              'updatedAt': '2026-08-01T00:00:00.000Z',
            };
            serverRows.add(created);
            if (dropFirstPostAck) {
              dropFirstPostAck = false;
              throw http.ClientException('Lost ACK');
            }
            return http.Response(
              jsonEncode({'success': true, 'data': created}),
              201,
            );
          }
          if (req.method == 'DELETE') {
            if (offlineForDelete) {
              throw http.ClientException('Offline');
            }
            deleteCalls++;
            if (req.url.path.startsWith('/plans/client/')) {
              final cid = Uri.decodeComponent(req.url.pathSegments.last);
              serverRows.removeWhere((r) => r['clientId'] == cid);
            } else {
              final id = req.url.pathSegments.last;
              serverRows.removeWhere((r) => r['id'] == id);
            }
            return http.Response(jsonEncode({'success': true, 'data': null}), 200);
          }
          return http.Response('{}', 404);
        });

        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          PlanRemoteDataSource(
            ApiClient(httpClient: mockHttp, baseUrl: 'http://localhost')
              ..token = 'token-a',
          ),
        )..setUserId('user-a');

        // Make GET succeed once for initial load (empty), then POST commits & drops ACK
        offlineForDelete = false;
        await repo.load();
        expect(serverRows.length, 1);

        // User deletes pending row while offline -> queued in pending_delete
        offlineForDelete = true;
        final delRes = await repo.delete('local-del-ack-1');
        expect(delRes.isSuccess, isTrue);
        expect(deleteCalls, 0);
        expect(
          PlanLocalDataSource(prefs).readPendingDeleteIds('user-a'),
          contains('local-del-ack-1'),
        );

        // Back online: load() deletes server UUID and clears pending_delete
        offlineForDelete = false;
        final reloaded = await repo.load();
        expect(deleteCalls, 1);
        expect(serverRows, isEmpty);
        expect(reloaded.valueOrNull, isEmpty);
        expect(
          PlanLocalDataSource(prefs).readPendingDeleteIds('user-a'),
          isEmpty,
        );

        // Subsequent load() never resurrects the deleted plan
        final finalLoad = await repo.load();
        expect(finalLoad.valueOrNull, isEmpty);
      },
    );

    test(
      'per-account queue serializes concurrent load migration and pending update/delete without dropping edits',
      () async {
        final localPlan = _samplePlan(
          id: 'local-ser-1',
          title: 'Awal Serial',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.user-a': jsonEncode([PlanModel.toLocalJson(localPlan)]),
        });
        final prefs = await SharedPreferences.getInstance();
        final serverRows = <Map<String, dynamic>>[];
        final getStarted = Completer<void>();
        final allowGet = Completer<void>();

        final mockHttp = MockClient((req) async {
          if (req.method == 'GET') {
            if (!getStarted.isCompleted) getStarted.complete();
            await allowGet.future;
            return http.Response(
              jsonEncode({'success': true, 'data': serverRows}),
              200,
            );
          }
          if (req.method == 'POST') {
            final body = jsonDecode(req.body) as Map<String, dynamic>;
            final clientId = body['clientId'] as String?;
            final existing = serverRows.cast<Map<String, dynamic>?>().firstWhere(
              (r) => clientId != null && r?['clientId'] == clientId,
              orElse: () => null,
            );
            if (existing != null) {
              return http.Response(
                jsonEncode({'success': true, 'data': existing}),
                200,
              );
            }
            final created = {
              ...body,
              'id': '00000000-0000-4000-8000-000000000303',
              'userId': 'user-a',
              'createdAt': '2026-08-01T00:00:00.000Z',
              'updatedAt': '2026-08-01T00:00:00.000Z',
            };
            serverRows.add(created);
            return http.Response(
              jsonEncode({'success': true, 'data': created}),
              201,
            );
          }
          if (req.method == 'PATCH') {
            final id = req.url.pathSegments.last;
            final body = jsonDecode(req.body) as Map<String, dynamic>;
            final idx = serverRows.indexWhere((r) => r['id'] == id);
            serverRows[idx] = {...serverRows[idx], ...body};
            return http.Response(
              jsonEncode({'success': true, 'data': serverRows[idx]}),
              200,
            );
          }
          return http.Response('{}', 404);
        });

        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          PlanRemoteDataSource(
            ApiClient(httpClient: mockHttp, baseUrl: 'http://localhost')
              ..token = 'token-a',
          ),
        )..setUserId('user-a');

        final loadFuture = repo.load();
        await getStarted.future;
        // Enqueue an update while load() is in flight on the same account
        final updateFuture = repo.update(
          localPlan.copyWith(title: 'Judul Terkirim Serial'),
        );
        allowGet.complete();

        final loadRes = await loadFuture;
        final updateRes = await updateFuture;
        expect(loadRes.isSuccess, isTrue);
        expect(updateRes.isSuccess, isTrue);

        // Wait a moment if needed and verify final state has the updated title
        expect(serverRows.length, 1);
        expect(serverRows.first['title'], 'Judul Terkirim Serial');
      },
    );

    test(
      'A -> B -> A account switch cancels queued delete before repository dispatch',
      () async {
        final repo = _SwitchAuditRepo([
          _samplePlan(id: 'plan-aba-1', title: 'Rencana A'),
        ]);
        final controller = PlanController(
          repo,
          _CapturingAiRepo(),
          const _StubLocationRepo(),
        );
        await controller.setUserId('user-a');

        repo.delayNextUpdate = Completer<TripPlan>();
        final slowOp = controller.toggleChecklistItem('plan-aba-1', 'c-none');
        await Future<void>.delayed(Duration.zero);
        final queuedDelete = controller.deletePlan('plan-aba-1');

        // Switch A -> B -> A while slowOp is in flight
        await controller.setUserId('user-b');
        await controller.setUserId('user-a');
        repo.delayNextUpdate!.complete(
          _samplePlan(id: 'plan-aba-1', title: 'Rencana A'),
        );

        final slowRes = await slowOp;
        final delRes = await queuedDelete;
        expect(slowRes.isCancelled, isTrue);
        expect(delRes.isCancelled, isTrue);
        expect(repo.deleteCalls, 0);
      },
    );

    test(
      'reloaded store: cleanup/marker and authenticated cache write failures return Failure and keep storage intact',
      () async {
        final seedLocal = _samplePlan(
          id: 'local-mk-1',
          title: 'Pending Marker Test',
        );
        final backing = <String, Object>{
          'plan.list.v1.user-a': jsonEncode([PlanModel.toLocalJson(seedLocal)]),
        };

        // 1. Fail plan.migrated.v1.user-a during load() -> returns Failure & preserves plan.list.v1.user-a
        final remote1 = _FakePlanRemoteDataSource();
        final repoFailMarker = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              backing,
              failSetStringListKeys: const {'plan.migrated.v1.user-a'},
            ),
          ),
          remote1,
        )..setUserId('user-a');

        final loadMarkerFail = await repoFailMarker.load();
        expect(loadMarkerFail.isFailure, isTrue);
        expect(loadMarkerFail.failureOrNull?.code, 'local_cache_sync_failed');

        // Fresh reloaded store still has original local list & retryable pending item
        final reloaded1 = PlanLocalDataSource(_MapBackedPrefs(backing));
        expect(reloaded1.read(scope: 'user-a')?.map((p) => p.id), ['local-mk-1']);
        expect(
          reloaded1.readPendingMigration('user-a').map((p) => p.id),
          ['local-mk-1'],
        );

        // 2. Fail plan.pending_delete.v1.user-a removal during load() -> returns Failure & keeps pending_delete
        final backingDel = <String, Object>{
          'plan.pending_delete.v1.user-a': <String>['local-del-mk'],
          'plan.pending_seeded.v1.user-a': true,
        };
        final repoFailDelMarker = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              backingDel,
              failRemoveKeys: const {'plan.pending_delete.v1.user-a'},
            ),
          ),
          _FakePlanRemoteDataSource(),
        )..setUserId('user-a');

        final loadDelFail = await repoFailDelMarker.load();
        expect(loadDelFail.isFailure, isTrue);
        expect(loadDelFail.failureOrNull?.code, 'local_cache_sync_failed');
        expect(
          PlanLocalDataSource(_MapBackedPrefs(backingDel))
              .readPendingDeleteIds('user-a'),
          contains('local-del-mk'),
        );

        // 3. Authenticated create/update/delete/load fail on plan.list.v1.user-a -> all return Failure & keep old list
        final existingSrv = _samplePlan(
          id: '00000000-0000-4000-8000-000000000501',
          title: 'Server Awal',
        );
        final backingAuth = <String, Object>{
          'plan.list.v1.user-a': jsonEncode([PlanModel.toLocalJson(existingSrv)]),
          'plan.pending_seeded.v1.user-a': true,
        };
        final authRemote = _FakePlanRemoteDataSource()
          ..byUser['user-a'] = [existingSrv];
        final repoFailCache = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              backingAuth,
              failSetStringKeys: const {'plan.list.v1.user-a'},
            ),
          ),
          authRemote,
        )..setUserId('user-a');

        final createRes = await repoFailCache.create(
          _samplePlan(id: '', title: 'Baru'),
        );
        expect(createRes.isFailure, isTrue);
        expect(createRes.failureOrNull?.code, 'local_cache_sync_failed');

        final updateRes = await repoFailCache.update(
          existingSrv.copyWith(title: 'Diubah'),
        );
        expect(updateRes.isFailure, isTrue);
        expect(updateRes.failureOrNull?.code, 'local_cache_sync_failed');

        final deleteRes = await repoFailCache.delete(existingSrv.id);
        expect(deleteRes.isFailure, isTrue);
        expect(deleteRes.failureOrNull?.code, 'local_cache_sync_failed');

        final loadRes = await repoFailCache.load();
        expect(loadRes.isFailure, isTrue);
        expect(loadRes.failureOrNull?.code, 'local_cache_sync_failed');

        // Fresh reloaded store still holds original untouched plan.list.v1.user-a
        final reloadedAuth = PlanLocalDataSource(_MapBackedPrefs(backingAuth));
        expect(
          reloadedAuth.read(scope: 'user-a')?.map((p) => p.title),
          ['Server Awal'],
        );
      },
    );

    test(
      'empty GET followed by late POST commit is blocked by DELETE /plans/client/:clientId tombstone',
      () async {
        final localPlan = _samplePlan(
          id: 'local-late-1',
          title: 'Rencana Terhapus',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.user-a': jsonEncode([PlanModel.toLocalJson(localPlan)]),
          'plan.pending.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(localPlan),
          ]),
          'plan.pending_seeded.v1.user-a': true,
        });
        final prefs = await SharedPreferences.getInstance();
        final serverRows = <Map<String, dynamic>>[];
        final tombstones = <String>{};
        var offlineDelete = true;
        var deleteByClientCalls = 0;

        final mockHttp = MockClient((req) async {
          if (req.method == 'GET') {
            return http.Response(
              jsonEncode({'success': true, 'data': serverRows}),
              200,
            );
          }
          if (req.method == 'DELETE' &&
              req.url.path.startsWith('/plans/client/')) {
            if (offlineDelete) {
              throw http.ClientException('Offline');
            }
            deleteByClientCalls++;
            final cid = Uri.decodeComponent(req.url.pathSegments.last);
            tombstones.add(cid);
            serverRows.removeWhere((r) => r['clientId'] == cid);
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {'deleted': true, 'clientId': cid},
              }),
              200,
            );
          }
          if (req.method == 'POST' && req.url.path == '/plans') {
            final body = jsonDecode(req.body) as Map<String, dynamic>;
            final cid = body['clientId'] as String?;
            if (cid != null && tombstones.contains(cid)) {
              return http.Response(
                jsonEncode({
                  'success': false,
                  'error': {
                    'code': 'PLAN_CLIENT_DELETED',
                    'message': 'Rencana ini sudah dihapus',
                  },
                }),
                409,
              );
            }
            final created = {
              ...body,
              'id': '00000000-0000-4000-8000-000000000777',
              'userId': 'user-a',
              'createdAt': '2026-08-01T00:00:00.000Z',
              'updatedAt': '2026-08-01T00:00:00.000Z',
            };
            serverRows.add(created);
            return http.Response(
              jsonEncode({'success': true, 'data': created}),
              201,
            );
          }
          return http.Response('{}', 404);
        });

        final remote = PlanRemoteDataSource(
          ApiClient(httpClient: mockHttp, baseUrl: 'http://localhost')
            ..token = 'token-a',
        );
        final repo = PlanRepositoryImpl(PlanLocalDataSource(prefs), remote)
          ..setUserId('user-a');

        // 1. Delete while offline: pending_delete retains local-late-1
        final delRes = await repo.delete('local-late-1');
        expect(delRes.isSuccess, isTrue);
        expect(
          PlanLocalDataSource(prefs).readPendingDeleteIds('user-a'),
          contains('local-late-1'),
        );

        // 2. Back online: load() sends DELETE /plans/client/local-late-1 even though GET was empty
        offlineDelete = false;
        final load1 = await repo.load();
        expect(deleteByClientCalls, 1);
        expect(load1.valueOrNull, isEmpty);
        expect(
          PlanLocalDataSource(prefs).readPendingDeleteIds('user-a'),
          isEmpty,
        );

        // 3. Late POST commit with same clientId is rejected 409 by tombstone
        await expectLater(
          remote.createPlan(localPlan, authToken: 'token-a', clientId: 'local-late-1'),
          throwsA(isA<ApiException>()),
        );
        final load2 = await repo.load();
        expect(load2.valueOrNull, isEmpty);
      },
    );

    testWidgets(
      'PlanController temp-ID -> server-UUID replaces in place without duplicates and active detail/checklist screens keep rendering',
      (tester) async {
        final tempPlan = _samplePlan(
          id: 'plan-local-1',
          title: 'Rencana Transisi ID',
          checklist: const [
            ChecklistItem(
              id: 'chk-1',
              name: 'Jaket Gunung',
              category: ChecklistCategory.perlengkapan,
              isRequired: true,
              isCompleted: false,
            ),
          ],
        );
        final repo = _ReconcilingIdRepo([tempPlan]);
        final controller = PlanController(
          repo,
          _CapturingAiRepo(),
          const _StubLocationRepo(),
        );
        await controller.setUserId('user-a');

        // Mutate using temp ID; repo returns reconciled server UUID with clientId
        final mut1 = await controller.toggleChecklistItem('plan-local-1', 'chk-1');
        expect(mut1.isSuccess, isTrue);
        expect(controller.plans.length, 1);
        expect(controller.plans.single.id, 'srv-uuid-1');
        expect(controller.plans.single.checklist.single.isCompleted, isTrue);
        expect(controller.findPlanById('plan-local-1')?.id, 'srv-uuid-1');

        // Subsequent call using old temp ID still mutates srv-uuid-1 cleanly
        final mut2 = await controller.toggleChecklistItem('plan-local-1', 'chk-1');
        expect(mut2.isSuccess, isTrue);
        expect(controller.plans.length, 1);
        expect(controller.plans.single.checklist.single.isCompleted, isFalse);

        // Active PlanDetailScreen opened with old temp ID renders reconciled plan
        await tester.pumpWidget(
          ChangeNotifierProvider<PlanController>.value(
            value: controller,
            child: const MaterialApp(
              home: PlanDetailScreen(planId: 'plan-local-1'),
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(find.text('Rencana Transisi ID'), findsOneWidget);

        // Active PlanChecklistScreen opened with old temp ID renders reconciled checklist
        await tester.pumpWidget(
          ChangeNotifierProvider<PlanController>.value(
            value: controller,
            child: const MaterialApp(
              home: PlanChecklistScreen(planId: 'plan-local-1'),
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(find.text('Jaket Gunung'), findsOneWidget);
      },
    );

    test(
      'load() returns CacheFailure local_cache_sync_failed when migrateLegacyIfNeeded returns false or throws',
      () async {
        final legacyPlan = _samplePlan(id: 'leg-fail', title: 'Legacy Fail');
        final backing = <String, Object>{
          'plan.list.v1': jsonEncode([PlanModel.toLocalJson(legacyPlan)]),
        };

        final repoFalse = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              backing,
              failSetStringKeys: const {'plan.list.v1.guest'},
            ),
          ),
        );
        final resFalse = await repoFalse.load();
        expect(resFalse.isFailure, isTrue);
        expect(resFalse.failureOrNull?.code, 'local_cache_sync_failed');

        final repoThrow = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              backing,
              throwSetStringKeys: const {'plan.list.v1.guest'},
            ),
          ),
        );
        final resThrow = await repoThrow.load();
        expect(resThrow.isFailure, isTrue);
        expect(resThrow.failureOrNull?.code, 'local_cache_sync_failed');
      },
    );

    test(
      'dirty-marker failure (false & thrown) and markMigrated failure on delete stay retryable via fresh repository',
      () async {
        // 1. Dirty-marker failure (false and thrown) on pending edit -> fresh repo retries cleanly
        final pendingEditPlan = _samplePlan(
          id: 'local-dirty-1',
          title: 'Awal Dirty',
        );
        final dirtyBacking = <String, Object>{
          'plan.list.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(pendingEditPlan),
          ]),
          'plan.pending.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(pendingEditPlan),
          ]),
          'plan.pending_dirty.v1.user-a': <String>['local-dirty-1'],
          'plan.pending_seeded.v1.user-a': true,
        };
        final remoteDirty = _FakePlanRemoteDataSource();
        final repoDirtyFalse = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              dirtyBacking,
              failRemoveKeys: const {'plan.pending_dirty.v1.user-a'},
            ),
          ),
          remoteDirty,
        )..setUserId('user-a');

        final failDirtyRes = await repoDirtyFalse.update(
          pendingEditPlan.copyWith(title: 'Edit Dirty'),
        );
        expect(failDirtyRes.isFailure, isTrue);
        expect(failDirtyRes.failureOrNull?.code, 'local_cache_sync_failed');

        final repoDirtyThrow = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              dirtyBacking,
              throwRemoveKeys: const {'plan.pending_dirty.v1.user-a'},
            ),
          ),
          remoteDirty,
        )..setUserId('user-a');
        final throwDirtyRes = await repoDirtyThrow.load();
        expect(throwDirtyRes.isFailure, isTrue);
        expect(throwDirtyRes.failureOrNull?.code, 'local_cache_sync_failed');
        expect(
          PlanLocalDataSource(_MapBackedPrefs(dirtyBacking))
              .readPendingDirtyIds('user-a'),
          contains('local-dirty-1'),
        );

        // Fresh repository with working storage retries and completes cleanly
        final freshDirtyRepo = PlanRepositoryImpl(
          PlanLocalDataSource(_MapBackedPrefs(dirtyBacking)),
          remoteDirty,
        )..setUserId('user-a');
        final retryDirtyRes = await freshDirtyRepo.load();
        expect(retryDirtyRes.isSuccess, isTrue);
        expect(
          PlanLocalDataSource(_MapBackedPrefs(dirtyBacking))
              .readPendingDirtyIds('user-a'),
          isEmpty,
        );

        // 2. markMigrated failure during pending-delete cleanup preserves plan.pending_delete.v1.user-a
        final delBacking = <String, Object>{
          'plan.pending_delete.v1.user-a': <String>['local-del-mark'],
          'plan.pending_seeded.v1.user-a': true,
        };
        final remoteDel = _FakePlanRemoteDataSource();
        final repoDelMarkFail = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              delBacking,
              failSetStringListKeys: const {'plan.migrated.v1.user-a'},
            ),
          ),
          remoteDel,
        )..setUserId('user-a');

        final delMarkRes = await repoDelMarkFail.load();
        expect(delMarkRes.isFailure, isTrue);
        expect(delMarkRes.failureOrNull?.code, 'local_cache_sync_failed');
        expect(
          PlanLocalDataSource(_MapBackedPrefs(delBacking))
              .readPendingDeleteIds('user-a'),
          contains('local-del-mark'),
        );

        final freshDelRepo = PlanRepositoryImpl(
          PlanLocalDataSource(_MapBackedPrefs(delBacking)),
          remoteDel,
        )..setUserId('user-a');
        final retryDelRes = await freshDelRepo.load();
        expect(retryDelRes.isSuccess, isTrue);
        expect(
          PlanLocalDataSource(_MapBackedPrefs(delBacking))
              .readPendingDeleteIds('user-a'),
          isEmpty,
        );
      },
    );

    test(
      'thrown storage exception after server ACK on create/update/delete returns CacheFailure local_cache_sync_failed',
      () async {
        final existingSrv = _samplePlan(
          id: '00000000-0000-4000-8000-000000000601',
          title: 'Server Throw',
        );
        final backing = <String, Object>{
          'plan.list.v1.user-a': jsonEncode([PlanModel.toLocalJson(existingSrv)]),
          'plan.pending_seeded.v1.user-a': true,
        };
        final remote = _FakePlanRemoteDataSource()
          ..byUser['user-a'] = [existingSrv];
        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              backing,
              throwSetStringKeys: const {'plan.list.v1.user-a'},
            ),
          ),
          remote,
        )..setUserId('user-a');

        final createRes = await repo.create(_samplePlan(id: '', title: 'New'));
        expect(createRes.isFailure, isTrue);
        expect(createRes.failureOrNull, isA<CacheFailure>());
        expect(createRes.failureOrNull?.code, 'local_cache_sync_failed');

        final updateRes = await repo.update(
          existingSrv.copyWith(title: 'Updated'),
        );
        expect(updateRes.isFailure, isTrue);
        expect(updateRes.failureOrNull, isA<CacheFailure>());
        expect(updateRes.failureOrNull?.code, 'local_cache_sync_failed');

        final deleteRes = await repo.delete(existingSrv.id);
        expect(deleteRes.isFailure, isTrue);
        expect(deleteRes.failureOrNull, isA<CacheFailure>());
        expect(deleteRes.failureOrNull?.code, 'local_cache_sync_failed');
      },
    );

    test(
      'exact 409 PLAN_CLIENT_DELETED fails pending update & drops local row, while generic 409 stays retryable',
      () async {
        final tombPlan = _samplePlan(id: 'local-tomb-1', title: 'Tomb Plan');
        final conflictPlan = _samplePlan(
          id: 'local-conf-1',
          title: 'Conflict Plan',
        );
        SharedPreferences.setMockInitialValues({
          'plan.list.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(tombPlan),
            PlanModel.toLocalJson(conflictPlan),
          ]),
          'plan.pending.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(tombPlan),
            PlanModel.toLocalJson(conflictPlan),
          ]),
          'plan.pending_seeded.v1.user-a': true,
        });
        final prefs = await SharedPreferences.getInstance();

        final mockHttp = MockClient((req) async {
          if (req.method == 'GET') {
            return http.Response(jsonEncode({'success': true, 'data': []}), 200);
          }
          if (req.method == 'POST') {
            final body = jsonDecode(req.body) as Map<String, dynamic>;
            final cid = body['clientId'] as String?;
            if (cid == 'local-tomb-1') {
              return http.Response(
                jsonEncode({
                  'success': false,
                  'error': {
                    'code': 'PLAN_CLIENT_DELETED',
                    'message': 'Rencana ini sudah dihapus',
                  },
                }),
                409,
              );
            }
            return http.Response(
              jsonEncode({
                'success': false,
                'error': {'code': 'CONFLICT', 'message': 'Konflik sementara'},
              }),
              409,
            );
          }
          return http.Response('{}', 404);
        });

        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(prefs),
          PlanRemoteDataSource(
            ApiClient(httpClient: mockHttp, baseUrl: 'http://localhost')
              ..token = 'token-a',
          ),
        )..setUserId('user-a');

        // 1. Pending update receiving 409 PLAN_CLIENT_DELETED returns Failure & cleans local row
        final tombUpdateRes = await repo.update(
          tombPlan.copyWith(title: 'Should Fail'),
        );
        expect(tombUpdateRes.isFailure, isTrue);
        expect(tombUpdateRes.failureOrNull?.code, 'PLAN_CLIENT_DELETED');
        expect(
          PlanLocalDataSource(prefs)
              .readPendingMigration('user-a')
              .any((p) => p.id == 'local-tomb-1'),
          isFalse,
        );
        expect(
          PlanLocalDataSource(prefs)
              .read(scope: 'user-a')
              ?.any((p) => p.id == 'local-tomb-1'),
          isFalse,
        );

        // 2. Generic 409 CONFLICT on pending update stays retryable (Success locally, remains in pending)
        final confUpdateRes = await repo.update(
          conflictPlan.copyWith(title: 'Kept Retryable'),
        );
        expect(confUpdateRes.isSuccess, isTrue);
        expect(
          PlanLocalDataSource(prefs)
              .readPendingMigration('user-a')
              .any((p) => p.id == 'local-conf-1'),
          isTrue,
        );

        // 3. load() refresh with another 409 PLAN_CLIENT_DELETED drops tombstoned item, keeps generic 409
        final tomb2 = _samplePlan(id: 'local-tomb-2', title: 'Tomb 2');
        await PlanLocalDataSource(prefs).writePendingMigration(
          'user-a',
          [
            tomb2.copyWith(id: 'local-tomb-1'),
            conflictPlan.copyWith(title: 'Kept Retryable'),
          ],
        );
        final loadRes = await repo.load();
        expect(loadRes.isSuccess, isTrue);
        expect(
          loadRes.valueOrNull?.any((p) => p.id == 'local-tomb-1'),
          isFalse,
        );
        expect(
          PlanLocalDataSource(prefs)
              .readPendingMigration('user-a')
              .map((p) => p.id),
          ['local-conf-1'],
        );
      },
    );

    test(
      'generateAi clears resolved server UUID from _generatingIds so retryAi dispatches second AI call',
      () async {
        final tempPlan = _samplePlan(
          id: 'plan-local-1',
          title: 'Rencana AI Transisi',
        );
        final repo = _ReconcilingIdRepo([tempPlan]);
        final aiRepo = _CapturingAiRepo();
        final controller = PlanController(
          repo,
          aiRepo,
          const _StubLocationRepo(),
        );
        await controller.setUserId('user-a');

        await controller.generateAi('plan-local-1');
        expect(controller.plans.single.id, 'srv-uuid-1');
        expect(controller.isGenerating('plan-local-1'), isFalse);
        expect(controller.isGenerating('srv-uuid-1'), isFalse);

        await controller.retryAi('plan-local-1');
        expect(aiRepo.calls, 2);
        expect(controller.isGenerating('plan-local-1'), isFalse);
        expect(controller.isGenerating('srv-uuid-1'), isFalse);
      },
    );

    test(
      'offline load() fallback with malformed JSON returns CacheFailure local_cache_sync_failed and controller stays unblocked',
      () async {
        final backing = <String, Object>{
          'plan.list.v1.user-a': '{bad json',
        };
        var throwApiException = false;
        final mockHttp = MockClient((_) async {
          if (throwApiException) {
            return http.Response(
              jsonEncode({
                'success': false,
                'error': {'message': 'Server gangguan'},
              }),
              503,
            );
          }
          throw http.ClientException('Network down');
        });
        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(_MapBackedPrefs(backing)),
          PlanRemoteDataSource(
            ApiClient(httpClient: mockHttp, baseUrl: 'http://localhost')
              ..token = 'token-a',
          ),
        )..setUserId('user-a');

        // (a) Network error fallback with malformed local JSON
        final netFallback = await repo.load();
        expect(netFallback.isFailure, isTrue);
        expect(netFallback.failureOrNull, isA<CacheFailure>());
        expect(netFallback.failureOrNull?.code, 'local_cache_sync_failed');

        // (b) Non-401 ApiException fallback with malformed local JSON via PlanController
        throwApiException = true;
        final controller = PlanController(
          repo,
          _CapturingAiRepo(),
          const _StubLocationRepo(),
        );
        await controller.setUserId('user-a');
        expect(controller.isLoading, isFalse);
        expect(controller.error, isNotNull);

        // Subsequent load() is NOT blocked when storage is repaired
        backing['plan.list.v1.user-a'] = jsonEncode([
          PlanModel.toLocalJson(_samplePlan(id: 'recovered-1', title: 'Pulih')),
        ]);
        await controller.load();
        expect(controller.isLoading, isFalse);
        expect(controller.plans.map((p) => p.id), ['recovered-1']);
      },
    );

    test(
      'PlanController.load() resets isLoading and allows retry when repository throws',
      () async {
        final throwingRepo = _ThrowingOncePlanRepo();
        final controller = PlanController(
          throwingRepo,
          _CapturingAiRepo(),
          const _StubLocationRepo(),
        );
        await controller.setUserId('user-a');
        expect(controller.isLoading, isFalse);
        expect(controller.hasLoaded, isTrue);
        expect(controller.error, isNotNull);

        // Next load() succeeds rather than staying permanently blocked
        await controller.load();
        expect(controller.isLoading, isFalse);
        expect(controller.error, isNull);
        expect(controller.plans.map((p) => p.id), ['after-throw-1']);
      },
    );

    test(
      'authenticated update() and delete() return CacheFailure local_cache_sync_failed when local read throws',
      () async {
        final remote = _FakePlanRemoteDataSource();
        final plan = _samplePlan(id: 'srv-read-1', title: 'Read Throw');

        // 1. Throw on plan.pending.v1.user-a
        final repoPendingThrow = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              const {},
              throwGetStringKeys: const {'plan.pending.v1.user-a'},
            ),
          ),
          remote,
        )..setUserId('user-a');

        final updPending = await repoPendingThrow.update(plan);
        expect(updPending.isFailure, isTrue);
        expect(updPending.failureOrNull, isA<CacheFailure>());
        expect(updPending.failureOrNull?.code, 'local_cache_sync_failed');

        final delPending = await repoPendingThrow.delete(plan.id);
        expect(delPending.isFailure, isTrue);
        expect(delPending.failureOrNull, isA<CacheFailure>());
        expect(delPending.failureOrNull?.code, 'local_cache_sync_failed');

        // 2. Throw on plan.list.v1.user-a (migrated-match lookup)
        final repoCacheThrow = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              const {},
              throwGetStringKeys: const {'plan.list.v1.user-a'},
            ),
          ),
          remote,
        )..setUserId('user-a');

        final updCache = await repoCacheThrow.update(plan);
        expect(updCache.isFailure, isTrue);
        expect(updCache.failureOrNull, isA<CacheFailure>());
        expect(updCache.failureOrNull?.code, 'local_cache_sync_failed');

        final delCache = await repoCacheThrow.delete(plan.id);
        expect(delCache.isFailure, isTrue);
        expect(delCache.failureOrNull, isA<CacheFailure>());
        expect(delCache.failureOrNull?.code, 'local_cache_sync_failed');
      },
    );

    test(
      'pending update() and delete() with valid pending row and unreadable plan.list.v1 return CacheFailure local_cache_sync_failed',
      () async {
        final pendingPlan = _samplePlan(
          id: 'local-pend-read-1',
          title: 'Pending Read Fail',
        );
        final backing = <String, Object>{
          'plan.pending.v1.user-a': jsonEncode([
            PlanModel.toLocalJson(pendingPlan),
          ]),
          'plan.pending_seeded.v1.user-a': true,
        };
        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(
            _MapBackedPrefs(
              backing,
              throwGetStringKeys: const {'plan.list.v1.user-a'},
            ),
          ),
          _FakePlanRemoteDataSource(),
        )..setUserId('user-a');

        final updRes = await repo.update(
          pendingPlan.copyWith(title: 'Updated'),
        );
        expect(updRes.isFailure, isTrue);
        expect(updRes.failureOrNull, isA<CacheFailure>());
        expect(updRes.failureOrNull?.code, 'local_cache_sync_failed');

        final delRes = await repo.delete(pendingPlan.id);
        expect(delRes.isFailure, isTrue);
        expect(delRes.failureOrNull, isA<CacheFailure>());
        expect(delRes.failureOrNull?.code, 'local_cache_sync_failed');
      },
    );

    test(
      'generic non-ApiException catch in load() with malformed cache returns CacheFailure local_cache_sync_failed',
      () async {
        final backing = <String, Object>{
          'plan.list.v1.user-a': '{bad json',
        };
        final repo = PlanRepositoryImpl(
          PlanLocalDataSource(_MapBackedPrefs(backing)),
          _ThrowingTransportRemote(),
        )..setUserId('user-a');

        final res = await repo.load();
        expect(res.isFailure, isTrue);
        expect(res.failureOrNull, isA<CacheFailure>());
        expect(res.failureOrNull?.code, 'local_cache_sync_failed');
      },
    );
  });
}

class _FailingWritePrefs implements SharedPreferences {
  _FailingWritePrefs(
    this._inner, {
    this.failSetStringKeys = const {},
    this.failSetStringListKeys = const {},
  });

  final SharedPreferences _inner;
  final Set<String> failSetStringKeys;
  final Set<String> failSetStringListKeys;

  @override
  Future<bool> setString(String key, String value) async {
    if (failSetStringKeys.contains(key)) return false;
    return _inner.setString(key, value);
  }

  @override
  Future<bool> setBool(String key, bool value) => _inner.setBool(key, value);

  @override
  Future<bool> setStringList(String key, List<String> value) async {
    if (failSetStringListKeys.contains(key)) return false;
    return _inner.setStringList(key, value);
  }

  @override
  Future<bool> remove(String key) => _inner.remove(key);

  @override
  String? getString(String key) => _inner.getString(key);

  @override
  bool? getBool(String key) => _inner.getBool(key);

  @override
  List<String>? getStringList(String key) => _inner.getStringList(key);

  @override
  bool containsKey(String key) => _inner.containsKey(key);

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MapBackedPrefs implements SharedPreferences {
  _MapBackedPrefs(
    this._store, {
    this.failSetStringKeys = const {},
    this.failSetStringListKeys = const {},
    this.failRemoveKeys = const {},
    this.throwSetStringKeys = const {},
    this.throwRemoveKeys = const {},
    this.throwGetStringKeys = const {},
  });

  final Map<String, Object> _store;
  final Set<String> failSetStringKeys;
  final Set<String> failSetStringListKeys;
  final Set<String> failRemoveKeys;
  final Set<String> throwSetStringKeys;
  final Set<String> throwRemoveKeys;
  final Set<String> throwGetStringKeys;

  @override
  Future<bool> setString(String key, String value) async {
    if (throwSetStringKeys.contains(key)) {
      throw StateError('Disk write error on $key');
    }
    if (failSetStringKeys.contains(key)) return false;
    _store[key] = value;
    return true;
  }

  @override
  Future<bool> setBool(String key, bool value) async {
    _store[key] = value;
    return true;
  }

  @override
  Future<bool> setStringList(String key, List<String> value) async {
    if (failSetStringListKeys.contains(key)) return false;
    _store[key] = List<String>.from(value);
    return true;
  }

  @override
  Future<bool> remove(String key) async {
    if (throwRemoveKeys.contains(key)) {
      throw StateError('Disk remove error on $key');
    }
    if (failRemoveKeys.contains(key)) return false;
    _store.remove(key);
    return true;
  }

  @override
  String? getString(String key) {
    if (throwGetStringKeys.contains(key)) {
      throw StateError('Disk read error on $key');
    }
    return _store[key] as String?;
  }

  @override
  bool? getBool(String key) => _store[key] as bool?;

  @override
  List<String>? getStringList(String key) {
    final val = _store[key];
    return val is List<String> ? List<String>.from(val) : null;
  }

  @override
  bool containsKey(String key) => _store.containsKey(key);

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _ReconcilingIdRepo implements PlanRepository {
  _ReconcilingIdRepo(this._plans);
  final List<TripPlan> _plans;

  @override
  void setUserId(String? userId) {}

  @override
  Future<Result<List<TripPlan>>> load() async => Success(List.of(_plans));

  @override
  Future<Result<TripPlan>> create(TripPlan plan) async => Success(plan);

  @override
  Future<Result<TripPlan>> update(TripPlan plan) async {
    final reconciled = plan.id == 'plan-local-1'
        ? plan.copyWith(id: 'srv-uuid-1', clientId: 'plan-local-1')
        : plan;
    _plans
      ..removeWhere((p) => p.id == plan.id || p.id == reconciled.id)
      ..add(reconciled);
    return Success(reconciled);
  }

  @override
  Future<Result<void>> delete(String id) async {
    _plans.removeWhere((p) => p.id == id);
    return const Success(null);
  }
}

class _ThrowingOncePlanRepo implements PlanRepository {
  bool _threw = false;

  @override
  void setUserId(String? userId) {}

  @override
  Future<Result<List<TripPlan>>> load() async {
    if (!_threw) {
      _threw = true;
      throw StateError('Unexpected repository error');
    }
    return Success([_samplePlan(id: 'after-throw-1', title: 'Setelah Throw')]);
  }

  @override
  Future<Result<TripPlan>> create(TripPlan plan) async => Success(plan);

  @override
  Future<Result<TripPlan>> update(TripPlan plan) async => Success(plan);

  @override
  Future<Result<void>> delete(String id) async => const Success(null);
}

class _SwitchAuditRepo extends _SlowUpdateRepo {
  _SwitchAuditRepo(super.plans);
  int deleteCalls = 0;

  @override
  Future<Result<void>> delete(String id) async {
    deleteCalls++;
    return super.delete(id);
  }
}

class _DelayedSwitchRemote extends _FakePlanRemoteDataSource {
  Completer<TripPlan>? delayCreate;

  @override
  Future<({TripPlan plan, bool replayed})> createPlanWithMeta(
    TripPlan plan, {
    String? authToken,
    String? clientId,
  }) async => (
    plan: await createPlan(plan, authToken: authToken, clientId: clientId),
    replayed: false,
  );

  @override
  Future<TripPlan> createPlan(
    TripPlan plan, {
    String? authToken,
    String? clientId,
  }) async {
    if (delayCreate != null) {
      return delayCreate!.future;
    }
    return super.createPlan(plan, authToken: authToken, clientId: clientId);
  }
}

class _FailingRemote extends PlanRemoteDataSource {
  _FailingRemote() : super(ApiClient(baseUrl: 'http://localhost'));

  @override
  Future<List<TripPlan>> fetchPlans({String? authToken}) async =>
      throw const ApiException('Offline');
}

class _ThrowingTransportRemote extends PlanRemoteDataSource {
  _ThrowingTransportRemote() : super(ApiClient(baseUrl: 'http://localhost'));

  @override
  Future<List<TripPlan>> fetchPlans({String? authToken}) async =>
      throw StateError('unexpected transport error');
}

class _SlowUpdateRepo implements PlanRepository {
  _SlowUpdateRepo(this._plans);
  final List<TripPlan> _plans;
  Completer<TripPlan>? delayNextUpdate;

  @override
  void setUserId(String? userId) {}

  @override
  Future<Result<List<TripPlan>>> load() async => Success(_plans);

  @override
  Future<Result<TripPlan>> create(TripPlan plan) async => Success(plan);

  @override
  Future<Result<TripPlan>> update(TripPlan plan) async {
    if (delayNextUpdate != null) {
      final res = await delayNextUpdate!.future;
      delayNextUpdate = null;
      return Success(res);
    }
    await Future<void>.delayed(const Duration(milliseconds: 10));
    final idx = _plans.indexWhere((p) => p.id == plan.id);
    if (idx >= 0) _plans[idx] = plan;
    return Success(plan);
  }

  @override
  Future<Result<void>> delete(String id) async => const Success(null);
}

class _FailingAiRepo extends _CapturingAiRepo {
  @override
  Future<Result<AiResult>> run(
    AiPreference preference, {
    bool refresh = false,
  }) async =>
      const Failure(NetworkFailure('AI gagal diproses.'));
}

class _FailingUpdatePlanRepo implements PlanRepository {
  _FailingUpdatePlanRepo(this._plans);
  final List<TripPlan> _plans;

  @override
  void setUserId(String? userId) {}

  @override
  Future<Result<List<TripPlan>>> load() async => Success(_plans);

  @override
  Future<Result<TripPlan>> create(TripPlan plan) async => Success(plan);

  @override
  Future<Result<TripPlan>> update(TripPlan plan) async =>
      const Failure(NetworkFailure('Gagal menyimpan ke server.'));

  @override
  Future<Result<void>> delete(String id) async => const Success(null);
}
