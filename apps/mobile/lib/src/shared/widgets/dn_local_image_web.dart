import 'package:flutter/material.dart';

/// Merender pratinjau berkas terpilih di Web (URI `blob:` / `data:` / HTTP)
/// tanpa memanggil `dart:io`.
Widget buildLocalImageFile(
  String path, {
  double? width,
  double? height,
  BoxFit fit = BoxFit.cover,
  required Widget fallback,
  String? semanticLabel,
}) {
  final scheme = Uri.tryParse(path)?.scheme.toLowerCase();
  final allowed =
      scheme == 'blob' ||
      scheme == 'data' ||
      scheme == 'http' ||
      scheme == 'https';
  if (!allowed) {
    return fallback;
  }
  return Semantics(
    label: semanticLabel,
    image: true,
    child: Image.network(
      path,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (_, _, _) => fallback,
    ),
  );
}
