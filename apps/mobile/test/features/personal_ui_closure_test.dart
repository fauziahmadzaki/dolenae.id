import 'dart:async';
import 'dart:convert';

import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/notifications/data/repositories/notification_repository_impl.dart';
import 'package:dolenae_mobile/src/features/notifications/presentation/controllers/notifications_controller.dart';
import 'package:dolenae_mobile/src/features/saved/data/repositories/saved_repository_impl.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
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
import 'package:dolenae_mobile/src/features/checklist/data/repositories/checklist_repository_impl.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
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
