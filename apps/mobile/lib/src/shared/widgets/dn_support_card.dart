import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_shadows.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_icon_circle.dart';

/// Kartu fasilitas pendukung (rail horizontal di Beranda).
class DnSupportCard extends StatelessWidget {
  const DnSupportCard({
    super.key,
    required this.support,
    this.width = 200,
    this.onTap,
  });

  final Facility support;
  final double width;
  final VoidCallback? onTap;

  IconData get _icon => switch (support.category) {
    FacilityCategory.penginapan => AppIcons.bedDouble,
    FacilityCategory.transportasi => AppIcons.car,
    FacilityCategory.makanan => AppIcons.utensils,
  };

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Container(
          width: width,
          padding: const EdgeInsets.all(AppSpacing.s3),
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
            boxShadow: AppShadows.sm,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  DnIconCircle(icon: _icon, size: 36, iconSize: 18),
                  if (support.verified)
                    const Flexible(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        spacing: AppSpacing.s1,
                        children: [
                          Icon(
                            AppIcons.badgeCheck,
                            size: 13,
                            color: AppColors.success,
                          ),
                          Flexible(
                            child: Text(
                              'Terverifikasi',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(fontSize: 11),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                support.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                [
                  support.categoryLabel,
                  if (support.type.isNotEmpty)
                    support.type
                  else
                    support.destinationName,
                ].where((e) => e.isNotEmpty).join(' · '),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12, color: AppColors.body),
              ),
              const SizedBox(height: 6),
              Text(
                support.priceLabel,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
