import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';

/// Badge tingkat kesulitan: pemula=success, menengah=warning, sulit=danger.
class DnDifficultyBadge extends StatelessWidget {
  const DnDifficultyBadge({
    super.key,
    required this.level,
    this.solid = true,
  });

  final DifficultyLevel? level;
  final bool solid;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (level) {
      DifficultyLevel.pemula => ('Ramah pemula', AppColors.success),
      DifficultyLevel.menengah => ('Menengah', AppColors.warning),
      DifficultyLevel.sulit => ('Sulit', AppColors.danger),
      null => ('Belum tersedia', AppColors.body),
    };

    return Container(
      height: 24,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: solid ? color : AppColors.canvas,
        borderRadius: BorderRadius.circular(99),
        border: solid ? null : Border.all(color: AppColors.hairline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: solid ? AppColors.onPrimary : color,
            ),
          ),
        ],
      ),
    );
  }
}
