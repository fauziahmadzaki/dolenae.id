import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';

/// Auth endpoints (`/auth`). Returns domain values so callers stay simple.
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

  /// Reads the user that owns the current token (`GET /auth/me`).
  Future<AuthUser> me() async {
    final body = await _client.get('/auth/me');
    final data = body['data'];
    if (data is! Map) {
      throw const ApiException('Respons sesi tidak dikenali.');
    }
    final user = (data.cast<String, dynamic>()['user'] as Map?)
        ?.cast<String, dynamic>();
    if (user == null) {
      throw const ApiException('Data pengguna tidak ditemukan.');
    }
    return _userFromJson(user);
  }

  /// Starts the reset flow and returns the message to show to the user.
  Future<String> forgotPassword({required String email}) async {
    final body = await _client.post(
      '/auth/forgot-password',
      body: {'email': email.trim()},
    );
    final data = body['data'];
    if (data is Map) {
      final message = data.cast<String, dynamic>()['message'];
      if (message is String && message.isNotEmpty) return message;
    }
    return 'Jika email terdaftar, tautan reset password telah dikirim.';
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
    user: _userFromJson(userJson),
  );
}

AuthUser _userFromJson(Map<String, dynamic> json) {
  return AuthUser(
    id: json['id'] as String? ?? '',
    name: json['name'] as String? ?? 'Pengguna',
    email: json['email'] as String? ?? '',
    role: json['role'] as String? ?? 'wisatawan',
    avatarUrl: json['avatarUrl'] as String?,
  );
}
