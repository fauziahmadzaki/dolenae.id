import 'package:dolenae_mobile/src/data/models/search_filter.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/checklist_done_screen.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/explore_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/plan_new_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/plan_success_screen.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);

  group('Layar Rencana Sukses', () {
    testWidgets('menampilkan ringkasan rencana yang baru disimpan', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(
          const PlanSuccessScreen(
            planName: 'Trip Bromo 3 hari',
            dateRange: '12 Jul - 14 Jul 2026',
            destinationCount: 4,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Rencana tersimpan'), findsOneWidget);
      expect(find.text('Rencana'), findsOneWidget);
      expect(find.text('Trip Bromo 3 hari'), findsOneWidget);
      expect(find.text('Tanggal'), findsOneWidget);
      expect(find.text('12 Jul - 14 Jul 2026'), findsOneWidget);
      expect(find.text('Destinasi'), findsOneWidget);
      expect(find.text('4 destinasi'), findsOneWidget);
      expect(find.text('Lihat rencana'), findsOneWidget);
      expect(find.text('Kembali ke beranda'), findsOneWidget);
    });

    testWidgets('nilai kosong menampilkan tanda hubung', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const PlanSuccessScreen()));
      await tester.pumpAndSettle();
      expect(find.text('-'), findsNWidgets(2));
    });

    testWidgets('kedua tombol memakai delegate bila diberikan', (tester) async {
      await usePhone(tester);
      var viewed = 0;
      var homed = 0;
      await tester.pumpWidget(
        wrapScreen(
          PlanSuccessScreen(onViewPlan: () => viewed++, onBackHome: () => homed++),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Lihat rencana'));
      await tester.pump();
      await tester.tap(find.text('Kembali ke beranda'));
      await tester.pump();

      expect(viewed, 1);
      expect(homed, 1);
    });
  });

  group('Layar Checklist Selesai', () {
    testWidgets('menampilkan nama checklist, jumlah item, dan dua tombol', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(
          const ChecklistDoneScreen(
            checklistName: 'Paket Bromo',
            destinationName: 'Gunung Bromo',
            completedCount: 12,
            totalCount: 12,
            showToast: false,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Checklist lengkap!'), findsOneWidget);
      expect(
        find.text('Paket Bromo · Gunung Bromo'),
        findsOneWidget,
      );
      expect(find.text('12 dari 12 item sudah siap'), findsOneWidget);
      expect(find.text('Kembali ke rencana'), findsOneWidget);
      expect(find.text('Kembali ke beranda'), findsOneWidget);
    });

    testWidgets('tanpa jumlah item disembunyikan baris ringkasan', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(const ChecklistDoneScreen(showToast: false)),
      );
      await tester.pumpAndSettle();

      expect(find.text('Checklist lengkap!'), findsOneWidget);
      expect(find.textContaining('item sudah siap'), findsNothing);
    });

    testWidgets('menampilkan toast sukses saat dibuka', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(const ChecklistDoneScreen()),
      );
      await tester.pumpAndSettle();
      expect(find.text('Checklist tersimpan'), findsOneWidget);
    });

    testWidgets('kedua tombol memakai delegate bila diberikan', (tester) async {
      await usePhone(tester);
      var back = 0;
      var home = 0;
      await tester.pumpWidget(
        wrapScreen(
          ChecklistDoneScreen(
            showToast: false,
            onBackToPlan: () => back++,
            onBackHome: () => home++,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Kembali ke rencana'));
      await tester.pump();
      await tester.tap(find.text('Kembali ke beranda'));
      await tester.pump();

      expect(back, 1);
      expect(home, 1);
    });
  });

  group('Layar Buat Rencana Ringkas', () {
    testWidgets('menampilkan nama, tanggal, stepper, budget, dan catatan', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const PlanNewScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Buat rencana'), findsWidgets);
      expect(find.text('Nama rencana'), findsOneWidget);
      expect(find.text('Tanggal mulai'), findsOneWidget);
      expect(find.text('Jumlah hari'), findsOneWidget);
      expect(find.text('Jumlah orang'), findsWidgets);
      expect(find.text('Estimasi budget'), findsOneWidget);
      expect(find.text('Catatan'), findsOneWidget);
      expect(find.text('Ringkasan'), findsOneWidget);
    });

    testWidgets('tombol simpan nonaktif sebelum nama diisi', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const PlanNewScreen()));
      await tester.pumpAndSettle();

      final cta = find.widgetWithText(FilledButton, 'Simpan rencana');
      expect(tester.widget<FilledButton>(cta).onPressed, isNull);

      await tester.enterText(find.byType(TextField).first, 'Trip Dieng');
      await tester.pumpAndSettle();
      expect(tester.widget<FilledButton>(cta).onPressed, isNotNull);
    });

    testWidgets('form terisi mengirim ringkasan dengan periode', (tester) async {
      await usePhone(tester);
      final results = <({String name, String dateRange, int days, int people, int budget})>[];
      await tester.pumpWidget(
        wrapScreen(PlanNewScreen(onSubmit: results.add)),
      );
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).first, 'Trip Dieng');
      await tester.enterText(find.byType(TextField).at(1), '750000');
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(FilledButton, 'Simpan rencana'));
      await tester.pumpAndSettle();

      expect(results, hasLength(1));
      expect(results.single.name, 'Trip Dieng');
      expect(results.single.budget, 750000);
      expect(results.single.days, 2);
      expect(results.single.people, 2);
      expect(results.single.dateRange, contains(' - '));
    });

    testWidgets('nilai awal dipakai untuk mengisi kolom', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(
          const PlanNewScreen(initialName: 'Trip Bromo', initialNote: 'Bawa tenda'),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Trip Bromo'), findsOneWidget);
      expect(find.text('Bawa tenda'), findsOneWidget);
    });
  });

  group('Pencarian di Jelajah', () {
    testWidgets('kondisi awal menampilkan riwayat dan pencarian populer', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const ExploreScreen()));
      await tester.pumpAndSettle();

      expect(find.text('RIWAYAT PENCARIAN'), findsOneWidget);
      expect(find.text('PENCARIAN POPULER'), findsOneWidget);
      expect(find.text('DESTINASI DISARANKAN'), findsOneWidget);
      expect(find.text('Hapus riwayat'), findsOneWidget);
      expect(find.text('Tidak ada hasil'), findsNothing);
    });

    testWidgets('kueri cocok menampilkan daftar hasil dan jumlah', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const ExploreScreen()));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).first, 'bromo');
      await tester.pumpAndSettle();

      expect(find.textContaining('hasil · Urutkan: Paling populer'), findsOneWidget);
      expect(find.text('Gunung Bromo'), findsWidgets);
      expect(find.text('Tidak ada hasil'), findsNothing);
    });

    testWidgets('kueri tanpa cocok memunculkan empty state', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const ExploreScreen()));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).first, 'gunung misterius');
      await tester.pumpAndSettle();

      expect(find.text('Tidak ada hasil'), findsOneWidget);
    });

    testWidgets('memilih riwayat menyimpan kueri dan menambah riwayat', (
      tester,
    ) async {
      await usePhone(tester);
      final store = newStore();
      await tester.pumpWidget(
        wrapScreen(const ExploreScreen(), store: store),
      );
      await tester.pumpAndSettle();

      final target = store.search.searchHistory.last;
      await tester.tap(find.text(target));
      await tester.pumpAndSettle();

      expect(store.search.searchFilter.query, target);
      expect(store.search.searchHistory.first, target);
    });

    testWidgets('hapus riwayat mengosongkan daftar riwayat', (tester) async {
      await usePhone(tester);
      final store = newStore();
      await tester.pumpWidget(
        wrapScreen(const ExploreScreen(), store: store),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Hapus riwayat'));
      await tester.pumpAndSettle();

      expect(store.search.searchHistory, isEmpty);
      expect(find.text('RIWAYAT PENCARIAN'), findsNothing);
    });

    testWidgets('tombol filter membuka bottom sheet', (tester) async {
      await usePhone(tester);
      var opened = 0;
      await tester.pumpWidget(
        wrapScreen(ExploreScreen(onOpenFilter: () => opened++)),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(AppIcons.slidersHorizontal));
      await tester.pump();
      expect(opened, 1);
    });
  });

  group('Model Filter Pencarian', () {
    test('label opsi urutkan dan kesulitan tersedia', () {
      expect(SortOption.populer.label, 'Paling populer');
      expect(SortOption.terdekat.label, 'Paling dekat');
      expect(DifficultyFilter.semua.label, 'Semua tingkat');
      expect(DifficultyFilter.sulit.label, 'Sulit');
    });

    test('cleared mempertahankan kueri dan membuang filter lain', () {
      const filter = SearchFilter(
        query: 'bromo',
        sort: SortOption.rating,
        difficulty: DifficultyFilter.sulit,
        supports: ['Area camping'],
      );
      expect(filter.isFiltered, isTrue);

      final cleared = filter.cleared();
      expect(cleared.query, 'bromo');
      expect(cleared.sort, SortOption.populer);
      expect(cleared.difficulty, DifficultyFilter.semua);
      expect(cleared.supports, isEmpty);
      expect(cleared.isFiltered, isFalse);
    });
  });
}
