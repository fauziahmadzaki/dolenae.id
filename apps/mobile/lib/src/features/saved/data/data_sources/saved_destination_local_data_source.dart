import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/features/saved/data/models/saved_destination_model.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';

/// Cache lokal destinasi tersimpan per akun (`saved.destinations.v1.<scope>`).
class SavedDestinationLocalDataSource {
  SavedDestinationLocalDataSource(this._prefs);

  static const _storagePrefix = 'saved.destinations.v1.';
  static const _guestScope = 'guest';

  final SharedPreferences _prefs;

  static String scopeFor(String? userId) {
    final trimmed = userId?.trim();
    return (trimmed == null || trimmed.isEmpty) ? _guestScope : trimmed;
  }

  String _keyFor(String scope) => '$_storagePrefix${scopeFor(scope)}';

  List<SavedDestination>? read({required String scope}) {
    try {
      final raw = _prefs.getString(_keyFor(scope));
      if (raw == null || raw.isEmpty) return null;
      final decoded = jsonDecode(raw);
      if (decoded is! List) return null;
      final items = <SavedDestination>[];
      for (final entry in decoded) {
        try {
          if (entry is! Map) continue;
          final map = <String, dynamic>{};
          var validKeys = true;
          for (final kv in entry.entries) {
            if (kv.key is! String) {
              validKeys = false;
              break;
            }
            map[kv.key as String] = kv.value;
          }
          if (!validKeys) continue;
          final parsed = SavedDestinationModel.fromJson(map);
          if (parsed != null) items.add(parsed);
        } catch (_) {
          continue;
        }
      }
      return items;
    } catch (_) {
      return null;
    }
  }

  Future<bool> write(
    List<SavedDestination> items, {
    required String scope,
  }) async {
    try {
      final raw = jsonEncode(
        items.map(SavedDestinationModel.toLocalJson).toList(growable: false),
      );
      return await _prefs.setString(_keyFor(scope), raw);
    } catch (_) {
      return false;
    }
  }

  Future<bool> clear({required String scope}) async {
    try {
      return await _prefs.remove(_keyFor(scope));
    } catch (_) {
      return false;
    }
  }
}
