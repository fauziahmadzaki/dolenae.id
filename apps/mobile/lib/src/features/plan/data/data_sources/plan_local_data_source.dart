import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/features/plan/data/models/plan_model.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';

/// Penyimpanan lokal daftar rencana per pengguna (`plan.list.v1.<userScope>`).
///
/// Menyaring entri seed prototipe lama (`engine == 'seed'` atau ID seed bawaan)
/// agar data contoh statis tidak pernah muncul kembali pada akun nyata.
class PlanLocalDataSource {
  PlanLocalDataSource(this._prefs);

  static const _legacyStorageKey = 'plan.list.v1';
  static const _storagePrefix = 'plan.list.v1.';
  static const _pendingPrefix = 'plan.pending.v1.';
  static const _pendingDirtyPrefix = 'plan.pending_dirty.v1.';
  static const _pendingDeletePrefix = 'plan.pending_delete.v1.';
  static const _pendingSeededPrefix = 'plan.pending_seeded.v1.';
  static const _migratedPrefix = 'plan.migrated.v1.';
  static const _guestScope = 'guest';
  static const Set<String> _legacySeedIds = {
    'plan-dieng-01',
    'plan-bromo-02',
    'plan-papandayan-03',
    'saved-plan-1',
    'saved-plan-2',
    'saved-plan-3',
  };

  final SharedPreferences _prefs;
  String _userScope = _guestScope;
  bool _legacyMigrated = false;

  static String scopeFor(String? userId) => _normalizeScope(userId);

  void setUserId(String? userId) {
    final next = _normalizeScope(userId);
    if (next == _userScope) return;
    _userScope = next;
  }

  String _storageKeyFor(String? scope) =>
      '$_storagePrefix${_normalizeScope(scope ?? _userScope)}';

  List<TripPlan>? read({String? scope}) {
    final normalized = _normalizeScope(scope ?? _userScope);
    final plans = _decodePlanList(_prefs.getString(_storageKeyFor(normalized)));
    if (normalized != _guestScope || !_prefs.containsKey(_legacyStorageKey)) {
      return plans;
    }
    final legacyPlans =
        _decodePlanList(_prefs.getString(_legacyStorageKey)) ??
        const <TripPlan>[];
    if (legacyPlans.isEmpty) return plans;
    final current = plans ?? const <TripPlan>[];
    final currentIds = current.map((p) => p.id).toSet();
    return [
      ...current,
      for (final p in legacyPlans)
        if (!currentIds.contains(p.id)) p,
    ];
  }

  Future<bool> write(List<TripPlan> plans, {String? scope}) async {
    final key = _storageKeyFor(scope);
    final raw = jsonEncode(
      plans.map(PlanModel.toLocalJson).toList(growable: false),
    );
    return _prefs.setString(key, raw);
  }

  List<TripPlan> readPendingMigration(String scope) {
    return _decodePlanList(
          _prefs.getString('$_pendingPrefix${_normalizeScope(scope)}'),
        ) ??
        const [];
  }

  Future<bool> writePendingMigration(String scope, List<TripPlan> plans) async {
    final key = '$_pendingPrefix${_normalizeScope(scope)}';
    if (plans.isEmpty) {
      if (!_prefs.containsKey(key)) return true;
      return _prefs.remove(key);
    }
    final raw = jsonEncode(
      plans.map(PlanModel.toLocalJson).toList(growable: false),
    );
    return _prefs.setString(key, raw);
  }

  Set<String> _readIdSet(String prefix, String scope) {
    final list = _prefs.getStringList('$prefix${_normalizeScope(scope)}');
    return list == null ? <String>{} : list.toSet();
  }

  Future<bool> _addIdToSet(String prefix, String scope, String id) {
    final key = '$prefix${_normalizeScope(scope)}';
    final ids = _readIdSet(prefix, scope)..add(id);
    return _prefs.setStringList(key, ids.toList());
  }

  Future<bool> _removeIdFromSet(String prefix, String scope, String id) async {
    final key = '$prefix${_normalizeScope(scope)}';
    final ids = _readIdSet(prefix, scope)..remove(id);
    if (ids.isEmpty) {
      if (!_prefs.containsKey(key)) return true;
      return _prefs.remove(key);
    }
    return _prefs.setStringList(key, ids.toList());
  }

  Set<String> readMigratedIds(String scope) =>
      _readIdSet(_migratedPrefix, scope);

  Future<bool> markMigrated(String scope, String planId) =>
      _addIdToSet(_migratedPrefix, scope, planId);

  Set<String> readPendingDirtyIds(String scope) =>
      _readIdSet(_pendingDirtyPrefix, scope);

  Future<bool> markPendingDirty(String scope, String planId) =>
      _addIdToSet(_pendingDirtyPrefix, scope, planId);

  Future<bool> clearPendingDirty(String scope, String planId) =>
      _removeIdFromSet(_pendingDirtyPrefix, scope, planId);

  Set<String> readPendingDeleteIds(String scope) =>
      _readIdSet(_pendingDeletePrefix, scope);

  Future<bool> addPendingDeleteId(String scope, String planId) =>
      _addIdToSet(_pendingDeletePrefix, scope, planId);

  Future<bool> removePendingDeleteId(String scope, String planId) =>
      _removeIdFromSet(_pendingDeletePrefix, scope, planId);

  bool hasSeededPendingMigration(String scope) =>
      _prefs.getBool('$_pendingSeededPrefix${_normalizeScope(scope)}') ?? false;

  Future<bool> markPendingMigrationSeeded(String scope) {
    return _prefs.setBool(
      '$_pendingSeededPrefix${_normalizeScope(scope)}',
      true,
    );
  }

  List<TripPlan>? _decodePlanList(String? raw) {
    if (raw == null || raw.isEmpty) return null;
    final decoded = jsonDecode(raw);
    if (decoded is! List) return null;
    final plans = <TripPlan>[];
    for (final item in decoded) {
      if (item is! Map) continue;
      final map = item.cast<String, dynamic>();
      if (_isLegacySeed(map)) continue;
      plans.add(PlanModel.fromJson(map));
    }
    return plans;
  }

  bool _isLegacySeed(Map<String, dynamic> map) {
    final engine = (map['engine'] as String?)?.trim().toLowerCase();
    final id = (map['id'] as String?)?.trim();
    return engine == 'seed' || (id != null && _legacySeedIds.contains(id));
  }

  /// Ownerless pre-upgrade `plan.list.v1` stays device-local under `guest`
  /// and is never auto-uploaded to authenticated accounts. Deletes the legacy
  /// key only after `guest` persistence returns true.
  Future<bool> migrateLegacyIfNeeded() async {
    if (_legacyMigrated) return true;
    final legacyRaw = _prefs.getString(_legacyStorageKey);
    if (legacyRaw == null || legacyRaw.isEmpty) {
      _legacyMigrated = true;
      return true;
    }

    final nonSeed = _decodePlanList(legacyRaw) ?? const [];
    if (nonSeed.isNotEmpty) {
      final guestKey = '$_storagePrefix$_guestScope';
      final existingGuest =
          _decodePlanList(_prefs.getString(guestKey)) ?? const <TripPlan>[];
      final existingIds = existingGuest.map((p) => p.id).toSet();
      final merged = [
        ...existingGuest,
        for (final plan in nonSeed)
          if (!existingIds.contains(plan.id)) plan,
      ];
      final encoded = jsonEncode(
        merged.map(PlanModel.toLocalJson).toList(growable: false),
      );
      final wrote = await _prefs.setString(guestKey, encoded);
      if (!wrote) return false;
    }
    final removed = await _prefs.remove(_legacyStorageKey);
    if (!removed) return false;
    _legacyMigrated = true;
    return true;
  }

  static String _normalizeScope(String? userId) {
    final trimmed = userId?.trim();
    if (trimmed == null || trimmed.isEmpty) return _guestScope;
    return trimmed;
  }
}
