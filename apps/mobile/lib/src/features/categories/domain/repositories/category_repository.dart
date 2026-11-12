import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/categories/domain/entities/category.dart';

abstract interface class CategoryRepository {
  List<Category>? get cachedItems;
  bool get hasCache;
  Future<Result<List<Category>>> load({bool refresh = false});
}
