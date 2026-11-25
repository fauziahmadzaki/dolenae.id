import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:path/path.dart' as p;
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/core/media/photo_picker.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/facility_proposal.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_chip.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_input.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_local_image.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_photo_picker_sheet.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_selectable_row.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Layar Usulkan Fasilitas (Node Figma: 86:1562).
///
/// Form pengusulan yang masuk ke antrean tinjauan admin. Setelah dikirim,
/// usulan disimpan ke [SavedController] lalu pindah ke `/facilities/propose/success`.
class ProposeFacilityScreen extends StatefulWidget {
  const ProposeFacilityScreen({
    super.key,
    this.initialName = '',
    this.initialDestinationName = 'Gunung Bromo',
    this.initialAddress = '',
    this.initialNote = '',
    this.onPickPhoto,
    this.onRecoverLostPhoto,
    this.onSubmit,
    this.onBack,
  });

  final String initialName;
  final String initialDestinationName;
  final String initialAddress;
  final String initialNote;
  final PhotoPickerCallback? onPickPhoto;
  @visibleForTesting
  final Future<PickedPhoto?> Function()? onRecoverLostPhoto;

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
  String? _photoPath;
  String? _photoName;
  bool _pickingPhoto = false;

  String? _nameError;
  String? _addressError;

  bool get _canSubmit => _name.trim().isNotEmpty && _address.trim().isNotEmpty;

  String? _currentUserId() {
    try {
      return context.read<AuthController?>()?.user?.id;
    } on ProviderNotFoundException {
      return null;
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        unawaited(_recoverLostPhoto());
      }
    });
  }

  Future<void> _recoverLostPhoto() async {
    final expectedUserId = _currentUserId();
    try {
      final recovered = await recoverLostPhotoForTarget(
        target: PhotoCaptureTarget.proposeFacility,
        userId: expectedUserId,
        recover: widget.onRecoverLostPhoto,
      );
      if (!mounted || recovered == null) return;
      if (_currentUserId() != expectedUserId) return;
      final resolvedName = recovered.name.trim().isNotEmpty
          ? recovered.name.trim()
          : p.basename(recovered.path);
      setState(() {
        _photoPath = recovered.path;
        _photoName = resolvedName;
      });
    } on PhotoPickerException catch (error) {
      if (!mounted) return;
      if (_currentUserId() != expectedUserId) return;
      showDnToast(context, error.message, type: DnToastType.gagal);
    } catch (_) {
      // Abaikan kegagalan tak terduga saat memulihkan foto agar layar tetap aman.
    }
  }

  Future<void> _pickPhoto() async {
    if (_pickingPhoto) return;
    final action = await showDnPhotoPickerSheet(
      context: context,
      canRemove: _photoPath != null,
    );
    if (!mounted || action == null) return;

    if (action == PhotoPickerAction.remove) {
      setState(() {
        _photoPath = null;
        _photoName = null;
      });
      return;
    }

    final source = switch (action) {
      PhotoPickerAction.camera => PhotoSource.camera,
      PhotoPickerAction.gallery => PhotoSource.gallery,
      PhotoPickerAction.remove => null,
    };
    if (source == null) return;

    final expectedUserId = _currentUserId();
    setState(() => _pickingPhoto = true);
    String? captureId;
    try {
      captureId = await markPendingPhotoCapture(
        target: PhotoCaptureTarget.proposeFacility,
        userId: expectedUserId,
      );
      if (!mounted || _currentUserId() != expectedUserId) return;
      final picker = widget.onPickPhoto ?? defaultPickPhoto;
      final picked = await picker(source);
      if (!mounted || picked == null) return;
      if (_currentUserId() != expectedUserId) return;
      final resolvedName = picked.name.trim().isNotEmpty
          ? picked.name.trim()
          : p.basename(picked.path);
      setState(() {
        _photoPath = picked.path;
        _photoName = resolvedName;
      });
    } on PhotoPickerException catch (error) {
      if (!mounted) return;
      if (_currentUserId() != expectedUserId) return;
      showDnToast(context, error.message, type: DnToastType.gagal);
    } catch (_) {
      if (!mounted) return;
      if (_currentUserId() != expectedUserId) return;
      showDnToast(
        context,
        'Gagal mengambil foto. Coba lagi.',
        type: DnToastType.gagal,
      );
    } finally {
      if (captureId != null) {
        await clearPendingPhotoCapture(captureId: captureId);
      }
      if (mounted) {
        setState(() => _pickingPhoto = false);
      }
    }
  }

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
      photoPath: _photoPath,
      status: ProposalStatus.menunggu,
      createdAt: DateTime.now(),
    );

    final onSubmit = widget.onSubmit;
    if (onSubmit != null) {
      onSubmit(proposal);
      return;
    }

    context.read<SavedController>().addProposal(proposal);
    context.push('/facilities/propose/success', extra: proposal);
  }

  @override
  Widget build(BuildContext context) {
    final destinations = context.watch<DestinationsController>().items;
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
                  Text(
                    'Tipe',
                    style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
                  ),
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
                  ...destinations.map(
                    (destination) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.s2),
                      child: DnSelectableRow(
                        label: destination.name,
                        subtitle:
                            '${destination.province} · ${destination.regency}',
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
                  if (_photoPath != null) ...[
                    _ProposalPhotoPreview(
                      path: _photoPath!,
                      name: _photoName ?? p.basename(_photoPath!),
                      onRemove: () => setState(() {
                        _photoPath = null;
                        _photoName = null;
                      }),
                    ),
                    const SizedBox(height: AppSpacing.s3),
                  ],
                  DnOutlineButton(
                    label: 'Tambah foto',
                    icon: AppIcons.camera,
                    height: 48,
                    onPressed: _pickingPhoto ? null : _pickPhoto,
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
                label: 'Simpan usulan',
                onPressed: _canSubmit ? _submit : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProposalPhotoPreview extends StatelessWidget {
  const _ProposalPhotoPreview({
    required this.path,
    required this.name,
    required this.onRemove,
  });

  final String path;
  final String name;
  final VoidCallback onRemove;

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
          DnLocalImage(
            path: path,
            width: 56,
            height: 56,
            borderRadius: BorderRadius.circular(AppRadius.md),
            semanticLabel: 'Pratinjau foto fasilitas',
            fallback: Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.canvas,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: AppColors.hairline),
              ),
              alignment: Alignment.center,
              child: const Icon(
                AppIcons.image,
                size: 22,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.label.copyWith(color: AppColors.ink),
                ),
                const SizedBox(height: 2),
                Text(
                  'Foto siap dilampirkan',
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Hapus lampiran foto',
            onPressed: onRemove,
            icon: const Icon(
              AppIcons.delete,
              size: 18,
              color: AppColors.danger,
            ),
          ),
        ],
      ),
    );
  }
}
