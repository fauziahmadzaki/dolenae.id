import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/features/auth/data/data_sources/secure_token_store.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';

/// Persists the session in two places: token in secure storage, profile in
/// SharedPreferences.
class AuthLocalDataSource {
  AuthLocalDataSource(this._secure, this._prefs);

  static const userKey = 'dolenae.session.user.v1';

  final SecureTokenStore _secure;
  final SharedPreferences _prefs;

  Future<AuthSession?> read() async {
    final token = await _secure.readAccessToken();
    if (token == null || token.isEmpty) return null;

    final user = _readUser();
    if (user == null) return null;
    return AuthSession(token: token, user: user);
  }

  Future<void> save(AuthSession session) async {
    await _secure.writeAccessToken(session.token);
    await _prefs.setString(userKey, jsonEncode(_userToJson(session.user)));
  }

  Future<void> clear() async {
    await _secure.clearAccessToken();
    await _prefs.remove(userKey);
  }

  AuthUser? _readUser() {
    final raw = _prefs.getString(userKey);
    if (raw == null || raw.isEmpty) return null;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return null;
      return _userFromJson(decoded.cast<String, dynamic>());
    } catch (_) {
      return null;
    }
  }
}

Map<String, dynamic> _userToJson(AuthUser user) => {
  'id': user.id,
  'name': user.name,
  'email': user.email,
  'role': user.role,
  'avatarUrl': user.avatarUrl,
};

AuthUser _userFromJson(Map<String, dynamic> json) => AuthUser(
  id: json['id'] as String? ?? '',
  name: json['name'] as String? ?? 'Pengguna',
  email: json['email'] as String? ?? '',
  role: json['role'] as String? ?? 'wisatawan',
  avatarUrl: json['avatarUrl'] as String?,
);
