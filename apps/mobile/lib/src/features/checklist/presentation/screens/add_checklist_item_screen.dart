import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/checklist/domain/entities/checklist_item.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_input.dart';

/// Form kosong; onSave hanya untuk pratinjau terisolasi.
class AddChecklistItemScreen extends StatefulWidget {
  const AddChecklistItemScreen({
    super.key,
    this.destinationId,
    this.destinationName = '',
    this.onSave,
    this.onBack,
  });

  final String? destinationId;
  final String destinationName;
  final ValueChanged<ChecklistItem>? onSave;
  final VoidCallback? onBack;

  @override
  State<AddChecklistItemScreen> createState() => _AddChecklistItemScreenState();
}

class _AddChecklistItemScreenState extends State<AddChecklistItemScreen> {
  String _name = '';
  String _note = '';
  String? _error;
  ChecklistCategory _selectedCategory = ChecklistCategory.perlengkapan;
  bool _isRequired = true;
  bool _submitting = false;

  String get _checklistLocation => Uri(
    path: '/checklist',
    queryParameters: {
      if (widget.destinationId != null) 'destinationId': widget.destinationId!,
      if (widget.destinationName.isNotEmpty)
        'destinationName': widget.destinationName,
    },
  ).toString();

  void _back() {
    if (widget.onBack != null) {
      widget.onBack!();
    } else if (context.canPop()) {
      context.pop();
    } else {
      context.go(_checklistLocation);
    }
  }

  Future<void> _handleSubmit() async {
    if (_submitting) return;
    final name = _name.trim();
    if (name.isEmpty || name.length > 160 || _note.trim().length > 5000) {
      setState(
        () => _error = name.isEmpty
            ? 'Nama item tidak boleh kosong'
            : 'Nama maksimal 160 karakter, catatan maksimal 5000 karakter.',
      );
      return;
    }
    final item = ChecklistItem(
      id: '',
      name: name,
      category: _selectedCategory,
      isRequired: _isRequired,
      note: _note.trim().isEmpty ? null : _note.trim(),
    );
    if (widget.onSave != null) {
      widget.onSave!(item);
      return;
    }
    final controller = context.read<ChecklistController>();
    setState(() {
      _submitting = true;
      _error = null;
    });
    if (!RegExp(
      r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    ).hasMatch(widget.destinationId ?? '')) {
      setState(() {
        _submitting = false;
        _error = 'Pilih destinasi terlebih dahulu.';
      });
      return;
    }
    if (controller.destinationId != widget.destinationId ||
        controller.failure != null) {
      final loaded = await controller.load(widget.destinationId!);
      if (!mounted) return;
      if (loaded.isFailure) {
        setState(() {
          _submitting = false;
          _error = loaded.failureOrNull!.message;
        });
        return;
      }
    }
    final result = await controller.addItem(item);
    if (!mounted) return;
    setState(() {
      _submitting = false;
      _error = result.failureOrNull?.message;
    });
    if (result.isFailure) return;
    if (context.canPop()) {
      context.pop();
    } else {
      context.go(_checklistLocation);
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = widget.onSave == null
        ? context.watch<ChecklistController>()
        : null;
    final busy =
        _submitting ||
        controller?.isLoading == true ||
        controller?.isMutating == true;
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(title: 'Tambah item', showBack: true, onBack: _back),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.s4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    DnInput(
                      label: 'Nama item',
                      hint: 'Contoh: Jaket windproof',
                      value: _name,
                      enabled: !busy,
                      maxLength: 160,
                      onChanged: (value) => setState(() => _name = value),
                    ),
                    const SizedBox(height: AppSpacing.s4),
                    Text('Kategori', style: AppTextStyles.caption),
                    const SizedBox(height: AppSpacing.s2),
                    Wrap(
                      spacing: AppSpacing.s2,
                      runSpacing: AppSpacing.s2,
                      children: [
                        for (final category in ChecklistCategory.values)
                          ChoiceChip(
                            label: Text(
                              category.name[0].toUpperCase() +
                                  category.name.substring(1),
                            ),
                            selected: _selectedCategory == category,
                            onSelected: busy
                                ? null
                                : (_) => setState(
                                    () => _selectedCategory = category,
                                  ),
                          ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.s4),
                    SwitchListTile.adaptive(
                      contentPadding: EdgeInsets.zero,
                      title: Text(
                        'Tandai sebagai wajib',
                        style: AppTextStyles.bodySm,
                      ),
                      value: _isRequired,
                      onChanged: busy
                          ? null
                          : (value) => setState(() => _isRequired = value),
                    ),
                    const SizedBox(height: AppSpacing.s4),
                    DnInput(
                      label: 'Catatan',
                      hint: 'Contoh: Untuk suhu dingin saat sunrise.',
                      value: _note,
                      enabled: !busy,
                      maxLines: 3,
                      maxLength: 5000,
                      onChanged: (value) => setState(() => _note = value),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: AppSpacing.s3),
                      Semantics(
                        liveRegion: true,
                        child: Text(
                          _error!,
                          style: AppTextStyles.bodySm.copyWith(
                            color: AppColors.danger,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.s4),
              child: DnPrimaryButton(
                label: _submitting ? 'Menyimpan...' : 'Tambah item',
                onPressed: busy ? null : _handleSubmit,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
