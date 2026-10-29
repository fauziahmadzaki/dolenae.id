import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';

/// Animated placeholder that mirrors the AI result layout while it loads.
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
          const SizedBox(height: AppSpacing.s4),
          _Shimmer(
            animation: _controller,
            enabled: !reduceMotion,
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SkeletonBox(width: 18, height: 18, radius: 9),
                    SizedBox(width: AppSpacing.s2),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _SkeletonBox(height: 12),
                          SizedBox(height: AppSpacing.s2),
                          _SkeletonBox(width: 220, height: 12),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: AppSpacing.s4),
                _SkeletonBox(width: 210, height: 20),
                SizedBox(height: AppSpacing.s2),
                _SkeletonBox(height: 12),
                SizedBox(height: AppSpacing.s3),
                _SkeletonDayCard(),
                _SkeletonDayCard(),
                SizedBox(height: AppSpacing.s4),
                _SkeletonBox(width: 150, height: 18),
                SizedBox(height: AppSpacing.s2),
                _SkeletonBriefingBlock(),
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
    final chips = [
      ...preference.regions,
      ...preference.activities,
      if (preference.durationDays != null) '${preference.durationDays} hari',
    ];

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
          if (chips.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.s3),
            Wrap(
              spacing: AppSpacing.s2,
              runSpacing: AppSpacing.s2,
              children: chips
                  .map(
                    (chip) => Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.s2,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.canvas,
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                      ),
                      child: Text(chip, style: AppTextStyles.overline),
                    ),
                  )
                  .toList(),
            ),
          ],
          const SizedBox(height: AppSpacing.s3),
          Text('Menyusun itinerary…', style: AppTextStyles.caption),
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

class _SkeletonDayCard extends StatelessWidget {
  const _SkeletonDayCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.s3),
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _SkeletonBox(width: 52, height: 18, radius: 9),
              SizedBox(width: AppSpacing.s2),
              Expanded(child: _SkeletonBox(height: 12)),
            ],
          ),
          SizedBox(height: AppSpacing.s3),
          _SkeletonBox(height: 12),
          SizedBox(height: AppSpacing.s2),
          _SkeletonBox(width: 200, height: 12),
        ],
      ),
    );
  }
}

class _SkeletonBriefingBlock extends StatelessWidget {
  const _SkeletonBriefingBlock();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SkeletonBox(width: 140, height: 12),
          SizedBox(height: AppSpacing.s2),
          _SkeletonLine(),
          _SkeletonLine(),
          _SkeletonLine(widthFactor: 0.7),
        ],
      ),
    );
  }
}

class _SkeletonLine extends StatelessWidget {
  const _SkeletonLine({this.widthFactor = 1});

  final double widthFactor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Row(
        children: [
          const _SkeletonBox(width: 5, height: 5, radius: 3),
          const SizedBox(width: AppSpacing.s2),
          Expanded(
            child: FractionallySizedBox(
              widthFactor: widthFactor,
              alignment: Alignment.centerLeft,
              child: const _SkeletonBox(height: 10),
            ),
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
