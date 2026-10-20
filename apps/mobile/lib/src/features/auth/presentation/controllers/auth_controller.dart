import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/core/usecases/usecase.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:dolenae_mobile/src/features/auth/domain/usecases/auth_usecases.dart';

/// Holds the current session and exposes auth actions to the UI.
class AuthController extends ChangeNotifier {
  AuthController({
    required AuthRepository repository,
    AuthSession? initialSession,
  }) : _session = initialSession,
       _login = LoginUseCase(repository),
       _register = RegisterUseCase(repository),
       _logout = LogoutUseCase(repository),
       _verify = VerifySessionUseCase(repository),
       _forgotPassword = ForgotPasswordUseCase(repository);

  final LoginUseCase _login;
  final RegisterUseCase _register;
  final LogoutUseCase _logout;
  final VerifySessionUseCase _verify;
  final ForgotPasswordUseCase _forgotPassword;

  AuthSession? _session;

  AuthUser? get user => _session?.user;

  bool get isAuthenticated => _session != null;

  String? get token => _session?.token;

  Future<AppFailure?> login({
    required String email,
    required String password,
  }) async {
    final result = await _login(
      LoginParams(email: email, password: password),
    );
    return _apply(result);
  }

  Future<AppFailure?> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final result = await _register(
      RegisterParams(name: name, email: email, password: password),
    );
    return _apply(result);
  }

  /// Re-checks the restored token after the app starts.
  ///
  /// Only an auth failure (expired/revoked token) signs the user out. Network
  /// errors are ignored so an offline launch keeps the cached session.
  Future<void> verifySession() async {
    if (_session == null) return;

    final result = await _verify(const NoParams());
    switch (result) {
      case Success(:final value):
        _session = value;
        notifyListeners();
      case Failure(:final failure):
        if (failure is AuthFailure) {
          _session = null;
          notifyListeners();
        }
    }
  }

  /// Sends a reset link and returns the backend message or the failure.
  Future<Result<String>> requestPasswordReset(String email) {
    return _forgotPassword(ForgotPasswordParams(email: email));
  }

  Future<AppFailure?> logout() async {
    final result = await _logout(const NoParams());
    _session = null;
    notifyListeners();
    return result.failureOrNull;
  }

  AppFailure? _apply(Result<AuthSession> result) {
    switch (result) {
      case Success(:final value):
        _session = value;
        notifyListeners();
        return null;
      case Failure(:final failure):
        return failure;
    }
  }
}
