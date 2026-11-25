import 'package:flutter_test/flutter_test.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/search_filter.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/usecases/destination_usecases.dart';

Destination _d(String name, List<String> terrain, {String tagline = ''}) {
  return Destination(
    id: name,
    slug: name,
    name: name,
    tagline: tagline,
    elevationM: null,
    regency: '',
    province: '',
    priceFrom: null,
    difficulty: null,
    terrain: terrain,
  );
}

Destination _priced(String name, int? price) => Destination(
  id: name,
  slug: name,
  name: name,
  tagline: '',
  elevationM: null,
  regency: '',
  province: '',
  priceFrom: price,
  difficulty: null,
);

Destination _elevated(String name, int? elevation, {double? rating}) =>
    Destination(
      id: name,
      slug: name,
      name: name,
      tagline: '',
      elevationM: elevation,
      regency: '',
      province: '',
      priceFrom: null,
      difficulty: null,
      rating: rating,
    );

void main() {
  const search = SearchDestinationsUseCase();
  final catalog = [
    _d('Gunung Bromo', ['Gunung']),
    _d('Gunung Prau', ['Gunung']),
    _d('Bukit Moko', ['Bukit']),
    _d('Danau Toba', ['Danau']),
    _d('Air Terjun Sekumpul', ['Air terjun']),
    // Nama mengandung "gunung" tetapi medannya bukan gunung.
    _d('Camping Gunungkidul', ['Camping']),
  ];

  test('filter medan Gunung hanya mengembalikan destinasi bergunung', () {
    final results = search(catalog, const SearchFilter(terrain: 'Gunung'));
    expect(results.map((item) => item.name), ['Gunung Bromo', 'Gunung Prau']);
  });

  test('filter medan kosong mengembalikan seluruh katalog', () {
    expect(search(catalog, const SearchFilter()).length, catalog.length);
  });

  test('medan tidak cocok dengan nama saja bila terrain berbeda', () {
    final results = search(catalog, const SearchFilter(terrain: 'Bukit'));
    expect(results.map((item) => item.name), ['Bukit Moko']);
  });

  test('urutkan harga terendah menaruh yang tanpa harga di akhir', () {
    final priced = [
      _priced('Mahal', 50000),
      _priced('Tanpa harga', null),
      _priced('Murah', 15000),
      _priced('Sedang', 30000),
    ];
    final results = search(
      priced,
      const SearchFilter(sort: SortOption.termurah),
    );
    expect(results.map((item) => item.name), [
      'Murah',
      'Sedang',
      'Mahal',
      'Tanpa harga',
    ]);
  });

  test('rating tertinggi: rating dulu, lalu ketinggian, kosong di akhir', () {
    final rated = [
      _elevated('Rendah', 1500, rating: 4.2),
      _elevated('Tinggi', 2600, rating: 4.8),
      _elevated('Tanpa rating tinggi', 3000, rating: null),
      _elevated('Tanpa rating rendah', 1000, rating: null),
    ];
    final results = search(rated, const SearchFilter(sort: SortOption.rating));
    expect(results.map((item) => item.name), [
      'Tinggi',
      'Rendah',
      'Tanpa rating tinggi',
      'Tanpa rating rendah',
    ]);
  });

  test('ketinggian tertinggi mengurutkan mdpl menurun', () {
    final results = search(
      [
        _elevated('A', 1000),
        _elevated('B', 2600),
        _elevated('C', null),
        _elevated('D', 1800),
      ],
      const SearchFilter(sort: SortOption.ketinggian),
    );
    expect(results.map((item) => item.name), ['B', 'D', 'A', 'C']);
  });

  test('medan dan kata kunci digabung dengan logika DAN', () {
    final results = search(
      catalog,
      const SearchFilter(terrain: 'Gunung', query: 'prau'),
    );
    expect(results.map((item) => item.name), ['Gunung Prau']);
  });
}
