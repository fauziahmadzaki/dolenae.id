import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Posisi langkah pada garis waktu (component `TripPlanStep (Alam)`).
enum DnStepPosition { pertama, tengah, terakhir }

/// Satu langkah hari pada timeline rencana, lengkap dengan konektor vertikal.
class DnTripPlanStep extends StatelessWidget {
  const DnTripPlanStep({
    super.key,
    required this.dayNumber,
    required this.title,
    required this.meta,
    required this.position,
    this.finished = false,
    this.trailing,
  });

  final int dayNumber;
  final String title;
  final String meta;
  final DnStepPosition position;
  final bool finished;
  final Widget? trailing;

  bool get _showTopLine => position != DnStepPosition.pertama;

  bool get _showBottomLine => position != DnStepPosition.terakhir;

  @override
  Widget build(BuildContext context) {
    final nodeColor = finished ? AppColors.success : AppColors.primary;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 32,
            child: Column(
              children: [
                Container(width: 2, height: 6, color: _showTopLine ? AppColors.hairline : Colors.transparent),
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: finished ? AppColors.success : AppColors.canvas,
                    shape: BoxShape.circle,
                    border: Border.all(color: nodeColor, width: 1.5),
                  ),
                  alignment: Alignment.center,
                  child: finished
                      ? const Icon(
                          AppIcons.check,
                          size: 14,
                          color: AppColors.onPrimary,
                        )
                      : Text(
                          '$dayNumber',
                          style: AppTextStyles.labelSm.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                ),
                Expanded(
                  child: Container(
                    width: 2,
                    color: _showBottomLine ? AppColors.hairline : Colors.transparent,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.s5),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hari $dayNumber',
                    style: AppTextStyles.overline,
                  ),
                  const SizedBox(height: 2),
                  Text(title, style: AppTextStyles.titleSm),
                  const SizedBox(height: 2),
                  Text(meta, style: AppTextStyles.caption),
                  if (trailing != null) ...[
                    const SizedBox(height: AppSpacing.s2),
                    trailing!,
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
