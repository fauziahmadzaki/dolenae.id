import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_shadows.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/utils/formatters.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/widgets/plan_generating_skeleton.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_bottom_nav.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_dialog.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Halaman detail satu rencana: ringkasan, itinerary, ringkasan AI, budget.
class PlanDetailScreen extends StatefulWidget {
  const PlanDetailScreen({super.key, required this.planId});

  final String planId;

  @override
  State<PlanDetailScreen> createState() => _PlanDetailScreenState();
}

class _PlanDetailScreenState extends State<PlanDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final controller = context.read<PlanController>();
      if (controller.plans.isEmpty && !controller.isLoading) {
        controller.load();
      }
    });
  }

  void _onTab(BuildContext context, DnTab tab) {
    switch (tab) {
      case DnTab.beranda:
        context.go('/home');
      case DnTab.jelajah:
        context.go('/explore');
      case DnTab.ai:
        context.go('/ai/preferences');
      case DnTab.rencana:
        context.go('/plan');
      case DnTab.profil:
        context.go('/profile');
    }
  }

  void _back() {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/plan');
    }
  }

  Future<void> _confirmDelete(PlanController controller, TripPlan plan) async {
    final confirmed = await showDnDialog(
      context,
      title: 'Hapus rencana ini?',
      message: '${plan.title} beserta itinerary dan checklist akan dihapus.',
      type: DnDialogType.destruktif,
      confirmLabel: 'Hapus',
      icon: AppIcons.delete,
    );
    if (confirmed != true || !mounted) return;

    await controller.deletePlan(plan.id);
    if (!mounted) return;
    context.go('/plan');
    showDnToast(context, '${plan.title} dihapus', type: DnToastType.info);
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PlanController>();
    final plan = _findPlan(controller.plans, widget.planId);

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Rencana Perjalanan',
        showBack: true,
        onBack: _back,
        trailing: plan == null
            ? null
            : IconButton(
                onPressed: () => _confirmDelete(controller, plan),
                icon: const Icon(
                  AppIcons.delete,
                  color: AppColors.onPrimary,
                  size: 22,
                ),
                tooltip: 'Hapus rencana',
              ),
      ),
      body: Column(
        children: [
          Expanded(
            child: plan == null
                ? Padding(
                    padding: const EdgeInsets.all(AppSpacing.s5),
                    child: Center(
                      child: DnEmptyState(
                        variant: DnEmptyVariant.belumAdaData,
                        title: 'Rencana tidak ditemukan',
                        body: 'Rencana ini mungkin sudah dihapus.',
                        actionLabel: 'Kembali',
                        onAction: _back,
                      ),
                    ),
                  )
                : _PlanDetailBody(
                    plan: plan,
                    generating: controller.isGenerating(plan.id),
                    onRetry: () => controller.retryAi(plan.id),
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

  TripPlan? _findPlan(List<TripPlan> plans, String id) {
    for (final plan in plans) {
      if (plan.id == id) return plan;
    }
    return null;
  }
}

class _PlanDetailBody extends StatelessWidget {
  const _PlanDetailBody({
    required this.plan,
    required this.generating,
    required this.onRetry,
  });

  final TripPlan plan;
  final bool generating;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s4,
        AppSpacing.s4,
        AppSpacing.s6,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SummaryCard(plan: plan),
          const SizedBox(height: AppSpacing.s3),
          _PreparationCard(
            plan: plan,
            onTap: () => context.push('/plan/${plan.id}/checklist'),
          ),
          const SizedBox(height: AppSpacing.s4),
          if (generating)
            const PlanGeneratingSkeleton()
          else ...[
            if (plan.aiWarning != null) ...[
              _WarningBanner(message: plan.aiWarning!, onRetry: onRetry),
              const SizedBox(height: AppSpacing.s3),
            ],
            if (plan.notice != null) ...[
              _NoticeBanner(message: plan.notice!),
              const SizedBox(height: AppSpacing.s3),
            ],
            _ItinerarySection(plan: plan),
            const SizedBox(height: AppSpacing.s5),
            _AiSummarySection(plan: plan),
            const SizedBox(height: AppSpacing.s4),
            _BudgetSection(plan: plan),
            if (!plan.isDraft) ...[
              const SizedBox(height: AppSpacing.s2),
              DnGhostButton(
                label: 'Perbarui ringkasan AI',
                icon: AppIcons.refresh,
                onPressed: onRetry,
              ),
            ],
          ],
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.plan});

  final TripPlan plan;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: AppColors.hairline),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: Text(plan.title, style: AppTextStyles.title)),
              const SizedBox(width: AppSpacing.s2),
              _StatusBadge(status: plan.status),
            ],
          ),
          const SizedBox(height: AppSpacing.s2),
          Wrap(
            spacing: AppSpacing.s3,
            runSpacing: AppSpacing.s1,
            children: [
              _Meta(icon: AppIcons.calendar, label: plan.dateRange),
              _Meta(icon: AppIcons.clock, label: '${plan.durationDays} hari'),
              _Meta(
                icon: AppIcons.mapPin,
                label: '${plan.destinationCount} destinasi',
              ),
              _Meta(icon: AppIcons.user, label: '${plan.peopleCount} orang'),
              if (plan.originProvince.trim().isNotEmpty)
                _Meta(
                  icon: AppIcons.locateFixed,
                  label: 'Dari ${plan.originProvince}',
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.s3),
          const Divider(height: 1, color: AppColors.hairline),
          const SizedBox(height: AppSpacing.s3),
          Row(
            children: [
              Expanded(
                child: Text('Estimasi budget', style: AppTextStyles.caption),
              ),
              Text(
                formatRupiah(plan.totalBudget),
                style: AppTextStyles.label.copyWith(color: AppColors.ink),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PreparationCard extends StatelessWidget {
  const _PreparationCard({required this.plan, required this.onTap});

  final TripPlan plan;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final total = plan.checklistCount;
    final done = plan.completedChecklistCount;
    final ready = total > 0 && done == total;

    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.s4),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.xl),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: (ready ? AppColors.success : AppColors.primary)
                      .withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  AppIcons.squareCheck,
                  size: 20,
                  color: ready ? AppColors.success : AppColors.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Checklist persiapan', style: AppTextStyles.titleSm),
                    const SizedBox(height: 2),
                    Text(
                      total == 0
                          ? 'Belum ada item, mulai susun persiapan'
                          : '$done/$total siap',
                      style: AppTextStyles.caption,
                    ),
                    if (total > 0) ...[
                      const SizedBox(height: AppSpacing.s2),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                        child: LinearProgressIndicator(
                          value: plan.checklistProgress,
                          minHeight: 4,
                          backgroundColor: AppColors.canvas,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            ready ? AppColors.success : AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              const Icon(
                AppIcons.chevronRight,
                size: 20,
                color: AppColors.body,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final PlanStatus status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      PlanStatus.draft => AppColors.body,
      PlanStatus.akanDatang => AppColors.primary,
      PlanStatus.berlangsung => AppColors.success,
      PlanStatus.selesai => AppColors.body,
    };
    final label = switch (status) {
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

class _ItinerarySection extends StatelessWidget {
  const _ItinerarySection({required this.plan});

  final TripPlan plan;

  @override
  Widget build(BuildContext context) {
    if (plan.days.isEmpty || plan.isDraft) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('ITINERARY', style: AppTextStyles.overline),
          const SizedBox(height: AppSpacing.s2),
          Text(
            'Belum ada destinasi. Tambahkan destinasi supaya AI bisa menyusun '
            'itinerary.',
            style: AppTextStyles.bodySm,
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('ITINERARY', style: AppTextStyles.overline),
        const SizedBox(height: AppSpacing.s3),
        for (int index = 0; index < plan.days.length; index++)
          _DayRow(day: plan.days[index], isLast: index == plan.days.length - 1),
      ],
    );
  }
}

class _DayRow extends StatelessWidget {
  const _DayRow({required this.day, required this.isLast});

  final PlanDay day;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
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
                  '${day.day}',
                  style: const TextStyle(
                    color: AppColors.onPrimary,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
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
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.s4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'HARI ${day.day}',
                    style: AppTextStyles.overline.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    day.displayTitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.titleSm,
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  if (day.isEmpty)
                    Text(
                      'Belum ada destinasi untuk hari ini.',
                      style: AppTextStyles.caption,
                    )
                  else
                    for (final item in day.items) ...[
                      _ItemCard(item: item),
                      if (item != day.items.last)
                        const SizedBox(height: AppSpacing.s2),
                    ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ItemCard extends StatelessWidget {
  const _ItemCard({required this.item});

  final PlanItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  item.destinationName,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.labelSm,
                ),
              ),
              if (item.costEstimate != null) ...[
                const SizedBox(width: AppSpacing.s2),
                Text(
                  item.costEstimate!,
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.ink,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ],
          ),
          if (item.metaLabel.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(item.metaLabel, style: AppTextStyles.caption),
          ],
          if (item.notes != null && item.notes!.trim().isNotEmpty) ...[
            const SizedBox(height: AppSpacing.s1),
            Text(item.notes!, style: AppTextStyles.caption),
          ],
        ],
      ),
    );
  }
}

class _AiSummarySection extends StatelessWidget {
  const _AiSummarySection({required this.plan});

  final TripPlan plan;

  @override
  Widget build(BuildContext context) {
    final briefing = plan.briefing;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: AppColors.accent.withValues(alpha: 0.28)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(AppIcons.sparkles, size: 16, color: AppColors.accent),
              const SizedBox(width: AppSpacing.s2),
              Expanded(
                child: Text(
                  'RINGKASAN AI',
                  style: AppTextStyles.overline.copyWith(
                    color: AppColors.accent,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(_engineLabel(plan.engine), style: AppTextStyles.caption),
            ],
          ),
          const SizedBox(height: AppSpacing.s2),
          Text(
            plan.hasAiSummary
                ? plan.summary
                : 'Ringkasan AI belum tersedia untuk rencana ini.',
            style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
          ),
          if (briefing.grounded.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.s3),
            _BulletGroup(label: 'DARI DATA DOLENAE', items: briefing.grounded),
          ],
          if (briefing.general.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.s3),
            _BulletGroup(
              label: 'INFO UMUM — PERLU VERIFIKASI',
              items: briefing.general,
            ),
          ],
          if (briefing.warnings.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.s3),
            _BulletGroup(
              label: 'PERHATIAN',
              items: briefing.warnings,
              color: AppColors.warning,
            ),
          ],
        ],
      ),
    );
  }

  String _engineLabel(String engine) => switch (engine) {
    'gemini' => 'Gemini',
    'deterministic' => 'Data Dolenae',
    'seed' => 'Contoh data',
    _ => 'Draft',
  };
}

class _BulletGroup extends StatelessWidget {
  const _BulletGroup({
    required this.label,
    required this.items,
    this.color = AppColors.body,
  });

  final String label;
  final List<String> items;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.overline.copyWith(
            color: color,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: AppSpacing.s1),
        for (final item in items)
          Padding(
            padding: const EdgeInsets.only(bottom: 2),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 6, right: AppSpacing.s2),
                  child: SizedBox(
                    width: 4,
                    height: 4,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ),
                Expanded(child: Text(item, style: AppTextStyles.caption)),
              ],
            ),
          ),
      ],
    );
  }
}

class _BudgetSection extends StatelessWidget {
  const _BudgetSection({required this.plan});

  final TripPlan plan;

  @override
  Widget build(BuildContext context) {
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
          Text('ESTIMASI BIAYA', style: AppTextStyles.overline),
          const SizedBox(height: AppSpacing.s2),
          _BudgetRow(label: 'Total', value: formatRupiah(plan.totalBudget)),
          const SizedBox(height: AppSpacing.s1),
          _BudgetRow(
            label: 'Per orang (${plan.peopleCount})',
            value: formatRupiah(plan.budgetPerPerson),
          ),
        ],
      ),
    );
  }
}

class _BudgetRow extends StatelessWidget {
  const _BudgetRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label, style: AppTextStyles.bodySm)),
        const SizedBox(width: AppSpacing.s3),
        Text(
          value,
          style: AppTextStyles.labelSm.copyWith(color: AppColors.ink),
        ),
      ],
    );
  }
}

class _WarningBanner extends StatelessWidget {
  const _WarningBanner({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            AppIcons.alertTriangle,
            size: 16,
            color: AppColors.warning,
          ),
          const SizedBox(width: AppSpacing.s2),
          Expanded(child: Text(message, style: AppTextStyles.caption)),
          TextButton(onPressed: onRetry, child: const Text('Coba lagi')),
        ],
      ),
    );
  }
}

class _NoticeBanner extends StatelessWidget {
  const _NoticeBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.25)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(AppIcons.info, size: 16, color: AppColors.primary),
          const SizedBox(width: AppSpacing.s2),
          Expanded(child: Text(message, style: AppTextStyles.caption)),
        ],
      ),
    );
  }
}
