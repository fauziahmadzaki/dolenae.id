import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/widgets/plan_summary_card.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_bottom_nav.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';

/// Halaman root tab "Rencana": daftar rencana yang bisa dibuka per kartu.
class TripPlanScreen extends StatefulWidget {
  const TripPlanScreen({super.key});

  @override
  State<TripPlanScreen> createState() => _TripPlanScreenState();
}

class _TripPlanScreenState extends State<TripPlanScreen> {
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

  Future<void> _createPlan() async {
    await context.push('/plan/new');
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PlanController>();

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Rencana',
        trailing: IconButton(
          onPressed: _createPlan,
          icon: const Icon(AppIcons.plus, color: AppColors.onPrimary, size: 22),
          tooltip: 'Buat rencana baru',
        ),
      ),
      body: Column(
        children: [
          Expanded(child: _buildBody(controller)),
          DnBottomNav(
            active: DnTab.rencana,
            onTap: (tab) => _onTab(context, tab),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(PlanController controller) {
    if (controller.isLoading && controller.plans.isEmpty) {
      return const _PlanListSkeleton();
    }

    if (controller.error != null && controller.plans.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(AppSpacing.s5),
        child: Center(
          child: DnEmptyState(
            variant: DnEmptyVariant.gagal,
            body: controller.error!,
            actionLabel: 'Coba lagi',
            onAction: controller.load,
          ),
        ),
      );
    }

    if (controller.plans.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(AppSpacing.s5),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const DnEmptyState(
                variant: DnEmptyVariant.belumAdaData,
                title: 'Belum ada rencana',
                body:
                    'Susun rencana perjalanan pertamamu, lalu lihat '
                    'itinerary dan estimasi biayanya di sini.',
              ),
              const SizedBox(height: AppSpacing.s5),
              DnPrimaryButton(
                label: 'Buat rencana',
                icon: AppIcons.plus,
                onPressed: _createPlan,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s4,
        AppSpacing.s4,
        AppSpacing.s5,
      ),
      itemCount: controller.plans.length + 1,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.s3),
      itemBuilder: (context, index) {
        if (index == controller.plans.length) {
          return Padding(
            padding: const EdgeInsets.only(top: AppSpacing.s2),
            child: DnOutlineButton(
              label: 'Buat rencana baru',
              icon: AppIcons.plus,
              onPressed: _createPlan,
            ),
          );
        }

        final plan = controller.plans[index];
        return PlanSummaryCard(
          plan: plan,
          generating: controller.isGenerating(plan.id),
          onTap: () => context.push('/plan/${plan.id}'),
        );
      },
    );
  }
}

class _PlanListSkeleton extends StatefulWidget {
  const _PlanListSkeleton();

  @override
  State<_PlanListSkeleton> createState() => _PlanListSkeletonState();
}

class _PlanListSkeletonState extends State<_PlanListSkeleton>
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
      label: 'Memuat daftar rencana',
      container: true,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final opacity = reduceMotion
              ? 0.55
              : 0.45 + (_controller.value * 0.3);
          return Opacity(opacity: opacity, child: child);
        },
        child: ListView.separated(
          padding: const EdgeInsets.all(AppSpacing.s4),
          itemCount: 3,
          separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.s3),
          itemBuilder: (_, _) => Container(
            height: 132,
            decoration: BoxDecoration(
              color: AppColors.hairline.withValues(alpha: 0.55),
              borderRadius: BorderRadius.circular(AppRadius.xl),
            ),
          ),
        ),
      ),
    );
  }
}
