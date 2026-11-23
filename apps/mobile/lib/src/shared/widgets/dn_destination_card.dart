import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_shadows.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_difficulty_badge.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_remote_image.dart';

/// Kartu destinasi vertikal (grid/beranda).
class DnDestinationCard extends StatelessWidget {
  const DnDestinationCard({super.key, required this.destination, this.onTap});

  final Destination destination;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(AppRadius.xl);
    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: radius,
      child: InkWell(
        onTap: onTap,
        borderRadius: radius,
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            borderRadius: radius,
            border: Border.all(color: AppColors.hairline),
            boxShadow: AppShadows.sm,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DnRemoteImage(
                url: destination.images.firstOrNull,
                semanticLabel: destination.name,
                fallbackIcon: AppIcons.mountainSnow,
                height: 180,
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.s3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            destination.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.title,
                          ),
                        ),
                        const SizedBox(width: 8),
                        DnDifficultyBadge(level: destination.difficulty),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      destination.tagline,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.bodySm,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      spacing: 6,
                      children: [
                        const Icon(
                          AppIcons.mapPin,
                          size: 14,
                          color: AppColors.body,
                        ),
                        Expanded(
                          child: Text(
                            '${destination.elevationLabel} · ${destination.regency}',
                            textAlign: TextAlign.center,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.caption,
                          ),
                        ),
                        Flexible(
                          child: Text(
                            destination.priceLabel,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.labelSm,
                          ),
                        ),
                        const Icon(AppIcons.chevronRight, size: 16),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Kartu destinasi horizontal (daftar Eksplor).
class DnDestinationListTile extends StatelessWidget {
  const DnDestinationListTile({
    super.key,
    required this.destination,
    this.onTap,
    this.compact = false,
  });

  final Destination destination;
  final VoidCallback? onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(compact ? AppRadius.lg : AppRadius.xl);
    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: radius,
      child: InkWell(
        onTap: onTap,
        borderRadius: radius,
        child: Container(
          padding: compact ? const EdgeInsets.all(AppSpacing.s2) : null,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            borderRadius: radius,
            border: Border.all(color: AppColors.hairline),
            boxShadow: AppShadows.sm,
          ),
          child: Row(
            children: [
              SizedBox(
                width: compact ? 96 : 114,
                height: compact ? 80 : 114,
                child: DnRemoteImage(
                  url: destination.images.firstOrNull,
                  semanticLabel: destination.name,
                  fallbackIcon: AppIcons.mountainSnow,
                  borderRadius: compact
                      ? BorderRadius.circular(AppRadius.md)
                      : null,
                ),
              ),
              Expanded(
                child: Padding(
                  padding: compact
                      ? const EdgeInsets.symmetric(horizontal: AppSpacing.s3)
                      : const EdgeInsets.all(AppSpacing.s3),
                  child: Column(
                    spacing: AppSpacing.s1,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        destination.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.ink,
                        ),
                      ),
                      if (!compact) ...[
                        DnDifficultyBadge(level: destination.difficulty),
                        Text(
                          destination.tagline,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.caption,
                        ),
                      ],
                      Text(
                        compact
                            ? '${destination.elevationLabel} · ${destination.regency}'
                            : '${destination.province} · ${destination.elevationLabel}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTextStyles.caption,
                      ),
                      if (compact)
                        DnDifficultyBadge(level: destination.difficulty),
                    ],
                  ),
                ),
              ),
              if (compact) const Icon(AppIcons.chevronRight, size: 18),
            ],
          ),
        ),
      ),
    );
  }
}
