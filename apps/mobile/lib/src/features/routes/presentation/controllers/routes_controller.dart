import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';
import 'package:dolenae_mobile/src/features/routes/domain/repositories/route_repository.dart';

class RoutesController extends ChangeNotifier {
  RoutesController(this._repository);
  final RouteRepository _repository;
  String? destinationId;
  RouteGraph? graph;
  TrailRoute? selectedRoute;
  RouteProfile? profile;
  AppFailure? graphFailure, profileFailure;
  bool graphLoading = false, profileLoading = false;
  int _graphRequest = 0, _profileRequest = 0;
  bool _disposed = false;

  Future<void> loadDestination(String id) async {
    final request = ++_graphRequest;
    ++_profileRequest;
    destinationId = id;
    graph = null;
    selectedRoute = null;
    profile = null;
    graphFailure = profileFailure = null;
    graphLoading = true;
    profileLoading = false;
    notifyListeners();
    final result = await _repository.graph(id);
    if (_disposed || request != _graphRequest) return;
    graphLoading = false;
    graph = result.valueOrNull;
    graphFailure = result.failureOrNull;
    notifyListeners();
    if (graph != null && graph!.routes.isNotEmpty) {
      final routes = graph!.routes;
      final initial = routes.where((r) => r.isRecommended).firstOrNull ?? routes.where((r) => r.status != 'terlarang').firstOrNull ?? routes.first;
      unawaited(selectRoute(initial.id));
    }
  }

  Future<void> selectRoute(String id) async {
    final route = graph?.routes.where((r) => r.id == id).firstOrNull;
    if (_disposed || route == null) return;
    final request = ++_profileRequest;
    selectedRoute = route;
    profile = null;
    profileFailure = null;
    profileLoading = true;
    notifyListeners();
    final result = await _repository.profile(id);
    if (_disposed || request != _profileRequest) return;
    profileLoading = false;
    profile = result.valueOrNull;
    profileFailure = result.failureOrNull;
    notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    ++_graphRequest;
    ++_profileRequest;
    super.dispose();
  }
}
