import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/saved_state.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/facility_proposal.dart';
import '../../../data/seed/seed_data.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_chip.dart';
import '../../../shared/widgets/dn_input.dart';
import '../../../shared/widgets/dn_selectable_row.dart';

/// Layar Usulkan Fasilitas (Node Figma: 86:1562).
///
/// Form pengusulan yang akan masuk ke antrean tinjauan admin. Setelah dikirim,
/// usulan disimpan ke [SavedState] lalu pindah ke `/facilities/propose/success`.
class ProposeFacilityScreen extends StatefulWidget {
  const ProposeFacilityScreen({
    super.key,
    this.initialName = '',
    this.initialDestinationName = 'Gunung Bromo',
    this.initialAddress = '',
    this.initialNote = '',
    this.onSubmit,
    this.onBack,
  });

  final String initialName;
  final String initialDestinationName;
  final String initialAddress;
  final String initialNote;

  /// Dipanggil dengan usulan yang terkumpul; bila null memakai alur navigasi.
  final ValueChanged<FacilityProposal>? onSubmit;
  final VoidCallback? onBack;

  @override
  State<ProposeFacilityScreen> createState() => _ProposeFacilityScreenState();
}

class _ProposeFacilityScreenState extends State<ProposeFacilityScreen> {
  late String _name = widget.initialName;
  late String _address = widget.initialAddress;
  late String _note = widget.initialNote;
  late String _destinationName = widget.initialDestinationName;
  ProposalType _type = ProposalType.accommodation;

  String? _nameError;
  String? _addressError;

  bool get _canSubmit => _name.trim().isNotEmpty && _address.trim().isNotEmpty;

  void _submit() {
    var valid = true;
    setState(() {
      if (_name.trim().isEmpty) {
        _nameError = 'Isi nama fasilitas yang kamu usulkan.';
        valid = false;
      } else {
        _nameError = null;
      }
      if (_address.trim().isEmpty) {
        _addressError = 'Isi alamat supaya mudah diverifikasi admin.';
        valid = false;
      } else {
        _addressError = null;
      }
    });
    if (!valid) return;

    final proposal = FacilityProposal(
      id: 'prop-${DateTime.now().millisecondsSinceEpoch}',
      name: _name.trim(),
      type: _type,
      nearestDestinationName: _destinationName,
      address: _address.trim(),
      note: _note.trim().isEmpty ? null : _note.trim(),
      status: ProposalStatus.menunggu,
      createdAt: DateTime.now(),
    );

    final onSubmit = widget.onSubmit;
    if (onSubmit != null) {
      onSubmit(proposal);
      return;
    }

    context.read<SavedState>().addProposal(proposal);
    context.push('/facilities/propose/success');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Usulkan fasilitas',
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
                    label: 'Nama fasilitas',
                    hint: 'Mis. Homestay Pinggir',
                    value: _name,
                    errorText: _nameError,
                    onChanged: (value) => setState(() => _name = value),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Text('Tipe', style: AppTextStyles.bodySm.copyWith(color: AppColors.ink)),
                  const SizedBox(height: AppSpacing.s2),
                  Wrap(
                    spacing: AppSpacing.s2,
                    runSpacing: AppSpacing.s2,
                    children: ProposalType.values.map((type) {
                      return DnChip(
                        label: switch (type) {
                          ProposalType.accommodation => 'Penginapan',
                          ProposalType.transport => 'Transport',
                          ProposalType.food => 'Makanan',
                        },
                        active: _type == type,
                        onTap: () => setState(() => _type = type),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Text(
                    'Destinasi terdekat',
                    style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  ...SeedData.destinations.map(
                    (destination) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.s2),
                      child: DnSelectableRow(
                        label: destination.name,
                        subtitle: '${destination.province} · ${destination.regency}',
                        selected: _destinationName == destination.name,
                        leading: AppIcons.mountain,
                        onTap: () =>
                            setState(() => _destinationName = destination.name),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  DnInput(
                    label: 'Alamat',
                    hint: 'Dusun, desa, kabupaten',
                    value: _address,
                    errorText: _addressError,
                    maxLines: 2,
                    minLines: 2,
                    prefixIcon: AppIcons.mapPin,
                    onChanged: (value) => setState(() => _address = value),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnOutlineButton(
                    label: 'Tambah foto',
                    icon: AppIcons.camera,
                    height: 48,
                    onPressed: () {},
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnInput(
                    label: 'Catatan',
                    hint: 'Informasi tambahan untuk admin',
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
                label: 'Kirim usulan',
                onPressed: _canSubmit ? _submit : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
