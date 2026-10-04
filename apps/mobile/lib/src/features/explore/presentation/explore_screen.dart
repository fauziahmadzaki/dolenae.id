import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/destination.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_bottom_nav.dart';
import '../../../shared/widgets/dn_chip.dart';
import '../../../shared/widgets/dn_destination_card.dart';
import '../../../shared/widgets/dn_empty_state.dart';
import '../../../shared/widgets/dn_search_field.dart';

/// Eksplor / katalog destinasi dengan filter kategori interaktif (Node Figma: 65:389).
class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  String _selectedCategory = 'Semuanya';

  static const _filterOptions = <String>[
    'Semuanya',
    'Ramah Pemula',
    'Jawa Timur',
    'Jawa Barat',
    'Jawa Tengah',
    'Camping',
    'Sunrise',
  ];

  List<Destination> get _filteredDestinations {
    return SeedData.destinations.where((destination) {
      switch (_selectedCategory) {
        case 'Ramah Pemula':
          return destination.difficulty == DifficultyLevel.pemula;
        case 'Jawa Timur':
          return destination.province == 'Jawa Timur';
        case 'Jawa Barat':
          return destination.province == 'Jawa Barat';
        case 'Jawa Tengah':
          return destination.province == 'Jawa Tengah';
        case 'Camping':
          return destination.tagline.toLowerCase().contains('camping') ||
              (destination.accessDescription?.toLowerCase().contains('camping') ??
                  false);
        case 'Sunrise':
          return destination.tagline.toLowerCase().contains('sunrise') ||
              (destination.accessDescription?.toLowerCase().contains('sunrise') ??
                  false);
        case 'Semuanya':
        default:
          return true;
      }
    }).toList();
  }

  void _onTab(BuildContext context, DnTab tab) {
    switch (tab) {
      case DnTab.beranda:
        context.go('/home');
      case DnTab.jelajah:
        break;
      case DnTab.ai:
        context.go('/soon?tab=AI');
      case DnTab.rencana:
        context.go('/plan');
      case DnTab.profil:
        context.go('/profile');
    }
  }

  @override
  Widget build(BuildContext context) {
    final destinations = _filteredDestinations;

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
                  _buildFilters(),
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
                          '${destinations.length} destinasi',
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
                  if (destinations.isEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.all(AppSpacing.s6),
                      child: Center(
                        child: DnEmptyState(
                          icon: AppIcons.compass,
                          title: 'Tidak ada destinasi',
                          body:
                              'Belum ada destinasi untuk filter "$_selectedCategory".',
                          actionLabel: 'Tampilkan semua',
                          onAction: () =>
                              setState(() => _selectedCategory = 'Semuanya'),
                        ),
                      ),
                    ),
                  ] else ...[
                    for (final destination in destinations)
                      Padding(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.s4,
                          0,
                          AppSpacing.s4,
                          AppSpacing.s3,
                        ),
                        child: DnDestinationListTile(
                          destination: destination,
                          onTap: () =>
                              context.push('/destination/${destination.id}'),
                        ),
                      ),
                  ],
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

  Widget _buildFilters() {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.s3),
      child: SizedBox(
        height: 32,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
          itemCount: _filterOptions.length,
          separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.s2),
          itemBuilder: (_, i) {
            final label = _filterOptions[i];
            final isSelected = label == _selectedCategory;
            return DnChip(
              label: label,
              active: isSelected,
              onTap: () {
                setState(() {
                  _selectedCategory = label;
                });
              },
            );
          },
        ),
      ),
    );
  }
}
