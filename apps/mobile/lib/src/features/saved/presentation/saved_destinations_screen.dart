import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/dolenae_store.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/saved_item.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_difficulty_badge.dart';
import '../../../shared/widgets/dn_empty_state.dart';
import '../../../shared/widgets/dn_toast.dart';

/// Layar Destinasi Tersimpan (Node Figma: 86:1897 dan 86:1948).
///
/// Kartu horizontal berisi media placeholder, nama, meta, badge kesulitan, dan
/// tombol hapus. Saat daftar kosong tampilkan [DnEmptyVariant.belumAdaData]
/// dengan ajakan menjelajah.
class SavedDestinationsScreen extends StatelessWidget {
  const SavedDestinationsScreen({
    super.key,
    this.items,
    this.onExplore,
    this.onOpenDetail,
    this.onRemove,
    this.onBack,
  });

  /// Daftar tersimpan; bila null dibaca dari [DolenaeStore].
  final List<SavedDestination>? items;
  final VoidCallback? onExplore;
  final ValueChanged<String>? onOpenDetail;
  final ValueChanged<String>? onRemove;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final store = context.watch<DolenaeStore>();
    final saved = items ?? store.savedDestinations;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Destinasi tersimpan',
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
                        title: 'Belum ada destinasi',
                        body: 'Simpan destinasi dari Jelajah supaya mudah '
                            'kamu temukan lagi.',
                      ),
                      const SizedBox(height: AppSpacing.s5),
                      DnPrimaryButton(
                        label: 'Jelajahi destinasi',
                        onPressed:
                            onExplore ?? () => context.go('/explore'),
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
                  final item = saved[index];
                  final destination = item.destination;

                  return InkWell(
                    onTap: onOpenDetail == null
                        ? () => context.push('/destination/${destination.id}')
                        : () => onOpenDetail!(destination.id),
                    borderRadius: BorderRadius.circular(AppRadius.xl),
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.s3),
                      decoration: BoxDecoration(
                        color: AppColors.canvasSubtle,
                        borderRadius: BorderRadius.circular(AppRadius.xl),
                        border: Border.all(color: AppColors.hairline),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 96,
                            height: 96,
                            decoration: BoxDecoration(
                              color: AppColors.canvas,
                              borderRadius: BorderRadius.circular(AppRadius.lg),
                            ),
                            child: const Icon(
                              AppIcons.mountainSnow,
                              size: 28,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.s3),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  destination.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppTextStyles.titleSm,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${destination.elevationM} mdpl · '
                                  '${destination.regency}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppTextStyles.caption,
                                ),
                                const SizedBox(height: AppSpacing.s2),
                                DnDifficultyBadge(
                                  level: destination.difficulty,
                                ),
                              ],
                            ),
                          ),
                          Column(
                            children: [
                              const Icon(
                                AppIcons.bookmarkCheck,
                                size: 18,
                                color: AppColors.primary,
                              ),
                              IconButton(
                                onPressed: () {
                                  if (onRemove != null) {
                                    onRemove!(item.id);
                                    return;
                                  }
                                  store.removeSavedDestination(destination.id);
                                  showDnToast(
                                    context,
                                    '${destination.name} dihapus dari tersimpan',
                                    type: DnToastType.info,
                                  );
                                },
                                icon: const Icon(
                                  AppIcons.delete,
                                  size: 18,
                                  color: AppColors.body,
                                ),
                                tooltip: 'Hapus dari tersimpan',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
