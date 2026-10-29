import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/routes/data/models/route_model.dart';
import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';
import 'package:dolenae_mobile/src/features/routes/domain/repositories/route_repository.dart';

class RouteRepositoryImpl implements RouteRepository {
  RouteRepositoryImpl(this._api);
  final ApiClient _api;

  @override
  Future<Result<RouteGraph>> graph(String destinationId) => _load(destinationId,
    '/public/destinations/${Uri.encodeComponent(destinationId)}/route-graph', RouteGraphModel.fromJson);

  @override
  Future<Result<RouteProfile>> profile(String routeId) async {
    final result = await _load(routeId, '/public/routes/${Uri.encodeComponent(routeId)}/profile', RouteProfileModel.fromJson);
    if (result.valueOrNull case final profile? when profile.routeId != routeId) {
      return const Failure(ValidationFailure('Profil jalur tidak sesuai.'));
    }
    return result;
  }

  Future<Result<T>> _load<T>(String id, String path, T Function(Object?) parse) async {
    if (id.trim().isEmpty) return const Failure(ValidationFailure('ID jalur atau destinasi wajib diisi.'));
    try {
      final response = await _api.get(path);
      return Success(parse(response['data']));
    } on ApiException catch (error) {
      return Failure(error.toFailure());
    } on FormatException {
      return const Failure(ValidationFailure('Data jalur dari server tidak valid.'));
    } catch (_) {
      return const Failure(UnknownFailure('Jalur belum dapat dimuat. Coba lagi.'));
    }
  }
}
