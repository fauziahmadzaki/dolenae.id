/// Session-scoped search history and static suggestions.
abstract interface class ExploreRepository {
  List<String> get searchHistory;

  List<String> get popularSearches;

  /// Moves [query] to the front and caps the list at 8 entries.
  void commit(String query);

  void clearHistory();
}
