import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/features/categories/domain/entities/category.dart';
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
    this.initialTerrain,
    this.initialCategoryId,
    this.initialCategoryLabel,
    this.initialTag,
    this.initialActivity,
    this.initialQuery,
    this.resetOnEmptyParams = false,
    this.onOpenFilter,
    this.hasError = false,
    this.onRetry,
    this.onResetFilter,
  });

  /// Medan terstruktur dari chip Beranda atau tile aktivitas (mis. `Gunung`).
  final String? initialTerrain;

  /// ID kategori terstruktur dari rute `/explore?categoryId=...`.
  final String? initialCategoryId;

  /// Label kategori terstruktur dari rute `/explore?category=...`.
  final String? initialCategoryLabel;

  /// Tag aktivitas terstruktur dari rute `/explore?tag=...` (mis. `sunrise`).
  final String? initialTag;

  /// Aktivitas terstruktur dari rute `/explore?activity=...`.
  final String? initialActivity;

  /// Kata kunci teks bebas dari rute `/explore?q=...`.
  final String? initialQuery;

  /// Mereset filter dan kueri lama saat rute `/explore` dibuka tanpa parameter.
  final bool resetOnEmptyParams;

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
  static const _provinceOptions = <String>[
    'Jawa Timur',
    'Jawa Barat',
    'Jawa Tengah',
  ];
  static const _fallbackTerrainNames = <String>{
    'gunung',
    'bukit',
    'danau',
    'air terjun',
    'hutan',
    'pantai',
    'savana',
  };

  final _scrollController = ScrollController();
  bool _searchFocused = false;
  int _visibleCount = _pageSize;
  int _resultCount = 0;
  String _filterSignature = '';

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _applyInitialParams();
    });
  }

  @override
  void didUpdateWidget(covariant ExploreScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    final changed =
        oldWidget.initialTerrain != widget.initialTerrain ||
        oldWidget.initialCategoryId != widget.initialCategoryId ||
        oldWidget.initialCategoryLabel != widget.initialCategoryLabel ||
        oldWidget.initialTag != widget.initialTag ||
        oldWidget.initialActivity != widget.initialActivity ||
        oldWidget.initialQuery != widget.initialQuery ||
        oldWidget.resetOnEmptyParams != widget.resetOnEmptyParams;
    if (changed) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        _applyInitialParams();
      });
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _applyInitialParams() {
    final terrain = SearchFilter.sanitizeStructuredValue(widget.initialTerrain);
    final categoryId = SearchFilter.sanitizeStructuredValue(
      widget.initialCategoryId,
    );
    final categoryLabel = SearchFilter.sanitizeStructuredValue(
      widget.initialCategoryLabel,
    );
    final tag = SearchFilter.sanitizeStructuredValue(widget.initialTag);
    final activity = SearchFilter.sanitizeStructuredValue(
      widget.initialActivity,
    );
    final rawQuery = SearchFilter.sanitizeRouteText(widget.initialQuery);
    final query = SearchFilter.normalizeToken(rawQuery).isEmpty ? '' : rawQuery;

    final hasFastFilterParam =
        terrain.isNotEmpty ||
        categoryId.isNotEmpty ||
        categoryLabel.isNotEmpty ||
        tag.isNotEmpty ||
        activity.isNotEmpty;

    if (!hasFastFilterParam && query.isEmpty) {
      if (widget.resetOnEmptyParams && !widget.hasError) {
        context.read<ExploreController>().resetAll();
      }
      return;
    }

    final store = context.read<ExploreController>();
    final categories = context.read<CategoriesController>().items;

    if (hasFastFilterParam) {
      store.resetAll();

      if (terrain.isNotEmpty) {
        final matched = _matchCategory(categories, terrain, type: 'terrain');
        final verifiedCategoryId =
            (matched != null &&
                matched.id.isNotEmpty &&
                (categoryId.isEmpty || categoryId == matched.id))
            ? matched.id
            : '';
        store.setTerrain(
          matched?.name ?? _canonicalTagLabel(terrain),
          categoryId: verifiedCategoryId,
        );
      } else if (categoryId.isNotEmpty || categoryLabel.isNotEmpty) {
        final matched = categoryId.isNotEmpty
            ? _matchCategoryById(categories, categoryId)
            : _matchCategory(categories, categoryLabel);
        store.setCategoryId(
          categoryId.isNotEmpty ? categoryId : (matched?.id ?? ''),
          label: categoryLabel.isNotEmpty
              ? categoryLabel
              : (matched?.name ?? ''),
        );
        if (terrain.isEmpty && matched?.type == 'terrain') {
          store.setTerrain(matched!.name, categoryId: matched.id);
        } else if (categoryId.isEmpty &&
            matched == null &&
            categoryLabel.isNotEmpty) {
          store.setCategoryId('', label: _canonicalTagLabel(categoryLabel));
        }
      }

      if (tag.isNotEmpty) {
        store.setActivityTag(_canonicalTagLabel(tag));
      }

      if (activity.isNotEmpty) {
        final normalizedActivity = activity.toLowerCase();
        final matchedTerrain = _matchCategory(
          categories,
          activity,
          type: 'terrain',
        );
        if (matchedTerrain != null ||
            _fallbackTerrainNames.contains(normalizedActivity)) {
          store.setTerrain(
            matchedTerrain?.name ?? _canonicalTagLabel(activity),
            categoryId: matchedTerrain?.id ?? '',
          );
        } else if (normalizedActivity == 'camping ground') {
          final matchedActivity = _matchCategory(categories, activity);
          if (matchedActivity != null && matchedActivity.id.isNotEmpty) {
            store.setCategoryId(
              matchedActivity.id,
              label: matchedActivity.name,
            );
          } else {
            store.setActivityTag('Camping Ground');
          }
        } else {
          store.setActivityTag(_canonicalTagLabel(activity));
        }
      }
      if (query.isNotEmpty) store.setSearchQuery(query);
      return;
    }

    store
      ..clearSearchFilters()
      ..setSearchQuery(query);
  }

  Category? _matchCategory(List<Category> items, String name, {String? type}) {
    final needle = name.trim().toLowerCase();
    for (final category in items) {
      if (type != null && category.type != type) continue;
      if (category.name.trim().toLowerCase() == needle) return category;
    }
    return null;
  }

  Category? _matchCategoryById(List<Category> items, String id) {
    for (final category in items) {
      if (category.id == id) return category;
    }
    return null;
  }

  static String _canonicalTagLabel(String raw) {
    final trimmed = raw.trim();
    if (trimmed.isEmpty) return '';
    return switch (trimmed.toLowerCase()) {
      'sunrise' => 'Sunrise',
      'camping' => 'Camping',
      'camping ground' => 'Camping Ground',
      'air terjun' => 'Air Terjun',
      'bukit' => 'Bukit',
      'danau' => 'Danau',
      'hutan' => 'Hutan',
      'pantai' => 'Pantai',
      'hiking' => 'Hiking',
      'gunung' => 'Gunung',
      'savana' => 'Savana',
      _ => trimmed,
    };
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
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
    if (_scrollController.hasClients && _scrollController.offset > 0) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && _scrollController.hasClients) {
          _scrollController.jumpTo(0);
        }
      });
    }
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
          Navigator.of(sheetContext).pop();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<ExploreController>();
    final catalog = context.watch<DestinationsController>().items;
    final filter = store.searchFilter;
    final hasQuery = filter.hasQuery;
    final isFiltered = filter.isFiltered;
    final filterCount = filter.activeFilterCount;
    final showSuggestions = _searchFocused && !hasQuery && !isFiltered;
    final results = store.resultsFor(catalog);
    final signature = [
      filter.query,
      filter.categoryId,
      filter.categoryLabel,
      filter.terrain,
      filter.activityTag,
      filter.province,
      filter.sort.name,
      filter.difficulty.name,
      filter.supports.join(','),
      filter.verifiedOnly,
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
                          child: Row(
                            children: [
                              Expanded(
                                child: Semantics(
                                  label: 'Kolom pencarian destinasi',
                                  child: Focus(
                                    onFocusChange: (focused) {
                                      if (mounted) {
                                        setState(
                                          () => _searchFocused = focused,
                                        );
                                      }
                                    },
                                    child: DnSearchField(
                                      hint: 'Cari destinasi, gunung, atau aktivitas',
                                      value: filter.query,
                                      focused: _searchFocused || hasQuery,
                                      trailing: hasQuery
                                          ? IconButton(
                                              onPressed: store.clearSearchQuery,
                                              tooltip:
                                                  'Hapus kata kunci pencarian',
                                              icon: const Icon(
                                                AppIcons.close,
                                                size: 18,
                                              ),
                                              color: AppColors.body,
                                              padding: EdgeInsets.zero,
                                              constraints:
                                                  const BoxConstraints(
                                                    minWidth: 44,
                                                    minHeight: 44,
                                                  ),
                                            )
                                          : null,
                                      onChanged: store.setSearchQuery,
                                      onSubmitted: store.commitSearch,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: AppSpacing.s2),
                              _StandaloneFilterButton(
                                activeCount: filterCount,
                                onTap: () => _openFilter(store),
                              ),
                            ],
                          ),
                        ),
                        _buildCategoryFilters(store),
                        if (isFiltered && !widget.hasError)
                          _buildActiveFilterStrip(store),
                      ],
                    ),
                  ),
                  if (widget.hasError)
                    SliverToBoxAdapter(
                      child: _LoadError(
                        onRetry: widget.onRetry,
                        onResetFilter:
                            widget.onResetFilter ?? store.clearSearchFilters,
                      ),
                    )
                  else if (showSuggestions)
                    SliverToBoxAdapter(
                      child: _RecommendationPanels(
                        store: store,
                        suggested: catalog.take(3).toList(),
                        onPick: (value) {
                          store
                            ..setSearchQuery(value)
                            ..commitSearch(value);
                        },
                      ),
                    )
                  else if (results.isEmpty)
                    SliverToBoxAdapter(
                      child: _EmptyResults(
                        query: filter.query,
                        isFiltered: isFiltered,
                        popular: store.popularSearches,
                        onPick: (value) {
                          store
                            ..setSearchQuery(value)
                            ..commitSearch(value);
                        },
                        onResetFilters: store.clearSearchFilters,
                        onClearQuery: store.clearSearchQuery,
                        onOpenFilter: () => _openFilter(store),
                      ),
                    )
                  else ...[
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.s4,
                          AppSpacing.s3,
                          AppSpacing.s4,
                          0,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                _resultSummaryText(
                                  count: results.length,
                                  filter: filter,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTextStyles.caption,
                              ),
                            ),
                            const SizedBox(width: AppSpacing.s2),
                            Semantics(
                              button: true,
                              label: 'Urutkan hasil: ${filter.sortShortLabel}',
                              child: InkWell(
                                onTap: () => _openFilter(store),
                                borderRadius: BorderRadius.circular(
                                  AppRadius.sm,
                                ),
                                child: ConstrainedBox(
                                  constraints: const BoxConstraints(
                                    minHeight: 44,
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: AppSpacing.s2,
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          'Urutkan: ${filter.sortShortLabel}',
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

  static String _resultSummaryText({
    required int count,
    required SearchFilter filter,
  }) {
    final hasQuery = filter.hasQuery;
    final isFiltered = filter.isFiltered;
    if (hasQuery && isFiltered) {
      return '$count hasil · ${filter.activeFilterCount} filter';
    }
    if (hasQuery) {
      return '$count hasil untuk "${filter.query.trim()}"';
    }
    if (isFiltered) {
      return '$count destinasi cocok';
    }
    return '$count destinasi';
  }

  Widget _buildCategoryFilters(ExploreController store) {
    final filter = store.searchFilter;
    final items = context.watch<CategoriesController>().items;
    final isBeginnerActive = filter.difficulty == DifficultyFilter.ramahPemula;
    final isSunriseActive = filter.activityTag.toLowerCase() == 'sunrise';

    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.s3),
      child: SizedBox(
        height: 44,
        child: ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
          children: [
            _semanticChip(
              label: 'Semuanya',
              active: !filter.isFiltered,
              onTap: store.clearSearchFilters,
            ),
            const SizedBox(width: AppSpacing.s2),
            _semanticChip(
              label: 'Ramah Pemula',
              active: isBeginnerActive,
              onTap: () => store.setDifficultyFilter(
                isBeginnerActive
                    ? DifficultyFilter.semua
                    : DifficultyFilter.ramahPemula,
              ),
            ),
            for (final item in items) ...[
              const SizedBox(width: AppSpacing.s2),
              _buildCatalogCategoryChip(store, filter, item),
            ],
            const SizedBox(width: AppSpacing.s2),
            _semanticChip(
              label: 'Sunrise',
              active: isSunriseActive,
              onTap: () =>
                  store.setActivityTag(isSunriseActive ? '' : 'Sunrise'),
            ),
            for (final province in _provinceOptions) ...[
              const SizedBox(width: AppSpacing.s2),
              _semanticChip(
                label: province,
                active: filter.province.toLowerCase() == province.toLowerCase(),
                onTap: () {
                  final active =
                      filter.province.toLowerCase() == province.toLowerCase();
                  store.setProvince(active ? '' : province);
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCatalogCategoryChip(
    ExploreController store,
    SearchFilter filter,
    Category item,
  ) {
    if (item.type == 'terrain') {
      if (item.id.isEmpty && item.name.toLowerCase() == 'camping') {
        final active = filter.activityTag.toLowerCase() == 'camping';
        return _semanticChip(
          label: item.name,
          active: active,
          onTap: () => store.setActivityTag(active ? '' : 'Camping'),
        );
      }
      final active = filter.terrain.toLowerCase() == item.name.toLowerCase();
      return _semanticChip(
        label: item.name,
        active: active,
        onTap: () => store.setTerrain(
          active ? '' : item.name,
          categoryId: active ? '' : item.id,
        ),
      );
    }

    final active =
        (item.id.isNotEmpty && filter.categoryId == item.id) ||
        (filter.categoryId.isEmpty &&
            (filter.categoryLabel.toLowerCase() == item.name.toLowerCase() ||
                filter.activityTag.toLowerCase() == item.name.toLowerCase()));
    return _semanticChip(
      label: item.name,
      active: active,
      onTap: () {
        if (active) {
          store.setCategoryId('');
          if (filter.activityTag.toLowerCase() == item.name.toLowerCase()) {
            store.setActivityTag('');
          }
        } else if (item.id.isNotEmpty) {
          store.setCategoryId(item.id, label: item.name);
        } else {
          store.setActivityTag(item.name);
        }
      },
    );
  }

  Widget _semanticChip({
    required String label,
    required bool active,
    required VoidCallback? onTap,
  }) {
    return Semantics(
      button: true,
      selected: active,
      label: active ? 'Filter cepat: $label, aktif' : 'Filter cepat: $label',
      child: Material(
        type: MaterialType.transparency,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 44),
            child: Center(
              child: DnChip(label: label, active: active),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActiveFilterStrip(ExploreController store) {
    final filter = store.searchFilter;
    final pills = <({String label, VoidCallback onRemove})>[
      if (filter.terrain.isNotEmpty)
        (
          label: 'Medan: ${filter.terrain}',
          onRemove: () => store.setTerrain(''),
        )
      else if (filter.categoryId.isNotEmpty || filter.categoryLabel.isNotEmpty)
        (
          label:
              'Kategori: ${filter.categoryLabel.isNotEmpty ? filter.categoryLabel : filter.categoryId}',
          onRemove: () => store.setCategoryId(''),
        ),
      if (filter.activityTag.isNotEmpty)
        (
          label: 'Aktivitas: ${filter.activityTag}',
          onRemove: () => store.setActivityTag(''),
        ),
      if (filter.difficulty != DifficultyFilter.semua)
        (
          label: 'Kesulitan: ${filter.difficultyLabel}',
          onRemove: () => store.setDifficultyFilter(DifficultyFilter.semua),
        ),
      if (filter.province.isNotEmpty)
        (
          label: 'Provinsi: ${filter.province}',
          onRemove: () => store.setProvince(''),
        ),
      for (final support in filter.supports)
        (
          label: 'Fasilitas: $support',
          onRemove: () => store.toggleSupportFilter(support),
        ),
      if (filter.verifiedOnly)
        (label: 'Terverifikasi', onRemove: () => store.setVerifiedOnly(false)),
      if (filter.sort != SortOption.populer)
        (
          label: 'Urutkan: ${filter.sortShortLabel}',
          onRemove: () => store.setSortOption(SortOption.populer),
        ),
    ];

    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.s2),
      child: SizedBox(
        height: 44,
        child: ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
          children: [
            for (final pill in pills) ...[
              Center(
                child: _ActiveFilterPill(
                  label: pill.label,
                  onRemove: pill.onRemove,
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
            ],
            Center(
              child: Semantics(
                button: true,
                label: 'Reset semua filter',
                child: InkWell(
                  onTap: store.clearSearchFilters,
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(minHeight: 44),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.s2,
                      ),
                      child: Center(
                        child: Text(
                          'Reset filter',
                          style: AppTextStyles.labelSm.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StandaloneFilterButton extends StatelessWidget {
  const _StandaloneFilterButton({
    required this.activeCount,
    required this.onTap,
  });

  final int activeCount;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isFiltered = activeCount > 0;
    return Semantics(
      button: true,
      label: isFiltered
          ? 'Filter dan urutkan, $activeCount aktif'
          : 'Filter dan urutkan',
      child: Material(
        color: isFiltered ? AppColors.primary : AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(
                color: isFiltered ? AppColors.primary : AppColors.hairline,
              ),
            ),
            child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                Icon(
                  AppIcons.slidersHorizontal,
                  size: 18,
                  color: isFiltered ? AppColors.onPrimary : AppColors.body,
                ),
                if (activeCount > 0)
                  Positioned(
                    top: 4,
                    right: 4,
                    child: Container(
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        activeCount > 9 ? '9+' : '$activeCount',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onAccent,
                          height: 1,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ActiveFilterPill extends StatelessWidget {
  const _ActiveFilterPill({required this.label, required this.onRemove});

  final String label;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'Hapus filter $label',
      child: Material(
        type: MaterialType.transparency,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: InkWell(
          onTap: onRemove,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 44),
            child: Center(
              child: Container(
                height: 30,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                  border: Border.all(color: AppColors.borderStrong),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      label,
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.s1),
                    const Icon(
                      AppIcons.close,
                      size: 14,
                      color: AppColors.body,
                    ),
                  ],
                ),
              ),
            ),
          ),
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

/// State kosong: tidak ada destinasi yang cocok dengan pencarian atau filter.
class _EmptyResults extends StatelessWidget {
  const _EmptyResults({
    required this.query,
    required this.isFiltered,
    required this.popular,
    required this.onPick,
    required this.onResetFilters,
    required this.onClearQuery,
    required this.onOpenFilter,
  });

  final String query;
  final bool isFiltered;
  final List<String> popular;
  final ValueChanged<String> onPick;
  final VoidCallback onResetFilters;
  final VoidCallback onClearQuery;
  final VoidCallback onOpenFilter;

  @override
  Widget build(BuildContext context) {
    final trimmedQuery = query.trim();
    final hasQuery = trimmedQuery.isNotEmpty;

    final body = switch ((hasQuery, isFiltered)) {
      (true, true) =>
        'Tidak ada destinasi untuk "$trimmedQuery" dengan filter aktif.',
      (true, false) =>
        'Tidak ada destinasi untuk "$trimmedQuery". Coba kata kunci populer:',
      (false, false) => 'Belum ada destinasi tersedia di katalog.',
      (false, true) => 'Tidak ada destinasi yang cocok dengan filter aktif.',
    };

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
            body: body,
          ),
        ),
        if (hasQuery && !isFiltered) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
            child: Wrap(
              spacing: AppSpacing.s2,
              runSpacing: AppSpacing.s2,
              alignment: WrapAlignment.center,
              children: popular
                  .map((item) => DnChip(label: item, onTap: () => onPick(item)))
                  .toList(),
            ),
          ),
          const SizedBox(height: AppSpacing.s3),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s5),
            child: DnGhostButton(
              label: 'Hapus pencarian',
              onPressed: onClearQuery,
            ),
          ),
        ] else if (!hasQuery && isFiltered) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s5),
            child: Column(
              children: [
                DnPrimaryButton(
                  label: 'Reset filter',
                  onPressed: onResetFilters,
                ),
                const SizedBox(height: AppSpacing.s2),
                DnGhostButton(label: 'Ubah filter', onPressed: onOpenFilter),
              ],
            ),
          ),
        ] else if (hasQuery && isFiltered) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s5),
            child: Column(
              children: [
                DnPrimaryButton(
                  label: 'Reset filter',
                  onPressed: onResetFilters,
                ),
                const SizedBox(height: AppSpacing.s2),
                DnOutlineButton(
                  label: 'Hapus pencarian',
                  onPressed: onClearQuery,
                ),
              ],
            ),
          ),
        ],
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
          runSpacing: 0,
          children: DifficultyFilter.values
              .map(
                (option) => _SheetChipTarget(
                  label: option.label,
                  active: filter.difficulty == option,
                  onTap: () => store.setDifficultyFilter(option),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: AppSpacing.s4),
        Text(
          'Fasilitas',
          style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
        ),
        const SizedBox(height: AppSpacing.s2),
        Wrap(
          spacing: AppSpacing.s2,
          runSpacing: 0,
          children: ['Area camping', 'Parkir', 'Warung']
              .map(
                (option) => _SheetChipTarget(
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

class _SheetChipTarget extends StatelessWidget {
  const _SheetChipTarget({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 44),
          child: Center(
            widthFactor: 1,
            child: DnChip(label: label, active: active),
          ),
        ),
      ),
    );
  }
}
