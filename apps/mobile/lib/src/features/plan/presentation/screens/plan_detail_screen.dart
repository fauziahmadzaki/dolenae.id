import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_shadows.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/utils/formatters.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
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

    final result = await controller.deletePlan(plan.id);
    if (!mounted || result.isCancelled) return;
    if (result.isFailed) {
      showDnToast(
        context,
        result.message ?? 'Gagal menghapus rencana.',
        type: DnToastType.gagal,
      );
      return;
    }
    context.go('/plan');
    showDnToast(context, '${plan.title} dihapus', type: DnToastType.info);
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PlanController>();
    final plan = controller.findPlanById(widget.planId);

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

  Future<void> _addDestination(BuildContext context) async {
    final controller = context.read<PlanController>();
    final destinationsController = context.read<DestinationsController?>();
    final returned = await context.push<Set<String>>(
      '/plan/select-destination',
      extra: plan.destinationIds.toSet(),
    );
    if (!context.mounted || returned == null || destinationsController == null) {
      return;
    }
    final toAdd = destinationsController.items
        .where(
          (d) => returned.contains(d.id) && !plan.destinationIds.contains(d.id),
        )
        .toList(growable: false);
    if (toAdd.isEmpty) return;

    final result = await controller.addDestinationsToPlan(plan.id, toAdd);
    if (!context.mounted || result.isCancelled) return;
    if (result.isFailed) {
      showDnToast(
        context,
        result.message ?? 'Gagal menambahkan destinasi.',
        type: DnToastType.gagal,
      );
    } else {
      showDnToast(
        context,
        '${toAdd.length} destinasi ditambahkan',
        type: DnToastType.sukses,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final canRemoveItem = plan.destinationCount > 1;
    final header = Row(
      children: [
        Expanded(child: Text('ITINERARY', style: AppTextStyles.overline)),
        InkWell(
          onTap: () => _addDestination(context),
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 44),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    AppIcons.plus,
                    size: 16,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: AppSpacing.s1),
                  Text(
                    'Tambah destinasi',
                    style: AppTextStyles.labelSm.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );

    if (plan.days.isEmpty || plan.isDraft) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          header,
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
        header,
        const SizedBox(height: AppSpacing.s2),
        for (int index = 0; index < plan.days.length; index++)
          _DayRow(
            planId: plan.id,
            day: plan.days[index],
            isLast: index == plan.days.length - 1,
            canRemoveItem: canRemoveItem,
          ),
      ],
    );
  }
}

class _DayRow extends StatelessWidget {
  const _DayRow({
    required this.planId,
    required this.day,
    required this.isLast,
    required this.canRemoveItem,
  });

  final String planId;
  final PlanDay day;
  final bool isLast;
  final bool canRemoveItem;

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
                      _ItemCard(
                        planId: planId,
                        item: item,
                        canRemove: canRemoveItem && item.destinationId != null,
                      ),
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
  const _ItemCard({
    required this.planId,
    required this.item,
    required this.canRemove,
  });

  final String planId;
  final PlanItem item;
  final bool canRemove;

  @override
  Widget build(BuildContext context) {
    final destId = item.destinationId;
    final tappable = destId != null && destId.isNotEmpty;

    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: InkWell(
        onTap: tappable ? () => context.push('/destination/$destId') : null,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Container(
          width: double.infinity,
          constraints: BoxConstraints(minHeight: tappable ? 48 : 0),
          padding: const EdgeInsets.all(AppSpacing.s3),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
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
                  if (canRemove)
                    IconButton(
                      onPressed: () async {
                        final res = await context
                            .read<PlanController>()
                            .removeDestinationFromPlan(planId, destId!);
                        if (!context.mounted || res.isCancelled) return;
                        if (res.isFailed) {
                          showDnToast(
                            context,
                            res.message ?? 'Gagal menghapus destinasi.',
                            type: DnToastType.gagal,
                          );
                        }
                      },
                      icon: const Icon(
                        AppIcons.close,
                        size: 16,
                        color: AppColors.body,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 44,
                        minHeight: 44,
                      ),
                      tooltip: 'Hapus dari itinerary',
                    )
                  else if (tappable) ...[
                    const SizedBox(width: AppSpacing.s1),
                    const Icon(
                      AppIcons.chevronRight,
                      size: 16,
                      color: AppColors.body,
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
        ),
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
                    color: AppColors.primary,
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
              color: AppColors.danger,
            ),
          ],
          if (plan.sources.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.s3),
            const Divider(height: 1, color: AppColors.hairline),
            const SizedBox(height: AppSpacing.s3),
            Text(
              'SUMBER DATA',
              style: AppTextStyles.overline.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: AppSpacing.s2),
            Wrap(
              spacing: AppSpacing.s2,
              runSpacing: AppSpacing.s2,
              children: [
                for (final source in plan.sources)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.s2,
                      vertical: AppSpacing.s1,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                      border: Border.all(color: AppColors.hairline),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          switch (source.type) {
                            'route' => AppIcons.route,
                            'support' => AppIcons.bedDouble,
                            _ => AppIcons.mapPin,
                          },
                          size: 12,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: AppSpacing.s1),
                        Flexible(
                          child: Text(
                            '${source.typeLabel}: ${source.label}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.ink,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _engineLabel(String engine) => switch (engine) {
    'gemini' => 'Gemini',
    'deterministic' => 'Data Dolenae',
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
    final estPerPerson = plan.estimatedChecklistCostPerPerson;
    final estTotal = plan.estimatedChecklistCostTotal;
    final targetPerPerson = plan.budgetPerPerson;
    final overBudget = targetPerPerson > 0 && estPerPerson > targetPerPerson;
    final diff = (estPerPerson - targetPerPerson).abs();
    final statusColor = overBudget ? AppColors.danger : AppColors.success;

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
          _BudgetRow(
            label: 'Target budget total',
            value: formatRupiah(plan.totalBudget),
          ),
          const SizedBox(height: AppSpacing.s1),
          _BudgetRow(
            label: 'Target per orang (${plan.peopleCount})',
            value: formatRupiah(targetPerPerson),
          ),
          if (estPerPerson > 0) ...[
            const SizedBox(height: AppSpacing.s3),
            const Divider(height: 1, color: AppColors.hairline),
            const SizedBox(height: AppSpacing.s3),
            _BudgetRow(
              label: 'Estimasi AI / orang',
              value: formatRupiah(estPerPerson),
            ),
            const SizedBox(height: AppSpacing.s1),
            _BudgetRow(
              label: 'Estimasi AI total',
              value: formatRupiah(estTotal),
            ),
            if (targetPerPerson > 0) ...[
              const SizedBox(height: AppSpacing.s3),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.s3,
                  vertical: AppSpacing.s2,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Icon(
                      overBudget ? AppIcons.alertTriangle : AppIcons.check,
                      size: 16,
                      color: statusColor,
                    ),
                    const SizedBox(width: AppSpacing.s2),
                    Expanded(
                      child: Text(
                        overBudget
                            ? 'Melebihi target ${formatRupiah(diff)} / orang'
                            : diff == 0
                            ? 'Sesuai target budget'
                            : 'Dalam batas budget · sisa ${formatRupiah(diff)} / orang',
                        style: AppTextStyles.caption.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
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
