import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/facility_proposal.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_buttons.dart';

/// Layar Usulan Sukses (Node Figma: 86:1609).
///
/// Konfirmasi usulan terkirim lengkap dengan ringkasan dan badge status.
class ProposalSuccessScreen extends StatelessWidget {
  const ProposalSuccessScreen({
    super.key,
    this.proposal,
    this.onViewProposals,
    this.onBackHome,
  });

  /// Usulan yang baru terkirim; bila null memakai contoh dari seed.
  final FacilityProposal? proposal;
  final VoidCallback? onViewProposals;
  final VoidCallback? onBackHome;

  @override
  Widget build(BuildContext context) {
    final FacilityProposal data =
        proposal ??
        FacilityProposal(
          id: 'prop-1',
          name: 'Homestay Pinggir',
          type: ProposalType.accommodation,
          nearestDestinationName: 'Gunung Bromo',
          address: 'Dusun Pinggir, Desa Cemoro Lawang, Kab. Probolinggo',
          note: 'Pemilik terbuka untuk menerima tamu homestay.',
          status: ProposalStatus.menunggu,
          createdAt: DateTime.now(),
        );

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
                'Usulan terkirim',
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
                    _SummaryRow(label: 'Fasilitas', value: data.name),
                    const SizedBox(height: AppSpacing.s3),
                    _SummaryRow(label: 'Tipe', value: data.typeLabel),
                    const SizedBox(height: AppSpacing.s3),
                    _SummaryRow(
                      label: 'Status',
                      value: data.statusLabel,
                      valueColor: AppColors.warning,
                    ),
                  ],
                ),
              ),
              const Spacer(),
              DnPrimaryButton(
                label: 'Lihat usulan',
                onPressed:
                    onViewProposals ?? () => context.push('/saved/proposals'),
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
  const _SummaryRow({
    required this.label,
    required this.value,
    this.valueColor = AppColors.ink,
  });

  final String label;
  final String value;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label, style: AppTextStyles.bodySm)),
        Text(
          value,
          style: AppTextStyles.titleSm.copyWith(color: valueColor),
        ),
      ],
    );
  }
}
