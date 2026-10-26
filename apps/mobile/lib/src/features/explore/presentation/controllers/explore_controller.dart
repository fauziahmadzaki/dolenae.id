import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/search_filter.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/usecases/destination_usecases.dart';
import 'package:dolenae_mobile/src/features/explore/domain/repositories/explore_repository.dart';

class ExploreController extends ChangeNotifier {
  ExploreController(
    this._repository, {
    SearchDestinationsUseCase? searchDestinations,
  }) : _search = searchDestinations ?? const SearchDestinationsUseCase();

  final ExploreRepository _repository;
  final SearchDestinationsUseCase _search;

  SearchFilter _filter = const SearchFilter();

  SearchFilter get searchFilter => _filter;

  List<String> get searchHistory => _repository.searchHistory;

  List<String> get popularSearches => _repository.popularSearches;

  bool get hasActiveQuery => _filter.query.trim().isNotEmpty;

  /// Applies the active query to a catalog snapshot.
  List<Destination> resultsFor(List<Destination> catalog) {
    return _search(catalog, _filter);
  }

  void setSearchQuery(String query) {
    _filter = _filter.copyWith(query: query);
    notifyListeners();
  }

  void setSortOption(SortOption sort) {
    _filter = _filter.copyWith(sort: sort);
    notifyListeners();
  }

  void setDifficultyFilter(DifficultyFilter difficulty) {
    _filter = _filter.copyWith(difficulty: difficulty);
    notifyListeners();
  }

  void toggleSupportFilter(String support) {
    final next = [..._filter.supports];
    if (!next.remove(support)) next.add(support);
    _filter = _filter.copyWith(supports: next);
    notifyListeners();
  }

  void setVerifiedOnly(bool value) {
    _filter = _filter.copyWith(verifiedOnly: value);
    notifyListeners();
  }

  void clearSearchFilters() {
    _filter = _filter.cleared();
    notifyListeners();
  }

  void commitSearch(String query) {
    _repository.commit(query);
    notifyListeners();
  }

  void clearSearchHistory() {
    if (_repository.searchHistory.isEmpty) return;
    _repository.clearHistory();
    notifyListeners();
  }
}
