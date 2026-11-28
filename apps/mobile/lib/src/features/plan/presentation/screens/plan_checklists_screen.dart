import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_shadows.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';

/// Daftar checklist per rencana perjalanan dari menu Profil.
class PlanChecklistsScreen extends StatefulWidget {
  const PlanChecklistsScreen({super.key});

  @override
  State<PlanChecklistsScreen> createState() => _PlanChecklistsScreenState();
}

class _PlanChecklistsScreenState extends State<PlanChecklistsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final controller = context.read<PlanController>();
      if (!controller.hasLoaded && !controller.isLoading) {
        unawaited(controller.load());
      }
    });
  }

  void _back() {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/profile');
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PlanController>();
    final plans = controller.plans;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Checklist',
        showBack: true,
        onBack: _back,
      ),
      body: SafeArea(
        top: false,
        child: _buildBody(context, controller, plans),
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    PlanController controller,
    List<TripPlan> plans,
  ) {
    if (plans.isEmpty &&
        (controller.isLoading ||
            (!controller.hasLoaded && controller.error == null))) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (controller.error != null && plans.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: controller.load,
        child: LayoutBuilder(
          builder: (context, constraints) => SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.s5),
                child: Center(
                  child: DnEmptyState(
                    variant: DnEmptyVariant.gagal,
                    title: 'Gagal memuat checklist',
                    body: controller.error!,
                    actionLabel: 'Coba lagi',
                    onAction: controller.load,
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    if (!controller.isLoading && plans.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: controller.load,
        child: LayoutBuilder(
          builder: (context, constraints) => SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.s5),
                child: Center(
                  child: DnEmptyState(
                    variant: DnEmptyVariant.belumAdaData,
                    title: 'Belum ada rencana perjalanan',
                    body:
                        'Buat rencana perjalanan untuk mulai menyusun checklist persiapan.',
                    actionLabel: 'Buat rencana',
                    onAction: () => context.push('/plan/new'),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: controller.load,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.s4,
          AppSpacing.s4,
          AppSpacing.s4,
          AppSpacing.s6,
        ),
        itemCount: plans.length + 1,
        separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.s3),
        itemBuilder: (context, index) {
          if (index == 0) {
            return _SummaryHeader(
              readyCount: controller.readyChecklistCount,
              totalCount: plans.length,
            );
          }
          final plan = plans[index - 1];
          return _PlanChecklistTile(
            plan: plan,
            onTap: () => context.push('/plan/${plan.id}/checklist'),
          );
        },
      ),
    );
  }
}

class _SummaryHeader extends StatelessWidget {
  const _SummaryHeader({
    required this.readyCount,
    required this.totalCount,
  });

  final int readyCount;
  final int totalCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
        boxShadow: AppShadows.sm,
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              AppIcons.squareCheck,
              size: 20,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Kesiapan perjalanan',
                  style: AppTextStyles.titleSm.copyWith(color: AppColors.ink),
                ),
                const SizedBox(height: 2),
                Text(
                  '$readyCount dari $totalCount rencana siap',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.bodySm.copyWith(color: AppColors.body),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PlanChecklistTile extends StatelessWidget {
  const _PlanChecklistTile({
    required this.plan,
    required this.onTap,
  });

  final TripPlan plan;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final destinations = plan.destinationNames;
    final destinationText = destinations.isNotEmpty
        ? destinations.join(' · ')
        : (plan.destinationCount > 0 ? '${plan.destinationCount} destinasi' : '');

    return Semantics(
      button: true,
      label:
          'Buka checklist ${plan.title}, status ${plan.checklistReady ? "Siap" : "Belum siap"}',
      child: Material(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.xl),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.s4),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.xl),
              border: Border.all(
                color: plan.checklistReady
                    ? AppColors.success.withValues(alpha: 0.45)
                    : AppColors.hairline,
              ),
              boxShadow: AppShadows.sm,
            ),
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
                        style: AppTextStyles.titleSm.copyWith(
                          color: AppColors.ink,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.s2),
                    _ReadyBadge(ready: plan.checklistReady),
                  ],
                ),
                if (destinationText.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.s1),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(top: 2),
                        child: Icon(
                          AppIcons.mapPin,
                          size: 14,
                          color: AppColors.body,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s1),
                      Expanded(
                        child: Text(
                          destinationText,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.bodySm.copyWith(
                            color: AppColors.body,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: AppSpacing.s2),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Wrap(
                        spacing: AppSpacing.s3,
                        runSpacing: AppSpacing.s1,
                        children: [
                          _Meta(icon: AppIcons.calendar, label: plan.dateRange),
                          _Meta(
                            icon: AppIcons.squareCheck,
                            label: plan.checklistCount == 0
                                ? 'Belum ada item'
                                : '${plan.completedChecklistCount}/${plan.checklistCount} item',
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpacing.s2),
                    const Icon(
                      AppIcons.chevronRight,
                      size: 20,
                      color: AppColors.primary,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ReadyBadge extends StatelessWidget {
  const _ReadyBadge({required this.ready});

  final bool ready;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.s2,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: ready ? AppColors.success : AppColors.canvas,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: ready ? null : Border.all(color: AppColors.hairline),
      ),
      child: Text(
        ready ? 'Siap' : 'Belum siap',
        style: AppTextStyles.overline.copyWith(
          color: ready ? AppColors.onPrimary : AppColors.body,
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
        Icon(icon, size: 13, color: AppColors.body),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.caption.copyWith(color: AppColors.body),
          ),
        ),
      ],
    );
  }
}
