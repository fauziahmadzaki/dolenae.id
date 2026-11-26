import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/features/categories/presentation/controllers/categories_controller.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/features/explore/presentation/controllers/explore_controller.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/search_filter.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_bottom_nav.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_bottom_sheet.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_chip.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_destination_card.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_search_field.dart';

/// Jelajah dan pencarian destinasi dalam satu halaman (Node Figma: 65:389).
///
/// Katalog dan pencarian berbagi layar. Saran muncul saat kolom cari difokuskan.
class ExploreScreen extends StatefulWidget {
  const ExploreScreen({
    super.key,
    this.initialActivity,
    this.initialQuery,
    this.onOpenFilter,
    this.hasError = false,
    this.onRetry,
    this.onResetFilter,
  });

  /// Aktivitas dari Beranda (mis. `Hiking`) yang langsung dijadikan kueri.
  final String? initialActivity;

  /// Kata kunci awal dari chip kategori Beranda.
  final String? initialQuery;

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
  static const _pageSize = 6;

  final _scrollController = ScrollController();
  bool _searchFocused = false;
  String _selectedCategory = 'Semuanya';

  /// Medan aktif dari chip Beranda; kosong berarti semua medan.
  String _terrain = '';
  int _visibleCount = _pageSize;
  int _resultCount = 0;
  String _filterSignature = '';

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    // Chip Beranda membuka Jelajah lewat `?q=Gunung`: kata kunci dicari dulu,
    // lalu difilter sebagai medan bila cocok dengan kategori terrain.
    final activity =
        (widget.initialActivity ?? widget.initialQuery)?.trim() ?? '';
    if (activity.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        final store = context.read<ExploreController>()
          ..clearSearchFilters()
          ..setSearchQuery(activity)
          ..commitSearch(activity);
        final terrain = _knownTerrain(activity);
        if (terrain != null) {
          store.setTerrain(terrain);
          setState(() => _terrain = terrain);
        } else {
          setState(() {});
        }
      });
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  /// Nama medan dari katalog bila [label] sama dengan nama kategori terrain.
  String? _knownTerrain(String label) {
    final needle = label.trim().toLowerCase();
    for (final category in context.read<CategoriesController>().items) {
      if (category.type == 'terrain' && category.name.toLowerCase() == needle) {
        return category.name;
      }
    }
    return null;
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    // `extentAfter` diukur dari posisi layar, jadi pemicunya tetap akurat
    // meskipun tinggi kartu berubah setelah data baru masuk.
    if (_scrollController.position.extentAfter < 400) {
      _loadMore();
    }
  }

  void _loadMore() {
    if (_visibleCount >= _resultCount) return;
    setState(() {
      _visibleCount = (_visibleCount + _pageSize).clamp(0, _resultCount);
    });
    _fillViewportIfNeeded();
  }

  /// Di layar tinggi, satu halaman bisa belum memenuhi viewport sehingga tidak
  /// ada scroll untuk memicu halaman berikutnya. Tambah halaman sampai layar
  /// bisa digulir atau semua hasil tampil.
  void _fillViewportIfNeeded() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_scrollController.hasClients) return;
      if (_visibleCount >= _resultCount) return;
      if (_scrollController.position.extentAfter < 400) {
        _loadMore();
      }
    });
  }

  void _resetPagination(String signature) {
    if (signature == _filterSignature) return;
    _filterSignature = signature;
    _visibleCount = _pageSize;
    // Filter/kueri baru selalu mulai dari halaman pertama.
    if (_scrollController.hasClients && _scrollController.offset > 0) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && _scrollController.hasClients) {
          _scrollController.jumpTo(0);
        }
      });
    }
  }

  static const _filterOptions = <String>[
    'Ramah Pemula',
    'Jawa Timur',
    'Jawa Barat',
    'Jawa Tengah',
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

  void _onChanged(String value, ExploreController store) {
    store.setSearchQuery(value);
    setState(() {});
  }

  void _clear(ExploreController store) {
    store.setSearchQuery('');
    setState(() {});
  }

  void _commit(String value, ExploreController store) {
    store.commitSearch(value);
    setState(() {});
  }

  Future<void> _openFilter(ExploreController store) async {
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
          _selectedCategory = 'Semuanya';
          Navigator.of(sheetContext).pop();
          setState(() {
            _selectedCategory = 'Semuanya';
            _terrain = '';
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<ExploreController>();
    final catalog = context.watch<DestinationsController>().items;
    final hasQuery = store.hasActiveQuery;
    final showSuggestions =
        _searchFocused &&
        !hasQuery &&
        !store.searchFilter.isFiltered &&
        _selectedCategory == 'Semuanya';
    final results = _byCategory(store.resultsFor(catalog));
    final signature = [
      store.searchFilter.query,
      store.searchFilter.categoryId,
      store.searchFilter.categoryLabel,
      store.searchFilter.terrain,
      store.searchFilter.sort.name,
      store.searchFilter.difficulty.name,
      store.searchFilter.supports.join(','),
      store.searchFilter.verifiedOnly,
      _selectedCategory,
    ].join('|');
    _resetPagination(signature);
    _resultCount = results.length;
    final visible = results.take(_visibleCount).toList(growable: false);

    if (results.isNotEmpty) {
      _fillViewportIfNeeded();
    }

    return Scaffold(
      appBar: const DnAppBar(title: 'Jelajahi'),
      body: Column(
        children: [
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                await Future.wait([
                  context.read<DestinationsController>().refresh(),
                  context.read<CategoriesController>().load(refresh: true),
                ]);
              },
              child: CustomScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverToBoxAdapter(
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
                          child: Focus(
                            onFocusChange: (focused) {
                              if (mounted) {
                                setState(() => _searchFocused = focused);
                              }
                            },
                            child: DnSearchField(
                              hint: 'Cari destinasi, gunung, atau aktivitas',
                              value: store.searchFilter.query,
                              focused: _searchFocused || hasQuery,
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
                                        borderRadius: BorderRadius.circular(
                                          AppRadius.md,
                                        ),
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
                        ),
                        _buildCategoryFilters(store),
                      ],
                    ),
                  ),
                  if (widget.hasError)
                    SliverToBoxAdapter(
                      child: _LoadError(
                        onRetry: widget.onRetry,
                        onResetFilter:
                            widget.onResetFilter ??
                            () {
                              final current = context.read<ExploreController>();
                              current.clearSearchFilters();
                              _selectedCategory = 'Semuanya';
                              setState(() {});
                            },
                      ),
                    )
                  else if (showSuggestions)
                    SliverToBoxAdapter(
                      child: _RecommendationPanels(
                        store: store,
                        suggested: catalog.take(3).toList(),
                        onPick: (value) {
                          _onChanged(value, store);
                          _commit(value, store);
                        },
                      ),
                    )
                  else if (results.isEmpty)
                    SliverToBoxAdapter(
                      child: _EmptyResults(
                        query: store.searchFilter.query,
                        popular: store.popularSearches,
                        onPick: (value) => _onChanged(value, store),
                      ),
                    )
                  else ...[
                    if (hasQuery) SliverToBoxAdapter(child: _buildFilters()),
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.s4,
                          AppSpacing.s3,
                          AppSpacing.s4,
                          0,
                        ),
                        child: hasQuery
                            ? Text(
                                '${results.length} hasil · '
                                'Urutkan: ${store.searchFilter.sortLabel}',
                                style: AppTextStyles.caption,
                              )
                            : Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${results.length} destinasi',
                                    style: AppTextStyles.caption,
                                  ),
                                  InkWell(
                                    onTap: () => _openFilter(store),
                                    borderRadius: BorderRadius.circular(
                                      AppRadius.sm,
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 4,
                                        vertical: 2,
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            'Urutkan: '
                                            '${store.searchFilter.sortShortLabel}',
                                            style: AppTextStyles.caption,
                                          ),
                                          const SizedBox(width: 2),
                                          const Icon(
                                            AppIcons.chevronDown,
                                            size: 14,
                                            color: AppColors.body,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ),
                    const SliverToBoxAdapter(
                      child: SizedBox(height: AppSpacing.s3),
                    ),
                    SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final destination = visible[index];
                        return Padding(
                          padding: const EdgeInsets.fromLTRB(
                            AppSpacing.s4,
                            0,
                            AppSpacing.s4,
                            AppSpacing.s3,
                          ),
                          child: DnDestinationListTile(
                            key: ValueKey('explore-card-${destination.id}'),
                            destination: destination,
                            compact: hasQuery,
                            onTap: () =>
                                context.push('/destination/${destination.id}'),
                          ),
                        );
                      }, childCount: visible.length),
                    ),
                  ],
                  const SliverToBoxAdapter(
                    child: SizedBox(height: AppSpacing.s4),
                  ),
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

  Widget _buildCategoryFilters(ExploreController store) {
    final items = context.watch<CategoriesController>().items;
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.s3),
      child: SizedBox(
        height: 32,
        child: ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
          children: [
            DnChip(
              label: 'Semuanya',
              active:
                  store.searchFilter.categoryId.isEmpty &&
                  _terrain.isEmpty &&
                  _selectedCategory == 'Semuanya',
              onTap: () {
                store
                  ..setCategoryId('')
                  ..setTerrain('');
                setState(() {
                  _selectedCategory = 'Semuanya';
                  _terrain = '';
                });
              },
            ),
            if (!store.hasActiveQuery)
              Padding(
                padding: const EdgeInsets.only(left: AppSpacing.s2),
                child: DnChip(
                  label: 'Ramah Pemula',
                  active: _selectedCategory == 'Ramah Pemula',
                  onTap: () {
                    store
                      ..setCategoryId('')
                      ..setTerrain('');
                    setState(() {
                      _selectedCategory = 'Ramah Pemula';
                      _terrain = '';
                    });
                  },
                ),
              ),
            for (final item in items)
              Padding(
                padding: const EdgeInsets.only(left: AppSpacing.s2),
                child: DnChip(
                  label: item.name,
                  // Chip terrain (Gunung, Bukit, …) memfilter lewat nama medan
                  // karena `?q=` hanya membawa nama; kategori lain lewat ID.
                  active: item.type == 'terrain'
                      ? _terrain.toLowerCase() == item.name.toLowerCase()
                      : item.id.isNotEmpty &&
                            store.searchFilter.categoryId == item.id,
                  onTap: item.id.isEmpty && item.type != 'terrain'
                      ? null
                      : () {
                          final isTerrain = item.type == 'terrain';
                          final selected = isTerrain
                              ? _terrain.toLowerCase() ==
                                    item.name.toLowerCase()
                              : store.searchFilter.categoryId == item.id;
                          if (isTerrain) {
                            store
                              ..setCategoryId('')
                              ..setTerrain(selected ? '' : item.name);
                          } else {
                            store
                              ..setTerrain('')
                              ..setCategoryId(
                                selected ? '' : item.id,
                                label: selected ? '' : item.name,
                              );
                          }
                          setState(() {
                            _selectedCategory = 'Semuanya';
                            _terrain = isTerrain && !selected ? item.name : '';
                          });
                        },
                ),
              ),
          ],
        ),
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
            body:
                'Daftar destinasi tidak terbaca. Muat ulang, atau reset '
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
  const _RecommendationPanels({
    required this.store,
    required this.suggested,
    required this.onPick,
  });

  final ExploreController store;
  final List<Destination> suggested;
  final ValueChanged<String> onPick;

  @override
  Widget build(BuildContext context) {
    final history = store.searchHistory;

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
                    const Icon(AppIcons.clock, size: 16, color: AppColors.body),
                    const SizedBox(width: AppSpacing.s3),
                    Expanded(child: Text(item, style: AppTextStyles.bodySm)),
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
                style: AppTextStyles.labelSm.copyWith(color: AppColors.primary),
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
            children: store.popularSearches
                .map((item) => DnChip(label: item, onTap: () => onPick(item)))
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
            child: DnDestinationCard(
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
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.s5,
            vertical: AppSpacing.s6,
          ),
          child: DnEmptyState(
            variant: DnEmptyVariant.tanpaHasil,
            title: 'Tidak ada hasil',
            body: query.trim().isEmpty
                ? 'Tidak ada destinasi yang cocok. Coba kata kunci populer:'
                : 'Tidak ada destinasi untuk "${query.trim()}". '
                      'Coba kata kunci populer:',
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
/// Perubahan di dalam sheet langsung ditulis ke [ExploreController]; tombol
/// Terapkan hanya menutup sheet karena state sudah tersimpan.
class _FilterSheet extends StatelessWidget {
  const _FilterSheet({required this.filter, required this.onReset});

  final SearchFilter filter;
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    final store = context.watch<ExploreController>();
    final filter = store.searchFilter;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Urutkan',
          style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
        ),
        const SizedBox(height: AppSpacing.s2),
        Column(
          children: SortOption.values.map((option) {
            final active = filter.sort == option;
            return Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.s2),
              child: InkWell(
                onTap: () => store.setSortOption(option),
                borderRadius: BorderRadius.circular(AppRadius.lg),
                child: Container(
                  height: 44,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.s3,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.canvasSubtle,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: Border.all(
                      color: active ? AppColors.primary : AppColors.hairline,
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          option.label,
                          style: AppTextStyles.labelSm.copyWith(
                            color: active ? AppColors.ink : AppColors.body,
                            fontWeight: active
                                ? FontWeight.w600
                                : FontWeight.w500,
                          ),
                        ),
                      ),
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: active ? AppColors.primary : AppColors.canvas,
                          border: Border.all(
                            color: active
                                ? AppColors.primary
                                : AppColors.borderStrong,
                          ),
                        ),
                        child: active
                            ? const Icon(
                                AppIcons.check,
                                size: 12,
                                color: AppColors.onPrimary,
                              )
                            : null,
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: AppSpacing.s4),
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
          children: ['Area camping', 'Parkir', 'Warung']
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
