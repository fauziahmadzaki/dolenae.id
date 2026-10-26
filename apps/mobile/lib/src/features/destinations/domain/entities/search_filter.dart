/// Opsi urutkan di bottom sheet Filter & urutkan.
enum SortOption { populer, rating, terdekat, termurah }

/// Label opsi urutkan untuk chip di bottom sheet filter.
extension SortOptionLabel on SortOption {
  String get label => switch (this) {
    SortOption.populer => 'Paling populer',
    SortOption.rating => 'Rating tertinggi',
    SortOption.terdekat => 'Paling dekat',
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
    this.sort = SortOption.populer,
    this.difficulty = DifficultyFilter.semua,
    this.supports = const [],
    this.verifiedOnly = false,
  });

  final String query;
  final SortOption sort;
  final DifficultyFilter difficulty;
  final List<String> supports;
  final bool verifiedOnly;

  bool get isFiltered =>
      sort != SortOption.populer ||
      difficulty != DifficultyFilter.semua ||
      supports.isNotEmpty ||
      verifiedOnly;

  SearchFilter copyWith({
    String? query,
    SortOption? sort,
    DifficultyFilter? difficulty,
    List<String>? supports,
    bool? verifiedOnly,
  }) {
    return SearchFilter(
      query: query ?? this.query,
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
    SortOption.terdekat => 'Terdekat',
    SortOption.termurah => 'Termurah',
  };

  String get difficultyLabel => difficulty.label;
}
