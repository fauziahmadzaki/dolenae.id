import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/saved/data/models/saved_destination_model.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';

/// Remote data source untuk destinasi tersimpan (`/saved-destinations`).
class SavedDestinationRemoteDataSource {
  SavedDestinationRemoteDataSource(this._client);

  final ApiClient _client;

  String? get currentToken => _client.token;

  Future<List<SavedDestination>> fetchSavedDestinations({
    String? authToken,
  }) async {
    final body = await _client.get('/saved-destinations', bearerToken: authToken);
    final data = body['data'];
    if (data is! List) {
      throw const ApiException('Respons daftar destinasi tersimpan tidak dikenali.');
    }
    return data
        .whereType<Map>()
        .map((item) => SavedDestinationModel.fromJson(item.cast<String, dynamic>()))
        .whereType<SavedDestination>()
        .toList(growable: false);
  }

  Future<SavedDestination> saveDestination(
    String destinationId, {
    String? authToken,
  }) async {
    final body = await _client.put(
      '/saved-destinations/${Uri.encodeComponent(destinationId)}',
      bearerToken: authToken,
    );
    final data = body['data'];
    if (data is! Map) {
      throw const ApiException('Respons simpan destinasi tidak dikenali.');
    }
    final parsed = SavedDestinationModel.fromJson(data.cast<String, dynamic>());
    if (parsed == null) {
      throw const ApiException('Data destinasi tersimpan tidak valid.');
    }
    return parsed;
  }

  Future<void> removeDestination(
    String destinationId, {
    String? authToken,
  }) async {
    await _client.delete(
      '/saved-destinations/${Uri.encodeComponent(destinationId)}',
      bearerToken: authToken,
    );
  }
}
