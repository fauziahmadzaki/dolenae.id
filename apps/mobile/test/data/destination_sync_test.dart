import 'dart:convert';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_remote_data_source.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:drift/native.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_local_data_source.dart';
import 'package:dolenae_mobile/src/features/destinations/data/repositories/destination_repository_impl.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

Map<String, dynamic> item(int id) => {
  'id': 'id-$id',
  'name': 'Destinasi $id',
  'slug': 'destinasi-$id',
  'status': 'published',
};
Map<String, dynamic> page(
  List<Object?> data, {
  int current = 1,
  int total = 0,
  int limit = 50,
}) => {
  'success': true,
  'data': data,
  'meta': {
    'page': current,
    'limit': limit,
    'total': total,
    'totalPages': total == 0 ? 1 : (total / limit).ceil(),
    'hasNext': current * limit < total,
    'hasPrev': current > 1,
  },
};
DestinationRemoteDataSource remote(
  Map<String, dynamic> Function(Uri) handler,
) => DestinationRemoteDataSource(
  ApiClient(
    baseUrl: 'http://test.local/api',
    httpClient: MockClient(
      (request) async => http.Response(jsonEncode(handler(request.url)), 200),
    ),
  ),
);

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test(
    'empty published catalog clears deleted items and survives offline restart',
    () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final db = AppDatabase.forTesting(NativeDatabase.memory());
      addTearDown(db.close);
      var empty = false;
      final source = remote(
        (_) => page(empty ? [] : [item(1)], total: empty ? 0 : 1),
      );
      final repository = DestinationRepositoryImpl(
        source,
        DestinationLocalDataSource(db, prefs),
      );
      expect((await repository.refresh()).isSuccess, isTrue);
      expect((await repository.watchCatalog().first).items.single.id, 'id-1');
      empty = true;
      expect((await repository.refresh()).isSuccess, isTrue);
      expect((await repository.watchCatalog().first).items, isEmpty);
      expect(prefs.getKeys(), isNotEmpty);
      final restarted = DestinationRepositoryImpl(
        remote((_) => throw const ApiException('offline')),
        DestinationLocalDataSource(db, await SharedPreferences.getInstance()),
      );
      expect((await restarted.refresh()).isSuccess, isFalse);
      final snapshot = await restarted.watchCatalog().first;
      expect(snapshot.items, isEmpty);
      expect(snapshot.lastFetched, isNotNull);
    },
  );

  test('failed later page never replaces cached catalog', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    final db = AppDatabase.forTesting(NativeDatabase.memory());
    addTearDown(db.close);
    var failLater = false;
    final repository = DestinationRepositoryImpl(
      remote((uri) {
        if (!failLater) return page([item(99)], total: 1);
        if (uri.queryParameters['page'] == '2') {
          throw const ApiException('offline');
        }
        return page(List.generate(50, item), total: 51);
      }),
      DestinationLocalDataSource(db, prefs),
    );
    expect((await repository.refresh()).isSuccess, isTrue);
    failLater = true;
    expect((await repository.refresh()).isSuccess, isFalse);
    expect((await repository.watchCatalog().first).items.single.id, 'id-99');
  });

  for (final body in [
    {'success': true, 'data': []},
    page([], total: 1),
    {
      ...page([]),
      'meta': {...(page([])['meta'] as Map), 'hasNext': true},
    },
    page([item(1), item(1)], total: 2),
  ]) {
    test('incomplete or inconsistent catalog rejected: $body', () async {
      await expectLater(
        remote((_) => body).fetchPublished(),
        throwsA(isA<ApiException>()),
      );
    });
  }

  for (final malformed in <Object?>[
    null,
    7,
    {},
    {'id': '', 'name': 'Bad', 'slug': 'bad', 'status': 'published'},
    {...item(2), 'status': 'draft'},
  ]) {
    test('malformed row $malformed preserves good cache', () async {
      SharedPreferences.setMockInitialValues({});
      final db = AppDatabase.forTesting(NativeDatabase.memory());
      addTearDown(db.close);
      final prefs = await SharedPreferences.getInstance();
      var bad = false;
      final repository = DestinationRepositoryImpl(
        remote((_) => page([bad ? malformed : item(1)], total: 1)),
        DestinationLocalDataSource(db, prefs),
      );
      expect((await repository.refresh()).isSuccess, isTrue);
      bad = true;
      expect((await repository.refresh()).isSuccess, isFalse);
      expect((await repository.watchCatalog().first).items.single.id, 'id-1');
    });
  }
  test(
    'fetchPublished mengambil semua halaman sebelum mengganti katalog',
    () async {
      final requests = <int>[];
      final source = remote((uri) {
        expect(uri.queryParameters['status'], 'published');
        final current = int.parse(uri.queryParameters['page'] ?? '1');
        requests.add(current);
        return page(
          current == 1 ? List.generate(50, item) : [item(50)],
          current: current,
          total: 51,
        );
      });
      expect(await source.fetchPublished(), hasLength(51));
      expect(requests, [1, 2]);
    },
  );
}
