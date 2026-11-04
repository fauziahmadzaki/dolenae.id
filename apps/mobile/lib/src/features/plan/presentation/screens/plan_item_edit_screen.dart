import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/features/plan/domain/entities/trip_plan.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_date_field.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_input.dart';

class PlanItemEditScreen extends StatefulWidget {
  const PlanItemEditScreen({super.key, this.step});
  final TripStep? step;
  @override
  State<PlanItemEditScreen> createState() => _PlanItemEditScreenState();
}

class _PlanItemEditScreenState extends State<PlanItemEditScreen> {
  late String _destinationId = widget.step?.destinationId ?? '';
  late String _destinationName = widget.step?.destinationName ?? '';
  late String _date = widget.step?.date ?? '';
  late String _note = widget.step?.notes ?? '';
  late Set<String> _supports = widget.step?.supportIds.toSet() ?? {};
  bool _busy = false;
  String? _failure;

  Future<void> _pickDestination() async {
    final ids = await context.push<Set<String>>(
      '/plan/select-destination?single=1',
      extra: {_destinationId}..remove(''),
    );
    if (!mounted || ids == null || ids.isEmpty) return;
    final destination = context
        .read<DestinationsController>()
        .items
        .where((d) => d.id == ids.single)
        .firstOrNull;
    if (destination == null) return;
    setState(() {
      if (_destinationId != destination.id) _supports = {};
      _destinationId = destination.id;
      _destinationName = destination.name;
    });
  }

  Future<void> _pickSupports() async {
    if (_destinationId.isEmpty) return;
    await context.read<FacilitiesController>().load(_destinationId);
    if (!mounted) return;
    final ids = await context.push<Set<String>>(
      '/plan/select-facility?destinationId=${Uri.encodeComponent(_destinationId)}',
      extra: _supports,
    );
    if (mounted && ids != null) setState(() => _supports = ids);
  }

  Future<void> _save(TripPlan plan) async {
    if (_busy) return;
    if (_destinationId.isEmpty ||
        !validDate(_date) ||
        _date.compareTo(plan.startDate) < 0 ||
        _date.compareTo(plan.endDate) > 0) {
      setState(
        () => _failure = 'Pilih destinasi dan tanggal dalam periode rencana.',
      );
      return;
    }
    setState(() {
      _busy = true;
      _failure = null;
    });
    final controller = context.read<PlanController>();
    final draft = TripItemDraft(
      destinationId: _destinationId,
      date: _date,
      notes: _note.trim(),
      supportIds: _supports.toList(),
    );
    final result = widget.step == null
        ? await controller.addItem(plan.id, draft)
        : await controller.updateItem(plan.id, widget.step!.id, draft);
    if (!mounted) return;
    setState(() {
      _busy = false;
      _failure = result.failureOrNull?.message;
    });
    if (result.isSuccess) context.pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final plan = context.watch<PlanController>().activePlan;
    return Scaffold(
      appBar: DnAppBar(
        title: widget.step == null ? 'Tambah destinasi' : 'Ubah item',
        showBack: true,
        onBack: () => context.pop(),
      ),
      body: SafeArea(
        child: plan == null
            ? const Center(child: Text('Pilih rencana terlebih dahulu.'))
            : ListView(
                padding: const EdgeInsets.all(AppSpacing.s5),
                children: [
                  if (_failure != null) Text(_failure!),
                  DnOutlineButton(
                    label: _destinationName.isEmpty
                        ? 'Pilih destinasi'
                        : _destinationName,
                    onPressed: _busy ? null : _pickDestination,
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnDateField(
                    label: 'Tanggal kunjungan',
                    value: _date,
                    onTap: () async {
                      final start = DateTime.parse(plan.startDate);
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.tryParse(_date) ?? start,
                        firstDate: start,
                        lastDate: DateTime.parse(plan.endDate),
                      );
                      if (mounted && picked != null) {
                        setState(
                          () =>
                              _date = picked.toIso8601String().substring(0, 10),
                        );
                      }
                    },
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnInput(
                    label: 'Catatan',
                    value: _note,
                    maxLines: 3,
                    onChanged: (value) => setState(() => _note = value),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnOutlineButton(
                    label: 'Pilih fasilitas (${_supports.length})',
                    onPressed: _busy || _destinationId.isEmpty
                        ? null
                        : _pickSupports,
                  ),
                  const SizedBox(height: AppSpacing.s5),
                  DnPrimaryButton(
                    label: 'Simpan item',
                    onPressed: _busy ? null : () => _save(plan),
                  ),
                ],
              ),
      ),
    );
  }
}
