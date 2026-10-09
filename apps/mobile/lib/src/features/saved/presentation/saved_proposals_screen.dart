import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/saved_state.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/facility_proposal.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_empty_state.dart';

/// Layar Fasilitas Diusulkan (Node Figma: 86:2067 dan 86:2104).
///
/// Daftar usulan dengan badge status berwarna: menunggu `warning`,
/// terverifikasi `success`, ditolak `danger`.
class SavedProposalsScreen extends StatelessWidget {
  const SavedProposalsScreen({
    super.key,
    this.items,
    this.onPropose,
    this.onBack,
  });

  final List<FacilityProposal>? items;
  final VoidCallback? onPropose;
  final VoidCallback? onBack;

  static Color _statusColor(ProposalStatus status) => switch (status) {
    ProposalStatus.menunggu => AppColors.warning,
    ProposalStatus.terverifikasi => AppColors.success,
    ProposalStatus.ditolak => AppColors.danger,
  };

  static IconData _statusIcon(ProposalStatus status) => switch (status) {
    ProposalStatus.menunggu => AppIcons.hourglass,
    ProposalStatus.terverifikasi => AppIcons.badgeCheck,
    ProposalStatus.ditolak => AppIcons.ban,
  };

  @override
  Widget build(BuildContext context) {
    final store = context.watch<SavedState>();
    final proposals = items ?? store.proposals;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Fasilitas diusulkan',
        showBack: true,
        onBack: onBack ?? () => context.pop(),
      ),
      body: SafeArea(
        top: false,
        child: proposals.isEmpty
            ? Padding(
                padding: const EdgeInsets.all(AppSpacing.s5),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const DnEmptyState(
                        variant: DnEmptyVariant.belumAdaData,
                        title: 'Belum ada usulan',
                        body: 'Bantu kami menemukan penginapan, warung, atau '
                            'transportasi di sekitar destinasi.',
                      ),
                      const SizedBox(height: AppSpacing.s5),
                      DnPrimaryButton(
                        label: 'Usulkan fasilitas',
                        onPressed:
                            onPropose ?? () => context.push('/facilities/propose'),
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
                itemCount: proposals.length,
                separatorBuilder: (_, _) =>
                    const SizedBox(height: AppSpacing.s3),
                itemBuilder: (context, index) {
                  final proposal = proposals[index];
                  final accent = _statusColor(proposal.status);

                  return Container(
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
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    proposal.name,
                                    style: AppTextStyles.titleSm,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${proposal.typeLabel} · '
                                    '${proposal.nearestDestinationName}',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: AppTextStyles.caption,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: AppSpacing.s2),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.s2,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: accent.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(
                                  AppRadius.pill,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    _statusIcon(proposal.status),
                                    size: 12,
                                    color: accent,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    proposal.statusLabel,
                                    style: AppTextStyles.overline.copyWith(
                                      color: accent,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.s2),
                        Text(
                          proposal.address,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.caption,
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
