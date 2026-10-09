import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_text_styles.dart';

/// Jenis tag fasilitas (component `FacilityTag (Alam)`).
enum DnFacilityTagKind { terrain, aktivitas, musim, kesulitan }

/// Tag kecil untuk metadata destinasi.
class DnFacilityTag extends StatelessWidget {
  const DnFacilityTag({
    super.key,
    required this.label,
    this.kind = DnFacilityTagKind.terrain,
    this.icon,
  });

  final String label;
  final DnFacilityTagKind kind;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final (fg, bg) = switch (kind) {
      DnFacilityTagKind.terrain => (AppColors.primary, AppColors.canvas),
      DnFacilityTagKind.aktivitas => (AppColors.accent, AppColors.canvas),
      DnFacilityTagKind.musim => (AppColors.body, AppColors.canvasSubtle),
      DnFacilityTagKind.kesulitan => (AppColors.success, AppColors.canvas),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(color: fg.withValues(alpha: 0.24)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: AppTextStyles.overline.copyWith(color: fg),
          ),
        ],
      ),
    );
  }
}
