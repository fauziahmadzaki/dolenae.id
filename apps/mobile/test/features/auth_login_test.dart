import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/screens/login_screen.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_harness.dart';

const _session = AuthSession(
  token: 'token-uji',
  user: AuthUser(
    id: 'user-1',
    name: 'Dimas Pratama',
    email: 'dimas@mail.com',
    role: 'wisatawan',
  ),
);

void main() {
  setUpAll(() async {
    await useTestFonts();
  });

  testWidgets('Ingat saya menyimpan email setelah login berhasil', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _LoginFakeAuthRepository();
    await tester.pumpWidget(
      wrapScreen(
        const LoginScreen(),
        store: TestStores(authRepository: repository),
      ),
    );
    await tester.pumpAndSettle();

    final fields = find.byType(TextField);
    await tester.enterText(fields.at(0), 'dimas@mail.com');
    await tester.enterText(fields.at(1), 'dolenae123');

    final submit = find.widgetWithText(DnPrimaryButton, 'Masuk');
    await scrollTo(tester, submit);
    await tester.tap(submit);
    await tester.pumpAndSettle();

    expect(repository.loginCalls, 1);
    expect(repository.rememberedEmail, 'dimas@mail.com');
  });

  testWidgets('Ingat saya yang dilepas menghapus email tersimpan', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _LoginFakeAuthRepository();
    await tester.pumpWidget(
      wrapScreen(
        const LoginScreen(),
        store: TestStores(authRepository: repository),
      ),
    );
    await tester.pumpAndSettle();

    final fields = find.byType(TextField);
    await tester.enterText(fields.at(0), 'dimas@mail.com');
    await tester.enterText(fields.at(1), 'dolenae123');

    final remember = find.text('Ingat saya');
    await scrollTo(tester, remember);
    await tester.tap(remember);
    await tester.pump();

    final submit = find.widgetWithText(DnPrimaryButton, 'Masuk');
    await scrollTo(tester, submit);
    await tester.tap(submit);
    await tester.pumpAndSettle();

    expect(repository.rememberedEmail, isNull);
  });

  testWidgets('email tersimpan mengisi otomatis kolom email', (tester) async {
    await usePhone(tester);
    await tester.pumpWidget(
      wrapScreen(
        const LoginScreen(),
        store: TestStores(
          authRepository: _LoginFakeAuthRepository(),
          rememberedEmail: 'dolenae@mail.com',
        ),
      ),
    );
    await tester.pumpAndSettle();

    final email = tester.widget<TextField>(find.byType(TextField).at(0));
    expect(email.controller?.text, 'dolenae@mail.com');
  });

  testWidgets('form daftar meminta konfirmasi kata sandi yang cocok', (
    tester,
  ) async {
    await usePhone(tester);
    await tester.pumpWidget(
      wrapScreen(
        const LoginScreen(),
        store: TestStores(authRepository: _LoginFakeAuthRepository()),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Daftar').first);
    await tester.pumpAndSettle();

    final fields = find.byType(TextField);
    expect(fields, findsNWidgets(4));

    await tester.enterText(fields.at(0), 'Dimas');
    await tester.enterText(fields.at(1), 'dimas@mail.com');
    await tester.enterText(fields.at(2), 'dolenae123');
    await tester.enterText(fields.at(3), 'dolenae124');

    final submit = find.widgetWithText(DnPrimaryButton, 'Daftar');
    await scrollTo(tester, submit);
    await tester.tap(submit);
    await tester.pumpAndSettle();

    expect(find.text('Konfirmasi kata sandi tidak cocok.'), findsOneWidget);
  });

  testWidgets('konfirmasi kata sandi yang sama meneruskan pendaftaran', (
    tester,
  ) async {
    await usePhone(tester);
    final repository = _LoginFakeAuthRepository();
    await tester.pumpWidget(
      wrapScreen(
        const LoginScreen(),
        store: TestStores(authRepository: repository),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Daftar').first);
    await tester.pumpAndSettle();

    final fields = find.byType(TextField);
    await tester.enterText(fields.at(0), 'Dimas');
    await tester.enterText(fields.at(1), 'dimas@mail.com');
    await tester.enterText(fields.at(2), 'dolenae123');
    await tester.enterText(fields.at(3), 'dolenae123');

    final submit = find.widgetWithText(DnPrimaryButton, 'Daftar');
    await scrollTo(tester, submit);
    await tester.tap(submit);
    await tester.pumpAndSettle();

    expect(repository.registerCalls, 1);
    expect(find.text('Konfirmasi kata sandi tidak cocok.'), findsNothing);
  });

  testWidgets('Lupa kata sandi membuka layar atur ulang', (tester) async {
    await usePhone(tester);
    await tester.pumpWidget(
      wrapScreen(
        const LoginScreen(),
        store: TestStores(authRepository: _LoginFakeAuthRepository()),
      ),
    );
    await tester.pumpAndSettle();

    final link = find.text('Lupa kata sandi?');
    await scrollTo(tester, link);
    await tester.tap(link);
    await tester.pumpAndSettle();

    expect(find.text('Layar lain'), findsOneWidget);
  });
}

class _LoginFakeAuthRepository implements AuthRepository {
  int loginCalls = 0;
  int registerCalls = 0;
  String? rememberedEmail;

  @override
  Future<Result<AuthSession>> restore() async => const Success(_session);

  @override
  Future<Result<AuthSession>> verify() async => const Success(_session);

  @override
  Future<Result<AuthSession>> login({
    required String email,
    required String password,
  }) async {
    loginCalls++;
    return const Success(_session);
  }

  @override
  Future<Result<AuthSession>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    registerCalls++;
    return const Success(_session);
  }

  @override
  Future<Result<AuthSession>> googleSignIn() async => const Failure(
    AuthFailure('Google belum dikonfigurasi.', code: 'GOOGLE_FAILED'),
  );

  @override
  Future<Result<String>> forgotPassword({required String email}) async =>
      const Success('Tautan sudah dikirim.');

  @override
  Future<Result<String>> resendVerificationEmail({
    required String email,
  }) async => const Success('Tautan verifikasi sudah dikirim.');

  @override
  Future<Result<void>> logout() async => const Success(null);

  @override
  Future<String?> readRememberedEmail() async => rememberedEmail;

  @override
  Future<void> writeRememberedEmail(String? email) async {
    rememberedEmail = email;
  }
}
