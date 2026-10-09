import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_shadows.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/travel_support.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_icon_circle.dart';

/// Layar Detail Item Rencana (Node Figma: 84:1326).
///
/// Menampilkan informasi spesifik item perjalanan pada suatu hari tertentu,
/// termasuk destinasi, catatan perjalanan, fasilitas terkait, serta opsi
/// ubah urutan dan hapus item.
class PlanItemDetailScreen extends StatelessWidget {
  const PlanItemDetailScreen({
    super.key,
    this.destinationName = 'Gunung Bromo',
    this.destinationMeta = '2.329 mdpl · Probolinggo',
    this.dayLabel = 'Hari 1',
    this.difficultyLabel = 'Menengah',
    this.isWarningDifficulty = true,
    this.note = 'Berangkat dini hari untuk sunrise di Penanjakan, lanjut kawah Bromo.',
    this.facilityName = 'Homestay Cemoro Indah',
    this.facilityPrice = 'Rp250.000/malam',
    this.facilityCategory = SupportCategory.penginapan,
    this.onEdit,
    this.onReorder,
    this.onDelete,
    this.onBack,
  });

  final String destinationName;
  final String destinationMeta;
  final String dayLabel;
  final String difficultyLabel;
  final bool isWarningDifficulty;
  final String note;
  final String facilityName;
  final String facilityPrice;
  final SupportCategory facilityCategory;
  final VoidCallback? onEdit;
  final VoidCallback? onReorder;
  final VoidCallback? onDelete;
  final VoidCallback? onBack;

  IconData _getCategoryIcon(SupportCategory category) {
    return switch (category) {
      SupportCategory.penginapan => AppIcons.bedDouble,
      SupportCategory.transportasi => AppIcons.car,
      SupportCategory.makanan => AppIcons.utensils,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Detail item',
        showBack: true,
        onBack: onBack ?? () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/plan');
          }
        },
        trailing: TextButton(
          onPressed: onEdit ?? () {},
          child: Text(
            'Ubah',
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.onPrimary,
            ),
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.s4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildItemCard(),
              const SizedBox(height: AppSpacing.s4),
              _buildNoteSection(),
              const SizedBox(height: AppSpacing.s4),
              _buildFacilitySection(context),
              const SizedBox(height: AppSpacing.s5),
              _buildActions(context),
              const SizedBox(height: AppSpacing.s6),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildItemCard() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.canvas,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: const Icon(
                  AppIcons.mapPin,
                  size: 22,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      destinationName,
                      style: AppTextStyles.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      destinationMeta,
                      style: AppTextStyles.bodySm,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s3),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.canvas,
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                  border: Border.all(color: AppColors.hairline),
                ),
                child: Text(
                  dayLabel,
                  style: AppTextStyles.overline.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isWarningDifficulty ? const Color(0xFFFBEEDB) : const Color(0xFFE2F0E5),
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                ),
                child: Text(
                  difficultyLabel,
                  style: AppTextStyles.overline.copyWith(
                    color: isWarningDifficulty ? AppColors.warning : AppColors.success,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNoteSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'CATATAN',
          style: AppTextStyles.overline.copyWith(
            color: AppColors.body,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.s4),
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Text(
            note,
            style: AppTextStyles.bodySm.copyWith(
              color: AppColors.body,
              height: 1.45,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFacilitySection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'FASILITAS TERKAIT',
          style: AppTextStyles.overline.copyWith(
            color: AppColors.body,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 6),
        Material(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: InkWell(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            onTap: () => context.push('/plan/select-facility'),
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.s3),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.hairline),
              ),
              child: Row(
                children: [
                  DnIconCircle(
                    icon: _getCategoryIcon(facilityCategory),
                    size: 32,
                    iconSize: 16,
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          facilityName,
                          style: AppTextStyles.label.copyWith(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          facilityPrice,
                          style: AppTextStyles.caption.copyWith(color: AppColors.body),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    AppIcons.chevronRight,
                    size: 16,
                    color: AppColors.body,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: DnOutlineButton(
            label: 'Ubah urutan',
            icon: AppIcons.arrowUpDown,
            height: 48,
            onPressed: onReorder ?? () {},
          ),
        ),
        const SizedBox(width: AppSpacing.s3),
        Expanded(
          child: DnOutlineButton(
            label: 'Hapus item',
            icon: AppIcons.delete,
            height: 48,
            foreground: AppColors.danger,
            onPressed: onDelete ?? () {
              if (context.canPop()) {
                context.pop();
              }
            },
          ),
        ),
      ],
    );
  }
}
