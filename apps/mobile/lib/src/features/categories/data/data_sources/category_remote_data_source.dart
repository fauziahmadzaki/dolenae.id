import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/categories/data/models/category_model.dart';
import 'package:dolenae_mobile/src/features/categories/domain/entities/category.dart';

class CategoryRemoteDataSource {
  const CategoryRemoteDataSource(this._client);
  final ApiClient _client;

  Future<List<Category>> fetchAll() async {
    final items = <Category>[];
    final ids = <String>{};
    int? expectedTotal;
    int? expectedPages;
    for (var page = 1; ; page++) {
      final response = await _client.get(
        '/categories',
        query: {'page': '$page', 'limit': '100'},
      );
      final data = response['data'];
      final meta = response['meta'];
      if (data is! List ||
          meta is! Map ||
          meta['page'] != page ||
          meta['limit'] is! int ||
          (meta['limit'] as int) < 1 ||
          meta['total'] is! int ||
          (meta['total'] as int) < 0 ||
          meta['totalPages'] is! int ||
          (meta['totalPages'] as int) < 1 ||
          meta['hasNext'] is! bool) {
        throw const FormatException('Respons kategori tidak valid.');
      }
      final total = meta['total'] as int;
      final pages = meta['totalPages'] as int;
      final limit = meta['limit'] as int;
      final calculatedPages = total == 0 ? 1 : (total / limit).ceil();
      if (pages != calculatedPages ||
          page > pages ||
          meta['hasNext'] != (page < pages) ||
          (expectedTotal != null && total != expectedTotal) ||
          (expectedPages != null && pages != expectedPages) ||
          data.length > limit ||
          (page < pages && data.length != limit)) {
        throw const FormatException('Pagination kategori tidak valid.');
      }
      expectedTotal = total;
      expectedPages = pages;
      for (final row in data) {
        if (row is! Map<String, dynamic>) {
          throw const FormatException('Kategori tidak valid.');
        }
        final item = CategoryModel.fromJson(row);
        if (!ids.add(item.id)) {
          throw const FormatException('ID kategori duplikat.');
        }
        items.add(item);
      }
      if (page == pages) {
        if (items.length != total) {
          throw const FormatException('Jumlah kategori tidak valid.');
        }
        return List.unmodifiable(items);
      }
    }
  }
}
