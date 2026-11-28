import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/saved/domain/entities/saved_item.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_difficulty_badge.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_remote_image.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Layar Destinasi Tersimpan (Node Figma: 86:1897 dan 86:1948).
///
/// Kartu horizontal berisi gambar destinasi nyata ([DnRemoteImage]), nama, meta,
/// badge kesulitan, dan tombol hapus. Mendukung state loading, kosong, error,
/// dan pull-to-refresh per akun.
class SavedDestinationsScreen extends StatefulWidget {
  const SavedDestinationsScreen({
    super.key,
    this.items,
    this.onExplore,
    this.onOpenDetail,
    this.onRemove,
    this.onBack,
  });

  /// Daftar tersimpan; bila null dibaca dari [SavedController].
  final List<SavedDestination>? items;
  final VoidCallback? onExplore;
  final ValueChanged<String>? onOpenDetail;
  final ValueChanged<String>? onRemove;
  final VoidCallback? onBack;

  @override
  State<SavedDestinationsScreen> createState() =>
      _SavedDestinationsScreenState();
}

class _SavedDestinationsScreenState extends State<SavedDestinationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || widget.items != null) return;
      final store = context.read<SavedController>();
      if (!store.hasLoaded && !store.isLoading && store.error == null) {
        unawaited(store.loadDestinations());
      }
    });
  }

  Future<void> _handleRemove(
    BuildContext context,
    SavedController store,
    SavedDestination item,
  ) async {
    if (widget.onRemove != null) {
      widget.onRemove!(item.id);
      return;
    }
    final result = await store.removeSavedDestination(item.destination.id);
    if (!context.mounted) return;
    switch (result) {
      case Success():
        showDnToast(
          context,
          '${item.destination.name} dihapus dari tersimpan',
          type: DnToastType.info,
        );
      case Failure(:final failure):
        if (failure is AuthFailure || failure.code == 'AUTH_REQUIRED') {
          showDnToast(
            context,
            'Sesi berakhir. Masuk kembali untuk mengelola destinasi tersimpan.',
            type: DnToastType.info,
          );
        } else {
          showDnToast(
            context,
            'Gagal menghapus destinasi. Coba lagi.',
            type: DnToastType.gagal,
          );
        }
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<SavedController>();
    final isControlled = widget.items != null;
    final saved = widget.items ?? store.savedDestinations;
    final isLoading = !isControlled && store.isLoading;
    final error = isControlled ? null : store.error;
    final hasLoaded = isControlled ? true : store.hasLoaded;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Destinasi tersimpan',
        showBack: true,
        onBack: widget.onBack ?? () => context.pop(),
      ),
      body: SafeArea(
        top: false,
        child: _buildBody(
          context: context,
          store: store,
          saved: saved,
          isControlled: isControlled,
          isLoading: isLoading,
          hasLoaded: hasLoaded,
          error: error,
        ),
      ),
    );
  }

  Widget _buildBody({
    required BuildContext context,
    required SavedController store,
    required List<SavedDestination> saved,
    required bool isControlled,
    required bool isLoading,
    required bool hasLoaded,
    required String? error,
  }) {
    if (saved.isEmpty && (isLoading || (!hasLoaded && error == null))) {
      return Center(
        child: Semantics(
          label: 'Memuat destinasi tersimpan',
          child: const CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    if (error != null && saved.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () => store.loadDestinations(refresh: true),
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
                    title: 'Gagal memuat destinasi tersimpan',
                    body: error,
                    actionLabel: 'Coba lagi',
                    onAction: () => store.loadDestinations(refresh: true),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    if (saved.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: isControlled
            ? () async {}
            : () => store.loadDestinations(refresh: true),
        child: LayoutBuilder(
          builder: (context, constraints) => SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.s5),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const DnEmptyState(
                        variant: DnEmptyVariant.belumAdaData,
                        title: 'Belum ada destinasi',
                        body:
                            'Simpan destinasi dari Jelajah supaya mudah '
                            'kamu temukan lagi.',
                      ),
                      const SizedBox(height: AppSpacing.s5),
                      DnPrimaryButton(
                        label: 'Jelajahi destinasi',
                        onPressed:
                            widget.onExplore ?? () => context.go('/explore'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    final hasErrorBanner = error != null;
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: isControlled
          ? () async {}
          : () => store.loadDestinations(refresh: true),
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.s5,
          AppSpacing.s4,
          AppSpacing.s5,
          AppSpacing.s5,
        ),
        itemCount: saved.length + (hasErrorBanner ? 1 : 0),
        separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.s3),
        itemBuilder: (context, index) {
          if (hasErrorBanner && index == 0) {
            return Container(
              padding: const EdgeInsets.all(AppSpacing.s3),
              decoration: BoxDecoration(
                color: AppColors.canvasSubtle,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.danger),
              ),
              child: Row(
                children: [
                  const Icon(
                    AppIcons.alertCircle,
                    size: 18,
                    color: AppColors.danger,
                  ),
                  const SizedBox(width: AppSpacing.s2),
                  Expanded(
                    child: Text(
                      error,
                      style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
                    ),
                  ),
                  TextButton(
                    style: TextButton.styleFrom(
                      minimumSize: const Size(44, 44),
                      foregroundColor: AppColors.primary,
                    ),
                    onPressed: () => store.loadDestinations(refresh: true),
                    child: const Text('Coba lagi'),
                  ),
                ],
              ),
            );
          }

          final item = saved[hasErrorBanner ? index - 1 : index];
          final destination = item.destination;
          final isRemoving =
              !isControlled && store.isMutating(destination.id);

          return InkWell(
            onTap: widget.onOpenDetail == null
                ? () => context.push('/destination/${destination.id}')
                : () => widget.onOpenDetail!(destination.id),
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
                  SizedBox(
                    width: 96,
                    height: 96,
                    child: DnRemoteImage(
                      url: destination.images.firstOrNull,
                      height: 96,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      fallbackIcon: AppIcons.mountainSnow,
                      semanticLabel: destination.name,
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
                          '${destination.elevationLabel} · '
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
                  const SizedBox(width: AppSpacing.s2),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const ExcludeSemantics(
                        child: Icon(
                          AppIcons.bookmarkCheck,
                          size: 18,
                          color: AppColors.primary,
                        ),
                      ),
                      IconButton(
                        constraints: const BoxConstraints(
                          minWidth: 44,
                          minHeight: 44,
                        ),
                        padding: EdgeInsets.zero,
                        onPressed: isRemoving
                            ? null
                            : () => _handleRemove(context, store, item),
                        icon: isRemoving
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppColors.primary,
                                ),
                              )
                            : const Icon(
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
    );
  }
}
