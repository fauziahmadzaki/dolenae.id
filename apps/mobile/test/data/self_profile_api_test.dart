import 'dart:async';
import 'dart:convert';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_local_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/google_sign_in_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

const oldSession = AuthSession(token: 'test-session-a', user: AuthUser(
  id: 'user-a', name: 'Nama Lama', email: 'a@example.test', role: 'wisatawan',
));
Map<String, dynamic> userJson({String id = 'user-a', String name = 'Nama Baru'}) => {
  'id': id, 'name': name, 'email': 'a@example.test', 'role': 'wisatawan',
  'avatarUrl': null, 'emailVerifiedAt': '2026-11-01T00:00:00Z',
};
http.Response response(Map<String, dynamic> user) => http.Response(jsonEncode({
  'success': true, 'data': {'user': user},
}), 200, headers: {'content-type': 'application/json'});

void main() {
  for (final switchAccount in [false, true]) {
    test('late PATCH cannot restore ${switchAccount ? 'previous account' : 'logged-out session'}', () async {
      final pending = Completer<http.Response>();
      final local = MemoryAuthLocal()..session = oldSession;
      final (repository, api) = fixture(local, (request) async {
        if (request.method == 'PATCH') return pending.future;
        return http.Response(jsonEncode({'success': true, 'data': {
          'token': 'test-session-b', 'user': userJson(id: 'user-b', name: 'User B'),
        }}), 200);
      });
      await repository.restore();
      final update = repository.updateProfile(name: 'Nama Baru');
      if (switchAccount) {
        await repository.login(email: 'b@example.test', password: 'unused-test-value');
      } else {
        await repository.logout();
      }
      pending.complete(response(userJson()));
      expect((await update).isFailure, isTrue);
      expect(api.token, switchAccount ? 'test-session-b' : isNull);
      expect(local.session?.user.id, switchAccount ? 'user-b' : isNull);
      expect((await repository.restore()).valueOrNull?.user.id, switchAccount ? 'user-b' : isNull);
    });
  }

  test('late verify cannot overwrite confirmed profile update', () async {
    final pending = Completer<http.Response>();
    final local = MemoryAuthLocal()..session = oldSession;
    final (repository, _) = fixture(local, (request) async => request.method == 'GET'
      ? pending.future : response(userJson()));
    await repository.restore();
    final verify = repository.verify();
    await repository.updateProfile(name: 'Nama Baru');
    pending.complete(response(userJson(name: 'Nama Lama')));
    expect((await verify).isFailure, isTrue);
    expect(local.session?.user.name, 'Nama Baru');
  });

  test('late restore cannot reinstall token after logout', () async {
    final pending = Completer<AuthSession?>();
    final entered = Completer<void>();
    final local = MemoryAuthLocal()..session = oldSession;
    local.onRead = () { entered.complete(); return pending.future; };
    final (repository, api) = fixture(local, (_) async => response(userJson()));
    final restore = repository.restore();
    await entered.future;
    await repository.logout();
    local.onRead = null;
    pending.complete(oldSession);
    expect((await restore).isFailure, isTrue);
    expect(api.token, isNull);
    expect(local.session, isNull);
  });

  test('logout clears a profile persistence write already in progress', () async {
    final writing = Completer<void>();
    final release = Completer<void>();
    final local = MemoryAuthLocal()..session = oldSession;
    final (repository, api) = fixture(local, (_) async => response(userJson()));
    await repository.restore();
    local.onSave = (_) { writing.complete(); return release.future; };
    final update = repository.updateProfile(name: 'Nama Baru');
    await writing.future;
    final logout = repository.logout();
    release.complete();
    await logout;
    expect((await update).isFailure, isTrue);
    expect(api.token, isNull);
    expect(local.session, isNull);
    expect((await repository.restore()).isFailure, isTrue);
  });

  test('mismatched server identity never replaces persisted account', () async {
    final local = MemoryAuthLocal()..session = oldSession;
    final (repository, _) = fixture(local, (_) async => response(userJson(id: 'user-b')));
    await repository.restore();
    expect((await repository.updateProfile(name: 'Nama Baru')).isFailure, isTrue);
    expect(local.session, same(oldSession));
  });

  test('PATCH sends only trimmed name, maps AuthUser, persists original token', () async {
    late http.Request sent;
    final local = MemoryAuthLocal()..session = oldSession;
    final api = ApiClient(baseUrl: 'http://test.local/api', httpClient: MockClient((request) async {
      sent = request;
      return response(userJson());
    }));
    final repository = AuthRepositoryImpl(AuthRemoteDataSource(api), local, api, GoogleSignInSource(serverClientId: 'test'));
    await repository.restore();

    final result = await repository.updateProfile(name: ' Nama Baru ');

    expect(result.isSuccess, isTrue);
    expect(sent.method, 'PATCH');
    expect(sent.url.path, '/api/users/me');
    expect(sent.headers['Authorization'], 'Bearer ${oldSession.token}');
    expect(jsonDecode(sent.body), {'name': 'Nama Baru'});
    expect(result.valueOrNull?.token, oldSession.token);
    expect(result.valueOrNull?.user.id, 'user-a');
    expect(result.valueOrNull?.user.email, oldSession.user.email);
    expect(result.valueOrNull?.user.role, oldSession.user.role);
    expect(result.valueOrNull?.user.isEmailVerified, isTrue);
    expect(local.session?.user.name, 'Nama Baru');
    expect((await repository.restore()).valueOrNull?.user.name, 'Nama Baru');
  });
}

(AuthRepositoryImpl, ApiClient) fixture(MemoryAuthLocal local, Future<http.Response> Function(http.Request) handler) {
  final api = ApiClient(baseUrl: 'http://test.local/api', httpClient: MockClient(handler));
  return (AuthRepositoryImpl(AuthRemoteDataSource(api), local, api, GoogleSignInSource(serverClientId: 'test')), api);
}

class MemoryAuthLocal implements AuthLocalDataSource {
  AuthSession? session;
  Future<AuthSession?> Function()? onRead;
  Future<void> Function(AuthSession)? onSave;
  @override
  Future<AuthSession?> read() async => onRead == null ? session : onRead!();
  @override
  Future<void> save(AuthSession value) async {
    if (onSave != null) await onSave!(value);
    session = value;
  }
  @override
  Future<void> clear() async => session = null;
  @override
  Future<String?> readRememberedEmail() async => null;
  @override
  Future<void> writeRememberedEmail(String? email) async {}
}
