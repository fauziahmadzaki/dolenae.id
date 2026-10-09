import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_shadows.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/destination.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_icon_circle.dart';

/// Layar Pilih Destinasi (Node Figma: 84:1221).
///
/// Memungkinkan wisatawan mencari dan memilih multi-destinasi
/// untuk dimasukkan ke dalam rencana perjalanan.
class SelectDestinationScreen extends StatefulWidget {
  const SelectDestinationScreen({
    super.key,
    this.initialSelectedIds = const {'dest-bromo', 'dest-prau'},
    this.onConfirm,
    this.onBack,
  });

  final Set<String> initialSelectedIds;
  final ValueChanged<Set<String>>? onConfirm;
  final VoidCallback? onBack;

  @override
  State<SelectDestinationScreen> createState() => _SelectDestinationScreenState();
}

class _SelectDestinationScreenState extends State<SelectDestinationScreen> {
  late final Set<String> _selectedIds;
  final TextEditingController _searchController = TextEditingController();
  String _query = '';

  @override
  void initState() {
    super.initState();
    _selectedIds = Set.from(widget.initialSelectedIds);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _toggleDestination(String id) {
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
      if (context.canPop()) {
        context.pop(_selectedIds);
      } else {
        context.go('/plan');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = SeedData.destinations.where((d) {
      if (_query.isEmpty) return true;
      return d.name.toLowerCase().contains(_query.toLowerCase()) ||
          d.regency.toLowerCase().contains(_query.toLowerCase());
    }).toList();

    final ctaLabel = _selectedIds.isEmpty
        ? 'Pilih destinasi'
        : 'Tambahkan ${_selectedIds.length} destinasi';

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Pilih destinasi',
        showBack: true,
        onBack: widget.onBack ?? () {
          if (context.canPop()) {
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
                    _buildSearchField(),
                    const SizedBox(height: AppSpacing.s3),
                    for (int i = 0; i < filtered.length; i++) ...[
                      _buildSelectableRow(filtered[i]),
                      if (i < filtered.length - 1) const SizedBox(height: AppSpacing.s3),
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

  Widget _buildSearchField() {
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(
        children: [
          const Icon(AppIcons.search, size: 18, color: AppColors.body),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _query = val),
              style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
              decoration: const InputDecoration(
                isDense: true,
                border: InputBorder.none,
                contentPadding: EdgeInsets.zero,
                hintText: 'Cari destinasi...',
                hintStyle: TextStyle(color: AppColors.body, fontSize: 14),
              ),
            ),
          ),
          if (_query.isNotEmpty)
            InkWell(
              onTap: () {
                _searchController.clear();
                setState(() => _query = '');
              },
              child: const Icon(AppIcons.close, size: 16, color: AppColors.body),
            ),
        ],
      ),
    );
  }

  Widget _buildSelectableRow(Destination destination) {
    final isSelected = _selectedIds.contains(destination.id);

    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: () => _toggleDestination(destination.id),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.s3),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.hairline,
              width: isSelected ? 1.5 : 1.0,
            ),
            boxShadow: AppShadows.sm,
          ),
          child: Row(
            children: [
              const DnIconCircle(
                icon: AppIcons.mapPin,
                size: 36,
                iconSize: 18,
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      destination.name,
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
                      '${destination.elevationLabel} · ${destination.regency}',
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
