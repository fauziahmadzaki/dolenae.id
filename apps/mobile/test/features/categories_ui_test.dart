import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/categories/domain/entities/category.dart'
    as domain;
import 'package:dolenae_mobile/src/features/categories/domain/repositories/category_repository.dart';
import 'package:dolenae_mobile/src/features/home/presentation/screens/beranda_screen.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/screens/explore_screen.dart';

import '../helpers/test_harness.dart';

class Categories implements CategoryRepository {
  @override
  final List<domain.Category> cachedItems = const [
    domain.Category(
      id: 'terrain-id',
      name: 'Medan baru',
      slug: 'medan-baru',
      type: 'terrain',
    ),
    domain.Category(
      id: 'activity-id',
      name: 'Aktivitas baru',
      slug: 'aktivitas-baru',
      type: 'activity',
    ),
  ];
  @override
  bool get hasCache => true;
  @override
  Future<Result<List<domain.Category>>> load({bool refresh = false}) async =>
      Success(cachedItems);
}

void main() {
  setUpAll(useTestFonts);
  testWidgets('home API chip filters by ID without changing query', (
    tester,
  ) async {
    await usePhone(tester);
    await tester.pumpWidget(
      wrapScreen(
        const BerandaScreen(),
        store: TestStores(categoryRepository: Categories()),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Medan baru'), findsOneWidget);
    expect(find.text('Aktivitas baru'), findsNothing);
    await tester.tap(find.text('Medan baru'));
    await tester.pumpAndSettle();
    expect(
      tester.widget<TextField>(find.byType(TextField)).controller!.text,
      '',
    );
    expect(find.text('Destinasi tidak ditemukan'), findsOneWidget);
    await tester.tap(find.text('Medan baru'));
    await tester.pumpAndSettle();
    expect(find.text('Destinasi populer'), findsOneWidget);
  });
  testWidgets(
    'explore chip available before search and survives zero results',
    (tester) async {
      await usePhone(tester);
      final stores = TestStores(categoryRepository: Categories());
      await tester.pumpWidget(wrapScreen(const ExploreScreen(), store: stores));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Medan baru'));
      await tester.pumpAndSettle();
      expect(stores.search.searchFilter.categoryId, 'terrain-id');
      expect(find.text('Tidak ada hasil'), findsOneWidget);
      expect(find.text('Medan baru'), findsOneWidget);
      await tester.tap(find.text('Semuanya'));
      await tester.pumpAndSettle();
      expect(stores.search.searchFilter.categoryId, '');
      expect(find.text('DESTINASI DISARANKAN'), findsOneWidget);
    },
  );
}
