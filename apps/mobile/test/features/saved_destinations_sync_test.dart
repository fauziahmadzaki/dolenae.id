import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/screens/destination_detail_screen.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/screens/profile_screen.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_destination_local_data_source.dart';
import 'package:dolenae_mobile/src/features/saved/data/data_sources/saved_destination_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/saved/data/repositories/saved_repository_impl.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_destinations_screen.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_remote_image.dart';

import '../helpers/test_harness.dart';

class _LoggedInAuthRepository implements AuthRepository {
  const _LoggedInAuthRepository(this._session);

  final AuthSession _session;

  @override
  Future<Result<AuthSession>> restore() async => Success(_session);

  @override
  Future<Result<AuthSession>> verify() async => Success(_session);

  @override
  Future<Result<AuthSession>> login({
    required String email,
    required String password,
  }) async => Success(_session);

  @override
  Future<Result<AuthSession>> register({
    required String name,
    required String email,
    required String password,
  }) async => Success(_session);

  @override
  Future<Result<AuthSession>> updateProfile({
    required String name,
    String? phone,
    String? city,
    String? bio,
    String? avatarUrl,
    bool clearAvatar = false,
  }) async => Success(_session);

  @override
  Future<Result<AuthSession>> googleSignIn() async => Success(_session);

  @override
  Future<String?> readRememberedEmail() async => _session.user.email;

  @override
  Future<void> writeRememberedEmail(String? email) async {}

  @override
  Future<Result<String>> forgotPassword({required String email}) async =>
      const Success('ok');

  @override
  Future<Result<String>> resendVerificationEmail({required String email}) async =>
      const Success('ok');

  @override
  Future<Result<void>> logout() async => const Success(null);
}

Map<String, dynamic> _destJson(String id, String name) => {
  'id': id,
  'slug': name.toLowerCase().replaceAll(' ', '-'),
  'name': name,
  'tagline': 'Panorama alam',
  'difficulty': 'menengah',
  'bestSeason': ['Kemarau'],
  'tags': ['Sunrise'],
  'terrain': ['Gunung'],
  'activities': ['Hiking'],
  'location': {
    'province': 'Jawa Tengah',
    'regency': 'Wonosobo',
    'district': 'Kejajar',
    'latitude': -7.18,
    'longitude': 109.92,
    'accessPoint': 'Patak Banteng',
  },
  'access': {
    'description': 'Mudah',
    'transport': ['Motor'],
    'duration': '2 jam',
    'distanceKm': 20,
  },
  'elevationMeters': 2565,
  'images': ['https://cdn.example.com/prau.jpg'],
  'guideRequired': false,
  'status': 'published',
  'verified': true,
  'categoryIds': <String>[],
  'facilities': {'Warung': 2},
};

AuthSession _sessionFor(String userId) => AuthSession(
  token: 'token-$userId',
  user: AuthUser(
    id: userId,
    name: 'User $userId',
    email: '$userId@dolenae.id',
    role: 'wisatawan',
  ),
);

void main() {
  setUpAll(useTestFonts);

  group('Destinasi Tersimpan Real Per Akun', () {
    test('awal selalu kosong tanpa data dummy', () {
      final repo = SavedRepositoryImpl();
      expect(repo.destinations, isEmpty);
      expect(repo.requiresInitialLoad, isFalse);
    });

    testWidgets(
      'DestinationDetailScreen bookmark toggle: state, >=44dp target, toast, & double-tap guard',
      (tester) async {
        await usePhone(tester);
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();

        var putCalls = 0;
        var deleteCalls = 0;
        final putCompleter = Completer<void>();
        final store = newStore();
        final dest = store.destinations.items.first;

        final client = ApiClient(
          baseUrl: 'http://localhost:3001/api',
          httpClient: MockClient((request) async {
            if (request.method == 'GET' &&
                request.url.path.endsWith('/saved-destinations')) {
              return http.Response(
                jsonEncode({'success': true, 'data': <Object>[]}),
                200,
              );
            }
            if (request.method == 'PUT' &&
                request.url.path.endsWith('/saved-destinations/${dest.id}')) {
              putCalls++;
              await putCompleter.future;
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': {
                    'id': 'u1:${dest.id}',
                    'destinationId': dest.id,
                    'savedAt': '2026-11-28T10:00:00Z',
                    'destination': _destJson(dest.id, dest.name),
                  },
                }),
                201,
              );
            }
            if (request.method == 'DELETE' &&
                request.url.path.endsWith('/saved-destinations/${dest.id}')) {
              deleteCalls++;
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': {'deleted': true, 'destinationId': dest.id},
                }),
                200,
              );
            }
            return http.Response('{}', 404);
          }),
        )..token = 'token-u1';

        final savedRepo = SavedRepositoryImpl(
          local: SavedDestinationLocalDataSource(prefs),
          remote: SavedDestinationRemoteDataSource(client),
        );
        final savedController = SavedController(savedRepo);
        await savedController.setUserId('u1');

        final auth = AuthController(
          repository: _LoggedInAuthRepository(_sessionFor('u1')),
          initialSession: _sessionFor('u1'),
        );

        await tester.pumpWidget(
          MultiProvider(
            providers: [
              ChangeNotifierProvider.value(value: auth),
              ChangeNotifierProvider.value(value: store.destinations),
              ChangeNotifierProvider.value(value: store.facilities),
              ChangeNotifierProvider.value(value: store.routes),
              ChangeNotifierProvider.value(value: store.weather),
              ChangeNotifierProvider.value(value: store.plan),
              ChangeNotifierProvider.value(value: savedController),
            ],
            child: MaterialApp(
              home: DestinationDetailScreen(destinationId: dest.id),
            ),
          ),
        );
        await tester.pumpAndSettle();

        // Target sentuh >= 44x44 dp pada back dan bookmark.
        final backBtn = find.byTooltip('Kembali');
        final bookmarkBtn = find.byTooltip('Simpan destinasi');
        expect(bookmarkBtn, findsOneWidget);
        expect(tester.getSize(backBtn).width, greaterThanOrEqualTo(44));
        expect(tester.getSize(backBtn).height, greaterThanOrEqualTo(44));
        expect(tester.getSize(bookmarkBtn).width, greaterThanOrEqualTo(44));
        expect(tester.getSize(bookmarkBtn).height, greaterThanOrEqualTo(44));

        // State awal belum disimpan: AppIcons.bookmark & AppColors.primaryHover.
        expect(find.byIcon(AppIcons.bookmark), findsOneWidget);
        final initialCircle = tester.widget<Ink>(
          find
              .descendant(of: bookmarkBtn, matching: find.byType(Ink))
              .first,
        );
        expect(
          (initialCircle.decoration as BoxDecoration).color,
          AppColors.primaryHover,
        );

        // Tap bookmark pertama -> masuk state mutating (spinner) & tahan double tap.
        await tester.tap(bookmarkBtn);
        await tester.pump();
        expect(
          find.descendant(
            of: find.byTooltip('Memperbarui status simpan'),
            matching: find.byType(CircularProgressIndicator),
          ),
          findsOneWidget,
        );
        await tester.tap(find.byTooltip('Memperbarui status simpan'));
        await tester.pump();
        expect(putCalls, 1);

        // Selesaikan request PUT -> state tersimpan (AppColors.accent + bookmarkCheck + toast sukses).
        putCompleter.complete();
        await tester.pumpAndSettle();
        expect(savedController.isDestinationSaved(dest.id), isTrue);
        expect(find.byTooltip('Hapus dari tersimpan'), findsOneWidget);
        expect(
          find.descendant(
            of: find.byTooltip('Hapus dari tersimpan'),
            matching: find.byIcon(AppIcons.bookmarkCheck),
          ),
          findsOneWidget,
        );
        final savedCircle = tester.widget<Ink>(
          find
              .descendant(
                of: find.byTooltip('Hapus dari tersimpan'),
                matching: find.byType(Ink),
              )
              .first,
        );
        expect(
          (savedCircle.decoration as BoxDecoration).color,
          AppColors.accent,
        );
        expect(
          find.text('${dest.name} disimpan ke daftar tersimpan'),
          findsOneWidget,
        );

        // Tap lagi -> hapus -> toast info.
        await tester.tap(find.byTooltip('Hapus dari tersimpan'));
        await tester.pumpAndSettle();
        expect(deleteCalls, 1);
        expect(savedController.isDestinationSaved(dest.id), isFalse);
        expect(
          find.text('${dest.name} dihapus dari tersimpan'),
          findsOneWidget,
        );
      },
    );

    testWidgets(
      'DestinationDetailScreen menonaktifkan tombol saat GET awal tertunda & saveDestination tidak berubah jadi DELETE',
      (tester) async {
        await usePhone(tester);
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();

        final getCompleter = Completer<void>();
        var putCalls = 0;
        var deleteCalls = 0;
        final store = newStore();
        final dest = store.destinations.items.first;

        final client = ApiClient(
          baseUrl: 'http://localhost:3001/api',
          httpClient: MockClient((request) async {
            if (request.method == 'GET' &&
                request.url.path.endsWith('/saved-destinations')) {
              await getCompleter.future;
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': [
                    {
                      'id': 'u1:${dest.id}',
                      'destinationId': dest.id,
                      'savedAt': '2026-11-28T10:00:00Z',
                      'destination': _destJson(dest.id, dest.name),
                    },
                  ],
                }),
                200,
              );
            }
            if (request.method == 'PUT') {
              putCalls++;
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': {
                    'id': 'u1:${dest.id}',
                    'destinationId': dest.id,
                    'savedAt': '2026-11-28T10:00:00Z',
                    'destination': _destJson(dest.id, dest.name),
                  },
                }),
                200,
              );
            }
            if (request.method == 'DELETE') {
              deleteCalls++;
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': {'deleted': true, 'destinationId': dest.id},
                }),
                200,
              );
            }
            return http.Response('{}', 404);
          }),
        )..token = 'token-u1';

        final savedController = SavedController(
          SavedRepositoryImpl(
            local: SavedDestinationLocalDataSource(prefs),
            remote: SavedDestinationRemoteDataSource(client),
          ),
        );
        unawaited(savedController.setUserId('u1'));

        final auth = AuthController(
          repository: _LoggedInAuthRepository(_sessionFor('u1')),
          initialSession: _sessionFor('u1'),
        );

        await tester.pumpWidget(
          MultiProvider(
            providers: [
              ChangeNotifierProvider.value(value: auth),
              ChangeNotifierProvider.value(value: store.destinations),
              ChangeNotifierProvider.value(value: store.facilities),
              ChangeNotifierProvider.value(value: store.routes),
              ChangeNotifierProvider.value(value: store.weather),
              ChangeNotifierProvider.value(value: store.plan),
              ChangeNotifierProvider.value(value: savedController),
            ],
            child: MaterialApp(
              home: DestinationDetailScreen(destinationId: dest.id),
            ),
          ),
        );
        await tester.pump();

        // Saat GET awal tertunda, tombol nonaktif & tidak memicu PUT/DELETE saat diketuk.
        final pendingBtn = find.byTooltip('Memuat status simpan');
        expect(pendingBtn, findsOneWidget);
        await tester.tap(pendingBtn);
        await tester.pump();
        expect(putCalls, 0);
        expect(deleteCalls, 0);

        // Antrekan saveDestination di belakang GET tertunda -> wajib tetap kirim PUT, nol DELETE.
        final queuedSave = savedController.saveDestination(dest);

        getCompleter.complete();
        await queuedSave;
        await tester.pumpAndSettle();

        expect(putCalls, 1);
        expect(deleteCalls, 0);
        expect(savedController.isDestinationSaved(dest.id), isTrue);
        expect(find.byTooltip('Hapus dari tersimpan'), findsOneWidget);
        expect(
          find.descendant(
            of: find.byTooltip('Hapus dari tersimpan'),
            matching: find.byIcon(AppIcons.bookmarkCheck),
          ),
          findsOneWidget,
        );
      },
    );

    testWidgets(
      'DestinationDetailScreen memakai fallback bookmark saat destinasi tidak ada di katalog lokal',
      (tester) async {
        await usePhone(tester);
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();

        const missingId = 'dest-hanya-di-bookmark';
        final client = ApiClient(
          baseUrl: 'http://localhost:3001/api',
          httpClient: MockClient((request) async {
            return http.Response(
              jsonEncode({
                'success': true,
                'data': [
                  {
                    'id': 'u1:$missingId',
                    'destinationId': missingId,
                    'savedAt': '2026-11-28T10:00:00Z',
                    'destination': _destJson(missingId, 'Gunung Argopuro'),
                  },
                ],
              }),
              200,
            );
          }),
        )..token = 'token-u1';

        final savedController = SavedController(
          SavedRepositoryImpl(
            local: SavedDestinationLocalDataSource(prefs),
            remote: SavedDestinationRemoteDataSource(client),
          ),
        );
        await savedController.setUserId('u1');

        final auth = AuthController(
          repository: _LoggedInAuthRepository(_sessionFor('u1')),
          initialSession: _sessionFor('u1'),
        );
        // Katalog lokal sengaja tanpa missingId.
        final emptyCatalogStore = TestStores(destinations: const []);

        await tester.pumpWidget(
          MultiProvider(
            providers: [
              ChangeNotifierProvider.value(value: auth),
              ChangeNotifierProvider.value(value: emptyCatalogStore.destinations),
              ChangeNotifierProvider.value(value: emptyCatalogStore.facilities),
              ChangeNotifierProvider.value(value: emptyCatalogStore.routes),
              ChangeNotifierProvider.value(value: emptyCatalogStore.weather),
              ChangeNotifierProvider.value(value: emptyCatalogStore.plan),
              ChangeNotifierProvider.value(value: savedController),
            ],
            child: const MaterialApp(
              home: DestinationDetailScreen(destinationId: missingId),
            ),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('Destinasi tidak tersedia.'), findsNothing);
        expect(find.text('Gunung Argopuro'), findsWidgets);
        expect(find.byTooltip('Hapus dari tersimpan'), findsOneWidget);
      },
    );

    testWidgets(
      'DestinationDetailScreen menolak bookmark saat belum login dan tidak mengubah state saat API gagal',
      (tester) async {
        await usePhone(tester);
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();
        final store = newStore();
        final dest = store.destinations.items.first;

        final failingClient = ApiClient(
          baseUrl: 'http://localhost:3001/api',
          httpClient: MockClient((request) async {
            if (request.method == 'GET') {
              return http.Response(
                jsonEncode({'success': true, 'data': <Object>[]}),
                200,
              );
            }
            return http.Response(
              jsonEncode({
                'error': {'message': 'Server error'},
              }),
              500,
            );
          }),
        )..token = 'token-u1';

        final savedController = SavedController(
          SavedRepositoryImpl(
            local: SavedDestinationLocalDataSource(prefs),
            remote: SavedDestinationRemoteDataSource(failingClient),
          ),
        );

        await tester.pumpWidget(
          MultiProvider(
            providers: [
              ChangeNotifierProvider.value(value: store.auth),
              ChangeNotifierProvider.value(value: store.destinations),
              ChangeNotifierProvider.value(value: store.facilities),
              ChangeNotifierProvider.value(value: store.routes),
              ChangeNotifierProvider.value(value: store.weather),
              ChangeNotifierProvider.value(value: store.plan),
              ChangeNotifierProvider.value(value: savedController),
            ],
            child: MaterialApp(
              home: DestinationDetailScreen(destinationId: dest.id),
            ),
          ),
        );
        await tester.pumpAndSettle();

        await tester.tap(find.byTooltip('Simpan destinasi'));
        await tester.pumpAndSettle();
        expect(
          find.text('Masuk terlebih dahulu untuk menyimpan destinasi'),
          findsOneWidget,
        );
        expect(savedController.isDestinationSaved(dest.id), isFalse);

        final auth = AuthController(
          repository: _LoggedInAuthRepository(_sessionFor('u1')),
          initialSession: _sessionFor('u1'),
        );
        await savedController.setUserId('u1');

        await tester.pumpWidget(
          MultiProvider(
            providers: [
              ChangeNotifierProvider.value(value: auth),
              ChangeNotifierProvider.value(value: store.destinations),
              ChangeNotifierProvider.value(value: store.facilities),
              ChangeNotifierProvider.value(value: store.routes),
              ChangeNotifierProvider.value(value: store.weather),
              ChangeNotifierProvider.value(value: store.plan),
              ChangeNotifierProvider.value(value: savedController),
            ],
            child: MaterialApp(
              home: DestinationDetailScreen(destinationId: dest.id),
            ),
          ),
        );
        await tester.pumpAndSettle();

        await tester.tap(find.byTooltip('Simpan destinasi'));
        await tester.pumpAndSettle();
        expect(savedController.isDestinationSaved(dest.id), isFalse);
        expect(
          find.text('Gagal memperbarui destinasi tersimpan. Coba lagi.'),
          findsOneWidget,
        );
      },
    );

    testWidgets(
      'SavedDestinationsScreen menampilkan DnRemoteImage, loading, error banner cache dengan Coba lagi, & toast hapus 401 vs 500',
      (tester) async {
        await usePhone(tester);
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();

        var failFetch = false;
        var deleteStatus = 200;
        final fetchCompleter = Completer<void>();
        var useCompleter = true;

        final client = ApiClient(
          baseUrl: 'http://localhost:3001/api',
          httpClient: MockClient((request) async {
            if (request.method == 'GET' &&
                request.url.path.endsWith('/saved-destinations')) {
              if (useCompleter) {
                await fetchCompleter.future;
              }
              if (failFetch) {
                return http.Response(
                  jsonEncode({
                    'error': {'message': 'Koneksi terputus'},
                  }),
                  500,
                );
              }
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': [
                    {
                      'id': 'u1:d-prau',
                      'destinationId': 'd-prau',
                      'savedAt': '2026-11-28T10:00:00Z',
                      'destination': _destJson('d-prau', 'Gunung Prau'),
                    },
                  ],
                }),
                200,
              );
            }
            if (request.method == 'DELETE') {
              if (deleteStatus != 200) {
                return http.Response(
                  jsonEncode({
                    'error': {
                      'message': deleteStatus == 401 ? 'Unauthorized' : 'Error',
                    },
                  }),
                  deleteStatus,
                );
              }
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': {'deleted': true, 'destinationId': 'd-prau'},
                }),
                200,
              );
            }
            return http.Response('{}', 404);
          }),
        )..token = 'token-u1';

        final controller = SavedController(
          SavedRepositoryImpl(
            local: SavedDestinationLocalDataSource(prefs),
            remote: SavedDestinationRemoteDataSource(client),
          ),
        );
        unawaited(controller.setUserId('u1'));

        await tester.pumpWidget(
          wrapScreen(
            ChangeNotifierProvider.value(
              value: controller,
              child: const SavedDestinationsScreen(),
            ),
          ),
        );
        await tester.pump();
        expect(find.byType(CircularProgressIndicator), findsOneWidget);

        // Selesaikan fetch -> tampil DnRemoteImage & kartu.
        useCompleter = false;
        fetchCompleter.complete();
        await tester.pumpAndSettle();
        expect(find.byType(DnRemoteImage), findsOneWidget);
        expect(find.text('Gunung Prau'), findsOneWidget);

        // Refresh gagal 500 saat cache ada -> banner error + Coba lagi DAN kartu tampil bersamaan.
        failFetch = true;
        await controller.loadDestinations(refresh: true);
        await tester.pumpAndSettle();
        expect(find.text('Gunung Prau'), findsOneWidget);
        expect(find.text('Koneksi terputus'), findsOneWidget);
        expect(find.text('Coba lagi'), findsOneWidget);

        // Tekan Coba lagi saat server pulih -> banner hilang.
        failFetch = false;
        await tester.tap(find.text('Coba lagi'));
        await tester.pumpAndSettle();
        expect(find.text('Koneksi terputus'), findsNothing);
        expect(find.text('Gunung Prau'), findsOneWidget);

        // Hapus gagal 500 -> toast gagal jaringan, item tetap ada.
        deleteStatus = 500;
        await tester.tap(find.byTooltip('Hapus dari tersimpan'));
        await tester.pumpAndSettle();
        expect(
          find.text('Gagal menghapus destinasi. Coba lagi.'),
          findsOneWidget,
        );
        expect(find.text('Gunung Prau'), findsOneWidget);

        // Hapus gagal 401 -> toast sesi berakhir.
        deleteStatus = 401;
        await tester.tap(find.byTooltip('Hapus dari tersimpan'));
        await tester.pumpAndSettle();
        expect(
          find.text(
            'Sesi berakhir. Masuk kembali untuk mengelola destinasi tersimpan.',
          ),
          findsOneWidget,
        );
      },
    );

    test(
      'loadDestinations berbagi Future aktif saat dipanggil serentak',
      () async {
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();
        var getCalls = 0;
        final completer = Completer<void>();

        final client = ApiClient(
          baseUrl: 'http://localhost:3001/api',
          httpClient: MockClient((request) async {
            getCalls++;
            await completer.future;
            return http.Response(
              jsonEncode({'success': true, 'data': <Object>[]}),
              200,
            );
          }),
        )..token = 'token-u1';

        final controller = SavedController(
          SavedRepositoryImpl(
            local: SavedDestinationLocalDataSource(prefs),
            remote: SavedDestinationRemoteDataSource(client),
          ),
        );
        final f1 = controller.setUserId('u1');
        final f2 = controller.loadDestinations(refresh: true);
        expect(identical(f2, controller.loadDestinations(refresh: true)), isTrue);
        completer.complete();
        await Future.wait([f1, f2]);
        expect(getCalls, 1);
      },
    );

    testWidgets(
      'logout dan login ulang dengan 401 mengosongkan memori, isDestinationSaved, dan stat ProfileScreen',
      (tester) async {
        await usePhone(tester);
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();
        var return401 = false;

        final client = ApiClient(
          baseUrl: 'http://localhost:3001/api',
          httpClient: MockClient((request) async {
            if (return401) {
              return http.Response(
                jsonEncode({
                  'error': {'message': 'Sesi kedaluwarsa'},
                }),
                401,
              );
            }
            return http.Response(
              jsonEncode({
                'success': true,
                'data': [
                  {
                    'id': 'u1:d1',
                    'destinationId': 'd1',
                    'savedAt': '2026-11-28T10:00:00Z',
                    'destination': _destJson('d1', 'Gunung Prau'),
                  },
                ],
              }),
              200,
            );
          }),
        )..token = 'token-u1';

        final controller = SavedController(
          SavedRepositoryImpl(
            local: SavedDestinationLocalDataSource(prefs),
            remote: SavedDestinationRemoteDataSource(client),
          ),
        );
        await controller.setUserId('u1');
        expect(controller.isDestinationSaved('d1'), isTrue);

        // Logout lalu login ulang ke akun sama dengan server 401.
        await controller.setUserId(null);
        expect(controller.savedDestinations, isEmpty);

        return401 = true;
        await controller.setUserId('u1');
        expect(controller.savedDestinations, isEmpty);
        expect(controller.isDestinationSaved('d1'), isFalse);
        expect(controller.hasLoaded, isFalse);

        final auth = AuthController(
          repository: _LoggedInAuthRepository(_sessionFor('u1')),
          initialSession: _sessionFor('u1'),
        );
        final stores = newStore();
        await stores.plan.load();

        await tester.pumpWidget(
          MultiProvider(
            providers: [
              ChangeNotifierProvider.value(value: auth),
              ChangeNotifierProvider.value(value: stores.plan),
              ChangeNotifierProvider.value(value: controller),
            ],
            child: const MaterialApp(home: ProfileScreen()),
          ),
        );
        await tester.pumpAndSettle();

        final tile = find.ancestor(
          of: find.text('Tersimpan').first,
          matching: find.byType(InkWell),
        );
        expect(find.descendant(of: tile, matching: find.text('0')), findsOneWidget);
      },
    );

    test(
      'cache lokal round-trip menjaga accessDistance & mengisolasi item rusak serta tipe prefs salah',
      () async {
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();
        final local = SavedDestinationLocalDataSource(prefs);

        final savedAt = DateTime.utc(2026, 11, 20, 8, 30);
        const validDest = Destination(
          id: 'd-valid',
          slug: 'gunung-prau',
          name: 'Gunung Prau',
          tagline: 'Sunrise',
          elevationM: 2565,
          regency: 'Wonosobo',
          province: 'Jawa Tengah',
          priceFrom: null,
          difficulty: DifficultyLevel.menengah,
          images: ['https://cdn.example.com/prau.jpg'],
          facilities: {'Warung': 2},
          accessDistance: '26 km dari kota terdekat',
        );

        final ok = await local.write(
          [
            SavedDestination(
              id: 'u1:d-valid',
              destination: validDest,
              savedAt: savedAt,
            ),
          ],
          scope: 'u1',
        );
        expect(ok, isTrue);

        // Round-trip utuh.
        final roundTrip = local.read(scope: 'u1');
        expect(roundTrip, hasLength(1));
        expect(roundTrip!.first.savedAt, savedAt);
        expect(
          roundTrip.first.destination.accessDistance,
          '26 km dari kota terdekat',
        );
        expect(roundTrip.first.destination.facilities, {'Warung': 2});
        expect(roundTrip.first.destination.difficulty, DifficultyLevel.menengah);
        expect(roundTrip.first.destination.elevationM, 2565);

        // Campuran item valid + item rusak -> item valid tetap bertahan.
        final existingRaw = jsonDecode(
          prefs.getString('saved.destinations.v1.u1')!,
        ) as List<dynamic>;
        await prefs.setString(
          'saved.destinations.v1.u1',
          jsonEncode([
            {'id': 123, 'savedAt': 'invalid-date', 'destination': _destJson('bad1', 'Bad 1')},
            {'id': 'u1:bad2', 'savedAt': '2026-11-20T08:30:00Z', 'destination': {'id': 'bad2', 'name': 'Bad 2', 'location': 'bukan-map'}},
            {'id': 'u1:bad3', 'savedAt': 'bukan-tanggal', 'destination': _destJson('bad3', 'Bad 3')},
            ...existingRaw,
          ]),
        );

        final mixed = local.read(scope: 'u1');
        // bad1 ditolak (id int & savedAt invalid), bad3 ditolak (savedAt invalid),
        // bad2 (location bukan map) aman karena _stringMap defensif, valid tetap ada.
        expect(mixed!.any((e) => e.destination.id == 'd-valid'), isTrue);
        expect(mixed.any((e) => e.destination.id == 'bad1'), isFalse);
        expect(mixed.any((e) => e.destination.id == 'bad3'), isFalse);

        // Tipe prefs salah (int) pada key cache -> read() aman null & controller tidak mengunci isLoading.
        await prefs.setInt('saved.destinations.v1.u-corrupt', 999);
        expect(local.read(scope: 'u-corrupt'), isNull);

        final client = ApiClient(
          baseUrl: 'http://localhost:3001/api',
          httpClient: MockClient((_) async => throw http.ClientException('offline')),
        )..token = 'token-corrupt';
        final controller = SavedController(
          SavedRepositoryImpl(
            local: local,
            remote: SavedDestinationRemoteDataSource(client),
          ),
        );
        await controller.setUserId('u-corrupt');
        expect(controller.isLoading, isFalse);
        expect(controller.error, isNotNull);
      },
    );

    test(
      'HTTP 401 membatalkan cache lama saat offline/500 berikutnya hingga GET 200 berhasil lagi',
      () async {
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();
        final local = SavedDestinationLocalDataSource(prefs);
        var mode = 'ok';

        final client = ApiClient(
          baseUrl: 'http://localhost:3001/api',
          httpClient: MockClient((request) async {
            if (mode == '401') {
              return http.Response(
                jsonEncode({
                  'error': {'message': 'Token kedaluwarsa'},
                }),
                401,
              );
            }
            if (mode == '500') {
              return http.Response(
                jsonEncode({
                  'error': {'message': 'Server bermasalah'},
                }),
                500,
              );
            }
            return http.Response(
              jsonEncode({
                'success': true,
                'data': [
                  {
                    'id': 'u1:d1',
                    'destinationId': 'd1',
                    'savedAt': '2026-11-28T10:00:00Z',
                    'destination': _destJson('d1', 'Gunung Merbabu'),
                  },
                ],
              }),
              200,
            );
          }),
        )..token = 'token-u1';

        final controller = SavedController(
          SavedRepositoryImpl(
            local: local,
            remote: SavedDestinationRemoteDataSource(client),
          ),
        );
        await controller.setUserId('u1');
        expect(
          controller.savedDestinations.map((e) => e.destination.name),
          ['Gunung Merbabu'],
        );
        expect(local.read(scope: 'u1'), isNotNull);

        // Dapat 401 -> memori & cache disk terhapus.
        mode = '401';
        await controller.loadDestinations(refresh: true);
        expect(controller.savedDestinations, isEmpty);
        expect(local.read(scope: 'u1'), isNull);

        // Jaringan/server 500 sesudah 401 -> cache tidak dimunculkan kembali.
        mode = '500';
        await controller.loadDestinations(refresh: true);
        expect(controller.savedDestinations, isEmpty);

        // GET 200 berhasil lagi -> data & cache aktif kembali.
        mode = 'ok';
        await controller.loadDestinations(refresh: true);
        expect(
          controller.savedDestinations.map((e) => e.destination.name),
          ['Gunung Merbabu'],
        );
        expect(local.read(scope: 'u1'), hasLength(1));
      },
    );

    testWidgets(
      'HTTP 401 pada mutasi PUT dan DELETE mereset hasLoaded dan menampilkan state error bukan empty state',
      (tester) async {
        await usePhone(tester);
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();
        final store = newStore();
        final extraDest = store.destinations.items.first;

        final client = ApiClient(
          baseUrl: 'http://localhost:3001/api',
          httpClient: MockClient((request) async {
            if (request.method == 'GET') {
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': [
                    {
                      'id': 'u1:d-prau',
                      'destinationId': 'd-prau',
                      'savedAt': '2026-11-28T10:00:00Z',
                      'destination': _destJson('d-prau', 'Gunung Prau'),
                    },
                  ],
                }),
                200,
              );
            }
            return http.Response(
              jsonEncode({
                'error': {'message': 'Sesi kedaluwarsa'},
              }),
              401,
            );
          }),
        )..token = 'token-u1';

        final controller = SavedController(
          SavedRepositoryImpl(
            local: SavedDestinationLocalDataSource(prefs),
            remote: SavedDestinationRemoteDataSource(client),
          ),
        );
        await controller.setUserId('u1');
        expect(controller.hasLoaded, isTrue);

        // 401 pada PUT -> memori kosong, hasLoaded=false, error!=null.
        await controller.saveDestination(extraDest);
        expect(controller.savedDestinations, isEmpty);
        expect(controller.hasLoaded, isFalse);
        expect(controller.error, isNotNull);

        // Pulihkan, lalu uji 401 pada DELETE lewat SavedDestinationsScreen -> tampil state error, bukan Belum ada destinasi.
        await controller.loadDestinations(refresh: true);
        expect(controller.hasLoaded, isTrue);

        await tester.pumpWidget(
          wrapScreen(
            ChangeNotifierProvider.value(
              value: controller,
              child: const SavedDestinationsScreen(),
            ),
          ),
        );
        await tester.pumpAndSettle();

        await tester.tap(find.byTooltip('Hapus dari tersimpan'));
        await tester.pumpAndSettle();

        expect(controller.savedDestinations, isEmpty);
        expect(controller.hasLoaded, isFalse);
        expect(controller.error, isNotNull);
        expect(find.text('Gagal memuat destinasi tersimpan'), findsOneWidget);
        expect(find.text('Belum ada destinasi'), findsNothing);
      },
    );
  });
}
