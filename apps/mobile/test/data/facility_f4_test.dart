import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/facilities/data/repositories/facility_repository_impl.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';

Map<String, dynamic> support(String id, String destination, {String category = 'accommodation'}) => {
  'id': id, 'destinationId': destination, 'name': id, 'category': category,
  'description': null, 'locationLabel': null, 'priceLabel': null,
  'verified': false, 'relatedDestinationName': 'Destinasi API',
};
http.Response page(List<Object> rows, {int number = 1, int total = 1, int pages = 1}) => http.Response(jsonEncode({
  'success': true, 'data': rows,
  'meta': {'page': number, 'limit': 100, 'total': total, 'totalPages': pages, 'hasNext': number < pages},
}), 200);
FacilityRepositoryImpl repository(SharedPreferences prefs, Future<http.Response> Function(http.Request) handler) => FacilityRepositoryImpl(
  api: ApiClient(baseUrl: 'https://example.test/api', httpClient: MockClient(handler)), preferences: prefs,
);
void main() {
  test('F4 persists valid empty and partial refresh preserves old snapshot', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    await repository(prefs, (_) async => page([] , total: 0)).list('empty');
    final offline = repository(prefs, (_) async => throw http.ClientException('offline'));
    expect((await offline.list('empty')).valueOrNull, isEmpty);
    await repository(prefs, (_) async => page([support('old', 'dest')])).list('dest');
    final partial = repository(prefs, (request) async => request.url.queryParameters['page'] == '1'
      ? page([support('new', 'dest')], total: 2, pages: 2)
      : throw http.ClientException('offline'));
    expect((await partial.list('dest')).valueOrNull!.single.id, 'old');
    expect((await offline.list('dest')).valueOrNull!.single.id, 'old');
  });
  test('F4 list 404 invalidates cache rather than serving stale rows', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    await repository(prefs, (_) async => page([support('old', 'dest')])).list('dest');
    final missing = repository(prefs, (_) async => http.Response('{"success":false}', 404));
    expect((await missing.list('dest')).failureOrNull?.code, '404');
    final offline = repository(prefs, (_) async => throw http.ClientException('offline'));
    expect((await offline.list('dest')).isFailure, true);
  });
  test('F4 detail fetch exact ID and 404 invalidates detail and containing list', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    final repo = repository(prefs, (request) async {
      if (request.url.path == '/api/supports/real') return http.Response(jsonEncode({'success':true, 'data':support('real', 'dest', category: 'transport')}), 200);
      return page([support('real', 'dest')]);
    });
    await repo.list('dest');
    expect((await repo.getById('real')).valueOrNull!.category, SupportCategory.transportasi);
    final offline = repository(prefs, (_) async => throw http.ClientException('offline'));
    expect((await offline.getById('real')).valueOrNull!.id, 'real');
    expect((await offline.getById('unknown')).isFailure, true);
    final missing = repository(prefs, (_) async => http.Response('{"success":false}', 404));
    expect((await missing.getById('real')).failureOrNull?.code, '404');
    expect((await offline.getById('real')).isFailure, true);
    expect((await offline.list('dest')).isFailure, true);
  });
  test('F4 rejects cross-destination and unknown category data', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    expect((await repository(prefs, (_) async => page([support('bad', 'other')])).list('dest')).isFailure, true);
    expect((await repository(prefs, (_) async => page([support('bad', 'dest', category: 'unknown')])).list('dest')).isFailure, true);
  });
  TestWidgetsFlutterBinding.ensureInitialized();
  test('F4 fetch maps nullable fields honestly and replaces only complete pagination', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    final paths = <String>[];
    final repo = repository(prefs, (request) async {
      paths.add(request.url.toString());
      return request.url.queryParameters['page'] == '1'
          ? page([support('a', 'dest')], total: 2, pages: 2)
          : page([support('b', 'dest', category: 'food')], number: 2, total: 2, pages: 2);
    });
    final result = await repo.list('dest');
    expect(result.isSuccess, true);
    final rows = result.valueOrNull!;
    expect(rows.map((e) => e.id), ['a', 'b']);
    expect(rows.first.category, SupportCategory.penginapan);
    expect(rows.last.category, SupportCategory.makanan);
    expect(rows.first.description, '');
    expect(rows.first.priceLabel, '');
    expect(rows.first.destinationId, 'dest');
    expect(paths, ['https://example.test/api/destinations/dest/supports?page=1&limit=100', 'https://example.test/api/destinations/dest/supports?page=2&limit=100']);
    final offline = repository(prefs, (_) async => throw http.ClientException('offline'));
    expect((await offline.list('dest')).valueOrNull!.length, 2);
    expect((await offline.list('other')).isFailure, true);
  });
}
