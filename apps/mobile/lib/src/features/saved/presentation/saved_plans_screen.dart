import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/saved_state.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../data/models/saved_item.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_dialog.dart';
import '../../../shared/widgets/dn_empty_state.dart';
import '../../../shared/widgets/dn_plan_card.dart';
import '../../../shared/widgets/dn_toast.dart';

/// Layar Daftar Rencana (Node Figma: 86:1962 dan 86:1986).
///
/// Kartu rencana memakai [DnPlanCard] dengan progress bar dan badge status.
/// Hapus meminta konfirmasi lewat dialog destruktif.
class SavedPlansScreen extends StatelessWidget {
  const SavedPlansScreen({
    super.key,
    this.items,
    this.onCreatePlan,
    this.onOpenPlan,
    this.onRemove,
    this.onBack,
  });

  /// Daftar rencana; bila null dibaca dari [SavedState].
  final List<SavedTripPlan>? items;
  final VoidCallback? onCreatePlan;
  final ValueChanged<String>? onOpenPlan;
  final ValueChanged<String>? onRemove;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final store = context.watch<SavedState>();
    final saved = items ?? store.savedPlans;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Daftar rencana',
        showBack: true,
        onBack: onBack ?? () => context.pop(),
        trailing: DnIconPlus(
          onTap: onCreatePlan ?? () => context.push('/plan/new'),
        ),
      ),
      body: SafeArea(
        top: false,
        child: saved.isEmpty
            ? Padding(
                padding: const EdgeInsets.all(AppSpacing.s5),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const DnEmptyState(
                        variant: DnEmptyVariant.belumAdaData,
                        title: 'Belum ada rencana',
                        body: 'Susun rencana perjalanan supaya mudah '
                            'dibawa ke lapangan.',
                      ),
                      const SizedBox(height: AppSpacing.s5),
                      DnPrimaryButton(
                        label: 'Buat rencana',
                        onPressed: onCreatePlan ?? () => context.push('/plan/new'),
                      ),
                    ],
                  ),
                ),
              )
            : ListView.separated(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.s5,
                  AppSpacing.s4,
                  AppSpacing.s5,
                  AppSpacing.s5,
                ),
                itemCount: saved.length,
                separatorBuilder: (_, _) =>
                    const SizedBox(height: AppSpacing.s3),
                itemBuilder: (context, index) {
                  final plan = saved[index];
                  final archived = plan.status == SavedPlanStatus.arsip;

                  return DnPlanCard(
                    name: plan.name,
                    dateRange: plan.dateRange,
                    destinationName: '${plan.destinationTotal} destinasi dipilih',
                    statusLabel: plan.statusLabel,
                    statusColor:
                        archived ? AppColors.body : AppColors.success,
                    completed: plan.destinationCount,
                    total: plan.destinationTotal,
                    onTap: onOpenPlan == null
                        ? () => context.go('/plan')
                        : () => onOpenPlan!(plan.id),
                    onMore: () async {
                      final confirmed = await showDnDialog(
                        context,
                        title: 'Hapus rencana ini?',
                        message:
                            '${plan.name} beserta daftar.destinasinya akan '
                            'dihapus dari daftar tersimpan.',
                        type: DnDialogType.destruktif,
                        confirmLabel: 'Hapus',
                        icon: AppIcons.delete,
                      );
                      if (confirmed != true || !context.mounted) return;
                      if (onRemove != null) {
                        onRemove!(plan.id);
                        return;
                      }
                      store.removeSavedPlan(plan.id);
                      showDnToast(
                        context,
                        '${plan.name} dihapus',
                        type: DnToastType.info,
                      );
                    },
                  );
                },
              ),
      ),
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
      icon: const Icon(AppIcons.plus, size: 20, color: AppColors.primary),
      tooltip: 'Buat rencana baru',
    );
  }
}
