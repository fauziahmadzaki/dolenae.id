import 'dart:async';

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_local_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/google_sign_in_source.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._remote, this._local, this._client, this._google);

  final AuthRemoteDataSource _remote;
  final AuthLocalDataSource _local;
  final ApiClient _client;
  final GoogleSignInSource _google;

  Future<void> _storageQueue = Future.value();
  int _sessionEpoch = 0;
  int _committedEpoch = 0;

  /// Menyeragamkan seluruh operasi baca/tulis penyimpanan sesi secara berurutan
  /// agar tulis tertunda tidak menimpa login atau logout yang lebih baru.
  Future<T> _serializeStorage<T>(Future<T> Function() action) {
    final completer = Completer<T>();
    _storageQueue = _storageQueue.catchError((_) {}).then((_) async {
      try {
        completer.complete(await action());
      } catch (error, stackTrace) {
        completer.completeError(error, stackTrace);
      }
    });
    return completer.future;
  }

  @override
  Future<Result<AuthSession>> restore() async {
    final expectedEpoch = _sessionEpoch;
    try {
      return await _serializeStorage(() async {
        if (_sessionEpoch != expectedEpoch) {
          return const Failure(
            AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
          );
        }
        final session = await _local.read();
        if (_sessionEpoch != expectedEpoch) {
          return const Failure(
            AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
          );
        }
        if (session == null) {
          return const Failure(AuthFailure('Sesi tidak ditemukan.'));
        }
        final effectiveUser = await _applyStoredAvatarOverride(session.user);
        if (_sessionEpoch != expectedEpoch) {
          return const Failure(
            AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
          );
        }
        final effectiveSession = AuthSession(
          token: session.token,
          user: effectiveUser,
        );
        _client.token = effectiveSession.token;
        return Success(effectiveSession);
      });
    } catch (_) {
      // A broken keystore should start the app as a guest, not crash it.
      return const Failure(AuthFailure('Sesi tidak dapat dibaca.'));
    }
  }

  @override
  Future<Result<AuthSession>> verify() async {
    final expectedEpoch = _sessionEpoch;
    final expectedToken = _client.token;
    if (expectedToken == null || expectedToken.isEmpty) {
      return const Failure(AuthFailure('Sesi tidak ditemukan.'));
    }
    final expectedUserId = await _serializeStorage(_readLocalUserId);
    if (_sessionEpoch != expectedEpoch || _client.token != expectedToken) {
      return const Failure(
        AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
      );
    }

    try {
      final user = await _remote.me();
      if (_sessionEpoch != expectedEpoch ||
          _sessionChanged(
            expectedToken: expectedToken,
            expectedUserId: expectedUserId,
            fetchedUserId: user.id,
          )) {
        return const Failure(
          AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
        );
      }
      return await _serializeStorage(() async {
        final currentLocalUserId = await _readLocalUserId();
        if (_sessionEpoch != expectedEpoch ||
            _sessionChanged(
              expectedToken: expectedToken,
              expectedUserId: expectedUserId,
              fetchedUserId: user.id,
              currentLocalUserId: currentLocalUserId,
            )) {
          return const Failure(
            AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
          );
        }
        final effectiveUser = await _applyStoredAvatarOverride(user);
        final session = AuthSession(token: expectedToken, user: effectiveUser);
        await _local.save(session);
        if (_sessionEpoch != expectedEpoch || _client.token != expectedToken) {
          return const Failure(
            AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
          );
        }
        return Success(session);
      });
    } on ApiException catch (error) {
      if (_invalidatesSession(error.statusCode)) {
        await _serializeStorage(() async {
          if (_sessionEpoch == expectedEpoch &&
              _client.token == expectedToken) {
            // Expired or revoked token: drop it so the router returns to login.
            _client.token = null;
            try {
              await _local.clear();
            } catch (_) {
              // Nothing else to clear; the in-memory session is gone anyway.
            }
          }
        });
      }
      return Failure(error.toFailure());
    } catch (_) {
      return const Failure(
        NetworkFailure('Tidak dapat memeriksa sesi. Coba lagi nanti.'),
      );
    }
  }

  @override
  Future<Result<AuthSession>> login({
    required String email,
    required String password,
  }) {
    return _authenticate(() => _remote.login(email: email, password: password));
  }

  @override
  Future<Result<AuthSession>> register({
    required String name,
    required String email,
    required String password,
  }) {
    return _authenticate(
      () => _remote.register(name: name, email: email, password: password),
    );
  }

  @override
  Future<Result<AuthSession>> updateProfile({
    required String name,
    String? phone,
    String? city,
    String? bio,
    String? avatarUrl,
    bool clearAvatar = false,
  }) async {
    final expectedEpoch = _sessionEpoch;
    final expectedToken = _client.token;
    if (expectedToken == null || expectedToken.isEmpty) {
      return const Failure(AuthFailure('Sesi tidak ditemukan.'));
    }
    final expectedUserId = await _serializeStorage(_readLocalUserId);
    if (_sessionEpoch != expectedEpoch || _client.token != expectedToken) {
      return const Failure(
        AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
      );
    }

    try {
      final user = await _remote.updateProfile(
        name: name,
        phone: phone,
        city: city,
        bio: bio,
      );
      if (_sessionEpoch != expectedEpoch ||
          _sessionChanged(
            expectedToken: expectedToken,
            expectedUserId: expectedUserId,
            fetchedUserId: user.id,
          )) {
        return const Failure(
          AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
        );
      }
      return await _serializeStorage(() async {
        final currentLocalUserId = await _readLocalUserId();
        if (_sessionEpoch != expectedEpoch ||
            _sessionChanged(
              expectedToken: expectedToken,
              expectedUserId: expectedUserId,
              fetchedUserId: user.id,
              currentLocalUserId: currentLocalUserId,
            )) {
          return const Failure(
            AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
          );
        }
        final trimmedAvatarUrl = avatarUrl?.trim() ?? '';
        final AvatarOverride? pendingOverride = clearAvatar
            ? const AvatarOverride.cleared()
            : trimmedAvatarUrl.isNotEmpty
            ? AvatarOverride.custom(trimmedAvatarUrl)
            : null;
        final AvatarOverride override;
        if (pendingOverride != null) {
          override = pendingOverride;
          try {
            await _local.writeAvatarOverride(user.id, override);
          } catch (_) {
            return const Failure(
              UnknownFailure('Tidak dapat menyimpan foto profil. Coba lagi.'),
            );
          }
        } else {
          override = await _readAvatarOverrideSafe(user.id);
        }
        final effectiveUser = _withAvatar(user, override.apply(user.avatarUrl));
        final session = AuthSession(token: expectedToken, user: effectiveUser);
        await _local.save(session);
        if (_sessionEpoch != expectedEpoch || _client.token != expectedToken) {
          return const Failure(
            AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
          );
        }
        return Success(session);
      });
    } on ApiException catch (error) {
      return Failure(error.toFailure());
    } catch (_) {
      return const Failure(
        UnknownFailure('Tidak dapat menyimpan profil. Coba lagi.'),
      );
    }
  }

  @override
  Future<Result<AuthSession>> googleSignIn() {
    return _authenticate(() async {
      final idToken = await _google.idToken();
      return _remote.googleLogin(idToken: idToken);
    });
  }

  @override
  Future<String?> readRememberedEmail() async {
    try {
      return await _local.readRememberedEmail();
    } catch (_) {
      // Email yang diingat bersifat opsional; jangan gagalkan form masuk.
      return null;
    }
  }

  @override
  Future<void> writeRememberedEmail(String? email) async {
    try {
      await _local.writeRememberedEmail(email);
    } catch (_) {
      // Sama seperti di atas: kegagalan penyimpanan tidak menghalangi login.
    }
  }

  @override
  Future<Result<String>> forgotPassword({required String email}) async {
    try {
      return Success(await _remote.forgotPassword(email: email));
    } on ApiException catch (error) {
      return Failure(error.toFailure());
    } catch (_) {
      return const Failure(
        UnknownFailure('Tidak dapat mengirim tautan. Coba lagi.'),
      );
    }
  }

  @override
  Future<Result<String>> resendVerificationEmail({required String email}) async {
    try {
      return Success(await _remote.resendVerification(email: email));
    } on ApiException catch (error) {
      return Failure(error.toFailure());
    } catch (_) {
      return const Failure(
        UnknownFailure('Tidak dapat mengirim tautan verifikasi. Coba lagi.'),
      );
    }
  }

  @override
  Future<Result<void>> logout() async {
    final logoutEpoch = ++_sessionEpoch;
    _client.token = null;
    try {
      return await _serializeStorage(() async {
        if (_committedEpoch > logoutEpoch) {
          return const Success(null);
        }
        await _local.clear();
        _committedEpoch = logoutEpoch;
        return const Success(null);
      });
    } catch (_) {
      return const Failure(AuthFailure('Gagal menghapus sesi.'));
    }
  }

  Future<Result<AuthSession>> _authenticate(
    Future<AuthSession> Function() request,
  ) async {
    final authEpoch = ++_sessionEpoch;
    try {
      final rawSession = await request();
      if (_sessionEpoch != authEpoch) {
        return const Failure(
          AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
        );
      }
      return await _serializeStorage(() async {
        if (_sessionEpoch != authEpoch) {
          return const Failure(
            AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
          );
        }
        final effectiveUser = await _applyStoredAvatarOverride(rawSession.user);
        final session = AuthSession(
          token: rawSession.token,
          user: effectiveUser,
        );
        await _local.save(session);
        if (_sessionEpoch != authEpoch) {
          return const Failure(
            AuthFailure('Sesi telah berganti.', code: 'SESSION_CHANGED'),
          );
        }
        _committedEpoch = authEpoch;
        _client.token = session.token;
        return Success(session);
      });
    } on GoogleSignInFailure catch (error) {
      return Failure(
        AuthFailure(
          error.message,
          code: error.cancelled ? 'GOOGLE_CANCELLED' : 'GOOGLE_FAILED',
        ),
      );
    } on ApiException catch (error) {
      return Failure(error.toFailure());
    } catch (_) {
      return const Failure(
        UnknownFailure('Tidak dapat memproses permintaan. Coba lagi.'),
      );
    }
  }

  bool _invalidatesSession(int? statusCode) =>
      statusCode == 401 || statusCode == 403 || statusCode == 404;

  Future<String?> _readLocalUserId() async {
    try {
      return (await _local.read())?.user.id;
    } catch (_) {
      return null;
    }
  }

  bool _sessionChanged({
    required String expectedToken,
    required String? expectedUserId,
    required String fetchedUserId,
    String? currentLocalUserId,
  }) {
    if (_client.token != expectedToken) return true;
    if (expectedUserId != null && fetchedUserId != expectedUserId) return true;
    if (expectedUserId != null &&
        currentLocalUserId != null &&
        currentLocalUserId != expectedUserId) {
      return true;
    }
    return false;
  }

  Future<AuthUser> _applyStoredAvatarOverride(AuthUser user) async {
    final override = await _readAvatarOverrideSafe(user.id);
    return _withAvatar(user, override.apply(user.avatarUrl));
  }

  Future<AvatarOverride> _readAvatarOverrideSafe(String userId) async {
    try {
      return await _local.readAvatarOverride(userId);
    } catch (_) {
      return const AvatarOverride.followServer();
    }
  }

  AuthUser _withAvatar(AuthUser user, String? avatarUrl) => AuthUser(
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: avatarUrl,
    phone: user.phone,
    city: user.city,
    bio: user.bio,
    emailVerifiedAt: user.emailVerifiedAt,
  );
}
