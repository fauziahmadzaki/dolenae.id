import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';

abstract interface class RouteRepository {
  Future<Result<RouteGraph>> graph(String destinationId);
  Future<Result<RouteProfile>> profile(String routeId);
}
