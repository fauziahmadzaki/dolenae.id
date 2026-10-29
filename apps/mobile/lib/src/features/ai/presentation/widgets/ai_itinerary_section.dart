import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_itinerary.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

class AiItinerarySection extends StatelessWidget {
  const AiItinerarySection({super.key, required this.itinerary});

  final AiItinerary itinerary;

  @override
  Widget build(BuildContext context) {
    if (itinerary.days.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(itinerary.title, style: AppTextStyles.title),
        if (itinerary.summary.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.s1),
          Text(itinerary.summary, style: AppTextStyles.bodySm),
        ],
        const SizedBox(height: AppSpacing.s3),
        for (final day in itinerary.days)
          Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.s3),
            padding: const EdgeInsets.all(AppSpacing.s4),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: AppColors.hairline),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.s2,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                      ),
                      child: Text(
                        'Hari ${day.day}',
                        style: AppTextStyles.overline.copyWith(
                          color: AppColors.onPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.s2),
                    Expanded(
                      child: Text(day.title, style: AppTextStyles.bodySm),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.s2),
                for (final item in day.items) ...[
                  Padding(
                    padding: const EdgeInsets.only(top: AppSpacing.s2),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.destinationName,
                          style: AppTextStyles.bodySm.copyWith(
                            fontWeight: FontWeight.w700,
                            color: AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          [
                            if (item.startTime != null) item.startTime,
                            item.activity,
                            if (item.costEstimate != null) item.costEstimate,
                          ].join(' · '),
                          style: AppTextStyles.caption,
                        ),
                        if (item.notes != null && item.notes!.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(item.notes!, style: AppTextStyles.caption),
                          ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
      ],
    );
  }
}

class AiBriefingSection extends StatelessWidget {
  const AiBriefingSection({super.key, required this.briefing});

  final AiBriefing briefing;

  @override
  Widget build(BuildContext context) {
    if (briefing.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Briefing perjalanan', style: AppTextStyles.title),
        const SizedBox(height: AppSpacing.s2),
        if (briefing.grounded.isNotEmpty)
          _Block(
            icon: AppIcons.database,
            title: 'Dari data Dolenae',
            color: AppColors.primary,
            items: briefing.grounded,
          ),
        if (briefing.general.isNotEmpty)
          _Block(
            icon: AppIcons.info,
            title: 'Info umum — perlu verifikasi',
            color: AppColors.warning,
            items: briefing.general,
          ),
        if (briefing.warnings.isNotEmpty)
          _Block(
            icon: AppIcons.alertTriangle,
            title: 'Peringatan',
            color: AppColors.danger,
            items: briefing.warnings,
          ),
      ],
    );
  }
}

class _Block extends StatelessWidget {
  const _Block({
    required this.icon,
    required this.title,
    required this.color,
    required this.items,
  });

  final IconData icon;
  final String title;
  final Color color;
  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: AppSpacing.s2),
      padding: const EdgeInsets.all(AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 6),
              Text(title, style: AppTextStyles.overline),
            ],
          ),
          const SizedBox(height: AppSpacing.s2),
          for (final item in items)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('• '),
                  Expanded(child: Text(item, style: AppTextStyles.caption)),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class AiSourcesSection extends StatelessWidget {
  const AiSourcesSection({super.key, required this.sources});

  final List<AiSource> sources;

  @override
  Widget build(BuildContext context) {
    if (sources.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Sumber data', style: AppTextStyles.overline),
        const SizedBox(height: AppSpacing.s2),
        Wrap(
          spacing: AppSpacing.s2,
          runSpacing: AppSpacing.s2,
          children: sources
              .map(
                (source) => Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.s2,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.canvasSubtle,
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    border: Border.all(color: AppColors.hairline),
                  ),
                  child: Text(
                    '${source.typeLabel}: ${source.label}',
                    style: AppTextStyles.overline,
                  ),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: AppSpacing.s3),
      ],
    );
  }
}
