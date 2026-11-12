import 'dart:async';

import 'package:flutter/widgets.dart';

import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination_catalog.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/usecases/destination_usecases.dart';
import 'package:dolenae_mobile/src/core/usecases/usecase.dart';

/// Offline-first destination catalog for the UI.
///
/// Items come from the repository stream, so a finished refresh updates the
/// screens without a manual reload.
class DestinationsController extends ChangeNotifier
    with WidgetsBindingObserver {
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
  Timer? _timer;
  bool _disposed = false;
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
    if (_disposed || _subscription != null) return;
    _subscription = _repository.watchCatalog().listen(_onCatalog);
    WidgetsBinding.instance.addObserver(this);
    _setForeground(
      WidgetsBinding.instance.lifecycleState == null ||
          WidgetsBinding.instance.lifecycleState == AppLifecycleState.resumed,
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _setForeground(state == AppLifecycleState.resumed);
  }

  void _setForeground(bool foreground) {
    _timer?.cancel();
    _timer = null;
    if (_disposed || !foreground) return;
    unawaited(load());
    _timer = Timer.periodic(
      const Duration(seconds: 5),
      (_) => unawaited(load()),
    );
  }

  void _onCatalog(DestinationCatalog catalog) {
    if (_disposed) return;
    _items = catalog.items;
    _hasRemoteData = catalog.lastFetched != null;
    _lastFetched = catalog.lastFetched;
    notifyListeners();
  }

  Future<void> load() async {
    if (_disposed || _isLoading) return;
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _refreshDestinations(const NoParams());
    if (_disposed) return;
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
    _disposed = true;
    _timer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    _subscription?.cancel();
    super.dispose();
  }
}
