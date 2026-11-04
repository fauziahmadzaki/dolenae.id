import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';

/// Layar Buat Rencana Baru (Node Figma: 84:1177).
///
/// Formulir inisiasi rencana perjalanan mencakup nama rencana, destinasi,
/// rentang tanggal, dan jumlah orang dengan stepper interaktif.
class CreatePlanScreen extends StatefulWidget {
  const CreatePlanScreen({
    super.key,
    this.initialName = '',
    this.initialDestination = 'Pilih destinasi',
    this.initialDateRange = 'Pilih tanggal',
    this.initialPeopleCount = 2,
    this.onSelectDestination,
    this.onSelectDate,
    this.onSubmit,
    this.onBack,
  });

  final String initialName;
  final String initialDestination;
  final String initialDateRange;
  final int initialPeopleCount;
  final VoidCallback? onSelectDestination;
  final VoidCallback? onSelectDate;
  final void Function(
    String name,
    String destination,
    String dateRange,
    int peopleCount,
  )?
  onSubmit;
  final VoidCallback? onBack;

  @override
  State<CreatePlanScreen> createState() => _CreatePlanScreenState();
}

class _CreatePlanScreenState extends State<CreatePlanScreen> {
  late final TextEditingController _nameController;
  late String _destination;
  late String _dateRange;
  late int _peopleCount;
  DateTimeRange? _dates;
  Set<String> _destinationIds = {};
  String? _createdId;
  bool _submitting = false;
  String? _failure;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName);
    _destination = widget.initialDestination;
    _dateRange = widget.initialDateRange;
    _peopleCount = widget.initialPeopleCount;
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _incrementPeople() {
    if (_peopleCount < 100) setState(() => _peopleCount++);
  }

  void _decrementPeople() {
    if (_peopleCount > 1) {
      setState(() => _peopleCount--);
    }
  }

  void _handleSubmit() async {
    if (widget.onSubmit != null) {
      widget.onSubmit!(
        _nameController.text,
        _destination,
        _dateRange,
        _peopleCount,
      );
      return;
    }
    if (_submitting) return;
    if (_dates == null || _nameController.text.trim().isEmpty) {
      setState(() => _failure = 'Isi nama dan pilih tanggal perjalanan.');
      return;
    }
    setState(() {
      _submitting = true;
      _failure = null;
    });
    final controller = context.read<PlanController>();
    if (_createdId == null) {
      final result = await controller.create(
        TripDraft(
          name: _nameController.text.trim(),
          startDate: _iso(_dates!.start),
          endDate: _iso(_dates!.end),
          peopleCount: _peopleCount,
        ),
      );
      if (!mounted) return;
      if (result.isFailure) {
        setState(() {
          _submitting = false;
          _failure = result.failureOrNull!.message;
        });
        return;
      }
      _createdId = result.valueOrNull!.id;
    }
    // Simpan satu per satu; ID yang selesai dihapus agar retry tidak menggandakan item.
    for (final id in _destinationIds.toList()) {
      final result = await controller.addItem(
        _createdId!,
        TripItemDraft(destinationId: id, date: _iso(_dates!.start)),
      );
      if (!mounted) return;
      if (result.isFailure) {
        setState(() {
          _submitting = false;
          _failure =
              'Rencana tersimpan; destinasi belum lengkap. ${result.failureOrNull!.message}';
        });
        return;
      }
      _destinationIds.remove(id);
    }
    if (mounted) context.go('/plan');
  }

  String _iso(DateTime date) => date.toIso8601String().substring(0, 10);
  Future<void> _pickDestinations() async {
    final ids = await context.push<Set<String>>(
      '/plan/select-destination',
      extra: _destinationIds,
    );
    if (!mounted || ids == null) return;
    final catalog = context.read<DestinationsController>().items;
    setState(() {
      _destinationIds = ids;
      _destination = catalog
          .where((d) => ids.contains(d.id))
          .map((d) => d.name)
          .join(', ');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Buat rencana baru',
        showBack: true,
        onBack:
            widget.onBack ??
            () {
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
                    if (_failure != null)
                      Text(
                        _failure!,
                        style: AppTextStyles.bodySm.copyWith(
                          color: AppColors.danger,
                        ),
                      ),
                    _buildNameField(),
                    const SizedBox(height: AppSpacing.s4),
                    _buildDestinationField(context),
                    const SizedBox(height: AppSpacing.s4),
                    _buildDateField(context),
                    const SizedBox(height: AppSpacing.s4),
                    _buildPeopleStepper(),
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
          'Nama rencana',
          style: AppTextStyles.caption.copyWith(color: AppColors.body),
        ),
        const SizedBox(height: 6),
        Container(
          height: 48,
          alignment: Alignment.centerLeft,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: TextField(
            controller: _nameController,
            style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
            decoration: const InputDecoration(
              isDense: true,
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
              hintText: 'Misal: Trip Bromo Sunrise',
              hintStyle: TextStyle(color: AppColors.body, fontSize: 14),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDestinationField(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Destinasi',
          style: AppTextStyles.caption.copyWith(color: AppColors.body),
        ),
        const SizedBox(height: 6),
        Material(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: InkWell(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            onTap: widget.onSelectDestination ?? _pickDestinations,
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.hairline),
              ),
              child: Row(
                children: [
                  const Icon(AppIcons.mapPin, size: 18, color: AppColors.body),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _destination,
                      style: AppTextStyles.bodySm.copyWith(
                        color: AppColors.ink,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Icon(
                    AppIcons.chevronRight,
                    size: 18,
                    color: AppColors.body,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDateField(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tanggal',
          style: AppTextStyles.caption.copyWith(color: AppColors.body),
        ),
        const SizedBox(height: 6),
        Material(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: InkWell(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            onTap:
                widget.onSelectDate ??
                () async {
                  final picked = await showDateRangePicker(
                    context: context,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 1825)),
                  );
                  if (picked != null) {
                    setState(() {
                      _dates = picked;
                      _dateRange =
                          '${_iso(picked.start)} - ${_iso(picked.end)}';
                    });
                  }
                },
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.hairline),
              ),
              child: Row(
                children: [
                  const Icon(
                    AppIcons.calendar,
                    size: 18,
                    color: AppColors.body,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _dateRange,
                      style: AppTextStyles.bodySm.copyWith(
                        color: AppColors.ink,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  InkWell(
                    onTap: () {
                      setState(() {
                        _dates = null;
                        _dateRange = 'Pilih tanggal';
                      });
                    },
                    child: const Icon(
                      AppIcons.close,
                      size: 16,
                      color: AppColors.body,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPeopleStepper() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Jumlah orang',
          style: AppTextStyles.bodySm.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w500,
          ),
        ),
        Container(
          width: 132,
          height: 40,
          padding: const EdgeInsets.symmetric(horizontal: 6),
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.pill),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Minus button
              Material(
                color: AppColors.canvas,
                shape: const CircleBorder(),
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: _decrementPeople,
                  child: const SizedBox(
                    width: 28,
                    height: 28,
                    child: Icon(AppIcons.minus, size: 14, color: AppColors.ink),
                  ),
                ),
              ),
              Text(
                '$_peopleCount',
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.ink,
                ),
              ),
              // Plus button
              Material(
                color: AppColors.primary,
                shape: const CircleBorder(),
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: _incrementPeople,
                  child: const SizedBox(
                    width: 28,
                    height: 28,
                    child: Icon(
                      AppIcons.plus,
                      size: 14,
                      color: AppColors.onPrimary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBottomAction() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s1,
        AppSpacing.s4,
        AppSpacing.s6,
      ),
      child: DnPrimaryButton(
        label: 'Buat rencana',
        height: 48,
        onPressed: _submitting ? null : _handleSubmit,
      ),
    );
  }
}
