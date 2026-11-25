import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:path/path.dart' as p;

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_local_image.dart';

/// Layar Usulan Sukses (Node Figma: 86:1609).
///
/// Konfirmasi penyimpanan usulan di aplikasi.
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
                'Usulan disimpan',
                style: AppTextStyles.displayMd,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.s2),
              Text(
                'Usulan disimpan sementara di aplikasi dan belum dikirim ke admin.',
                style: AppTextStyles.bodySm,
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
                      value: data.status == ProposalStatus.menunggu
                          ? 'Disimpan sementara'
                          : data.statusLabel,
                      valueColor: AppColors.warning,
                    ),
                    if (data.photoPath != null &&
                        data.photoPath!.trim().isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.s3),
                      Row(
                        children: [
                          DnLocalImage(
                            path: data.photoPath,
                            width: 40,
                            height: 40,
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            semanticLabel: 'Foto lampiran usulan',
                            fallback: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: AppColors.canvas,
                                borderRadius: BorderRadius.circular(
                                  AppRadius.md,
                                ),
                                border: Border.all(color: AppColors.hairline),
                              ),
                              alignment: Alignment.center,
                              child: const Icon(
                                AppIcons.image,
                                size: 18,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.s3),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Foto lampiran',
                                  style: AppTextStyles.caption,
                                ),
                                Text(
                                  p.basename(data.photoPath!),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppTextStyles.titleSm,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
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
        Expanded(
          flex: 2,
          child: Text(
            value,
            style: AppTextStyles.titleSm.copyWith(color: valueColor),
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }
}
