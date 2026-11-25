import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/shared/widgets/dn_local_image_web.dart'
    if (dart.library.io) 'package:dolenae_mobile/src/shared/widgets/dn_local_image_io.dart'
    as platform_image;

/// Menampilkan gambar berkas lokal (atau `blob:`/`data:` di Web) dengan
/// fallback stabil ketika path kosong, tidak ada di disk, atau rusak.
class DnLocalImage extends StatelessWidget {
  const DnLocalImage({
    super.key,
    required this.path,
    required this.fallback,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.semanticLabel,
  });

  final String? path;
  final Widget fallback;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final normalized = normalizeLocalImagePath(path);
    final child = normalized == null
        ? fallback
        : platform_image.buildLocalImageFile(
            normalized,
            width: width,
            height: height,
            fit: fit,
            fallback: fallback,
            semanticLabel: semanticLabel,
          );

    if (borderRadius == null) return child;
    return ClipRRect(borderRadius: borderRadius!, child: child);
  }
}

/// Menormalkan path lokal atau `file://` URI agar aman dibaca platform.
String? normalizeLocalImagePath(String? raw) {
  final trimmed = raw?.trim() ?? '';
  if (trimmed.isEmpty) return null;
  if (!kIsWeb && trimmed.toLowerCase().startsWith('file://')) {
    try {
      return Uri.parse(trimmed).toFilePath();
    } catch (_) {
      return null;
    }
  }
  return trimmed;
}
