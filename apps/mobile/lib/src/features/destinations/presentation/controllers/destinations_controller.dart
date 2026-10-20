import 'dart:async';

import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination_catalog.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/usecases/destination_usecases.dart';
import 'package:dolenae_mobile/src/core/usecases/usecase.dart';

/// Offline-first destination catalog for the UI.
///
/// Items come from the repository stream, so a finished refresh updates the
/// screens without a manual reload.
class DestinationsController extends ChangeNotifier {
  DestinationsController({
    required DestinationRepository repository,
    RefreshDestinationsUseCase? refreshDestinations,
    List<Destination> initialItems = const [],
  }) : _repository = repository,
       _refreshDestinations =
           refreshDestinations ?? RefreshDestinationsUseCase(repository),
       _items = initialItems;

  final DestinationRepository _repository;
  final RefreshDestinationsUseCase _refreshDestinations;

  StreamSubscription<DestinationCatalog>? _subscription;
  List<Destination> _items;
  bool _isLoading = false;
  bool _hasRemoteData = false;
  String? _error;
  DateTime? _lastFetched;

  List<Destination> get items => _items;

  bool get isLoading => _isLoading;

  bool get hasRemoteData => _hasRemoteData;

  String? get error => _error;

  DateTime? get lastFetched => _lastFetched;

  /// Starts listening to the cache stream.
  void start() {
    _subscription ??= _repository.watchCatalog().listen(_onCatalog);
  }

  void _onCatalog(DestinationCatalog catalog) {
    if (!catalog.isEmpty) {
      _items = catalog.items;
      _hasRemoteData = true;
      _lastFetched = catalog.lastFetched;
      notifyListeners();
    }
  }

  Future<void> load() async {
    if (_isLoading) return;
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _refreshDestinations(const NoParams());
    _error = result.failureOrNull?.message;
    _isLoading = false;
    notifyListeners();
  }

  Future<void> refresh() => load();

  Destination? find(String idOrSlug) {
    for (final destination in _items) {
      if (destination.id == idOrSlug || destination.slug == idOrSlug) {
        return destination;
      }
    }
    return null;
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
