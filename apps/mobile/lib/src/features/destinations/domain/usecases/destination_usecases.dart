import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/core/usecases/usecase.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/search_filter.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';

/// Fetches the catalog from the API and refreshes the cache.
class RefreshDestinationsUseCase implements UseCase<void, NoParams> {
  const RefreshDestinationsUseCase(this._repository);

  final DestinationRepository _repository;

  @override
  Future<Result<void>> call(NoParams params) => _repository.refresh();
}

/// Menyaring katalog Jelajah berdasarkan filter cepat terstruktur dan teks pencarian.
class SearchDestinationsUseCase {
  const SearchDestinationsUseCase();

  List<Destination> call(List<Destination> source, SearchFilter filter) {
    final tokens = _tokens(filter.query);
    if (tokens.isEmpty && !filter.isFiltered) {
      return source;
    }

    final terrain = SearchFilter.sanitizeStructuredValue(filter.terrain);
    final categoryId = SearchFilter.sanitizeStructuredValue(filter.categoryId);
    final categoryLabel = SearchFilter.sanitizeStructuredValue(
      filter.categoryLabel,
    );
    final activityTag = SearchFilter.sanitizeStructuredValue(
      filter.activityTag,
    );
    final province = SearchFilter.sanitizeStructuredValue(filter.province);
    final supports = filter.supports
        .map(SearchFilter.sanitizeStructuredValue)
        .where((item) => item.isNotEmpty)
        .toList(growable: false);

    final filtered = source
        .where((destination) {
          if (!_matchesTerrain(
            destination,
            terrain,
            categoryId: categoryId,
          )) {
            return false;
          }
          if (terrain.isEmpty &&
              (categoryId.isNotEmpty || categoryLabel.isNotEmpty) &&
              !_matchesCategory(
                destination,
                categoryId: categoryId,
                categoryLabel: categoryLabel,
              )) {
            return false;
          }
          if (!_matchesActivityTag(destination, activityTag)) {
            return false;
          }
          if (!_matchesProvince(destination, province)) {
            return false;
          }
          if (!_matchesDifficulty(destination.difficulty, filter.difficulty)) {
            return false;
          }
          if (supports.isNotEmpty &&
              !_matchesSupports(destination, supports)) {
            return false;
          }
          if (tokens.isEmpty) return true;
          final haystack = _normalize(_haystack(destination));
          return tokens.every(haystack.contains);
        })
        .toList(growable: false);

    if (tokens.isNotEmpty && filter.sort == SortOption.populer) {
      return _sortedByRelevance(filtered, _normalize(filter.query), tokens);
    }
    return _sorted(filtered, filter.sort);
  }

  static List<Destination> _sortedByRelevance(
    List<Destination> items,
    String normalizedQuery,
    List<String> tokens,
  ) {
    final indexed = [
      for (var i = 0; i < items.length; i++)
        (
          index: i,
          item: items[i],
          score: _relevanceScore(items[i], normalizedQuery, tokens),
        ),
    ];
    indexed.sort((a, b) {
      final byScore = b.score.compareTo(a.score);
      if (byScore != 0) return byScore;
      return a.index.compareTo(b.index);
    });
    return indexed.map((entry) => entry.item).toList(growable: false);
  }

  static int _relevanceScore(
    Destination destination,
    String normalizedQuery,
    List<String> tokens,
  ) {
    final name = _normalize(destination.name.trim());
    final trimmedQuery = normalizedQuery.trim();
    var score = 0;
    if (trimmedQuery.isNotEmpty) {
      if (name == trimmedQuery) {
        score += 1000;
      } else if (name.startsWith(trimmedQuery)) {
        score += 500;
      }
    }
    if (tokens.isNotEmpty && tokens.every(name.contains)) {
      score += 250;
    }

    final region = _normalize('${destination.regency} ${destination.province}');
    final terrainAndActivities = _normalize(
      [...destination.terrain, ...destination.activities].join(' '),
    );
    final tags = _normalize(destination.tags.join(' '));
    final details = _normalize(
      [
        destination.tagline,
        destination.accessDescription ?? '',
        destination.accessPointName ?? '',
        ...destination.accessTransportModes,
      ].join(' '),
    );

    for (final token in tokens) {
      if (name.contains(token)) score += 60;
      if (region.contains(token)) score += 30;
      if (terrainAndActivities.contains(token)) score += 20;
      if (tags.contains(token)) score += 15;
      if (details.contains(token)) score += 5;
    }
    return score;
  }

  /// Urutan hasil. Destinasi tanpa nilai selalu diletakkan paling akhir supaya
  /// data kosong tidak tampil seolah paling murah/tertinggi.
  static List<Destination> _sorted(List<Destination> items, SortOption sort) {
    if (sort == SortOption.populer) return items;
    final sorted = [...items];
    sorted.sort((a, b) {
      switch (sort) {
        case SortOption.populer:
          return 0;
        case SortOption.termurah:
          return _compareNullable(a.priceFrom, b.priceFrom);
        case SortOption.rating:
          // Rating pertama, lalu ketinggian sebagai penentu bila seri/kosong.
          final byRating = _compareNullable(
            a.rating,
            b.rating,
            descending: true,
          );
          if (byRating != 0) return byRating;
          return _compareNullable(a.elevationM, b.elevationM, descending: true);
        case SortOption.ketinggian:
          return _compareNullable(a.elevationM, b.elevationM, descending: true);
      }
    });
    return sorted;
  }

  /// `null` dianggap paling akhir, baik urutan naik maupun turun.
  static int _compareNullable<T extends num>(
    T? a,
    T? b, {
    bool descending = false,
  }) {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return descending ? b.compareTo(a) : a.compareTo(b);
  }

  /// Cocokkan medan hanya pada `destination.terrain` (fallback `categoryIds`
  /// hanya bila `destination.terrain` kosong).
  static bool _matchesTerrain(
    Destination destination,
    String terrain, {
    String categoryId = '',
  }) {
    final wanted = _normalize(terrain);
    if (wanted.isEmpty) return true;
    if (destination.terrain.isNotEmpty) {
      return destination.terrain.any((item) => _normalize(item) == wanted);
    }
    if (categoryId.isNotEmpty && destination.categoryIds.isNotEmpty) {
      return destination.categoryIds.contains(categoryId);
    }
    return false;
  }

  static bool _matchesActivityTag(Destination destination, String activityTag) {
    final wanted = _normalize(activityTag);
    if (wanted.isEmpty) return true;
    return _matchesStructuredValues([
      ...destination.activities,
      ...destination.tags,
    ], wanted);
  }

  static bool _matchesProvince(Destination destination, String province) {
    final wanted = _normalize(province);
    if (wanted.isEmpty) return true;
    return _normalize(destination.province) == wanted;
  }

  static bool _matchesDifficulty(
    DifficultyLevel? level,
    DifficultyFilter filter,
  ) => switch (filter) {
    DifficultyFilter.semua => true,
    DifficultyFilter.ramahPemula => level == DifficultyLevel.pemula,
    DifficultyFilter.menengah => level == DifficultyLevel.menengah,
    DifficultyFilter.sulit => level == DifficultyLevel.sulit,
  };

  static bool _matchesSupports(Destination destination, List<String> supports) {
    return supports.every((item) {
      final wanted = _normalize(item);
      if (wanted.isEmpty) return true;
      if (wanted == 'area camping') {
        final hasStructuredCamping = _matchesStructuredValues([
          ...destination.activities,
          ...destination.tags,
          ...destination.terrain,
        ], 'camping ground');
        if (hasStructuredCamping) return true;
        return destination.facilities.entries.any(
          (entry) =>
              entry.value > 0 &&
              const {
                'area camping',
                'camping ground',
                'camping',
              }.contains(_normalize(entry.key)),
        );
      }
      return destination.facilities.entries.any(
        (entry) => entry.value > 0 && _normalize(entry.key) == wanted,
      );
    });
  }
}

bool _matchesCategory(
  Destination destination, {
  required String categoryId,
  required String categoryLabel,
}) {
  final cleanId = SearchFilter.sanitizeStructuredValue(categoryId);
  if (cleanId.isNotEmpty && destination.categoryIds.isNotEmpty) {
    return destination.categoryIds.contains(cleanId);
  }
  final wanted = _normalize(categoryLabel);
  if (wanted.isEmpty) return false;
  if (destination.terrain.any((item) => _normalize(item) == wanted) ||
      destination.activities.any((item) => _normalize(item) == wanted)) {
    return true;
  }
  if (destination.categoryIds.isEmpty) {
    return _matchesStructuredValues([
      ...destination.activities,
      ...destination.tags,
    ], wanted);
  }
  return false;
}

bool _matchesStructuredValues(List<String> values, String wantedNormalized) {
  for (final item in values) {
    final normalized = _normalize(item.trim());
    if (normalized == wantedNormalized) return true;
    if (wantedNormalized == 'camping ground' && normalized == 'camping') {
      return true;
    }
    if (wantedNormalized == 'camping' && normalized == 'camping ground') {
      return true;
    }
  }
  return false;
}

List<String> _tokens(String value) =>
    _normalize(value)
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .toList(growable: false);

String _normalize(String value) => SearchFilter.normalizeToken(value);

/// Satu hasil pencarian Beranda: destinasi, skor, dan alasannya.
class DestinationMatch {
  const DestinationMatch({
    required this.destination,
    required this.score,
    required this.reasons,
  });

  final Destination destination;

  /// Skor kecocokan 0–100.
  final int score;

  /// Alasan singkat untuk blok "Mengapa cocok?".
  final List<String> reasons;
}

/// Mencari destinasi dari katalog lokal untuk kartu rekomendasi di Beranda.
///
/// Kategori medan (`terrain`) dan aktivitas ikut dicocokkan supaya kata kunci
/// seperti "gunung" atau "camping" tetap menemukan destinasi yang relevan.
class SearchRecommendationsUseCase {
  const SearchRecommendationsUseCase();

  List<DestinationMatch> call(
    List<Destination> source,
    String query, {
    int limit = 5,
    String categoryId = '',
  }) {
    final needle = query.trim().toLowerCase();
    if (needle.isEmpty && categoryId.isEmpty) return const [];

    final matches = <DestinationMatch>[];
    for (final destination in source) {
      if (categoryId.isNotEmpty &&
          !destination.categoryIds.contains(categoryId)) {
        continue;
      }
      if (needle.isEmpty) {
        matches.add(
          DestinationMatch(
            destination: destination,
            score: 100,
            reasons: const ['Sesuai kategori pilihan'],
          ),
        );
        continue;
      }
      final reasons = <String>[];
      var score = 0;

      if (destination.name.toLowerCase().contains(needle)) {
        score += 60;
        reasons.add('Nama destinasi cocok dengan pencarian');
      }
      if (destination.tagline.toLowerCase().contains(needle)) {
        score += 20;
        reasons.add(destination.tagline);
      }

      final terrain = _matched(destination.terrain, needle);
      if (terrain.isNotEmpty) {
        score += 15;
        reasons.add('Kategori ${terrain.join(', ')}');
      }

      final activities = _matched(destination.activities, needle);
      if (activities.isNotEmpty) {
        score += 15;
        reasons.add('Cocok untuk ${activities.join(', ')}');
      }

      if (destination.regency.toLowerCase().contains(needle) ||
          destination.province.toLowerCase().contains(needle)) {
        score += 10;
        reasons.add('Berada di ${destination.locationLabel}');
      }

      if (score == 0) continue;
      matches.add(
        DestinationMatch(
          destination: destination,
          score: score > 100 ? 100 : score,
          reasons: reasons,
        ),
      );
    }

    matches.sort((a, b) => b.score.compareTo(a.score));
    return matches.take(limit).toList(growable: false);
  }
}

String _haystack(Destination destination) => [
  destination.name,
  destination.slug,
  destination.tagline,
  destination.province,
  destination.regency,
  destination.bestSeason ?? '',
  destination.accessDescription ?? '',
  destination.accessTravelTime ?? '',
  destination.accessDistance ?? '',
  destination.accessPointName ?? '',
  ...destination.accessTransportModes,
  ...destination.terrain,
  ...destination.activities,
  ...destination.tags,
].join(' ').toLowerCase();

List<String> _matched(List<String> values, String needle) => values
    .where((value) => value.toLowerCase().contains(needle))
    .toList(growable: false);
