import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_media_placeholder.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Layar Detail Fasilitas (Node Figma: 69:1517 / 69:1597 / 69:1679).
///
/// Satu template untuk tiga jenis fasilitas; isi diambil dari
/// [Facility.infoRows], [Facility.specLabels], dan [Facility.products].
class FacilityDetailScreen extends StatefulWidget {
  const FacilityDetailScreen({
    super.key,
    this.facilityId = 'sup-homestay',
    this.onSave,
    this.onContact,
    this.onBack,
  });

  final String facilityId;
  final VoidCallback? onSave;
  final VoidCallback? onContact;
  final VoidCallback? onBack;

  @override
  State<FacilityDetailScreen> createState() => _FacilityDetailScreenState();
}

class _FacilityDetailScreenState extends State<FacilityDetailScreen> {
  String get facilityId => widget.facilityId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant FacilityDetailScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.facilityId != widget.facilityId) _load();
  }

  void _load() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<FacilitiesController>().loadDetail(facilityId);
    });
  }

  static IconData _iconFor(FacilityCategory category) => switch (category) {
    FacilityCategory.penginapan => AppIcons.bedDouble,
    FacilityCategory.transportasi => AppIcons.car,
    FacilityCategory.makanan => AppIcons.utensils,
  };

  @override
  Widget build(BuildContext context) {
    final state = context.watch<FacilitiesController>();
    final facility = state.resolve(facilityId);
    if (facility == null) {
      return Scaffold(
        appBar: DnAppBar(
          title: 'Fasilitas',
          showBack: true,
          onBack:
              widget.onBack ??
              () {
                if (context.canPop()) context.pop();
              },
        ),
        body: SafeArea(
          child: Center(
            child: state.detailId != facilityId || state.detailLoading
                ? const CircularProgressIndicator()
                : Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        state.detailFailure?.message ??
                            'Fasilitas tidak tersedia.',
                      ),
                      TextButton(
                        onPressed: () => state.loadDetail(facilityId),
                        child: const Text('Coba lagi'),
                      ),
                    ],
                  ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: facility.categoryLabel,
        showBack: true,
        onBack: widget.onBack ?? () => context.pop(),
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _Banner(facility: facility),
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
                                facility.name,
                                style: AppTextStyles.displayMd,
                              ),
                            ),
                            if (facility.verified)
                              const Icon(
                                AppIcons.badgeCheck,
                                size: 20,
                                color: AppColors.success,
                              ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.s1),
                        Text(
                          [
                            facility.categoryLabel,
                            if (facility.type.isNotEmpty) facility.type,
                            if (facility.destinationName.isNotEmpty)
                              facility.destinationName,
                          ].join(' · '),
                          style: AppTextStyles.bodySm,
                        ),
                        const SizedBox(height: AppSpacing.s2),
                        Text(
                          facility.priceLabel,
                          style: AppTextStyles.titleSm.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.s5),
                        _InfoGrid(rows: facility.infoRows),
                        const SizedBox(height: AppSpacing.s4),
                        Wrap(
                          spacing: AppSpacing.s2,
                          runSpacing: AppSpacing.s2,
                          children: facility.specLabels
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
                                  child: Text(
                                    label,
                                    style: AppTextStyles.overline,
                                  ),
                                ),
                              )
                              .toList(),
                        ),
                        const SizedBox(height: AppSpacing.s4),
                        Text('TENTANG', style: AppTextStyles.overline),
                        const SizedBox(height: AppSpacing.s2),
                        Text(
                          facility.description.isEmpty
                              ? 'Belum ada deskripsi.'
                              : facility.description,
                          style: AppTextStyles.bodySm,
                        ),
                        if (facility.contactRows.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.s5),
                          Text('KONTAK', style: AppTextStyles.overline),
                          const SizedBox(height: AppSpacing.s2),
                          ...facility.contactRows.map(
                            (row) => Padding(
                              padding: const EdgeInsets.only(
                                bottom: AppSpacing.s2,
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      row[0],
                                      style: AppTextStyles.bodySm,
                                    ),
                                  ),
                                  Flexible(
                                    child: Text(
                                      row[1],
                                      textAlign: TextAlign.right,
                                      style: AppTextStyles.titleSm,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                        if (facility.products.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.s5),
                          Text('PRODUK', style: AppTextStyles.overline),
                          const SizedBox(height: AppSpacing.s2),
                          ...facility.products.map(
                            (product) => _ProductTile(product: product),
                          ),
                        ],
                        if (facility.destinationName.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.s5),
                          Text(
                            'DESTINASI TERKAIT',
                            style: AppTextStyles.overline,
                          ),
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
                                    facility.destinationName,
                                    style: AppTextStyles.titleSm,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
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
                      onPressed:
                          widget.onSave ??
                          () => showDnToast(
                            context,
                            '${facility.name} disimpan',
                            type: DnToastType.sukses,
                          ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  Expanded(
                    flex: 2,
                    child: DnPrimaryButton(
                      label: facility.contact.isEmpty
                          ? 'Hubungi'
                          : 'Hubungi via WhatsApp',
                      icon: AppIcons.messageSquare,
                      height: 48,
                      onPressed:
                          widget.onContact ??
                          () => showDnToast(
                            context,
                            'Membuka WhatsApp ${facility.name}',
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

class _Banner extends StatelessWidget {
  const _Banner({required this.facility});

  final Facility facility;

  @override
  Widget build(BuildContext context) {
    if (facility.bannerUrl.isEmpty) {
      return DnMediaPlaceholder(
        icon: _FacilityDetailScreenState._iconFor(facility.category),
        height: 220,
      );
    }

    return Image.network(
      facility.bannerUrl,
      height: 220,
      width: double.infinity,
      fit: BoxFit.cover,
      errorBuilder: (_, _, _) => DnMediaPlaceholder(
        icon: _FacilityDetailScreenState._iconFor(facility.category),
        height: 220,
      ),
    );
  }
}

class _ProductTile extends StatelessWidget {
  const _ProductTile({required this.product});

  final FacilityProduct product;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.s2),
      padding: const EdgeInsets.all(AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(product.name, style: AppTextStyles.titleSm),
                    ),
                    if (!product.isActive) ...[
                      const SizedBox(width: AppSpacing.s2),
                      Text('Nonaktif', style: AppTextStyles.overline),
                    ],
                  ],
                ),
                if (product.description.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(product.description, style: AppTextStyles.bodySm),
                ],
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.s2),
          Text(
            product.priceLabel,
            style: AppTextStyles.titleSm.copyWith(color: AppColors.primary),
          ),
        ],
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
