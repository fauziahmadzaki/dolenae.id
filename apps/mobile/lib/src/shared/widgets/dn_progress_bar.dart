import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';

/// Progress bar tipis untuk ringkasan rencana/checklist.
class DnProgressBar extends StatelessWidget {
  const DnProgressBar({
    super.key,
    required this.value,
    this.fillColor = AppColors.primary,
  });

  /// Nilai 0.0–1.0.
  final double value;
  final Color fillColor;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(99),
      child: Container(
        height: 6,
        color: AppColors.canvas,
        child: FractionallySizedBox(
          alignment: Alignment.centerLeft,
          widthFactor: value.clamp(0, 1),
          child: Container(color: fillColor),
        ),
      ),
    );
  }
}
