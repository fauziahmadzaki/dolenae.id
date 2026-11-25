import 'package:flutter/material.dart';

/// Logo Google resmi untuk tombol "lanjut dengan Google".
class DnGoogleLogo extends StatelessWidget {
  const DnGoogleLogo({super.key, this.size = 20});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/google_logo.png',
      width: size,
      height: size,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
      excludeFromSemantics: true,
    );
  }
}
