import 'package:dolenae_mobile/src/app/router/routes/main_tab_routes.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_theme.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/categories/domain/entities/category.dart'
    as domain;
import 'package:dolenae_mobile/src/features/categories/domain/repositories/category_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/search_filter.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/usecases/destination_usecases.dart';
import 'package:dolenae_mobile/src/features/explore/data/repositories/explore_repository_impl.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/controllers/explore_controller.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/screens/explore_screen.dart';
import 'package:dolenae_mobile/src/features/home/presentation/screens/beranda_screen.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_activity_tile.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_chip.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_destination_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../helpers/test_harness.dart';

const _catalog = <Destination>[
  Destination(
    id: 'bromo',
    slug: 'gunung-bromo',
    name: 'Gunung Bromo',
    tagline: 'Sunrise Jawa Timur',
    elevationM: 2329,
    regency: 'Probolinggo',
    province: 'Jawa Timur',
    priceFrom: 30000,
    difficulty: DifficultyLevel.pemula,
    categoryIds: ['terrain-gunung', 'terrain-savana'],
    terrain: ['Gunung', 'Savana'],
    activities: ['Camping', 'Camping Ground'],
    tags: ['sunrise'],
    facilities: {'Parkir': 1, 'Warung': 2},
  ),
  Destination(
    id: 'bromo-spaced',
    slug: 'gunung-bromo-spaced',
    name: 'Gunung   Bromo',
    tagline: 'Pemandangan',
    elevationM: 2300,
    regency: 'Probolinggo',
    province: 'Jawa Timur',
    priceFrom: 30000,
    difficulty: DifficultyLevel.pemula,
    terrain: ['Gunung'],
  ),
  Destination(
    id: 'gede',
    slug: 'gunung-gede',
    name: 'Gunung Gede Pangrango',
    tagline: '',
    elevationM: 2958,
    regency: 'Bogor',
    province: 'Jawa Barat',
    priceFrom: 25000,
    difficulty: DifficultyLevel.menengah,
    categoryIds: ['terrain-gunung'],
    terrain: ['Gunung'],
    tags: ['air terjun'],
    accessDescription: 'Sunrise dari jalur masuk',
  ),
  Destination(
    id: 'camp-gunungkidul',
    slug: 'camp-gunungkidul',
    name: 'Camping Gunungkidul',
    tagline: '',
    elevationM: 100,
    regency: 'Gunungkidul',
    province: 'DI Yogyakarta',
    priceFrom: 10000,
    difficulty: DifficultyLevel.pemula,
    terrain: ['Pantai'],
    activities: ['Camping'],
    tags: ['air mineral'],
  ),
  Destination(
    id: 'bukit',
    slug: 'bukit',
    name: 'Bukit Moko',
    tagline: '',
    elevationM: 1500,
    regency: 'Bandung',
    province: 'Jawa Barat',
    priceFrom: 20000,
    difficulty: DifficultyLevel.pemula,
    categoryIds: ['terrain-bukit'],
    terrain: ['Bukit'],
    activities: ['Camping'],
  ),
  Destination(
    id: 'tumpak-sewu',
    slug: 'air-terjun-tumpak-sewu',
    name: 'Air Terjun Tumpak Sewu',
    tagline: 'Tirai air Lumajang',
    elevationM: 600,
    regency: 'Lumajang',
    province: 'Jawa Timur',
    priceFrom: 20000,
    difficulty: DifficultyLevel.menengah,
    categoryIds: ['terrain-air-terjun'],
    terrain: ['Air Terjun'],
    activities: ['Trekking'],
  ),
  Destination(
    id: 'rancabali-camp',
    slug: 'bumi-perkemahan-rancabali',
    name: 'Bumi Perkemahan Rancabali',
    tagline: 'Camp sejuk Bandung',
    elevationM: 1650,
    regency: 'Bandung',
    province: 'Jawa Barat',
    priceFrom: 35000,
    difficulty: DifficultyLevel.pemula,
    categoryIds: ['activity-camping-ground'],
    terrain: ['Hutan'],
    activities: ['Camping Ground'],
  ),
];

class _OnlineCategories implements CategoryRepository {
  const _OnlineCategories();

  @override
  final List<domain.Category> cachedItems = const [
    domain.Category(
      id: 'terrain-gunung',
      name: 'Gunung',
      slug: 'gunung',
      type: 'terrain',
    ),
    domain.Category(
      id: 'terrain-bukit',
      name: 'Bukit',
      slug: 'bukit',
      type: 'terrain',
    ),
    domain.Category(
      id: 'terrain-air-terjun',
      name: 'Air Terjun',
      slug: 'air-terjun',
      type: 'terrain',
    ),
    domain.Category(
      id: 'terrain-savana',
      name: 'Savana',
      slug: 'savana',
      type: 'terrain',
    ),
    domain.Category(
      id: 'activity-camping-ground',
      name: 'Camping Ground',
      slug: 'camping-ground',
      type: 'activity',
    ),
  ];

  @override
  bool get hasCache => true;

  @override
  Future<Result<List<domain.Category>>> load({bool refresh = false}) async =>
      Success(cachedItems);
}

class _EmptyCategories implements CategoryRepository {
  const _EmptyCategories();

  @override
  List<domain.Category> get cachedItems => const [];

  @override
  bool get hasCache => false;

  @override
  Future<Result<List<domain.Category>>> load({bool refresh = false}) async =>
      const Success([]);
}

Widget _wrapRouter(TestStores stores, {String initialLocation = '/home'}) {
  final router = GoRouter(
    initialLocation: initialLocation,
    routes: mainTabRoutes,
  );
  return MultiProvider(
    providers: [
      ChangeNotifierProvider.value(value: stores.auth),
      ChangeNotifierProvider.value(value: stores.categoriesController),
      ChangeNotifierProvider.value(value: stores.notifications),
      ChangeNotifierProvider.value(value: stores.saved),
      ChangeNotifierProvider.value(value: stores.ai),
      ChangeNotifierProvider.value(value: stores.settings),
      ChangeNotifierProvider.value(value: stores.search),
      ChangeNotifierProvider.value(value: stores.destinations),
      ChangeNotifierProvider.value(value: stores.facilities),
      ChangeNotifierProvider.value(value: stores.routes),
      ChangeNotifierProvider.value(value: stores.plan),
      ChangeNotifierProvider.value(value: stores.checklist),
    ],
    child: MaterialApp.router(theme: AppTheme.light(), routerConfig: router),
  );
}

String _exploreSearchText(WidgetTester tester) {
  final field = tester.widget<TextField>(find.byType(TextField).first);
  return field.controller?.text ?? '';
}

void main() {
  setUpAll(useTestFonts);

  const search = SearchDestinationsUseCase();

  test('strict online and offline filters use structured fields', () {
    expect(
      search(_catalog, const SearchFilter(terrain: 'Gunung')).map((d) => d.id),
      ['bromo', 'bromo-spaced', 'gede'],
    );
    expect(
      search(
        _catalog,
        const SearchFilter(categoryId: 'air', categoryLabel: 'Air Terjun'),
      ),
      isEmpty,
    );
    expect(
      search(
        _catalog,
        const SearchFilter(categoryLabel: 'Camping Ground'),
      ).map((d) => d.id),
      ['bromo', 'camp-gunungkidul', 'rancabali-camp'],
    );
    expect(
      search(
        _catalog,
        const SearchFilter(activityTag: 'Sunrise'),
      ).map((d) => d.id),
      ['bromo'],
    );
    expect(
      search(
        _catalog,
        const SearchFilter(activityTag: 'Camping Ground'),
      ).map((d) => d.id),
      ['bromo', 'camp-gunungkidul', 'bukit', 'rancabali-camp'],
    );
    expect(
      search(
        _catalog,
        const SearchFilter(supports: ['Parkir', 'Warung']),
      ).map((d) => d.id),
      ['bromo'],
    );
    expect(
      search(_catalog, const SearchFilter(terrain: 'Gunung')).map((d) => d.id),
      isNot(contains('camp-gunungkidul')),
    );
  });

  test(
    'structured filter and query combine, clear independently, and rank normalized exact name',
    () {
      final controller = ExploreController(ExploreRepositoryImpl());
      controller.setTerrain('Gunung');
      controller.setSearchQuery('jawa timur');
      expect(controller.resultsFor(_catalog).map((d) => d.id), [
        'bromo',
        'bromo-spaced',
      ]);
      controller.clearSearchQuery();
      expect(controller.searchFilter.terrain, 'Gunung');
      controller.clearSearchFilters();
      expect(controller.searchFilter.query, '');
      controller.setSearchQuery('gunung   bromo');
      expect(controller.resultsFor(_catalog).first.id, 'bromo');
      expect(controller.searchFilter.query, 'gunung   bromo');
      controller.dispose();
    },
  );

  test(
    'category label survives empty id and clears duplicate activity tag',
    () {
      final controller = ExploreController(ExploreRepositoryImpl());
      controller.setActivityTag('Camping Ground');
      controller.setCategoryId('', label: ' Camping Ground ');
      expect(controller.searchFilter.categoryLabel, 'Camping Ground');
      expect(controller.searchFilter.activityTag, '');
      controller.dispose();
    },
  );

  group('End-to-end GoRouter Beranda -> Explore', () {
    for (final chipName in ['Gunung', 'Bukit', 'Air Terjun']) {
      testWidgets('chip kategori $chipName membuka Jelajah tanpa teks cari', (
        tester,
      ) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _OnlineCategories(),
          destinations: _catalog,
        );
        final initialHistory = [...stores.search.searchHistory];

        await tester.pumpWidget(_wrapRouter(stores));
        await tester.pumpAndSettle();

        final chipFinder = find.widgetWithText(DnChip, chipName).first;
        await tester.ensureVisible(chipFinder);
        await tester.tap(chipFinder);
        await tester.pumpAndSettle();

        expect(find.text('Jelajahi'), findsOneWidget);
        expect(_exploreSearchText(tester), '');
        expect(stores.search.searchFilter.query, '');
        expect(stores.search.searchHistory, initialHistory);
        expect(stores.search.searchFilter.terrain, chipName);
        expect(find.text('1'), findsOneWidget);
        expect(find.text('Medan: $chipName'), findsOneWidget);

        if (chipName == 'Air Terjun') {
          expect(find.text('Air Terjun Tumpak Sewu'), findsOneWidget);
          expect(find.text('Gunung Gede Pangrango'), findsNothing);
        }
      });
    }

    testWidgets(
      'chip fallback offline Camping membuka Jelajah dengan activityTag Camping',
      (tester) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _EmptyCategories(),
          destinations: _catalog,
        );
        final initialHistory = [...stores.search.searchHistory];

        await tester.pumpWidget(_wrapRouter(stores));
        await tester.pumpAndSettle();

        final campingChip = find.widgetWithText(DnChip, 'Camping').first;
        await tester.ensureVisible(campingChip);
        await tester.tap(campingChip);
        await tester.pumpAndSettle();

        expect(find.text('Jelajahi'), findsOneWidget);
        expect(_exploreSearchText(tester), '');
        expect(stores.search.searchFilter.query, '');
        expect(stores.search.searchHistory, initialHistory);
        expect(stores.search.searchFilter.activityTag, 'Camping');
        expect(find.text('Aktivitas: Camping'), findsOneWidget);
        expect(find.text('Camping Gunungkidul'), findsOneWidget);
      },
    );

    testWidgets(
      'keempat kartu aktivitas Beranda membuka filter terstruktur tanpa kueri',
      (tester) async {
        final expectedCases = <({String tile, List<String> present, List<String> absent})>[
          (
            tile: 'Gunung',
            present: ['Gunung Bromo', 'Gunung Gede Pangrango'],
            absent: ['Camping Gunungkidul', 'Air Terjun Tumpak Sewu'],
          ),
          (
            tile: 'Camping Ground',
            present: ['Bumi Perkemahan Rancabali'],
            absent: ['Gunung Gede Pangrango'],
          ),
          (
            tile: 'Sunrise',
            present: ['Gunung Bromo'],
            absent: ['Gunung Gede Pangrango'],
          ),
          (
            tile: 'Savana',
            present: ['Gunung Bromo'],
            absent: ['Bukit Moko'],
          ),
        ];

        for (final testCase in expectedCases) {
          await usePhone(tester);
          final stores = TestStores(
            categoryRepository: const _OnlineCategories(),
            destinations: _catalog,
          );
          final initialHistory = [...stores.search.searchHistory];

          await tester.pumpWidget(_wrapRouter(stores));
          await tester.pumpAndSettle();

          final tileFinder = find.widgetWithText(DnActivityTile, testCase.tile);
          await scrollTo(tester, tileFinder);
          await tester.tap(tileFinder);
          await tester.pumpAndSettle();

          expect(find.text('Jelajahi'), findsOneWidget);
          expect(_exploreSearchText(tester), '');
          expect(stores.search.searchFilter.query, '');
          expect(stores.search.searchHistory, initialHistory);
          expect(stores.search.searchFilter.isFiltered, isTrue);

          for (final name in testCase.present) {
            expect(find.text(name), findsWidgets);
          }
          for (final name in testCase.absent) {
            expect(find.text(name), findsNothing);
          }
        }
      },
    );
  });

  group('ExploreScreen widget interactions', () {
    testWidgets(
      'berpindah chip fast filter tidak pernah mengisi teks cari',
      (tester) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _OnlineCategories(),
          destinations: _catalog,
        );
        await tester.pumpWidget(
          wrapScreen(const ExploreScreen(), store: stores),
        );
        await tester.pumpAndSettle();

        await tester.tap(find.widgetWithText(DnChip, 'Gunung'));
        await tester.pumpAndSettle();
        expect(stores.search.searchFilter.terrain, 'Gunung');
        expect(_exploreSearchText(tester), '');

        await tester.tap(find.widgetWithText(DnChip, 'Bukit'));
        await tester.pumpAndSettle();
        expect(stores.search.searchFilter.terrain, 'Bukit');
        expect(find.text('Bukit Moko'), findsOneWidget);
        expect(_exploreSearchText(tester), '');

        await tester.tap(find.widgetWithText(DnChip, 'Semuanya'));
        await tester.pumpAndSettle();
        expect(stores.search.searchFilter.isFiltered, isFalse);
        expect(_exploreSearchText(tester), '');
      },
    );

    testWidgets(
      'kombinasi Fast Filter dan Search Engine independen saat dihapus',
      (tester) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _OnlineCategories(),
          destinations: _catalog,
        );
        await tester.pumpWidget(
          wrapScreen(const ExploreScreen(), store: stores),
        );
        await tester.pumpAndSettle();

        await tester.tap(find.widgetWithText(DnChip, 'Gunung'));
        await tester.pumpAndSettle();
        await tester.enterText(find.byType(TextField).first, 'jawa timur');
        await tester.pumpAndSettle();

        expect(find.text('2 hasil · 1 filter'), findsOneWidget);
        expect(find.text('Medan: Gunung'), findsOneWidget);

        await tester.tap(find.byTooltip('Hapus kata kunci pencarian'));
        await tester.pumpAndSettle();
        expect(stores.search.searchFilter.query, '');
        expect(stores.search.searchFilter.terrain, 'Gunung');
        expect(find.text('Medan: Gunung'), findsOneWidget);

        await tester.enterText(find.byType(TextField).first, 'jawa timur');
        await tester.pumpAndSettle();
        await tester.tap(find.text('Reset filter'));
        await tester.pumpAndSettle();

        expect(stores.search.searchFilter.isFiltered, isFalse);
        expect(stores.search.searchFilter.query, 'jawa timur');
        expect(find.textContaining('hasil untuk "jawa timur"'), findsOneWidget);
      },
    );

    testWidgets(
      'chip Ramah Pemula sinkron dua arah dengan bottom sheet filter',
      (tester) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _OnlineCategories(),
          destinations: _catalog,
        );
        await tester.pumpWidget(
          wrapScreen(const ExploreScreen(), store: stores),
        );
        await tester.pumpAndSettle();

        await tester.tap(find.widgetWithText(DnChip, 'Ramah Pemula'));
        await tester.pumpAndSettle();
        expect(
          stores.search.searchFilter.difficulty,
          DifficultyFilter.ramahPemula,
        );

        await tester.tap(find.byIcon(AppIcons.slidersHorizontal));
        await tester.pumpAndSettle();
        await tester.tap(find.widgetWithText(DnChip, 'Sulit'));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Terapkan filter'));
        await tester.pumpAndSettle();

        expect(stores.search.searchFilter.difficulty, DifficultyFilter.sulit);
        expect(find.text('Kesulitan: Sulit'), findsOneWidget);

        await tester.tap(find.widgetWithText(DnChip, 'Ramah Pemula'));
        await tester.pumpAndSettle();
        expect(
          stores.search.searchFilter.difficulty,
          DifficultyFilter.ramahPemula,
        );

        await tester.tap(find.widgetWithText(DnChip, 'Ramah Pemula'));
        await tester.pumpAndSettle();
        expect(stores.search.searchFilter.difficulty, DifficultyFilter.semua);
      },
    );

    testWidgets('chip provinsi Jawa Timur dapat toggle ON dan OFF', (
      tester,
    ) async {
      await usePhone(tester);
      final stores = TestStores(
        categoryRepository: const _OnlineCategories(),
        destinations: _catalog,
      );
      await tester.pumpWidget(
        wrapScreen(const ExploreScreen(), store: stores),
      );
      await tester.pumpAndSettle();

      final listFinder = find.byType(ListView).first;
      final jatimChip = find.widgetWithText(DnChip, 'Jawa Timur');
      await tester.scrollUntilVisible(
        jatimChip,
        150,
        scrollable: find
            .descendant(of: listFinder, matching: find.byType(Scrollable))
            .first,
      );
      await tester.ensureVisible(jatimChip);
      await tester.pumpAndSettle();
      await tester.tap(jatimChip);
      await tester.pumpAndSettle();

      expect(stores.search.searchFilter.province, 'Jawa Timur');
      expect(find.text('Provinsi: Jawa Timur'), findsOneWidget);

      await tester.tap(jatimChip);
      await tester.pumpAndSettle();
      expect(stores.search.searchFilter.province, '');
      expect(find.text('Provinsi: Jawa Timur'), findsNothing);
    });

    testWidgets(
      'Camping Ground tidak menduplikasi pill saat toggle setelah initialActivity',
      (tester) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _OnlineCategories(),
          destinations: _catalog,
        );
        await tester.pumpWidget(
          wrapScreen(
            const ExploreScreen(initialActivity: 'Camping Ground'),
            store: stores,
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('Kategori: Camping Ground'), findsOneWidget);
        expect(find.text('Aktivitas: Camping Ground'), findsNothing);

        final chipList = find.byType(ListView).first;
        final campChip = find.widgetWithText(DnChip, 'Camping Ground');
        await tester.scrollUntilVisible(
          campChip,
          150,
          scrollable: find
              .descendant(of: chipList, matching: find.byType(Scrollable))
              .first,
        );
        await tester.tap(campChip);
        await tester.pumpAndSettle();

        expect(stores.search.searchFilter.categoryId, '');
        expect(stores.search.searchFilter.activityTag, '');
        expect(find.text('Kategori: Camping Ground'), findsNothing);
        expect(find.text('Aktivitas: Camping Ground'), findsNothing);
      },
    );

    testWidgets('keempat kondisi _EmptyResults tampil sesuai spesifikasi', (
      tester,
    ) async {
      await usePhone(tester);
      final stores = TestStores(
        categoryRepository: const _OnlineCategories(),
        destinations: _catalog,
      );

      // 1. Search-only
      await tester.pumpWidget(wrapScreen(const ExploreScreen(), store: stores));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField).first, 'tidak ada xyz');
      await tester.pumpAndSettle();
      expect(find.text('Tidak ada hasil'), findsOneWidget);
      expect(find.text('PENCARIAN POPULER'), findsNothing);
      expect(find.text('Hapus pencarian'), findsOneWidget);
      expect(find.text('Reset filter'), findsNothing);

      // 2. Combined
      await tester.tap(find.widgetWithText(DnChip, 'Gunung'));
      await tester.pumpAndSettle();
      expect(find.text('Reset filter'), findsWidgets);
      expect(find.text('Hapus pencarian'), findsOneWidget);

      // 3. Fast-Filter-only
      await tester.tap(find.byTooltip('Hapus kata kunci pencarian'));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField).first, '');
      await tester.pumpAndSettle();
      stores.search.setActivityTag('menyelam');
      await tester.pumpAndSettle();
      expect(
        find.text('Tidak ada destinasi yang cocok dengan filter aktif.'),
        findsOneWidget,
      );
      expect(find.text('Ubah filter'), findsOneWidget);
      expect(find.text('Hapus pencarian'), findsNothing);

      // 4. Empty catalog (no query, no filter)
      final emptyStores = TestStores(
        categoryRepository: const _OnlineCategories(),
        destinations: const [],
      );
      await tester.pumpWidget(
        wrapScreen(const ExploreScreen(), store: emptyStores),
      );
      await tester.pumpAndSettle();
      expect(
        find.text('Belum ada destinasi tersedia di katalog.'),
        findsOneWidget,
      );
      expect(find.text('Reset filter'), findsNothing);
      expect(find.text('Hapus pencarian'), findsNothing);
      expect(find.byType(DnDestinationListTile), findsNothing);
    });

    testWidgets('didUpdateWidget mengganti filter rute dengan bersih', (
      tester,
    ) async {
      await usePhone(tester);
      final stores = TestStores(
        categoryRepository: const _OnlineCategories(),
        destinations: _catalog,
      );

      await tester.pumpWidget(
        wrapScreen(
          const ExploreScreen(initialTerrain: 'Gunung'),
          store: stores,
        ),
      );
      await tester.pumpAndSettle();
      expect(stores.search.searchFilter.terrain, 'Gunung');
      expect(stores.search.searchFilter.query, '');

      await tester.pumpWidget(
        wrapScreen(
          const ExploreScreen(initialTag: 'sunrise'),
          store: stores,
        ),
      );
      await tester.pumpAndSettle();
      expect(stores.search.searchFilter.terrain, '');
      expect(stores.search.searchFilter.activityTag, 'Sunrise');
      expect(stores.search.searchFilter.query, '');
      expect(find.text('Aktivitas: Sunrise'), findsOneWidget);
    });

    test(
      'filter fasilitas ketat menolak teks bebas dan hitungan nol',
      () {
        const facilityCatalog = <Destination>[
          Destination(
            id: 'real',
            slug: 'real',
            name: 'Puncak Sejati',
            tagline: 'Pemandangan kabut',
            elevationM: 2000,
            regency: 'Malang',
            province: 'Jawa Timur',
            priceFrom: 25000,
            difficulty: DifficultyLevel.pemula,
            facilities: {'Warung': 2, 'Parkir': 1},
          ),
          Destination(
            id: 'fake-text',
            slug: 'fake-text',
            name: 'Bukit Palsu',
            tagline: 'Dekat Warung dan Dekat Area Camping',
            elevationM: 900,
            regency: 'Malang',
            province: 'Jawa Timur',
            priceFrom: 15000,
            difficulty: DifficultyLevel.pemula,
            accessDescription: 'Lewati Parkiran warga',
            facilities: {'Warung': 0},
          ),
        ];

        expect(
          search(
            facilityCatalog,
            const SearchFilter(supports: ['Warung', 'Parkir']),
          ).map((d) => d.id),
          ['real'],
        );
        expect(
          search(
            facilityCatalog,
            const SearchFilter(supports: ['Area camping']),
          ),
          isEmpty,
        );
      },
    );

    testWidgets(
      'navigasi Jelajah Gunung -> Beranda -> /explore polos mereset filter & kueri tanpa menghapus riwayat',
      (tester) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _OnlineCategories(),
          destinations: _catalog,
        );
        final initialHistory = [...stores.search.searchHistory];

        final router = GoRouter(
          initialLocation: '/home',
          routes: mainTabRoutes,
        );
        await tester.pumpWidget(
          MultiProvider(
            providers: [
              ChangeNotifierProvider.value(value: stores.auth),
              ChangeNotifierProvider.value(value: stores.categoriesController),
              ChangeNotifierProvider.value(value: stores.notifications),
              ChangeNotifierProvider.value(value: stores.saved),
              ChangeNotifierProvider.value(value: stores.ai),
              ChangeNotifierProvider.value(value: stores.settings),
              ChangeNotifierProvider.value(value: stores.search),
              ChangeNotifierProvider.value(value: stores.destinations),
              ChangeNotifierProvider.value(value: stores.facilities),
              ChangeNotifierProvider.value(value: stores.routes),
              ChangeNotifierProvider.value(value: stores.plan),
              ChangeNotifierProvider.value(value: stores.checklist),
            ],
            child: MaterialApp.router(
              theme: AppTheme.light(),
              routerConfig: router,
            ),
          ),
        );
        await tester.pumpAndSettle();

        final gunungChip = find.widgetWithText(DnChip, 'Gunung').first;
        await tester.ensureVisible(gunungChip);
        await tester.tap(gunungChip);
        await tester.pumpAndSettle();
        await tester.enterText(find.byType(TextField).first, 'jawa timur');
        await tester.pumpAndSettle();

        expect(stores.search.searchFilter.terrain, 'Gunung');
        expect(stores.search.searchFilter.query, 'jawa timur');

        router.go('/home');
        await tester.pumpAndSettle();
        router.go('/explore');
        await tester.pumpAndSettle();

        expect(stores.search.searchFilter.isFiltered, isFalse);
        expect(stores.search.searchFilter.query, '');
        expect(_exploreSearchText(tester), '');
        expect(stores.search.searchHistory, initialHistory);
      },
    );

    testWidgets(
      'rute bertentangan terrain=Gunung dengan categoryId Camping Ground tidak meluaskan hasil ke non-Gunung',
      (tester) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _OnlineCategories(),
          destinations: _catalog,
        );
        await tester.pumpWidget(
          _wrapRouter(
            stores,
            initialLocation:
                '/explore?terrain=Gunung&categoryId=activity-camping-ground',
          ),
        );
        await tester.pumpAndSettle();

        expect(stores.search.searchFilter.terrain, 'Gunung');
        expect(stores.search.searchFilter.categoryId, '');
        expect(find.text('Gunung Bromo'), findsWidgets);
        expect(find.text('Bumi Perkemahan Rancabali'), findsNothing);
      },
    );

    testWidgets(
      'aksesibilitas: target sentuh >= 44dp dan warna Reset filter pakai AppColors.primary',
      (tester) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _OnlineCategories(),
          destinations: _catalog,
        );
        await tester.pumpWidget(
          wrapScreen(const ExploreScreen(), store: stores),
        );
        await tester.pumpAndSettle();

        await tester.tap(find.widgetWithText(DnChip, 'Gunung'));
        await tester.pumpAndSettle();
        await tester.enterText(find.byType(TextField).first, 'bromo');
        await tester.pumpAndSettle();

        final clearButtonBox = tester.getSize(
          find.byTooltip('Hapus kata kunci pencarian'),
        );
        expect(clearButtonBox.height, greaterThanOrEqualTo(44));

        final chipTapBox = tester.getSize(
          find.ancestor(
            of: find.widgetWithText(DnChip, 'Gunung'),
            matching: find.byType(InkWell),
          ).first,
        );
        expect(chipTapBox.height, greaterThanOrEqualTo(44));

        final pillTapBox = tester.getSize(
          find.ancestor(
            of: find.text('Medan: Gunung'),
            matching: find.byType(InkWell),
          ).first,
        );
        expect(pillTapBox.height, greaterThanOrEqualTo(44));

        final resetTextFinder = find.text('Reset filter');
        final resetTapBox = tester.getSize(
          find.ancestor(
            of: resetTextFinder,
            matching: find.byType(InkWell),
          ).first,
        );
        expect(resetTapBox.height, greaterThanOrEqualTo(44));
        expect(
          tester.widget<Text>(resetTextFinder).style?.color,
          AppColors.primary,
        );

        final urutkanTapBox = tester.getSize(
          find.ancestor(
            of: find.textContaining('Urutkan:'),
            matching: find.byType(InkWell),
          ).first,
        );
        expect(urutkanTapBox.height, greaterThanOrEqualTo(44));
      },
    );

    testWidgets(
      'chip cepat Beranda memiliki tinggi area sentuh >= 44dp tanpa overflow',
      (tester) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _OnlineCategories(),
          destinations: _catalog,
        );
        await tester.pumpWidget(
          wrapScreen(const BerandaScreen(), store: stores),
        );
        await tester.pumpAndSettle();

        final berandaChipBox = tester.getSize(
          find.ancestor(
            of: find.widgetWithText(DnChip, 'Gunung').first,
            matching: find.byType(InkWell),
          ).first,
        );
        expect(berandaChipBox.height, greaterThanOrEqualTo(44));
      },
    );

    test(
      'SearchFilter menolak nilai pemisah saja dan memotong UTF-16 tanpa membelah surrogate pair',
      () {
        const separatorOnly = SearchFilter(terrain: '---', activityTag: '___');
        expect(separatorOnly.isFiltered, isFalse);
        expect(separatorOnly.activeFilterCount, 0);

        final straddling = '${'a' * 119}🏔';
        final sanitized = SearchFilter.sanitizeRouteText(straddling);
        expect(sanitized.length, 119);
        expect(
          sanitized.codeUnits.any((u) => u >= 0xD800 && u <= 0xDFFF),
          isFalse,
        );
      },
    );

    testWidgets(
      'parameter rute berisi pemisah saja atau karakter kontrol disanitasi cleanly',
      (tester) async {
        await usePhone(tester);
        final stores = TestStores(
          categoryRepository: const _OnlineCategories(),
          destinations: _catalog,
        );
        stores.search
          ..setTerrain('Gunung')
          ..setSearchQuery('bromo');

        await tester.pumpWidget(
          _wrapRouter(
            stores,
            initialLocation: '/explore?terrain=---&tag=___',
          ),
        );
        await tester.pumpAndSettle();

        expect(stores.search.searchFilter.isFiltered, isFalse);
        expect(stores.search.searchFilter.activeFilterCount, 0);
        expect(stores.search.searchFilter.query, '');
        expect(find.text('Reset filter'), findsNothing);

        await tester.pumpWidget(
          _wrapRouter(
            stores,
            initialLocation: '/explore?terrain=Gunung%00%0A',
          ),
        );
        await tester.pumpAndSettle();

        expect(stores.search.searchFilter.terrain, 'Gunung');
        expect(find.text('Medan: Gunung'), findsOneWidget);
      },
    );

    test(
      'pemanggilan domain langsung menyaring berdasarkan nilai filter terstruktur yang sudah disanitasi',
      () {
        const terrainSeparatorWithCategory = SearchFilter(
          terrain: '---',
          categoryLabel: 'Camping Ground',
        );
        expect(terrainSeparatorWithCategory.isFiltered, isTrue);
        expect(terrainSeparatorWithCategory.activeFilterCount, 1);
        expect(
          search(_catalog, terrainSeparatorWithCategory).map((d) => d.id),
          ['bromo', 'camp-gunungkidul', 'rancabali-camp'],
        );

        const idSeparatorWithLabel = SearchFilter(
          categoryId: '---',
          categoryLabel: 'Camping Ground',
        );
        expect(idSeparatorWithLabel.isFiltered, isTrue);
        expect(idSeparatorWithLabel.activeFilterCount, 1);
        expect(
          search(_catalog, idSeparatorWithLabel).map((d) => d.id),
          ['bromo', 'camp-gunungkidul', 'rancabali-camp'],
        );

        const terrainWithSeparatorId = SearchFilter(
          terrain: 'Gunung',
          categoryId: '---',
        );
        expect(
          search(_catalog, terrainWithSeparatorId).map((d) => d.id),
          ['bromo', 'bromo-spaced', 'gede'],
        );
      },
    );
  });
}
