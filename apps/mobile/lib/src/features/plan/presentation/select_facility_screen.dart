import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_shadows.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/travel_support.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_icon_circle.dart';

/// Layar Pilih Fasilitas (Node Figma: 84:1280).
///
/// Memungkinkan wisatawan memilih fasilitas pendukung perjalanan
/// seperti penginapan, transportasi, atau tempat makan untuk rencana trip.
class SelectFacilityScreen extends StatefulWidget {
  const SelectFacilityScreen({
    super.key,
    this.initialSelectedIds = const {'sup-homestay'},
    this.initialCategory = SupportCategory.penginapan,
    this.onConfirm,
    this.onBack,
  });

  final Set<String> initialSelectedIds;
  final SupportCategory initialCategory;
  final ValueChanged<Set<String>>? onConfirm;
  final VoidCallback? onBack;

  @override
  State<SelectFacilityScreen> createState() => _SelectFacilityScreenState();
}

class _SelectFacilityScreenState extends State<SelectFacilityScreen> {
  late final Set<String> _selectedIds;
  late SupportCategory _activeCategory;

  @override
  void initState() {
    super.initState();
    _selectedIds = Set.from(widget.initialSelectedIds);
    _activeCategory = widget.initialCategory;
  }

  void _toggleFacility(String id) {
    setState(() {
      if (_selectedIds.contains(id)) {
        _selectedIds.remove(id);
      } else {
        _selectedIds.add(id);
      }
    });
  }

  void _handleConfirm() {
    if (widget.onConfirm != null) {
      widget.onConfirm!(_selectedIds);
    } else {
      if (Navigator.of(context).canPop()) {
        context.pop(_selectedIds);
      } else {
        context.go('/plan');
      }
    }
  }

  IconData _getCategoryIcon(SupportCategory category) {
    return switch (category) {
      SupportCategory.penginapan => AppIcons.bedDouble,
      SupportCategory.transportasi => AppIcons.car,
      SupportCategory.makanan => AppIcons.utensils,
    };
  }

  @override
  Widget build(BuildContext context) {
    final filtered = SeedData.supports.where((s) {
      return s.category == _activeCategory;
    }).toList();

    // Jika kategori tidak memiliki item spesifik di filter, tampilkan semua fasilitas
    final displayItems = filtered.isNotEmpty ? filtered : SeedData.supports;

    final ctaLabel = _selectedIds.isEmpty
        ? 'Pilih fasilitas'
        : 'Tambahkan ${_selectedIds.length} fasilitas';

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Pilih fasilitas',
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
                    _buildSegmentedControl(),
                    const SizedBox(height: AppSpacing.s4),
                    for (int i = 0; i < displayItems.length; i++) ...[
                      _buildFacilityRow(displayItems[i]),
                      if (i < displayItems.length - 1) const SizedBox(height: AppSpacing.s3),
                    ],
                    const SizedBox(height: AppSpacing.s4),
                  ],
                ),
              ),
            ),
            _buildBottomAction(ctaLabel),
          ],
        ),
      ),
    );
  }

  Widget _buildSegmentedControl() {
    return Container(
      height: 44,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(
        children: [
          _buildSegmentTab(
            label: 'Penginapan',
            category: SupportCategory.penginapan,
          ),
          const SizedBox(width: 4),
          _buildSegmentTab(
            label: 'Transport',
            category: SupportCategory.transportasi,
          ),
          const SizedBox(width: 4),
          _buildSegmentTab(
            label: 'Makanan',
            category: SupportCategory.makanan,
          ),
        ],
      ),
    );
  }

  Widget _buildSegmentTab({
    required String label,
    required SupportCategory category,
  }) {
    final isActive = _activeCategory == category;

    return Expanded(
      child: Material(
        color: isActive ? AppColors.primary : Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.pill),
          onTap: () => setState(() => _activeCategory = category),
          child: Container(
            alignment: Alignment.center,
            child: Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                color: isActive ? AppColors.onPrimary : AppColors.body,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFacilityRow(TravelSupport item) {
    final isSelected = _selectedIds.contains(item.id);

    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: () => _toggleFacility(item.id),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.s3),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.hairline,
              width: isSelected ? 2.0 : 1.0,
            ),
            boxShadow: AppShadows.sm,
          ),
          child: Row(
            children: [
              DnIconCircle(
                icon: _getCategoryIcon(item.category),
                size: 36,
                iconSize: 18,
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: AppTextStyles.label.copyWith(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${item.priceLabel} · ${item.locationLabel}',
                      style: AppTextStyles.caption.copyWith(color: AppColors.body),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.s2),
              // Selection Indicator (Checkbox rounded square)
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  color: isSelected ? AppColors.primary : Colors.transparent,
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.borderStrong,
                    width: 1.5,
                  ),
                ),
                alignment: Alignment.center,
                child: isSelected
                    ? const Icon(
                        AppIcons.check,
                        size: 16,
                        color: AppColors.onPrimary,
                      )
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomAction(String ctaLabel) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s1,
        AppSpacing.s4,
        AppSpacing.s6,
      ),
      child: DnPrimaryButton(
        label: ctaLabel,
        height: 48,
        onPressed: _selectedIds.isEmpty ? null : _handleConfirm,
      ),
    );
  }
}
