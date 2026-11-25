import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_shadows.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';

/// Kartu ajakan AI (pine) dengan aksen `accent` — satu-satunya aksen di layar.
class DnAiCard extends StatelessWidget {
  const DnAiCard({
    super.key,
    required this.title,
    required this.body,
    this.eyebrow = 'PERSIAPAN AI',
    this.onPressed,
  });

  final String title;
  final String body;
  final String eyebrow;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(AppRadius.xl);
    return DecoratedBox(
      decoration: BoxDecoration(borderRadius: radius, boxShadow: AppShadows.md),
      child: Material(
        color: AppColors.primary,
        borderRadius: radius,
        child: InkWell(
          onTap: onPressed,
          borderRadius: radius,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.s4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(
                        color: AppColors.accent,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        AppIcons.sparkles,
                        size: 20,
                        color: AppColors.onAccent,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            eyebrow,
                            style: AppTextStyles.overline.copyWith(
                              color: AppColors.canvasSubtle,
                            ),
                          ),
                          Text(
                            title,
                            style: AppTextStyles.title.copyWith(
                              color: AppColors.onPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  body,
                  style: AppTextStyles.bodySm.copyWith(color: AppColors.canvas),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
