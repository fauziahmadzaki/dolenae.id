// ignore_for_file: prefer_initializing_formals

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_destination_local_data_source.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_destination_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/domain/repositories/saved_repository.dart';

class _SavedUserState {
  _SavedUserState()
    : destinations = [],
      plans = List.of(SavedSeedData.plans),
      checklists = List.of(SavedSeedData.checklists),
      proposals = List.of(SavedSeedData.proposals);

  final List<SavedDestination> destinations;
  final List<SavedTripPlan> plans;
  final List<SavedChecklist> checklists;
  final List<FacilityProposal> proposals;
}

class SavedRepositoryImpl implements SavedRepository {
  // Named public parameters map to private fields so callers can pass either.
  SavedRepositoryImpl({
    SavedDestinationLocalDataSource? local,
    SavedDestinationRemoteDataSource? remote,
  }) : _local = local,
       _remote = remote;

  final SavedDestinationLocalDataSource? _local;
  final SavedDestinationRemoteDataSource? _remote;
  final Map<String, Future<void>> _scopeQueues = {};
  final Map<String, _SavedUserState> _states = {};
  String? _userId;
  String _userScope = SavedDestinationLocalDataSource.scopeFor(null);
  int _sessionEpoch = 0;
  bool _authRevoked = false;

  @override
  bool get requiresInitialLoad => _remote != null && _userId != null;

  _SavedUserState get _state => _stateFor(_userScope);

  _SavedUserState _stateFor(String scope) =>
      _states.putIfAbsent(scope, _SavedUserState.new);

  Future<T> _enqueueScopeOp<T>(String scope, Future<T> Function() op) {
    final prev = _scopeQueues[scope] ?? Future<void>.value();
    final next = prev.then((_) => op(), onError: (_) => op());
    late final Future<void> entry;
    entry = next
        .then<void>((_) {}, onError: (_) {})
        .whenComplete(() {
          if (identical(_scopeQueues[scope], entry)) {
            _scopeQueues.remove(scope);
          }
        });
    _scopeQueues[scope] = entry;
    return next;
  }

  bool _isStaleSession(int capturedEpoch, String? capturedUserId) =>
      _sessionEpoch != capturedEpoch || _userId != capturedUserId;

  /// Memisahkan state tersimpan/usulan per pengguna agar tidak bocor lintas akun
  /// dan mengosongkan memori sesi keluar/masuk agar tidak menampilkan state basi.
  @override
  void setUserId(String? userId) {
    final trimmed = userId?.trim();
    final next = (trimmed == null || trimmed.isEmpty) ? null : trimmed;
    if (next == _userId) return;
    _states[_userScope]?.destinations.clear();
    _userId = next;
    _userScope = SavedDestinationLocalDataSource.scopeFor(next);
    _states[_userScope]?.destinations.clear();
    _authRevoked = false;
    _sessionEpoch++;
  }

  @override
  List<SavedDestination> get destinations => List.unmodifiable(_state.destinations);

  @override
  List<SavedTripPlan> get plans => List.unmodifiable(_state.plans);

  @override
  List<SavedChecklist> get checklists => List.unmodifiable(_state.checklists);

  @override
  List<FacilityProposal> get proposals => List.unmodifiable(_state.proposals);

  @override
  bool isDestinationSaved(String destinationId) {
    return _state.destinations.any((item) => item.destination.id == destinationId);
  }

  @override
  Future<Result<List<SavedDestination>>> loadDestinations({
    bool refresh = false,
  }) {
    final capturedUserId = _userId;
    final capturedEpoch = _sessionEpoch;
    final capturedScope = _userScope;
    final remote = _remote;
    final capturedToken = remote?.currentToken;

    return _enqueueScopeOp(capturedScope, () async {
      if (_isStaleSession(capturedEpoch, capturedUserId)) {
        return const Failure(CacheFailure('Sesi akun berubah.'));
      }

      if (remote == null) {
        return Success(List.unmodifiable(_stateFor(capturedScope).destinations));
      }

      if (capturedUserId == null) {
        _stateFor(capturedScope).destinations.clear();
        return const Success(<SavedDestination>[]);
      }

      try {
        final items = await remote.fetchSavedDestinations(
          authToken: capturedToken,
        );
        if (_isStaleSession(capturedEpoch, capturedUserId)) {
          return const Failure(CacheFailure('Sesi akun berubah.'));
        }
        _authRevoked = false;
        _replaceDestinations(capturedScope, items);
        await _local?.write(items, scope: capturedScope);
        return Success(List.unmodifiable(items));
      } on ApiException catch (error) {
        if (_isStaleSession(capturedEpoch, capturedUserId)) {
          return const Failure(CacheFailure('Sesi akun berubah.'));
        }
        if (error.isUnauthorized) {
          _authRevoked = true;
          _stateFor(capturedScope).destinations.clear();
          await _local?.clear(scope: capturedScope);
          return Failure(error.toFailure());
        }
        if (!_authRevoked) {
          final cached = _local?.read(scope: capturedScope);
          if (cached != null) {
            _replaceDestinations(capturedScope, cached);
          }
        }
        return Failure(error.toFailure());
      } catch (_) {
        if (_isStaleSession(capturedEpoch, capturedUserId)) {
          return const Failure(CacheFailure('Sesi akun berubah.'));
        }
        if (!_authRevoked) {
          final cached = _local?.read(scope: capturedScope);
          if (cached != null) {
            _replaceDestinations(capturedScope, cached);
          }
        }
        return const Failure(
          NetworkFailure('Gagal memuat destinasi tersimpan. Coba lagi.'),
        );
      }
    });
  }

  @override
  Future<Result<bool>> saveDestination(Destination destination) {
    final capturedUserId = _userId;
    final capturedEpoch = _sessionEpoch;
    final capturedScope = _userScope;
    final remote = _remote;
    final capturedToken = remote?.currentToken;

    return _enqueueScopeOp(capturedScope, () async {
      if (_isStaleSession(capturedEpoch, capturedUserId)) {
        return const Failure(CacheFailure('Sesi akun berubah.'));
      }

      final state = _stateFor(capturedScope);
      if (remote == null) {
        state.destinations.removeWhere(
          (item) => item.destination.id == destination.id,
        );
        state.destinations.insert(
          0,
          SavedDestination(
            id: 'save-${destination.id}',
            destination: destination,
            savedAt: DateTime.now(),
          ),
        );
        return const Success(true);
      }

      if (capturedUserId == null) {
        return const Failure(
          AuthFailure(
            'Masuk terlebih dahulu untuk menyimpan destinasi.',
            code: 'AUTH_REQUIRED',
          ),
        );
      }

      try {
        final savedItem = await remote.saveDestination(
          destination.id,
          authToken: capturedToken,
        );
        if (_isStaleSession(capturedEpoch, capturedUserId)) {
          return const Failure(CacheFailure('Sesi akun berubah.'));
        }
        state.destinations.removeWhere(
          (item) => item.destination.id == destination.id,
        );
        state.destinations.insert(0, savedItem);
        await _local?.write(state.destinations, scope: capturedScope);
        return const Success(true);
      } on ApiException catch (error) {
        if (!_isStaleSession(capturedEpoch, capturedUserId) &&
            error.isUnauthorized) {
          _authRevoked = true;
          state.destinations.clear();
          await _local?.clear(scope: capturedScope);
        }
        return Failure(error.toFailure());
      } catch (_) {
        return const Failure(
          NetworkFailure('Gagal memperbarui destinasi tersimpan. Coba lagi.'),
        );
      }
    });
  }

  @override
  Future<Result<bool>> toggleDestination(Destination destination) async {
    final wantSaved = !isDestinationSaved(destination.id);
    if (wantSaved) {
      return saveDestination(destination);
    }
    final result = await removeDestination(destination.id);
    return switch (result) {
      Success() => const Success(false),
      Failure(:final failure) => Failure(failure),
    };
  }

  @override
  Future<Result<void>> removeDestination(String destinationId) {
    final capturedUserId = _userId;
    final capturedEpoch = _sessionEpoch;
    final capturedScope = _userScope;
    final remote = _remote;
    final capturedToken = remote?.currentToken;

    return _enqueueScopeOp(capturedScope, () async {
      if (_isStaleSession(capturedEpoch, capturedUserId)) {
        return const Failure(CacheFailure('Sesi akun berubah.'));
      }

      final state = _stateFor(capturedScope);
      if (remote == null) {
        state.destinations.removeWhere(
          (item) => item.destination.id == destinationId,
        );
        return const Success(null);
      }

      if (capturedUserId == null) {
        return const Failure(
          AuthFailure(
            'Masuk terlebih dahulu untuk menyimpan destinasi.',
            code: 'AUTH_REQUIRED',
          ),
        );
      }

      try {
        await remote.removeDestination(
          destinationId,
          authToken: capturedToken,
        );
        if (_isStaleSession(capturedEpoch, capturedUserId)) {
          return const Failure(CacheFailure('Sesi akun berubah.'));
        }
        state.destinations.removeWhere(
          (item) => item.destination.id == destinationId,
        );
        await _local?.write(state.destinations, scope: capturedScope);
        return const Success(null);
      } on ApiException catch (error) {
        if (!_isStaleSession(capturedEpoch, capturedUserId) &&
            error.isUnauthorized) {
          _authRevoked = true;
          state.destinations.clear();
          await _local?.clear(scope: capturedScope);
        }
        return Failure(error.toFailure());
      } catch (_) {
        return const Failure(
          NetworkFailure('Gagal menghapus destinasi. Coba lagi.'),
        );
      }
    });
  }

  void _replaceDestinations(String scope, List<SavedDestination> items) {
    final list = _stateFor(scope).destinations;
    list
      ..clear()
      ..addAll(items);
  }

  @override
  void removePlan(String planId) {
    _state.plans.removeWhere((item) => item.id == planId);
  }

  @override
  void archivePlan(String planId) {
    final index = _state.plans.indexWhere((item) => item.id == planId);
    if (index == -1) return;
    final plan = _state.plans[index];
    _state.plans[index] = SavedTripPlan(
      id: plan.id,
      name: plan.name,
      dateRange: plan.dateRange,
      destinationCount: plan.destinationCount,
      destinationTotal: plan.destinationTotal,
      status: plan.status == SavedPlanStatus.aktif
          ? SavedPlanStatus.arsip
          : SavedPlanStatus.aktif,
      savedAt: plan.savedAt,
    );
  }

  @override
  void removeChecklist(String checklistId) {
    _state.checklists.removeWhere((item) => item.id == checklistId);
  }

  @override
  void addProposal(FacilityProposal proposal) {
    _state.proposals.insert(0, proposal);
  }
}
