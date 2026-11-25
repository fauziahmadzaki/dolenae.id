/// Opsi urutkan di bottom sheet Filter & urutkan.
///
/// `populer` adalah urutan bawaan katalog. `rating` memakai
/// `Destination.rating` bila ada; tanpa rating semua destinasi berbagi skor
/// dasar yang sama, jadi urutannya menjadi `ketinggian` (nilai tertinggi
/// dulu) agar pilihan ini tetap mengubah hasil, sesuai frame Figma `86:2485`.
enum SortOption { populer, rating, ketinggian, termurah }

/// Label opsi urutkan untuk chip di bottom sheet filter.
extension SortOptionLabel on SortOption {
  String get label => switch (this) {
    SortOption.populer => 'Paling populer',
    SortOption.rating => 'Rating tertinggi',
    SortOption.ketinggian => 'Ketinggian tertinggi',
    SortOption.termurah => 'Harga terendah',
  };
}

/// Tingkat kesulitan sebagai filter; [semua] berarti tanpa pembatasan.
enum DifficultyFilter { semua, ramahPemula, menengah, sulit }

/// Label tingkat kesulitan untuk chip di bottom sheet filter.
extension DifficultyFilterLabel on DifficultyFilter {
  String get label => switch (this) {
    DifficultyFilter.semua => 'Semua tingkat',
    DifficultyFilter.ramahPemula => 'Ramah pemula',
    DifficultyFilter.menengah => 'Menengah',
    DifficultyFilter.sulit => 'Sulit',
  };
}

/// Isi state pencarian + bottom sheet filter (subset `packages/types/src/search.ts`).
class SearchFilter {
  const SearchFilter({
    this.query = '',
    this.categoryId = '',
    this.terrain = '',
    this.sort = SortOption.populer,
    this.difficulty = DifficultyFilter.semua,
    this.supports = const [],
    this.verifiedOnly = false,
  });

  final String query;
  final String categoryId;

  /// Nama medan terpilih (mis. `Gunung`), dicocokkan ke `destination.terrain`.
  ///
  /// Dipakai chip Beranda yang hanya membawa nama kategori, bukan ID.
  final String terrain;
  final SortOption sort;
  final DifficultyFilter difficulty;
  final List<String> supports;
  final bool verifiedOnly;

  bool get isFiltered =>
      categoryId.isNotEmpty ||
      terrain.isNotEmpty ||
      sort != SortOption.populer ||
      difficulty != DifficultyFilter.semua ||
      supports.isNotEmpty ||
      verifiedOnly;

  SearchFilter copyWith({
    String? query,
    String? categoryId,
    String? terrain,
    SortOption? sort,
    DifficultyFilter? difficulty,
    List<String>? supports,
    bool? verifiedOnly,
  }) {
    return SearchFilter(
      query: query ?? this.query,
      categoryId: categoryId ?? this.categoryId,
      terrain: terrain ?? this.terrain,
      sort: sort ?? this.sort,
      difficulty: difficulty ?? this.difficulty,
      supports: supports ?? this.supports,
      verifiedOnly: verifiedOnly ?? this.verifiedOnly,
    );
  }

  SearchFilter cleared() {
    return SearchFilter(query: query);
  }

  String get sortLabel => sort.label;

  String get sortShortLabel => switch (sort) {
    SortOption.populer => 'Populer',
    SortOption.rating => 'Rating',
    SortOption.ketinggian => 'Ketinggian',
    SortOption.termurah => 'Termurah',
  };

  String get difficultyLabel => difficulty.label;
}
