import 'dart:convert';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  test(
    'PATCH mengirim JSON dan DELETE menerima data null dengan Bearer',
    () async {
      final requests = <http.Request>[];
      final api = ApiClient(
        baseUrl: 'https://example.invalid/api',
        httpClient: MockClient((request) async {
          requests.add(request);
          return http.Response(
            jsonEncode({'success': true, 'data': null}),
            200,
          );
        }),
      )..token = 'token-uji';
      await api.patch('/notifications/read-all', body: {'read': true});
      final deleted = await api.delete('/trips/trip-id');
      expect(requests.map((r) => r.method), ['PATCH', 'DELETE']);
      expect(requests.first.headers['Authorization'], 'Bearer token-uji');
      expect(jsonDecode(requests.first.body), {'read': true});
      expect(requests.last.url.path, '/api/trips/trip-id');
      expect(deleted['data'], isNull);
    },
  );

  test(
    'PATCH mempertahankan error server dan DELETE memetakan jaringan',
    () async {
      final api = ApiClient(
        httpClient: MockClient((request) async {
          if (request.method == 'DELETE') throw http.ClientException('offline');
          return http.Response(
            jsonEncode({
              'success': false,
              'error': {'message': 'Tidak diizinkan', 'code': 'UNAUTHORIZED'},
            }),
            401,
          );
        }),
      );
      await expectLater(
        api.patch('/users/me/settings', body: {}),
        throwsA(isA<ApiException>().having((e) => e.statusCode, 'status', 401)),
      );
      await expectLater(
        api.delete('/trips/id'),
        throwsA(
          isA<ApiException>().having(
            (e) => e.message,
            'pesan',
            contains('koneksi internet'),
          ),
        ),
      );
    },
  );
}
