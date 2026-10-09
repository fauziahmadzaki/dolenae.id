import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_buttons.dart';

/// Layar Rencana Sukses (Node Figma: 85:1386).
///
/// Konfirmasi rencana baru tersimpan, lengkap dengan ringkasan nama, tanggal,
/// dan jumlah destinasi. Muncul setelah menyimpan rencana dari `/plan/new`.
class PlanSuccessScreen extends StatelessWidget {
  const PlanSuccessScreen({
    super.key,
    this.planName = '',
    this.dateRange = '',
    this.destinationCount = 0,
    this.onViewPlan,
    this.onBackHome,
  });

  final String planName;
  final String dateRange;
  final int destinationCount;

  final VoidCallback? onViewPlan;
  final VoidCallback? onBackHome;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.s5),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 88,
                height: 88,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  AppIcons.check,
                  size: 44,
                  color: AppColors.onPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.s5),
              Text(
                'Rencana tersimpan',
                style: AppTextStyles.displayMd,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.s6),
              Container(
                padding: const EdgeInsets.all(AppSpacing.s4),
                decoration: BoxDecoration(
                  color: AppColors.canvasSubtle,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.hairline),
                ),
                child: Column(
                  children: [
                    _SummaryRow(label: 'Rencana', value: planName),
                    const SizedBox(height: AppSpacing.s3),
                    _SummaryRow(label: 'Tanggal', value: dateRange),
                    const SizedBox(height: AppSpacing.s3),
                    _SummaryRow(
                      label: 'Destinasi',
                      value: '$destinationCount destinasi',
                    ),
                  ],
                ),
              ),
              const Spacer(),
              DnPrimaryButton(
                label: 'Lihat rencana',
                onPressed: onViewPlan ?? () => context.go('/plan'),
              ),
              const SizedBox(height: AppSpacing.s2),
              DnGhostButton(
                label: 'Kembali ke beranda',
                onPressed: onBackHome ?? () => context.go('/home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label, style: AppTextStyles.bodySm)),
        Flexible(
          child: Text(
            value.isEmpty ? '-' : value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.titleSm,
          ),
        ),
      ],
    );
  }
}
