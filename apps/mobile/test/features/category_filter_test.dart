import 'package:flutter_test/flutter_test.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/search_filter.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/usecases/destination_usecases.dart';
import 'package:dolenae_mobile/src/features/explore/data/repositories/explore_repository_impl.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/controllers/explore_controller.dart';

Destination item(
  String id,
  String name,
  List<String> categories, {
  List<String> terrain = const [],
  List<String> tags = const [],
  List<String> transport = const [],
}) => Destination(
  id: id,
  slug: id,
  name: name,
  tagline: '',
  elevationM: 0,
  regency: '',
  province: '',
  priceFrom: 0,
  difficulty: DifficultyLevel.pemula,
  categoryIds: categories,
  terrain: terrain,
  tags: tags,
  accessTransportModes: transport,
);
void main() {
  final catalog = [
    item('1', 'Pantai gunung', ['beach']),
    item('2', 'Nama berbeda', ['mountain']),
    item('3', 'Gunung lain', ['mountain']),
  ];
  test('category ID filters independently from names and combines query', () {
    const search = SearchDestinationsUseCase();
    expect(
      search(
        catalog,
        const SearchFilter(categoryId: 'mountain'),
      ).map((e) => e.id),
      ['2', '3'],
    );
    expect(
      search(
        catalog,
        const SearchFilter(categoryId: 'mountain', query: 'gunung'),
      ).map((e) => e.id),
      ['3'],
    );
    expect(search(catalog, const SearchFilter(categoryId: 'missing')), isEmpty);
    expect(
      search(catalog, const SearchFilter(query: 'gunung')).map((e) => e.id),
      ['1', '3'],
    );
  });
  test('kata kunci cocok dengan akses dan tag yang sudah ada', () {
    const search = SearchDestinationsUseCase();
    final local = [
      item('bromo', 'Gunung Bromo', const [], transport: const ['Jeep']),
      item('gede', 'Gunung Gede', const [], tags: const ['air terjun']),
      item('prau', 'Gunung Prau', const [], tags: const ['lautan awan']),
    ];
    expect(search(local, const SearchFilter(query: 'jeep')).map((e) => e.id), [
      'bromo',
    ]);
    expect(
      search(local, const SearchFilter(query: 'air terjun')).map((e) => e.id),
      ['gede'],
    );
    expect(search(local, const SearchFilter(query: 'awan')).map((e) => e.id), [
      'prau',
    ]);
    expect(
      search(local, const SearchFilter(query: 'bromo gunung')).map((e) => e.id),
      ['bromo'],
    );
  });

  test('kategori fallback ke medan dan tag saat categoryIds belum ada', () {
    const search = SearchDestinationsUseCase();
    final local = [
      item(
        'bromo',
        'Gunung Bromo',
        const [],
        terrain: const ['Gunung', 'Savana'],
      ),
      item(
        'gede',
        'Gunung Gede',
        const [],
        terrain: const ['Gunung', 'Hutan'],
        tags: const ['air terjun'],
      ),
      item('moko', 'Bukit Moko', const [], terrain: const ['Bukit']),
    ];
    expect(
      search(
        local,
        const SearchFilter(categoryId: 'gunung-id', categoryLabel: 'Gunung'),
      ).map((e) => e.id),
      ['bromo', 'gede'],
    );
    expect(
      search(
        local,
        const SearchFilter(categoryId: 'air-id', categoryLabel: 'Air Terjun'),
      ).map((e) => e.id),
      ['gede'],
    );
    expect(
      search(
        local,
        const SearchFilter(
          categoryId: 'gunung-id',
          categoryLabel: 'Gunung',
          query: 'savana',
        ),
      ).map((e) => e.id),
      ['bromo'],
    );
    expect(search(local, const SearchFilter(categoryId: 'missing')), isEmpty);
  });

  test('recommendations keep ID filter for empty or nonempty query', () {
    const search = SearchRecommendationsUseCase();
    expect(
      search(catalog, '', categoryId: 'mountain').map((e) => e.destination.id),
      ['2', '3'],
    );
    expect(
      search(catalog, 'gunung', categoryId: 'mountain').single.destination.id,
      '3',
    );
  });
  test('explore category selection preserves query and resets', () {
    final controller = ExploreController(ExploreRepositoryImpl());
    controller.setSearchQuery('gunung');
    controller.setCategoryId('mountain');
    expect(controller.resultsFor(catalog).single.id, '3');
    expect(controller.searchFilter.isFiltered, isTrue);
    controller.setCategoryId('');
    expect(controller.resultsFor(catalog), hasLength(2));
    controller.setCategoryId('mountain');
    controller.clearSearchFilters();
    expect(controller.searchFilter.categoryId, '');
    expect(controller.searchFilter.query, 'gunung');
    controller.dispose();
  });

  test('controller menyimpan label kategori dan reset menghapusnya', () {
    final controller = ExploreController(ExploreRepositoryImpl());
    controller.setCategoryId('air-id', label: 'Air Terjun');
    expect(controller.searchFilter.categoryLabel, 'Air Terjun');
    controller.clearSearchFilters();
    expect(controller.searchFilter.categoryId, '');
    expect(controller.searchFilter.categoryLabel, '');
    controller.dispose();
  });
}
