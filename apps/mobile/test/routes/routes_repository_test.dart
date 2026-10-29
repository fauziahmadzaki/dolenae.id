import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/features/routes/data/repositories/route_repository_impl.dart';
import 'routes_model_test.dart' show graphJson, profileJson;

void main() {
  test('repository uses public paths, unwraps real envelopes, encodes IDs', () async {
    final paths = <String>[];
    final repository = RouteRepositoryImpl(ApiClient(baseUrl: 'https://example.test/api', httpClient: MockClient((r) async {
      paths.add(r.url.path);
      return http.Response(jsonEncode({'success': true, 'data': r.url.path.endsWith('profile') ? profileJson() : graphJson()}), 200);
    })));
    expect((await repository.graph('d')).valueOrNull!.routes.single.id, 'r');
    expect((await repository.profile('r')).valueOrNull!.routeId, 'r');
    expect(paths, ['/api/public/destinations/d/route-graph', '/api/public/routes/r/profile']);
  });
  test('repository returns failure on malformed, offline, unavailable; no fake data', () async {
    for (final status in [200, 404, 500]) {
      final repository = RouteRepositoryImpl(ApiClient(httpClient: MockClient((_) async => http.Response(jsonEncode({'success': status == 200, 'data': {}, 'error': {'message': 'Tidak tersedia'}}), status))));
      expect((await repository.graph('d')).isFailure, isTrue);
    }
    final repository = RouteRepositoryImpl(ApiClient(httpClient: MockClient((_) async => throw http.ClientException('offline'))));
    expect((await repository.profile('r')).failureOrNull, isA<NetworkFailure>());
    expect((await repository.graph('')).failureOrNull, isA<ValidationFailure>());
  });
}
