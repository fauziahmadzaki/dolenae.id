import 'package:flutter/foundation.dart';

import '../../data/models/destination.dart';
import '../../data/models/search_filter.dart';
import '../../data/seed/seed_data.dart';

class SearchState extends ChangeNotifier {
  SearchFilter _filter = const SearchFilter();

  final List<String> _history = List.of(SeedData.searchHistory);

  SearchFilter get searchFilter => _filter;

  List<String> get searchHistory => List<String>.unmodifiable(_history);

  List<Destination> get searchResults {
    final query = _filter.query.trim().toLowerCase();
    if (query.isEmpty) return SeedData.destinations;
    return SeedData.destinations.where((destination) {
      final haystack = [
        destination.name,
        destination.tagline,
        destination.province,
        destination.regency,
      ].join(' ').toLowerCase();
      return haystack.contains(query);
    }).toList();
  }

  bool get hasActiveQuery => _filter.query.trim().isNotEmpty;

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
    final value = query.trim();
    if (value.isEmpty) return;
    _history.removeWhere((item) => item.toLowerCase() == value.toLowerCase());
    _history.insert(0, value);
    while (_history.length > 8) {
      _history.removeLast();
    }
    notifyListeners();
  }

  void clearSearchHistory() {
    if (_history.isEmpty) return;
    _history.clear();
    notifyListeners();
  }
}
