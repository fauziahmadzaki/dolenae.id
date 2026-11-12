import 'package:dolenae_mobile/src/features/explore/data/data_sources/explore_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/explore/domain/repositories/explore_repository.dart';

class ExploreRepositoryImpl implements ExploreRepository {
  ExploreRepositoryImpl({List<String>? history})
    : _history = List.of(history ?? ExploreSeedData.searchHistory);

  static const _maxHistory = 8;

  final List<String> _history;

  @override
  List<String> get searchHistory => List.unmodifiable(_history);

  @override
  List<String> get popularSearches => ExploreSeedData.popularSearches;

  @override
  void commit(String query) {
    final value = query.trim();
    if (value.isEmpty) return;
    _history.removeWhere((item) => item.toLowerCase() == value.toLowerCase());
    _history.insert(0, value);
    while (_history.length > _maxHistory) {
      _history.removeLast();
    }
  }

  @override
  void clearHistory() => _history.clear();
}
