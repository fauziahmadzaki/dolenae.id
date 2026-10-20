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

/// Filters a catalog snapshot by the active search query.
class SearchDestinationsUseCase {
  const SearchDestinationsUseCase();

  List<Destination> call(List<Destination> source, SearchFilter filter) {
    final query = filter.query.trim().toLowerCase();
    if (query.isEmpty) return source;

    return source
        .where((destination) => _haystack(destination).contains(query))
        .toList(growable: false);
  }
}

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
  }) {
    final needle = query.trim().toLowerCase();
    if (needle.isEmpty) return const [];

    final matches = <DestinationMatch>[];
    for (final destination in source) {
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
  destination.tagline,
  destination.province,
  destination.regency,
  ...destination.terrain,
  ...destination.activities,
].join(' ').toLowerCase();

List<String> _matched(List<String> values, String needle) => values
    .where((value) => value.toLowerCase().contains(needle))
    .toList(growable: false);
