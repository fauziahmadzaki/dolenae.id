import 'dart:async';
import 'dart:convert';

import 'package:dolenae_mobile/src/app/router/routes/main_tab_routes.dart';
import 'package:dolenae_mobile/src/app/theme/app_theme.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/features/checklist/data/repositories/checklist_repository_impl.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/routes/checklist_routes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider/provider.dart';

import '../helpers/test_harness.dart';

const _destinationId = '11111111-1111-4111-8111-111111111111';
const _itemId = '22222222-2222-4222-8222-222222222222';
const _location = '/checklist?destinationId=$_destinationId&destinationName=Gunung%20Lawu';

Map<String, dynamic> _row({bool completed = false}) => {
  'id': _itemId,
  'destinationId': _destinationId,
  'name': 'Air minum',
  'category': 'kesehatan',
  'isRequired': true,
  'isCompleted': completed,
  'note': null,
};

http.Response _ok(Object? data) =>
    http.Response(jsonEncode({'success': true, 'data': data}), 200);

ChecklistController _controller(
  Future<http.Response> Function(http.Request) respond,
) => ChecklistController(
  ChecklistRepositoryImpl(api: ApiClient(httpClient: MockClient(respond))),
)..setSession('user-a');

GoRouter _router({String initialLocation = _location}) => GoRouter(
  initialLocation: initialLocation,
  routes: [
    ...mainTabRoutes.where((r) => r is GoRoute && r.path == '/checklist'),
    ...checklistRoutes,
    GoRoute(path: '/home', builder: (_, _) => const Scaffold(body: Text('Beranda uji'))),
    GoRoute(path: '/plan', builder: (_, _) => const Scaffold(body: Text('Rencana uji'))),
  ],
);

Widget _app(ChecklistController controller, GoRouter router) =>
    ChangeNotifierProvider.value(
      value: controller,
      child: MaterialApp.router(theme: AppTheme.light(), routerConfig: router),
    );

void main() {
  setUpAll(useTestFonts);

  for (final initial in ['/checklist', '/checklist?destinationId=dest-bromo']) {
    testWidgets('route $initial meminta destinasi tanpa ID contoh', (tester) async {
      await usePhone(tester);
      var calls = 0;
      final controller = _controller((_) async { calls++; return _ok([]); });
      final router = _router(initialLocation: initial);
      addTearDown(router.dispose);
      addTearDown(controller.dispose);
      await tester.pumpWidget(_app(controller, router));
      await tester.pumpAndSettle();
      expect(calls, 0);
      expect(find.text('Pilih destinasi terlebih dahulu'), findsOneWidget);
      expect(find.text('Pilih destinasi'), findsOneWidget);
      expect(find.text('Tambah item'), findsNothing);
    });
  }

  testWidgets('selesai hanya untuk checklist lengkap dan kembali mempertahankan progres', (tester) async {
    await usePhone(tester);
    final controller = _controller((_) async => _ok([_row(completed: true)]));
    final router = _router();
    addTearDown(router.dispose);
    addTearDown(controller.dispose);
    await tester.pumpWidget(_app(controller, router));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Tandai siap'));
    await tester.pumpAndSettle();
    expect(find.text('Checklist lengkap!'), findsOneWidget);
    expect(find.text('1 dari 1 item sudah siap'), findsOneWidget);
    router.pop();
    await tester.pumpAndSettle();
    expect(find.text('1/1 siap'), findsOneWidget);
  });

  testWidgets('deep link selesai tidak mengarang sukses', (tester) async {
    await usePhone(tester);
    final controller = _controller((_) async => _ok([]));
    final router = _router(initialLocation: '/checklist/done?destinationId=$_destinationId');
    addTearDown(router.dispose);
    addTearDown(controller.dispose);
    await tester.pumpWidget(_app(controller, router));
    await tester.pumpAndSettle();
    expect(find.text('Checklist lengkap!'), findsNothing);
  });



  testWidgets('gagal baca bisa diulang; kosong tidak bisa ditandai siap', (tester) async {
    await usePhone(tester);
    var reads = 0;
    final controller = _controller((_) async {
      reads++;
      return reads == 1
          ? http.Response(jsonEncode({'success': false, 'error': {'message': 'Koneksi gagal'}}), 503)
          : _ok([]);
    });
    final router = _router();
    addTearDown(router.dispose);
    addTearDown(controller.dispose);
    await tester.pumpWidget(_app(controller, router));
    await tester.pumpAndSettle();
    expect(find.text('Koneksi gagal'), findsOneWidget);
    await tester.tap(find.text('Coba lagi'));
    await tester.pumpAndSettle();
    expect(reads, 2);
    expect(find.text('Belum ada item checklist'), findsOneWidget);
    expect(tester.widget<FilledButton>(find.widgetWithText(FilledButton, 'Tandai siap')).onPressed, isNull);
    expect(find.text('Tambah item'), findsOneWidget);
  });

  testWidgets('toggle menunggu server, mencegah duplikat, gagal mempertahankan progres', (tester) async {
    await usePhone(tester);
    final patches = <http.Request>[];
    var pending = Completer<http.Response>();
    final controller = _controller((request) {
      if (request.method == 'GET') return Future.value(_ok([_row()]));
      patches.add(request);
      return pending.future;
    });
    final router = _router();
    addTearDown(router.dispose);
    addTearDown(controller.dispose);
    await tester.pumpWidget(_app(controller, router));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Air minum'));
    await tester.tap(find.text('Air minum'));
    await tester.pump();
    expect(patches, hasLength(1));
    expect(find.text('Air minum'), findsOneWidget);
    expect(find.text('0/1 siap'), findsOneWidget);
    expect(tester.widget<FilledButton>(find.widgetWithText(FilledButton, 'Tandai siap')).onPressed, isNull);
    pending.complete(http.Response(jsonEncode({'success': false, 'error': {'message': 'Perubahan gagal'}}), 500));
    await tester.pumpAndSettle();
    expect(controller.completedCount, 0);
    expect(find.text('Perubahan gagal'), findsWidgets);
    expect(router.state.uri.path, '/checklist');
    pending = Completer<http.Response>();
    await tester.ensureVisible(find.text('Air minum'));
    await tester.tap(find.text('Air minum'));
    await tester.pump();
    expect(patches, hasLength(2));
    pending.complete(_ok(_row(completed: true)));
    await tester.pumpAndSettle();
    expect(find.text('1/1 siap'), findsOneWidget);
    expect(controller.completedCount, 1);
  });

  testWidgets('tambah item kosong, menunggu POST, gagal tetap di form, sukses kembali', (tester) async {
    await usePhone(tester);
    final posts = <http.Request>[];
    var pending = Completer<http.Response>();
    var rows = <Map<String, dynamic>>[];
    final controller = _controller((request) {
      if (request.method == 'GET') return Future.value(_ok(rows));
      posts.add(request);
      return pending.future;
    });
    final router = _router();
    addTearDown(router.dispose);
    addTearDown(controller.dispose);
    await tester.pumpWidget(_app(controller, router));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Tambah item'));
    await tester.pumpAndSettle();
    expect(router.state.uri.queryParameters['destinationId'], _destinationId);
    expect(tester.widget<TextField>(find.byType(TextField).first).controller!.text, isEmpty);
    expect(tester.widget<TextField>(find.byType(TextField).last).controller!.text, isEmpty);
    await tester.tap(find.widgetWithText(FilledButton, 'Tambah item'));
    await tester.pumpAndSettle();
    expect(posts, isEmpty);
    await tester.enterText(find.byType(TextField).first, 'Air minum');
    await tester.enterText(find.byType(TextField).last, 'Dua liter');
    await tester.tap(find.text('Kesehatan'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Tambah item'));
    await tester.tap(find.widgetWithText(FilledButton, 'Tambah item'));
    await tester.pump();
    expect(posts, hasLength(1));
    expect(posts.single.url.path, '/api/checklists/$_destinationId/items');
    expect(jsonDecode(posts.single.body), {'name': 'Air minum', 'category': 'kesehatan', 'isRequired': true, 'note': 'Dua liter'});
    expect(controller.items, isEmpty);
    expect(router.state.uri.path, '/checklist/add');
    pending.complete(http.Response(jsonEncode({'success': false, 'error': {'message': 'Simpan gagal'}}), 500));
    await tester.pumpAndSettle();
    expect(find.text('Simpan gagal'), findsWidgets);
    expect(tester.widget<TextField>(find.byType(TextField).first).controller!.text, 'Air minum');
    expect(router.state.uri.path, '/checklist/add');
    pending = Completer<http.Response>();
    await tester.tap(find.widgetWithText(FilledButton, 'Tambah item'));
    await tester.pump();
    rows = [_row()];
    pending.complete(_ok(rows.single));
    await tester.pumpAndSettle();
    expect(posts, hasLength(2));
    expect(router.state.uri.path, '/checklist');
    expect(find.text('Air minum'), findsOneWidget);
    expect(controller.items.single.id, _itemId);
    router.go('/home');
    await tester.pumpAndSettle();
    router.go(_location);
    await tester.pumpAndSettle();
    expect(find.text('Air minum'), findsOneWidget);
  });

  testWidgets('item belum selesai tidak bisa ditandai siap', (tester) async {
    await usePhone(tester);
    final controller = _controller((_) async => _ok([_row()]));
    final router = _router();
    addTearDown(router.dispose);
    addTearDown(controller.dispose);
    await tester.pumpWidget(_app(controller, router));
    await tester.pumpAndSettle();
    expect(tester.widget<FilledButton>(find.widgetWithText(FilledButton, 'Tandai siap')).onPressed, isNull);
  });

  testWidgets('route memuat ID nyata dan merender respons async secara reaktif', (tester) async {
    await usePhone(tester);
    final requests = <http.Request>[];
    final response = Completer<http.Response>();
    final controller = _controller((request) {
      requests.add(request);
      return response.future;
    });
    final router = _router();
    addTearDown(router.dispose);
    addTearDown(controller.dispose);
    await tester.pumpWidget(_app(controller, router));
    await tester.pump();

    expect(requests.map((r) => r.url.path), ['/api/destinations/$_destinationId/checklist']);
    expect(find.text('Memuat checklist...'), findsOneWidget);
    expect(find.text('Gunung Bromo'), findsNothing);

    response.complete(_ok([_row()]));
    await tester.pumpAndSettle();
    expect(find.text('Gunung Lawu'), findsOneWidget);
    expect(find.text('Air minum'), findsOneWidget);
    expect(find.text('0/1 siap'), findsOneWidget);
  });
}
