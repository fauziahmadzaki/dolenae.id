import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/core/usecases/usecase.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/domain/repositories/auth_repository.dart';

class LoginParams {
  const LoginParams({required this.email, required this.password});

  final String email;
  final String password;
}

/// Signs the user in and persists the session.
class LoginUseCase implements UseCase<AuthSession, LoginParams> {
  const LoginUseCase(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<AuthSession>> call(LoginParams params) {
    return _repository.login(email: params.email, password: params.password);
  }
}

class RegisterParams {
  const RegisterParams({
    required this.name,
    required this.email,
    required this.password,
  });

  final String name;
  final String email;
  final String password;
}

/// Creates a new wisatawan account.
class RegisterUseCase implements UseCase<AuthSession, RegisterParams> {
  const RegisterUseCase(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<AuthSession>> call(RegisterParams params) {
    return _repository.register(
      name: params.name,
      email: params.email,
      password: params.password,
    );
  }
}

/// Removes the persisted session.
class LogoutUseCase implements UseCase<void, NoParams> {
  const LogoutUseCase(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<void>> call(NoParams params) => _repository.logout();
}

/// Restores a session saved on a previous launch.
class RestoreSessionUseCase implements UseCase<AuthSession, NoParams> {
  const RestoreSessionUseCase(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<AuthSession>> call(NoParams params) => _repository.restore();
}

/// Checks a restored token against the backend.
class VerifySessionUseCase implements UseCase<AuthSession, NoParams> {
  const VerifySessionUseCase(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<AuthSession>> call(NoParams params) => _repository.verify();
}

class ForgotPasswordParams {
  const ForgotPasswordParams({required this.email});

  final String email;
}

/// Requests a password-reset link from the backend.
class ForgotPasswordUseCase implements UseCase<String, ForgotPasswordParams> {
  const ForgotPasswordUseCase(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<String>> call(ForgotPasswordParams params) {
    return _repository.forgotPassword(email: params.email);
  }
}
