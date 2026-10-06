import 'package:dolenae_mobile/src/data/models/search_filter.dart';
import 'package:dolenae_mobile/src/data/seed/seed_data.dart';
import 'package:dolenae_mobile/src/features/ai/presentation/ai_results_screen.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/explore_screen.dart';
import 'package:dolenae_mobile/src/features/home/presentation/beranda_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);

  group('State Gagal Memuat Beranda', () {
    testWidgets('kondisi normal tetap menampilkan isi beranda', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(wrapScreen(const BerandaScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Mau ke mana?'), findsOneWidget);
      expect(find.text('Gagal memuat beranda'), findsNothing);
    });

    testWidgets('state gagal mengganti isi dengan panel kegagalan', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(const BerandaScreen(hasError: true)),
      );
      await tester.pumpAndSettle();

      expect(find.text('Gagal memuat beranda'), findsOneWidget);
      expect(
        find.textContaining('tidak bisa mengambil destinasi populer'),
        findsOneWidget,
      );
      expect(find.text('Coba lagi'), findsOneWidget);
      expect(find.text('Muat ulang'), findsOneWidget);
      expect(find.text('Mau ke mana?'), findsNothing);
    });

    testWidgets('keduanya CTA dan ghost memanggil delegate', (tester) async {
      await usePhone(tester);
      var retried = 0;
      var reloaded = 0;
      await tester.pumpWidget(
        wrapScreen(
          BerandaScreen(
            hasError: true,
            onRetry: () => retried++,
            onReload: () => reloaded++,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Coba lagi'));
      await tester.pump();
      await tester.tap(find.text('Muat ulang'));
      await tester.pump();

      expect(retried, 1);
      expect(reloaded, 1);
    });

    testWidgets('tanpa delegate tombol tetap tidak melempar error', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(const BerandaScreen(hasError: true)),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Coba lagi'));
      await tester.tap(find.text('Muat ulang'));
      await tester.pumpAndSettle();
      expect(find.text('Gagal memuat beranda'), findsOneWidget);
    });
  });

  group('State Gagal Memuat Katalog', () {
    testWidgets('app bar dan kolom cari tetap tampil', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(const ExploreScreen(hasError: true)),
      );
      await tester.pumpAndSettle();

      expect(find.text('Jelajahi'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('Gagal memuat katalog'), findsOneWidget);
      expect(
        find.textContaining('Daftar destinasi tidak terbaca'),
        findsOneWidget,
      );
      expect(find.text('Coba lagi'), findsOneWidget);
      expect(find.text('Reset filter'), findsOneWidget);
    });

    testWidgets('riwayat dan pencarian populer disembunyikan', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(const ExploreScreen(hasError: true)),
      );
      await tester.pumpAndSettle();

      expect(find.text('RIWAYAT PENCARIAN'), findsNothing);
      expect(find.text('PENCARIAN POPULER'), findsNothing);
      expect(find.text('DESTINASI DISARANKAN'), findsNothing);
    });

    testWidgets('ghost reset filter membersihkan filter di store', (
      tester,
    ) async {
      await usePhone(tester);
      final store = newStore();
      store.setDifficultyFilter(DifficultyFilter.sulit);
      expect(store.searchFilter.isFiltered, isTrue);

      await tester.pumpWidget(
        wrapScreen(ExploreScreen(hasError: true), store: store),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Reset filter'));
      await tester.pumpAndSettle();

      expect(store.searchFilter.isFiltered, isFalse);
    });

    testWidgets('CTA coba lagi memakai delegate bila diberikan', (
      tester,
    ) async {
      await usePhone(tester);
      var retried = 0;
      await tester.pumpWidget(
        wrapScreen(
          ExploreScreen(hasError: true, onRetry: () => retried++),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Coba lagi'));
      await tester.pump();
      expect(retried, 1);
    });
  });

  group('State Gagal Memuat AI', () {
    testWidgets('judul dan microcopy sesuai frame', (tester) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(const AiResultsScreen(hasError: true)),
      );
      await tester.pumpAndSettle();

      expect(find.text('Rekomendasi'), findsOneWidget);
      expect(find.text('Rekomendasi AI gagal diproses'), findsOneWidget);
      expect(
        find.text('Coba lagi sebentar lagi atau ubah preferensi.'),
        findsOneWidget,
      );
      expect(find.text('Coba lagi'), findsOneWidget);
      expect(find.text('Ubah preferensi'), findsOneWidget);
    });

    testWidgets('state gagal mengalahkan hasil yang sudah ada', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(
          AiResultsScreen(
            hasError: true,
            result: SeedData.demoAiResult,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Rekomendasi AI gagal diproses'), findsOneWidget);
      expect(find.text('PROMPTMU'), findsNothing);
    });

    testWidgets('CTA dan ghost memakai delegate', (tester) async {
      await usePhone(tester);
      var retried = 0;
      var changed = 0;
      await tester.pumpWidget(
        wrapScreen(
          AiResultsScreen(
            hasError: true,
            onRetry: () => retried++,
            onChangePreference: () => changed++,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Coba lagi'));
      await tester.pump();
      await tester.tap(find.text('Ubah preferensi'));
      await tester.pump();

      expect(retried, 1);
      expect(changed, 1);
    });
  });
}
