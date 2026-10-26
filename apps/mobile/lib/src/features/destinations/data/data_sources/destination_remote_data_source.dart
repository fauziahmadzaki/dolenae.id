import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/destinations/data/models/destination_model.dart';

/// Endpoint katalog destinasi (`/destinations`).
class DestinationRemoteDataSource {
  DestinationRemoteDataSource(this._client);

  final ApiClient _client;

  Future<List<DestinationModel>> fetchPublished({int limit = 50}) async {
    final body = await _client.get(
      '/destinations',
      query: {'status': 'published', 'limit': '$limit'},
    );
    final data = body['data'];
    if (data is! List) {
      throw const ApiException('Respons destinasi tidak dikenali.');
    }
    return data
        .whereType<Map>()
        .map((item) => DestinationModel(item.cast<String, dynamic>()))
        .toList(growable: false);
  }
}
