import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/dolenae_store.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/ai_recommendation.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_empty_state.dart';
import '../../../shared/widgets/dn_recommendation_card.dart';
import '../../../shared/widgets/dn_toast.dart';

/// Layar AI Hasil (Node Figma: 68:771).
///
/// Menampilkan recap prompt beserta chip hasil parsing, ringkasan dari mesin
/// rekomendasi, lalu kartu rekomendasi lengkap dengan alasan dan aksi.
/// Sumber data adalah [DolenaeStore.aiResult]; layar ini juga menangani
/// kondisi belum ada hasil dan gagal memuat.
class AiResultsScreen extends StatelessWidget {
  const AiResultsScreen({
    super.key,
    this.result,
    this.onBack,
    this.onRetry,
    this.onChangePreference,
    this.onAskAgain,
    this.onViewDetail,
    this.onAddDestination,
    this.hasError = false,
  });

  /// Hasil yang ditampilkan; bila null diambil dari [DolenaeStore].
  final AiResult? result;
  final VoidCallback? onBack;

  /// Aksi saat state gagal memuat.
  final VoidCallback? onRetry;

  /// Menampilkan state `Rekomendasi AI gagal diproses` (`101:358`).
  final bool hasError;
  final VoidCallback? onChangePreference;
  final VoidCallback? onAskAgain;
  final void Function(String destinationId)? onViewDetail;
  final void Function(String destinationId)? onAddDestination;

  @override
  Widget build(BuildContext context) {
    final store = context.watch<DolenaeStore>();
    final data = result ?? store.aiResult;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Rekomendasi',
        showBack: true,
        onBack: onBack ?? () => context.pop(),
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Expanded(
              child: hasError
                  ? _AiErrorState(
                      onRetry: onRetry ?? () => context.go('/ai/preferences'),
                      onChangePreference:
                          onChangePreference ?? () => context.go('/ai/preferences'),
                    )
                  : data == null
                  ? _AiEmptyState(
                      onChangePreference:
                          onChangePreference ?? () => context.go('/ai/preferences'),
                      onAskAgain: onAskAgain,
                    )
                  : _AiResultsBody(
                      result: data,
                      onViewDetail: onViewDetail,
                      onAddDestination: onAddDestination,
                    ),
            ),
            if (data != null)
              _ResultsCta(
                onChangePreference:
                    onChangePreference ?? () => context.go('/ai/preferences'),
                onAskAgain: onAskAgain ?? () => context.go('/ai/preferences'),
              ),
          ],
        ),
      ),
    );
  }
}

class _AiResultsBody extends StatelessWidget {
  const _AiResultsBody({
    required this.result,
    this.onViewDetail,
    this.onAddDestination,
  });

  final AiResult result;
  final void Function(String destinationId)? onViewDetail;
  final void Function(String destinationId)? onAddDestination;

  List<String> get _preferenceChips {
    final preference = result.preference;
    return [
      ...preference.regions,
      ...preference.activities,
      if (preference.durationDays != null) '${preference.durationDays} hari',
      if (preference.difficulty != null) preference.difficulty!,
    ];
  }

  @override
  Widget build(BuildContext context) {
    final chips = _preferenceChips;

    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s5,
        AppSpacing.s4,
        AppSpacing.s5,
        AppSpacing.s5,
      ),
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.s4),
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('PROMPTMU', style: AppTextStyles.overline),
              const SizedBox(height: AppSpacing.s2),
              Text(
                result.preference.rawText.isEmpty
                    ? 'Preferensi tersimpan'
                    : result.preference.rawText,
                style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
              ),
              if (chips.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.s3),
                Wrap(
                  spacing: AppSpacing.s2,
                  runSpacing: AppSpacing.s2,
                  children: chips
                      .map(
                        (chip) => Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.s2,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.canvas,
                            borderRadius: BorderRadius.circular(AppRadius.pill),
                          ),
                          child: Text(chip, style: AppTextStyles.overline),
                        ),
                      )
                      .toList(),
                ),
              ],
              const SizedBox(height: AppSpacing.s3),
              Text(result.engineLabel, style: AppTextStyles.caption),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.s4),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(AppIcons.sparkles, size: 18, color: AppColors.accent),
            const SizedBox(width: AppSpacing.s2),
            Expanded(
              child: Text(result.summary, style: AppTextStyles.bodySm),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.s4),
        ...result.items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.s3),
            child: DnRecommendationCard(
              recommendation: item,
              onViewDetail: onViewDetail == null
                  ? () => context.go('/destination/${item.destination.id}')
                  : () => onViewDetail!(item.destination.id),
              onAdd: onAddDestination == null
                  ? () => _addDestination(context, item)
                  : () => onAddDestination!(item.destination.id),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.s2),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.s4),
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(
                    AppIcons.squareCheck,
                    size: 16,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: AppSpacing.s2),
                  Text('CHECKLIST TERKAIT', style: AppTextStyles.overline),
                ],
              ),
              const SizedBox(height: AppSpacing.s2),
              Text(
                result.relatedChecklist.join(', '),
                style: AppTextStyles.bodySm,
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _addDestination(BuildContext context, AiRecommendation item) {
    final store = context.read<DolenaeStore>();
    store.toggleSavedDestination(item.destination);
    showDnToast(
      context,
      '${item.destination.name} disimpan ke Favorit',
      type: DnToastType.sukses,
    );
  }
}

/// State belum ada hasil dan gagal memuat.
class _AiEmptyState extends StatelessWidget {
  const _AiEmptyState({required this.onChangePreference, this.onAskAgain});

  final VoidCallback onChangePreference;
  final VoidCallback? onAskAgain;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.s5),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const DnEmptyState(
              variant: DnEmptyVariant.tanpaHasil,
              body: 'Belum ada rekomendasi. Isi preferensimu lalu minta '
                  'rekomendasi baru.',
            ),
            const SizedBox(height: AppSpacing.s4),
            DnPrimaryButton(
              label: 'Isi preferensi',
              onPressed: onChangePreference,
            ),
            if (onAskAgain != null) ...[
              const SizedBox(height: AppSpacing.s2),
              DnOutlineButton(
                label: 'Coba lagi',
                onPressed: onAskAgain,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// State `Gagal memuat AI` (`101:358`): app bar tetap tampil, hanya isi
/// yang diganti panel kegagalan beserta CTA dan aksi cadangan.
class _AiErrorState extends StatelessWidget {
  const _AiErrorState({required this.onRetry, required this.onChangePreference});

  final VoidCallback onRetry;
  final VoidCallback onChangePreference;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s5,
        AppSpacing.s8,
        AppSpacing.s5,
        AppSpacing.s6,
      ),
      child: Column(
        children: [
          DnEmptyState(
            icon: AppIcons.alertTriangle,
            iconColor: AppColors.danger,
            title: 'Rekomendasi AI gagal diproses',
            body: 'Coba lagi sebentar lagi atau ubah preferensi.',
            actionLabel: 'Coba lagi',
            onAction: onRetry,
          ),
          const SizedBox(height: AppSpacing.s2),
          DnGhostButton(
            label: 'Ubah preferensi',
            onPressed: onChangePreference,
          ),
        ],
      ),
    );
  }
}

class _ResultsCta extends StatelessWidget {
  const _ResultsCta({required this.onChangePreference, required this.onAskAgain});

  final VoidCallback onChangePreference;
  final VoidCallback onAskAgain;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s5,
        AppSpacing.s4,
        AppSpacing.s5,
        AppSpacing.s5,
      ),
      decoration: const BoxDecoration(
        color: AppColors.canvas,
        border: Border(top: BorderSide(color: AppColors.hairline)),
      ),
      child: Row(
        children: [
          Expanded(
            child: DnOutlineButton(
              label: 'Ubah preferensi',
              onPressed: onChangePreference,
            ),
          ),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: DnPrimaryButton(
              label: 'Tanya lagi',
              icon: AppIcons.sparkles,
              onPressed: onAskAgain,
            ),
          ),
        ],
      ),
    );
  }
}