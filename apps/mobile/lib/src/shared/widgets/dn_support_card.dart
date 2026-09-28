import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_shadows.dart';
import '../../app/theme/app_spacing.dart';
import '../../data/models/travel_support.dart';
import 'dn_icon_circle.dart';

/// Kartu fasilitas pendukung (rail horizontal di Beranda).
class DnSupportCard extends StatelessWidget {
  const DnSupportCard({super.key, required this.support, this.width = 200});

  final TravelSupport support;
  final double width;

  IconData get _icon => switch (support.category) {
    SupportCategory.penginapan => AppIcons.bedDouble,
    SupportCategory.transportasi => AppIcons.car,
    SupportCategory.makanan => AppIcons.utensils,
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(AppSpacing.s4),
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
                const Icon(
                  AppIcons.badgeCheck,
                  size: 16,
                  color: AppColors.success,
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
            '${support.categoryLabel} · ${support.locationLabel}',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12, color: AppColors.body),
          ),
          const SizedBox(height: 6),
          Text(
            support.priceLabel,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}
