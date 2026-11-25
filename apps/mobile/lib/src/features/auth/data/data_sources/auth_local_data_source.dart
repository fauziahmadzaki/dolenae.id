import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/features/auth/data/data_sources/secure_token_store.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';

/// Tiga keadaan override avatar lokal per akun terhadap nilai dari server.
enum AvatarOverrideMode { followServer, custom, cleared }

/// Pilihan avatar lokal yang tersimpan per akun di perangkat.
class AvatarOverride {
  const AvatarOverride.followServer()
    : mode = AvatarOverrideMode.followServer,
      path = null;

  const AvatarOverride.custom(String this.path)
    : mode = AvatarOverrideMode.custom;

  const AvatarOverride.cleared()
    : mode = AvatarOverrideMode.cleared,
      path = null;

  final AvatarOverrideMode mode;
  final String? path;

  /// Menghitung URL/path avatar efektif dari nilai server dan override lokal.
  String? apply(String? serverAvatarUrl) => switch (mode) {
    AvatarOverrideMode.followServer => serverAvatarUrl,
    AvatarOverrideMode.custom => path,
    AvatarOverrideMode.cleared => null,
  };
}

/// Persists the session in two places: token in secure storage, profile in
/// SharedPreferences.
class AuthLocalDataSource {
  AuthLocalDataSource(this._secure, this._prefs);

  static const userKey = 'dolenae.session.user.v1';

  /// Email terakhir yang dipilih untuk diingat pada form masuk.
  static const rememberedEmailKey = 'dolenae.auth.remembered_email.v1';

  /// Awalan key penyimpanan override avatar lokal per `userId`.
  static const avatarOverrideKeyPrefix = 'dolenae.auth.avatar_override.v1.';

  final SecureTokenStore _secure;
  final SharedPreferences _prefs;
  bool _pendingUserPurge = false;

  Future<void> _flushPendingUserPurge() async {
    if (!_pendingUserPurge) return;
    try {
      await _secure.clearAccessToken();
    } catch (_) {}
    try {
      final removed = await _prefs.remove(userKey);
      if (removed) {
        _pendingUserPurge = false;
      }
    } catch (_) {}
  }

  String _avatarOverrideKey(String userId) =>
      '$avatarOverrideKeyPrefix${userId.trim()}';

  /// Membaca override avatar milik [userId]; default [AvatarOverride.followServer].
  Future<AvatarOverride> readAvatarOverride(String userId) async {
    await _flushPendingUserPurge();
    final normalizedId = userId.trim();
    if (normalizedId.isEmpty) return const AvatarOverride.followServer();

    final raw = _prefs.getString(_avatarOverrideKey(normalizedId));
    if (raw == null || raw.isEmpty) return const AvatarOverride.followServer();

    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return const AvatarOverride.followServer();
      final map = decoded.cast<String, dynamic>();
      final mode = map['mode'] as String?;
      if (mode == AvatarOverrideMode.cleared.name) {
        return const AvatarOverride.cleared();
      }
      if (mode == AvatarOverrideMode.custom.name) {
        final path = (map['path'] as String?)?.trim() ?? '';
        if (path.isNotEmpty) return AvatarOverride.custom(path);
      }
      return const AvatarOverride.followServer();
    } catch (_) {
      return const AvatarOverride.followServer();
    }
  }

  void _assertPersisted(bool persisted) {
    if (!persisted) {
      throw StateError('Gagal menyimpan perubahan ke penyimpanan lokal.');
    }
  }

  /// Menyimpan override avatar milik [userId]; mode bawaan menghapus key tersimpan.
  Future<void> writeAvatarOverride(
    String userId,
    AvatarOverride override,
  ) async {
    await _flushPendingUserPurge();
    final normalizedId = userId.trim();
    if (normalizedId.isEmpty) return;

    if (override.mode == AvatarOverrideMode.followServer) {
      await clearAvatarOverride(normalizedId);
      return;
    }
    if (override.mode == AvatarOverrideMode.custom) {
      final path = override.path?.trim() ?? '';
      if (path.isEmpty) {
        await clearAvatarOverride(normalizedId);
        return;
      }
      _assertPersisted(
        await _prefs.setString(
          _avatarOverrideKey(normalizedId),
          jsonEncode({'mode': override.mode.name, 'path': path}),
        ),
      );
      return;
    }

    _assertPersisted(
      await _prefs.setString(
        _avatarOverrideKey(normalizedId),
        jsonEncode({'mode': AvatarOverrideMode.cleared.name}),
      ),
    );
  }

  /// Menghapus override avatar milik [userId] sehingga kembali mengikuti server.
  Future<void> clearAvatarOverride(String userId) async {
    await _flushPendingUserPurge();
    final normalizedId = userId.trim();
    if (normalizedId.isEmpty) return;
    _assertPersisted(await _prefs.remove(_avatarOverrideKey(normalizedId)));
  }

  Future<String?> readRememberedEmail() async {
    await _flushPendingUserPurge();
    final value = _prefs.getString(rememberedEmailKey)?.trim();
    if (value == null || value.isEmpty) return null;
    return value;
  }

  /// Menyimpan email yang diingat; `null` atau kosong menghapusnya.
  Future<void> writeRememberedEmail(String? email) async {
    await _flushPendingUserPurge();
    final value = email?.trim() ?? '';
    if (value.isEmpty) {
      await _prefs.remove(rememberedEmailKey);
      return;
    }
    await _prefs.setString(rememberedEmailKey, value);
  }

  Future<AuthSession?> read() async {
    await _flushPendingUserPurge();
    if (_pendingUserPurge) return null;

    final token = await _secure.readAccessToken();
    if (token == null || token.isEmpty) {
      if (_prefs.getString(userKey) != null) {
        try {
          final removed = await _prefs.remove(userKey);
          _pendingUserPurge = !removed;
        } catch (_) {
          _pendingUserPurge = true;
        }
      }
      return null;
    }

    final user = _readUser();
    if (user == null) return null;
    return AuthSession(token: token, user: user);
  }

  Future<void> save(AuthSession session) async {
    await _flushPendingUserPurge();
    final previousToken = _pendingUserPurge
        ? null
        : await _secure.readAccessToken();
    final previousUserRaw = _pendingUserPurge ? null : _prefs.getString(userKey);
    try {
      _assertPersisted(
        await _prefs.setString(userKey, jsonEncode(_userToJson(session.user))),
      );
      _pendingUserPurge = false;
      await _secure.writeAccessToken(session.token);
    } catch (_) {
      try {
        if (previousUserRaw == null) {
          _assertPersisted(await _prefs.remove(userKey));
        } else {
          _assertPersisted(await _prefs.setString(userKey, previousUserRaw));
        }
        _pendingUserPurge = false;
        if (previousToken == null || previousToken.isEmpty) {
          await _secure.clearAccessToken();
        } else {
          await _secure.writeAccessToken(previousToken);
        }
      } catch (_) {
        try {
          await _secure.clearAccessToken();
        } catch (_) {}
        var removed = false;
        try {
          removed = await _prefs.remove(userKey);
        } catch (_) {
          removed = false;
        }
        _pendingUserPurge = !removed;
      }
      rethrow;
    }
  }

  Future<void> clear() async {
    await _flushPendingUserPurge();
    await _secure.clearAccessToken();
    var removed = false;
    try {
      removed = await _prefs.remove(userKey);
    } catch (_) {
      _pendingUserPurge = true;
      rethrow;
    }
    _pendingUserPurge = !removed;
    _assertPersisted(removed);
  }

  AuthUser? _readUser() {
    if (_pendingUserPurge) return null;
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
  'emailVerifiedAt': user.emailVerifiedAt?.toIso8601String(),
};

AuthUser _userFromJson(Map<String, dynamic> json) => AuthUser(
  id: json['id'] as String? ?? '',
  name: json['name'] as String? ?? 'Pengguna',
  email: json['email'] as String? ?? '',
  role: json['role'] as String? ?? 'wisatawan',
  avatarUrl: json['avatarUrl'] as String?,
  emailVerifiedAt: DateTime.tryParse(json['emailVerifiedAt'] as String? ?? ''),
);
