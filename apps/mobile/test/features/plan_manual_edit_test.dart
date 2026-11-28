import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_theme.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/data/repositories/ai_repository_impl.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_itinerary.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_options.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/ai/domain/repositories/ai_repository.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination_catalog.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/user_location.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/location_repository.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';
import 'package:dolenae_mobile/src/features/plan/data/models/plan_model.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_detail_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_edit_screen.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_plans_screen.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_date_field.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_input.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_plan_card.dart';

import '../helpers/test_harness.dart';

class _FakePlanRepository implements PlanRepository {
  _FakePlanRepository(List<TripPlan> initialPlans)
    : _plans = [...initialPlans];

  List<TripPlan> _plans;
  bool failUpdate = false;
  int updateCalls = 0;

  @override
  void setUserId(String? userId) {}

  @override
  Future<Result<List<TripPlan>>> load() async => Success(_plans);

  @override
  Future<Result<TripPlan>> create(TripPlan plan) async => Success(plan);

  @override
  Future<Result<TripPlan>> update(TripPlan plan) async {
    updateCalls++;
    if (failUpdate) {
      return const Failure(NetworkFailure('Gagal menyimpan ke server.'));
    }
    _plans = [
      for (final item in _plans)
        if (item.id == plan.id) plan else item,
    ];
    return Success(plan);
  }

  @override
  Future<Result<void>> delete(String id) async => const Success(null);
}

class _DeferredLoadPlanRepository implements PlanRepository {
  _DeferredLoadPlanRepository(this.onLoad);

  final Future<Result<List<TripPlan>>> Function() onLoad;

  @override
  void setUserId(String? userId) {}

  @override
  Future<Result<List<TripPlan>>> load() => onLoad();

  @override
  Future<Result<TripPlan>> create(TripPlan plan) async => Success(plan);

  @override
  Future<Result<TripPlan>> update(TripPlan plan) async => Success(plan);

  @override
  Future<Result<void>> delete(String id) async => const Success(null);
}

class _ControlledAiRepository implements AiRepository {
  _ControlledAiRepository(this.completer);

  final Completer<Result<AiResult>> completer;
  final AiRepositoryImpl _fallback = AiRepositoryImpl();

  @override
  AiPreference get defaultPreference => _fallback.defaultPreference;

  @override
  AiOptions get defaultOptions => _fallback.defaultOptions;

  @override
  List<String> get promptSuggestions => _fallback.promptSuggestions;

  @override
  Future<Result<AiOptions>> loadOptions() => _fallback.loadOptions();

  @override
  Future<Result<AiResult>> run(AiPreference preference, {bool refresh = false}) {
    return completer.future;
  }
}

class _SeedDestRepo implements DestinationRepository {
  @override
  Stream<DestinationCatalog> watchCatalog() =>
      Stream.value(const DestinationCatalog(items: DestinationSeedData.items));

  @override
  Future<Result<void>> refresh() async => const Success(null);
}

class _FakeLocationRepository implements LocationRepository {
  @override
  Future<Result<UserLocation>> detectCurrent() async => const Success(
    UserLocation(
      latitude: -6.9,
      longitude: 107.6,
      province: 'Jawa Barat',
      city: 'Bandung',
    ),
  );
}

TripPlan _samplePlan({
  String id = 'plan-1',
  DateTime? startDate,
  DateTime? endDate,
  List<String> destinationIds = const ['dest-bromo'],
}) {
  final start = startDate ?? DateTime(2026, 7, 10);
  final end = endDate ?? DateTime(2026, 7, 12);
  return TripPlan(
    id: id,
    title: 'Trip Bromo Lama',
    startDate: start,
    endDate: end,
    peopleCount: 2,
    totalBudget: 1500000,
    originProvince: 'DKI Jakarta',
    note: 'Catatan awal',
    summary: 'Ringkasan AI terjaga',
    engine: 'deterministic',
    notice: 'Notice AI terjaga',
    aiWarning: 'Warning AI terjaga',
    destinationIds: destinationIds,
    briefing: const PlanBriefing(
      grounded: ['Fakta gunung'],
      general: ['Tips umum'],
      warnings: ['Angin kencang'],
    ),
    days: const [
      PlanDay(
        day: 1,
        title: 'Gunung Bromo',
        items: [
          PlanItem(
            destinationId: 'dest-bromo',
            destinationName: 'Gunung Bromo',
            activity: 'Sunrise Penanjakan',
          ),
        ],
      ),
      PlanDay(
        day: 2,
        title: 'Hari 2',
        items: [
          PlanItem(
            destinationId: null,
            destinationName: 'Kuliner Lokal',
            activity: 'Makan siang',
          ),
        ],
      ),
      PlanDay(
        day: 3,
        title: 'Hari 3',
        items: [
          PlanItem(
            destinationId: 'dest-ijen',
            destinationName: 'Kawah Ijen',
            activity: 'Blue fire',
          ),
        ],
      ),
    ],
    sources: const [
      PlanSource(type: 'destination', id: 'dest-bromo', label: 'Gunung Bromo'),
      PlanSource(type: 'destination', id: 'dest-ijen', label: 'Kawah Ijen'),
      PlanSource(type: 'route', id: 'route-1', label: 'Jalur Probolinggo'),
    ],
    checklist: const [
      ChecklistItem(
        id: 'chk-1',
        name: 'Jaket tebal',
        category: ChecklistCategory.perlengkapan,
        isRequired: true,
        isCompleted: true,
      ),
    ],
  );
}

void main() {
  group('Domain & Model fixes', () {
    test('TripPlan.durationDays is DST-safe via UTC calendar difference', () {
      // Simulasikan shift jam lokal pada tanggal mulai/selesai
      final plan = _samplePlan(
        startDate: DateTime(2026, 3, 29, 0, 0),
        endDate: DateTime(2026, 3, 30, 0, 0),
      );
      expect(plan.durationDays, 2);

      final singleDay = _samplePlan(
        startDate: DateTime(2026, 7, 10, 23, 0),
        endDate: DateTime(2026, 7, 10, 1, 0),
      );
      expect(singleDay.durationDays, 1);
      expect(singleDay.dateRange, '10 Jul 2026');
    });

    test('PlanModel.toUpdateJson clamps UTF-16 surrogate pairs safely', () {
      // Surrogate pair di index 159..160 -> harus dipotong di 159 agar tidak pecah
      final prefix = List.filled(159, 'a').join();
      final withEmoji = '$prefix😀tail';
      final plan = _samplePlan().copyWith(title: withEmoji);
      final json = PlanModel.toUpdateJson(plan);
      final serializedTitle = json['title'] as String;
      expect(serializedTitle.length, 159);
      expect(serializedTitle, prefix);
    });
  });

  group('PlanController.updatePlan & reconciliation', () {
    test('updates metadata manually while preserving AI briefing & checklist', () async {
      final repo = _FakePlanRepository([_samplePlan()]);
      final controller = PlanController(
        repo,
        AiRepositoryImpl(),
        _FakeLocationRepository(),
      );
      await controller.load();

      final result = await controller.updatePlan(
        'plan-1',
        title: '  Trip Bromo Baru  ',
        startDate: DateTime(2026, 8, 1),
        endDate: DateTime(2026, 8, 3),
        peopleCount: 5,
        totalBudget: 4000000,
        originProvince: ' Jawa Timur ',
        note: ' Bawa sarung tangan ',
      );

      expect(result.isSuccess, isTrue);
      final updated = controller.findPlanById('plan-1')!;
      expect(updated.title, 'Trip Bromo Baru');
      expect(updated.peopleCount, 5);
      expect(updated.totalBudget, 4000000);
      expect(updated.originProvince, 'Jawa Timur');
      expect(updated.note, 'Bawa sarung tangan');
      expect(updated.summary, 'Ringkasan AI terjaga');
      expect(updated.briefing.grounded, ['Fakta gunung']);
      expect(updated.checklist, hasLength(1));
      expect(updated.checklist.first.isCompleted, isTrue);
      expect(updated.notice, 'Notice AI terjaga');
      expect(updated.aiWarning, 'Warning AI terjaga');
    });

    test('reconciles added/removed destinations, extends & shortens days without losing items, and keeps unknown IDs', () async {
      final initial = _samplePlan(
        destinationIds: const ['dest-bromo', 'dest-ijen', 'offline-id-99'],
      );
      final repo = _FakePlanRepository([initial]);
      final controller = PlanController(
        repo,
        AiRepositoryImpl(),
        _FakeLocationRepository(),
      );
      await controller.load();

      final semeru = DestinationSeedData.items.firstWhere(
        (d) => d.id != 'dest-bromo' && d.id != 'dest-ijen',
      );

      // Perpendek jadi 2 hari, hapus dest-ijen, pertahankan offline-id-99, tambah semeru
      final shortenRes = await controller.updatePlan(
        'plan-1',
        title: 'Trip Ringkas',
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 11),
        peopleCount: 2,
        totalBudget: 1500000,
        originProvince: 'DKI Jakarta',
        note: '',
        destinationIds: ['dest-bromo', 'offline-id-99', semeru.id],
        selectedDestinations: [semeru],
      );
      expect(shortenRes.isSuccess, isTrue);
      var updated = controller.findPlanById('plan-1')!;
      expect(updated.days, hasLength(2));
      expect(updated.destinationIds, ['dest-bromo', 'offline-id-99', semeru.id]);
      expect(
        updated.sources.any((s) => s.id == 'dest-ijen'),
        isFalse,
      );
      expect(
        updated.sources.any((s) => s.id == 'route-1'),
        isTrue,
      );
      // Item non-katalog & item tambahan tetap ada
      final allItemNames = updated.days
          .expand((d) => d.items)
          .map((i) => i.destinationName)
          .toList();
      expect(allItemNames, containsAll(['Gunung Bromo', 'Kuliner Lokal', semeru.name]));

      // Perpanjang jadi 4 hari
      final extendRes = await controller.updatePlan(
        'plan-1',
        title: 'Trip Panjang',
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 13),
        peopleCount: 2,
        totalBudget: 1500000,
        originProvince: 'DKI Jakarta',
        note: '',
      );
      expect(extendRes.isSuccess, isTrue);
      updated = controller.findPlanById('plan-1')!;
      expect(updated.days, hasLength(4));
      expect(updated.days[3].title, 'Hari 4');
    });

    test('validates bounds and rolls back on repository failure', () async {
      final repo = _FakePlanRepository([_samplePlan()]);
      final controller = PlanController(
        repo,
        AiRepositoryImpl(),
        _FakeLocationRepository(),
      );
      await controller.load();

      expect(
        (await controller.updatePlan(
          'plan-1',
          title: '   ',
          startDate: DateTime(2026, 7, 10),
          endDate: DateTime(2026, 7, 12),
          peopleCount: 2,
          totalBudget: 1000,
          originProvince: '',
          note: '',
        )).isFailed,
        isTrue,
      );
      expect(
        (await controller.updatePlan(
          'plan-1',
          title: 'Valid',
          startDate: DateTime(2026, 7, 12),
          endDate: DateTime(2026, 7, 10),
          peopleCount: 2,
          totalBudget: 1000,
          originProvince: '',
          note: '',
        )).isFailed,
        isTrue,
      );
      expect(
        (await controller.updatePlan(
          'plan-1',
          title: 'Valid',
          startDate: DateTime(2026, 7, 1),
          endDate: DateTime(2026, 8, 5),
          peopleCount: 2,
          totalBudget: 1000,
          originProvince: '',
          note: '',
        )).isFailed,
        isTrue,
      );
      expect(
        (await controller.updatePlan(
          'plan-1',
          title: 'Valid',
          startDate: DateTime(2026, 7, 1),
          endDate: DateTime(2026, 7, 2),
          peopleCount: 0,
          totalBudget: 1000,
          originProvince: '',
          note: '',
        )).isFailed,
        isTrue,
      );
      expect(
        (await controller.updatePlan(
          'plan-1',
          title: 'Valid',
          startDate: DateTime(2026, 7, 1),
          endDate: DateTime(2026, 7, 2),
          peopleCount: 31,
          totalBudget: 1000,
          originProvince: '',
          note: '',
        )).isFailed,
        isTrue,
      );
      expect(
        (await controller.updatePlan(
          'plan-1',
          title: 'Valid',
          startDate: DateTime(2026, 7, 1),
          endDate: DateTime(2026, 7, 2),
          peopleCount: 2,
          totalBudget: -1,
          originProvince: '',
          note: '',
        )).isFailed,
        isTrue,
      );
      expect(
        (await controller.updatePlan(
          'plan-1',
          title: 'Valid',
          startDate: DateTime(2026, 7, 1),
          endDate: DateTime(2026, 7, 2),
          peopleCount: 2,
          totalBudget: 1000000001,
          originProvince: '',
          note: '',
        )).isFailed,
        isTrue,
      );
      expect(
        (await controller.updatePlan(
          'plan-1',
          title: 'Valid',
          startDate: DateTime(2026, 7, 1),
          endDate: DateTime(2026, 7, 2),
          peopleCount: 2,
          totalBudget: 1000,
          originProvince: '',
          note: '',
          destinationIds: List.generate(8, (i) => 'dest-$i'),
        )).isFailed,
        isTrue,
      );

      // Rollback on failure
      repo.failUpdate = true;
      final failRes = await controller.updatePlan(
        'plan-1',
        title: 'Tidak Tersimpan',
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 12),
        peopleCount: 2,
        totalBudget: 1500000,
        originProvince: 'DKI Jakarta',
        note: '',
      );
      expect(failRes.isFailed, isTrue);
      expect(controller.findPlanById('plan-1')!.title, 'Trip Bromo Lama');
    });
  });

  group('PlanEditScreen & entry points widget tests (390x844)', () {
    setUp(() async {
      await useTestFonts();
    });

    testWidgets(
      'PlanDetailScreen has >=44dp edit/delete buttons, navigates to PlanEditScreen, edits & saves',
      (tester) async {
        await usePhone(tester);
        final store = TestStores(
          plans: [
            _samplePlan(
              startDate: DateTime(2025, 5, 1),
              endDate: DateTime(2025, 5, 2),
            ),
          ],
        );
        await store.plan.load();

        await tester.pumpWidget(
          wrapScreen(const PlanDetailScreen(planId: 'plan-1'), store: store),
        );
        await tester.pumpAndSettle();

        final editBtn = find.byTooltip('Ubah rencana');
        final deleteBtn = find.byTooltip('Hapus rencana');
        expect(editBtn, findsOneWidget);
        expect(deleteBtn, findsOneWidget);
        expect(tester.getSize(editBtn).width, greaterThanOrEqualTo(44));
        expect(tester.getSize(editBtn).height, greaterThanOrEqualTo(44));
        expect(tester.getSize(deleteBtn).width, greaterThanOrEqualTo(44));
        expect(tester.getSize(deleteBtn).height, greaterThanOrEqualTo(44));

        await tester.tap(editBtn);
        await tester.pumpAndSettle();

        expect(find.text('Ubah rencana'), findsOneWidget);
        expect(find.text('Trip Bromo Lama'), findsOneWidget);

        // Uji date picker pada rencana tanggal lampau (tahun 2025)
        await tester.tap(find.text('1 Mei 2025'));
        await tester.pumpAndSettle();
        expect(find.text('Batal'), findsOneWidget);
        await tester.tap(find.text('Batal'));
        await tester.pumpAndSettle();

        // Edit budget ke nilai invalid > 64-bit / > 1M
        final budgetField = find.widgetWithText(DnInput, 'Estimasi budget');
        await tester.scrollUntilVisible(
          budgetField,
          200,
          scrollable: find.byType(Scrollable).first,
        );
        await tester.enterText(
          find.descendant(of: budgetField, matching: find.byType(TextField)),
          '999999999999999999999',
        );
        await tester.pumpAndSettle();
        expect(find.text('Budget maksimal Rp1.000.000.000.'), findsOneWidget);

        // Perbaiki budget valid dan ubah nama rencana
        await tester.enterText(
          find.descendant(of: budgetField, matching: find.byType(TextField)),
          '2500000',
        );
        final titleField = find.widgetWithText(DnInput, 'Nama rencana');
        await tester.scrollUntilVisible(
          titleField,
          -200,
          scrollable: find.byType(Scrollable).first,
        );
        await tester.enterText(
          find.descendant(of: titleField, matching: find.byType(TextField)),
          'Trip Bromo Revisi',
        );
        await tester.pumpAndSettle();

        await tester.tap(find.text('Simpan perubahan'));
        await tester.pumpAndSettle();

        expect(store.plan.findPlanById('plan-1')!.title, 'Trip Bromo Revisi');
        expect(store.plan.findPlanById('plan-1')!.totalBudget, 2500000);
        expect(find.text('Trip Bromo Revisi'), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );

    testWidgets(
      'Back on dirty PlanEditScreen shows discard confirmation dialog',
      (tester) async {
        await usePhone(tester);
        final store = TestStores(plans: [_samplePlan()]);
        await store.plan.load();

        await tester.pumpWidget(
          wrapScreen(const PlanDetailScreen(planId: 'plan-1'), store: store),
        );
        await tester.pumpAndSettle();

        await tester.tap(find.byTooltip('Ubah rencana'));
        await tester.pumpAndSettle();

        final titleField = find.widgetWithText(DnInput, 'Nama rencana');
        await tester.enterText(
          find.descendant(of: titleField, matching: find.byType(TextField)),
          'Diubah Tapi Batal',
        );
        await tester.pumpAndSettle();

        // Tap tombol back di AppBar
        await tester.tap(find.byTooltip('Kembali'));
        await tester.pumpAndSettle();

        expect(find.text('Buang perubahan?'), findsOneWidget);
        await tester.tap(find.text('Lanjutkan ubah'));
        await tester.pumpAndSettle();
        expect(find.text('Ubah rencana'), findsOneWidget);

        await tester.tap(find.byTooltip('Kembali'));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Buang'));
        await tester.pumpAndSettle();

        expect(store.plan.findPlanById('plan-1')!.title, 'Trip Bromo Lama');
        expect(find.text('Rencana Perjalanan'), findsOneWidget);
      },
    );

    testWidgets(
      'SavedPlansScreen shows >=44dp edit button next to delete without overflow and opens PlanEditScreen',
      (tester) async {
        await usePhone(tester);
        final store = TestStores(plans: [_samplePlan()]);
        await store.plan.load();

        await tester.pumpWidget(
          wrapScreen(const SavedPlansScreen(), store: store),
        );
        await tester.pumpAndSettle();

        expect(find.byType(DnPlanCard), findsOneWidget);
        final editBtn = find.byTooltip('Ubah rencana');
        final deleteBtn = find.byTooltip('Hapus rencana');
        expect(editBtn, findsOneWidget);
        expect(deleteBtn, findsOneWidget);
        expect(tester.getSize(editBtn).width, greaterThanOrEqualTo(44));
        expect(tester.getSize(editBtn).height, greaterThanOrEqualTo(44));

        await tester.tap(editBtn);
        await tester.pumpAndSettle();
        expect(find.text('Ubah rencana'), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );
  });

  group('Audit Ronde 1 regression tests', () {
    List<PlanItem> makeItems(int count, {String prefix = 'item'}) => [
      for (var i = 0; i < count; i++)
        PlanItem(
          destinationId: i == 0 ? '$prefix-0' : null,
          destinationName: 'Aktivitas $prefix $i',
          activity: 'Eksplor',
        ),
    ];

    test('capacity limits, backward folding, and PATCH payload verification', () async {
      // 1a. 2 hari dengan total 20 item dipendekkan menjadi 1 hari -> sukses 20 item
      final plan20 = _samplePlan().copyWith(
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 11),
        destinationIds: const ['a-0'],
        days: [
          PlanDay(day: 1, title: 'Hari 1', items: makeItems(12, prefix: 'a')),
          PlanDay(day: 2, title: 'Hari 2', items: makeItems(8, prefix: 'b')),
        ],
      );
      final repo20 = _FakePlanRepository([plan20]);
      final ctrl20 = PlanController(
        repo20,
        AiRepositoryImpl(),
        _FakeLocationRepository(),
      );
      await ctrl20.load();

      final res20 = await ctrl20.updatePlan(
        'plan-1',
        title: 'Padat 20',
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 10),
        peopleCount: 2,
        totalBudget: 1500000,
        originProvince: 'DKI Jakarta',
        note: '',
      );
      expect(res20.isSuccess, isTrue);
      expect(repo20.updateCalls, 1);
      final updated20 = ctrl20.findPlanById('plan-1')!;
      expect(updated20.days, hasLength(1));
      expect(updated20.days.first.items, hasLength(20));
      final patchDays20 = PlanModel.toUpdateJson(updated20)['days'] as List;
      expect((patchDays20.first as Map)['items'], hasLength(20));

      // 1b. 2 hari dengan total 21 item dipendekkan menjadi 1 hari -> ditolak sebelum repo.update
      final plan21 = _samplePlan().copyWith(
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 11),
        destinationIds: const ['a-0'],
        days: [
          PlanDay(day: 1, title: 'Hari 1', items: makeItems(12, prefix: 'a')),
          PlanDay(day: 2, title: 'Hari 2', items: makeItems(9, prefix: 'b')),
        ],
      );
      final repo21 = _FakePlanRepository([plan21]);
      final ctrl21 = PlanController(
        repo21,
        AiRepositoryImpl(),
        _FakeLocationRepository(),
      );
      await ctrl21.load();

      final res21 = await ctrl21.updatePlan(
        'plan-1',
        title: 'Kelebihan 21',
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 10),
        peopleCount: 2,
        totalBudget: 1500000,
        originProvince: 'DKI Jakarta',
        note: '',
      );
      expect(res21.isFailed, isTrue);
      expect(repo21.updateCalls, 0);
      expect(ctrl21.findPlanById('plan-1')!.days, hasLength(2));

      // 1c. 3 hari (5, 20, 3) dipendekkan ke 2 hari -> 3 item dilipat mundur ke Hari 1 (8, 20)
      final planFold = _samplePlan().copyWith(
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 12),
        destinationIds: const ['a-0'],
        days: [
          PlanDay(day: 1, title: 'Hari 1', items: makeItems(5, prefix: 'a')),
          PlanDay(day: 2, title: 'Hari 2', items: makeItems(20, prefix: 'b')),
          PlanDay(day: 3, title: 'Hari 3', items: makeItems(3, prefix: 'c')),
        ],
      );
      final repoFold = _FakePlanRepository([planFold]);
      final ctrlFold = PlanController(
        repoFold,
        AiRepositoryImpl(),
        _FakeLocationRepository(),
      );
      await ctrlFold.load();

      final resFold = await ctrlFold.updatePlan(
        'plan-1',
        title: 'Lipat Mundur',
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 11),
        peopleCount: 2,
        totalBudget: 1500000,
        originProvince: 'DKI Jakarta',
        note: '',
      );
      expect(resFold.isSuccess, isTrue);
      final updatedFold = ctrlFold.findPlanById('plan-1')!;
      expect(updatedFold.days, hasLength(2));
      expect(updatedFold.days[0].items, hasLength(8));
      expect(updatedFold.days[1].items, hasLength(20));
      final patchFoldDays = PlanModel.toUpdateJson(updatedFold)['days'] as List;
      expect((patchFoldDays[0] as Map)['items'], hasLength(8));
      expect((patchFoldDays[1] as Map)['items'], hasLength(20));

      // 1d. 1 hari berisi 20 item + 1 destinasi baru -> ditolak sebelum repo.update
      final planFullAdd = _samplePlan().copyWith(
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 10),
        destinationIds: const ['a-0'],
        days: [
          PlanDay(
            day: 1,
            title: 'Hari 1',
            items: [
              const PlanItem(
                destinationId: 'a-0',
                destinationName: 'Aktivitas utama',
                activity: 'Eksplor',
              ),
              for (var i = 1; i < 20; i++)
                PlanItem(
                  destinationId: null,
                  destinationName: 'Aktivitas lokal $i',
                  activity: 'Eksplor',
                ),
            ],
          ),
        ],
      );
      final repoFullAdd = _FakePlanRepository([planFullAdd]);
      final ctrlFullAdd = PlanController(
        repoFullAdd,
        AiRepositoryImpl(),
        _FakeLocationRepository(),
      );
      await ctrlFullAdd.load();

      final resFullAdd = await ctrlFullAdd.updatePlan(
        'plan-1',
        title: 'Tambah Penuh',
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 10),
        peopleCount: 2,
        totalBudget: 1500000,
        originProvince: 'DKI Jakarta',
        note: '',
        destinationIds: const ['a-0', 'dest-baru'],
      );
      expect(resFullAdd.isFailed, isTrue);
      expect(repoFullAdd.updateCalls, 0);
    });

    test('concurrent AI lock rejects updatePlan synchronously even before AI completes', () async {
      final aiCompleter = Completer<Result<AiResult>>();
      final repo = _FakePlanRepository([_samplePlan()]);
      final ctrl = PlanController(
        repo,
        _ControlledAiRepository(aiCompleter),
        _FakeLocationRepository(),
      );
      await ctrl.load();

      final aiFuture = ctrl.generateAi('plan-1');
      await Future<void>.delayed(Duration.zero);
      expect(ctrl.isGenerating('plan-1'), isTrue);

      final editResult = await ctrl.updatePlan(
        'plan-1',
        title: 'Edit Saat AI Aktif',
        startDate: DateTime(2026, 7, 10),
        endDate: DateTime(2026, 7, 12),
        peopleCount: 2,
        totalBudget: 1500000,
        originProvince: 'DKI Jakarta',
        note: '',
      );
      expect(editResult.isFailed, isTrue);
      expect(editResult.message, 'Tunggu AI selesai menyusun rencana.');
      expect(repo.updateCalls, 0);

      aiCompleter.complete(
        const Success(
          AiResult(
            preference: AiPreference(),
            summary: 'Ringkasan AI Baru',
            items: [],
            relatedChecklist: [],
            kind: 'deterministic',
            itinerary: AiItinerary(
              title: 'Itinerary AI',
              summary: 'Ringkasan AI Baru',
              days: [
                AiItineraryDay(
                  day: 1,
                  title: 'Hari AI',
                  items: [
                    AiItineraryItem(
                      destinationId: 'dest-bromo',
                      destinationName: 'Gunung Bromo',
                      activity: 'Eksplor AI',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
      await aiFuture;

      expect(ctrl.isGenerating('plan-1'), isFalse);
      expect(ctrl.findPlanById('plan-1')!.summary, 'Ringkasan AI Baru');
      expect(ctrl.findPlanById('plan-1')!.title, 'Trip Bromo Lama');
    });

    test('PlanEditScreen.parseBudgetInput rejects signed, decimal, and malformed inputs', () {
      expect(PlanEditScreen.parseBudgetInput(''), (value: 0, error: null));
      expect(PlanEditScreen.parseBudgetInput('1500000'), (
        value: 1500000,
        error: null,
      ));
      expect(PlanEditScreen.parseBudgetInput('1.500.000'), (
        value: 1500000,
        error: null,
      ));
      expect(PlanEditScreen.parseBudgetInput('Rp 1.500.000'), (
        value: 1500000,
        error: null,
      ));

      expect(PlanEditScreen.parseBudgetInput('-1000').error, isNotNull);
      expect(PlanEditScreen.parseBudgetInput('+1000').error, isNotNull);
      expect(PlanEditScreen.parseBudgetInput('1000,50').error, isNotNull);
      expect(PlanEditScreen.parseBudgetInput('1000.50').error, isNotNull);
      expect(PlanEditScreen.parseBudgetInput('abc').error, isNotNull);
      expect(PlanEditScreen.parseBudgetInput('1000000001').error, isNotNull);
      expect(
        PlanEditScreen.parseBudgetInput('99999999999999999999').error,
        isNotNull,
      );
    });

    testWidgets('PlanEditScreen deep-link handles loading, load failure retry, and not-found', (tester) async {
      await useTestFonts();
      await usePhone(tester);

      // 4a. Pending load -> CircularProgressIndicator, lalu terisi setelah selesai
      var loadCompleter = Completer<Result<List<TripPlan>>>();
      final controller = PlanController(
        _DeferredLoadPlanRepository(() => loadCompleter.future),
        AiRepositoryImpl(),
        _FakeLocationRepository(),
      );
      final destController = DestinationsController(
        repository: _SeedDestRepo(),
        initialItems: DestinationSeedData.items,
      );

      Widget buildDeepLinkApp(String planId) {
        final router = GoRouter(
          initialLocation: '/plan/$planId/edit',
          routes: [
            GoRoute(
              path: '/plan/:id/edit',
              builder: (_, state) =>
                  PlanEditScreen(planId: state.pathParameters['id'] ?? ''),
            ),
            GoRoute(
              path: '/plan/:id',
              builder: (_, _) => const SizedBox.shrink(),
            ),
            GoRoute(path: '/plan', builder: (_, _) => const SizedBox.shrink()),
          ],
        );
        return MultiProvider(
          providers: [
            ChangeNotifierProvider.value(value: controller),
            ChangeNotifierProvider.value(value: destController),
          ],
          child: MaterialApp.router(
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            routerConfig: router,
          ),
        );
      }

      await tester.pumpWidget(buildDeepLinkApp('plan-1'));
      await tester.pump();
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Rencana tidak ditemukan'), findsNothing);

      loadCompleter.complete(Success([_samplePlan()]));
      await tester.pumpAndSettle();
      expect(find.text('Trip Bromo Lama'), findsOneWidget);

      // 4b. Gagal muat -> tampilkan Gagal memuat rencana + Coba lagi, lalu pulih saat retry
      var failCompleter = Completer<Result<List<TripPlan>>>();
      final failController = PlanController(
        _DeferredLoadPlanRepository(() => failCompleter.future),
        AiRepositoryImpl(),
        _FakeLocationRepository(),
      );
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider.value(value: failController),
            ChangeNotifierProvider.value(value: destController),
          ],
          child: MaterialApp.router(
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            routerConfig: GoRouter(
              initialLocation: '/plan/plan-1/edit',
              routes: [
                GoRoute(
                  path: '/plan/:id/edit',
                  builder: (_, state) =>
                      PlanEditScreen(planId: state.pathParameters['id'] ?? ''),
                ),
              ],
            ),
          ),
        ),
      );
      await tester.pump();
      failCompleter.complete(const Failure(NetworkFailure('Server sibuk')));
      await tester.pumpAndSettle();
      expect(find.text('Gagal memuat rencana'), findsOneWidget);
      expect(find.text('Coba lagi'), findsOneWidget);

      // 4c. ID asing setelah load selesai -> Rencana tidak ditemukan
      await tester.pumpWidget(buildDeepLinkApp('plan-tidak-ada'));
      await tester.pumpAndSettle();
      expect(find.text('Rencana tidak ditemukan'), findsOneWidget);

      // 4d. Refresh gagal saat plans non-kosong lalu buka deep-link plan baru -> Gagal memuat rencana + Coba lagi
      final planA = _samplePlan(id: 'plan-a').copyWith(title: 'Rencana A');
      final planB = _samplePlan(id: 'plan-b').copyWith(title: 'Rencana B');
      var phase = 0;
      final refreshController = PlanController(
        _DeferredLoadPlanRepository(() async {
          phase++;
          if (phase == 1) return Success([planA]);
          if (phase == 2) {
            return const Failure(NetworkFailure('Refresh gagal sementara'));
          }
          return Success([planA, planB]);
        }),
        AiRepositoryImpl(),
        _FakeLocationRepository(),
      );
      await refreshController.load();
      expect(refreshController.plans, hasLength(1));
      await refreshController.load();
      expect(refreshController.plans, hasLength(1));
      expect(refreshController.error, isNotNull);

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider.value(value: refreshController),
            ChangeNotifierProvider.value(value: destController),
          ],
          child: MaterialApp.router(
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            routerConfig: GoRouter(
              initialLocation: '/plan/plan-b/edit',
              routes: [
                GoRoute(
                  path: '/plan/:id/edit',
                  builder: (_, state) =>
                      PlanEditScreen(planId: state.pathParameters['id'] ?? ''),
                ),
              ],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Gagal memuat rencana'), findsOneWidget);
      expect(find.text('Rencana tidak ditemukan'), findsNothing);
      expect(find.text('Coba lagi'), findsOneWidget);

      await tester.tap(find.text('Coba lagi'));
      await tester.pumpAndSettle();
      expect(refreshController.error, isNull);
      expect(find.text('Rencana B'), findsOneWidget);
    });

    testWidgets('DnInput and DnDateField placeholders use AppColors.body for WCAG AA contrast', (tester) async {
      await useTestFonts();
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light(),
          home: Scaffold(
            body: Column(
              children: [
                const DnInput(label: 'Budget', hint: 'Rp 1500000'),
                DnDateField(
                  label: 'Tanggal',
                  value: '',
                  placeholder: 'Pilih tanggal',
                  onTap: () {},
                ),
              ],
            ),
          ),
        ),
      );

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.decoration?.hintStyle?.color, AppColors.body);

      final placeholderText = tester.widget<Text>(find.text('Pilih tanggal'));
      expect(placeholderText.style?.color, AppColors.body);
    });
  });
}
