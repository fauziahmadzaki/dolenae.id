import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Status item checklist (component `PreparationChecklistItem (Alam)`).
enum DnChecklistState { pending, done, warning }

/// Baris item checklist persiapan.
class DnPreparationChecklistItem extends StatelessWidget {
  const DnPreparationChecklistItem({
    super.key,
    required this.label,
    required this.state,
    this.onTap,
    this.required = false,
    this.note,
  });

  final String label;
  final DnChecklistState state;
  final VoidCallback? onTap;

  /// Menandai item sebagai wajib; memakai label "Wajib".
  final bool required;
  final String? note;

  @override
  Widget build(BuildContext context) {
    final done = state == DnChecklistState.done;
    final warning = state == DnChecklistState.warning;
    final borderColor = warning ? AppColors.warning : AppColors.hairline;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.s3),
        decoration: BoxDecoration(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: done ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(AppRadius.sm),
                border: done
                    ? null
                    : Border.all(color: AppColors.borderStrong, width: 1.5),
              ),
              child: done
                  ? const Icon(
                      AppIcons.check,
                      size: 16,
                      color: AppColors.onPrimary,
                    )
                  : null,
            ),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: AppTextStyles.bodySm.copyWith(
                      color: done ? AppColors.body : AppColors.ink,
                      decoration: done ? TextDecoration.lineThrough : null,
                      decorationColor: AppColors.body,
                    ),
                  ),
                  if (note != null) ...[
                    const SizedBox(height: 2),
                    Text(note!, style: AppTextStyles.caption),
                  ],
                ],
              ),
            ),
            if (warning) ...[
              const SizedBox(width: AppSpacing.s2),
              const Icon(
                AppIcons.alertTriangle,
                size: 18,
                color: AppColors.warning,
              ),
            ],
            if (required) ...[
              const SizedBox(width: AppSpacing.s2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.canvas,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Text('Wajib', style: AppTextStyles.overline),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
