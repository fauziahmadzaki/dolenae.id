import 'dart:async';
import 'dart:convert';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/notifications/data/repositories/notification_repository_impl.dart';
import 'package:dolenae_mobile/src/features/notifications/presentation/controllers/notifications_controller.dart';
import 'package:dolenae_mobile/src/features/saved/data/repositories/saved_repository_impl.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/settings/data/repositories/settings_repository_impl.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/controllers/settings_controller.dart';
import 'package:dolenae_mobile/src/features/notifications/presentation/screens/notifications_screen.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_notifications_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_privacy_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_account_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_theme_screen.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_screen.dart';
import 'package:dolenae_mobile/src/features/plan/data/repositories/plan_repository_impl.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/settings/presentation/screens/settings_faq_screen.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_checklists_screen.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_destinations_screen.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_plans_screen.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_proposals_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'dart:io';
import 'package:dolenae_mobile/src/app/theme/app_theme.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

Future<void> useTestFonts() async {
  TestWidgetsFlutterBinding.ensureInitialized();
  GoogleFonts.config.allowRuntimeFetching = false;
  final bytes = ByteData.sublistView(File('C:/Windows/Fonts/arial.ttf').readAsBytesSync());
  for (final family in ['Inter', 'Poppins']) {
    for (final weight in ['100', '200', '300', '400', '500', '600', '700', 'regular']) {
      await (FontLoader('${family}_$weight')..addFont(Future.value(bytes))).load();
    }
  }
}

Future<void> usePhone(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(390, 844));
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

Widget wrapScreen(Widget child) => MaterialApp.router(
  theme: AppTheme.light(),
  routerConfig: GoRouter(routes: [GoRoute(path: '/', builder: (_, _) => child)]),
);

http.Response _ok(Object? data) =>
    http.Response(jsonEncode({'success': true, 'data': data}), 200);

Map<String, Object> _settings({bool dataSaver = false}) => {
  'theme': 'terang',
  'language': 'id',
  'dataSaver': dataSaver,
  'notifications': {
    'rekomendasi': true,
    'pengingatRencana': true,
    'pengingatChecklist': true,
    'fasilitasBaru': false,
    'promo': false,
  },
  'privacy': {
    'profilPublik': true,
    'bagikanAktivitas': true,
    'analitik': false,
  },
};

void main() {
  setUpAll(useTestFonts);
  for (final screen in <Widget>[
    const SavedDestinationsScreen(),
    const SavedPlansScreen(),
    const SavedChecklistsScreen(),
    const SavedProposalsScreen(),
  ]) {
    testWidgets('${screen.runtimeType} loads with error retry then empty', (tester) async {
      await usePhone(tester);
      final pending = Completer<http.Response>();
      var fail = true;
      var requests = 0;
      final controller = SavedController(SavedRepositoryImpl(api: ApiClient(
        httpClient: MockClient((_) {
          requests++;
          return fail ? pending.future : Future.value(_ok([]));
        }),
      )))..setSession('user-a');
      await tester.pumpWidget(wrapScreen(ChangeNotifierProvider.value(
        value: controller, child: screen,
      )));
      await tester.pump();
      expect(find.byType(LinearProgressIndicator), findsOneWidget);
      expect(requests, 4);
      pending.complete(http.Response(jsonEncode({
        'success': false, 'error': {'message': 'Daftar gagal dimuat'},
      }), 500));
      await tester.pumpAndSettle();
      expect(find.text('Daftar gagal dimuat'), findsOneWidget);
      fail = false;
      await tester.tap(find.text('Coba lagi'));
      await tester.pumpAndSettle();
      expect(requests, 8);
      expect(find.text('Daftar gagal dimuat'), findsNothing);
      expect(find.textContaining('Belum ada'), findsOneWidget);
    });
  }
  for (final kind in ['destinations', 'plans', 'checklists']) {
    testWidgets('saved $kind removal awaits persistence and preserves failures', (tester) async {
      await usePhone(tester);
      final pending = Completer<http.Response>();
      var deletes = 0;
      final controller = SavedController(SavedRepositoryImpl(api: ApiClient(httpClient: MockClient((r) {
        if (r.method == 'DELETE') { deletes++; return pending.future; }
        return Future.value(_ok([]));
      }))))..setSession('user-a');
      final screen = switch(kind) {
        'destinations' => SavedDestinationsScreen(items: [SavedSeedData.destinations.first]),
        'plans' => SavedPlansScreen(items: [SavedSeedData.plans.first]),
        _ => SavedChecklistsScreen(items: [SavedSeedData.checklists.first]),
      };
      await tester.pumpWidget(wrapScreen(ChangeNotifierProvider.value(value: controller, child: screen)));
      await tester.pumpAndSettle();
      final tooltip = switch(kind) { 'destinations' => 'Hapus dari tersimpan', 'plans' => 'Hapus rencana', _ => 'Hapus checklist' };
      await tester.tap(find.byTooltip(tooltip));
      if (kind != 'destinations') {
        await tester.pumpAndSettle();
        await tester.tap(find.text('Hapus'));
      }
      await tester.pump();
      expect(deletes, 1);
      expect(find.descendant(of: find.byType(SnackBar), matching: find.textContaining('dihapus')), findsNothing);
      pending.complete(http.Response(jsonEncode({'success': false, 'error': {'message': 'Hapus gagal'}}), 500));
      await tester.pumpAndSettle();
      expect(find.text('Hapus gagal'), findsOneWidget);
      expect(find.descendant(of: find.byType(SnackBar), matching: find.textContaining('dihapus')), findsNothing);
      expect(find.byTooltip(tooltip), findsOneWidget);
    });
  }

  testWidgets('saved plan opens its server ID only after detail load succeeds', (tester) async {
    await usePhone(tester);
    const planId = 'cd870adc-0819-411d-a1e1-f6fb4a48a681';
    final pending = <Completer<http.Response>>[];
    final requests = <http.Request>[];
    final plan = PlanController(PlanRepositoryImpl(api: ApiClient(httpClient: MockClient((request) {
      requests.add(request);
      final response = Completer<http.Response>();
      pending.add(response);
      return response.future;
    }))))..setSession('user-a');
    final saved = SavedController(SavedRepositoryImpl.demo());
    final item = SavedTripPlan(id: planId, name: 'Trip pilihan', dateRange: '2026-12-01 - 2026-12-02', destinationCount: 0, destinationTotal: 0, status: SavedPlanStatus.aktif, savedAt: DateTime(2026));
    final router = GoRouter(routes: [
      GoRoute(path: '/', builder: (_, _) => SavedPlansScreen(items: [item])),
      GoRoute(path: '/plan', builder: (_, _) => const Scaffold(body: Text('Detail rencana'))),
    ]);
    addTearDown(router.dispose);
    addTearDown(plan.dispose);
    addTearDown(saved.dispose);
    await tester.pumpWidget(MultiProvider(providers: [ChangeNotifierProvider.value(value: saved), ChangeNotifierProvider.value(value: plan)], child: MaterialApp.router(theme: AppTheme.light(), routerConfig: router)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Trip pilihan'));
    await tester.pump();
    expect(requests, hasLength(1));
    expect(requests.single.url.path, endsWith('/trips/$planId'));
    expect(find.text('Detail rencana'), findsNothing);
    pending.first.complete(http.Response(jsonEncode({'success': false, 'error': {'message': 'Rencana gagal dibuka'}}), 500));
    await tester.pumpAndSettle();
    expect(find.text('Rencana gagal dibuka'), findsOneWidget);
    expect(find.text('Trip pilihan'), findsOneWidget);
    await tester.tap(find.text('Trip pilihan'));
    await tester.pump();
    pending.last.complete(_ok({
      'id': planId, 'name': 'Trip pilihan', 'startDate': '2026-12-01', 'endDate': '2026-12-02',
      'peopleCount': 1, 'budget': 0, 'notes': null, 'status': 'aktif', 'items': [],
      'createdAt': '2026-11-03T00:00:00Z', 'updatedAt': '2026-11-03T00:00:00Z',
    }));
    await tester.pumpAndSettle();
    expect(plan.activePlan?.id, planId);
    expect(find.text('Detail rencana'), findsOneWidget);
  });

  testWidgets('saved checklist opens its own destination context', (tester) async {
    await usePhone(tester);
    const destinationId = 'cd870adc-0819-411d-a1e1-f6fb4a48a681';
    const destinationName = 'Dieng & Sikunir';
    final item = SavedChecklist(id: destinationId, name: 'Checklist server', destinationName: destinationName, completedCount: 1, totalCount: 2, finished: false, savedAt: DateTime(2026));
    final controller = SavedController(SavedRepositoryImpl.demo());
    final router = GoRouter(routes: [
      GoRoute(path: '/', builder: (_, _) => SavedChecklistsScreen(items: [item])),
      GoRoute(path: '/checklist', builder: (_, state) => Scaffold(body: Text('${state.uri.queryParameters['destinationId']} ${state.uri.queryParameters['destinationName']}'))),
    ]);
    addTearDown(router.dispose);
    addTearDown(controller.dispose);
    await tester.pumpWidget(ChangeNotifierProvider.value(value: controller, child: MaterialApp.router(theme: AppTheme.light(), routerConfig: router)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Checklist server'));
    await tester.pumpAndSettle();
    expect(find.text('$destinationId $destinationName'), findsOneWidget);
  });

  for (final screen in <Widget>[const SettingsNotificationsScreen(), const SettingsPrivacyScreen(), const SettingsScreen(), const SettingsThemeScreen()]) {
    testWidgets('${screen.runtimeType} awaits preference persistence and shows failure', (tester) async {
      await usePhone(tester);
      final pending = Completer<http.Response>();
      var writes = 0;
      final controller = SettingsController(SettingsRepositoryImpl(api: ApiClient(httpClient: MockClient((r) {
        if (r.method == 'PATCH') { writes++; return pending.future; }
        return Future.value(_ok(_settings()));
      }))))..setSession('user-a');
      await controller.load();
      await tester.pumpWidget(wrapScreen(ChangeNotifierProvider.value(value: controller, child: screen)));
      await tester.pumpAndSettle();
      if (screen is SettingsThemeScreen) {
        await tester.tap(find.text('Gelap'));
      } else {
        final control = find.byType(Switch).at(screen is SettingsPrivacyScreen ? 1 : 0);
        await tester.ensureVisible(control);
        await tester.tap(control);
      }
      await tester.pump();
      expect(writes, 1);
      for (final control in tester.widgetList<Switch>(find.byType(Switch))) {
        expect(control.onChanged, isNull);
      }
      pending.complete(http.Response(jsonEncode({'success': false, 'error': {'message': 'Preferensi gagal disimpan'}}), 500));
      await tester.pumpAndSettle();
      expect(find.text('Preferensi gagal disimpan'), findsWidgets);
      expect(controller.settings.dataSaver, isFalse);
      expect(controller.settings.privacy.profilPublik, isTrue);
      expect(controller.settings.notifications.rekomendasi, isTrue);
    });
  }

  for (final screen in <Widget>[
    const SettingsNotificationsScreen(), const SettingsPrivacyScreen(),
    const SettingsScreen(), const SettingsThemeScreen(), const SettingsAccountScreen(),
  ]) {
    testWidgets('${screen.runtimeType} exposes settings load failure and retry', (tester) async {
      await usePhone(tester);
      final pending = Completer<http.Response>();
      var requests = 0;
      final controller = SettingsController(SettingsRepositoryImpl(api: ApiClient(httpClient: MockClient((_) {
        requests++;
        return requests == 1 ? pending.future : Future.value(_ok(_settings(dataSaver: true)));
      }))))..setSession('user-a');
      final loading = controller.load();
      await tester.pumpWidget(wrapScreen(ChangeNotifierProvider.value(value: controller, child: screen)));
      await tester.pump();
      expect(find.byType(LinearProgressIndicator), findsOneWidget);
      pending.complete(http.Response(jsonEncode({'success': false, 'error': {'message': 'Pengaturan gagal dimuat'}}), 500));
      await loading;
      await tester.pumpAndSettle();
      expect(find.text('Pengaturan gagal dimuat'), findsOneWidget);
      await tester.tap(find.text('Coba lagi'));
      await tester.pumpAndSettle();
      expect(requests, 2);
      expect(controller.settings.dataSaver, isTrue);
      expect(find.text('Pengaturan gagal dimuat'), findsNothing);
      controller.dispose();
    });
  }

  for (final demo in [false, true]) {
    for (final enabled in [false, true]) {
      test('2FA refuses unsupported change $enabled in demo $demo', () async {
        var requests = 0;
        final repository = demo ? SettingsRepositoryImpl.demo() : SettingsRepositoryImpl(api: ApiClient(httpClient: MockClient((_) async {
          requests++;
          return _ok(_settings());
        })));
        final controller = SettingsController(repository)..setSession('user-a');
        final result = await controller.setPrivacyPreference(twoFactor: enabled, profilPublik: false);
        expect(result.isFailure, isTrue);
        expect(result.failureOrNull?.message, 'Verifikasi dua langkah belum tersedia.');
        expect(controller.settings.privacy.twoFactor, isFalse);
        expect(controller.settings.privacy.profilPublik, isTrue);
        expect(requests, 0);
        controller.dispose();
      });
    }
  }

  testWidgets('unavailable security controls stay disabled including demo 2FA', (tester) async {
    await usePhone(tester);
    for (final repository in [SettingsRepositoryImpl(), SettingsRepositoryImpl.demo()]) {
      final controller = SettingsController(repository);
      await tester.pumpWidget(wrapScreen(ChangeNotifierProvider.value(value: controller, child: const SettingsPrivacyScreen())));
      await tester.pumpAndSettle();
      final twoFactor = tester.widget<Switch>(find.byType(Switch).first);
      expect(twoFactor.value, isFalse);
      expect(twoFactor.onChanged, isNull);
      expect(find.textContaining('Minta OTP'), findsNothing);
      expect(find.text('Belum tersedia'), findsWidgets);
      await tester.ensureVisible(find.text('Minta salinan data'));
      expect(tester.widget<OutlinedButton>(find.widgetWithText(OutlinedButton, 'Minta salinan data')).onPressed, isNull);
    }
    await tester.pumpWidget(wrapScreen(ChangeNotifierProvider.value(value: SettingsController(SettingsRepositoryImpl()), child: const SettingsAccountScreen())));
    await tester.pumpAndSettle();
    for (final label in ['Kata sandi', 'Perangkat aktif', 'Hapus akun']) {
      await tester.tap(find.text(label));
      await tester.pumpAndSettle();
    }
    expect(find.byType(AlertDialog), findsNothing);
    expect(find.text('Permintaan hapus akun dicatat'), findsNothing);
    expect(find.text('Diperbarui 3 bulan lalu'), findsNothing);
    expect(find.text('Belum tersedia'), findsNWidgets(3));
  });

  testWidgets('notification navigation waits for confirmed read and preserves failure', (tester) async {
    await usePhone(tester);
    final pending = <Completer<http.Response>>[];
    final requests = <http.Request>[];
    final controller = NotificationsController(NotificationRepositoryImpl(api: ApiClient(httpClient: MockClient((request) {
      requests.add(request);
      if (request.method == 'PATCH') {
        final response = Completer<http.Response>();
        pending.add(response);
        return response.future;
      }
      return Future.value(_ok([{
        'id': 'notice/server-1', 'kind': 'sistem', 'title': 'Rencana server',
        'body': 'Buka rencana', 'read': false, 'href': '/plan',
        'createdAt': '2026-11-03T00:00:00Z',
      }]));
    }))))..setSession('user-a');
    final router = GoRouter(routes: [
      GoRoute(path: '/', builder: (_, _) => const NotificationsScreen()),
      GoRoute(path: '/plan', builder: (_, _) => const Scaffold(body: Text('Rencana tujuan'))),
    ]);
    addTearDown(router.dispose);
    addTearDown(controller.dispose);
    await tester.pumpWidget(ChangeNotifierProvider.value(value: controller, child: MaterialApp.router(theme: AppTheme.light(), routerConfig: router)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Rencana server'));
    await tester.pump();
    expect(find.text('Rencana tujuan'), findsNothing);
    expect(controller.unreadCount, 1);
    expect(tester.widget<TextButton>(find.widgetWithText(TextButton, 'Tandai dibaca')).onPressed, isNull);
    pending.first.complete(http.Response(jsonEncode({'success': false, 'error': {'message': 'Baca gagal'}}), 500));
    await tester.pumpAndSettle();
    expect(find.text('Baca gagal'), findsWidgets);
    expect(find.text('Rencana server'), findsOneWidget);
    expect(controller.unreadCount, 1);
    await tester.tap(find.text('Rencana server'));
    await tester.pump();
    pending.last.complete(_ok(null));
    await tester.pumpAndSettle();
    expect(controller.unreadCount, 0);
    expect(find.text('Rencana tujuan'), findsOneWidget);
    expect(requests.where((request) => request.method == 'PATCH').map((request) => request.url.toString()), everyElement(contains('/notifications/notice%2Fserver-1/read')));
  });

  for (final feature in ['notifications', 'faq']) {
    testWidgets('$feature loads reactive remote data with retry', (tester) async {
      await usePhone(tester);
      final pending = Completer<http.Response>();
      var fail = true;
      var requests = 0;
      final api = ApiClient(httpClient: MockClient((_) {
        requests++;
        return fail ? pending.future : Future.value(_ok(feature == 'faq' ? [
          {'id': 'f1', 'category': 'akun', 'question': 'Pertanyaan server?', 'answer': 'Jawaban server.'},
        ] : [
          {'id': 'n1', 'kind': 'sistem', 'title': 'Notifikasi server', 'body': 'Pesan server', 'read': false, 'href': null, 'createdAt': '2026-11-03T00:00:00Z'},
        ]));
      }));
      final notifications = NotificationsController(NotificationRepositoryImpl(api: api))..setSession('user-a');
      final settings = SettingsController(SettingsRepositoryImpl(api: api))..setSession('user-a');
      await tester.pumpWidget(wrapScreen(MultiProvider(providers: [
        ChangeNotifierProvider.value(value: notifications),
        ChangeNotifierProvider.value(value: settings),
      ], child: feature == 'faq' ? const SettingsFaqScreen() : const NotificationsScreen())));
      await tester.pump();
      expect(requests, 1);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);
      pending.complete(http.Response(jsonEncode({'success': false, 'error': {'message': 'Data gagal dimuat'}}), 500));
      await tester.pumpAndSettle();
      expect(find.text('Data gagal dimuat'), findsOneWidget);
      fail = false;
      await tester.tap(find.text('Coba lagi'));
      await tester.pumpAndSettle();
      expect(requests, 2);
      expect(find.text(feature == 'faq' ? 'Pertanyaan server?' : 'Notifikasi server'), findsOneWidget);
      expect(find.text('Data gagal dimuat'), findsNothing);
    });
  }

  for (final feature in ['saved', 'notifications', 'settings']) {
    test('$feature ignores completion after dispose', () async {
      final pending = Completer<http.Response>();
      final api = ApiClient(httpClient: MockClient((_) => pending.future));
      final saved = SavedController(SavedRepositoryImpl(api: api))
        ..setSession('user-a');
      final notifications = NotificationsController(NotificationRepositoryImpl(api: api))
        ..setSession('user-a');
      final settings = SettingsController(SettingsRepositoryImpl(api: api))
        ..setSession('user-a');
      final request = switch (feature) {
        'saved' => saved.removeSavedPlan('cd870adc-0819-411d-a1e1-f6fb4a48a681'),
        'notifications' => notifications.markAllNotificationsRead(),
        _ => settings.setDataSaver(true),
      };
      saved.dispose();
      notifications.dispose();
      settings.dispose();
      pending.complete(_ok(_settings(dataSaver: true)));
      expect((await request).isFailure, isTrue);
    });

    test('$feature repeated session preserves pending state', () async {
      final pending = Completer<http.Response>();
      final api = ApiClient(httpClient: MockClient((_) => pending.future));
      final saved = SavedController(SavedRepositoryImpl(api: api))
        ..setSession('user-a');
      final notifications = NotificationsController(NotificationRepositoryImpl(api: api))
        ..setSession('user-a');
      final settings = SettingsController(SettingsRepositoryImpl(api: api))
        ..setSession('user-a');
      final request = switch (feature) {
        'saved' => saved.removeSavedPlan('cd870adc-0819-411d-a1e1-f6fb4a48a681'),
        'notifications' => notifications.markAllNotificationsRead(),
        _ => settings.setDataSaver(true),
      };
      saved.setSession('user-a');
      notifications.setSession('user-a');
      settings.setSession('user-a');
      final loading = switch (feature) {
        'saved' => saved.isLoading,
        'notifications' => notifications.isLoading,
        _ => settings.isLoading,
      };
      pending.complete(_ok(_settings(dataSaver: true)));
      expect(loading, isTrue);
      expect((await request).isSuccess, isTrue);
      saved.dispose();
      notifications.dispose();
      settings.dispose();
    });

    test('$feature rejects duplicate persistence while pending', () async {
      final pending = Completer<http.Response>();
      var requests = 0;
      final api = ApiClient(httpClient: MockClient((_) {
        requests++;
        return pending.future;
      }));
      final saved = SavedController(SavedRepositoryImpl(api: api))
        ..setSession('user-a');
      final notifications = NotificationsController(NotificationRepositoryImpl(api: api))
        ..setSession('user-a');
      final settings = SettingsController(SettingsRepositoryImpl(api: api))
        ..setSession('user-a');
      final action = switch (feature) {
        'saved' => () => saved.removeSavedPlan('cd870adc-0819-411d-a1e1-f6fb4a48a681'),
        'notifications' => notifications.markAllNotificationsRead,
        _ => () => settings.setDataSaver(true),
      };
      final first = action();
      final duplicate = action();
      await Future<void>.delayed(Duration.zero);
      pending.complete(_ok(_settings(dataSaver: true)));
      expect((await first).isSuccess, isTrue);
      expect((await duplicate).isFailure, isTrue);
      expect(requests, 1);
      saved.dispose();
      notifications.dispose();
      settings.dispose();
    });
  }
}
