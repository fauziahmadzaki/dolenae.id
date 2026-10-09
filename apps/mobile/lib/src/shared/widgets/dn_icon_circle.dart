import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';

/// Ikon di dalam bulatan (kontainer lembut).
class DnIconCircle extends StatelessWidget {
  const DnIconCircle({
    super.key,
    required this.icon,
    this.size = 32,
    this.iconSize = 16,
    this.background = AppColors.canvas,
    this.color = AppColors.primary,
  });

  final IconData icon;
  final double size;
  final double iconSize;
  final Color background;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: background, shape: BoxShape.circle),
      child: Icon(icon, size: iconSize, color: color),
    );
  }
}
