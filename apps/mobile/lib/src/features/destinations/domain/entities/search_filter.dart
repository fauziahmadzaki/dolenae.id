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
    this.categoryLabel = '',
    this.activityTag = '',
    this.province = '',
    this.sort = SortOption.populer,
    this.difficulty = DifficultyFilter.semua,
    this.supports = const [],
    this.verifiedOnly = false,
  });

  final String query;
  final String categoryId;

  /// Nama medan terpilih (mis. `Gunung`), dicocokkan ke `destination.terrain`.
  final String terrain;

  /// Nama kategori dari chip; dipakai bila destinasi belum punya `categoryIds`.
  final String categoryLabel;

  /// Tag aktivitas terstruktur (mis. `Sunrise`, `Camping Ground`).
  final String activityTag;

  /// Provinsi terstruktur (mis. `Jawa Timur`).
  final String province;

  final SortOption sort;
  final DifficultyFilter difficulty;
  final List<String> supports;
  final bool verifiedOnly;

  static final RegExp _controlChars = RegExp(r'[\x00-\x1F\x7F]');
  static final RegExp _separatorsAndSpaces = RegExp(r'[-_\s]+');

  /// Membersihkan teks rute dari karakter kontrol dan memotong tanpa membelah
  /// pasangan surrogate UTF-16.
  static String sanitizeRouteText(String? raw, {int maxLength = 120}) {
    var cleaned = (raw ?? '').replaceAll(_controlChars, '').trim();
    if (cleaned.length > maxLength) {
      var end = maxLength;
      if (end > 0) {
        final last = cleaned.codeUnitAt(end - 1);
        if (last >= 0xD800 && last <= 0xDBFF) {
          end--;
        }
      }
      cleaned = cleaned.substring(0, end).trim();
    }
    return cleaned;
  }

  /// Normalisasi token terstruktur dan teks pencarian.
  static String normalizeToken(String value) => value
      .replaceAll(_controlChars, '')
      .toLowerCase()
      .replaceAll(_separatorsAndSpaces, ' ')
      .trim();

  /// Membersihkan nilai filter terstruktur; nilai berisi pemisah saja menjadi `''`.
  static String sanitizeStructuredValue(String? raw, {int maxLength = 120}) {
    final cleaned = sanitizeRouteText(raw, maxLength: maxLength);
    return normalizeToken(cleaned).isEmpty ? '' : cleaned;
  }

  bool get hasQuery => query.trim().isNotEmpty;

  bool get isFiltered =>
      normalizeToken(categoryId).isNotEmpty ||
      normalizeToken(terrain).isNotEmpty ||
      normalizeToken(categoryLabel).isNotEmpty ||
      normalizeToken(activityTag).isNotEmpty ||
      normalizeToken(province).isNotEmpty ||
      sort != SortOption.populer ||
      difficulty != DifficultyFilter.semua ||
      supports.any((item) => normalizeToken(item).isNotEmpty) ||
      verifiedOnly;

  int get activeFilterCount =>
      ((normalizeToken(terrain).isNotEmpty ||
              normalizeToken(categoryId).isNotEmpty ||
              normalizeToken(categoryLabel).isNotEmpty)
          ? 1
          : 0) +
      (normalizeToken(activityTag).isNotEmpty ? 1 : 0) +
      (normalizeToken(province).isNotEmpty ? 1 : 0) +
      (difficulty != DifficultyFilter.semua ? 1 : 0) +
      supports.where((item) => normalizeToken(item).isNotEmpty).length +
      (verifiedOnly ? 1 : 0) +
      (sort != SortOption.populer ? 1 : 0);

  SearchFilter copyWith({
    String? query,
    String? categoryId,
    String? terrain,
    String? categoryLabel,
    String? activityTag,
    String? province,
    SortOption? sort,
    DifficultyFilter? difficulty,
    List<String>? supports,
    bool? verifiedOnly,
  }) {
    return SearchFilter(
      query: query ?? this.query,
      categoryId: categoryId ?? this.categoryId,
      terrain: terrain ?? this.terrain,
      categoryLabel: categoryLabel ?? this.categoryLabel,
      activityTag: activityTag ?? this.activityTag,
      province: province ?? this.province,
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
