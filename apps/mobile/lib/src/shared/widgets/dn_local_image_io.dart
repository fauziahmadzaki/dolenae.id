import 'dart:io';

import 'package:flutter/material.dart';

/// Merender gambar dari berkas lokal pada platform native, dengan fallback aman
/// bila berkas belum ada atau gagal didekode.
Widget buildLocalImageFile(
  String path, {
  double? width,
  double? height,
  BoxFit fit = BoxFit.cover,
  required Widget fallback,
  String? semanticLabel,
}) {
  final file = File(path);
  if (!file.existsSync()) {
    return fallback;
  }
  return Semantics(
    label: semanticLabel,
    image: true,
    child: Image.file(
      file,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (_, _, _) => fallback,
    ),
  );
}
