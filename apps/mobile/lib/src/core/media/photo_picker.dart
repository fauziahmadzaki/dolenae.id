import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dolenae_mobile/src/core/media/photo_picker_exception.dart';
import 'package:dolenae_mobile/src/core/media/photo_storage_stub.dart'
    if (dart.library.io) 'package:dolenae_mobile/src/core/media/photo_storage_io.dart'
    as photo_storage;

export 'package:dolenae_mobile/src/core/media/photo_picker_exception.dart';

/// Sumber foto yang dapat dipilih pengguna.
enum PhotoSource { camera, gallery }

/// Layar asal pengambilan foto untuk mengikat pemulihan Android agar tidak
/// nyasar antar formulir.
enum PhotoCaptureTarget { editProfile, proposeFacility }

/// Data ringkas foto hasil kamera atau galeri.
class PickedPhoto {
  const PickedPhoto({required this.path, required this.name});

  final String path;
  final String name;
}

/// Kontrak pemilih foto agar layar dapat disuntik tiruan saat pengujian.
typedef PhotoPickerCallback = Future<PickedPhoto?> Function(PhotoSource source);

/// Tanda tangan fungsi pemilih mentah untuk keperluan pengujian unit.
@visibleForTesting
typedef RawImagePicker =
    Future<XFile?> Function({
      required ImageSource source,
      double? maxWidth,
      double? maxHeight,
      int? imageQuality,
    });

/// Tanda tangan helper penyalinan foto ke penyimpanan privat persisten.
@visibleForTesting
typedef PhotoPersistCallback =
    Future<String> Function(String sourcePath, String sanitizedBasename);

const _pendingPhotoCaptureKey = 'dolenae.media.pending_photo_capture.v1';

int _pendingCaptureSequence = 0;

String _nextCaptureId() {
  _pendingCaptureSequence += 1;
  return 'cap-${DateTime.now().microsecondsSinceEpoch}-$_pendingCaptureSequence';
}

class _PendingPhotoCapture {
  const _PendingPhotoCapture({
    required this.id,
    required this.target,
    this.userId,
  });

  final String id;
  final PhotoCaptureTarget target;
  final String? userId;
}

_PendingPhotoCapture? _inMemoryPendingCapture;
Future<void> _pendingCaptureQueue = Future.value();
int _pendingCaptureDepth = 0;
final Set<String> _claimedRecoveryCaptureIds = <String>{};

Future<T> _serializePendingCapture<T>(Future<T> Function() action) {
  final previous = _pendingCaptureDepth == 0 ? null : _pendingCaptureQueue;
  _pendingCaptureDepth += 1;
  final completer = Completer<T>();
  final done = Completer<void>.sync();
  _pendingCaptureQueue = done.future;

  Future<void> run() async {
    if (previous != null) {
      await previous;
    }
    try {
      final result = await action();
      _pendingCaptureDepth -= 1;
      done.complete();
      completer.complete(result);
    } catch (error, stackTrace) {
      _pendingCaptureDepth -= 1;
      done.complete();
      completer.completeError(error, stackTrace);
    }
  }

  run();
  return completer.future;
}

String? _normalizeUserId(String? userId) {
  final trimmed = userId?.trim();
  return (trimmed == null || trimmed.isEmpty) ? null : trimmed;
}

_PendingPhotoCapture? _decodePendingCapture(String raw) {
  try {
    final decoded = jsonDecode(raw);
    if (decoded is! Map) return null;
    final map = decoded.cast<String, dynamic>();
    final targetName = map['target'] as String?;
    final target = PhotoCaptureTarget.values
        .where((value) => value.name == targetName)
        .firstOrNull;
    if (target == null) return null;
    final id = (map['id'] as String?)?.trim() ?? '';
    return _PendingPhotoCapture(
      id: id,
      target: target,
      userId: _normalizeUserId(map['userId'] as String?),
    );
  } catch (_) {
    return null;
  }
}

/// Menandai bahwa pengambilan foto sedang menunggu hasil dari aplikasi eksternal
/// untuk [target] dan [userId] tertentu agar aman dipulihkan setelah proses mati.
/// Mengembalikan ID unik sesi pengambilan foto untuk menjaga pembersihan tetap tepat sasaran.
Future<String> markPendingPhotoCapture({
  required PhotoCaptureTarget target,
  String? userId,
}) {
  final normalizedUserId = _normalizeUserId(userId);
  return _serializePendingCapture(() async {
    final captureId = _nextCaptureId();
    _inMemoryPendingCapture = _PendingPhotoCapture(
      id: captureId,
      target: target,
      userId: normalizedUserId,
    );
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _pendingPhotoCaptureKey,
        jsonEncode({
          'id': captureId,
          'target': target.name,
          'userId': ?normalizedUserId,
        }),
      );
    } catch (_) {
      // Fallback memori tetap tersimpan bila plugin SharedPreferences tidak tersedia.
    }
    return captureId;
  });
}

/// Menghapus penanda pengambilan foto tertunda setelah proses selesai normal
/// atau sesudah pemulihan dikonsumsi. Bila [captureId] diberikan, penanda hanya
/// dihapus bila ID penanda aktif masih sama.
Future<void> clearPendingPhotoCapture({String? captureId}) {
  return _serializePendingCapture(
    () => _clearPendingPhotoCaptureLocked(captureId: captureId),
  );
}

Future<void> _clearPendingPhotoCaptureLocked({String? captureId}) async {
  if (captureId != null) {
    final current = await _readPendingPhotoCaptureLocked();
    if (current == null || current.id != captureId) {
      return;
    }
  }
  _inMemoryPendingCapture = null;
  try {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_pendingPhotoCaptureKey);
  } catch (_) {
    // Pembersihan bersifat best-effort bila SharedPreferences tidak tersedia.
  }
}

Future<_PendingPhotoCapture?> _readPendingPhotoCaptureLocked() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_pendingPhotoCaptureKey);
    if (raw == null || raw.isEmpty) {
      _inMemoryPendingCapture = null;
      return null;
    }
    final pending = _decodePendingCapture(raw);
    if (pending == null) return null;
    _inMemoryPendingCapture = pending;
    return pending;
  } catch (_) {
    return _inMemoryPendingCapture;
  }
}

/// Memulihkan foto tertunda Android hanya bila [target], [userId], dan sesi
/// penangkapan tetap cocok sebelum maupun sesudah pemulihan berjalan, dengan
/// maksimal satu pemulihan aktif per `captureId`.
Future<PickedPhoto?> recoverLostPhotoForTarget({
  required PhotoCaptureTarget target,
  String? userId,
  Future<PickedPhoto?> Function()? recover,
}) async {
  final normalizedUserId = _normalizeUserId(userId);
  final pending = await _serializePendingCapture(() async {
    final current = await _readPendingPhotoCaptureLocked();
    if (current == null ||
        current.target != target ||
        current.userId != normalizedUserId ||
        _claimedRecoveryCaptureIds.contains(current.id)) {
      return null;
    }
    _claimedRecoveryCaptureIds.add(current.id);
    return current;
  });
  if (pending == null) {
    return null;
  }

  final captureId = pending.id;
  var finalized = false;
  try {
    final recovered = await (recover ?? recoverLostPhoto)();
    return await _serializePendingCapture(() async {
      try {
        final current = await _readPendingPhotoCaptureLocked();
        await _clearPendingPhotoCaptureLocked(captureId: captureId);
        if (current == null ||
            current.id != captureId ||
            current.target != target ||
            current.userId != normalizedUserId) {
          return null;
        }
        return recovered;
      } finally {
        _claimedRecoveryCaptureIds.remove(captureId);
        finalized = true;
      }
    });
  } finally {
    if (!finalized) {
      await _serializePendingCapture(() async {
        try {
          await _clearPendingPhotoCaptureLocked(captureId: captureId);
        } finally {
          _claimedRecoveryCaptureIds.remove(captureId);
          finalized = true;
        }
      });
    }
  }
}

/// Mengambil atau memilih satu foto melalui [ImagePicker] dengan sisi maksimal
/// 1280 px dan kualitas 85, lalu menyalinnya ke direktori privat persisten.
Future<PickedPhoto?> defaultPickPhoto(PhotoSource source) {
  return pickPhotoWith(
    source,
    ({
      required ImageSource source,
      double? maxWidth,
      double? maxHeight,
      int? imageQuality,
    }) => ImagePicker().pickImage(
      source: source,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      imageQuality: imageQuality,
    ),
  );
}

/// Memulihkan foto yang tertunda ketika Android menghentikan Activity di tengah
/// proses kamera/galeri.
Future<PickedPhoto?> recoverLostPhoto() async {
  if (kIsWeb || defaultTargetPlatform != TargetPlatform.android) {
    return null;
  }
  return recoverLostPhotoWith(
    retrieveLostData: ImagePicker().retrieveLostData,
  );
}

/// Implementasi inti pemilih foto yang menyalin hasil ke penyimpanan persisten
/// dan memetakan galat platform ke pesan Bahasa Indonesia.
@visibleForTesting
Future<PickedPhoto?> pickPhotoWith(
  PhotoSource source,
  RawImagePicker pickImage, {
  PhotoPersistCallback? persistPhoto,
}) async {
  final imageSource = switch (source) {
    PhotoSource.camera => ImageSource.camera,
    PhotoSource.gallery => ImageSource.gallery,
  };

  try {
    final file = await pickImage(
      source: imageSource,
      maxWidth: 1280,
      maxHeight: 1280,
      imageQuality: 85,
    );
    if (file == null) return null;

    return await _materializePickedFile(file, persistPhoto: persistPhoto);
  } on MissingPluginException {
    throw PhotoPickerException(
      _unsupportedMessage(source),
      code: 'missing_plugin',
    );
  } on PlatformException catch (error) {
    throw PhotoPickerException(
      _mapPlatformError(error.code, source),
      code: error.code,
    );
  } on StateError catch (error) {
    throw PhotoPickerException(
      _unsupportedMessage(source),
      code: error.message,
    );
  } on UnsupportedError catch (error) {
    throw PhotoPickerException(
      _unsupportedMessage(source),
      code: error.message,
    );
  }
}

/// Implementasi inti pemulihan `retrieveLostData()` untuk Android agar dapat
/// diuji secara terisolasi.
@visibleForTesting
Future<PickedPhoto?> recoverLostPhotoWith({
  required Future<LostDataResponse> Function() retrieveLostData,
  PhotoPersistCallback? persistPhoto,
}) async {
  try {
    final response = await retrieveLostData();
    if (response.isEmpty) return null;

    final file =
        response.file ??
        (response.files != null && response.files!.isNotEmpty
            ? response.files!.last
            : null);
    if (file != null) {
      if (response.type != null && response.type != RetrieveType.image) {
        return null;
      }
      return await _materializePickedFile(file, persistPhoto: persistPhoto);
    }

    final exception = response.exception;
    if (exception != null) {
      throw PhotoPickerException(
        _mapPlatformError(exception.code, PhotoSource.camera),
        code: exception.code,
      );
    }
    return null;
  } on MissingPluginException {
    return null;
  } on PlatformException catch (error) {
    throw PhotoPickerException(
      _mapPlatformError(error.code, PhotoSource.camera),
      code: error.code,
    );
  } on UnsupportedError {
    return null;
  }
}

Future<PickedPhoto?> _materializePickedFile(
  XFile file, {
  PhotoPersistCallback? persistPhoto,
}) async {
  final trimmedPath = file.path.trim();
  if (trimmedPath.isEmpty) return null;

  final rawName = file.name.trim();
  final sanitizedName = sanitizePhotoBasename(
    rawName.isNotEmpty ? rawName : trimmedPath,
  );
  final persistedPath = await (persistPhoto ?? persistPickedPhotoPath)(
    trimmedPath,
    sanitizedName,
  );
  return PickedPhoto(path: persistedPath, name: sanitizedName);
}

/// Menyalin berkas terpilih ke penyimpanan privat aplikasi pada platform native.
Future<String> persistPickedPhotoPath(
  String sourcePath,
  String sanitizedBasename,
) {
  if (kIsWeb) return Future.value(sourcePath);
  return photo_storage.persistPhotoFile(sourcePath, sanitizedBasename);
}

/// Membersihkan nama berkas foto agar bebas segmen direktori maupun karakter
/// berisiko di sistem berkas.
@visibleForTesting
String sanitizePhotoBasename(String rawName) {
  final normalized = rawName.trim().replaceAll(r'\', '/');
  final base = p.basename(normalized);
  final cleaned = base
      .replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_')
      .replaceFirst(RegExp(r'^\.+'), '');
  if (cleaned.isEmpty) return 'photo.jpg';
  if (cleaned.length <= 80) return cleaned;

  final ext = p.extension(cleaned);
  final safeExt = ext.length <= 10 ? ext : '';
  final stemLength = 80 - safeExt.length;
  final stem = cleaned.substring(0, stemLength);
  return '$stem$safeExt';
}

String _mapPlatformError(String code, PhotoSource source) {
  return switch (code) {
    'camera_access_denied' || 'camera_access_restricted' =>
      'Izin kamera ditolak. Aktifkan akses kamera di pengaturan perangkat.',
    'photo_access_denied' || 'photo_access_restricted' =>
      'Izin galeri foto ditolak. Aktifkan akses foto di pengaturan perangkat.',
    'no_available_camera' => 'Kamera tidak tersedia pada perangkat ini.',
    'already_active' =>
      'Pemilih foto masih terbuka. Selesaikan proses sebelumnya terlebih dahulu.',
    'no_valid_image_uri' =>
      'Berkas gambar tidak dapat dibaca. Coba pilih foto lain.',
    _ =>
      source == PhotoSource.camera
          ? 'Gagal mengakses kamera. Periksa izin kamera dan coba lagi.'
          : 'Gagal membuka galeri foto. Periksa izin foto dan coba lagi.',
  };
}

String _unsupportedMessage(PhotoSource source) {
  return source == PhotoSource.camera
      ? 'Kamera tidak tersedia atau belum didukung pada perangkat ini.'
      : 'Pemilih galeri belum didukung pada perangkat ini.';
}
