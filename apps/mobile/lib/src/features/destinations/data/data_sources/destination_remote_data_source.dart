import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/destinations/data/models/destination_model.dart';

/// Endpoint katalog destinasi (`/destinations`).
class DestinationRemoteDataSource {
  DestinationRemoteDataSource(this._client);

  final ApiClient _client;

  Future<List<DestinationModel>> fetchPublished({int limit = 50}) async {
    final models = <DestinationModel>[];
    final ids = <String>{};
    int? total;
    for (var page = 1; ; page++) {
      final body = await _client.get(
        '/destinations',
        query: {
          'status': 'published',
          'limit': '$limit',
          'page': '$page',
          'sort': 'id',
          'order': 'asc',
        },
      );
      final data = body['data'];
      final meta = body['meta'];
      if (data is! List ||
          meta is! Map ||
          meta['total'] is! int ||
          (meta['total'] as int) < 0 ||
          meta['page'] != page ||
          meta['limit'] != limit) {
        throw const ApiException('Respons destinasi tidak dikenali.');
      }
      total ??= meta['total'] as int;
      final totalPages = total == 0 ? 1 : (total / limit).ceil();
      final expected = page < totalPages ? limit : total - (page - 1) * limit;
      if (meta['total'] != total ||
          meta['totalPages'] != totalPages ||
          meta['hasNext'] != (page < totalPages) ||
          meta['hasPrev'] != (page > 1) ||
          data.length != expected) {
        throw const ApiException(
          'Katalog berubah atau respons tidak lengkap. Coba lagi.',
        );
      }
      for (final item in data) {
        if (item is! Map<String, dynamic> ||
            item['id'] is! String ||
            (item['id'] as String).trim().isEmpty ||
            item['name'] is! String ||
            (item['name'] as String).trim().isEmpty ||
            item['slug'] is! String ||
            (item['slug'] as String).trim().isEmpty ||
            item['status'] != 'published' ||
            !ids.add(item['id'] as String)) {
          throw const ApiException('Respons destinasi tidak dikenali.');
        }
        models.add(DestinationModel(item));
      }
      if (page == totalPages) return models;
    }
  }
}
