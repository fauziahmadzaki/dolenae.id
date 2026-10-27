import 'package:drift/drift.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';

import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/destinations/data/mappers/destination_cache_mapper.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination_catalog.dart';

/// Local cache for destinations. Only this class touches Drift.
class DestinationLocalDataSource {
  DestinationLocalDataSource(this._db, this._prefs);

  final SharedPreferences _prefs;
  static const _fetchedKey = 'dolenae.destinations.last_fetched.v1';

  final AppDatabase _db;

  /// Emits again after each complete write transaction.
  Stream<DestinationCatalog> watch() {
    final query = _db.select(_db.cachedDestinations)
      ..orderBy([(table) => OrderingTerm(expression: table.sortOrder)]);

    return query.watch().map((rows) {
      final items = rows.map(DestinationCacheMapper.toDomain).toList();
      final lastFetched = rows.isEmpty
          ? (_prefs.getInt(_fetchedKey) == null
                ? null
                : DateTime.fromMillisecondsSinceEpoch(
                    _prefs.getInt(_fetchedKey)!,
                    isUtc: true,
                  ))
          : DateTime.fromMillisecondsSinceEpoch(
              rows.first.lastFetched,
              isUtc: true,
            );
      return DestinationCatalog(
        items: List.unmodifiable(items),
        lastFetched: lastFetched,
      );
    });
  }

  /// Replaces the whole cache in one transaction so readers never see a
  /// half-written list.
  Future<void> replaceAll(
    List<CachedDestinationsCompanion> rows, {
    required int fetchedAt,
  }) {
    return _db.transaction(() async {
      await _db.delete(_db.cachedDestinations).go();
      if (rows.isNotEmpty) {
        await _db.batch((batch) {
          batch.insertAll(_db.cachedDestinations, rows);
        });
      }
      if (!await _prefs.setInt(_fetchedKey, fetchedAt)) {
        throw const CacheFailure('Gagal menyimpan katalog destinasi.');
      }
    });
  }
}
