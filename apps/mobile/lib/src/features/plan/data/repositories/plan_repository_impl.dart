import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/plan/data/data_sources/plan_local_data_source.dart';
import 'package:dolenae_mobile/src/features/plan/data/data_sources/plan_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/domain/repositories/plan_repository.dart';

class PlanRepositoryImpl implements PlanRepository {
  PlanRepositoryImpl(this._local, [this._remote]);

  final PlanLocalDataSource _local;
  final PlanRemoteDataSource? _remote;
  final Map<String, Future<void>> _scopeQueues = {};
  String? _userId;
  int _sessionEpoch = 0;

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

  /// Mengatur scope pengguna aktif. Data rencana dipisah per pengguna.
  @override
  void setUserId(String? userId) {
    final trimmed = userId?.trim();
    final next = (trimmed == null || trimmed.isEmpty) ? null : trimmed;
    if (next == _userId) return;
    _userId = next;
    _sessionEpoch++;
    _local.setUserId(_userId);
  }

  static const _localSyncError = CacheFailure(
    'Perubahan tersimpan di server, tetapi gagal memperbarui penyimpanan lokal.',
    code: 'local_cache_sync_failed',
  );

  static const _localReadError = CacheFailure(
    'Gagal membaca penyimpanan lokal daftar rencana. Coba lagi.',
    code: 'local_cache_sync_failed',
  );

  bool _isStaleSession(int capturedEpoch, String? capturedUserId) =>
      _sessionEpoch != capturedEpoch || _userId != capturedUserId;

  bool _isClientDeletedTombstone(ApiException error) =>
      error.statusCode == 409 && error.code == 'PLAN_CLIENT_DELETED';

  @override
  Future<Result<List<TripPlan>>> load() {
    final capturedUserId = _userId;
    final capturedEpoch = _sessionEpoch;
    final capturedScope = PlanLocalDataSource.scopeFor(capturedUserId);
    final remote = _remote;
    final capturedToken = remote?.currentToken;

    return _enqueueScopeOp(capturedScope, () async {
      if (_isStaleSession(capturedEpoch, capturedUserId)) {
        return const Failure(CacheFailure('Sesi akun berubah.'));
      }

      try {
        final legacyOk = await _local.migrateLegacyIfNeeded();
        if (!legacyOk) {
          return const Failure(
            CacheFailure(
              'Gagal memperbarui penyimpanan lokal daftar rencana.',
              code: 'local_cache_sync_failed',
            ),
          );
        }
      } catch (_) {
        return const Failure(
          CacheFailure(
            'Gagal memperbarui penyimpanan lokal daftar rencana.',
            code: 'local_cache_sync_failed',
          ),
        );
      }
      if (_isStaleSession(capturedEpoch, capturedUserId)) {
        return const Failure(CacheFailure('Sesi akun berubah.'));
      }

      if (capturedUserId != null && remote != null) {
        late final List<TripPlan> remotePlans;
        try {
          remotePlans = await remote.fetchPlans(authToken: capturedToken);
        } on ApiException catch (error) {
          if (_isStaleSession(capturedEpoch, capturedUserId)) {
            return const Failure(CacheFailure('Sesi akun berubah.'));
          }
          if (error.isUnauthorized) return Failure(error.toFailure());
          try {
            final cached = _local.read(scope: capturedScope);
            if (cached != null) return Success(cached);
          } catch (_) {
            return const Failure(_localReadError);
          }
          return Failure(error.toFailure());
        } catch (_) {
          if (_isStaleSession(capturedEpoch, capturedUserId)) {
            return const Failure(CacheFailure('Sesi akun berubah.'));
          }
          try {
            final cached = _local.read(scope: capturedScope);
            if (cached != null) return Success(cached);
          } catch (_) {
            return const Failure(_localReadError);
          }
          return const Failure(
            NetworkFailure('Daftar rencana gagal dimuat. Coba lagi.'),
          );
        }

        if (_isStaleSession(capturedEpoch, capturedUserId)) {
          return const Failure(CacheFailure('Sesi akun berubah.'));
        }
        try {
          final migrated = await _migratePendingPlans(
            remote: remote,
            scope: capturedScope,
            remotePlans: remotePlans,
            capturedEpoch: capturedEpoch,
            capturedUserId: capturedUserId,
            capturedToken: capturedToken,
          );
          if (_isStaleSession(capturedEpoch, capturedUserId)) {
            return const Failure(CacheFailure('Sesi akun berubah.'));
          }
          if (migrated == null) {
            return const Failure(
              CacheFailure(
                'Rencana berhasil disinkronkan dari server, tetapi gagal memperbarui penyimpanan lokal.',
                code: 'local_cache_sync_failed',
              ),
            );
          }
          final wroteCache = await _local.write(migrated, scope: capturedScope);
          if (!wroteCache) {
            return const Failure(
              CacheFailure(
                'Rencana berhasil disinkronkan dari server, tetapi gagal memperbarui penyimpanan lokal.',
                code: 'local_cache_sync_failed',
              ),
            );
          }
          return Success(migrated);
        } catch (_) {
          return const Failure(
            CacheFailure(
              'Rencana berhasil disinkronkan dari server, tetapi gagal memperbarui penyimpanan lokal.',
              code: 'local_cache_sync_failed',
            ),
          );
        }
      }

      try {
        return Success(_local.read(scope: capturedScope) ?? const []);
      } catch (_) {
        return const Failure(
          CacheFailure(
            'Daftar rencana gagal dimuat. Coba lagi.',
            code: 'local_cache_sync_failed',
          ),
        );
      }
    });
  }

  Future<List<TripPlan>?> _migratePendingPlans({
    required PlanRemoteDataSource remote,
    required String scope,
    required List<TripPlan> remotePlans,
    required int capturedEpoch,
    required String capturedUserId,
    required String? capturedToken,
  }) async {
    var pending = _local.readPendingMigration(scope);

    // Seed per-account pending queue once from same-account local storage
    // before remote overwrite can discard pre-upgrade local plans.
    if (!_local.hasSeededPendingMigration(scope)) {
      final scopedLocal = _local.read(scope: scope) ?? const <TripPlan>[];
      final existingPendingIds = pending.map((p) => p.id).toSet();
      final seeded = [
        ...pending,
        for (final plan in scopedLocal)
          if (plan.engine.trim().toLowerCase() != 'seed' &&
              !existingPendingIds.contains(plan.id))
            plan,
      ];
      pending = seeded;
      final wrotePending = await _local.writePendingMigration(scope, pending);
      if (!wrotePending) {
        return null;
      }
      final markedSeeded = await _local.markPendingMigrationSeeded(scope);
      if (!markedSeeded) {
        return null;
      }
    }

    var bookkeepingFailed = false;
    final pendingDeleteIds = _local.readPendingDeleteIds(scope);
    final remainingRemote = [...remotePlans];
    for (final delId in pendingDeleteIds) {
      if (_isStaleSession(capturedEpoch, capturedUserId)) {
        return null;
      }
      var deletedOnServer = false;
      try {
        await remote.deletePlanByClientId(delId, authToken: capturedToken);
        deletedOnServer = true;
      } catch (_) {
        // Keep matching row hidden and retain delId in pending_delete for retry.
        remainingRemote.removeWhere(
          (p) => p.clientId?.trim() == delId || p.id == delId,
        );
      }
      if (!deletedOnServer) continue;
      if (_isStaleSession(capturedEpoch, capturedUserId)) {
        return null;
      }
      remainingRemote.removeWhere(
        (p) => p.clientId?.trim() == delId || p.id == delId,
      );
      try {
        final marked = await _local.markMigrated(scope, delId);
        if (!marked) {
          bookkeepingFailed = true;
          continue;
        }
        final removedDel = await _local.removePendingDeleteId(scope, delId);
        if (!removedDel) {
          bookkeepingFailed = true;
        }
      } catch (_) {
        bookkeepingFailed = true;
      }
    }

    if (pending.isEmpty) {
      return bookkeepingFailed ? null : remainingRemote;
    }

    final dirtyIds = _local.readPendingDirtyIds(scope);
    final migratedIds = _local.readMigratedIds(scope);
    final remoteById = <String, int>{};
    final remoteByClientId = <String, int>{};
    for (var i = 0; i < remainingRemote.length; i++) {
      final p = remainingRemote[i];
      remoteById[p.id] = i;
      final cid = p.clientId?.trim();
      if (cid != null && cid.isNotEmpty) {
        remoteByClientId[cid] = i;
      }
    }

    final uploaded = <TripPlan>[];
    final stillPending = <TripPlan>[];

    for (final candidate in pending) {
      if (_isStaleSession(capturedEpoch, capturedUserId)) {
        return null;
      }
      if (candidate.engine.trim().toLowerCase() == 'seed') {
        continue;
      }
      if (pendingDeleteIds.contains(candidate.id)) {
        continue;
      }

      final matchedIdx =
          remoteByClientId[candidate.id] ?? remoteById[candidate.id];
      if (matchedIdx != null) {
        final matched = remainingRemote[matchedIdx];
        if (dirtyIds.contains(candidate.id)) {
          TripPlan? patched;
          try {
            patched = await remote.updatePlan(
              candidate.copyWith(
                id: matched.id,
                clientId: matched.clientId ?? candidate.id,
              ),
              authToken: capturedToken,
            );
          } catch (_) {
            remainingRemote[matchedIdx] = candidate;
            stillPending.add(candidate);
            continue;
          }
          if (_isStaleSession(capturedEpoch, capturedUserId)) {
            return null;
          }
          remainingRemote[matchedIdx] = patched;
          try {
            final marked = await _local.markMigrated(scope, candidate.id);
            final clearedDirty = await _local.clearPendingDirty(
              scope,
              candidate.id,
            );
            if (!clearedDirty || !marked) {
              bookkeepingFailed = true;
              stillPending.add(candidate);
            }
          } catch (_) {
            bookkeepingFailed = true;
            stillPending.add(candidate);
          }
        } else {
          try {
            final marked = await _local.markMigrated(scope, candidate.id);
            if (!marked) {
              bookkeepingFailed = true;
              stillPending.add(candidate);
            }
          } catch (_) {
            bookkeepingFailed = true;
            stillPending.add(candidate);
          }
        }
        continue;
      }

      if (migratedIds.contains(candidate.id) &&
          !dirtyIds.contains(candidate.id)) {
        continue;
      }

      TripPlan? resolved;
      var tombstoned = false;
      try {
        final result = await remote.createPlanWithMeta(
          candidate,
          authToken: capturedToken,
          clientId: candidate.id,
        );
        if (_isStaleSession(capturedEpoch, capturedUserId)) {
          return null;
        }
        var next = result.plan;
        if (result.replayed && dirtyIds.contains(candidate.id)) {
          next = await remote.updatePlan(
            candidate.copyWith(
              id: result.plan.id,
              clientId: result.plan.clientId ?? candidate.id,
            ),
            authToken: capturedToken,
          );
          if (_isStaleSession(capturedEpoch, capturedUserId)) {
            return null;
          }
        }
        resolved = next;
      } on ApiException catch (error) {
        if (_isClientDeletedTombstone(error)) {
          tombstoned = true;
        } else {
          stillPending.add(candidate);
          continue;
        }
      } catch (_) {
        stillPending.add(candidate);
        continue;
      }

      try {
        final marked = await _local.markMigrated(scope, candidate.id);
        final clearedDirty = dirtyIds.contains(candidate.id)
            ? await _local.clearPendingDirty(scope, candidate.id)
            : true;
        if (!clearedDirty || !marked) {
          bookkeepingFailed = true;
          stillPending.add(candidate);
        }
      } catch (_) {
        bookkeepingFailed = true;
        stillPending.add(candidate);
      }
      if (!tombstoned && resolved != null) {
        uploaded.add(resolved);
      }
    }

    if (_isStaleSession(capturedEpoch, capturedUserId)) {
      return null;
    }
    final wroteRemaining = await _local.writePendingMigration(
      scope,
      stillPending,
    );
    if (bookkeepingFailed || !wroteRemaining) {
      return null;
    }

    final remainingDeletes = _local.readPendingDeleteIds(scope);
    final merged = <TripPlan>[];
    final seenIds = <String>{};
    for (final plan in [...uploaded, ...remainingRemote, ...stillPending]) {
      final cid = plan.clientId?.trim();
      if (remainingDeletes.contains(plan.id) ||
          (cid != null && remainingDeletes.contains(cid))) {
        continue;
      }
      if (seenIds.add(plan.id)) {
        merged.add(plan);
      }
    }
    return merged;
  }

  @override
  Future<Result<TripPlan>> create(TripPlan plan) async {
    final capturedUserId = _userId;
    final capturedEpoch = _sessionEpoch;
    final capturedScope = PlanLocalDataSource.scopeFor(capturedUserId);
    final remote = _remote;
    final capturedToken = remote?.currentToken;
    if (capturedUserId != null && remote != null) {
      late final TripPlan created;
      try {
        created = await remote.createPlan(
          plan,
          authToken: capturedToken,
          clientId: plan.clientId,
        );
      } on ApiException catch (error) {
        return Failure(error.toFailure());
      } catch (_) {
        return const Failure(
          NetworkFailure('Rencana gagal disimpan ke server. Coba lagi.'),
        );
      }

      if (!_isStaleSession(capturedEpoch, capturedUserId)) {
        try {
          final wrote = await _upsertLocal(created, scope: capturedScope);
          if (!wrote) {
            return const Failure(_localSyncError);
          }
        } catch (_) {
          return const Failure(_localSyncError);
        }
      }
      return Success(created);
    }

    try {
      final migrated = await _local.migrateLegacyIfNeeded();
      if (!migrated) {
        return const Failure(CacheFailure('Rencana gagal disimpan. Coba lagi.'));
      }
      final wrote = await _upsertLocal(plan, scope: capturedScope);
      if (!wrote) {
        return const Failure(CacheFailure('Rencana gagal disimpan. Coba lagi.'));
      }
      return Success(plan);
    } catch (_) {
      return const Failure(CacheFailure('Rencana gagal disimpan. Coba lagi.'));
    }
  }

  @override
  Future<Result<TripPlan>> update(TripPlan plan) {
    final capturedUserId = _userId;
    final capturedEpoch = _sessionEpoch;
    final capturedScope = PlanLocalDataSource.scopeFor(capturedUserId);
    final remote = _remote;
    final capturedToken = remote?.currentToken;

    return _enqueueScopeOp(capturedScope, () async {
      if (_isStaleSession(capturedEpoch, capturedUserId)) {
        return const Failure(CacheFailure('Sesi akun berubah.'));
      }

      if (capturedUserId != null && remote != null) {
        late final List<TripPlan> pending;
        try {
          pending = _local.readPendingMigration(capturedScope);
        } catch (_) {
          return const Failure(_localReadError);
        }
        final isPending = pending.any((p) => p.id == plan.id);
        if (isPending) {
          try {
            final nextPending = [
              for (final item in pending)
                if (item.id == plan.id) plan else item,
            ];
            final wrotePending = await _local.writePendingMigration(
              capturedScope,
              nextPending,
            );
            if (!wrotePending) {
              return const Failure(
                CacheFailure(
                  'Perubahan rencana gagal disimpan. Coba lagi.',
                  code: 'local_cache_sync_failed',
                ),
              );
            }
            final markedDirty = await _local.markPendingDirty(
              capturedScope,
              plan.id,
            );
            if (!markedDirty) {
              return const Failure(
                CacheFailure(
                  'Perubahan rencana gagal disimpan. Coba lagi.',
                  code: 'local_cache_sync_failed',
                ),
              );
            }
            final wroteLocal = await _upsertLocal(plan, scope: capturedScope);
            if (!wroteLocal) {
              return const Failure(
                CacheFailure(
                  'Perubahan rencana gagal disimpan. Coba lagi.',
                  code: 'local_cache_sync_failed',
                ),
              );
            }
          } catch (_) {
            return const Failure(
              CacheFailure(
                'Perubahan rencana gagal disimpan. Coba lagi.',
                code: 'local_cache_sync_failed',
              ),
            );
          }

          TripPlan? resolved;
          ApiException? tombstoneError;
          try {
            final result = await remote.createPlanWithMeta(
              plan,
              authToken: capturedToken,
              clientId: plan.id,
            );
            if (_isStaleSession(capturedEpoch, capturedUserId)) {
              return const Failure(CacheFailure('Sesi akun berubah.'));
            }
            var next = result.plan;
            if (result.replayed) {
              next = await remote.updatePlan(
                plan.copyWith(
                  id: result.plan.id,
                  clientId: result.plan.clientId ?? plan.id,
                ),
                authToken: capturedToken,
              );
              if (_isStaleSession(capturedEpoch, capturedUserId)) {
                return const Failure(CacheFailure('Sesi akun berubah.'));
              }
            }
            resolved = next;
          } on ApiException catch (error) {
            if (_isClientDeletedTombstone(error)) {
              tombstoneError = error;
            } else {
              return Success(plan);
            }
          } catch (_) {
            // Remain safely in per-account pending + dirty queues without
            // sending non-UUID PATCH requests.
            return Success(plan);
          }

          if (tombstoneError != null) {
            try {
              final marked = await _local.markMigrated(capturedScope, plan.id);
              final clearedDirty = await _local.clearPendingDirty(
                capturedScope,
                plan.id,
              );
              if (!marked || !clearedDirty) {
                return const Failure(_localSyncError);
              }
              final remaining = _local
                  .readPendingMigration(capturedScope)
                  .where((p) => p.id != plan.id)
                  .toList(growable: false);
              final clearedPending = await _local.writePendingMigration(
                capturedScope,
                remaining,
              );
              final removedLocal = await _removeLocal(
                plan.id,
                scope: capturedScope,
              );
              if (!clearedPending || !removedLocal) {
                return const Failure(_localSyncError);
              }
            } catch (_) {
              return const Failure(_localSyncError);
            }
            return Failure(
              NetworkFailure(
                tombstoneError.message.isNotEmpty
                    ? tombstoneError.message
                    : 'Rencana ini sudah dihapus.',
                code: 'PLAN_CLIENT_DELETED',
              ),
            );
          }

          try {
            final marked = await _local.markMigrated(capturedScope, plan.id);
            final clearedDirty = await _local.clearPendingDirty(
              capturedScope,
              plan.id,
            );
            if (!marked || !clearedDirty) {
              return const Failure(_localSyncError);
            }
            final remaining = _local
                .readPendingMigration(capturedScope)
                .where((p) => p.id != plan.id)
                .toList(growable: false);
            final clearedPending = await _local.writePendingMigration(
              capturedScope,
              remaining,
            );
            if (!clearedPending) {
              return const Failure(_localSyncError);
            }
            final removedOld = await _removeLocal(
              plan.id,
              scope: capturedScope,
            );
            final upsertedNew = await _upsertLocal(
              resolved!,
              scope: capturedScope,
            );
            if (!removedOld || !upsertedNew) {
              return const Failure(_localSyncError);
            }
            return Success(resolved);
          } catch (_) {
            return const Failure(_localSyncError);
          }
        }

        late final TripPlan? migratedMatch;
        try {
          migratedMatch = (_local.read(scope: capturedScope) ?? const [])
              .cast<TripPlan?>()
              .firstWhere(
                (p) => p?.clientId?.trim() == plan.id && p?.id != plan.id,
                orElse: () => null,
              );
        } catch (_) {
          return const Failure(_localReadError);
        }
        final targetPlan = migratedMatch == null
            ? plan
            : plan.copyWith(
                id: migratedMatch.id,
                clientId: migratedMatch.clientId ?? plan.id,
              );

        late final TripPlan updated;
        try {
          updated = await remote.updatePlan(
            targetPlan,
            authToken: capturedToken,
          );
        } on ApiException catch (error) {
          return Failure(error.toFailure());
        } catch (_) {
          return const Failure(
            NetworkFailure('Perubahan rencana gagal disimpan. Coba lagi.'),
          );
        }

        if (!_isStaleSession(capturedEpoch, capturedUserId)) {
          try {
            final wrote = await _upsertLocal(updated, scope: capturedScope);
            if (!wrote) {
              return const Failure(_localSyncError);
            }
          } catch (_) {
            return const Failure(_localSyncError);
          }
        }
        return Success(updated);
      }

      try {
        final migrated = await _local.migrateLegacyIfNeeded();
        if (!migrated) {
          return const Failure(
            CacheFailure('Rencana gagal disimpan. Coba lagi.'),
          );
        }
        final wrote = await _upsertLocal(plan, scope: capturedScope);
        if (!wrote) {
          return const Failure(
            CacheFailure('Rencana gagal disimpan. Coba lagi.'),
          );
        }
        return Success(plan);
      } catch (_) {
        return const Failure(
          CacheFailure('Rencana gagal disimpan. Coba lagi.'),
        );
      }
    });
  }

  @override
  Future<Result<void>> delete(String id) {
    final capturedUserId = _userId;
    final capturedEpoch = _sessionEpoch;
    final capturedScope = PlanLocalDataSource.scopeFor(capturedUserId);
    final remote = _remote;
    final capturedToken = remote?.currentToken;

    return _enqueueScopeOp(capturedScope, () async {
      if (_isStaleSession(capturedEpoch, capturedUserId)) {
        return const Failure(CacheFailure('Sesi akun berubah.'));
      }

      if (capturedUserId != null && remote != null) {
        late final List<TripPlan> pending;
        try {
          pending = _local.readPendingMigration(capturedScope);
        } catch (_) {
          return const Failure(_localReadError);
        }
        final isPending = pending.any((p) => p.id == id);
        if (isPending) {
          try {
            final addedDelete = await _local.addPendingDeleteId(
              capturedScope,
              id,
            );
            if (!addedDelete) {
              return const Failure(
                CacheFailure(
                  'Rencana gagal dihapus. Coba lagi.',
                  code: 'local_cache_sync_failed',
                ),
              );
            }
            final remaining = pending
                .where((p) => p.id != id)
                .toList(growable: false);
            final wrotePending = await _local.writePendingMigration(
              capturedScope,
              remaining,
            );
            if (!wrotePending) {
              return const Failure(
                CacheFailure(
                  'Rencana gagal dihapus. Coba lagi.',
                  code: 'local_cache_sync_failed',
                ),
              );
            }
            final clearedDirty = await _local.clearPendingDirty(
              capturedScope,
              id,
            );
            if (!clearedDirty) {
              return const Failure(
                CacheFailure(
                  'Rencana gagal dihapus. Coba lagi.',
                  code: 'local_cache_sync_failed',
                ),
              );
            }
            final removedLocal = await _removeLocal(id, scope: capturedScope);
            if (!removedLocal) {
              return const Failure(
                CacheFailure(
                  'Rencana gagal dihapus. Coba lagi.',
                  code: 'local_cache_sync_failed',
                ),
              );
            }
          } catch (_) {
            return const Failure(
              CacheFailure(
                'Rencana gagal dihapus. Coba lagi.',
                code: 'local_cache_sync_failed',
              ),
            );
          }

          var deletedOnServer = false;
          try {
            await remote.deletePlanByClientId(id, authToken: capturedToken);
            deletedOnServer = true;
          } catch (_) {
            // Keep id in pending_delete so next load() sends DELETE /plans/client/:clientId.
          }
          if (!deletedOnServer) {
            return const Success(null);
          }
          if (_isStaleSession(capturedEpoch, capturedUserId)) {
            return const Success(null);
          }

          try {
            final marked = await _local.markMigrated(capturedScope, id);
            if (!marked) {
              return const Failure(_localSyncError);
            }
            final removedDel = await _local.removePendingDeleteId(
              capturedScope,
              id,
            );
            if (!removedDel) {
              return const Failure(_localSyncError);
            }
          } catch (_) {
            return const Failure(_localSyncError);
          }
          return const Success(null);
        }

        late final TripPlan? migratedMatch;
        try {
          migratedMatch = (_local.read(scope: capturedScope) ?? const [])
              .cast<TripPlan?>()
              .firstWhere(
                (p) => p?.clientId?.trim() == id && p?.id != id,
                orElse: () => null,
              );
        } catch (_) {
          return const Failure(_localReadError);
        }
        final targetId = migratedMatch?.id ?? id;

        try {
          await remote.deletePlan(targetId, authToken: capturedToken);
        } on ApiException catch (error) {
          return Failure(error.toFailure());
        } catch (_) {
          return const Failure(
            NetworkFailure('Rencana gagal dihapus dari server. Coba lagi.'),
          );
        }

        if (!_isStaleSession(capturedEpoch, capturedUserId)) {
          try {
            final removed = await _removeLocal(
              targetId,
              scope: capturedScope,
            );
            if (!removed) {
              return const Failure(_localSyncError);
            }
          } catch (_) {
            return const Failure(_localSyncError);
          }
        }
        return const Success(null);
      }

      try {
        final migrated = await _local.migrateLegacyIfNeeded();
        if (!migrated) {
          return const Failure(
            CacheFailure('Rencana gagal dihapus. Coba lagi.'),
          );
        }
        final removed = await _removeLocal(id, scope: capturedScope);
        if (!removed) {
          return const Failure(
            CacheFailure('Rencana gagal dihapus. Coba lagi.'),
          );
        }
        return const Success(null);
      } catch (_) {
        return const Failure(
          CacheFailure('Rencana gagal dihapus. Coba lagi.'),
        );
      }
    });
  }

  Future<bool> _upsertLocal(TripPlan plan, {required String scope}) {
    final plans = _local.read(scope: scope) ?? [];
    final index = plans.indexWhere((item) => item.id == plan.id);
    final updated = [...plans];
    if (index >= 0) {
      updated[index] = plan;
    } else {
      updated.insert(0, plan);
    }
    return _local.write(updated, scope: scope);
  }

  Future<bool> _removeLocal(String id, {required String scope}) {
    final plans = _local.read(scope: scope) ?? [];
    final updated = plans.where((plan) => plan.id != id).toList();
    return _local.write(updated, scope: scope);
  }
}
