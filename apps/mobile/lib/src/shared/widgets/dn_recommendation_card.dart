import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../../data/models/ai_recommendation.dart';
import '../../data/models/destination.dart';
import '../icons/app_icons.dart';
import 'dn_difficulty_badge.dart';

/// Varian kartu rekomendasi (component `RecommendationCard (Alam)`).
enum DnRecommendationVariant { ringkas, lengkap }

/// Kartu hasil rekomendasi AI.
///
/// Varian [DnRecommendationVariant.lengkap] menambah blok "Mengapa cocok?"
/// beserta alasannya dan dua aksi, sesuai `RecommendationCard (Alam)` di design.
class DnRecommendationCard extends StatelessWidget {
  const DnRecommendationCard({
    super.key,
    required this.recommendation,
    this.variant = DnRecommendationVariant.lengkap,
    this.onViewDetail,
    this.onAdd,
    this.addLabel = 'Tambah',
  });

  final AiRecommendation recommendation;
  final DnRecommendationVariant variant;
  final VoidCallback? onViewDetail;
  final VoidCallback? onAdd;
  final String addLabel;

  Destination get _destination => recommendation.destination;

  @override
  Widget build(BuildContext context) {
    final lengkap = variant == DnRecommendationVariant.lengkap;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 28,
                height: 28,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Text(
                  '${recommendation.rank}',
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.onPrimary,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _destination.name,
                      style: AppTextStyles.titleSm,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${_destination.elevationM} mdpl · ${_destination.regency}',
                      style: AppTextStyles.caption,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              _ScorePill(score: recommendation.score),
            ],
          ),
          if (lengkap) ...[
            const SizedBox(height: AppSpacing.s3),
            Row(
              children: [
                DnDifficultyBadge(level: _destination.difficulty),
                const SizedBox(width: AppSpacing.s2),
                Expanded(
                  child: Text(
                    _destination.tagline,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.bodySm,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.s3),
            Text('MENGAPA COCOK?', style: AppTextStyles.overline),
            const SizedBox(height: AppSpacing.s2),
            ...recommendation.reasons.map(
              (reason) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.s1),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 6, right: AppSpacing.s2),
                      child: Icon(
                        AppIcons.check,
                        size: 12,
                        color: AppColors.success,
                      ),
                    ),
                    Expanded(
                      child: Text(reason, style: AppTextStyles.caption),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.s3),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onViewDetail,
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size.fromHeight(44),
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.borderStrong),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                    ),
                    child: Text('Lihat detail', style: AppTextStyles.labelSm),
                  ),
                ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: FilledButton(
                    onPressed: onAdd,
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(44),
                      backgroundColor: AppColors.accent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                    ),
                    child: Text(
                      addLabel,
                      style: AppTextStyles.labelSm.copyWith(
                        color: AppColors.onAccent,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _ScorePill extends StatelessWidget {
  const _ScorePill({required this.score});

  final int score;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s2, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.accent.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Text(
        'Skor $score',
        style: AppTextStyles.overline.copyWith(color: AppColors.accent),
      ),
    );
  }
}
