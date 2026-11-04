import 'dart:async';
import 'dart:convert';

import 'package:drift/native.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/app/app.dart';
import 'package:dolenae_mobile/src/app/di/app_dependencies.dart';
import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_local_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/secure_token_store.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
import 'package:dolenae_mobile/src/features/notifications/presentation/controllers/notifications_controller.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/controllers/payment_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/controllers/settings_controller.dart';

import '../data/payments_api_test.dart' show invoiceJson;
import '../helpers/test_harness.dart' show usePhone, useTestFonts;

const _session = AuthSession(
  token: 'test-payment-session',
  user: AuthUser(
    id: 'payment-user',
    name: 'Payment',
    email: 'payment@example.invalid',
    role: 'wisatawan',
  ),
);
const _userJson = {
  'id': 'payment-user',
  'name': 'Payment',
  'email': 'payment@example.invalid',
  'role': 'wisatawan',
};

http.Response _ok(Object? data) =>
    http.Response(jsonEncode({'success': true, 'data': data}), 200);

http.Response _failure(int status) => http.Response(
  jsonEncode({
    'success': false,
    'error': {'message': 'Sesi pembayaran ditolak.', 'code': 'PAYMENT_DENIED'},
  }),
  status,
);

http.Response _success(http.Request request) => _ok(switch (request.url.path) {
  '/api/auth/me' => {'user': _userJson},
  '/api/payments/mine' => [invoiceJson()],
  '/api/users/me/settings' => {
    'theme': 'terang',
    'language': 'id',
    'dataSaver': true,
    'notifications': {
      'rekomendasi': true,
      'pengingatRencana': true,
      'pengingatChecklist': true,
      'fasilitasBaru': false,
      'promo': false,
    },
    'privacy': {
      'profilPublik': false,
      'bagikanAktivitas': false,
      'analitik': false,
    },
  },
  '/api/trips' => [
    {
      'id': 'payment-trip',
      'name': 'Rencana pembayaran',
      'startDate': '2030-01-01',
      'endDate': '2030-01-02',
      'peopleCount': 2,
      'status': 'aktif',
      'items': [],
    },
  ],
  '/api/notifications' => [
    {
      'id': 'payment-notification',
      'kind': 'sistem',
      'title': 'Pembayaran',
      'body': 'Tersimpan',
      'read': false,
      'createdAt': '2026-01-01T00:00:00Z',
    },
  ],
  _ => [],
});

Future<AppDependencies> _boot(
  WidgetTester tester,
  Future<http.Response> Function(http.Request) handle, {
  AuthSession? initialSession = _session,
}) async {
  await usePhone(tester);
  SharedPreferences.setMockInitialValues({
    AuthLocalDataSource.userKey: jsonEncode(_userJson),
    AuthLocalDataSource.rememberedEmailKey: _session.user.email,
  });
  FlutterSecureStorage.setMockInitialValues({
    SecureTokenStore.accessTokenKey: _session.token,
  });
  final prefs = await SharedPreferences.getInstance();
  final client = MockClient(handle);
  final dependencies = http.runWithClient(
    () => AppDependencies.create(
      database: AppDatabase.forTesting(NativeDatabase.memory()),
      prefs: prefs,
    ),
    () => client,
  );
  addTearDown(client.close);
  await tester.pumpWidget(
    DolenaeApp(dependencies: dependencies, initialSession: initialSession),
  );
  await tester.pumpAndSettle();
  return dependencies;
}

GoRouter _router(WidgetTester tester) =>
    tester.widget<MaterialApp>(find.byType(MaterialApp)).routerConfig!
        as GoRouter;

void main() {
  setUpAll(useTestFonts);

  testWidgets(
    'current payment 401 clears session, storage and personal state',
    (tester) async {
      var rejectPayment = false;
      final dependencies = await _boot(tester, (request) async {
        if (rejectPayment && request.url.path == '/api/payments/mine') {
          return _failure(401);
        }
        return _success(request);
      });
      final context = tester.element(find.byType(MaterialApp));
      final auth = context.read<AuthController>();
      final payments = context.read<PaymentController>();
      final plans = context.read<PlanController>();
      final notifications = context.read<NotificationsController>();
      final settings = context.read<SettingsController>();
      final saved = context.read<SavedController>();
      final checklist = context.read<ChecklistController>();
      final router = _router(tester);
      router.go('/payments');
      await tester.pumpAndSettle();
      expect(payments.invoices, hasLength(1));
      expect(plans.plans, hasLength(1));
      expect(notifications.unreadCount, 1);
      expect(settings.settings.dataSaver, isTrue);

      rejectPayment = true;
      final result = await dependencies.paymentRepository.listMine();
      await tester.pumpAndSettle();

      expect(result.failureOrNull, isA<AuthFailure>());
      expect(result.failureOrNull?.message, 'Sesi pembayaran ditolak.');
      expect(auth.isAuthenticated, isFalse);
      expect(dependencies.apiClient.token, isNull);
      expect(await SecureTokenStore().readAccessToken(), isNull);
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.containsKey(AuthLocalDataSource.userKey), isFalse);
      expect(
        prefs.getString(AuthLocalDataSource.rememberedEmailKey),
        _session.user.email,
      );
      expect(payments.invoices, isEmpty);
      expect(plans.plans, isEmpty);
      expect(notifications.notifications, isEmpty);
      expect(settings.settings.dataSaver, isFalse);
      expect(saved.savedDestinations, isEmpty);
      expect(checklist.items, isEmpty);
      expect(router.routeInformationProvider.value.uri.path, '/login');
      router.push('/login');
      await tester.pumpAndSettle();
      expect(router.routeInformationProvider.value.uri.path, '/login');
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump(const Duration(milliseconds: 10));
    },
  );

  testWidgets('delayed old payment 401 preserves the new account', (
    tester,
  ) async {
    final pending = Completer<http.Response>();
    final started = Completer<void>();
    const newUser = {
      'id': 'new-payment-user',
      'name': 'New Payment',
      'email': 'new-payment@example.invalid',
      'role': 'wisatawan',
    };
    final dependencies = await _boot(tester, (request) async {
      if (request.url.path == '/api/payments/mine') {
        expect(request.headers['authorization'], 'Bearer ${_session.token}');
        started.complete();
        return pending.future;
      }
      if (request.url.path == '/api/auth/login') {
        return _ok({'token': 'test-new-payment-session', 'user': newUser});
      }
      return _success(request);
    });
    final auth = tester
        .element(find.byType(MaterialApp))
        .read<AuthController>();
    final result = dependencies.paymentRepository.listMine();
    await started.future;
    await auth.logout();
    expect(
      await auth.login(email: newUser['email']!, password: 'test-only'),
      isNull,
    );
    await tester.pumpAndSettle();
    final router = _router(tester);
    router.go('/plan');
    await tester.pumpAndSettle();

    pending.complete(_failure(401));
    expect((await result).failureOrNull, isA<AuthFailure>());
    await tester.pumpAndSettle();
    expect(auth.user?.id, newUser['id']);
    expect(auth.token, 'test-new-payment-session');
    expect(dependencies.apiClient.token, auth.token);
    expect(await SecureTokenStore().readAccessToken(), auth.token);
    final prefs = await SharedPreferences.getInstance();
    expect(
      jsonDecode(prefs.getString(AuthLocalDataSource.userKey)!)['id'],
      newUser['id'],
    );
    expect(router.routeInformationProvider.value.uri.path, '/plan');
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump(const Duration(milliseconds: 10));
    expect(dependencies.apiClient.onUnauthorized, isNull);
  });

  for (final failure in ['forbidden', 'network']) {
    testWidgets('payment $failure preserves the authenticated session', (
      tester,
    ) async {
      final dependencies = await _boot(tester, (request) async {
        if (request.url.path == '/api/payments/mine') {
          if (failure == 'network') throw http.ClientException('offline');
          return _failure(403);
        }
        return _success(request);
      });
      final auth = tester
          .element(find.byType(MaterialApp))
          .read<AuthController>();
      final router = _router(tester);
      router.go('/payments');
      await tester.pumpAndSettle();
      expect(
        (await dependencies.paymentRepository.listMine()).isFailure,
        isTrue,
      );
      await tester.pumpAndSettle();
      expect(auth.isAuthenticated, isTrue);
      expect(auth.token, _session.token);
      expect(dependencies.apiClient.token, _session.token);
      expect(await SecureTokenStore().readAccessToken(), _session.token);
      expect(router.routeInformationProvider.value.uri.path, '/payments');
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump(const Duration(milliseconds: 10));
    });
  }

  testWidgets(
    'guest login 401 cannot invalidate a later authenticated session',
    (tester) async {
      final pending = Completer<http.Response>();
      final started = Completer<void>();
      var firstLogin = true;
      final dependencies = await _boot(tester, (request) async {
        if (request.url.path == '/api/auth/login') {
          expect(request.headers['authorization'], isNull);
          if (firstLogin) {
            firstLogin = false;
            started.complete();
            return pending.future;
          }
          return _ok({'token': _session.token, 'user': _userJson});
        }
        return _success(request);
      }, initialSession: null);
      final auth = tester
          .element(find.byType(MaterialApp))
          .read<AuthController>();
      final router = _router(tester);
      router.go('/login');
      await tester.pumpAndSettle();
      final guestRequest = dependencies.apiClient.post('/auth/login');
      await started.future;
      expect(
        await auth.login(email: _session.user.email, password: 'test-only'),
        isNull,
      );
      await tester.pumpAndSettle();

      pending.complete(_failure(401));
      await expectLater(guestRequest, throwsA(isA<ApiException>()));
      await tester.pumpAndSettle();
      expect(auth.isAuthenticated, isTrue);
      expect(auth.token, _session.token);
      expect(dependencies.apiClient.token, _session.token);
      expect(await SecureTokenStore().readAccessToken(), _session.token);
      expect(router.routeInformationProvider.value.uri.path, '/home');
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump(const Duration(milliseconds: 10));
    },
  );
}
