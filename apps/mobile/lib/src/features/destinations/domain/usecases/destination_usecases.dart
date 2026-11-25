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

/// Menyaring katalog Jelajah berdasarkan teks dan kategori yang aktif.
class SearchDestinationsUseCase {
  const SearchDestinationsUseCase();

  List<Destination> call(List<Destination> source, SearchFilter filter) {
    final tokens = _tokens(filter.query);
    final categoryTokens = _tokens(filter.categoryLabel);
    if (tokens.isEmpty && !filter.isFiltered && categoryTokens.isEmpty) {
      return source;
    }

    final filtered = source
        .where((destination) {
          if (!_matchesCategory(destination, filter, categoryTokens)) {
            return false;
          }
          if (!_matchesTerrain(destination, filter.terrain)) {
            return false;
          }
          if (!_matchesDifficulty(destination.difficulty, filter.difficulty)) {
            return false;
          }
          if (filter.supports.isNotEmpty &&
              !_matchesSupports(destination, filter.supports)) {
            return false;
          }
          if (tokens.isEmpty) return true;
          final haystack = _normalize(_haystack(destination));
          return tokens.every(haystack.contains);
        })
        .toList(growable: false);

    return _sorted(filtered, filter.sort);
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

  /// Chip Beranda hanya membawa nama medan, jadi dicocokkan ke `terrain`.
  ///
  /// Sengaja tidak memakai nama/tagline: "Camping Gunungkidul" bertagline
  /// gunung tapi medannya camping, dan harus tetap tersaring keluar.
  static bool _matchesTerrain(Destination destination, String terrain) {
    final wanted = terrain.trim().toLowerCase();
    if (wanted.isEmpty) return true;
    return destination.terrain.any((item) => item.toLowerCase() == wanted);
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
    final blob = [
      ...destination.activities,
      ...destination.terrain,
      ...destination.accessTransportModes,
      destination.tagline,
      destination.accessDescription ?? '',
    ].join(' ').toLowerCase();

    return supports.every((item) {
      final token = item.trim().toLowerCase();
      if (token == 'area camping') {
        return blob.contains('camping') || blob.contains('camp');
      }
      return blob.contains(token);
    });
  }
}

bool _matchesCategory(
  Destination destination,
  SearchFilter filter,
  List<String> categoryTokens,
) {
  if (filter.categoryId.isEmpty) return true;
  if (destination.categoryIds.contains(filter.categoryId)) return true;
  if (categoryTokens.isEmpty) return false;

  // Fallback untuk seed/cache lama yang belum punya categoryIds, serta
  // kategori yang hanya tercantum di medan, aktivitas, atau tag destinasi.
  final categoryHaystack = _normalize(
    [
      ...destination.terrain,
      ...destination.activities,
      ...destination.tags,
    ].join(' '),
  );
  return categoryTokens.any(categoryHaystack.contains);
}

List<String> _tokens(String value) =>
    _normalize(value)
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .toList(growable: false);

String _normalize(String value) =>
    value.toLowerCase().replaceAll(RegExp(r'[-_]'), ' ');

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
