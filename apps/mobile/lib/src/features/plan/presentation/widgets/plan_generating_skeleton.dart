import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

/// Skeleton ringan untuk isi kartu rencana saat AI menyusun itinerary.
class PlanGeneratingSkeleton extends StatefulWidget {
  const PlanGeneratingSkeleton({super.key});

  @override
  State<PlanGeneratingSkeleton> createState() => _PlanGeneratingSkeletonState();
}

class _PlanGeneratingSkeletonState extends State<PlanGeneratingSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion =
        MediaQuery.maybeOf(context)?.disableAnimations ?? false;

    return Semantics(
      label: 'Menyusun itinerary',
      container: true,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final opacity = reduceMotion
              ? 0.55
              : 0.45 + (_controller.value * 0.3);
          return Opacity(opacity: opacity, child: child);
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  AppIcons.sparkles,
                  size: 16,
                  color: AppColors.accent,
                ),
                const SizedBox(width: AppSpacing.s2),
                Text(
                  'Menyusun itinerary…',
                  style: AppTextStyles.overline.copyWith(
                    color: AppColors.accent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.s3),
            for (var day = 1; day <= 2; day++) ...[
              _Line(width: 92, height: 12),
              const SizedBox(height: AppSpacing.s2),
              _Block(height: 58),
              const SizedBox(height: AppSpacing.s3),
            ],
            const SizedBox(height: AppSpacing.s1),
            _Block(height: 84),
            const SizedBox(height: AppSpacing.s3),
            _Block(height: 56),
          ],
        ),
      ),
    );
  }
}

class _Line extends StatelessWidget {
  const _Line({required this.width, required this.height});

  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.hairline,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
    );
  }
}

class _Block extends StatelessWidget {
  const _Block({required this.height});

  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.hairline.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
    );
  }
}
