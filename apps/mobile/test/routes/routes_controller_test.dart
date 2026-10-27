import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/routes/domain/entities/route_graph.dart';
import 'package:dolenae_mobile/src/features/routes/domain/repositories/route_repository.dart';
import 'package:dolenae_mobile/src/features/routes/data/models/route_model.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/controllers/routes_controller.dart';
import 'routes_model_test.dart' show graphJson, routeJson, profileJson;

class PendingRoutes implements RouteRepository {
  final graphs = <String, Completer<Result<RouteGraph>>>{};
  final profiles = <String, Completer<Result<RouteProfile>>>{};
  @override
  Future<Result<RouteGraph>> graph(String id) => (graphs[id] = Completer()).future;
  @override
  Future<Result<RouteProfile>> profile(String id) => (profiles[id] = Completer()).future;
}
void main() {
  test('destination switch ignores stale graph and profile, disposal safe', () async {
    final repo = PendingRoutes(); final c = RoutesController(repo);
    final old = c.loadDestination('old');
    final current = c.loadDestination('d');
    expect(c.graphLoading, isTrue);
    repo.graphs['d']!.complete(Success(RouteGraphModel.fromJson(graphJson())));
    await current;
    expect(c.selectedRoute!.id, 'r'); expect(c.profileLoading, isTrue);
    repo.graphs['old']!.complete(const Failure(NetworkFailure('old')));
    await old; expect(c.graphFailure, isNull); expect(c.destinationId, 'd');
    final next = c.loadDestination('new');
    repo.profiles['r']!.complete(Success(RouteProfileModel.fromJson(profileJson())));
    await Future<void>.delayed(Duration.zero);
    expect(c.profile, isNull);
    c.dispose();
    repo.graphs['new']!.complete(Success(RouteGraphModel.fromJson(graphJson())));
    await next;
  });
  test('selection ignores stale profile and reports error, retry, empty', () async {
    final repo = PendingRoutes(); final c = RoutesController(repo); addTearDown(c.dispose);
    final load = c.loadDestination('d');
    final graph = {'nodes': [], 'segments': [], 'routes': [
      routeJson(id: 'a', status: 'terverifikasi'),
      routeJson(id: 'b', status: 'alternatif'),
    ]};
    repo.graphs['d']!.complete(Success(RouteGraphModel.fromJson(graph))); await load;
    expect(c.selectedRoute!.id, 'a');
    final selected = c.selectRoute('b');
    repo.profiles['a']!.complete(Success(RouteProfileModel.fromJson(profileJson(id: 'a'))));
    await Future<void>.delayed(Duration.zero); expect(c.profile, isNull);
    repo.profiles['b']!.complete(const Failure(NetworkFailure('Gagal profil'))); await selected;
    expect(c.profileFailure!.message, 'Gagal profil');
    final retry = c.selectRoute('b');
    repo.profiles['b']!.complete(Success(RouteProfileModel.fromJson(profileJson(id: 'b')))); await retry;
    expect(c.profile!.routeId, 'b'); expect(c.profileLoading, isFalse);
    await c.selectRoute('missing'); expect(c.selectedRoute!.id, 'b');
    final empty = c.loadDestination('empty');
    repo.graphs['empty']!.complete(const Success(RouteGraph(nodes: [], segments: [], routes: []))); await empty;
    expect(c.graph!.routes, isEmpty); expect(c.selectedRoute, isNull); expect(c.profile, isNull);
  });
}
