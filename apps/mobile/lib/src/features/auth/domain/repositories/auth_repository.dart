import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';

/// Auth operations available to the app.
abstract interface class AuthRepository {
  /// Reads the persisted session and restores the API token.
  Future<Result<AuthSession>> restore();

  /// Re-checks the persisted token against `GET /auth/me`.
  ///
  /// An expired or revoked token clears the session. Network errors keep it so
  /// the app can still start offline.
  Future<Result<AuthSession>> verify();

  Future<Result<AuthSession>> login({
    required String email,
    required String password,
  });

  Future<Result<AuthSession>> register({
    required String name,
    required String email,
    required String password,
  });

  /// Sends a password-reset link and returns the backend message.
  Future<Result<String>> forgotPassword({required String email});

  /// Clears the persisted session and the API token.
  Future<Result<void>> logout();
}
