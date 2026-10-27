import 'dart:convert';

import 'package:dolenae_mobile/src/features/categories/data/data_sources/category_local_data_source.dart';
import 'package:dolenae_mobile/src/features/categories/data/repositories/category_repository_impl.dart';
import 'package:dolenae_mobile/src/features/categories/presentation/controllers/categories_controller.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/categories/data/data_sources/category_remote_data_source.dart';

Map<String, dynamic> categoryJson(int n) => {
  'id': '00000000-0000-4000-8000-${n.toString().padLeft(12, '0')}',
  'name': 'Kategori $n',
  'slug': 'kategori-$n',
  'type': 'terrain',
  'icon': null,
};

CategoryRepositoryImpl repository(
  SharedPreferences prefs,
  Future<http.Response> Function(http.Request) handler,
) => CategoryRepositoryImpl(
  CategoryRemoteDataSource(ApiClient(httpClient: MockClient(handler))),
  CategoryLocalDataSource(prefs),
);
http.Response response(List<Map<String, dynamic>> rows) => http.Response(
  jsonEncode({
    'success': true,
    'data': rows,
    'meta': {
      'page': 1,
      'limit': 100,
      'total': rows.length,
      'totalPages': 1,
      'hasNext': false,
    },
  }),
  200,
);

void main() {
  test('failed later page never replaces complete cache', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    await repository(prefs, (_) async => response([categoryJson(9)])).load();
    final before = prefs.getString('dolenae.categories.v1');
    final repo = repository(prefs, (request) async {
      if (request.url.queryParameters['page'] == '2') {
        throw http.ClientException('offline');
      }
      return http.Response(
        jsonEncode({
          'success': true,
          'data': [categoryJson(1)],
          'meta': {
            'page': 1,
            'limit': 1,
            'total': 2,
            'totalPages': 2,
            'hasNext': true,
          },
        }),
        200,
      );
    });
    expect(
      (await repo.load(refresh: true)).valueOrNull!.single.name,
      'Kategori 9',
    );
    expect(prefs.getString('dolenae.categories.v1'), before);
  });
  test('corrupt existing cache suppresses first-offline fallback', () async {
    SharedPreferences.setMockInitialValues({
      'dolenae.categories.v1': 'invalid',
    });
    final controller = CategoriesController(
      repository(
        await SharedPreferences.getInstance(),
        (_) async => throw http.ClientException('offline'),
      ),
    );
    expect((await controller.load()).isFailure, isTrue);
    expect(controller.items, isEmpty);
    controller.dispose();
  });
  test(
    'controller immediately exposes cache and safe disposal while loading',
    () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      await repository(prefs, (_) async => response([categoryJson(1)])).load();
      final controller = CategoriesController(
        repository(prefs, (_) async => response([])),
      );
      expect(controller.items.single.name, 'Kategori 1');
      final pending = controller.load(refresh: true);
      expect(controller.isLoading, isTrue);
      controller.dispose();
      expect((await pending).isSuccess, isTrue);
    },
  );
  test(
    'cache first, explicit refresh bypasses TTL and persists empty success',
    () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      var calls = 0;
      final repo = repository(prefs, (_) async {
        calls++;
        return response(calls == 1 ? [categoryJson(1)] : []);
      });
      expect((await repo.load()).valueOrNull!.single.name, 'Kategori 1');
      expect(
        jsonDecode(prefs.getString('dolenae.categories.v1')!)['fetchedAt'],
        isA<String>(),
      );
      expect((await repo.load()).valueOrNull, hasLength(1));
      expect(calls, 1);
      expect((await repo.load(refresh: true)).valueOrNull, isEmpty);
      expect(calls, 2);
      final offline = repository(
        prefs,
        (_) async => throw http.ClientException('offline'),
      );
      expect((await offline.load(refresh: true)).valueOrNull, isEmpty);
    },
  );
  test('expired cache refreshes, offline keeps cached categories', () async {
    SharedPreferences.setMockInitialValues({
      'dolenae.categories.v1': jsonEncode({
        'fetchedAt': DateTime.now()
            .subtract(const Duration(hours: 25))
            .toUtc()
            .toIso8601String(),
        'items': [categoryJson(2)],
      }),
    });
    final prefs = await SharedPreferences.getInstance();
    var calls = 0;
    final repo = repository(prefs, (_) async {
      calls++;
      throw http.ClientException('offline');
    });
    expect((await repo.load()).valueOrNull!.single.name, 'Kategori 2');
    expect(calls, 1);
  });
  test(
    'first offline has failure, fallback labels have no backend IDs',
    () async {
      SharedPreferences.setMockInitialValues({});
      final repo = repository(
        await SharedPreferences.getInstance(),
        (_) async => throw http.ClientException('offline'),
      );
      final controller = CategoriesController(repo);
      final result = await controller.load();
      expect(result.isFailure, isTrue);
      expect(controller.error, isNotNull);
      expect(controller.items.map((e) => e.name), [
        'Gunung',
        'Bukit',
        'Danau',
        'Air terjun',
        'Camping',
      ]);
      expect(controller.items.every((e) => e.id.isEmpty), isTrue);
      controller.dispose();
    },
  );
  test('malformed API is failure, not offline fallback', () async {
    SharedPreferences.setMockInitialValues({});
    final controller = CategoriesController(
      repository(
        await SharedPreferences.getInstance(),
        (_) async => response([
          {...categoryJson(1), 'type': 'wrong'},
        ]),
      ),
    );
    expect((await controller.load()).isFailure, isTrue);
    expect(controller.items, isEmpty);
    controller.dispose();
  });
  test('rejects bad payload and inconsistent pagination', () async {
    for (final body in [
      {'success': true, 'data': {}, 'meta': {}},
      {
        'success': true,
        'data': [categoryJson(1)],
        'meta': {
          'page': 1,
          'limit': 100,
          'total': 2,
          'totalPages': 1,
          'hasNext': false,
        },
      },
      {
        'success': true,
        'data': [
          {...categoryJson(1), 'id': 'fake'},
        ],
        'meta': {
          'page': 1,
          'limit': 100,
          'total': 1,
          'totalPages': 1,
          'hasNext': false,
        },
      },
    ]) {
      final remote = CategoryRemoteDataSource(
        ApiClient(
          httpClient: MockClient(
            (_) async => http.Response(jsonEncode(body), 200),
          ),
        ),
      );
      await expectLater(remote.fetchAll(), throwsFormatException);
    }
  });
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() => SharedPreferences.setMockInitialValues({}));
  test('fetches every category page with backend meta', () async {
    final pages = <int>[];
    final remote = CategoryRemoteDataSource(
      ApiClient(
        httpClient: MockClient((request) async {
          final page = int.parse(request.url.queryParameters['page']!);
          pages.add(page);
          expect(request.url.queryParameters['limit'], '100');
          return http.Response(
            jsonEncode({
              'success': true,
              'data': [categoryJson(page)],
              'meta': {
                'page': page,
                'limit': 1,
                'total': 2,
                'totalPages': 2,
                'hasNext': page == 1,
              },
            }),
            200,
          );
        }),
      ),
    );
    final items = await remote.fetchAll();
    expect(pages, [1, 2]);
    expect(items.map((e) => e.name), ['Kategori 1', 'Kategori 2']);
  });
}
