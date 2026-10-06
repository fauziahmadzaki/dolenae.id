import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Kolom tanggal (component `DateField (Alam)`, state Default/Terisi).
class DnDateField extends StatelessWidget {
  const DnDateField({
    super.key,
    this.label,
    required this.value,
    required this.onTap,
    this.placeholder = 'Pilih tanggal',
    this.icon = AppIcons.calendar,
    this.errorText,
  });

  final String? label;
  final String value;
  final VoidCallback onTap;
  final String placeholder;
  final IconData icon;
  final String? errorText;

  @override
  Widget build(BuildContext context) {
    final filled = value.isNotEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(label!, style: AppTextStyles.caption.copyWith(color: AppColors.ink)),
          const SizedBox(height: AppSpacing.s2),
        ],
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
            decoration: BoxDecoration(
              color: AppColors.canvasSubtle,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: errorText != null ? AppColors.danger : AppColors.hairline,
              ),
            ),
            child: Row(
              children: [
                Icon(icon, size: 20, color: AppColors.body),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: Text(
                    filled ? value : placeholder,
                    style: AppTextStyles.body.copyWith(
                      color: filled ? AppColors.ink : AppColors.borderStrong,
                    ),
                  ),
                ),
                const Icon(AppIcons.chevronDown, size: 20, color: AppColors.body),
              ],
            ),
          ),
        ),
        if (errorText != null) ...[
          const SizedBox(height: AppSpacing.s1),
          Text(errorText!, style: AppTextStyles.caption.copyWith(color: AppColors.danger)),
        ],
      ],
    );
  }
}
