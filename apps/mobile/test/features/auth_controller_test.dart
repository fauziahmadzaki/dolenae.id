import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:flutter_test/flutter_test.dart';

const _session = AuthSession(
  token: 'token-123',
  user: AuthUser(
    id: 'user-1',
    name: 'Dimas Pratama',
    email: 'wisatawan@dolenae.id',
    role: 'wisatawan',
  ),
);

void main() {
  test('login berhasil menyimpan sesi dari backend', () async {
    final repository = _FakeAuthRepository(loginResult: const Success(_session));
    final controller = AuthController(repository: repository);

    final failure = await controller.login(
      email: 'wisatawan@dolenae.id',
      password: 'dolenae123',
    );

    expect(failure, isNull);
    expect(controller.isAuthenticated, isTrue);
    expect(controller.user?.name, 'Dimas Pratama');
    expect(controller.token, 'token-123');
    expect(repository.loginCalls, 1);
  });

  test('login gagal menampilkan pesan backend', () async {
    final repository = _FakeAuthRepository(
      loginResult: const Failure(
        AuthFailure('Email atau password salah', code: 'UNAUTHORIZED'),
      ),
    );
    final controller = AuthController(repository: repository);

    final failure = await controller.login(
      email: 'salah@dolenae.id',
      password: 'salah',
    );

    expect(failure?.message, 'Email atau password salah');
    expect(controller.isAuthenticated, isFalse);
  });

  test('register berhasil menyimpan sesi dari backend', () async {
    final repository = _FakeAuthRepository(
      registerResult: const Success(_session),
    );
    final controller = AuthController(repository: repository);

    final failure = await controller.register(
      name: 'Dimas Pratama',
      email: 'wisatawan@dolenae.id',
      password: 'dolenae123',
    );

    expect(failure, isNull);
    expect(controller.user?.email, 'wisatawan@dolenae.id');
  });

  test('verifySession menghapus sesi saat token ditolak', () async {
    final repository = _FakeAuthRepository(
      verifyResult: const Failure(AuthFailure('Token tidak valid')),
    );
    final controller = AuthController(
      repository: repository,
      initialSession: _session,
    );

    await controller.verifySession();

    expect(controller.isAuthenticated, isFalse);
    expect(repository.verifyCalls, 1);
  });

  test('verifySession mempertahankan sesi saat offline', () async {
    final repository = _FakeAuthRepository(
      verifyResult: const Failure(NetworkFailure('Tidak dapat memeriksa sesi.')),
    );
    final controller = AuthController(
      repository: repository,
      initialSession: _session,
    );

    await controller.verifySession();

    expect(controller.isAuthenticated, isTrue);
  });

  test('verifySession memperbarui profil dari backend', () async {
    final repository = _FakeAuthRepository(
      verifyResult: const Success(
        AuthSession(
          token: 'token-123',
          user: AuthUser(
            id: 'user-1',
            name: 'Nama Baru',
            email: 'wisatawan@dolenae.id',
            role: 'wisatawan',
          ),
        ),
      ),
    );
    final controller = AuthController(
      repository: repository,
      initialSession: _session,
    );

    await controller.verifySession();

    expect(controller.user?.name, 'Nama Baru');
  });

  test('requestPasswordReset meneruskan pesan backend', () async {
    final repository = _FakeAuthRepository(
      forgotPasswordResult: const Success('Tautan sudah dikirim.'),
    );
    final controller = AuthController(repository: repository);

    final result = await controller.requestPasswordReset('dimas@mail.com');

    expect(result.valueOrNull, 'Tautan sudah dikirim.');
    expect(repository.forgotPasswordEmail, 'dimas@mail.com');
  });
}

class _FakeAuthRepository implements AuthRepository {
  _FakeAuthRepository({
    this.loginResult = const Failure(AuthFailure('belum diatur')),
    this.registerResult = const Failure(AuthFailure('belum diatur')),
    this.verifyResult = const Failure(AuthFailure('belum diatur')),
    this.forgotPasswordResult = const Failure(AuthFailure('belum diatur')),
  });

  final Result<AuthSession> loginResult;
  final Result<AuthSession> registerResult;
  final Result<AuthSession> verifyResult;
  final Result<String> forgotPasswordResult;

  int loginCalls = 0;
  int verifyCalls = 0;
  String? forgotPasswordEmail;

  @override
  Future<Result<AuthSession>> restore() async => const Success(_session);

  @override
  Future<Result<AuthSession>> verify() async {
    verifyCalls++;
    return verifyResult;
  }

  @override
  Future<Result<AuthSession>> login({
    required String email,
    required String password,
  }) async {
    loginCalls++;
    return loginResult;
  }

  @override
  Future<Result<AuthSession>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    return registerResult;
  }

  @override
  Future<Result<String>> forgotPassword({required String email}) async {
    forgotPasswordEmail = email;
    return forgotPasswordResult;
  }

  @override
  Future<Result<void>> logout() async => const Success(null);
}
