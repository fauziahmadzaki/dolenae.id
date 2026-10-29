import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';

/// Animated placeholder that mirrors the AI result card layout while loading.
class AiResultsSkeleton extends StatefulWidget {
  const AiResultsSkeleton({super.key, this.preference = const AiPreference()});

  final AiPreference preference;

  @override
  State<AiResultsSkeleton> createState() => _AiResultsSkeletonState();
}

class _AiResultsSkeletonState extends State<AiResultsSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1300),
    )..repeat();
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
      child: ListView(
        key: const ValueKey('ai-results-skeleton'),
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.s5,
          AppSpacing.s4,
          AppSpacing.s5,
          AppSpacing.s5,
        ),
        children: [
          _PromptCard(preference: widget.preference),
          const SizedBox(height: AppSpacing.s3),
          _Shimmer(
            animation: _controller,
            enabled: !reduceMotion,
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _SkeletonBox(width: 72, height: 24, radius: 12),
                    SizedBox(width: AppSpacing.s2),
                    _SkeletonBox(width: 64, height: 24, radius: 12),
                    SizedBox(width: AppSpacing.s2),
                    _SkeletonBox(width: 58, height: 24, radius: 12),
                  ],
                ),
                SizedBox(height: AppSpacing.s2),
                _SkeletonBox(width: 120, height: 10),
                SizedBox(height: AppSpacing.s4),
                _SkeletonSummaryCard(),
                SizedBox(height: AppSpacing.s4),
                _SkeletonRecommendationCard(),
                _SkeletonRecommendationCard(),
                _SkeletonRecommendationCard(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PromptCard extends StatelessWidget {
  const _PromptCard({required this.preference});

  final AiPreference preference;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('PROMPTMU', style: AppTextStyles.overline),
          const SizedBox(height: AppSpacing.s2),
          Text(
            preference.rawText.isEmpty
                ? 'Preferensi tersimpan'
                : preference.rawText,
            style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
          ),
        ],
      ),
    );
  }
}

class _Shimmer extends StatelessWidget {
  const _Shimmer({
    required this.animation,
    required this.enabled,
    required this.child,
  });

  final Animation<double> animation;
  final bool enabled;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (!enabled) return child;

    return AnimatedBuilder(
      animation: animation,
      builder: (context, _) {
        final value = animation.value;
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) => LinearGradient(
            begin: Alignment(-1.5 + 3 * value, 0),
            end: Alignment(0.5 + 3 * value, 0),
            colors: const [
              AppColors.hairline,
              AppColors.canvasSubtle,
              AppColors.hairline,
            ],
            stops: const [0.3, 0.5, 0.7],
          ).createShader(bounds),
          child: child,
        );
      },
    );
  }
}

class _SkeletonSummaryCard extends StatelessWidget {
  const _SkeletonSummaryCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SkeletonBox(width: 120, height: 12),
          SizedBox(height: AppSpacing.s2),
          _SkeletonBox(height: 10),
          SizedBox(height: 5),
          _SkeletonBox(width: 240, height: 10),
        ],
      ),
    );
  }
}

class _SkeletonRecommendationCard extends StatelessWidget {
  const _SkeletonRecommendationCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.s3),
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: AppColors.hairline),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SkeletonBox(width: 28, height: 28, radius: AppRadius.sm),
              SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SkeletonBox(width: 150, height: 13),
                    SizedBox(height: 5),
                    _SkeletonBox(width: 110, height: 9),
                  ],
                ),
              ),
              SizedBox(width: AppSpacing.s2),
              _SkeletonBox(width: 54, height: 20, radius: 10),
            ],
          ),
          SizedBox(height: AppSpacing.s3),
          _SkeletonBox(width: 200, height: 10),
          SizedBox(height: AppSpacing.s3),
          _SkeletonBox(width: 90, height: 9),
          SizedBox(height: AppSpacing.s2),
          _SkeletonBox(height: 9),
          SizedBox(height: 5),
          _SkeletonBox(width: 220, height: 9),
          SizedBox(height: AppSpacing.s3),
          Row(
            children: [
              Expanded(child: _SkeletonBox(height: 44, radius: AppRadius.md)),
              SizedBox(width: AppSpacing.s3),
              Expanded(child: _SkeletonBox(height: 44, radius: AppRadius.md)),
            ],
          ),
        ],
      ),
    );
  }
}

class _SkeletonBox extends StatelessWidget {
  const _SkeletonBox({required this.height, this.width, this.radius = 8});

  final double height;
  final double? width;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.hairline,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}
