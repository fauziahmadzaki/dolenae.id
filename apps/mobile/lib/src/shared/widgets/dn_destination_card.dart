import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_shadows.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
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
                height: 170,
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.s4),
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
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: AppColors.ink,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        DnDifficultyBadge(level: destination.difficulty),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      destination.tagline,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.body,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Text(
                          destination.priceLabel,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${destination.elevationLabel} · ${destination.regency}',
                            textAlign: TextAlign.right,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.body,
                            ),
                          ),
                        ),
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
  });

  final Destination destination;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(AppRadius.lg);
    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: radius,
      child: InkWell(
        onTap: onTap,
        borderRadius: radius,
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.s2),
          decoration: BoxDecoration(
            borderRadius: radius,
            border: Border.all(color: AppColors.hairline),
          ),
          child: Row(
            children: [
              SizedBox(
                width: 98,
                height: 80,
                child: DnRemoteImage(
                  url: destination.images.firstOrNull,
                  semanticLabel: destination.name,
                  fallbackIcon: AppIcons.mountainSnow,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Column(
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
                    const SizedBox(height: 2),
                    Text(
                      '${destination.elevationLabel} · ${destination.regency}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.body,
                      ),
                    ),
                    const SizedBox(height: 6),
                    DnDifficultyBadge(level: destination.difficulty),
                  ],
                ),
              ),
              const Icon(
                AppIcons.chevronRight,
                size: 18,
                color: AppColors.body,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
