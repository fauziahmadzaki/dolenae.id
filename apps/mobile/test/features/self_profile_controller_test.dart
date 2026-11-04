import 'dart:async';

import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:flutter_test/flutter_test.dart';

const session = AuthSession(token: 'test-session-a', user: AuthUser(
  id: 'user-a', name: 'Nama Lama', email: 'a@example.test', role: 'wisatawan',
));
const updated = AuthSession(token: 'test-session-a', user: AuthUser(
  id: 'user-a', name: 'Nama Baru', email: 'a@example.test', role: 'wisatawan',
));
const other = AuthSession(token: 'test-session-b', user: AuthUser(
  id: 'user-b', name: 'User B', email: 'b@example.test', role: 'merchant',
));

void main() {
  for (final name in ['', ' A ', 'x' * 121]) {
    test('rejects invalid name before repository: ${name.length}', () async {
      final repository = ProfileAuthFake();
      final controller = AuthController(repository: repository, initialSession: session);
      final result = await controller.updateProfile(name);
      expect(result, isA<ValidationFailure>());
      expect(repository.updateCalls, 0);
      controller.dispose();
    });
  }

  test('failed update preserves session and stops busy state', () async {
    final repository = ProfileAuthFake();
    final controller = AuthController(repository: repository, initialSession: session);
    final pending = controller.updateProfile('Nama Baru');
    repository.update.complete(const Failure(NetworkFailure('Tidak tersimpan')));
    expect((await pending)?.message, 'Tidak tersimpan');
    expect(controller.user, same(session.user));
    expect(controller.isUpdatingProfile, isFalse);
    controller.dispose();
  });

  test('duplicate save does not dispatch a second request', () async {
    final repository = ProfileAuthFake();
    final controller = AuthController(repository: repository, initialSession: session);
    final pending = controller.updateProfile('Nama Baru');
    expect(await controller.updateProfile('Nama Lagi'), isA<ValidationFailure>());
    expect(repository.updateCalls, 1);
    repository.update.complete(const Success(updated));
    await pending;
    controller.dispose();
  });

  for (final action in ['logout', 'switch', 'dispose']) {
    test('late update cannot apply after $action', () async {
      final repository = ProfileAuthFake();
      final controller = AuthController(repository: repository, initialSession: session);
      var notifications = 0;
      controller.addListener(() => notifications++);
      final pending = controller.updateProfile('Nama Baru');
      if (action == 'logout') await controller.logout();
      if (action == 'switch') await controller.login(email: other.user.email, password: 'unused');
      if (action == 'dispose') controller.dispose();
      final count = notifications;
      repository.update.complete(const Success(updated));
      expect(await pending, isA<AuthFailure>());
      expect(notifications, count);
      if (action == 'logout') expect(controller.isAuthenticated, isFalse);
      if (action == 'switch') expect(controller.user?.id, 'user-b');
      if (action != 'dispose') controller.dispose();
    });
  }

  for (final action in ['logout', 'update', 'dispose']) {
    test('late verify cannot apply after $action', () async {
      final repository = ProfileAuthFake();
      final controller = AuthController(repository: repository, initialSession: session);
      final pending = controller.verifySession();
      if (action == 'logout') await controller.logout();
      if (action == 'update') {
        final saving = controller.updateProfile('Nama Baru');
        repository.update.complete(const Success(updated));
        await saving;
      }
      if (action == 'dispose') controller.dispose();
      repository.verifyResult.complete(const Success(session));
      await pending;
      if (action == 'logout') expect(controller.isAuthenticated, isFalse);
      if (action == 'update') expect(controller.user?.name, 'Nama Baru');
      if (action != 'dispose') controller.dispose();
    });
  }

  test('updateProfile uses repository name, updates identity without replacing token', () async {
    final repository = ProfileAuthFake();
    final controller = AuthController(repository: repository, initialSession: session);
    final update = controller.updateProfile(' Nama Baru ');
    expect(controller.isUpdatingProfile, isTrue);
    expect(repository.name, 'Nama Baru');
    repository.update.complete(const Success(updated));
    expect(await update, isNull);
    expect(controller.user?.name, 'Nama Baru');
    expect(controller.token, session.token);
    expect(controller.user?.email, session.user.email);
    expect(controller.user?.role, session.user.role);
    expect(controller.isUpdatingProfile, isFalse);
    controller.dispose();
  });
}

class ProfileAuthFake implements AuthRepository {
  final update = Completer<Result<AuthSession>>();
  final verifyResult = Completer<Result<AuthSession>>();
  String? name;
  int updateCalls = 0;
  @override
  Future<Result<AuthSession>> updateProfile({required String name}) {
    updateCalls++;
    this.name = name;
    return update.future;
  }
  @override
  Future<Result<AuthSession>> verify() => verifyResult.future;
  @override
  Future<Result<void>> logout() async => const Success(null);
  @override
  Future<Result<AuthSession>> login({required String email, required String password}) async => const Success(other);
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
