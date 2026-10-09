import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/search_state.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/destination.dart';
import '../../../data/models/search_filter.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_bottom_nav.dart';
import '../../../shared/widgets/dn_bottom_sheet.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_chip.dart';
import '../../../shared/widgets/dn_destination_card.dart';
import '../../../shared/widgets/dn_empty_state.dart';
import '../../../shared/widgets/dn_search_field.dart';

/// Jelajah dan pencarian destinasi dalam satu halaman (Node Figma: 65:389).
///
/// Tidak ada layar pencarian terpisah: field cari duduk di bawah AppBar dan isi
/// di bawahnya berganti antara tiga state, yaitu rekomendasi (belum mengetik),
/// hasil (ada kueri yang cocok), dan kosong (tidak ada yang cocok).
class ExploreScreen extends StatefulWidget {
  const ExploreScreen({
    super.key,
    this.onOpenFilter,
    this.hasError = false,
    this.onRetry,
    this.onResetFilter,
  });

  /// Dipanggil saat tombol filter ditekan; bila null membuka bottom sheet bawaan.
  final VoidCallback? onOpenFilter;

  /// Menampilkan state `Gagal memuat katalog` (`101:302`).
  final bool hasError;

  /// Aksi CTA "Coba lagi" dan ghost "Reset filter".
  final VoidCallback? onRetry;
  final VoidCallback? onResetFilter;

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

  List<Destination> _byCategory(List<Destination> source) {
    return source.where((destination) {
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
              (destination.accessDescription?.toLowerCase().contains(
                    'camping',
                  ) ??
                  false);
        case 'Sunrise':
          return destination.tagline.toLowerCase().contains('sunrise') ||
              (destination.accessDescription?.toLowerCase().contains(
                    'sunrise',
                  ) ??
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
        context.go('/ai/preferences');
      case DnTab.rencana:
        context.go('/plan');
      case DnTab.profil:
        context.go('/profile');
    }
  }

  void _onChanged(String value, SearchState store) {
    store.setSearchQuery(value);
    setState(() {});
  }

  void _clear(SearchState store) {
    store.setSearchQuery('');
    setState(() {});
  }

  void _commit(String value, SearchState store) {
    store.commitSearch(value);
    setState(() {});
  }

  Future<void> _openFilter(SearchState store) async {
    if (widget.onOpenFilter != null) {
      widget.onOpenFilter!();
      return;
    }
    await showDnBottomSheet<void>(
      context: context,
      title: 'Filter dan urutkan',
      type: DnSheetType.filter,
      builder: (sheetContext) => _FilterSheet(
        filter: store.searchFilter,
        onReset: () {
          store.clearSearchFilters();
          Navigator.of(sheetContext).pop();
          setState(() {});
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<SearchState>();
    final hasQuery = store.hasActiveQuery;
    final results = _byCategory(store.searchResults);

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
                    child: DnSearchField(
                      hint: 'Mau ke mana?',
                      value: store.searchFilter.query,
                      focused: hasQuery,
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (hasQuery)
                            GestureDetector(
                              onTap: () => _clear(store),
                              child: const Padding(
                                padding: EdgeInsets.all(4),
                                child: Icon(
                                  AppIcons.close,
                                  size: 16,
                                  color: AppColors.body,
                                ),
                              ),
                            ),
                          GestureDetector(
                            onTap: () => _openFilter(store),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.s2,
                                vertical: AppSpacing.s1,
                              ),
                              decoration: BoxDecoration(
                                color: hasQuery
                                    ? AppColors.primary
                                    : AppColors.canvasSubtle,
                                borderRadius: BorderRadius.circular(AppRadius.md),
                              ),
                              child: Icon(
                                AppIcons.slidersHorizontal,
                                size: 16,
                                color: hasQuery
                                    ? AppColors.onPrimary
                                    : AppColors.body,
                              ),
                            ),
                          ),
                        ],
                      ),
                      onChanged: (value) => _onChanged(value, store),
                      onSubmitted: (value) => _commit(value, store),
                    ),
                  ),
                  if (widget.hasError)
                    _LoadError(
                      onRetry: widget.onRetry,
                      onResetFilter: widget.onResetFilter ??
                          () {
                            final current = context.read<SearchState>();
                            current.clearSearchFilters();
                            setState(() {});
                          },
                    )
                  else if (!hasQuery)
                    _RecommendationPanels(store: store, onPick: (value) {
                      _onChanged(value, store);
                      _commit(value, store);
                    })
                  else if (results.isEmpty)
                    _EmptyResults(
                      query: store.searchFilter.query,
                      popular: SeedData.popularSearches,
                      onPick: (value) => _onChanged(value, store),
                    )
                  else ...[
                    _buildFilters(),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.s4,
                        AppSpacing.s3,
                        AppSpacing.s4,
                        0,
                      ),
                      child: Text(
                        '${results.length} hasil · '
                        'Urutkan: ${store.searchFilter.sortLabel}',
                        style: AppTextStyles.caption,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s3),
                    for (final destination in results)
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
              onTap: () => setState(() => _selectedCategory = label),
            );
          },
        ),
      ),
    );
  }
}

/// State `Gagal memuat katalog` (`101:302`): app bar dan kolom cari tetap
/// tampil, hanya daftar hasil yang diganti panel kegagalan.
class _LoadError extends StatelessWidget {
  const _LoadError({this.onRetry, this.onResetFilter});

  final VoidCallback? onRetry;
  final VoidCallback? onResetFilter;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s5,
        AppSpacing.s8,
        AppSpacing.s5,
        AppSpacing.s6,
      ),
      child: Column(
        children: [
          DnEmptyState(
            icon: AppIcons.alertTriangle,
            iconColor: AppColors.danger,
            title: 'Gagal memuat katalog',
            body: 'Daftar destinasi tidak terbaca. Muat ulang, atau reset '
                'filter bila hasil pencarian terlalu sempit.',
            actionLabel: 'Coba lagi',
            onAction: onRetry,
          ),
          const SizedBox(height: AppSpacing.s2),
          DnGhostButton(label: 'Reset filter', onPressed: onResetFilter),
        ],
      ),
    );
  }
}

/// State rekomendasi: riwayat, pencarian populer, dan destinasi disarankan.
class _RecommendationPanels extends StatelessWidget {
  const _RecommendationPanels({required this.store, required this.onPick});

  final SearchState store;
  final ValueChanged<String> onPick;

  @override
  Widget build(BuildContext context) {
    final history = store.searchHistory;
    final suggested = SeedData.destinations.take(3).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (history.isNotEmpty) ...[
          Padding(
            padding: EdgeInsets.fromLTRB(
              AppSpacing.s4,
              AppSpacing.s5,
              AppSpacing.s4,
              AppSpacing.s2,
            ),
            child: Text('RIWAYAT PENCARIAN', style: AppTextStyles.overline),
          ),
          ...history.map(
            (item) => InkWell(
              onTap: () => onPick(item),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.s4,
                  vertical: AppSpacing.s2,
                ),
                child: Row(
                  children: [
                    const Icon(
                      AppIcons.clock,
                      size: 16,
                      color: AppColors.body,
                    ),
                    const SizedBox(width: AppSpacing.s3),
                    Expanded(
                      child: Text(item, style: AppTextStyles.bodySm),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: store.clearSearchHistory,
              child: Text(
                'Hapus riwayat',
                style: AppTextStyles.labelSm.copyWith(
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ],
        Padding(
          padding: EdgeInsets.fromLTRB(
            AppSpacing.s4,
            AppSpacing.s3,
            AppSpacing.s4,
            AppSpacing.s2,
          ),
          child: Text('PENCARIAN POPULER', style: AppTextStyles.overline),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
          child: Wrap(
            spacing: AppSpacing.s2,
            runSpacing: AppSpacing.s2,
            children: SeedData.popularSearches
                .map(
                  (item) => DnChip(
                    label: item,
                    onTap: () => onPick(item),
                  ),
                )
                .toList(),
          ),
        ),
        Padding(
          padding: EdgeInsets.fromLTRB(
            AppSpacing.s4,
            AppSpacing.s5,
            AppSpacing.s4,
            AppSpacing.s2,
          ),
          child: Text('DESTINASI DISARANKAN', style: AppTextStyles.overline),
        ),
        for (final destination in suggested)
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.s4,
              0,
              AppSpacing.s4,
              AppSpacing.s3,
            ),
            child: DnDestinationListTile(
              destination: destination,
              onTap: () => context.push('/destination/${destination.id}'),
            ),
          ),
      ],
    );
  }
}

/// State kosong: tidak ada destinasi yang cocok dengan kueri.
class _EmptyResults extends StatelessWidget {
  const _EmptyResults({
    required this.query,
    required this.popular,
    required this.onPick,
  });

  final String query;
  final List<String> popular;
  final ValueChanged<String> onPick;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(vertical: AppSpacing.s8),
          child: DnEmptyState(
            variant: DnEmptyVariant.tanpaHasil,
            title: 'Tidak ada hasil',
          ),
        ),
        Wrap(
          spacing: AppSpacing.s2,
          runSpacing: AppSpacing.s2,
          alignment: WrapAlignment.center,
          children: popular
              .map((item) => DnChip(label: item, onTap: () => onPick(item)))
              .toList(),
        ),
      ],
    );
  }
}

/// Bottom sheet filter dan urutkan (Node Figma: 86:2485).
///
/// Perubahan di dalam sheet langsung ditulis ke [SearchState]; tombol
/// Terapkan hanya menutup sheet karena state sudah tersimpan.
class _FilterSheet extends StatelessWidget {
  const _FilterSheet({required this.filter, required this.onReset});

  final SearchFilter filter;
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    final store = context.read<SearchState>();

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Urutkan', style: AppTextStyles.bodySm.copyWith(color: AppColors.ink)),
        const SizedBox(height: AppSpacing.s2),
        Wrap(
          spacing: AppSpacing.s2,
          runSpacing: AppSpacing.s2,
          children: SortOption.values
              .map(
                (option) => DnChip(
                  label: option.label,
                  active: filter.sort == option,
                  onTap: () => store.setSortOption(option),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: AppSpacing.s5),
        Text(
          'Tingkat kesulitan',
          style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
        ),
        const SizedBox(height: AppSpacing.s2),
        Wrap(
          spacing: AppSpacing.s2,
          runSpacing: AppSpacing.s2,
          children: DifficultyFilter.values
              .map(
                (option) => DnChip(
                  label: option.label,
                  active: filter.difficulty == option,
                  onTap: () => store.setDifficultyFilter(option),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: AppSpacing.s5),
        Text(
          'Fasilitas',
          style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
        ),
        const SizedBox(height: AppSpacing.s2),
        Wrap(
          spacing: AppSpacing.s2,
          runSpacing: AppSpacing.s2,
          children: ['Area camping', 'Penginapan', 'Transportasi', 'Warung']
              .map(
                (option) => DnChip(
                  label: option,
                  active: filter.supports.contains(option),
                  onTap: () => store.toggleSupportFilter(option),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: AppSpacing.s5),
        Row(
          children: [
            Expanded(
              child: DnOutlineButton(
                label: 'Reset',
                height: 48,
                onPressed: onReset,
              ),
            ),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              flex: 2,
              child: DnPrimaryButton(
                label: 'Terapkan filter',
                height: 48,
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
          ],
        ),
      ],
    );
  }
}