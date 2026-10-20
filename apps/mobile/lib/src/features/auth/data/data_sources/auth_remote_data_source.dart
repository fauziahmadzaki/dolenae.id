import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';

/// Auth endpoints (`/auth`). Returns domain sessions so callers stay simple.
class AuthRemoteDataSource {
  AuthRemoteDataSource(this._client);

  final ApiClient _client;

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final body = await _client.post(
      '/auth/login',
      body: {'email': email.trim(), 'password': password},
    );
    return _session(body);
  }

  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final body = await _client.post(
      '/auth/register',
      body: {
        'name': name.trim(),
        'email': email.trim(),
        'password': password,
        'role': 'wisatawan',
      },
    );
    return _session(body);
  }

  AuthSession _session(Map<String, dynamic> body) {
    final data = body['data'];
    if (data is! Map) {
      throw const ApiException('Respons login tidak dikenali.');
    }
    final session = _sessionFromJson(data.cast<String, dynamic>());
    if (session.token.isEmpty) {
      throw const ApiException('Token login tidak ditemukan.');
    }
    return session;
  }
}

AuthSession _sessionFromJson(Map<String, dynamic> json) {
  final userJson = (json['user'] as Map?)?.cast<String, dynamic>() ?? const {};
  return AuthSession(
    token: json['token'] as String? ?? '',
    user: AuthUser(
      id: userJson['id'] as String? ?? '',
      name: userJson['name'] as String? ?? 'Pengguna',
      email: userJson['email'] as String? ?? '',
      role: userJson['role'] as String? ?? 'wisatawan',
      avatarUrl: userJson['avatarUrl'] as String?,
    ),
  );
}
