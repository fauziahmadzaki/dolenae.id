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
  }) : _repository = repository,
       _session = initialSession,
       _rememberedEmail = initialRememberedEmail,
       _login = LoginUseCase(repository),
       _register = RegisterUseCase(repository),
       _logout = LogoutUseCase(repository),
       _verify = VerifySessionUseCase(repository),
       _forgotPassword = ForgotPasswordUseCase(repository),
       _googleSignIn = GoogleSignInUseCase(repository),
       _resendVerification = ResendVerificationUseCase(repository),
       _writeRememberedEmail = WriteRememberedEmailUseCase(repository);

  final AuthRepository _repository;
  int _revision = 0;
  bool _disposed = false;
  bool isUpdatingProfile = false;

  Future<AppFailure?> updateProfile(String name) async {
    if (_disposed || _session == null) return const AuthFailure('Sesi tidak ditemukan.');
    if (isUpdatingProfile) return const ValidationFailure('Tunggu profil selesai disimpan.');
    final trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 120) {
      return const ValidationFailure('Nama harus 2–120 karakter.');
    }
    final revision = ++_revision;
    final session = _session!;
    isUpdatingProfile = true;
    notifyListeners();
    final result = await _repository.updateProfile(name: trimmed);
    if (!_current(revision)) return const AuthFailure('Sesi berubah. Coba lagi.');
    isUpdatingProfile = false;
    if (result case Success(:final value)) {
      if (value.token != session.token || value.user.id != session.user.id) {
        notifyListeners();
        return const AuthFailure('Identitas profil tidak sesuai sesi.');
      }
      _session = value;
    }
    notifyListeners();
    return result.failureOrNull;
  }

  bool _current(int revision) => !_disposed && revision == _revision;

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
    final revision = ++_revision;
    isUpdatingProfile = false;
    final result = await _login(LoginParams(email: email, password: password));
    return _current(revision) ? _apply(result) : const AuthFailure('Sesi berubah.');
  }

  Future<AppFailure?> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final revision = ++_revision;
    isUpdatingProfile = false;
    final result = await _register(
      RegisterParams(name: name, email: email, password: password),
    );
    return _current(revision) ? _apply(result) : const AuthFailure('Sesi berubah.');
  }

  /// Signs in with a Google account and persists the returned session.
  Future<AppFailure?> signInWithGoogle() async {
    final revision = ++_revision;
    isUpdatingProfile = false;
    final result = await _googleSignIn(const NoParams());
    return _current(revision) ? _apply(result) : const AuthFailure('Sesi berubah.');
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
    if (_disposed || _session == null || isUpdatingProfile) return;
    final revision = _revision;
    final result = await _verify(const NoParams());
    if (!_current(revision)) return;
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
    _revision++;
    _session = null;
    isUpdatingProfile = false;
    _verificationEmailSent = false;
    if (!_disposed) notifyListeners();
    final result = await _logout(const NoParams());
    return result.failureOrNull;
  }

  @override
  void dispose() {
    _disposed = true;
    _revision++;
    super.dispose();
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
