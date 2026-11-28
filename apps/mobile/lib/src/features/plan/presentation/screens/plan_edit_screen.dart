import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/utils/formatters.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/screens/select_destination_screen.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_date_field.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_dialog.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_input.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_stepper.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Layar Edit Manual Rencana Perjalanan Tersimpan (`/plan/:id/edit`).
class PlanEditScreen extends StatefulWidget {
  const PlanEditScreen({super.key, required this.planId});

  final String planId;

  static const int maxBudget = 1000000000;

  /// Memvalidasi dan mengonversi input budget Rupiah secara ketat.
  static ({int value, String? error}) parseBudgetInput(String raw) {
    final trimmed = raw.trim();
    if (trimmed.isEmpty) return (value: 0, error: null);
    if (trimmed.contains('-')) {
      return (value: 0, error: 'Estimasi budget tidak boleh negatif.');
    }

    final body = trimmed.replaceFirst(RegExp(r'^[Rr][Pp]\s*'), '');
    final isPlainDigits = RegExp(r'^\d+$').hasMatch(body);
    final isGroupedThousands = RegExp(r'^\d{1,3}(\.\d{3})+$').hasMatch(body);
    if (!isPlainDigits && !isGroupedThousands) {
      return (
        value: 0,
        error: 'Masukkan nominal angka bulat dalam Rupiah, mis. 1500000.',
      );
    }

    final digits = body.replaceAll('.', '');
    final parsed = BigInt.tryParse(digits);
    if (parsed == null || parsed > BigInt.from(maxBudget)) {
      return (value: 0, error: 'Budget maksimal Rp1.000.000.000.');
    }
    return (value: parsed.toInt(), error: null);
  }

  @override
  State<PlanEditScreen> createState() => _PlanEditScreenState();
}

class _PlanEditScreenState extends State<PlanEditScreen> {
  static const int _maxBudget = PlanEditScreen.maxBudget;

  bool _initialized = false;
  bool _allowPop = false;
  bool _isSaving = false;
  bool _detectingLocation = false;
  String? _locationError;

  String _initialTitle = '';
  String _initialOriginProvince = '';
  DateTime _initialStartDate = DateTime.now();
  DateTime _initialEndDate = DateTime.now();
  int _initialPeople = 1;
  int _initialBudget = 0;
  String _initialNote = '';
  List<String> _initialDestinationIds = const [];

  String _title = '';
  String _originProvince = '';
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now();
  int _days = 1;
  int _people = 1;
  String _budgetText = '';
  String _note = '';
  List<String> _destinationIds = const [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final planController = context.read<PlanController>();
      if (planController.findPlanById(widget.planId) == null &&
          !planController.hasLoaded &&
          !planController.isLoading) {
        planController.load();
      }
      final destController = context.read<DestinationsController>();
      if (destController.items.isEmpty && !destController.isLoading) {
        destController.load();
      }
    });
  }

  void _initFromPlan(TripPlan plan) {
    if (_initialized) return;
    _initialized = true;
    final start = DateTime(
      plan.startDate.year,
      plan.startDate.month,
      plan.startDate.day,
    );
    final end = DateTime(
      plan.endDate.year,
      plan.endDate.month,
      plan.endDate.day,
    );
    final destIds = PlanController.collectOrderedDestinationIds(plan);

    _initialTitle = plan.title;
    _initialOriginProvince = plan.originProvince;
    _initialStartDate = start;
    _initialEndDate = end;
    _initialPeople = plan.peopleCount.clamp(1, 30);
    _initialBudget = plan.totalBudget.clamp(0, _maxBudget);
    _initialNote = plan.note;
    _initialDestinationIds = List<String>.unmodifiable(destIds);

    _title = _initialTitle;
    _originProvince = _initialOriginProvince;
    _startDate = _initialStartDate;
    _endDate = _initialEndDate;
    _days = plan.durationDays.clamp(1, 30);
    _people = _initialPeople;
    _budgetText = _initialBudget > 0 ? '$_initialBudget' : '';
    _note = _initialNote;
    _destinationIds = [..._initialDestinationIds];
  }

  ({int value, String? error}) get _parsedBudget =>
      PlanEditScreen.parseBudgetInput(_budgetText);

  String? get _titleError {
    final trimmed = _title.trim();
    if (trimmed.isEmpty) return 'Nama rencana wajib diisi.';
    if (trimmed.length > 160) return 'Nama rencana maksimal 160 karakter.';
    return null;
  }

  String? get _dateError {
    final startUtc = DateTime.utc(
      _startDate.year,
      _startDate.month,
      _startDate.day,
    );
    final endUtc = DateTime.utc(_endDate.year, _endDate.month, _endDate.day);
    final diff = endUtc.difference(startUtc).inDays + 1;
    if (diff < 1) return 'Tanggal selesai harus sama atau setelah tanggal mulai.';
    if (diff > 30) return 'Durasi rencana maksimal 30 hari.';
    return null;
  }

  String? get _noteError {
    if (_note.trim().length > 1000) return 'Catatan maksimal 1000 karakter.';
    return null;
  }

  bool get _isDirty {
    if (!_initialized) return false;
    final budgetState = _parsedBudget;
    return _title.trim() != _initialTitle.trim() ||
        _originProvince.trim() != _initialOriginProvince.trim() ||
        _startDate != _initialStartDate ||
        _endDate != _initialEndDate ||
        _people != _initialPeople ||
        (budgetState.error != null || budgetState.value != _initialBudget) ||
        _note.trim() != _initialNote.trim() ||
        !listEquals(_destinationIds, _initialDestinationIds);
  }

  bool get _hasValidationError =>
      _titleError != null ||
      _dateError != null ||
      _parsedBudget.error != null ||
      _noteError != null ||
      _originProvince.trim().length > 100;

  static String _formatDate(DateTime date) {
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

  static DateTime _clampDate(DateTime value, DateTime min, DateTime max) {
    if (value.isBefore(min)) return min;
    if (value.isAfter(max)) return max;
    return value;
  }

  void _popOrGoPlan([String? planId]) {
    if (context.canPop()) {
      context.pop();
    } else {
      final target = (planId ?? widget.planId).trim();
      context.go(target.isEmpty ? '/plan' : '/plan/$target');
    }
  }

  Future<void> _confirmDiscardAndPop([String? planId]) async {
    if (_isSaving) return;
    final confirmed = await showDnDialog(
      context,
      title: 'Buang perubahan?',
      message: 'Perubahan pada rencana ini belum disimpan.',
      type: DnDialogType.destruktif,
      confirmLabel: 'Buang',
      cancelLabel: 'Lanjutkan ubah',
    );
    if (confirmed != true || !mounted) return;
    setState(() => _allowPop = true);
    _popOrGoPlan(planId);
  }

  Future<void> _handleBack([String? planId]) async {
    if (_isSaving) return;
    if (!_isDirty) {
      _popOrGoPlan(planId);
      return;
    }
    await _confirmDiscardAndPop(planId);
  }

  Future<void> _pickStartDate() async {
    final earliest = _startDate.isBefore(DateTime(2020))
        ? _startDate
        : DateTime(2020);
    final latest = DateTime(DateTime.now().year + 5, 12, 31);
    final picked = await showDatePicker(
      context: context,
      initialDate: _clampDate(_startDate, earliest, latest),
      firstDate: earliest,
      lastDate: latest,
      helpText: 'Pilih tanggal mulai',
      cancelText: 'Batal',
      confirmText: 'Pilih',
    );
    if (picked == null || !mounted) return;
    final normalized = DateTime(picked.year, picked.month, picked.day);
    setState(() {
      _startDate = normalized;
      _endDate = DateTime(
        normalized.year,
        normalized.month,
        normalized.day + _days - 1,
      );
    });
  }

  Future<void> _pickEndDate() async {
    final earliest = _startDate;
    final latest = DateTime(
      _startDate.year,
      _startDate.month,
      _startDate.day + 29,
    );
    final picked = await showDatePicker(
      context: context,
      initialDate: _clampDate(_endDate, earliest, latest),
      firstDate: earliest,
      lastDate: latest,
      helpText: 'Pilih tanggal selesai',
      cancelText: 'Batal',
      confirmText: 'Pilih',
    );
    if (picked == null || !mounted) return;
    final normalized = DateTime(picked.year, picked.month, picked.day);
    final nextDays =
        DateTime.utc(normalized.year, normalized.month, normalized.day)
            .difference(
              DateTime.utc(_startDate.year, _startDate.month, _startDate.day),
            )
            .inDays +
        1;
    setState(() {
      _endDate = normalized;
      _days = nextDays.clamp(1, 30);
    });
  }

  Future<void> _detectLocation() async {
    setState(() {
      _detectingLocation = true;
      _locationError = null;
    });
    final result = await context.read<PlanController>().detectLocation();
    if (!mounted) return;
    final location = result.valueOrNull;
    setState(() {
      _detectingLocation = false;
      if (location != null) {
        _originProvince = location.province;
      } else {
        _locationError =
            result.failureOrNull?.message ?? 'Lokasi gagal dideteksi.';
      }
    });
  }

  Future<void> _openDestinationPicker() async {
    final result = await context.push<Set<String>>(
      '/plan/select-destination',
      extra: SelectDestinationArgs(
        initialSelectedIds: _destinationIds.toSet(),
        isEditMode: true,
        allowEmpty: true,
      ),
    );
    if (result == null || !mounted) return;
    final next = <String>[
      for (final id in _destinationIds)
        if (result.contains(id)) id,
      for (final id in result)
        if (!_destinationIds.contains(id)) id,
    ];
    setState(() => _destinationIds = next);
  }

  void _removeDestination(String id) {
    setState(() {
      _destinationIds = _destinationIds
          .where((item) => item != id)
          .toList(growable: false);
    });
  }

  String _resolveDestinationLabel(
    String id,
    TripPlan plan,
    List<Destination> catalog,
  ) {
    for (final dest in catalog) {
      if (dest.id == id) return dest.name;
    }
    for (final day in plan.days) {
      for (final item in day.items) {
        if (item.destinationId?.trim() == id &&
            item.destinationName.trim().isNotEmpty) {
          return item.destinationName.trim();
        }
      }
    }
    for (final source in plan.sources) {
      if (source.id.trim() == id && source.label.trim().isNotEmpty) {
        return source.label.trim();
      }
    }
    return 'Destinasi tersimpan';
  }

  Future<void> _save(
    PlanController controller,
    TripPlan plan,
    List<Destination> catalog,
  ) async {
    if (_isSaving || _hasValidationError || !_isDirty) return;
    final budgetState = _parsedBudget;
    if (budgetState.error != null) return;

    setState(() => _isSaving = true);
    final selectedDests = [
      for (final dest in catalog)
        if (_destinationIds.contains(dest.id)) dest,
    ];

    final result = await controller.updatePlan(
      plan.id,
      title: _title,
      startDate: _startDate,
      endDate: _endDate,
      peopleCount: _people,
      totalBudget: budgetState.value,
      originProvince: _originProvince,
      note: _note,
      destinationIds: _destinationIds,
      selectedDestinations: selectedDests,
    );
    if (!mounted) return;
    setState(() => _isSaving = false);

    if (result.isCancelled) return;
    if (result.isFailed) {
      showDnToast(
        context,
        result.message ?? 'Gagal menyimpan perubahan rencana.',
        type: DnToastType.gagal,
      );
      return;
    }

    setState(() => _allowPop = true);
    showDnToast(context, 'Rencana diperbarui', type: DnToastType.sukses);
    _popOrGoPlan(plan.id);
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PlanController>();
    final catalog = context.watch<DestinationsController>().items;
    final plan = controller.findPlanById(widget.planId);
    if (plan != null) {
      _initFromPlan(plan);
    }

    final generating = plan != null && controller.isGenerating(plan.id);
    final inputsEnabled = plan != null && !generating && !_isSaving;
    final budgetState = _parsedBudget;
    final canSubmit =
        inputsEnabled && _isDirty && !_hasValidationError && budgetState.error == null;

    return PopScope(
      canPop: !_isDirty || _allowPop,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop || _isSaving) return;
        await _confirmDiscardAndPop(plan?.id);
      },
      child: Scaffold(
        backgroundColor: AppColors.canvas,
        appBar: DnAppBar(
          title: 'Ubah rencana',
          showBack: true,
          onBack: () => _handleBack(plan?.id),
        ),
        body: SafeArea(
          top: false,
          child: plan == null
              ? (controller.isLoading ||
                        (!controller.hasLoaded && controller.error == null))
                    ? Center(
                        child: Semantics(
                          label: 'Memuat rencana',
                          child: const CircularProgressIndicator(
                            color: AppColors.primary,
                          ),
                        ),
                      )
                    : controller.error != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSpacing.s5),
                          child: DnEmptyState(
                            variant: DnEmptyVariant.gagal,
                            title: 'Gagal memuat rencana',
                            body: controller.error!,
                            actionLabel: 'Coba lagi',
                            onAction: controller.load,
                          ),
                        ),
                      )
                    : Center(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSpacing.s5),
                          child: DnEmptyState(
                            variant: DnEmptyVariant.belumAdaData,
                            title: 'Rencana tidak ditemukan',
                            body: 'Rencana ini mungkin sudah dihapus.',
                            actionLabel: 'Kembali',
                            onAction: () => _popOrGoPlan(),
                          ),
                        ),
                      )
              : Column(
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
                          if (generating) ...[
                            _GeneratingBanner(),
                            const SizedBox(height: AppSpacing.s4),
                          ],
                          DnInput(
                            label: 'Nama rencana',
                            hint: 'Mis. Trip Bromo 3 hari',
                            value: _title,
                            maxLength: 160,
                            enabled: inputsEnabled,
                            errorText: _titleError,
                            onChanged: (val) => setState(() => _title = val),
                          ),
                          const SizedBox(height: AppSpacing.s4),
                          _DestinationSection(
                            destinationIds: _destinationIds,
                            enabled: inputsEnabled,
                            resolveLabel: (id) =>
                                _resolveDestinationLabel(id, plan, catalog),
                            onPick: _openDestinationPicker,
                            onRemove: _removeDestination,
                          ),
                          const SizedBox(height: AppSpacing.s4),
                          _OriginSection(
                            originProvince: _originProvince,
                            enabled: inputsEnabled,
                            detectingLocation: _detectingLocation,
                            locationError: _locationError,
                            onChanged: (val) =>
                                setState(() => _originProvince = val),
                            onClear: () => setState(() => _originProvince = ''),
                            onDetect: _detectLocation,
                          ),
                          const SizedBox(height: AppSpacing.s4),
                          DnDateField(
                            label: 'Tanggal mulai',
                            value: _formatDate(_startDate),
                            enabled: inputsEnabled,
                            onTap: _pickStartDate,
                          ),
                          const SizedBox(height: AppSpacing.s3),
                          DnDateField(
                            label: 'Tanggal selesai',
                            value: _formatDate(_endDate),
                            enabled: inputsEnabled,
                            errorText: _dateError,
                            onTap: _pickEndDate,
                          ),
                          const SizedBox(height: AppSpacing.s4),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
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
                                      enabled: inputsEnabled,
                                      onChanged: (val) {
                                        setState(() {
                                          _days = val;
                                          _endDate = DateTime(
                                            _startDate.year,
                                            _startDate.month,
                                            _startDate.day + val - 1,
                                          );
                                        });
                                      },
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
                                      enabled: inputsEnabled,
                                      onChanged: (val) =>
                                          setState(() => _people = val),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.s4),
                          DnInput(
                            label: 'Estimasi budget',
                            hint: 'Rp 1500000',
                            value: _budgetText,
                            keyboardType: TextInputType.number,
                            prefixIcon: AppIcons.key,
                            enabled: inputsEnabled,
                            errorText: budgetState.error,
                            helperText:
                                budgetState.error == null &&
                                    budgetState.value > 0
                                ? '${formatRupiah(budgetState.value)} · ${formatRupiah(budgetState.value ~/ _people)} / orang'
                                : null,
                            onChanged: (val) =>
                                setState(() => _budgetText = val),
                          ),
                          const SizedBox(height: AppSpacing.s4),
                          DnInput(
                            label: 'Catatan',
                            hint: 'Mis. butuh penginapan dekat basecamp',
                            value: _note,
                            maxLines: 4,
                            minLines: 3,
                            maxLength: 1000,
                            enabled: inputsEnabled,
                            errorText: _noteError,
                            onChanged: (val) => setState(() => _note = val),
                          ),
                          const SizedBox(height: AppSpacing.s4),
                          _SummaryPreviewCard(
                            period:
                                '${_formatDate(_startDate)} - ${_formatDate(_endDate)} ($_days hari)',
                            people: '$_people orang',
                            budget:
                                budgetState.error == null &&
                                    budgetState.value > 0
                                ? formatRupiah(budgetState.value)
                                : 'Belum ditentukan',
                            destinationCount: '${_destinationIds.length} destinasi',
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
                        border: Border(
                          top: BorderSide(color: AppColors.hairline),
                        ),
                      ),
                      child: DnPrimaryButton(
                        label: _isSaving ? 'Menyimpan…' : 'Simpan perubahan',
                        height: 48,
                        onPressed: canSubmit
                            ? () => _save(controller, plan, catalog)
                            : null,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

class _GeneratingBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(
        children: [
          const Icon(AppIcons.info, size: 18, color: AppColors.primary),
          const SizedBox(width: AppSpacing.s2),
          Expanded(
            child: Text(
              'AI sedang menyusun rencana. Tunggu selesai sebelum mengubah.',
              style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
            ),
          ),
        ],
      ),
    );
  }
}

class _DestinationSection extends StatelessWidget {
  const _DestinationSection({
    required this.destinationIds,
    required this.enabled,
    required this.resolveLabel,
    required this.onPick,
    required this.onRemove,
  });

  final List<String> destinationIds;
  final bool enabled;
  final String Function(String id) resolveLabel;
  final VoidCallback onPick;
  final ValueChanged<String> onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(AppIcons.mapPin, size: 16, color: AppColors.primary),
              const SizedBox(width: AppSpacing.s2),
              Expanded(
                child: Text('Destinasi tujuan', style: AppTextStyles.titleSm),
              ),
              DnGhostButton(
                label: destinationIds.isEmpty ? 'Pilih destinasi' : 'Ubah',
                expand: false,
                onPressed: enabled ? onPick : null,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s2),
          if (destinationIds.isEmpty)
            Text(
              'Belum ada destinasi dipilih',
              style: AppTextStyles.bodySm.copyWith(color: AppColors.body),
            )
          else
            Wrap(
              spacing: AppSpacing.s2,
              runSpacing: AppSpacing.s2,
              children: [
                for (final id in destinationIds)
                  _DestinationPill(
                    label: resolveLabel(id),
                    enabled: enabled,
                    onRemove: () => onRemove(id),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

class _DestinationPill extends StatelessWidget {
  const _DestinationPill({
    required this.label,
    required this.enabled,
    required this.onRemove,
  });

  final String label;
  final bool enabled;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 44, maxWidth: 310),
      padding: const EdgeInsets.only(left: AppSpacing.s3, right: 2),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.labelSm.copyWith(color: AppColors.onPrimary),
            ),
          ),
          IconButton(
            onPressed: enabled ? onRemove : null,
            icon: const Icon(
              AppIcons.close,
              size: 16,
              color: AppColors.onPrimary,
            ),
            tooltip: 'Hapus $label',
            constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
            padding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }
}

class _OriginSection extends StatelessWidget {
  const _OriginSection({
    required this.originProvince,
    required this.enabled,
    required this.detectingLocation,
    required this.locationError,
    required this.onChanged,
    required this.onClear,
    required this.onDetect,
  });

  final String originProvince;
  final bool enabled;
  final bool detectingLocation;
  final String? locationError;
  final ValueChanged<String> onChanged;
  final VoidCallback onClear;
  final VoidCallback onDetect;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(AppIcons.mapPin, size: 16, color: AppColors.primary),
              const SizedBox(width: AppSpacing.s2),
              Text('Lokasi asal', style: AppTextStyles.titleSm),
            ],
          ),
          const SizedBox(height: AppSpacing.s3),
          DnInput(
            label: 'Provinsi asal',
            hint: 'Mis. Jawa Barat',
            value: originProvince,
            maxLength: 100,
            enabled: enabled,
            onChanged: onChanged,
            suffix: originProvince.isNotEmpty && enabled
                ? IconButton(
                    icon: const Icon(
                      AppIcons.close,
                      size: 18,
                      color: AppColors.body,
                    ),
                    tooltip: 'Hapus lokasi asal',
                    onPressed: onClear,
                  )
                : null,
          ),
          const SizedBox(height: AppSpacing.s2),
          DnOutlineButton(
            label: detectingLocation
                ? 'Mendeteksi lokasi…'
                : 'Gunakan lokasi saat ini',
            icon: AppIcons.locateFixed,
            onPressed: (!enabled || detectingLocation) ? null : onDetect,
          ),
          if (locationError != null) ...[
            const SizedBox(height: AppSpacing.s2),
            Text(
              locationError!,
              style: AppTextStyles.caption.copyWith(color: AppColors.danger),
            ),
          ],
        ],
      ),
    );
  }
}

class _SummaryPreviewCard extends StatelessWidget {
  const _SummaryPreviewCard({
    required this.period,
    required this.people,
    required this.budget,
    required this.destinationCount,
  });

  final String period;
  final String people;
  final String budget;
  final String destinationCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Ringkasan perubahan', style: AppTextStyles.titleSm),
          const SizedBox(height: AppSpacing.s3),
          _SummaryRow(label: 'Periode', value: period),
          const SizedBox(height: AppSpacing.s2),
          _SummaryRow(label: 'Jumlah orang', value: people),
          const SizedBox(height: AppSpacing.s2),
          _SummaryRow(label: 'Estimasi budget', value: budget),
          const SizedBox(height: AppSpacing.s2),
          _SummaryRow(label: 'Destinasi', value: destinationCount),
        ],
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
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(label, style: AppTextStyles.caption),
        ),
        const SizedBox(width: AppSpacing.s2),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
          ),
        ),
      ],
    );
  }
}
