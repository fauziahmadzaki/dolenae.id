import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Baris pilihan (component `SelectableRow (Alam)`, state Kosong/Terpilih).
class DnSelectableRow extends StatelessWidget {
  const DnSelectableRow({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.subtitle,
    this.leading,
  });

  final String label;
  final String? subtitle;
  final bool selected;
  final VoidCallback onTap;
  final IconData? leading;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.all(AppSpacing.s4),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.hairline,
          ),
        ),
        child: Row(
          children: [
            if (leading != null) ...[
              Icon(leading, size: 20, color: selected ? AppColors.onPrimary : AppColors.body),
              const SizedBox(width: AppSpacing.s3),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: AppTextStyles.body.copyWith(
                      color: selected ? AppColors.onPrimary : AppColors.ink,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: AppSpacing.s1),
                    Text(
                      subtitle!,
                      style: AppTextStyles.caption.copyWith(
                        color: selected ? AppColors.onPrimary : AppColors.body,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.s3),
            Icon(
              selected ? AppIcons.badgeCheck : Icons.circle_outlined,
              size: 22,
              color: selected ? AppColors.onPrimary : AppColors.borderStrong,
            ),
          ],
        ),
      ),
    );
  }
}
