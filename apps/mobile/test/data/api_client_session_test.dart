import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:dolenae_mobile/src/core/network/api_client.dart';

const _denied =
    '{"success":false,"error":{"message":"Sesi berakhir.","code":"EXPIRED"}}';
final _expired = isA<ApiException>()
    .having((e) => e.statusCode, 'statusCode', 401)
    .having((e) => e.message, 'message', 'Sesi berakhir.')
    .having((e) => e.code, 'code', 'EXPIRED');

void main() {
  for (final method in ['GET', 'POST', 'PATCH', 'DELETE']) {
    test(
      '$method 401 reports the request token, preserves API error',
      () async {
        final tokens = <String>[];
        final api =
            ApiClient(
                httpClient: MockClient((request) async {
                  expect(request.method, method);
                  expect(
                    request.headers['authorization'],
                    'Bearer test-current-session',
                  );
                  return http.Response(_denied, 401);
                }),
              )
              ..token = 'test-current-session'
              ..onUnauthorized = tokens.add;
        final request = switch (method) {
          'POST' => api.post('/payments'),
          'PATCH' => api.patch('/payments'),
          'DELETE' => api.delete('/payments'),
          _ => api.get('/payments'),
        };
        await expectLater(request, throwsA(_expired));
        expect(tokens, ['test-current-session']);
      },
    );
  }

  for (final asynchronous in [false, true]) {
    test(
      'callback failure ($asynchronous async) preserves original 401',
      () async {
        final api =
            ApiClient(
                httpClient: MockClient(
                  (_) async => http.Response(_denied, 401),
                ),
              )
              ..token = 'test-current-session'
              ..onUnauthorized = (_) {
                if (asynchronous) {
                  return Future<void>.error(StateError('callback failed'));
                }
                throw StateError('callback failed');
              };
        await expectLater(api.get('/payments'), throwsA(_expired));
      },
    );
  }

  for (final token in [null, '']) {
    test('guest token "$token" never invokes expiry callback', () async {
      var callbacks = 0;
      final api =
          ApiClient(
              httpClient: MockClient((request) async {
                expect(request.headers['authorization'], isNull);
                return http.Response(_denied, 401);
              }),
            )
            ..token = token
            ..onUnauthorized = (_) {
              callbacks++;
            };
      await expectLater(api.post('/auth/login'), throwsA(_expired));
      expect(callbacks, 0);
    });
  }

  test('delayed 401 ignores a replaced request token', () async {
    final response = Completer<http.Response>();
    final started = Completer<void>();
    var callbacks = 0;
    final api =
        ApiClient(
            httpClient: MockClient((request) {
              expect(
                request.headers['authorization'],
                'Bearer test-old-session',
              );
              started.complete();
              return response.future;
            }),
          )
          ..token = 'test-old-session'
          ..onUnauthorized = (_) {
            callbacks++;
          };
    final request = api.get('/payments');
    await started.future;
    api.token = 'test-new-session';
    response.complete(http.Response(_denied, 401));
    await expectLater(request, throwsA(_expired));
    expect(callbacks, 0);
    expect(api.token, 'test-new-session');
  });

  test('delayed 401 ignores a session replaced with the same token', () async {
    final response = Completer<http.Response>();
    final started = Completer<void>();
    var callbacks = 0;
    final api =
        ApiClient(
            httpClient: MockClient((_) {
              started.complete();
              return response.future;
            }),
          )
          ..token = 'test-reused-session'
          ..onUnauthorized = (_) {
            callbacks++;
          };
    final request = api.get('/payments');
    await started.future;
    api.token = null;
    api.token = 'test-reused-session';
    response.complete(http.Response(_denied, 401));
    await expectLater(request, throwsA(_expired));
    expect(callbacks, 0);
    expect(api.token, 'test-reused-session');
  });
}
