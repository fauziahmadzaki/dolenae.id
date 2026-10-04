import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_shadows.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/trip_plan.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_bottom_nav.dart';

/// Layar Rencana Perjalanan (Node Figma: 68:1182).
///
/// Halaman root untuk tab "Rencana", menampilkan ringkasan trip aktif,
/// briefing AI terintegrasi, dan timeline harian destinasi (Steps).
class TripPlanScreen extends StatelessWidget {
  const TripPlanScreen({
    super.key,
    this.plan = SeedData.demoPlan,
    this.onEditTrip,
    this.onRefreshBriefing,
    this.onAddDestination,
    this.onStepTap,
  });

  final TripPlan plan;
  final VoidCallback? onEditTrip;
  final VoidCallback? onRefreshBriefing;
  final VoidCallback? onAddDestination;
  final ValueChanged<TripStep>? onStepTap;

  void _onTab(BuildContext context, DnTab tab) {
    switch (tab) {
      case DnTab.beranda:
        context.go('/home');
      case DnTab.jelajah:
        context.go('/explore');
      case DnTab.ai:
        context.go('/soon?tab=AI');
      case DnTab.rencana:
        context.go('/plan');
      case DnTab.profil:
        context.go('/profile');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: const DnAppBar(title: 'Rencana Perjalanan'),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: AppSpacing.s3),
                  _buildSummaryCard(context),
                  const SizedBox(height: AppSpacing.s3),
                  _buildAiBriefingCard(),
                  const SizedBox(height: AppSpacing.s4),
                  _buildStepsSection(context),
                  const SizedBox(height: AppSpacing.s6),
                ],
              ),
            ),
          ),
          DnBottomNav(
            active: DnTab.rencana,
            onTap: (tab) => _onTab(context, tab),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.s3),
        decoration: BoxDecoration(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.hairline),
          boxShadow: AppShadows.sm,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(plan.title, style: AppTextStyles.title),
                InkWell(
                  onTap: onEditTrip ?? () => context.push('/soon?tab=UbahRencana'),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Ubah',
                        style: AppTextStyles.bodySm.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(width: 2),
                      const Icon(
                        AppIcons.chevronRight,
                        size: 16,
                        color: AppColors.body,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(AppIcons.calendar, size: 14, color: AppColors.body),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '${plan.dateRange} · ${plan.destinationCount} destinasi',
                    style: AppTextStyles.caption,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: Text('Estimasi budget', style: AppTextStyles.caption),
                ),
                Text(
                  plan.estimatedBudget,
                  style: AppTextStyles.label.copyWith(color: AppColors.ink),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAiBriefingCard() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.s3),
        decoration: BoxDecoration(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.hairline),
          boxShadow: AppShadows.sm,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      AppIcons.sparkles,
                      size: 15,
                      color: AppColors.accent,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'BRIEFING AI',
                      style: AppTextStyles.overline.copyWith(
                        color: AppColors.accent,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                InkWell(
                  onTap: onRefreshBriefing,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        AppIcons.hourglass,
                        size: 13,
                        color: AppColors.body,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Perbarui',
                        style: AppTextStyles.caption.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              plan.aiBriefing,
              style: AppTextStyles.bodySm.copyWith(
                color: AppColors.ink,
                height: 1.45,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Disusun dari ${plan.destinationCount} destinasi dan preferensi tersimpan',
              style: AppTextStyles.overline.copyWith(color: AppColors.body),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepsSection(BuildContext context) {
    final steps = plan.steps;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (int i = 0; i < steps.length; i++) ...[
            _buildStepRow(context, steps[i], isLast: i == steps.length - 1),
            if (i < steps.length - 1) const SizedBox(height: AppSpacing.s3),
          ],
          const SizedBox(height: AppSpacing.s4),
          _buildAddDestinationButton(context),
        ],
      ),
    );
  }

  Widget _buildStepRow(BuildContext context, TripStep step, {required bool isLast}) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline rail
          Column(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  '${step.dayNumber}',
                  style: const TextStyle(
                    color: AppColors.onPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    color: AppColors.hairline,
                  ),
                ),
            ],
          ),
          const SizedBox(width: AppSpacing.s3),
          // Step Card
          Expanded(
            child: Material(
              color: AppColors.canvasSubtle,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              child: InkWell(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                onTap: () {
                  if (onStepTap != null) {
                    onStepTap!(step);
                  } else {
                    context.push('/plan/item');
                  }
                },
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.s3),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: Border.all(color: AppColors.hairline),
                    boxShadow: AppShadows.sm,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'HARI ${step.dayNumber}',
                            style: AppTextStyles.overline.copyWith(
                              color: AppColors.body,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          _buildDifficultyPill(
                            label: step.difficultyLabel,
                            isWarning: step.isDifficultyWarning,
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        step.destinationName,
                        style: AppTextStyles.label.copyWith(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        step.destinationMeta,
                        style: AppTextStyles.overline.copyWith(
                          color: AppColors.body,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (step.tags.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: [
                            for (final tag in step.tags)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.canvas,
                                  borderRadius: BorderRadius.circular(AppRadius.sm),
                                  border: Border.all(color: AppColors.hairline),
                                ),
                                child: Text(
                                  tag,
                                  style: AppTextStyles.overline.copyWith(
                                    fontSize: 10,
                                    color: AppColors.body,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${step.readyCount}/${step.totalCount} siap',
                              style: AppTextStyles.overline.copyWith(
                                color: AppColors.body,
                              ),
                            ),
                          ),
                          Text(
                            step.estimatedCost,
                            style: AppTextStyles.label.copyWith(
                              color: AppColors.ink,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      // Mini Progress Bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                        child: LinearProgressIndicator(
                          value: step.progress,
                          minHeight: 4,
                          backgroundColor: AppColors.hairline,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDifficultyPill({
    required String label,
    required bool isWarning,
  }) {
    final bgColor = isWarning ? AppColors.warning : AppColors.success;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: AppColors.onPrimary,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildAddDestinationButton(BuildContext context) {
    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: onAddDestination ?? () => context.push('/plan/create'),
        child: Container(
          height: 48,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(AppIcons.plus, size: 16, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Tambah destinasi',
                style: AppTextStyles.label.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
