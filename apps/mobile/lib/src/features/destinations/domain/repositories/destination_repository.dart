import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination_catalog.dart';

/// Catalog datasource for the app.
abstract interface class DestinationRepository {
  /// Emits cached destinations; falls back to seed data when the cache is empty.
  Stream<DestinationCatalog> watchCatalog();

  /// Fetches the published catalog and replaces the local cache.
  Future<Result<void>> refresh();
}
