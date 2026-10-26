import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';

/// Badge tingkat kesulitan: pemula=success, menengah=warning, sulit=danger.
class DnDifficultyBadge extends StatelessWidget {
  const DnDifficultyBadge({super.key, required this.level});

  final DifficultyLevel level;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (level) {
      DifficultyLevel.pemula => ('Ramah pemula', AppColors.success),
      DifficultyLevel.menengah => ('Menengah', AppColors.warning),
      DifficultyLevel.sulit => ('Sulit', AppColors.danger),
    };

    return Container(
      height: 24,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.canvas,
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: AppColors.hairline),
      ),
      alignment: Alignment.center,
      child: Text(
        label,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }
}
