import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';
import 'dn_progress_bar.dart';

/// Kartu rencana pada daftar rencana tersimpan.
///
/// `completed`/`total` opsional; bila diisi, progress bar dan baris meta
/// ditampilkan sesuai varian [PlanCard] "Dengan Support" di design.
class DnPlanCard extends StatelessWidget {
  const DnPlanCard({
    super.key,
    required this.name,
    required this.dateRange,
    required this.destinationName,
    this.meta,
    this.statusLabel,
    this.statusColor = AppColors.success,
    this.completed,
    this.total,
    this.onTap,
    this.onMore,
  });

  final String name;
  final String dateRange;
  final String destinationName;
  final String? meta;
  final String? statusLabel;
  final Color statusColor;
  final int? completed;
  final int? total;
  final VoidCallback? onTap;
  final VoidCallback? onMore;

  bool get _hasProgress => completed != null && total != null && total! > 0;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.s4),
        decoration: BoxDecoration(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.hairline),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(name, style: AppTextStyles.titleSm),
                ),
                if (statusLabel != null) ...[
                  const SizedBox(width: AppSpacing.s2),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.s2,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                    ),
                    child: Text(
                      statusLabel!,
                      style: AppTextStyles.overline.copyWith(color: statusColor),
                    ),
                  ),
                ],
                if (onMore != null) ...[
                  const SizedBox(width: AppSpacing.s1),
                  IconButton(
                    onPressed: onMore,
                    icon: const Icon(
                      AppIcons.delete,
                      size: 18,
                      color: AppColors.body,
                    ),
                    tooltip: 'Hapus rencana',
                  ),
                ],
              ],
            ),
            const SizedBox(height: AppSpacing.s1),
            Row(
              children: [
                const Icon(AppIcons.calendar, size: 14, color: AppColors.body),
                const SizedBox(width: AppSpacing.s1),
                Text(dateRange, style: AppTextStyles.caption),
              ],
            ),
            const SizedBox(height: AppSpacing.s2),
            Text(destinationName, style: AppTextStyles.bodySm),
            if (meta != null) ...[
              const SizedBox(height: 2),
              Text(meta!, style: AppTextStyles.caption),
            ],
            if (_hasProgress) ...[
              const SizedBox(height: AppSpacing.s3),
              DnProgressBar(value: completed! / total!),
              const SizedBox(height: AppSpacing.s1),
              Text(
                '$completed dari $total destinasi siap',
                style: AppTextStyles.caption,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
