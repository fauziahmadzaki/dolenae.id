import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_local_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination_catalog.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/repositories/destination_repository.dart';

class DestinationRepositoryImpl implements DestinationRepository {
  DestinationRepositoryImpl(this._remote, this._local);

  final DestinationRemoteDataSource _remote;
  final DestinationLocalDataSource _local;

  @override
  Stream<DestinationCatalog> watchCatalog() {
    return _local.watch();
  }

  @override
  Future<Result<void>> refresh() async {
    try {
      final models = await _remote.fetchPublished();
      final fetchedAt = DateTime.now().toUtc().millisecondsSinceEpoch;
      final rows = <CachedDestinationsCompanion>[];
      var order = 0;

      for (final model in models) {
        rows.add(
          model.toCacheCompanion(sortOrder: order++, fetchedAt: fetchedAt),
        );
      }

      await _local.replaceAll(rows, fetchedAt: fetchedAt);
      return const Success(null);
    } on ApiException catch (error) {
      return Failure(error.toFailure());
    } on CacheFailure catch (error) {
      return Failure(error);
    } catch (_) {
      return const Failure(
        UnknownFailure('Gagal memuat destinasi. Coba lagi.'),
      );
    }
  }
}
