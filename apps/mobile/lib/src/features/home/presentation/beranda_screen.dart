import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/widgets/dn_activity_tile.dart';
import '../../../shared/widgets/dn_ai_card.dart';
import '../../../shared/widgets/dn_bottom_nav.dart';
import '../../../shared/widgets/dn_card.dart';
import '../../../shared/widgets/dn_chip.dart';
import '../../../shared/widgets/dn_destination_card.dart';
import '../../../shared/widgets/dn_menu_row.dart';
import '../../../shared/widgets/dn_search_field.dart';
import '../../../shared/widgets/dn_section_header.dart';
import '../../../shared/widgets/dn_support_card.dart';

/// Beranda wisatawan.
class BerandaScreen extends StatelessWidget {
  const BerandaScreen({super.key});

  void _onTab(BuildContext context, DnTab tab) {
    switch (tab) {
      case DnTab.beranda:
        context.go('/home');
      case DnTab.jelajah:
        context.go('/explore');
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
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _Header(),
                  _search(context),
                  _chips(context),
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.s4),
                    child: DnAiCard(
                      title: 'Siapkan perjalananmu dengan AI',
                      body:
                          'Ceritakan rencanamu, Dolenae menyusun checklist dan gambaran kondisi perjalanan.',
                      onPressed: () => context.go('/soon?tab=AI'),
                    ),
                  ),
                  _popular(context),
                  _activities(),
                  _supports(),
                  _help(),
                  _ctaBand(context),
                  const SizedBox(height: AppSpacing.s6),
                ],
              ),
            ),
          ),
          DnBottomNav(
            active: DnTab.beranda,
            onTap: (tab) => _onTab(context, tab),
          ),
        ],
      ),
    );
  }

  Widget _search(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s4,
        AppSpacing.s4,
        0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Mau ke mana?', style: AppTextStyles.displayMd),
          const SizedBox(height: AppSpacing.s3),
          DnSearchField(
            hint: 'Cari gunung, bukit, atau air terjun',
            onTap: () => context.go('/explore'),
            trailing: Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                AppIcons.slidersHorizontal,
                size: 16,
                color: AppColors.onPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _chips(BuildContext context) {
    const labels = ['Gunung', 'Bukit', 'Danau', 'Air terjun', 'Camping'];
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.s3),
      child: SizedBox(
        height: 32,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
          itemCount: labels.length,
          separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.s2),
          itemBuilder: (_, i) => DnChip(
            label: labels[i],
            active: i == 0,
            onTap: () => context.go('/explore'),
          ),
        ),
      ),
    );
  }

  Widget _popular(BuildContext context) {
    final items = SeedData.destinations.take(2).toList();
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s2,
        AppSpacing.s4,
        0,
      ),
      child: Column(
        children: [
          DnSectionHeader(
            title: 'Destinasi populer',
            actionLabel: 'Lihat semua',
            onAction: () => context.go('/explore'),
          ),
          const SizedBox(height: AppSpacing.s3),
          for (final item in items) ...[
            DnDestinationCard(
              destination: item,
              onTap: () => context.push('/destination/${item.id}'),
            ),
            if (item != items.last) const SizedBox(height: AppSpacing.s3),
          ],
        ],
      ),
    );
  }

  Widget _activities() {
    const items = <(IconData, String)>[
      (AppIcons.mountain, 'Hiking'),
      (AppIcons.tent, 'Camping'),
      (AppIcons.sunrise, 'Sunrise'),
      (AppIcons.camera, 'Foto'),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s5,
        AppSpacing.s4,
        0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const DnSectionHeader(title: 'Aktivitas'),
          const SizedBox(height: AppSpacing.s3),
          Row(
            children: [
              for (final item in items) ...[
                Expanded(
                  child: DnActivityTile(icon: item.$1, label: item.$2),
                ),
                if (item != items.last) const SizedBox(width: AppSpacing.s2),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _supports() {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.s5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: AppSpacing.s4),
            child: DnSectionHeader(
              title: 'Fasilitas sekitar',
              actionLabel: 'Lihat semua',
            ),
          ),
          const SizedBox(height: AppSpacing.s3),
          SizedBox(
            height: 176,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
              itemCount: SeedData.supports.length,
              separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.s3),
              itemBuilder: (_, i) =>
                  DnSupportCard(support: SeedData.supports[i]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _help() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s5,
        AppSpacing.s4,
        0,
      ),
      child: DnCard(
        padding: EdgeInsets.zero,
        child: Column(
          children: const [
            DnMenuRow(icon: AppIcons.helpCircle, label: 'Bantuan & FAQ'),
            Divider(height: 1),
            DnMenuRow(icon: AppIcons.messageSquare, label: 'Kirim masukan'),
            Divider(height: 1),
            DnMenuRow(icon: AppIcons.info, label: 'Tentang Dolenae.id'),
          ],
        ),
      ),
    );
  }

  Widget _ctaBand(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: AppSpacing.s5),
      padding: const EdgeInsets.all(AppSpacing.s6),
      color: AppColors.primary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Siap menyusun rencana?',
            style: AppTextStyles.title.copyWith(color: AppColors.onPrimary),
          ),
          const SizedBox(height: AppSpacing.s2),
          Text(
            'Kumpulkan destinasi dan kebutuhanmu dalam satu rencana.',
            style: AppTextStyles.bodySm.copyWith(color: AppColors.canvas),
          ),
          const SizedBox(height: AppSpacing.s4),
          SizedBox(
            height: 48,
            width: double.infinity,
            child: FilledButton(
              onPressed: () => context.go('/plan'),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.canvas,
                foregroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                ),
                textStyle: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              child: const Text('Susun rencana'),
            ),
          ),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      color: AppColors.primary,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColors.primaryHover,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              AppIcons.mountainSnow,
              size: 18,
              color: AppColors.onPrimary,
            ),
          ),
          const SizedBox(width: AppSpacing.s2 + 2),
          Text(
            'Dolenae.id',
            style: AppTextStyles.titleSm.copyWith(color: AppColors.onPrimary),
          ),
          const Spacer(),
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(
              color: AppColors.primaryHover,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              AppIcons.bell,
              size: 18,
              color: AppColors.onPrimary,
            ),
          ),
          const SizedBox(width: AppSpacing.s2 + 2),
          Container(
            width: 36,
            height: 36,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: AppColors.canvas,
              shape: BoxShape.circle,
            ),
            child: Text(
              'D',
              style: AppTextStyles.label.copyWith(color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}
