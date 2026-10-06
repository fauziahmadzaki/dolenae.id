import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/travel_support.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_media_placeholder.dart';
import '../../../shared/widgets/dn_toast.dart';

/// Layar Detail Fasilitas (Node Figma: 69:1517 / 69:1597 / 69:1679).
///
/// Satu template untuk tiga jenis fasilitas; perbedaan isi diambil dari
/// [TravelSupport.infoRows] dan [TravelSupport.specLabels].
class FacilityDetailScreen extends StatelessWidget {
  const FacilityDetailScreen({
    super.key,
    this.supportId = 'sup-homestay',
    this.onSave,
    this.onContact,
    this.onBack,
  });

  final String supportId;
  final VoidCallback? onSave;
  final VoidCallback? onContact;
  final VoidCallback? onBack;

  static IconData _iconFor(SupportCategory category) => switch (category) {
    SupportCategory.penginapan => AppIcons.bedDouble,
    SupportCategory.transportasi => AppIcons.car,
    SupportCategory.makanan => AppIcons.utensils,
  };

  @override
  Widget build(BuildContext context) {
    final support = SeedData.supports.firstWhere(
      (item) => item.id == supportId,
      orElse: () => SeedData.supports.first,
    );

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: support.categoryLabel,
        showBack: true,
        onBack: onBack ?? () => context.pop(),
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  DnMediaPlaceholder(
                    icon: _iconFor(support.category),
                    height: 220,
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.s5,
                      AppSpacing.s5,
                      AppSpacing.s5,
                      AppSpacing.s5,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                support.name,
                                style: AppTextStyles.displayMd,
                              ),
                            ),
                            if (support.verified)
                              const Icon(
                                AppIcons.badgeCheck,
                                size: 20,
                                color: AppColors.success,
                              ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.s1),
                        Text(
                          '${support.categoryLabel} · ${support.locationLabel}',
                          style: AppTextStyles.bodySm,
                        ),
                        const SizedBox(height: AppSpacing.s2),
                        Text(
                          support.priceUnit.isEmpty
                              ? support.priceLabel
                              : support.priceUnit,
                          style: AppTextStyles.titleSm.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.s5),
                        _InfoGrid(rows: support.infoRows),
                        const SizedBox(height: AppSpacing.s4),
                        Wrap(
                          spacing: AppSpacing.s2,
                          runSpacing: AppSpacing.s2,
                          children: support.specLabels
                              .map(
                                (label) => Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.s2,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.canvasSubtle,
                                    borderRadius: BorderRadius.circular(
                                      AppRadius.sm,
                                    ),
                                  ),
                                  child: Text(label, style: AppTextStyles.overline),
                                ),
                              )
                              .toList(),
                        ),
                        const SizedBox(height: AppSpacing.s4),
                        Text('TENTANG', style: AppTextStyles.overline),
                        const SizedBox(height: AppSpacing.s2),
                        Text(support.description, style: AppTextStyles.bodySm),
                        if (support.contactRows.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.s5),
                          Text('KONTAK', style: AppTextStyles.overline),
                          const SizedBox(height: AppSpacing.s2),
                          ...support.contactRows.map(
                            (row) => Padding(
                              padding: const EdgeInsets.only(
                                bottom: AppSpacing.s2,
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      row[0] as String,
                                      style: AppTextStyles.bodySm,
                                    ),
                                  ),
                                  Text(
                                    row[1] as String,
                                    style: AppTextStyles.titleSm,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: AppSpacing.s5),
                        Text('DESTINASI TERKAIT', style: AppTextStyles.overline),
                        const SizedBox(height: AppSpacing.s2),
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.s3),
                          decoration: BoxDecoration(
                            color: AppColors.canvasSubtle,
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                            border: Border.all(color: AppColors.hairline),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                AppIcons.mountain,
                                size: 20,
                                color: AppColors.primary,
                              ),
                              const SizedBox(width: AppSpacing.s3),
                              Expanded(
                                child: Text(
                                  support.relatedDestinationName,
                                  style: AppTextStyles.titleSm,
                                ),
                              ),
                              const Icon(
                                AppIcons.chevronRight,
                                size: 18,
                                color: AppColors.body,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Container(
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
                      label: 'Simpan',
                      height: 48,
                      onPressed: onSave ??
                          () => showDnToast(
                            context,
                            '${support.name} disimpan',
                            type: DnToastType.sukses,
                          ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  Expanded(
                    flex: 2,
                    child: DnPrimaryButton(
                      label: 'Hubungi via WhatsApp',
                      icon: AppIcons.messageSquare,
                      height: 48,
                      onPressed: onContact ??
                          () => showDnToast(
                            context,
                            'Membuka WhatsApp ${support.name}',
                          ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Grid info 2x2 sesuai blok Info di design.
class _InfoGrid extends StatelessWidget {
  const _InfoGrid({required this.rows});

  final List<MapEntry<String, String>> rows;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const gap = AppSpacing.s3;
        final width = (constraints.maxWidth - gap) / 2;
        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: rows
              .map(
                (row) => SizedBox(
                  width: width,
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.s3),
                    decoration: BoxDecoration(
                      color: AppColors.canvasSubtle,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.hairline),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(row.key, style: AppTextStyles.overline),
                        const SizedBox(height: 2),
                        Text(row.value, style: AppTextStyles.titleSm),
                      ],
                    ),
                  ),
                ),
              )
              .toList(),
        );
      },
    );
  }
}
