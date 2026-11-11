import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_shadows.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

/// Kartu ringkas rencana pada daftar tab Rencana.
class PlanSummaryCard extends StatelessWidget {
  const PlanSummaryCard({
    super.key,
    required this.plan,
    required this.onTap,
    this.generating = false,
  });

  final TripPlan plan;
  final bool generating;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: AppColors.hairline),
        boxShadow: AppShadows.sm,
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          child: Stack(
            children: [
              Padding(
                padding: const EdgeInsets.all(AppSpacing.s4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            plan.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.titleSm,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.s2),
                        _StatusBadge(
                          status: plan.status,
                          generating: generating,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.s2),
                    Padding(
                      padding: const EdgeInsets.only(right: 48),
                      child: Wrap(
                        spacing: AppSpacing.s3,
                        runSpacing: AppSpacing.s1,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          _Meta(icon: AppIcons.calendar, label: plan.dateRange),
                          _Meta(
                            icon: AppIcons.clock,
                            label: '${plan.durationDays} hari',
                          ),
                          _Meta(
                            icon: AppIcons.mapPin,
                            label: '${plan.destinationCount} destinasi',
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Positioned(
                bottom: 4,
                right: 8,
                child: IconButton(
                  onPressed: onTap,
                  icon: const Icon(
                    AppIcons.chevronRight,
                    size: 22,
                    color: AppColors.primary,
                  ),
                  tooltip: 'Buka rencana',
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints.tightFor(
                    width: 44,
                    height: 44,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status, required this.generating});

  final PlanStatus status;
  final bool generating;

  @override
  Widget build(BuildContext context) {
    final color = generating
        ? AppColors.accent
        : switch (status) {
            PlanStatus.draft => AppColors.body,
            PlanStatus.akanDatang => AppColors.primary,
            PlanStatus.berlangsung => AppColors.success,
            PlanStatus.selesai => AppColors.body,
          };
    final label = generating
        ? 'Menyusun'
        : switch (status) {
            PlanStatus.draft => 'Draft',
            PlanStatus.akanDatang => 'Akan datang',
            PlanStatus.berlangsung => 'Berlangsung',
            PlanStatus.selesai => 'Selesai',
          };

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.s2,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Text(
        label,
        style: AppTextStyles.overline.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.body),
        const SizedBox(width: AppSpacing.s1),
        Text(label, style: AppTextStyles.caption),
      ],
    );
  }
}
