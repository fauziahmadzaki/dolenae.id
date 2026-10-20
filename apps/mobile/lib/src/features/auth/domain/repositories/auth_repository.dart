import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';

/// Auth operations available to the app.
abstract interface class AuthRepository {
  /// Reads the persisted session and restores the API token.
  Future<Result<AuthSession>> restore();

  Future<Result<AuthSession>> login({
    required String email,
    required String password,
  });

  Future<Result<AuthSession>> register({
    required String name,
    required String email,
    required String password,
  });

  /// Clears the persisted session and the API token.
  Future<Result<void>> logout();
}
