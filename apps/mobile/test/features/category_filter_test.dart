import 'package:flutter_test/flutter_test.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/search_filter.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/usecases/destination_usecases.dart';
import 'package:dolenae_mobile/src/features/explore/data/repositories/explore_repository_impl.dart';
import 'package:dolenae_mobile/src/features/explore/presentation/controllers/explore_controller.dart';

Destination item(String id, String name, List<String> categories) =>
    Destination(
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
}
