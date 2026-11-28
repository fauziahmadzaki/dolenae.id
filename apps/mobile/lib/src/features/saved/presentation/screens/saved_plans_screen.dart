import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_dialog.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_plan_card.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Layar Daftar Rencana (Node Figma: 86:1962 dan 86:1986).
///
/// Membaca [PlanController] secara dinamis ketika [items] null agar rencana
/// per akun selalu sinkron dengan backend.
class SavedPlansScreen extends StatefulWidget {
  const SavedPlansScreen({
    super.key,
    this.items,
    this.onCreatePlan,
    this.onOpenPlan,
    this.onRemove,
    this.onBack,
  });

  /// Daftar rencana; bila null dibaca dinamis dari [PlanController].
  final List<SavedTripPlan>? items;
  final VoidCallback? onCreatePlan;
  final ValueChanged<String>? onOpenPlan;
  final ValueChanged<String>? onRemove;
  final VoidCallback? onBack;

  @override
  State<SavedPlansScreen> createState() => _SavedPlansScreenState();
}

class _SavedPlansScreenState extends State<SavedPlansScreen> {
  @override
  void initState() {
    super.initState();
    if (widget.items == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        final controller = context.read<PlanController?>();
        if (controller != null &&
            !controller.hasLoaded &&
            !controller.isLoading) {
          controller.load();
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final planController = widget.items == null
        ? context.watch<PlanController?>()
        : null;
    final store = context.watch<SavedController?>();

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Daftar rencana',
        showBack: true,
        plainBack: true,
        onBack: widget.onBack ?? () => context.pop(),
        trailing: DnIconPlus(
          onTap: widget.onCreatePlan ?? () => context.push('/plan/new'),
        ),
      ),
      body: SafeArea(
        top: false,
        child: widget.items != null
            ? _buildStaticBody(context, widget.items!, store)
            : _buildDynamicBody(context, planController),
      ),
    );
  }

  Widget _buildDynamicBody(
    BuildContext context,
    PlanController? controller,
  ) {
    if (controller == null) {
      return _buildEmptyState(context);
    }

    if (controller.isLoading && controller.plans.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (controller.error != null && controller.plans.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        backgroundColor: AppColors.surface,
        onRefresh: controller.load,
        child: LayoutBuilder(
          builder: (context, constraints) => SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(AppSpacing.s5),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: constraints.maxHeight - AppSpacing.s5 * 2,
              ),
              child: Center(
                child: DnEmptyState(
                  variant: DnEmptyVariant.gagal,
                  body: controller.error!,
                  actionLabel: 'Coba lagi',
                  onAction: controller.load,
                ),
              ),
            ),
          ),
        ),
      );
    }

    if (controller.plans.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        backgroundColor: AppColors.surface,
        onRefresh: controller.load,
        child: LayoutBuilder(
          builder: (context, constraints) => SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(AppSpacing.s5),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: constraints.maxHeight - AppSpacing.s5 * 2,
              ),
              child: Center(child: _emptyColumn(context)),
            ),
          ),
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      backgroundColor: AppColors.surface,
      onRefresh: controller.load,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.s5,
          AppSpacing.s4,
          AppSpacing.s5,
          AppSpacing.s5,
        ),
        itemCount: controller.plans.length,
        separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.s3),
        itemBuilder: (context, index) {
          final plan = controller.plans[index];
          final statusColor = switch (plan.status) {
            PlanStatus.akanDatang => AppColors.primary,
            PlanStatus.berlangsung => AppColors.success,
            PlanStatus.draft || PlanStatus.selesai => AppColors.body,
          };

          return DnPlanCard(
            name: plan.title,
            dateRange: plan.dateRange,
            destinationName: '${plan.destinationCount} destinasi dipilih',
            meta: '${plan.durationDays} hari · ${plan.peopleCount} orang',
            statusLabel: plan.statusLabel,
            statusColor: statusColor,
            completed: plan.completedChecklistCount,
            total: plan.checklistCount,
            onTap: widget.onOpenPlan == null
                ? () => context.push('/plan/${plan.id}')
                : () => widget.onOpenPlan!(plan.id),
            onEdit: () => context.push('/plan/${plan.id}/edit'),
            onMore: () async {
              final confirmed = await showDnDialog(
                context,
                title: 'Hapus rencana ini?',
                message:
                    '${plan.title} beserta itinerary dan checklist akan dihapus.',
                type: DnDialogType.destruktif,
                confirmLabel: 'Hapus',
                icon: AppIcons.delete,
              );
              if (confirmed != true || !context.mounted) return;
              if (widget.onRemove != null) {
                widget.onRemove!(plan.id);
                return;
              }
              final result = await controller.deletePlan(plan.id);
              if (!context.mounted || result.isCancelled) return;
              if (result.isFailed) {
                showDnToast(
                  context,
                  result.message ?? 'Gagal menghapus rencana.',
                  type: DnToastType.gagal,
                );
                return;
              }
              showDnToast(
                context,
                '${plan.title} dihapus',
                type: DnToastType.info,
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildStaticBody(
    BuildContext context,
    List<SavedTripPlan> saved,
    SavedController? store,
  ) {
    if (saved.isEmpty) {
      return _buildEmptyState(context);
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s5,
        AppSpacing.s4,
        AppSpacing.s5,
        AppSpacing.s5,
      ),
      itemCount: saved.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.s3),
      itemBuilder: (context, index) {
        final plan = saved[index];
        final archived = plan.status == SavedPlanStatus.arsip;

        return DnPlanCard(
          name: plan.name,
          dateRange: plan.dateRange,
          destinationName: '${plan.destinationTotal} destinasi dipilih',
          statusLabel: plan.statusLabel,
          statusColor: archived ? AppColors.body : AppColors.success,
          completed: plan.destinationCount,
          total: plan.destinationTotal,
          onTap: widget.onOpenPlan == null
              ? () => context.go('/plan')
              : () => widget.onOpenPlan!(plan.id),
          onMore: () async {
            final confirmed = await showDnDialog(
              context,
              title: 'Hapus rencana ini?',
              message:
                  '${plan.name} beserta daftar destinasinya akan '
                  'dihapus dari daftar tersimpan.',
              type: DnDialogType.destruktif,
              confirmLabel: 'Hapus',
              icon: AppIcons.delete,
            );
            if (confirmed != true || !context.mounted) return;
            if (widget.onRemove != null) {
              widget.onRemove!(plan.id);
              return;
            }
            store?.removeSavedPlan(plan.id);
            showDnToast(
              context,
              '${plan.name} dihapus',
              type: DnToastType.info,
            );
          },
        );
      },
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.s5),
      child: Center(child: _emptyColumn(context)),
    );
  }

  Widget _emptyColumn(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const DnEmptyState(
          variant: DnEmptyVariant.belumAdaData,
          title: 'Belum ada rencana',
          body: 'Susun rencana perjalanan supaya mudah dibawa ke lapangan.',
        ),
        const SizedBox(height: AppSpacing.s5),
        DnPrimaryButton(
          label: 'Buat rencana',
          onPressed: widget.onCreatePlan ?? () => context.push('/plan/new'),
        ),
      ],
    );
  }
}

/// Tombol plus kecil untuk AppBar.
class DnIconPlus extends StatelessWidget {
  const DnIconPlus({super.key, required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onTap,
      icon: const Icon(AppIcons.plus, size: 20, color: AppColors.onPrimary),
      tooltip: 'Buat rencana baru',
    );
  }
}
