import 'dart:convert';

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_local_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/google_sign_in_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/destinations/data/data_sources/destination_remote_data_source.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

const _baseUrl = 'http://test.local/api';

void main() {
  group('AuthRemoteDataSource', () {
    test('login mengirim kredensial dan memetakan sesi', () async {
      late http.Request request;
      final remote = AuthRemoteDataSource(
        _client((req) async {
          request = req;
          return _json({
            'success': true,
            'data': {
              'token': 'token-123',
              'user': {
                'id': 'user-1',
                'name': 'Dimas Pratama',
                'email': 'wisatawan@dolenae.id',
                'role': 'wisatawan',
                'avatarUrl': null,
              },
            },
          });
        }),
      );

      final session = await remote.login(
        email: ' wisatawan@dolenae.id ',
        password: 'dolenae123',
      );

      expect(request.method, 'POST');
      expect(request.url.toString(), '$_baseUrl/auth/login');
      expect(jsonDecode(request.body), {
        'email': 'wisatawan@dolenae.id',
        'password': 'dolenae123',
      });
      expect(session.token, 'token-123');
      expect(session.user.name, 'Dimas Pratama');
      expect(session.user.role, 'wisatawan');
    });

    test('register memakai role wisatawan', () async {
      late http.Request request;
      final remote = AuthRemoteDataSource(
        _client((req) async {
          request = req;
          return _json({
            'success': true,
            'data': {
              'token': 'token-456',
              'user': {
                'id': 'user-2',
                'name': 'Pengguna Baru',
                'email': 'baru@dolenae.id',
                'role': 'wisatawan',
              },
            },
          });
        }),
      );

      await remote.register(
        name: 'Pengguna Baru',
        email: 'baru@dolenae.id',
        password: 'rahasia123',
      );

      expect(request.url.path, '/api/auth/register');
      expect(jsonDecode(request.body), {
        'name': 'Pengguna Baru',
        'email': 'baru@dolenae.id',
        'password': 'rahasia123',
        'role': 'wisatawan',
      });
    });

    test('error envelope backend menjadi ApiException berpesan', () async {
      final remote = AuthRemoteDataSource(
        _client(
          (_) async => _json({
            'success': false,
            'error': {
              'code': 'UNAUTHORIZED',
              'message': 'Email atau password salah',
            },
          }, status: 401),
        ),
      );

      await expectLater(
        remote.login(email: 'salah@dolenae.id', password: 'salah'),
        throwsA(
          isA<ApiException>()
              .having((error) => error.statusCode, 'statusCode', 401)
              .having(
                (error) => error.message,
                'message',
                'Email atau password salah',
              ),
        ),
      );
    });

    test('me membaca pengguna dari /auth/me', () async {
      late http.Request request;
      final remote = AuthRemoteDataSource(
        _client((req) async {
          request = req;
          return _json({
            'success': true,
            'data': {
              'user': {
                'id': 'user-1',
                'name': 'Dimas Pratama',
                'email': 'wisatawan@dolenae.id',
                'role': 'wisatawan',
              },
            },
          });
        }),
      );

      final user = await remote.me();

      expect(request.url.toString(), '$_baseUrl/auth/me');
      expect(user.email, 'wisatawan@dolenae.id');
      expect(user.name, 'Dimas Pratama');
    });

    test('forgotPassword mengembalikan pesan backend', () async {
      late http.Request request;
      final remote = AuthRemoteDataSource(
        _client((req) async {
          request = req;
          return _json({
            'success': true,
            'data': {
              'message':
                  'Jika email terdaftar, tautan reset password telah dikirim.',
            },
          });
        }),
      );

      final message = await remote.forgotPassword(email: 'dimas@mail.com');

      expect(request.url.path, '/api/auth/forgot-password');
      expect(jsonDecode(request.body), {'email': 'dimas@mail.com'});
      expect(message, contains('tautan reset password'));
    });
  });

  group('AuthRepositoryImpl.verify', () {
    test('memperbarui profil dan menyimpan sesi', () async {
      final local = _FakeAuthLocal(
        session: const AuthSession(
          token: 'token-123',
          user: AuthUser(
            id: 'user-1',
            name: 'Nama Lama',
            email: 'wisatawan@dolenae.id',
            role: 'wisatawan',
          ),
        ),
      );
      late http.Request request;
      final repository = _repository(
        local: local,
        handler: (req) async {
          request = req;
          return _json({
            'success': true,
            'data': {
              'user': {
                'id': 'user-1',
                'name': 'Nama Baru',
                'email': 'wisatawan@dolenae.id',
                'role': 'wisatawan',
              },
            },
          });
        },
      );

      final restored = await repository.restore();
      expect(restored.isSuccess, isTrue);

      final result = await repository.verify();

      expect(result.valueOrNull?.user.name, 'Nama Baru');
      expect(request.headers['Authorization'], 'Bearer token-123');
      expect(local.session?.user.name, 'Nama Baru');
    });

    test('token ditolak menghapus sesi lokal', () async {
      final local = _FakeAuthLocal(
        session: const AuthSession(
          token: 'token-expired',
          user: AuthUser(
            id: 'user-1',
            name: 'Dimas',
            email: 'wisatawan@dolenae.id',
            role: 'wisatawan',
          ),
        ),
      );
      final repository = _repository(
        local: local,
        handler: (_) async => _json({
          'success': false,
          'error': {'code': 'UNAUTHORIZED', 'message': 'Token tidak valid'},
        }, status: 401),
      );
      await repository.restore();

      final result = await repository.verify();

      expect(result.failureOrNull, isA<AuthFailure>());
      expect(local.session, isNull);
    });

    test('gangguan jaringan tidak menghapus sesi', () async {
      final local = _FakeAuthLocal(
        session: const AuthSession(
          token: 'token-123',
          user: AuthUser(
            id: 'user-1',
            name: 'Dimas',
            email: 'wisatawan@dolenae.id',
            role: 'wisatawan',
          ),
        ),
      );
      final repository = _repository(
        local: local,
        handler: (_) async =>
            throw http.ClientException('offline', Uri.parse(_baseUrl)),
      );
      await repository.restore();

      final result = await repository.verify();

      expect(result.failureOrNull, isA<NetworkFailure>());
      expect(local.session, isNotNull);
    });
  });

  group('DestinationRemoteDataSource', () {
    test('mengambil katalog published beserta query limit', () async {
      late http.Request request;
      final remote = DestinationRemoteDataSource(
        _client((req) async {
          request = req;
          return _json({
            'success': true,
            'data': [
              {
                'id': 'dest-1',
                'name': 'Gunung Bromo',
                'slug': 'gunung-bromo',
                'status': 'published',
                'tagline': 'Sunrise di lautan pasir',
                'difficulty': 'ramah-pemula',
                'entryFee': 29000,
                'location': {
                  'province': 'Jawa Timur',
                  'regency': 'Probolinggo',
                },
                'access': {
                  'transport': ['Mobil', 'Jeep'],
                  'duration': '4 jam dari Surabaya',
                  'distanceKm': 140,
                },
                'facilities': ['Toilet', 'Warung', 'Parkir'],
                'elevationMeters': 2329,
                'guideRequired': false,
              },
            ],
            'meta': {
              'page': 1,
              'limit': 50,
              'total': 1,
              'totalPages': 1,
              'hasNext': false,
              'hasPrev': false,
            },
          });
        }),
      );

      final items = await remote.fetchPublished();

      expect(request.url.path, '/api/destinations');
      expect(request.url.queryParameters, {
        'status': 'published',
        'limit': '50',
        'page': '1',
        'sort': 'id',
        'order': 'asc',
      });
      expect(items, hasLength(1));

      final destination = items.single.toEntity();
      expect(destination.name, 'Gunung Bromo');
      expect(destination.regency, 'Probolinggo');
      expect(destination.priceFrom, 29000);
      expect(destination.accessDistance, '140 km dari kota terdekat');
      expect(destination.facilityToilet, isTrue);
    });

    test('respons bukan list dianggap gagal', () async {
      final remote = DestinationRemoteDataSource(
        _client(
          (_) async => _json({
            'success': true,
            'data': {'items': []},
          }),
        ),
      );

      await expectLater(remote.fetchPublished(), throwsA(isA<ApiException>()));
    });
  });
}

ApiClient _client(Future<http.Response> Function(http.Request) handler) {
  return ApiClient(httpClient: MockClient(handler), baseUrl: _baseUrl);
}

AuthRepositoryImpl _repository({
  required _FakeAuthLocal local,
  required Future<http.Response> Function(http.Request) handler,
}) {
  final client = _client(handler);
  return AuthRepositoryImpl(
    AuthRemoteDataSource(client),
    local,
    client,
    GoogleSignInSource(serverClientId: 'test-client-id'),
  );
}

http.Response _json(Map<String, dynamic> body, {int status = 200}) {
  return http.Response.bytes(
    utf8.encode(jsonEncode(body)),
    status,
    headers: const {'content-type': 'application/json; charset=utf-8'},
  );
}

/// In-memory session store; keeps tests free of secure storage plugins.
class _FakeAuthLocal implements AuthLocalDataSource {
  _FakeAuthLocal({this.session});

  AuthSession? session;
  String? rememberedEmail;

  @override
  Future<AuthSession?> read() async => session;

  @override
  Future<void> save(AuthSession value) async => session = value;

  @override
  Future<void> clear() async => session = null;

  @override
  Future<String?> readRememberedEmail() async => rememberedEmail;

  @override
  Future<void> writeRememberedEmail(String? email) async =>
      rememberedEmail = email;
}
