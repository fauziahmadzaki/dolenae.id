import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// Penjaga batas lapisan clean architecture `apps/mobile`.
///
/// Aturan yang diuji:
/// - `domain` bebas Flutter dan tidak tahu `data`/`presentation`.
/// - `presentation` tidak mengimpor `data` fitur mana pun.
/// - `core` tidak mengimpor fitur mana pun.
///
/// Kalau salah satu gagal, pindahkan dependensi ke kontrak `domain` atau
/// daftarkan di `app/di/app_dependencies.dart`.
void main() {
  final libDir = Directory('lib/src');
  final dartFiles = libDir
      .listSync(recursive: true)
      .whereType<File>()
      .where((file) => file.path.endsWith('.dart'))
      .toList();

  test('lib/src memiliki file untuk diperiksa', () {
    expect(dartFiles, isNotEmpty);
  });

  test('domain tidak mengimpor Flutter, data, atau presentation', () {
    final violations = _violations(
      dartFiles,
      isTarget: (path) => _featureLayer(path) == 'domain',
      isForbidden: (import) =>
          import.startsWith('package:flutter/') ||
          _featureLayer(import) == 'data' ||
          _featureLayer(import) == 'presentation',
    );

    expect(violations, isEmpty, reason: violations.join('\n'));
  });

  test('presentation tidak mengimpor data fitur', () {
    final violations = _violations(
      dartFiles,
      isTarget: (path) => _featureLayer(path) == 'presentation',
      isForbidden: (import) => _featureLayer(import) == 'data',
    );

    expect(violations, isEmpty, reason: violations.join('\n'));
  });

  test('core tidak mengimpor fitur', () {
    final violations = _violations(
      dartFiles,
      isTarget: (path) => _normalize(path).contains('src/core/'),
      isForbidden: (import) => import.contains('/features/'),
    );

    expect(violations, isEmpty, reason: violations.join('\n'));
  });
}

/// Mengembalikan daftar pelanggaran, satu baris per import terlarang.
List<String> _violations(
  List<File> files, {
  required bool Function(String path) isTarget,
  required bool Function(String import) isForbidden,
}) {
  final violations = <String>[];
  for (final file in files) {
    final path = _normalize(file.path);
    if (!isTarget(path)) continue;

    for (final line in file.readAsLinesSync()) {
      final match = RegExp("^import '([^']+)';").firstMatch(line.trim());
      if (match == null) continue;
      final import = match.group(1)!;
      if (isForbidden(_normalize(import))) {
        violations.add('$path -> $import');
      }
    }
  }
  return violations;
}

/// Lapisan fitur dari path (`src/features/<fitur>/<lapisan>/...`).
String? _featureLayer(String path) {
  final normalized = _normalize(path);
  final match = RegExp(
    r'src/features/[^/]+/(domain|data|presentation)/',
  ).firstMatch(normalized);
  return match?.group(1);
}

String _normalize(String path) => path.replaceAll(r'\', '/');
