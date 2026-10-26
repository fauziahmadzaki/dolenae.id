import 'package:drift/drift.dart';

import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/destinations/data/mappers/destination_cache_mapper.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination_catalog.dart';

/// Local cache for destinations. Only this class touches Drift.
class DestinationLocalDataSource {
  DestinationLocalDataSource(this._db);

  final AppDatabase _db;

  /// Emits again after each complete write transaction.
  Stream<DestinationCatalog> watch() {
    final query = _db.select(_db.cachedDestinations)
      ..orderBy([(table) => OrderingTerm(expression: table.sortOrder)]);

    return query.watch().map((rows) {
      final items = rows.map(DestinationCacheMapper.toDomain).toList();
      final lastFetched = rows.isEmpty
          ? null
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
      if (rows.isEmpty) return;
      await _db.batch((batch) {
        batch.insertAll(_db.cachedDestinations, rows);
      });
    });
  }
}
