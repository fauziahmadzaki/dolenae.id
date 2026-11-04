import 'dart:convert';

import 'package:drift/native.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/app/app.dart';
import 'package:dolenae_mobile/src/app/di/app_dependencies.dart';
import 'package:dolenae_mobile/src/core/database/app_database.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
import 'package:dolenae_mobile/src/features/notifications/presentation/controllers/notifications_controller.dart';
import 'package:dolenae_mobile/src/features/payments/presentation/controllers/payment_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/controllers/settings_controller.dart';

import '../helpers/test_harness.dart' show useTestFonts;
import '../data/payments_api_test.dart' show invoiceJson;

void main() {
  setUpAll(useTestFonts);
  testWidgets(
    'runtime wires one authenticated API, clears personal data on logout',
    (tester) async {
      SharedPreferences.setMockInitialValues({});
      FlutterSecureStorage.setMockInitialValues({});
      final requests = <String>[];
      const user = AuthUser(
        id: 'runtime-user',
        name: 'Runtime',
        email: 'runtime@example.invalid',
        role: 'wisatawan',
      );
      const session = AuthSession(token: 'test-runtime-session', user: user);
      final prefs = await SharedPreferences.getInstance();
      final client = MockClient((request) async {
        requests.add(request.url.path);
        Object? data = switch (request.url.path) {
          '/api/auth/me' => {
            'user': {
              'id': user.id,
              'name': user.name,
              'email': user.email,
              'role': user.role,
            },
          },
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
              'id': 'runtime-trip',
              'name': 'Rencana runtime',
              'startDate': '2030-01-01',
              'endDate': '2030-01-02',
              'peopleCount': 2,
              'budget': null,
              'notes': null,
              'status': 'aktif',
              'items': [],
            },
          ],
          '/api/notifications' => [
            {
              'id': 'runtime-notification',
              'kind': 'sistem',
              'title': 'Runtime',
              'body': 'Tersimpan',
              'read': false,
              'href': '/plan',
              'createdAt': '2026-01-01T00:00:00Z',
            },
          ],
          '/api/payments/mine' => [invoiceJson()],
          _ => [],
        };
        return http.Response(
          jsonEncode({
            'success': true,
            'data': data,
            'meta': {
              'page': 1,
              'limit':
                  int.tryParse(request.url.queryParameters['limit'] ?? '') ??
                  50,
              'total': 0,
              'totalPages': 1,
              'hasNext': false,
              'hasPrev': false,
            },
          }),
          200,
        );
      });
      final dependencies = http.runWithClient(
        () => AppDependencies.create(
          database: AppDatabase.forTesting(NativeDatabase.memory()),
          prefs: prefs,
        ),
        () => client,
      );
      await tester.pumpWidget(
        DolenaeApp(dependencies: dependencies, initialSession: session),
      );
      await tester.pump();
      final context = tester.element(find.byType(MaterialApp));
      final plan = context.read<PlanController>();
      final saved = context.read<SavedController>();
      final checklist = context.read<ChecklistController>();
      final settings = context.read<SettingsController>();
      final notifications = context.read<NotificationsController>();
      final payment = context.read<PaymentController>();
      expect(dependencies.apiClient.token, session.token);
      await plan.load();
      await saved.load();
      await settings.load();
      await notifications.load();
      await payment.loadMine();
      expect(plan.plans.single.id, 'runtime-trip');
      expect(settings.settings.dataSaver, isTrue);
      expect(notifications.unreadCount, 1);
      expect(payment.invoices, hasLength(1));
      expect(checklist.items, isEmpty);
      expect(
        requests,
        containsAll([
          '/api/trips',
          '/api/users/me/settings',
          '/api/notifications',
          '/api/saved/destinations',
          '/api/payments/mine',
        ]),
      );
      await context.read<AuthController>().logout();
      await tester.pump();
      expect(dependencies.apiClient.token, isNull);
      expect(plan.plans, isEmpty);
      expect(saved.savedDestinations, isEmpty);
      expect(checklist.items, isEmpty);
      expect(notifications.notifications, isEmpty);
      expect(payment.invoices, isEmpty);
      expect(settings.settings.dataSaver, isFalse);
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump(const Duration(milliseconds: 10));
    },
  );
}
