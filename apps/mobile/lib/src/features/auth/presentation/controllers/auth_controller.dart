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
       _logout = LogoutUseCase(repository);

  final LoginUseCase _login;
  final RegisterUseCase _register;
  final LogoutUseCase _logout;

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
