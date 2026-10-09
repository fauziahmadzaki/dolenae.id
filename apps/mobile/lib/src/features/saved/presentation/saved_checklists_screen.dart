import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/saved_state.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/saved_item.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_dialog.dart';
import '../../../shared/widgets/dn_empty_state.dart';
import '../../../shared/widgets/dn_progress_bar.dart';
import '../../../shared/widgets/dn_toast.dart';

/// Layar Checklist Tersimpan (Node Figma: 86:2003 dan 86:2051).
///
/// Kartu checklist berisi progress bar, rasio item siap, dan badge selesai.
/// Menghapus memakai dialog konfirmasi.
class SavedChecklistsScreen extends StatelessWidget {
  const SavedChecklistsScreen({
    super.key,
    this.items,
    this.onCreateChecklist,
    this.onOpenChecklist,
    this.onRemove,
    this.onBack,
  });

  final List<SavedChecklist>? items;
  final VoidCallback? onCreateChecklist;
  final ValueChanged<String>? onOpenChecklist;
  final ValueChanged<String>? onRemove;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final store = context.watch<SavedState>();
    final saved = items ?? store.savedChecklists;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Checklist tersimpan',
        showBack: true,
        onBack: onBack ?? () => context.pop(),
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
                        title: 'Belum ada checklist',
                        body: 'Susun daftar barang yang perlu dibawa agar '
                            'tidak ada yang tertinggal.',
                      ),
                      const SizedBox(height: AppSpacing.s5),
                      DnPrimaryButton(
                        label: 'Susun checklist',
                        onPressed:
                            onCreateChecklist ?? () => context.go('/checklist'),
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
                  final checklist = saved[index];

                  return Container(
                    padding: const EdgeInsets.all(AppSpacing.s4),
                    decoration: BoxDecoration(
                      color: AppColors.canvasSubtle,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      border: Border.all(
                        color: checklist.finished
                            ? AppColors.success.withValues(alpha: 0.4)
                            : AppColors.hairline,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    checklist.name,
                                    style: AppTextStyles.titleSm,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    checklist.destinationName,
                                    style: AppTextStyles.caption,
                                  ),
                                ],
                              ),
                            ),
                            if (checklist.finished)
                              const Icon(
                                AppIcons.badgeCheck,
                                size: 18,
                                color: AppColors.success,
                              ),
                            IconButton(
                              onPressed: () async {
                                final confirmed = await showDnDialog(
                                  context,
                                  title: 'Hapus checklist ini?',
                                  message:
                                      '${checklist.name} akan dihapus dari '
                                      'daftar tersimpan.',
                                  type: DnDialogType.destruktif,
                                  confirmLabel: 'Hapus',
                                  icon: AppIcons.delete,
                                );
                                if (confirmed != true || !context.mounted) {
                                  return;
                                }
                                if (onRemove != null) {
                                  onRemove!(checklist.id);
                                  return;
                                }
                                store.removeSavedChecklist(checklist.id);
                                showDnToast(
                                  context,
                                  '${checklist.name} dihapus',
                                  type: DnToastType.info,
                                );
                              },
                              icon: const Icon(
                                AppIcons.delete,
                                size: 18,
                                color: AppColors.body,
                              ),
                              tooltip: 'Hapus checklist',
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.s3),
                        DnProgressBar(
                          value: checklist.progress,
                          fillColor: checklist.finished
                              ? AppColors.success
                              : AppColors.primary,
                        ),
                        const SizedBox(height: AppSpacing.s2),
                        Row(
                          children: [
                            Text(
                              checklist.countLabel,
                              style: AppTextStyles.caption,
                            ),
                            const Spacer(),
                            if (checklist.finished)
                              Text(
                                'Selesai',
                                style: AppTextStyles.overline.copyWith(
                                  color: AppColors.success,
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
