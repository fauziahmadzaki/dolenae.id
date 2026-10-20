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
    String? initialRememberedEmail,
  }) : _session = initialSession,
       _rememberedEmail = initialRememberedEmail,
       _login = LoginUseCase(repository),
       _register = RegisterUseCase(repository),
       _logout = LogoutUseCase(repository),
       _verify = VerifySessionUseCase(repository),
       _forgotPassword = ForgotPasswordUseCase(repository),
       _googleSignIn = GoogleSignInUseCase(repository),
       _resendVerification = ResendVerificationUseCase(repository),
       _writeRememberedEmail = WriteRememberedEmailUseCase(repository);

  final LoginUseCase _login;
  final RegisterUseCase _register;
  final LogoutUseCase _logout;
  final VerifySessionUseCase _verify;
  final ForgotPasswordUseCase _forgotPassword;
  final GoogleSignInUseCase _googleSignIn;
  final ResendVerificationUseCase _resendVerification;
  final WriteRememberedEmailUseCase _writeRememberedEmail;

  AuthSession? _session;
  String? _rememberedEmail;
  bool _isResendingVerification = false;
  bool _verificationEmailSent = false;

  AuthUser? get user => _session?.user;

  bool get isAuthenticated => _session != null;

  String? get token => _session?.token;

  /// Email yang diingat form masuk (null bila "Ingat saya" tidak dipakai).
  String? get rememberedEmail => _rememberedEmail;

  /// True saat user sudah masuk tetapi emailnya belum diverifikasi.
  bool get needsEmailVerification =>
      _session != null && !_session!.user.isEmailVerified;

  bool get isResendingVerification => _isResendingVerification;

  /// True setelah tautan verifikasi berhasil dikirim ulang pada sesi ini.
  bool get verificationEmailSent => _verificationEmailSent;

  Future<AppFailure?> login({
    required String email,
    required String password,
  }) async {
    final result = await _login(LoginParams(email: email, password: password));
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

  /// Signs in with a Google account and persists the returned session.
  Future<AppFailure?> signInWithGoogle() async {
    final result = await _googleSignIn(const NoParams());
    return _apply(result);
  }

  /// Remembers (or forgets) the email used on the login form.
  Future<void> setRememberedEmail(String? email) async {
    final next = (email == null || email.trim().isEmpty) ? null : email.trim();
    if (next == _rememberedEmail) return;

    _rememberedEmail = next;
    notifyListeners();
    await _writeRememberedEmail(next);
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

  /// Mengirim ulang tautan verifikasi email untuk sesi berjalan.
  Future<Result<String>> resendVerificationEmail() async {
    final email = _session?.user.email;
    if (email == null || email.isEmpty) {
      return const Failure(AuthFailure('Sesi tidak ditemukan.'));
    }

    _isResendingVerification = true;
    notifyListeners();

    final result = await _resendVerification(
      ResendVerificationParams(email: email),
    );

    _isResendingVerification = false;
    if (result is Success<String>) {
      _verificationEmailSent = true;
    }
    notifyListeners();
    return result;
  }

  Future<AppFailure?> logout() async {
    final result = await _logout(const NoParams());
    _session = null;
    _verificationEmailSent = false;
    notifyListeners();
    return result.failureOrNull;
  }

  AppFailure? _apply(Result<AuthSession> result) {
    switch (result) {
      case Success(:final value):
        _session = value;
        _verificationEmailSent = false;
        notifyListeners();
        return null;
      case Failure(:final failure):
        return failure;
    }
  }
}
