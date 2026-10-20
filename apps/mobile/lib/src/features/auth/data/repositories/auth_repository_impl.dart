import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_local_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._remote, this._local, this._client);

  final AuthRemoteDataSource _remote;
  final AuthLocalDataSource _local;
  final ApiClient _client;

  @override
  Future<Result<AuthSession>> restore() async {
    try {
      final session = await _local.read();
      if (session == null) {
        return const Failure(AuthFailure('Sesi tidak ditemukan.'));
      }
      _client.token = session.token;
      return Success(session);
    } catch (_) {
      // A broken keystore should start the app as a guest, not crash it.
      return const Failure(AuthFailure('Sesi tidak dapat dibaca.'));
    }
  }

  @override
  Future<Result<AuthSession>> verify() async {
    final token = _client.token;
    if (token == null || token.isEmpty) {
      return const Failure(AuthFailure('Sesi tidak ditemukan.'));
    }

    try {
      final user = await _remote.me();
      final session = AuthSession(token: token, user: user);
      await _local.save(session);
      return Success(session);
    } on ApiException catch (error) {
      if (_invalidatesSession(error.statusCode)) {
        // Expired or revoked token: drop it so the router returns to login.
        _client.token = null;
        try {
          await _local.clear();
        } catch (_) {
          // Nothing else to clear; the in-memory session is gone anyway.
        }
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
    return _authenticate(
      () => _remote.login(email: email, password: password),
    );
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
  Future<Result<void>> logout() async {
    _client.token = null;
    try {
      await _local.clear();
      return const Success(null);
    } catch (_) {
      return const Failure(AuthFailure('Gagal menghapus sesi.'));
    }
  }

  Future<Result<AuthSession>> _authenticate(
    Future<AuthSession> Function() request,
  ) async {
    try {
      final session = await request();
      await _local.save(session);
      _client.token = session.token;
      return Success(session);
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
}
