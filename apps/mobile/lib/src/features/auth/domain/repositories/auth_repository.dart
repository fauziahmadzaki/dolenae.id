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

  /// Masuk memakai akun Google (menukar `idToken` ke API).
  Future<Result<AuthSession>> googleSignIn();

  /// Email terakhir yang dipilih untuk diingat pada form masuk.
  Future<String?> readRememberedEmail();

  /// Menyimpan email yang diingat; `null` menghapusnya.
  Future<void> writeRememberedEmail(String? email);

  /// Sends a password-reset link and returns the backend message.
  Future<Result<String>> forgotPassword({required String email});

  /// Sends the email-verification link again; returns the backend message.
  Future<Result<String>> resendVerificationEmail({required String email});

  /// Clears the persisted session and the API token.
  Future<Result<void>> logout();
}
