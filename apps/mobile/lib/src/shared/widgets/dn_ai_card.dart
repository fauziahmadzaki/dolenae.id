import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_text_styles.dart';

/// Kartu ajakan AI (pine) dengan aksen `accent` — satu-satunya aksen di layar.
class DnAiCard extends StatelessWidget {
  const DnAiCard({
    super.key,
    required this.title,
    required this.body,
    this.eyebrow = 'PERSIAPAN AI',
    this.ctaLabel = 'Mulai',
    this.onPressed,
  });

  final String title;
  final String body;
  final String eyebrow;
  final String ctaLabel;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
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
                    Text(
                      eyebrow,
                      style: AppTextStyles.overline.copyWith(
                        color: AppColors.canvasSubtle,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  title,
                  style: AppTextStyles.title.copyWith(
                    color: AppColors.onPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  body,
                  style: AppTextStyles.bodySm.copyWith(color: AppColors.canvas),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
