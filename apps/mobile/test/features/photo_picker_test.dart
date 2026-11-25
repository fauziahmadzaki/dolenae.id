import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:dolenae_mobile/src/core/media/photo_picker.dart';
import 'package:dolenae_mobile/src/core/media/photo_storage_io.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_local_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/auth_remote_data_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/google_sign_in_source.dart';
import 'package:dolenae_mobile/src/features/auth/data/data_sources/secure_token_store.dart';
import 'package:dolenae_mobile/src/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:dolenae_mobile/src/features/auth/domain/entities/auth_session.dart';
import 'package:dolenae_mobile/src/features/auth/domain/repositories/auth_repository.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/proposal_success_screen.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/propose_facility_screen.dart';
import 'package:dolenae_mobile/src/features/home/presentation/screens/beranda_screen.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/screens/edit_profile_screen.dart';
import 'package:dolenae_mobile/src/features/profile/presentation/screens/profile_screen.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/screens/saved_proposals_screen.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_avatar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_local_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:shared_preferences/shared_preferences.dart';

import '../helpers/test_harness.dart';

const _png1x1 = <int>[
  0x89,
  0x50,
  0x4E,
  0x47,
  0x0D,
  0x0A,
  0x1A,
  0x0A,
  0x00,
  0x00,
  0x00,
  0x0D,
  0x49,
  0x48,
  0x44,
  0x52,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x01,
  0x08,
  0x06,
  0x00,
  0x00,
  0x00,
  0x1F,
  0x15,
  0xC4,
  0x89,
  0x00,
  0x00,
  0x00,
  0x0A,
  0x49,
  0x44,
  0x41,
  0x54,
  0x78,
  0x9C,
  0x63,
  0x00,
  0x01,
  0x00,
  0x00,
  0x05,
  0x00,
  0x01,
  0x0D,
  0x0A,
  0x2D,
  0xB4,
  0x00,
  0x00,
  0x00,
  0x00,
  0x49,
  0x45,
  0x4E,
  0x44,
  0xAE,
  0x42,
  0x60,
  0x82,
];

File _createTempImage(Directory dir, String filename) {
  final file = File('${dir.path}${Platform.pathSeparator}$filename');
  file.writeAsBytesSync(_png1x1);
  return file;
}

void main() {
  setUpAll(useTestFonts);

  late Directory tempDir;
  late File samplePhoto;

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    tempDir = Directory.systemTemp.createTempSync('dolenae_photo_test_');
    samplePhoto = _createTempImage(tempDir, 'foto_bromo.png');
  });

  tearDown(() async {
    await clearPendingPhotoCapture();
    if (tempDir.existsSync()) {
      tempDir.deleteSync(recursive: true);
    }
  });

  group('pickPhotoWith', () {
    test('meneruskan batas resolusi dan sumber kamera/galeri', () async {
      ImageSource? capturedSource;
      double? capturedWidth;
      double? capturedHeight;
      int? capturedQuality;

      final cameraPhoto = _createTempImage(tempDir, 'kamera.png');
      final result = await pickPhotoWith(PhotoSource.camera, ({
        required ImageSource source,
        double? maxWidth,
        double? maxHeight,
        int? imageQuality,
      }) async {
        capturedSource = source;
        capturedWidth = maxWidth;
        capturedHeight = maxHeight;
        capturedQuality = imageQuality;
        return XFile(cameraPhoto.path);
      });

      expect(capturedSource, ImageSource.camera);
      expect(capturedWidth, 1280);
      expect(capturedHeight, 1280);
      expect(capturedQuality, 85);
      expect(result?.path, cameraPhoto.path);
      expect(result?.name, 'kamera.png');

      final galleryResult = await pickPhotoWith(PhotoSource.gallery, ({
        required ImageSource source,
        double? maxWidth,
        double? maxHeight,
        int? imageQuality,
      }) async {
        capturedSource = source;
        return XFile(samplePhoto.path);
      });

      expect(capturedSource, ImageSource.gallery);
      expect(galleryResult?.path, samplePhoto.path);
      expect(galleryResult?.name, 'foto_bromo.png');
    });

    test('batal memilih mengembalikan null', () async {
      final result = await pickPhotoWith(
        PhotoSource.gallery,
        ({
          required ImageSource source,
          double? maxWidth,
          double? maxHeight,
          int? imageQuality,
        }) async => null,
      );
      expect(result, isNull);
    });

    test('penolakan izin kamera memicu PhotoPickerException', () async {
      await expectLater(
        pickPhotoWith(
          PhotoSource.camera,
          ({
            required ImageSource source,
            double? maxWidth,
            double? maxHeight,
            int? imageQuality,
          }) async => throw PlatformException(code: 'camera_access_denied'),
        ),
        throwsA(
          isA<PhotoPickerException>()
              .having((e) => e.code, 'code', 'camera_access_denied')
              .having((e) => e.message, 'message', contains('Izin kamera')),
        ),
      );
    });

    test('penolakan izin galeri memicu PhotoPickerException', () async {
      await expectLater(
        pickPhotoWith(
          PhotoSource.gallery,
          ({
            required ImageSource source,
            double? maxWidth,
            double? maxHeight,
            int? imageQuality,
          }) async => throw PlatformException(code: 'photo_access_denied'),
        ),
        throwsA(
          isA<PhotoPickerException>().having(
            (e) => e.message,
            'message',
            contains('Izin galeri'),
          ),
        ),
      );
    });

    test('persistPhotoFile menyalin foto ke direktori privat persisten', () async {
      final supportDir = Directory(
        p.join(tempDir.path, 'app_support'),
      )..createSync();
      final sanitized = sanitizePhotoBasename('../../foto libur (1)?.png');
      expect(sanitized, 'foto_libur__1__.png');

      final copiedPath = await persistPhotoFile(
        samplePhoto.path,
        sanitized,
        supportDirectoryProvider: () async => supportDir,
        nowProvider: () => DateTime.fromMicrosecondsSinceEpoch(1700000000123),
      );

      expect(
        p.dirname(copiedPath),
        p.join(supportDir.path, 'photos'),
      );
      expect(p.basename(copiedPath), '1700000000123_foto_libur__1__.png');
      expect(File(copiedPath).existsSync(), isTrue);
      expect(File(copiedPath).readAsBytesSync(), _png1x1);

      // MissingPluginException atau berkas sumber hilang tetap fallback aman.
      final fallbackPlugin = await persistPhotoFile(
        samplePhoto.path,
        sanitized,
        supportDirectoryProvider: () async =>
            throw MissingPluginException('no path_provider'),
      );
      expect(fallbackPlugin, samplePhoto.path);

      final missingSource = p.join(tempDir.path, 'tidak_ada.png');
      final fallbackMissing = await persistPhotoFile(
        missingSource,
        sanitized,
        supportDirectoryProvider: () async => supportDir,
      );
      expect(fallbackMissing, missingSource);

      // FileSystemException saat membuat folder/salin harus melempar error.
      final blocker = File(p.join(tempDir.path, 'blocker'))..createSync();
      await expectLater(
        persistPhotoFile(
          samplePhoto.path,
          sanitized,
          supportDirectoryProvider: () async => Directory(blocker.path),
        ),
        throwsA(
          isA<PhotoPickerException>().having(
            (e) => e.code,
            'code',
            'storage_copy_failed',
          ),
        ),
      );

      // Kegagalan salin di dalam pickPhotoWith & recoverLostPhotoWith diteruskan.
      await expectLater(
        pickPhotoWith(
          PhotoSource.camera,
          ({
            required ImageSource source,
            double? maxWidth,
            double? maxHeight,
            int? imageQuality,
          }) async => XFile(samplePhoto.path),
          persistPhoto: (sourcePath, name) => persistPhotoFile(
            sourcePath,
            name,
            supportDirectoryProvider: () async => Directory(blocker.path),
          ),
        ),
        throwsA(
          isA<PhotoPickerException>().having(
            (e) => e.code,
            'code',
            'storage_copy_failed',
          ),
        ),
      );
    });

    test('pickPhotoWith memakai callback persistensi bila tersedia', () async {
      final supportDir = Directory(
        p.join(tempDir.path, 'support_pick'),
      )..createSync();
      final picked = await pickPhotoWith(
        PhotoSource.camera,
        ({
          required ImageSource source,
          double? maxWidth,
          double? maxHeight,
          int? imageQuality,
        }) async => XFile(samplePhoto.path),
        persistPhoto: (sourcePath, name) => persistPhotoFile(
          sourcePath,
          name,
          supportDirectoryProvider: () async => supportDir,
        ),
      );

      expect(picked, isNotNull);
      expect(p.isWithin(p.join(supportDir.path, 'photos'), picked!.path), isTrue);
      expect(File(picked.path).existsSync(), isTrue);
    });

    test('recoverLostPhotoWith memulihkan foto, menangani error, dan aman saat kosong', () async {
      final supportDir = Directory(
        p.join(tempDir.path, 'support_lost'),
      )..createSync();

      // Kosong -> null.
      final emptyResult = await recoverLostPhotoWith(
        retrieveLostData: () async => LostDataResponse.empty(),
      );
      expect(emptyResult, isNull);

      // MissingPluginException -> null.
      final missingPluginResult = await recoverLostPhotoWith(
        retrieveLostData: () async =>
            throw MissingPluginException('no retrieveLostData'),
      );
      expect(missingPluginResult, isNull);

      // Foto valid -> disalin ke penyimpanan persisten.
      final recovered = await recoverLostPhotoWith(
        retrieveLostData: () async => LostDataResponse(
          file: XFile(samplePhoto.path),
          type: RetrieveType.image,
        ),
        persistPhoto: (sourcePath, name) => persistPhotoFile(
          sourcePath,
          name,
          supportDirectoryProvider: () async => supportDir,
        ),
      );
      expect(recovered, isNotNull);
      expect(recovered!.name, 'foto_bromo.png');
      expect(
        p.isWithin(p.join(supportDir.path, 'photos'), recovered.path),
        isTrue,
      );

      // Exception dari Android -> PhotoPickerException.
      await expectLater(
        recoverLostPhotoWith(
          retrieveLostData: () async => LostDataResponse(
            exception: PlatformException(code: 'camera_access_denied'),
          ),
        ),
        throwsA(
          isA<PhotoPickerException>().having(
            (e) => e.code,
            'code',
            'camera_access_denied',
          ),
        ),
      );
    });

    test('recoverLostPhoto mengembalikan null di luar Android', () async {
      debugDefaultTargetPlatformOverride = TargetPlatform.iOS;
      addTearDown(() => debugDefaultTargetPlatformOverride = null);
      expect(await recoverLostPhoto(), isNull);
    });

    test('recoverLostPhotoForTarget hanya memulihkan untuk target dan userId yang cocok', () async {
      await markPendingPhotoCapture(
        target: PhotoCaptureTarget.editProfile,
        userId: 'user-1',
      );

      var recoverCalls = 0;
      Future<PickedPhoto?> fakeRecover() async {
        recoverCalls++;
        return PickedPhoto(path: samplePhoto.path, name: 'pulih.png');
      }

      // Target salah -> tidak memanggil recover.
      expect(
        await recoverLostPhotoForTarget(
          target: PhotoCaptureTarget.proposeFacility,
          userId: 'user-1',
          recover: fakeRecover,
        ),
        isNull,
      );
      // User salah -> tidak memanggil recover.
      expect(
        await recoverLostPhotoForTarget(
          target: PhotoCaptureTarget.editProfile,
          userId: 'user-2',
          recover: fakeRecover,
        ),
        isNull,
      );
      expect(recoverCalls, 0);

      // Target dan user cocok -> dipulihkan lalu penanda dibersihkan.
      final recovered = await recoverLostPhotoForTarget(
        target: PhotoCaptureTarget.editProfile,
        userId: 'user-1',
        recover: fakeRecover,
      );
      expect(recovered?.path, samplePhoto.path);
      expect(recoverCalls, 1);

      // Pemanggilan ulang sesudah dikonsumsi mengembalikan null.
      expect(
        await recoverLostPhotoForTarget(
          target: PhotoCaptureTarget.editProfile,
          userId: 'user-1',
          recover: fakeRecover,
        ),
        isNull,
      );
      expect(recoverCalls, 1);
    });

    test(
      'recoverLostPhotoForTarget lambat tidak menghapus penanda captureId baru',
      () async {
        final firstId = await markPendingPhotoCapture(
          target: PhotoCaptureTarget.proposeFacility,
          userId: 'user-1',
        );
        final recoverCompleter = Completer<PickedPhoto?>();
        final slowRecovery = recoverLostPhotoForTarget(
          target: PhotoCaptureTarget.proposeFacility,
          userId: 'user-1',
          recover: () => recoverCompleter.future,
        );

        await Future<void>.delayed(Duration.zero);

        final secondId = await markPendingPhotoCapture(
          target: PhotoCaptureTarget.editProfile,
          userId: 'user-2',
        );
        expect(secondId, isNot(firstId));

        // Membersihkan ID lama tidak boleh menghapus penanda aktif terbaru.
        await clearPendingPhotoCapture(captureId: firstId);

        recoverCompleter.complete(
          PickedPhoto(path: samplePhoto.path, name: 'kedaluwarsa.png'),
        );
        expect(await slowRecovery, isNull);

        // Penanda terbaru harus tetap ada dan bisa dipulihkan oleh pemiliknya.
        final activeRecovered = await recoverLostPhotoForTarget(
          target: PhotoCaptureTarget.editProfile,
          userId: 'user-2',
          recover: () async =>
              PickedPhoto(path: samplePhoto.path, name: 'terbaru.png'),
        );
        expect(activeRecovered?.name, 'terbaru.png');
      },
    );

    test(
      'clearPendingPhotoCapture ID lama bersamaan dengan markPendingPhotoCapture baru tidak menimpa penanda baru',
      () async {
        final prefs = await SharedPreferences.getInstance();

        // Urutan 1: clear ID lama dan mark baru dijalankan bersamaan.
        final firstId = await markPendingPhotoCapture(
          target: PhotoCaptureTarget.proposeFacility,
          userId: 'user-1',
        );
        final clearFirst = clearPendingPhotoCapture(captureId: firstId);
        final markSecond = markPendingPhotoCapture(
          target: PhotoCaptureTarget.editProfile,
          userId: 'user-2',
        );
        await clearFirst;
        final secondId = await markSecond;

        // Urutan 2: mark baru dijalankan duluan lalu langsung disusul clear ID lama tanpa await.
        final markThird = markPendingPhotoCapture(
          target: PhotoCaptureTarget.editProfile,
          userId: 'user-3',
        );
        final staleClearSecond = clearPendingPhotoCapture(captureId: secondId);
        final thirdId = await markThird;
        await staleClearSecond;

        final storedRaw = prefs.getString('dolenae.media.pending_photo_capture.v1');
        expect(storedRaw, isNotNull);
        final storedMap =
            (jsonDecode(storedRaw!) as Map).cast<String, dynamic>();
        expect(storedMap['id'], thirdId);
        expect(storedMap['target'], PhotoCaptureTarget.editProfile.name);
        expect(storedMap['userId'], 'user-3');

        final recovered = await recoverLostPhotoForTarget(
          target: PhotoCaptureTarget.editProfile,
          userId: 'user-3',
          recover: () async => PickedPhoto(path: samplePhoto.path, name: 'aman.png'),
        );
        expect(recovered?.name, 'aman.png');
      },
    );

    test(
      'dua recoverLostPhotoForTarget bersamaan untuk captureId sama hanya menjalankan satu pemulihan native',
      () async {
        await markPendingPhotoCapture(
          target: PhotoCaptureTarget.proposeFacility,
          userId: 'user-1',
        );
        final firstStarted = Completer<void>();
        final firstGate = Completer<PickedPhoto?>();
        var firstCalls = 0;
        var secondCalls = 0;

        final firstFuture = recoverLostPhotoForTarget(
          target: PhotoCaptureTarget.proposeFacility,
          userId: 'user-1',
          recover: () {
            firstCalls++;
            if (!firstStarted.isCompleted) firstStarted.complete();
            return firstGate.future;
          },
        );
        final secondFuture = recoverLostPhotoForTarget(
          target: PhotoCaptureTarget.proposeFacility,
          userId: 'user-1',
          recover: () async {
            secondCalls++;
            return null;
          },
        );

        await firstStarted.future;
        expect(await secondFuture, isNull);
        expect(secondCalls, 0);

        firstGate.complete(
          PickedPhoto(path: samplePhoto.path, name: 'tunggal.png'),
        );
        final firstResult = await firstFuture;
        expect(firstResult?.name, 'tunggal.png');
        expect(firstCalls, 1);

        // Setelah pemulihan selesai dan penanda bersih, panggilan ulang tetap kosong.
        expect(
          await recoverLostPhotoForTarget(
            target: PhotoCaptureTarget.proposeFacility,
            userId: 'user-1',
            recover: () async =>
                PickedPhoto(path: samplePhoto.path, name: 'ulang.png'),
          ),
          isNull,
        );
      },
    );
  });

  group('AuthLocalDataSource avatar override per akun', () {
    test('menyimpan 3 keadaan per userId dan tahan JSON korup', () async {
      SharedPreferences.setMockInitialValues({
        '${AuthLocalDataSource.avatarOverrideKeyPrefix}u-corrupt': '{rusak',
      });
      final prefs = await SharedPreferences.getInstance();
      final local = AuthLocalDataSource(SecureTokenStore(), prefs);

      expect(
        (await local.readAvatarOverride('u1')).mode,
        AvatarOverrideMode.followServer,
      );
      expect(
        (await local.readAvatarOverride('u-corrupt')).mode,
        AvatarOverrideMode.followServer,
      );

      await local.writeAvatarOverride('u1', AvatarOverride.custom('/a/b.png'));
      await local.writeAvatarOverride('u2', const AvatarOverride.cleared());

      final readU1 = await local.readAvatarOverride('u1');
      final readU2 = await local.readAvatarOverride('u2');
      expect(readU1.mode, AvatarOverrideMode.custom);
      expect(readU1.path, '/a/b.png');
      expect(readU1.apply('https://server/u1.png'), '/a/b.png');
      expect(readU2.mode, AvatarOverrideMode.cleared);
      expect(readU2.apply('https://server/u2.png'), isNull);

      await local.clearAvatarOverride('u1');
      final resetU1 = await local.readAvatarOverride('u1');
      expect(resetU1.mode, AvatarOverrideMode.followServer);
      expect(resetU1.apply('https://server/u1.png'), 'https://server/u1.png');
    });
  });

  group('AuthRepositoryImpl.updateProfile dengan foto lokal', () {
    test('tidak mengirim avatarUrl ke backend dan menyimpan lokal', () async {
      final local = _MemoryAuthLocal(
        session: const AuthSession(
          token: 'token-123',
          user: AuthUser(
            id: 'user-1',
            name: 'Dimas',
            email: 'dimas@dolenae.id',
            role: 'wisatawan',
          ),
        ),
      );
      final bodies = <Map<String, dynamic>>[];
      final client = ApiClient(
        httpClient: MockClient((req) async {
          if (req.method == 'PATCH' && req.url.path == '/api/auth/me') {
            bodies.add(
              (jsonDecode(req.body) as Map).cast<String, dynamic>(),
            );
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'user': {
                    'id': 'user-1',
                    'name': bodies.last['name'],
                    'email': 'dimas@dolenae.id',
                    'role': 'wisatawan',
                    'avatarUrl': null,
                  },
                },
              }),
              200,
              headers: const {'content-type': 'application/json'},
            );
          }
          return http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'user-1',
                  'name': 'Dimas Baru',
                  'email': 'dimas@dolenae.id',
                  'role': 'wisatawan',
                  'avatarUrl': null,
                },
              },
            }),
            200,
            headers: const {'content-type': 'application/json'},
          );
        }),
        baseUrl: 'http://test.local/api',
      );
      final repo = AuthRepositoryImpl(
        AuthRemoteDataSource(client),
        local,
        client,
        GoogleSignInSource(serverClientId: 'test-id'),
      );
      await repo.restore();

      final saved = await repo.updateProfile(
        name: 'Dimas Baru',
        avatarUrl: samplePhoto.path,
      );
      expect(bodies.single.containsKey('avatarUrl'), isFalse);
      expect(saved.valueOrNull?.user.avatarUrl, samplePhoto.path);
      expect(local.session?.user.avatarUrl, samplePhoto.path);

      // Update berikutnya tanpa mengubah foto mempertahankan avatar lokal.
      final kept = await repo.updateProfile(name: 'Dimas Lagi');
      expect(kept.valueOrNull?.user.avatarUrl, samplePhoto.path);

      // Verify saat startup tetap menjaga path lokal bila backend null.
      final verified = await repo.verify();
      expect(verified.valueOrNull?.user.avatarUrl, samplePhoto.path);

      // Hapus foto menghapus avatar lokal.
      final cleared = await repo.updateProfile(
        name: 'Dimas Lagi',
        clearAvatar: true,
      );
      expect(cleared.valueOrNull?.user.avatarUrl, isNull);
      expect(local.session?.user.avatarUrl, isNull);
    });

    test(
      'override avatar lokal menang atas server dan terisolasi per akun',
      () async {
        const serverAvatarUser1 = 'https://cdn.dolenae.id/server-user-1.jpg';
        const serverAvatarUser2 = 'https://cdn.dolenae.id/server-user-2.jpg';

        final local = _MemoryAuthLocal();
        var activeUserId = 'user-1';
        final client = ApiClient(
          httpClient: MockClient((req) async {
            if (req.method == 'POST' && req.url.path == '/api/auth/login') {
              final body =
                  (jsonDecode(req.body) as Map).cast<String, dynamic>();
              final isUser2 = body['email'] == 'user2@dolenae.id';
              activeUserId = isUser2 ? 'user-2' : 'user-1';
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': {
                    'token': isUser2 ? 'token-u2' : 'token-u1',
                    'user': {
                      'id': activeUserId,
                      'name': isUser2 ? 'Sari' : 'Dimas',
                      'email': body['email'],
                      'role': 'wisatawan',
                      'avatarUrl':
                          isUser2 ? serverAvatarUser2 : serverAvatarUser1,
                    },
                  },
                }),
                200,
                headers: const {'content-type': 'application/json'},
              );
            }
            if (req.method == 'PATCH' && req.url.path == '/api/auth/me') {
              final body =
                  (jsonDecode(req.body) as Map).cast<String, dynamic>();
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': {
                    'user': {
                      'id': activeUserId,
                      'name': body['name'],
                      'email': '$activeUserId@dolenae.id',
                      'role': 'wisatawan',
                      'avatarUrl': activeUserId == 'user-2'
                          ? serverAvatarUser2
                          : serverAvatarUser1,
                    },
                  },
                }),
                200,
                headers: const {'content-type': 'application/json'},
              );
            }
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'user': {
                    'id': activeUserId,
                    'name': activeUserId == 'user-2' ? 'Sari' : 'Dimas',
                    'email': '$activeUserId@dolenae.id',
                    'role': 'wisatawan',
                    'avatarUrl': activeUserId == 'user-2'
                        ? serverAvatarUser2
                        : serverAvatarUser1,
                  },
                },
              }),
              200,
              headers: const {'content-type': 'application/json'},
            );
          }),
          baseUrl: 'http://test.local/api',
        );
        final repo = AuthRepositoryImpl(
          AuthRemoteDataSource(client),
          local,
          client,
          GoogleSignInSource(serverClientId: 'test-id'),
        );

        // (a) Akun user-1 punya avatar server, lalu ganti ke foto lokal.
        final login1 = await repo.login(
          email: 'user1@dolenae.id',
          password: 'secret',
        );
        expect(login1.valueOrNull?.user.avatarUrl, serverAvatarUser1);

        final customSave = await repo.updateProfile(
          name: 'Dimas Lokal',
          avatarUrl: samplePhoto.path,
        );
        expect(customSave.valueOrNull?.user.avatarUrl, samplePhoto.path);
        expect(
          (await repo.verify()).valueOrNull?.user.avatarUrl,
          samplePhoto.path,
        );
        expect(
          (await repo.updateProfile(name: 'Dimas Edit')).valueOrNull?.user.avatarUrl,
          samplePhoto.path,
        );

        // (c) Ganti ke user-2: tidak boleh mewarisi override user-1.
        await repo.logout();
        final login2 = await repo.login(
          email: 'user2@dolenae.id',
          password: 'secret',
        );
        expect(login2.valueOrNull?.user.avatarUrl, serverAvatarUser2);
        expect(
          (await repo.verify()).valueOrNull?.user.avatarUrl,
          serverAvatarUser2,
        );

        // Kembali ke user-1: override custom user-1 masih utuh.
        await repo.logout();
        final relogin1 = await repo.login(
          email: 'user1@dolenae.id',
          password: 'secret',
        );
        expect(relogin1.valueOrNull?.user.avatarUrl, samplePhoto.path);

        // (b) user-1 hapus foto -> tetap null meski server masih kirim avatarUrl.
        final cleared = await repo.updateProfile(
          name: 'Dimas Tanpa Foto',
          clearAvatar: true,
        );
        expect(cleared.valueOrNull?.user.avatarUrl, isNull);
        expect((await repo.verify()).valueOrNull?.user.avatarUrl, isNull);
        expect(
          (await repo.updateProfile(name: 'Dimas Tanpa Foto 2'))
              .valueOrNull
              ?.user
              .avatarUrl,
          isNull,
        );
      },
    );

    test(
      'kegagalan menulis override avatar mengembalikan Failure tanpa menandai sukses',
      () async {
        final local = _MemoryAuthLocal(
          failOnWriteOverride: true,
          session: const AuthSession(
            token: 'token-123',
            user: AuthUser(
              id: 'user-1',
              name: 'Dimas',
              email: 'dimas@dolenae.id',
              role: 'wisatawan',
              avatarUrl: 'https://cdn.dolenae.id/server.jpg',
            ),
          ),
        );
        final client = ApiClient(
          httpClient: MockClient(
            (_) async => http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'user': {
                    'id': 'user-1',
                    'name': 'Dimas Baru',
                    'email': 'dimas@dolenae.id',
                    'role': 'wisatawan',
                    'avatarUrl': 'https://cdn.dolenae.id/server.jpg',
                  },
                },
              }),
              200,
              headers: const {'content-type': 'application/json'},
            ),
          ),
          baseUrl: 'http://test.local/api',
        );
        final repo = AuthRepositoryImpl(
          AuthRemoteDataSource(client),
          local,
          client,
          GoogleSignInSource(serverClientId: 'test-id'),
        );
        await repo.restore();

        final pickRes = await repo.updateProfile(
          name: 'Dimas Baru',
          avatarUrl: samplePhoto.path,
        );
        expect(pickRes.isFailure, isTrue);
        expect(pickRes.failureOrNull?.message, contains('foto profil'));
        expect(
          local.session?.user.avatarUrl,
          'https://cdn.dolenae.id/server.jpg',
        );

        final clearRes = await repo.updateProfile(
          name: 'Dimas Baru',
          clearAvatar: true,
        );
        expect(clearRes.isFailure, isTrue);
        expect(
          local.session?.user.avatarUrl,
          'https://cdn.dolenae.id/server.jpg',
        );
      },
    );

    test(
      'SharedPreferences setString atau remove mengembalikan false menggagalkan persistensi dan updateProfile',
      () async {
        SharedPreferences.setMockInitialValues({});
        final basePrefs = await SharedPreferences.getInstance();
        final secure = _MemorySecureTokenStore();
        const initialSession = AuthSession(
          token: 'token-123',
          user: AuthUser(
            id: 'user-1',
            name: 'Dimas',
            email: 'dimas@dolenae.id',
            role: 'wisatawan',
            avatarUrl: 'https://cdn.dolenae.id/server.jpg',
          ),
        );
        await AuthLocalDataSource(secure, basePrefs).save(initialSession);

        final failingOverridePrefs = _FailingSetStringPrefs(
          basePrefs,
          failingKeyPrefix: AuthLocalDataSource.avatarOverrideKeyPrefix,
        );
        final local = AuthLocalDataSource(secure, failingOverridePrefs);
        final client = ApiClient(
          httpClient: MockClient(
            (_) async => http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'user': {
                    'id': 'user-1',
                    'name': 'Dimas Baru',
                    'email': 'dimas@dolenae.id',
                    'role': 'wisatawan',
                    'avatarUrl': 'https://cdn.dolenae.id/server.jpg',
                  },
                },
              }),
              200,
              headers: const {'content-type': 'application/json'},
            ),
          ),
          baseUrl: 'http://test.local/api',
        );
        final repo = AuthRepositoryImpl(
          AuthRemoteDataSource(client),
          local,
          client,
          GoogleSignInSource(serverClientId: 'test-id'),
        );
        await repo.restore();

        final res = await repo.updateProfile(
          name: 'Dimas Baru',
          avatarUrl: samplePhoto.path,
        );
        expect(res.isFailure, isTrue);
        expect(res.failureOrNull?.message, contains('foto profil'));

        final persisted = await local.read();
        expect(persisted?.user.name, 'Dimas');
        expect(
          persisted?.user.avatarUrl,
          'https://cdn.dolenae.id/server.jpg',
        );

        final failingSessionLocal = AuthLocalDataSource(
          secure,
          _FailingSetStringPrefs(
            basePrefs,
            failingKeyPrefix: AuthLocalDataSource.userKey,
            failOnRemove: true,
          ),
        );
        await expectLater(
          failingSessionLocal.save(initialSession),
          throwsStateError,
        );
        await expectLater(failingSessionLocal.clear(), throwsStateError);
        await expectLater(
          failingSessionLocal.clearAvatarOverride('user-1'),
          throwsStateError,
        );
      },
    );

    test(
      'AuthLocalDataSource.save melakukan rollback atomik atau bersih total saat setString/writeAccessToken gagal',
      () async {
        SharedPreferences.setMockInitialValues({});
        final basePrefs = await SharedPreferences.getInstance();
        final secure = _MemorySecureTokenStore();
        const oldSession = AuthSession(
          token: 'token-u1',
          user: AuthUser(
            id: 'user-1',
            name: 'Dimas Lama',
            email: 'user1@dolenae.id',
            role: 'wisatawan',
          ),
        );
        const newSession = AuthSession(
          token: 'token-u2',
          user: AuthUser(
            id: 'user-2',
            name: 'Sari Baru',
            email: 'user2@dolenae.id',
            role: 'wisatawan',
          ),
        );

        // 1. writeAccessToken melempar error sekali -> rollback ke pasangan lama (token-u1 + user-1).
        final local = AuthLocalDataSource(secure, basePrefs);
        await local.save(oldSession);
        secure.failNextWrite = true;
        await expectLater(local.save(newSession), throwsStateError);
        final rolledBack = await local.read();
        expect(rolledBack?.token, 'token-u1');
        expect(rolledBack?.user.id, 'user-1');

        // 2. writeAccessToken terus gagal termasuk saat rollback -> kedua penyimpanan dibersihkan.
        secure.failAllWrites = true;
        await expectLater(local.save(newSession), throwsStateError);
        expect(await local.read(), isNull);
        expect(await secure.readAccessToken(), isNull);
        expect(basePrefs.getString(AuthLocalDataSource.userKey), isNull);

        // 3. setString mengembalikan false pada userKey -> error dan kedua penyimpanan bersih bila rollback gagal.
        secure.failAllWrites = false;
        await local.save(oldSession);
        final failingUserLocal = AuthLocalDataSource(
          secure,
          _FailingSetStringPrefs(
            basePrefs,
            failingKeyPrefix: AuthLocalDataSource.userKey,
          ),
        );
        await expectLater(failingUserLocal.save(newSession), throwsStateError);
        expect(await failingUserLocal.read(), isNull);
        expect(await secure.readAccessToken(), isNull);
        expect(basePrefs.getString(AuthLocalDataSource.userKey), isNull);

        // 4. setString dan fallback remove sama-sama mengembalikan false -> _pendingUserPurge aktif
        // hingga remove pulih dan menghapus userKey saat read() berikutnya.
        await local.save(oldSession);
        final stuckPrefs = _FailingSetStringPrefs(
          basePrefs,
          failingKeyPrefix: AuthLocalDataSource.userKey,
          failOnRemove: true,
        );
        final stuckLocal = AuthLocalDataSource(secure, stuckPrefs);
        await expectLater(stuckLocal.save(newSession), throwsStateError);
        expect(await secure.readAccessToken(), isNull);
        expect(basePrefs.getString(AuthLocalDataSource.userKey), isNotNull);
        expect(await stuckLocal.read(), isNull);
        expect(basePrefs.getString(AuthLocalDataSource.userKey), isNotNull);

        stuckPrefs.failOnRemove = false;
        expect(await stuckLocal.read(), isNull);
        expect(basePrefs.getString(AuthLocalDataSource.userKey), isNull);
      },
    );

    test(
      'verify yang terlambat selesai setelah akun berganti tidak menimpa sesi baru',
      () async {
        final local = _MemoryAuthLocal();
        final staleMeCompleter = Completer<http.Response>();
        final client = ApiClient(
          httpClient: MockClient((req) async {
            if (req.method == 'POST' && req.url.path == '/api/auth/login') {
              final body =
                  (jsonDecode(req.body) as Map).cast<String, dynamic>();
              final isUser2 = body['email'] == 'user2@dolenae.id';
              final uid = isUser2 ? 'user-2' : 'user-1';
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': {
                    'token': isUser2 ? 'token-u2' : 'token-u1',
                    'user': {
                      'id': uid,
                      'name': isUser2 ? 'Sari' : 'Dimas',
                      'email': body['email'],
                      'role': 'wisatawan',
                    },
                  },
                }),
                200,
                headers: const {'content-type': 'application/json'},
              );
            }
            if (req.url.path == '/api/auth/me' &&
                req.headers['Authorization'] == 'Bearer token-u1') {
              return staleMeCompleter.future;
            }
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'user': {
                    'id': 'user-2',
                    'name': 'Sari',
                    'email': 'user2@dolenae.id',
                    'role': 'wisatawan',
                  },
                },
              }),
              200,
              headers: const {'content-type': 'application/json'},
            );
          }),
          baseUrl: 'http://test.local/api',
        );
        final repo = AuthRepositoryImpl(
          AuthRemoteDataSource(client),
          local,
          client,
          GoogleSignInSource(serverClientId: 'test-id'),
        );

        await repo.login(email: 'user1@dolenae.id', password: 'secret');
        final pendingVerify = repo.verify();

        // Ganti ke user-2 sebelum respons verify user-1 tiba.
        await repo.logout();
        await repo.login(email: 'user2@dolenae.id', password: 'secret');

        staleMeCompleter.complete(
          http.Response(
            jsonEncode({
              'success': true,
              'data': {
                'user': {
                  'id': 'user-1',
                  'name': 'Dimas Lama',
                  'email': 'user1@dolenae.id',
                  'role': 'wisatawan',
                },
              },
            }),
            200,
            headers: const {'content-type': 'application/json'},
          ),
        );

        final verifyRes = await pendingVerify;
        expect(verifyRes.isFailure, isTrue);
        expect(verifyRes.failureOrNull?.code, 'SESSION_CHANGED');
        expect(local.session?.user.id, 'user-2');
        expect(local.session?.token, 'token-u2');
        expect(client.token, 'token-u2');
      },
    );

    test(
      'verify yang tertahan di dalam _local.save tidak menimpa akun yang baru login',
      () async {
        var gateUser1Save = false;
        final saveStarted = Completer<void>();
        final saveGate = Completer<void>();
        late final _MemoryAuthLocal local;
        local = _MemoryAuthLocal(
          onSave: (value) async {
            if (gateUser1Save && value.token == 'token-u1') {
              gateUser1Save = false;
              if (!saveStarted.isCompleted) saveStarted.complete();
              await saveGate.future;
            }
          },
        );
        final client = ApiClient(
          httpClient: MockClient((req) async {
            if (req.method == 'POST' && req.url.path == '/api/auth/login') {
              final body =
                  (jsonDecode(req.body) as Map).cast<String, dynamic>();
              final isUser2 = body['email'] == 'user2@dolenae.id';
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': {
                    'token': isUser2 ? 'token-u2' : 'token-u1',
                    'user': {
                      'id': isUser2 ? 'user-2' : 'user-1',
                      'name': isUser2 ? 'Sari' : 'Dimas',
                      'email': body['email'],
                      'role': 'wisatawan',
                    },
                  },
                }),
                200,
                headers: const {'content-type': 'application/json'},
              );
            }
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'user': {
                    'id': 'user-1',
                    'name': 'Dimas Verify',
                    'email': 'user1@dolenae.id',
                    'role': 'wisatawan',
                  },
                },
              }),
              200,
              headers: const {'content-type': 'application/json'},
            );
          }),
          baseUrl: 'http://test.local/api',
        );
        final repo = AuthRepositoryImpl(
          AuthRemoteDataSource(client),
          local,
          client,
          GoogleSignInSource(serverClientId: 'test-id'),
        );

        await repo.login(email: 'user1@dolenae.id', password: 'secret');
        gateUser1Save = true;
        final pendingVerify = repo.verify();
        await saveStarted.future;

        final pendingLogin2 = repo.login(
          email: 'user2@dolenae.id',
          password: 'secret',
        );
        await Future<void>.delayed(Duration.zero);

        saveGate.complete();
        final verifyRes = await pendingVerify;
        final login2Res = await pendingLogin2;

        expect(verifyRes.isFailure, isTrue);
        expect(verifyRes.failureOrNull?.code, 'SESSION_CHANGED');
        expect(login2Res.isSuccess, isTrue);
        expect(local.session?.user.id, 'user-2');
        expect(local.session?.token, 'token-u2');
        expect(client.token, 'token-u2');
      },
    );

    test(
      'logout yang diikuti login gagal tetap menghapus sesi lokal sehingga restore kosong',
      () async {
        var gateUser1Save = false;
        final saveStarted = Completer<void>();
        final saveGate = Completer<void>();
        late final _MemoryAuthLocal local;
        local = _MemoryAuthLocal(
          onSave: (value) async {
            if (gateUser1Save && value.token == 'token-u1') {
              gateUser1Save = false;
              if (!saveStarted.isCompleted) saveStarted.complete();
              await saveGate.future;
            }
          },
        );
        final client = ApiClient(
          httpClient: MockClient((req) async {
            if (req.method == 'POST' && req.url.path == '/api/auth/login') {
              final body =
                  (jsonDecode(req.body) as Map).cast<String, dynamic>();
              if (body['email'] == 'bad@dolenae.id') {
                return http.Response(
                  jsonEncode({
                    'success': false,
                    'message': 'Email atau kata sandi salah.',
                  }),
                  401,
                  headers: const {'content-type': 'application/json'},
                );
              }
              return http.Response(
                jsonEncode({
                  'success': true,
                  'data': {
                    'token': 'token-u1',
                    'user': {
                      'id': 'user-1',
                      'name': 'Dimas',
                      'email': 'user1@dolenae.id',
                      'role': 'wisatawan',
                    },
                  },
                }),
                200,
                headers: const {'content-type': 'application/json'},
              );
            }
            return http.Response(
              jsonEncode({
                'success': true,
                'data': {
                  'user': {
                    'id': 'user-1',
                    'name': 'Dimas Verify',
                    'email': 'user1@dolenae.id',
                    'role': 'wisatawan',
                  },
                },
              }),
              200,
              headers: const {'content-type': 'application/json'},
            );
          }),
          baseUrl: 'http://test.local/api',
        );
        final repo = AuthRepositoryImpl(
          AuthRemoteDataSource(client),
          local,
          client,
          GoogleSignInSource(serverClientId: 'test-id'),
        );

        await repo.login(email: 'user1@dolenae.id', password: 'secret');
        gateUser1Save = true;
        final pendingVerify = repo.verify();
        await saveStarted.future;

        final pendingLogout = repo.logout();
        final failedLogin = repo.login(
          email: 'bad@dolenae.id',
          password: 'wrong',
        );
        await Future<void>.delayed(Duration.zero);

        saveGate.complete();
        await pendingVerify;
        expect((await pendingLogout).isSuccess, isTrue);
        expect((await failedLogin).isFailure, isTrue);
        expect(local.session, isNull);
        expect((await repo.restore()).isFailure, isTrue);
        expect(client.token, isNull);
      },
    );

    test(
      'AuthController.verifySession mengabaikan hasil sesi lama saat user sudah berganti',
      () async {
        const user1Session = AuthSession(
          token: 'token-u1',
          user: AuthUser(
            id: 'user-1',
            name: 'Dimas',
            email: 'user1@dolenae.id',
            role: 'wisatawan',
          ),
        );
        const user2Session = AuthSession(
          token: 'token-u2',
          user: AuthUser(
            id: 'user-2',
            name: 'Sari',
            email: 'user2@dolenae.id',
            role: 'wisatawan',
          ),
        );
        final verifyCompleter = Completer<Result<AuthSession>>();
        final repo = _RaceAuthRepository(
          verifyCompleter: verifyCompleter,
          nextLoginSession: user2Session,
        );
        final controller = AuthController(
          repository: repo,
          initialSession: user1Session,
        );
        addTearDown(controller.dispose);

        final pendingVerify = controller.verifySession();
        await controller.logout();
        await controller.login(email: 'user2@dolenae.id', password: 'secret');
        expect(controller.user?.id, 'user-2');

        verifyCompleter.complete(const Success(user1Session));
        await pendingVerify;

        expect(controller.user?.id, 'user-2');
        expect(controller.token, 'token-u2');
      },
    );
  });

  group('DnAvatar & DnLocalImage', () {
    testWidgets('file valid merender Image dan file hilang fallback aman', (
      tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Column(
            children: [
              DnAvatar(imagePath: samplePhoto.path, initials: 'DP', size: 64),
              const DnAvatar(
                imagePath: '/jalur/tidak/ada/foto.png',
                initials: 'AB',
                size: 64,
              ),
              const DnLocalImage(
                path: '/jalur/tidak/ada/thumb.png',
                fallback: Text('Fallback'),
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(Image), findsOneWidget);
      expect(find.text('AB'), findsOneWidget);
      expect(find.text('Fallback'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });

  group('EditProfileScreen foto profil', () {
    testWidgets('ambil foto dari kamera, simpan, dan tampil di Profil & Beranda', (
      tester,
    ) async {
      await usePhone(tester);
      final store = newStore();
      await store.auth.login(email: 'dimas@dolenae.id', password: 'secret');
      final sources = <PhotoSource>[];

      await tester.pumpWidget(
        wrapScreen(
          EditProfileScreen(
            onPickPhoto: (source) async {
              sources.add(source);
              return PickedPhoto(path: samplePhoto.path, name: 'kamera.png');
            },
          ),
          store: store,
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Ganti foto'));
      await tester.pumpAndSettle();
      expect(find.text('Ambil dari kamera'), findsOneWidget);
      expect(find.text('Pilih dari galeri'), findsOneWidget);
      expect(find.text('Hapus foto'), findsNothing);

      await tester.tap(find.text('Ambil dari kamera'));
      await tester.pumpAndSettle();

      expect(sources, [PhotoSource.camera]);
      expect(find.byType(Image), findsOneWidget);

      await tester.tap(find.text('Simpan'));
      await tester.pumpAndSettle();

      expect(store.auth.user?.avatarUrl, samplePhoto.path);

      // Verifikasi ProfileScreen dan BerandaScreen merender foto profil baru.
      await tester.pumpWidget(wrapScreen(const ProfileScreen(), store: store));
      await tester.pumpAndSettle();
      expect(find.byType(Image), findsOneWidget);

      await tester.pumpWidget(wrapScreen(const BerandaScreen(), store: store));
      await tester.pumpAndSettle();
      expect(find.byType(Image), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('pilih dari galeri dan hapus foto lewat avatar', (tester) async {
      await usePhone(tester);
      final store = newStore();
      await store.auth.login(email: 'dimas@dolenae.id', password: 'secret');
      final sources = <PhotoSource>[];

      await tester.pumpWidget(
        wrapScreen(
          EditProfileScreen(
            onPickPhoto: (source) async {
              sources.add(source);
              return PickedPhoto(path: samplePhoto.path, name: 'galeri.png');
            },
          ),
          store: store,
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('edit-profile-avatar')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Pilih dari galeri'));
      await tester.pumpAndSettle();

      expect(sources, [PhotoSource.gallery]);
      expect(find.byType(Image), findsOneWidget);

      // Buka lagi sekarang opsi Hapus foto muncul.
      await tester.tap(find.text('Ganti foto'));
      await tester.pumpAndSettle();
      expect(find.text('Hapus foto'), findsOneWidget);

      await tester.tap(find.text('Hapus foto'));
      await tester.pumpAndSettle();
      expect(find.byType(Image), findsNothing);
    });

    testWidgets('penolakan izin kamera menampilkan DnToast gagal', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(
          EditProfileScreen(
            onPickPhoto: (_) async => throw const PhotoPickerException(
              'Izin kamera ditolak. Aktifkan akses kamera di pengaturan perangkat.',
              code: 'camera_access_denied',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Ganti foto'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Ambil dari kamera'));
      await tester.pumpAndSettle();

      expect(find.textContaining('Izin kamera ditolak'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('memulihkan foto tertunda hanya untuk user yang cocok', (
      tester,
    ) async {
      await usePhone(tester);
      final store = newStore();
      await store.auth.login(email: 'dimas@dolenae.id', password: 'secret');
      final activeUserId = store.auth.user?.id;

      // Penanda milik user lain tidak memulihkan foto di layar ini.
      await markPendingPhotoCapture(
        target: PhotoCaptureTarget.editProfile,
        userId: 'user-lain',
      );
      await tester.pumpWidget(
        wrapScreen(
          EditProfileScreen(
            onRecoverLostPhoto: () async =>
                PickedPhoto(path: samplePhoto.path, name: 'pulih.png'),
          ),
          store: store,
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(Image), findsNothing);

      // Penanda cocok dengan user & target -> foto pulih otomatis.
      await markPendingPhotoCapture(
        target: PhotoCaptureTarget.editProfile,
        userId: activeUserId,
      );
      await tester.pumpWidget(
        wrapScreen(
          EditProfileScreen(
            key: UniqueKey(),
            onRecoverLostPhoto: () async =>
                PickedPhoto(path: samplePhoto.path, name: 'pulih.png'),
          ),
          store: store,
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(Image), findsOneWidget);
      expect(tester.takeException(), isNull);

      // Error PhotoPickerException saat pemulihan menampilkan DnToast gagal.
      await markPendingPhotoCapture(
        target: PhotoCaptureTarget.editProfile,
        userId: activeUserId,
      );
      await tester.pumpWidget(
        wrapScreen(
          EditProfileScreen(
            key: UniqueKey(),
            onRecoverLostPhoto: () async => throw const PhotoPickerException(
              'Gagal menyimpan foto ke penyimpanan perangkat. Coba lagi.',
              code: 'storage_copy_failed',
            ),
          ),
          store: store,
        ),
      );
      await tester.pumpAndSettle();
      expect(
        find.textContaining('Gagal menyimpan foto ke penyimpanan perangkat'),
        findsOneWidget,
      );
      expect(tester.takeException(), isNull);
    });

    testWidgets(
      'pemulihan foto profil lambat tidak memasang pratinjau jika user berganti di tengah jalan',
      (tester) async {
        await usePhone(tester);
        final store = newStore();
        await store.auth.login(email: 'dimas@dolenae.id', password: 'secret');
        await markPendingPhotoCapture(
          target: PhotoCaptureTarget.editProfile,
          userId: store.auth.user?.id,
        );
        final recoverStarted = Completer<void>();
        final recoverCompleter = Completer<PickedPhoto?>();

        await tester.pumpWidget(
          wrapScreen(
            EditProfileScreen(
              onRecoverLostPhoto: () {
                if (!recoverStarted.isCompleted) recoverStarted.complete();
                return recoverCompleter.future;
              },
            ),
            store: store,
          ),
        );
        await tester.pump();
        await tester.pump();
        expect(recoverStarted.isCompleted, isTrue);

        await store.auth.logout();
        await tester.pump();
        recoverCompleter.complete(
          PickedPhoto(path: samplePhoto.path, name: 'bocor_profil.png'),
        );
        await tester.pumpAndSettle();

        expect(find.byType(Image), findsNothing);
        expect(tester.takeException(), isNull);
      },
    );
  });

  group('ProposeFacilityScreen foto fasilitas', () {
    testWidgets('kamera, pratinjau, submit photoPath, sukses, dan tersimpan', (
      tester,
    ) async {
      await usePhone(tester);
      final sent = <FacilityProposal>[];
      final sources = <PhotoSource>[];

      await tester.pumpWidget(
        wrapScreen(
          ProposeFacilityScreen(
            onPickPhoto: (source) async {
              sources.add(source);
              return PickedPhoto(path: samplePhoto.path, name: 'foto_bromo.png');
            },
            onSubmit: sent.add,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(inputFor('Nama fasilitas'), 'Warung Bromo');
      await tester.enterText(inputFor('Alamat'), 'Cemoro Lawang, Probolinggo');

      await scrollTo(tester, find.text('Tambah foto'));
      await tester.tap(find.text('Tambah foto'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Ambil dari kamera'));
      await tester.pumpAndSettle();

      expect(sources, [PhotoSource.camera]);
      expect(find.text('foto_bromo.png'), findsOneWidget);
      expect(find.text('Tambah foto'), findsOneWidget);
      expect(find.byType(Image), findsOneWidget);

      await tester.tap(find.text('Simpan usulan'));
      await tester.pumpAndSettle();

      expect(sent, hasLength(1));
      expect(sent.single.photoPath, samplePhoto.path);

      // Verifikasi ProposalSuccessScreen & SavedProposalsScreen.
      await tester.pumpWidget(
        wrapScreen(ProposalSuccessScreen(proposal: sent.single)),
      );
      await tester.pumpAndSettle();
      expect(find.text('Foto lampiran'), findsOneWidget);
      expect(find.text('foto_bromo.png'), findsOneWidget);
      expect(tester.takeException(), isNull);

      await tester.pumpWidget(
        wrapScreen(SavedProposalsScreen(items: [sent.single])),
      );
      await tester.pumpAndSettle();
      expect(find.text('Foto: foto_bromo.png'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('galeri, hapus foto, dan path hilang di layar hasil tetap aman', (
      tester,
    ) async {
      await usePhone(tester);
      final sent = <FacilityProposal>[];
      final sources = <PhotoSource>[];

      await tester.pumpWidget(
        wrapScreen(
          ProposeFacilityScreen(
            onPickPhoto: (source) async {
              sources.add(source);
              return PickedPhoto(path: samplePhoto.path, name: 'warung.png');
            },
            onSubmit: sent.add,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(inputFor('Nama fasilitas'), 'Pos Pendakian');
      await tester.enterText(inputFor('Alamat'), 'Desa Ranupani');

      await scrollTo(tester, find.text('Tambah foto'));
      await tester.tap(find.text('Tambah foto'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Pilih dari galeri'));
      await tester.pumpAndSettle();

      expect(sources, [PhotoSource.gallery]);
      expect(find.text('warung.png'), findsOneWidget);

      // Hapus lewat bottom sheet.
      await tester.tap(find.text('Tambah foto'));
      await tester.pumpAndSettle();
      expect(find.text('Hapus foto'), findsOneWidget);
      await tester.tap(find.text('Hapus foto'));
      await tester.pumpAndSettle();
      expect(find.text('warung.png'), findsNothing);

      // Pilih lagi lalu hapus lewat tombol ikon kartu pratinjau.
      await tester.tap(find.text('Tambah foto'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Pilih dari galeri'));
      await tester.pumpAndSettle();
      await tester.tap(find.byIcon(AppIcons.delete));
      await tester.pumpAndSettle();
      expect(find.text('warung.png'), findsNothing);

      await tester.tap(find.text('Simpan usulan'));
      await tester.pumpAndSettle();
      expect(sent.single.photoPath, isNull);

      // ProposalSuccessScreen dan SavedProposalsScreen aman saat file sudah tidak ada.
      final missingPhotoProposal = FacilityProposal(
        id: 'prop-missing',
        name: 'Basecamp',
        type: ProposalType.accommodation,
        nearestDestinationName: 'Gunung Prau',
        address: 'Dieng',
        photoPath: '/path/tidak/ada/hilang.jpg',
        status: ProposalStatus.menunggu,
        createdAt: DateTime(2026, 7, 12),
      );
      await tester.pumpWidget(
        wrapScreen(ProposalSuccessScreen(proposal: missingPhotoProposal)),
      );
      await tester.pumpAndSettle();
      expect(find.text('hilang.jpg'), findsOneWidget);
      expect(tester.takeException(), isNull);

      await tester.pumpWidget(
        wrapScreen(SavedProposalsScreen(items: [missingPhotoProposal])),
      );
      await tester.pumpAndSettle();
      expect(find.text('Foto: hilang.jpg'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('penolakan izin kamera pada usulan menampilkan DnToast gagal', (
      tester,
    ) async {
      await usePhone(tester);
      await tester.pumpWidget(
        wrapScreen(
          ProposeFacilityScreen(
            onPickPhoto: (_) async => throw const PhotoPickerException(
              'Izin kamera ditolak. Aktifkan akses kamera di pengaturan perangkat.',
              code: 'camera_access_denied',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await scrollTo(tester, find.text('Tambah foto'));
      await tester.tap(find.text('Tambah foto'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Ambil dari kamera'));
      await tester.pumpAndSettle();

      expect(find.textContaining('Izin kamera ditolak'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets(
      'memulihkan foto tertunda hanya untuk target usulan dan user cocok',
      (tester) async {
        await usePhone(tester);
        final store = newStore();
        await store.auth.login(email: 'dimas@dolenae.id', password: 'secret');
        final activeUserId = store.auth.user?.id;

        // Target editProfile tidak boleh bocor ke ProposeFacilityScreen.
        await markPendingPhotoCapture(
          target: PhotoCaptureTarget.editProfile,
          userId: activeUserId,
        );
        await tester.pumpWidget(
          wrapScreen(
            ProposeFacilityScreen(
              onRecoverLostPhoto: () async =>
                  PickedPhoto(path: samplePhoto.path, name: 'pulih_usulan.png'),
            ),
            store: store,
          ),
        );
        await tester.pumpAndSettle();
        expect(find.byType(Image), findsNothing);

        // Target proposeFacility & user cocok -> foto terpasang di pratinjau.
        await markPendingPhotoCapture(
          target: PhotoCaptureTarget.proposeFacility,
          userId: activeUserId,
        );
        await tester.pumpWidget(
          wrapScreen(
            ProposeFacilityScreen(
              key: UniqueKey(),
              onRecoverLostPhoto: () async =>
                  PickedPhoto(path: samplePhoto.path, name: 'pulih_usulan.png'),
            ),
            store: store,
          ),
        );
        await tester.pumpAndSettle();
        expect(find.text('pulih_usulan.png'), findsOneWidget);
        expect(find.byType(Image), findsOneWidget);
        expect(tester.takeException(), isNull);
      },
    );

    testWidgets(
      'pemulihan foto usulan lambat tidak memasang pratinjau jika user berganti di tengah jalan',
      (tester) async {
        await usePhone(tester);
        final store = newStore();
        await store.auth.login(email: 'dimas@dolenae.id', password: 'secret');
        await markPendingPhotoCapture(
          target: PhotoCaptureTarget.proposeFacility,
          userId: store.auth.user?.id,
        );
        final recoverStarted = Completer<void>();
        final recoverCompleter = Completer<PickedPhoto?>();

        await tester.pumpWidget(
          wrapScreen(
            ProposeFacilityScreen(
              onRecoverLostPhoto: () {
                if (!recoverStarted.isCompleted) recoverStarted.complete();
                return recoverCompleter.future;
              },
            ),
            store: store,
          ),
        );
        await tester.pump();
        await tester.pump();
        expect(recoverStarted.isCompleted, isTrue);

        await store.auth.logout();
        await tester.pump();
        recoverCompleter.complete(
          PickedPhoto(path: samplePhoto.path, name: 'bocor_usulan.png'),
        );
        await tester.pumpAndSettle();

        expect(find.text('bocor_usulan.png'), findsNothing);
        expect(find.byType(Image), findsNothing);
        expect(tester.takeException(), isNull);
      },
    );
  });
}

class _MemoryAuthLocal implements AuthLocalDataSource {
  _MemoryAuthLocal({
    this.session,
    this.failOnWriteOverride = false,
    this.onSave,
  });

  AuthSession? session;
  String? rememberedEmail;
  final bool failOnWriteOverride;
  final Future<void> Function(AuthSession value)? onSave;
  final Map<String, AvatarOverride> avatarOverrides = {};

  @override
  Future<AuthSession?> read() async => session;

  @override
  Future<void> save(AuthSession value) async {
    if (onSave != null) {
      await onSave!(value);
    }
    session = value;
  }

  @override
  Future<void> clear() async => session = null;

  @override
  Future<String?> readRememberedEmail() async => rememberedEmail;

  @override
  Future<void> writeRememberedEmail(String? email) async =>
      rememberedEmail = email;

  @override
  Future<AvatarOverride> readAvatarOverride(String userId) async =>
      avatarOverrides[userId] ?? const AvatarOverride.followServer();

  @override
  Future<void> writeAvatarOverride(
    String userId,
    AvatarOverride override,
  ) async {
    if (failOnWriteOverride) {
      throw StateError('disk write failed');
    }
    if (override.mode == AvatarOverrideMode.followServer) {
      avatarOverrides.remove(userId);
      return;
    }
    avatarOverrides[userId] = override;
  }

  @override
  Future<void> clearAvatarOverride(String userId) async {
    avatarOverrides.remove(userId);
  }
}

class _RaceAuthRepository implements AuthRepository {
  _RaceAuthRepository({
    required this.verifyCompleter,
    required this.nextLoginSession,
  });

  final Completer<Result<AuthSession>> verifyCompleter;
  final AuthSession nextLoginSession;

  @override
  Future<Result<AuthSession>> restore() async => Success(nextLoginSession);

  @override
  Future<Result<AuthSession>> verify() => verifyCompleter.future;

  @override
  Future<Result<AuthSession>> login({
    required String email,
    required String password,
  }) async => Success(nextLoginSession);

  @override
  Future<Result<AuthSession>> register({
    required String name,
    required String email,
    required String password,
  }) async => Success(nextLoginSession);

  @override
  Future<Result<AuthSession>> updateProfile({
    required String name,
    String? phone,
    String? city,
    String? bio,
    String? avatarUrl,
    bool clearAvatar = false,
  }) async => Success(nextLoginSession);

  @override
  Future<Result<AuthSession>> googleSignIn() async => Success(nextLoginSession);

  @override
  Future<String?> readRememberedEmail() async => null;

  @override
  Future<void> writeRememberedEmail(String? email) async {}

  @override
  Future<Result<String>> forgotPassword({required String email}) async =>
      const Success('ok');

  @override
  Future<Result<String>> resendVerificationEmail({
    required String email,
  }) async => const Success('ok');

  @override
  Future<Result<void>> logout() async => const Success(null);
}

class _MemorySecureTokenStore implements SecureTokenStore {
  String? token;
  bool failNextWrite = false;
  bool failAllWrites = false;

  @override
  Future<String?> readAccessToken() async => token;

  @override
  Future<void> writeAccessToken(String value) async {
    if (failAllWrites) {
      throw StateError('keystore write failed');
    }
    if (failNextWrite) {
      failNextWrite = false;
      throw StateError('keystore write failed once');
    }
    token = value;
  }

  @override
  Future<void> clearAccessToken() async => token = null;
}

class _FailingSetStringPrefs implements SharedPreferences {
  _FailingSetStringPrefs(
    this._delegate, {
    this.failingKeyPrefix = '',
    this.failOnRemove = false,
  });

  final SharedPreferences _delegate;
  String failingKeyPrefix;
  bool failOnRemove;

  @override
  Set<String> getKeys() => _delegate.getKeys();

  @override
  Object? get(String key) => _delegate.get(key);

  @override
  bool? getBool(String key) => _delegate.getBool(key);

  @override
  int? getInt(String key) => _delegate.getInt(key);

  @override
  double? getDouble(String key) => _delegate.getDouble(key);

  @override
  String? getString(String key) => _delegate.getString(key);

  @override
  bool containsKey(String key) => _delegate.containsKey(key);

  @override
  List<String>? getStringList(String key) => _delegate.getStringList(key);

  @override
  Future<bool> setBool(String key, bool value) =>
      _delegate.setBool(key, value);

  @override
  Future<bool> setInt(String key, int value) => _delegate.setInt(key, value);

  @override
  Future<bool> setDouble(String key, double value) =>
      _delegate.setDouble(key, value);

  @override
  Future<bool> setString(String key, String value) async {
    if (failingKeyPrefix.isNotEmpty && key.startsWith(failingKeyPrefix)) {
      return false;
    }
    return _delegate.setString(key, value);
  }

  @override
  Future<bool> setStringList(String key, List<String> value) =>
      _delegate.setStringList(key, value);

  @override
  Future<bool> remove(String key) async {
    if (failOnRemove) return false;
    return _delegate.remove(key);
  }

  @override
  @Deprecated('This method is now a no-op, and should no longer be called.')
  Future<bool> commit() async => true;

  @override
  Future<bool> clear() => _delegate.clear();

  @override
  Future<void> reload() => _delegate.reload();
}
