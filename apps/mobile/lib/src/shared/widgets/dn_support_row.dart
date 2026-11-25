import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

/// Baris fasilitas (component `SupportRow (Alam)`, 3 tipe).
class DnSupportRow extends StatelessWidget {
  const DnSupportRow({
    super.key,
    required this.facility,
    this.onTap,
    this.trailing,
  });

  final Facility facility;
  final VoidCallback? onTap;
  final Widget? trailing;

  IconData get _icon => switch (facility.category) {
    FacilityCategory.penginapan => AppIcons.bedDouble,
    FacilityCategory.transportasi => AppIcons.car,
    FacilityCategory.makanan => AppIcons.utensils,
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
                      Expanded(
                        child: Text(
                          facility.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.titleSm,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    [
                      facility.categoryLabel,
                      if (facility.type.isNotEmpty) facility.type,
                    ].join(' · '),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        facility.verified
                            ? AppIcons.badgeCheck
                            : AppIcons.clock,
                        size: 13,
                        color: facility.verified
                            ? AppColors.success
                            : AppColors.body,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        facility.verified
                            ? 'Terverifikasi'
                            : 'Belum terverifikasi',
                        style: AppTextStyles.caption.copyWith(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: facility.verified
                              ? AppColors.success
                              : AppColors.body,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.s2),
            if (trailing != null)
              trailing!
            else
              _PriceStack(priceLabel: facility.priceLabel),
          ],
        ),
      ),
    );
  }
}

class _PriceStack extends StatelessWidget {
  const _PriceStack({required this.priceLabel});

  final String priceLabel;

  @override
  Widget build(BuildContext context) {
    final slash = priceLabel.indexOf('/');
    if (slash <= 0 || slash >= priceLabel.length - 1) {
      return Text(
        priceLabel,
        textAlign: TextAlign.right,
        style: AppTextStyles.labelSm.copyWith(color: AppColors.primary),
      );
    }

    final amount = priceLabel.substring(0, slash).trimRight();
    final unit = priceLabel.substring(slash).trim();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          amount,
          style: AppTextStyles.labelSm.copyWith(color: AppColors.primary),
        ),
        Text(
          unit,
          style: AppTextStyles.caption.copyWith(fontSize: 10),
        ),
      ],
    );
  }
}
