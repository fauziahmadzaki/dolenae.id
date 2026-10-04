import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_shadows.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/checklist_item.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';

/// Layar Checklist Persiapan (Node Figma: 68:1036).
///
/// Menyajikan progress kesiapan perlengkapan, kesehatan, konservasi,
/// dan administrasi perjalanan dengan fitur checklist interaktif.
class ChecklistScreen extends StatefulWidget {
  const ChecklistScreen({
    super.key,
    this.destinationName = 'Gunung Bromo',
    this.initialItems = SeedData.defaultChecklistItems,
    this.onAddItem,
    this.onMarkReady,
    this.onBack,
  });

  final String destinationName;
  final List<ChecklistItem> initialItems;
  final VoidCallback? onAddItem;
  final VoidCallback? onMarkReady;
  final VoidCallback? onBack;

  @override
  State<ChecklistScreen> createState() => _ChecklistScreenState();
}

class _ChecklistScreenState extends State<ChecklistScreen> {
  late List<ChecklistItem> _items;
  ChecklistCategory? _selectedCategory; // null = Semua

  @override
  void initState() {
    super.initState();
    _items = List.from(widget.initialItems);
  }

  void _toggleItem(String id) {
    setState(() {
      _items = _items.map((item) {
        if (item.id == id) {
          return item.copyWith(isCompleted: !item.isCompleted);
        }
        return item;
      }).toList();
    });
  }

  int get _completedCount => _items.where((i) => i.isCompleted).length;
  int get _totalCount => _items.length;
  double get _progress => _totalCount > 0 ? _completedCount / _totalCount : 0.0;

  @override
  Widget build(BuildContext context) {
    final filteredItems = _selectedCategory == null
        ? _items
        : _items.where((i) => i.category == _selectedCategory).toList();

    // Grouping by category
    final grouped = <ChecklistCategory, List<ChecklistItem>>{};
    for (final item in filteredItems) {
      grouped.putIfAbsent(item.category, () => []).add(item);
    }

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Checklist Persiapan',
        showBack: true,
        onBack: widget.onBack ?? () {
          if (Navigator.of(context).canPop()) {
            context.pop();
          } else {
            context.go('/plan');
          }
        },
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.s4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildProgressCard(),
                    const SizedBox(height: AppSpacing.s4),
                    _buildCategoryFilterTabs(),
                    const SizedBox(height: AppSpacing.s4),
                    for (final entry in grouped.entries) ...[
                      _buildCategoryGroup(entry.key, entry.value),
                      const SizedBox(height: AppSpacing.s4),
                    ],
                    _buildAddItemButton(context),
                    const SizedBox(height: AppSpacing.s6),
                  ],
                ),
              ),
            ),
            _buildBottomCta(context),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressCard() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: AppColors.hairline),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                widget.destinationName,
                style: AppTextStyles.label.copyWith(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.ink,
                ),
              ),
              Text(
                '$_completedCount/$_totalCount siap',
                style: AppTextStyles.label.copyWith(
                  color: AppColors.accent,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            child: LinearProgressIndicator(
              value: _progress,
              minHeight: 8,
              backgroundColor: AppColors.canvas,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '$_completedCount dari $_totalCount item selesai',
            style: AppTextStyles.overline.copyWith(color: AppColors.body),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryFilterTabs() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildFilterChip(
            label: 'Semua',
            isSelected: _selectedCategory == null,
            onTap: () => setState(() => _selectedCategory = null),
          ),
          const SizedBox(width: 8),
          _buildFilterChip(
            label: 'Perlengkapan',
            isSelected: _selectedCategory == ChecklistCategory.perlengkapan,
            onTap: () => setState(() => _selectedCategory = ChecklistCategory.perlengkapan),
          ),
          const SizedBox(width: 8),
          _buildFilterChip(
            label: 'Kesehatan',
            isSelected: _selectedCategory == ChecklistCategory.kesehatan,
            onTap: () => setState(() => _selectedCategory = ChecklistCategory.kesehatan),
          ),
          const SizedBox(width: 8),
          _buildFilterChip(
            label: 'Konservasi',
            isSelected: _selectedCategory == ChecklistCategory.konservasi,
            onTap: () => setState(() => _selectedCategory = ChecklistCategory.konservasi),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Material(
      color: isSelected ? AppColors.primary : AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.pill),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.hairline,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              color: isSelected ? AppColors.onPrimary : AppColors.body,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryGroup(ChecklistCategory category, List<ChecklistItem> items) {
    final title = switch (category) {
      ChecklistCategory.perlengkapan => 'PERLENGKAPAN',
      ChecklistCategory.kesehatan => 'KESEHATAN',
      ChecklistCategory.konservasi => 'KONSERVASI',
      ChecklistCategory.administrasi => 'ADMINISTRASI',
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTextStyles.overline.copyWith(
            color: AppColors.body,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Column(
            children: [
              for (int i = 0; i < items.length; i++) ...[
                _buildItemRow(items[i]),
                if (i < items.length - 1)
                  const Divider(height: 1, color: AppColors.hairline),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildItemRow(ChecklistItem item) {
    return InkWell(
      onTap: () => _toggleItem(item.id),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.s3),
        child: Row(
          children: [
            // Checkbox kotak rounded
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(6),
                color: item.isCompleted ? AppColors.primary : Colors.transparent,
                border: Border.all(
                  color: item.isCompleted ? AppColors.primary : AppColors.borderStrong,
                  width: 1.5,
                ),
              ),
              alignment: Alignment.center,
              child: item.isCompleted
                  ? const Icon(
                      AppIcons.check,
                      size: 14,
                      color: AppColors.onPrimary,
                    )
                  : null,
            ),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: item.isCompleted ? AppColors.body : AppColors.ink,
                      decoration: item.isCompleted
                          ? TextDecoration.lineThrough
                          : TextDecoration.none,
                    ),
                  ),
                  if (item.note != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      item.note!,
                      style: AppTextStyles.caption.copyWith(fontSize: 11),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: item.isRequired ? const Color(0xFFFBEEDB) : AppColors.canvas,
                borderRadius: BorderRadius.circular(AppRadius.pill),
                border: Border.all(color: AppColors.hairline),
              ),
              child: Text(
                item.isRequired ? 'Wajib' : 'Opsional',
                style: AppTextStyles.overline.copyWith(
                  fontSize: 10,
                  color: item.isRequired ? AppColors.warning : AppColors.body,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddItemButton(BuildContext context) {
    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: widget.onAddItem ?? () => context.push('/checklist/add'),
        child: Container(
          height: 48,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(AppIcons.plus, size: 16, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Tambah item',
                style: AppTextStyles.label.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomCta(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: const BoxDecoration(
        color: AppColors.canvas,
        border: Border(
          top: BorderSide(color: AppColors.hairline),
        ),
      ),
      child: DnPrimaryButton(
        label: 'Tandai siap',
        icon: AppIcons.squareCheck,
        height: 48,
        onPressed: widget.onMarkReady ?? () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Kesiapan checklist tersimpan!'),
              backgroundColor: AppColors.success,
            ),
          );
        },
      ),
    );
  }
}
