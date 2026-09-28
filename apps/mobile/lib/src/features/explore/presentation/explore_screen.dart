import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_bottom_nav.dart';
import '../../../shared/widgets/dn_chip.dart';
import '../../../shared/widgets/dn_destination_card.dart';
import '../../../shared/widgets/dn_search_field.dart';

/// Eksplor / katalog destinasi.
class ExploreScreen extends StatelessWidget {
  const ExploreScreen({super.key});

  void _onTab(BuildContext context, DnTab tab) {
    switch (tab) {
      case DnTab.beranda:
        context.go('/home');
      case DnTab.jelajah:
        context.go('/explore');
      case DnTab.ai:
        context.go('/soon?tab=AI');
      case DnTab.rencana:
        context.go('/soon?tab=Rencana');
      case DnTab.profil:
        context.go('/soon?tab=Profil');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const DnAppBar(title: 'Jelajahi'),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.s4,
                      AppSpacing.s3,
                      AppSpacing.s4,
                      0,
                    ),
                    child: const DnSearchField(
                      hint: 'Cari destinasi, gunung, atau aktivitas',
                    ),
                  ),
                  const _Filters(),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.s4,
                      AppSpacing.s3,
                      AppSpacing.s4,
                      0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${SeedData.destinations.length} destinasi',
                          style: AppTextStyles.caption,
                        ),
                        Row(
                          children: [
                            Text(
                              'Urutkan: Populer',
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.ink,
                              ),
                            ),
                            const Icon(
                              AppIcons.chevronDown,
                              size: 14,
                              color: AppColors.body,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s3),
                  for (final destination in SeedData.destinations)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.s4,
                        0,
                        AppSpacing.s4,
                        AppSpacing.s3,
                      ),
                      child: DnDestinationListTile(destination: destination),
                    ),
                  const SizedBox(height: AppSpacing.s4),
                ],
              ),
            ),
          ),
          DnBottomNav(
            active: DnTab.jelajah,
            onTap: (tab) => _onTab(context, tab),
          ),
        ],
      ),
    );
  }
}

class _Filters extends StatelessWidget {
  const _Filters();

  @override
  Widget build(BuildContext context) {
    const labels = ['Semuanya', 'Ramah Pemula', 'Camping', 'Sunrise'];
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.s3),
      child: SizedBox(
        height: 32,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
          itemCount: labels.length,
          separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.s2),
          itemBuilder: (_, i) => DnChip(label: labels[i], active: i == 0),
        ),
      ),
    );
  }
}
