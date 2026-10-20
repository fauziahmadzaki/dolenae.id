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

    return source.where((destination) {
      final haystack = [
        destination.name,
        destination.tagline,
        destination.province,
        destination.regency,
      ].join(' ').toLowerCase();
      return haystack.contains(query);
    }).toList(growable: false);
  }
}
