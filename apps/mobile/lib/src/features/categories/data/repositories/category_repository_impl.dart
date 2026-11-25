import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/categories/data/data_sources/category_local_data_source.dart';
import 'package:dolenae_mobile/src/features/categories/data/data_sources/category_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/categories/domain/entities/category.dart';
import 'package:dolenae_mobile/src/features/categories/domain/repositories/category_repository.dart';

class CategoryRepositoryImpl implements CategoryRepository {
  CategoryRepositoryImpl(this._remote, this._local);
  final CategoryRemoteDataSource _remote;
  final CategoryLocalDataSource _local;
  List<Category>? _memory;
  @override
  List<Category>? get cachedItems => _memory ?? _local.read()?.items;
  @override
  bool get hasCache => _memory != null || _local.hasCache;

  @override
  Future<Result<List<Category>>> load({bool refresh = false}) async {
    final cache = _local.read();
    final age = cache == null
        ? null
        : DateTime.now().toUtc().difference(cache.fetchedAt);
    if (!refresh &&
        age != null &&
        !age.isNegative &&
        age < const Duration(hours: 24)) {
      return Success(cache!.items);
    }
    try {
      final items = await _remote.fetchAll();
      _memory = items;
      try {
        await _local.write(items, DateTime.now().toUtc());
      } catch (_) {
        // Data API tetap tersedia saat penyimpanan perangkat gagal.
      }
      return Success(items);
    } on ApiException catch (error) {
      final items = cachedItems;
      if (items != null) return Success(items);
      return Failure(
        NetworkFailure(
          error.message,
          code: error.statusCode == null ? 'CATEGORY_OFFLINE' : 'CATEGORY_API',
        ),
      );
    } on FormatException {
      final items = cachedItems;
      return items != null
          ? Success(items)
          : const Failure(
              ValidationFailure('Data kategori dari server tidak valid.'),
            );
    } catch (_) {
      final items = cachedItems;
      return items != null
          ? Success(items)
          : const Failure(UnknownFailure('Kategori belum dapat dimuat.'));
    }
  }
}
