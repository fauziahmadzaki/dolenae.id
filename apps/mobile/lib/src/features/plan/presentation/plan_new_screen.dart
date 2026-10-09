import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_date_field.dart';
import '../../../shared/widgets/dn_input.dart';
import '../../../shared/widgets/dn_stepper.dart';

/// Layar Tambah Rencana - Atur (Node Figma: 85:1439).
///
/// Form ringkas untuk membuat rencana dari daftar rencana: nama, tanggal mulai,
/// jumlah hari dan orang, estimasi budget, lalu catatan bebas.
class PlanNewScreen extends StatefulWidget {
  const PlanNewScreen({
    super.key,
    this.initialName = '',
    this.initialNote = '',
    this.onSubmit,
    this.onBack,
  });

  final String initialName;
  final String initialNote;

  /// Dipanggil dengan ringkasan rencana; bila null memakai alur navigasi.
  final ValueChanged<({String name, String dateRange, int days, int people, int budget})>? onSubmit;
  final VoidCallback? onBack;

  @override
  State<PlanNewScreen> createState() => _PlanNewScreenState();
}

class _PlanNewScreenState extends State<PlanNewScreen> {
  late String _name = widget.initialName;
  late String _note = widget.initialNote;
  late DateTime _startDate = DateTime.now().add(const Duration(days: 14));
  int _days = 2;
  int _people = 2;
  String _budget = '';

  String? _nameError;

  bool get _canSubmit => _name.trim().isNotEmpty;

  String get _dateRange {
    final end = _startDate.add(Duration(days: _days - 1));
    return '${_format(_startDate)} - ${_format(end)}';
  }

  static String _format(DateTime date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  void _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      helpText: 'Pilih tanggal mulai',
      cancelText: 'Batal',
      confirmText: 'Pilih',
    );
    if (picked != null) setState(() => _startDate = picked);
  }

  void _submit() {
    if (_name.trim().isEmpty) {
      setState(() => _nameError = 'Isi nama rencana, mis. Trip Bromo 3 hari.');
      return;
    }
    setState(() => _nameError = null);

    final payload = (
      name: _name.trim(),
      dateRange: _dateRange,
      days: _days,
      people: _people,
      budget: int.tryParse(_budget.replaceAll(RegExp(r'\D'), '')) ?? 0,
    );

    final onSubmit = widget.onSubmit;
    if (onSubmit != null) {
      onSubmit(payload);
      return;
    }
    context.push('/plan/success');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Buat rencana',
        showBack: true,
        onBack: widget.onBack ?? () => context.pop(),
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.s5,
                  AppSpacing.s4,
                  AppSpacing.s5,
                  AppSpacing.s5,
                ),
                children: [
                  DnInput(
                    label: 'Nama rencana',
                    hint: 'Mis. Trip Bromo 3 hari',
                    value: _name,
                    errorText: _nameError,
                    onChanged: (value) => setState(() => _name = value),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnDateField(
                    label: 'Tanggal mulai',
                    value: _format(_startDate),
                    onTap: _pickDate,
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Jumlah hari',
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.ink,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.s2),
                            DnStepper(
                              value: _days,
                              min: 1,
                              max: 30,
                              onChanged: (value) => setState(() => _days = value),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s3),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Jumlah orang',
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.ink,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.s2),
                            DnStepper(
                              value: _people,
                              min: 1,
                              max: 30,
                              onChanged: (value) =>
                                  setState(() => _people = value),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnInput(
                    label: 'Estimasi budget',
                    hint: 'Contoh: 1500000',
                    value: _budget,
                    keyboardType: TextInputType.number,
                    prefixIcon: AppIcons.key,
                    onChanged: (value) => setState(
                      () => _budget = value.replaceAll(RegExp(r'\D'), ''),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.s4),
                    decoration: BoxDecoration(
                      color: AppColors.canvasSubtle,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      border: Border.all(color: AppColors.hairline),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Ringkasan', style: AppTextStyles.titleSm),
                        const SizedBox(height: AppSpacing.s3),
                        _SummaryRow(label: 'Periode', value: _dateRange),
                        const SizedBox(height: AppSpacing.s2),
                        _SummaryRow(
                          label: 'Jumlah orang',
                          value: '$_people orang',
                        ),
                        const SizedBox(height: AppSpacing.s2),
                        _SummaryRow(
                          label: 'Destinasi tersedia',
                          value: '${SeedData.destinations.length} destinasi',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnInput(
                    label: 'Catatan',
                    hint: 'Mis. butuh penginapan dekat basecamp',
                    value: _note,
                    maxLines: 4,
                    minLines: 3,
                    onChanged: (value) => setState(() => _note = value),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.s5,
                AppSpacing.s4,
                AppSpacing.s5,
                AppSpacing.s5,
              ),
              decoration: const BoxDecoration(
                color: AppColors.canvas,
                border: Border(top: BorderSide(color: AppColors.hairline)),
              ),
              child: DnPrimaryButton(
                label: 'Simpan rencana',
                onPressed: _canSubmit ? _submit : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label, style: AppTextStyles.bodySm)),
        const SizedBox(width: AppSpacing.s3),
        Flexible(
          child: Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.end,
            style: AppTextStyles.titleSm,
          ),
        ),
      ],
    );
  }
}
