import 'dart:io';

import 'package:flutter/services.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'package:dolenae_mobile/src/core/media/photo_picker_exception.dart';

/// Menyalin berkas foto sementara ke direktori privat persisten aplikasi
/// (`getApplicationSupportDirectory()/photos/<timestamp>_<sanitized_basename>`).
///
/// Mengembalikan [sourcePath] apa adanya hanya bila berkas sumber belum ada di
/// disk (mis. path tiruan uji) atau plugin direktori tidak tersedia
/// ([MissingPluginException] / [UnsupportedError]). Kegagalan salin native
/// melempar [PhotoPickerException].
Future<String> persistPhotoFile(
  String sourcePath,
  String sanitizedBasename, {
  Future<Directory> Function()? supportDirectoryProvider,
  DateTime Function()? nowProvider,
}) async {
  final sourceFile = File(sourcePath);
  if (!await sourceFile.exists()) {
    return sourcePath;
  }

  final Directory supportDir;
  try {
    supportDir =
        await (supportDirectoryProvider ?? getApplicationSupportDirectory)();
  } on MissingPluginException {
    return sourcePath;
  } on UnsupportedError {
    return sourcePath;
  } on PlatformException {
    throw const PhotoPickerException(
      'Gagal menyimpan foto ke penyimpanan perangkat. Coba lagi.',
      code: 'storage_copy_failed',
    );
  }

  try {
    final photosDir = Directory(p.join(supportDir.path, 'photos'));
    if (p.isWithin(photosDir.path, sourcePath)) {
      return sourcePath;
    }
    await photosDir.create(recursive: true);

    final timestamp = (nowProvider ?? DateTime.now)().microsecondsSinceEpoch;
    var targetPath = p.join(photosDir.path, '${timestamp}_$sanitizedBasename');
    var suffix = 1;
    while (await File(targetPath).exists()) {
      targetPath = p.join(
        photosDir.path,
        '${timestamp}_${suffix}_$sanitizedBasename',
      );
      suffix++;
    }

    final copied = await sourceFile.copy(targetPath);
    return copied.path;
  } on FileSystemException {
    throw const PhotoPickerException(
      'Gagal menyimpan foto ke penyimpanan perangkat. Coba lagi.',
      code: 'storage_copy_failed',
    );
  }
}
