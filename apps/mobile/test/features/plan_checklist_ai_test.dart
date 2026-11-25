import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/plan/data/data_sources/plan_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/trip_plan_screen.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);

  testWidgets('detail rencana membuka checklist persiapan', (tester) async {
    await usePhone(tester);
    final store = TestStores();
    await store.plan.load();
    await tester.pumpWidget(wrapScreen(const TripPlanScreen(), store: store));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Trip Dieng'));
    await tester.pumpAndSettle();

    expect(find.text('Checklist persiapan'), findsOneWidget);
    expect(find.text('3/7 siap'), findsOneWidget);

    await tester.tap(find.text('Checklist persiapan'));
    await tester.pumpAndSettle();

    expect(find.text('Checklist Persiapan'), findsOneWidget);
    expect(find.text('Air minum 2L'), findsOneWidget);
    expect(find.text('3/7 siap'), findsOneWidget);
    expect(find.text('Rp20.000'), findsWidgets);
    expect(find.textContaining('Estimasi biaya:'), findsOneWidget);
    expect(find.textContaining('Budget masih longgar'), findsOneWidget);
  });

  testWidgets('item checklist bisa dicentang dari rencana', (tester) async {
    await usePhone(tester);
    final store = TestStores();
    await store.plan.load();
    await tester.pumpWidget(wrapScreen(const TripPlanScreen(), store: store));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Trip Dieng'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Checklist persiapan'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Headlamp'));
    await tester.pumpAndSettle();

    expect(find.text('4/7 siap'), findsOneWidget);
    final plan = store.plan.plans.firstWhere(
      (item) => item.id == 'plan-dieng-01',
    );
    expect(
      plan.checklist.firstWhere((item) => item.id == 'chk-dieng-3').isCompleted,
      isTrue,
    );
  });

  testWidgets('item checklist baru bisa ditambahkan', (tester) async {
    await usePhone(tester);
    final store = TestStores();
    await store.plan.load();
    await tester.pumpWidget(wrapScreen(const TripPlanScreen(), store: store));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Trip Dieng'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Checklist persiapan'));
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(FilledButton, 'Tambah item'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).first, 'Buff');
    await tester.pump();
    await tester.tap(find.widgetWithText(FilledButton, 'Tambah item'));
    await tester.pumpAndSettle();

    expect(find.text('Buff'), findsOneWidget);
    final plan = store.plan.plans.firstWhere(
      (item) => item.id == 'plan-dieng-01',
    );
    expect(plan.checklist.any((item) => item.name == 'Buff'), isTrue);
  });

  testWidgets('rencana bisa dihapus dari halaman detail', (tester) async {
    await usePhone(tester);
    final store = TestStores();
    await store.plan.load();
    await tester.pumpWidget(wrapScreen(const TripPlanScreen(), store: store));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Trip Dieng'));
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('Hapus rencana'));
    await tester.pumpAndSettle();
    expect(find.text('Hapus rencana ini?'), findsOneWidget);

    await tester.tap(find.widgetWithText(FilledButton, 'Hapus'));
    await tester.pumpAndSettle();

    expect(store.plan.plans.any((plan) => plan.id == 'plan-dieng-01'), isFalse);
    expect(find.text('Trip Dieng'), findsNothing);
    expect(find.text('Trip Bromo'), findsOneWidget);
  });

  test('toggle sudah punya mengeluarkan item dari total biaya', () async {
    final store = TestStores();
    await store.plan.load();
    final before = store.plan.plans.firstWhere(
      (item) => item.id == 'plan-dieng-01',
    );
    final beforeTotal = before.checklist.fold<int>(
      0,
      (sum, item) => sum + (item.isOwned ? 0 : (item.estimatedCost ?? 0)),
    );
    final beforeProgress = before.checklistProgress;

    await store.plan.toggleChecklistOwned('plan-dieng-01', 'chk-dieng-1');

    final after = store.plan.plans.firstWhere(
      (item) => item.id == 'plan-dieng-01',
    );
    final afterTotal = after.checklist.fold<int>(
      0,
      (sum, item) => sum + (item.isOwned ? 0 : (item.estimatedCost ?? 0)),
    );
    expect(afterTotal, beforeTotal - 20000);
    expect(
      after.checklist.firstWhere((item) => item.id == 'chk-dieng-1').isOwned,
      isTrue,
    );
    expect(after.checklistProgress, beforeProgress);
  });

  test('memilih alternatif transport hanya menghitung satu item', () async {
    final base = PlanSeedData.plans.first.copyWith(
      checklist: const [
        ChecklistItem(
          id: 'chk-flight',
          name: 'Tiket pesawat antarprovinsi',
          category: ChecklistCategory.biaya,
          isRequired: true,
          estimatedCost: 900000,
          alternativeGroup: 'transport-antarprovinsi',
        ),
        ChecklistItem(
          id: 'chk-ferry',
          name: 'Tiket kapal laut antarprovinsi',
          category: ChecklistCategory.biaya,
          isRequired: true,
          isOwned: true,
          estimatedCost: 250000,
          alternativeGroup: 'transport-antarprovinsi',
        ),
      ],
    );
    final store = TestStores(plans: [base]);
    await store.plan.load();

    await store.plan.selectChecklistAlternative(
      base.id,
      'transport-antarprovinsi',
      'chk-ferry',
    );

    final checklist = store.plan.plans.single.checklist;
    expect(
      checklist.firstWhere((item) => item.id == 'chk-flight').isOwned,
      isTrue,
    );
    expect(
      checklist.firstWhere((item) => item.id == 'chk-ferry').isOwned,
      isFalse,
    );
    final total = checklist.fold<int>(
      0,
      (sum, item) => sum + (item.isOwned ? 0 : (item.estimatedCost ?? 0)),
    );
    expect(total, 250000);
  });

  test('generate checklist AI menggabungkan item tanpa duplikat', () async {
    final store = TestStores();
    await store.plan.load();
    final before = store.plan.plans
        .firstWhere((item) => item.id == 'plan-dieng-01')
        .checklist;
    final beforeLength = before.length;

    final error = await store.plan.generateChecklist('plan-dieng-01');

    expect(error, isNull);
    final after = store.plan.plans
        .firstWhere((item) => item.id == 'plan-dieng-01')
        .checklist;
    expect(after.length, beforeLength + 2);
    expect(after.map((item) => item.name), contains('Jaket tahan angin'));
    expect(
      after.firstWhere((item) => item.name == 'Air minum 2L').isCompleted,
      isTrue,
    );
    expect(
      after.firstWhere((item) => item.name == 'Jaket tahan angin').category,
      ChecklistCategory.perlengkapan,
    );
  });
}
