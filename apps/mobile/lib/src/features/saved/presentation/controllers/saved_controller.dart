import 'dart:async';

import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/domain/repositories/saved_repository.dart';

class SavedController extends ChangeNotifier {
  SavedController(this._repository);

  final SavedRepository _repository;
  String? _userId;
  int _epoch = 0;
  bool _isLoading = false;
  bool _hasLoaded = false;
  String? _error;
  final Set<String> _mutatingIds = {};
  Future<void>? _activeLoad;
  int? _activeLoadEpoch;

  bool get isLoading => _isLoading;
  bool get hasLoaded => _hasLoaded;
  String? get error => _error;
  bool get requiresInitialLoad => _repository.requiresInitialLoad;
  bool get isInitialSyncPending => _isLoading && !_hasLoaded;
  bool isMutating(String destinationId) => _mutatingIds.contains(destinationId);

  /// Set active user scope for per-account isolation.
  Future<void> setUserId(String? userId) async {
    final normalized = userId?.trim();
    final next = (normalized == null || normalized.isEmpty) ? null : normalized;
    if (next == _userId) return;
    _userId = next;
    _epoch++;
    _isLoading = false;
    _hasLoaded = false;
    _error = null;
    _mutatingIds.clear();
    _activeLoad = null;
    _activeLoadEpoch = null;
    _repository.setUserId(next);
    notifyListeners();
    if (next != null) {
      await loadDestinations();
    }
  }

  List<SavedDestination> get savedDestinations => _repository.destinations;

  List<SavedTripPlan> get savedPlans => _repository.plans;

  List<SavedChecklist> get savedChecklists => _repository.checklists;

  List<FacilityProposal> get proposals => _repository.proposals;

  bool isDestinationSaved(String destinationId) {
    return _repository.isDestinationSaved(destinationId);
  }

  Destination? findSavedDestination(String destinationId) {
    for (final item in _repository.destinations) {
      if (item.destination.id == destinationId) {
        return item.destination;
      }
    }
    return null;
  }

  Future<void> loadDestinations({bool refresh = false}) {
    if (_activeLoad != null && _activeLoadEpoch == _epoch) {
      return _activeLoad!;
    }
    final capturedEpoch = _epoch;
    final future = _performLoad(capturedEpoch: capturedEpoch, refresh: refresh);
    _activeLoad = future;
    _activeLoadEpoch = capturedEpoch;
    return future;
  }

  Future<void> _performLoad({
    required int capturedEpoch,
    required bool refresh,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _repository.loadDestinations(refresh: refresh);
      if (capturedEpoch != _epoch) return;
      switch (result) {
        case Success():
          _hasLoaded = true;
          _error = null;
        case Failure(:final failure):
          if (failure is AuthFailure) {
            _hasLoaded = false;
          }
          _error = failure.message;
      }
    } catch (_) {
      if (capturedEpoch == _epoch) {
        _error = 'Gagal memuat destinasi tersimpan. Coba lagi.';
      }
    } finally {
      if (capturedEpoch == _epoch) {
        _isLoading = false;
        _activeLoad = null;
        _activeLoadEpoch = null;
        notifyListeners();
      }
    }
  }

  Future<Result<bool>> saveDestination(Destination destination) async {
    if (_mutatingIds.contains(destination.id)) {
      return const Failure(ValidationFailure('Permintaan sedang diproses.'));
    }
    final capturedEpoch = _epoch;
    _mutatingIds.add(destination.id);
    notifyListeners();

    try {
      final result = await _repository.saveDestination(destination);
      if (capturedEpoch == _epoch &&
          result is Failure<bool> &&
          result.failure is AuthFailure) {
        _hasLoaded = false;
        _error = result.failure.message;
      }
      return result;
    } finally {
      if (capturedEpoch == _epoch) {
        _mutatingIds.remove(destination.id);
        notifyListeners();
      }
    }
  }

  Future<Result<bool>> toggleSavedDestination(Destination destination) async {
    if (_mutatingIds.contains(destination.id)) {
      return const Failure(ValidationFailure('Permintaan sedang diproses.'));
    }
    final capturedEpoch = _epoch;
    _mutatingIds.add(destination.id);
    notifyListeners();

    try {
      final result = await _repository.toggleDestination(destination);
      if (capturedEpoch == _epoch &&
          result is Failure<bool> &&
          result.failure is AuthFailure) {
        _hasLoaded = false;
        _error = result.failure.message;
      }
      return result;
    } finally {
      if (capturedEpoch == _epoch) {
        _mutatingIds.remove(destination.id);
        notifyListeners();
      }
    }
  }

  Future<Result<void>> removeSavedDestination(String destinationId) async {
    if (_mutatingIds.contains(destinationId)) {
      return const Failure(ValidationFailure('Permintaan sedang diproses.'));
    }
    final capturedEpoch = _epoch;
    _mutatingIds.add(destinationId);
    notifyListeners();

    try {
      final result = await _repository.removeDestination(destinationId);
      if (capturedEpoch == _epoch &&
          result is Failure<void> &&
          result.failure is AuthFailure) {
        _hasLoaded = false;
        _error = result.failure.message;
      }
      return result;
    } finally {
      if (capturedEpoch == _epoch) {
        _mutatingIds.remove(destinationId);
        notifyListeners();
      }
    }
  }

  void removeSavedPlan(String planId) {
    _repository.removePlan(planId);
    notifyListeners();
  }

  void archiveSavedPlan(String planId) {
    _repository.archivePlan(planId);
    notifyListeners();
  }

  void removeSavedChecklist(String checklistId) {
    _repository.removeChecklist(checklistId);
    notifyListeners();
  }

  void addProposal(FacilityProposal proposal) {
    _repository.addProposal(proposal);
    notifyListeners();
  }
}
