import 'dart:convert';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/plan/data/repositories/plan_repository_impl.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/plan_new_screen.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/trip_plan_screen.dart';
import 'package:dolenae_mobile/src/features/settings/data/repositories/settings_repository_impl.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/controllers/settings_controller.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_feedback_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider/provider.dart';

import '../helpers/test_harness.dart';

void main() {
  setUpAll(useTestFonts);
  testWidgets('akun baru menampilkan rencana kosong tanpa trip contoh', (
    tester,
  ) async {
    await usePhone(tester);
    final api = ApiClient(
      httpClient: MockClient(
        (_) async =>
            http.Response(jsonEncode({'success': true, 'data': []}), 200),
      ),
    );
    final c = PlanController(PlanRepositoryImpl(api: api))
      ..setSession('user-a');
    await tester.pumpWidget(
      wrapScreen(
        ChangeNotifierProvider.value(value: c, child: const TripPlanScreen()),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Belum ada rencana'), findsOneWidget);
    expect(find.text('Trip Dieng'), findsNothing);
    expect(find.text('Buat rencana'), findsOneWidget);
  });

  testWidgets('simpan rencana menunggu API, gagal tetap di form', (
    tester,
  ) async {
    await usePhone(tester);
    final requests = <http.Request>[];
    final c = PlanController(
      PlanRepositoryImpl(
        api: ApiClient(
          httpClient: MockClient((r) async {
            requests.add(r);
            return http.Response(
              jsonEncode({
                'success': false,
                'error': {'message': 'Tidak tersimpan'},
              }),
              500,
            );
          }),
        ),
      ),
    )..setSession('user-a');
    await tester.pumpWidget(
      wrapScreen(
        ChangeNotifierProvider.value(value: c, child: const PlanNewScreen()),
      ),
    );
    await tester.pumpAndSettle();
    await tester.enterText(inputFor('Nama rencana'), 'Trip nyata');
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Simpan rencana'));
    await tester.pumpAndSettle();
    expect(requests, hasLength(1));
    final body = jsonDecode(requests.single.body) as Map<String, dynamic>;
    expect(body['startDate'], matches(r'^\d{4}-\d{2}-\d{2}$'));
    expect(body['endDate'], matches(r'^\d{4}-\d{2}-\d{2}$'));
    expect(find.text('Tidak tersimpan'), findsWidgets);
    expect(find.text('Trip nyata'), findsOneWidget);
    expect(c.plans, isEmpty);
  });

  testWidgets('feedback gagal tidak menampilkan sukses palsu', (tester) async {
    await usePhone(tester);
    var submitted = false;
    final c = SettingsController(
      SettingsRepositoryImpl(
        api: ApiClient(
          httpClient: MockClient((r) async {
            submitted = true;
            return http.Response(
              jsonEncode({
                'success': false,
                'error': {'message': 'Masukan gagal'},
              }),
              500,
            );
          }),
        ),
      ),
    )..setSession('user-a');
    await tester.pumpWidget(
      wrapScreen(
        ChangeNotifierProvider.value(
          value: c,
          child: const SettingsFeedbackScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.enterText(inputFor('Subjek'), 'Perbaikan');
    await tester.enterText(inputFor('Pesan'), 'Mohon perbaiki daftar rencana.');
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Kirim masukan'));
    await tester.pumpAndSettle();
    expect(submitted, isTrue);
    expect(find.text('Masukan gagal'), findsWidgets);
    expect(
      find.text('Masukan terkirim, terima kasih sudah membantu.'),
      findsNothing,
    );
  });
}
