import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../../data/models/travel_support.dart';
import '../icons/app_icons.dart';

/// Baris fasilitas (component `SupportRow (Alam)`, 3 tipe).
class DnSupportRow extends StatelessWidget {
  const DnSupportRow({
    super.key,
    required this.support,
    this.onTap,
    this.trailing,
  });

  final TravelSupport support;
  final VoidCallback? onTap;
  final Widget? trailing;

  IconData get _icon => switch (support.category) {
    SupportCategory.penginapan => AppIcons.bedDouble,
    SupportCategory.transportasi => AppIcons.car,
    SupportCategory.makanan => AppIcons.utensils,
  };

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.s3),
        decoration: BoxDecoration(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.hairline),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.canvas,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Icon(_icon, size: 20, color: AppColors.primary),
            ),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          support.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.titleSm,
                        ),
                      ),
                      if (support.verified) ...[
                        const SizedBox(width: AppSpacing.s1),
                        const Icon(
                          AppIcons.badgeCheck,
                          size: 16,
                          color: AppColors.success,
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${support.categoryLabel} · ${support.locationLabel}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption,
                  ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.s2),
            if (trailing != null)
              trailing!
            else
              Text(
                support.priceLabel,
                style: AppTextStyles.labelSm.copyWith(color: AppColors.primary),
              ),
          ],
        ),
      ),
    );
  }
}
