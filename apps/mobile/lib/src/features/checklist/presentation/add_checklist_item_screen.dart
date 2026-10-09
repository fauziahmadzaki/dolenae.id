import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/checklist_item.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';

/// Layar Tambah Item Checklist (Node Figma: 86:1513).
///
/// Memungkinkan wisatawan menambahkan item perlengkapan baru
/// dengan kategori, flag wajib/opsional, dan catatan spesifik.
class AddChecklistItemScreen extends StatefulWidget {
  const AddChecklistItemScreen({
    super.key,
    this.onSave,
    this.onBack,
  });

  final ValueChanged<ChecklistItem>? onSave;
  final VoidCallback? onBack;

  @override
  State<AddChecklistItemScreen> createState() => _AddChecklistItemScreenState();
}

class _AddChecklistItemScreenState extends State<AddChecklistItemScreen> {
  final _nameController = TextEditingController(text: 'Jaket windproof');
  final _noteController = TextEditingController(text: 'Untuk suhu dingin saat sunrise.');

  ChecklistCategory _selectedCategory = ChecklistCategory.perlengkapan;
  bool _isRequired = true;

  @override
  void dispose() {
    _nameController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nama item tidak boleh kosong'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    final newItem = ChecklistItem(
      id: 'chk-${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      category: _selectedCategory,
      isRequired: _isRequired,
      isCompleted: false,
      note: _noteController.text.trim().isEmpty ? null : _noteController.text.trim(),
    );

    widget.onSave?.call(newItem);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Item "${newItem.name}" ditambahkan!'),
          backgroundColor: AppColors.success,
        ),
      );
      if (context.canPop()) {
        context.pop(newItem);
      } else {
        context.go('/checklist');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Tambah item',
        showBack: true,
        onBack: widget.onBack ?? () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/checklist');
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
                    _buildNameField(),
                    const SizedBox(height: AppSpacing.s4),
                    _buildCategoryField(),
                    const SizedBox(height: AppSpacing.s4),
                    _buildRequiredToggle(),
                    const SizedBox(height: AppSpacing.s4),
                    _buildNoteField(),
                    const SizedBox(height: AppSpacing.s6),
                  ],
                ),
              ),
            ),
            _buildBottomAction(),
          ],
        ),
      ),
    );
  }

  Widget _buildNameField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Nama item',
          style: AppTextStyles.caption.copyWith(color: AppColors.body),
        ),
        const SizedBox(height: 6),
        Container(
          height: 48,
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: TextField(
            controller: _nameController,
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              color: AppColors.ink,
            ),
            decoration: const InputDecoration(
              contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 14),
              border: InputBorder.none,
              hintText: 'Contoh: Jaket windproof',
              hintStyle: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                color: AppColors.body,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Kategori',
          style: AppTextStyles.caption.copyWith(color: AppColors.body),
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildCategoryChip(
                label: 'Perlengkapan',
                category: ChecklistCategory.perlengkapan,
              ),
              const SizedBox(width: 8),
              _buildCategoryChip(
                label: 'Kesehatan',
                category: ChecklistCategory.kesehatan,
              ),
              const SizedBox(width: 8),
              _buildCategoryChip(
                label: 'Konservasi',
                category: ChecklistCategory.konservasi,
              ),
              const SizedBox(width: 8),
              _buildCategoryChip(
                label: 'Administrasi',
                category: ChecklistCategory.administrasi,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryChip({
    required String label,
    required ChecklistCategory category,
  }) {
    final isSelected = _selectedCategory == category;
    return Material(
      color: isSelected ? AppColors.primary : AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.pill),
        onTap: () => setState(() => _selectedCategory = category),
        child: Container(
          height: 32,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          alignment: Alignment.center,
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
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              color: isSelected ? AppColors.onPrimary : AppColors.body,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRequiredToggle() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Tandai sebagai wajib',
          style: AppTextStyles.caption.copyWith(
            fontSize: 14,
            color: AppColors.ink,
          ),
        ),
        Switch.adaptive(
          value: _isRequired,
          activeThumbColor: AppColors.primary,
          activeTrackColor: AppColors.primary.withValues(alpha: 0.4),
          onChanged: (val) => setState(() => _isRequired = val),
        ),
      ],
    );
  }

  Widget _buildNoteField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Catatan',
          style: AppTextStyles.caption.copyWith(color: AppColors.body),
        ),
        const SizedBox(height: 6),
        Container(
          height: 88,
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: TextField(
            controller: _noteController,
            maxLines: null,
            expands: true,
            textAlignVertical: TextAlignVertical.top,
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              color: AppColors.ink,
            ),
            decoration: const InputDecoration(
              contentPadding: EdgeInsets.all(14),
              border: InputBorder.none,
              hintText: 'Contoh: Untuk suhu dingin saat sunrise.',
              hintStyle: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                color: AppColors.body,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomAction() {
    return Container(
      padding: const EdgeInsets.only(
        left: AppSpacing.s4,
        right: AppSpacing.s4,
        top: 4,
        bottom: 32,
      ),
      child: DnPrimaryButton(
        label: 'Tambah item',
        height: 48,
        onPressed: _handleSubmit,
      ),
    );
  }
}
