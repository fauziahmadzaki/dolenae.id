import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Varian kartu ringkasan (component `BriefingCard (Alam)`).
enum DnBriefingVariant { ringkas, lengkap }

/// Kartu ringkasan AI.
///
/// Ini satu-satunya tempat `accent` boleh muncul sebagai penanda AI,
/// sesuai aturan warna di `design-system-hifi.md` §4.
class DnBriefingCard extends StatelessWidget {
  const DnBriefingCard({
    super.key,
    required this.text,
    this.variant = DnBriefingVariant.ringkas,
    this.title = 'RINGKASAN AI',
    this.bullets = const [],
    this.actionLabel,
    this.onAction,
  });

  final String text;
  final DnBriefingVariant variant;
  final String title;
  final List<String> bullets;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final lengkap = variant == DnBriefingVariant.lengkap;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.accent.withValues(alpha: 0.28)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(AppIcons.sparkles, size: 16, color: AppColors.accent),
              const SizedBox(width: AppSpacing.s2),
              Text(
                title,
                style: AppTextStyles.overline.copyWith(color: AppColors.accent),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s2),
          Text(text, style: AppTextStyles.bodySm.copyWith(color: AppColors.ink)),
          if (lengkap && bullets.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.s3),
            ...bullets.map(
              (bullet) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.s1),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 6, right: AppSpacing.s2),
                      child: SizedBox(
                        width: 4,
                        height: 4,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            color: AppColors.accent,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: Text(bullet, style: AppTextStyles.caption),
                    ),
                  ],
                ),
              ),
            ),
          ],
          if (actionLabel != null) ...[
            const SizedBox(height: AppSpacing.s3),
            InkWell(
              onTap: onAction,
              borderRadius: BorderRadius.circular(AppRadius.pill),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.s1),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      actionLabel!,
                      style: AppTextStyles.labelSm.copyWith(color: AppColors.accent),
                    ),
                    const SizedBox(width: AppSpacing.s1),
                    const Icon(
                      AppIcons.chevronRight,
                      size: 16,
                      color: AppColors.accent,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
