import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';

/// Chip kategori/tag. `active` memakai `primary` + teks `on-primary`.
class DnChip extends StatelessWidget {
  const DnChip({
    super.key,
    required this.label,
    this.active = false,
    this.leading,
    this.onTap,
  });

  final String label;
  final bool active;
  final IconData? leading;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final fg = active ? AppColors.onPrimary : AppColors.ink;
    return Material(
      color: active ? AppColors.primary : AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: Container(
          height: 32,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3 + 2),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            border: Border.all(
              color: active ? AppColors.primary : AppColors.hairline,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (leading != null) ...[
                Icon(leading, size: 14, color: active ? fg : AppColors.primary),
                const SizedBox(width: AppSpacing.s1 + 2),
              ],
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTextStyles.labelSm.copyWith(
                  fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                  color: fg,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
