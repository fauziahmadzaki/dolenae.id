import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/core/media/photo_picker.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_avatar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_photo_picker_sheet.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Layar Edit Profil (Node Figma: 81:824).
///
/// Memungkinkan wisatawan memperbarui data diri, kontak,
/// kota domisili, bio perjalanan, serta mengganti foto profil.
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({
    super.key,
    this.initialName = 'Dimas',
    this.initialEmail = 'dimas@dolenae.id',
    this.initialPhone = '',
    this.initialCity = '',
    this.initialBio = '',
    this.initialAvatarUrl,
    this.onPickPhoto,
    this.onRecoverLostPhoto,
    this.onSave,
    this.onBack,
  });

  final String initialName;
  final String initialEmail;
  final String initialPhone;
  final String initialCity;
  final String initialBio;
  final String? initialAvatarUrl;
  final PhotoPickerCallback? onPickPhoto;
  @visibleForTesting
  final Future<PickedPhoto?> Function()? onRecoverLostPhoto;
  final VoidCallback? onSave;
  final VoidCallback? onBack;

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  late final TextEditingController _cityController;
  late final TextEditingController _bioController;
  String? _avatarUrl;
  bool _clearAvatar = false;
  bool _pickingPhoto = false;
  bool _saving = false;

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
    final user = context.read<AuthController?>()?.user;
    _nameController = TextEditingController(
      text: user?.name ?? widget.initialName,
    );
    _emailController = TextEditingController(
      text: user?.email ?? widget.initialEmail,
    );
    _phoneController = TextEditingController(
      text: user?.phone ?? widget.initialPhone,
    );
    _cityController = TextEditingController(
      text: user?.city ?? widget.initialCity,
    );
    _bioController = TextEditingController(
      text: user?.bio ?? widget.initialBio,
    );
    _avatarUrl = user?.avatarUrl ?? widget.initialAvatarUrl;
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
        target: PhotoCaptureTarget.editProfile,
        userId: expectedUserId,
        recover: widget.onRecoverLostPhoto,
      );
      if (!mounted || recovered == null) return;
      if (_currentUserId() != expectedUserId) return;
      setState(() {
        _avatarUrl = recovered.path;
        _clearAvatar = false;
      });
    } on PhotoPickerException catch (error) {
      if (!mounted) return;
      if (_currentUserId() != expectedUserId) return;
      showDnToast(context, error.message, type: DnToastType.gagal);
    } catch (_) {
      // Abaikan kegagalan tak terduga saat memulihkan foto agar layar tetap aman.
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _saveChanges() async {
    if (_saving) return;
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      showDnToast(
        context,
        'Nama tidak boleh kosong',
        type: DnToastType.gagal,
      );
      return;
    }

    final auth = context.read<AuthController?>();
    if (auth == null || !auth.isAuthenticated) {
      showDnToast(
        context,
        'Sesi tidak ditemukan. Silakan masuk kembali.',
        type: DnToastType.gagal,
      );
      return;
    }

    final currentAvatar = auth.user?.avatarUrl;
    final avatarChanged = !_clearAvatar && _avatarUrl != currentAvatar;

    setState(() => _saving = true);
    final failure = await auth.updateProfile(
      name: name,
      phone: _nullable(_phoneController.text),
      city: _nullable(_cityController.text),
      bio: _nullable(_bioController.text),
      avatarUrl: avatarChanged ? _avatarUrl : null,
      clearAvatar: _clearAvatar,
    );
    if (!mounted) return;
    setState(() => _saving = false);

    if (failure != null) {
      showDnToast(context, failure.message, type: DnToastType.gagal);
      return;
    }

    widget.onSave?.call();
    showDnToast(
      context,
      'Perubahan profil berhasil disimpan!',
      type: DnToastType.sukses,
    );

    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/profile');
    }
  }

  String? _nullable(String value) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Edit profil',
        showBack: true,
        onBack: widget.onBack ?? () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/profile');
          }
        },
        trailing: TextButton(
          onPressed: _saveChanges,
          child: const Text(
            'Simpan',
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.onPrimary,
            ),
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.s4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    _buildAvatarBlock(context),
                    const SizedBox(height: AppSpacing.s4),
                    _buildField(
                      label: 'Nama',
                      controller: _nameController,
                      hint: 'Nama lengkap Anda',
                    ),
                    const SizedBox(height: 12),
                    _buildField(
                      label: 'Email',
                      controller: _emailController,
                      hint: 'email@contoh.com',
                      keyboardType: TextInputType.emailAddress,
                      enabled: false,
                    ),
                    const SizedBox(height: 12),
                    _buildField(
                      label: 'Nomor telepon',
                      controller: _phoneController,
                      hint: '+62 8...',
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 12),
                    _buildField(
                      label: 'Kota',
                      controller: _cityController,
                      hint: 'Kota domisili Anda',
                    ),
                    const SizedBox(height: 12),
                    _buildBioField(),
                    const SizedBox(height: AppSpacing.s5),
                    DnPrimaryButton(
                      label: _saving ? 'Menyimpan…' : 'Simpan perubahan',
                      height: 48,
                      onPressed: _saving ? null : _saveChanges,
                    ),
                    const SizedBox(height: AppSpacing.s4),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openPhotoPicker() async {
    if (_pickingPhoto || _saving) return;
    final hasAvatar = _avatarUrl?.trim().isNotEmpty ?? false;
    final action = await showDnPhotoPickerSheet(
      context: context,
      canRemove: hasAvatar,
    );
    if (!mounted || action == null) return;

    if (action == PhotoPickerAction.remove) {
      setState(() {
        _avatarUrl = null;
        _clearAvatar = true;
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
        target: PhotoCaptureTarget.editProfile,
        userId: expectedUserId,
      );
      if (!mounted || _currentUserId() != expectedUserId) return;
      final picker = widget.onPickPhoto ?? defaultPickPhoto;
      final picked = await picker(source);
      if (!mounted || picked == null) return;
      if (_currentUserId() != expectedUserId) return;
      setState(() {
        _avatarUrl = picked.path;
        _clearAvatar = false;
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

  Widget _buildAvatarBlock(BuildContext context) {
    final initial = _nameController.text.trim().isNotEmpty
        ? _nameController.text.trim()[0].toUpperCase()
        : 'D';

    return Column(
      children: [
        Semantics(
          button: true,
          label: 'Ubah foto profil',
          child: InkWell(
            key: const Key('edit-profile-avatar'),
            customBorder: const CircleBorder(),
            onTap: _pickingPhoto ? null : _openPhotoPicker,
            child: DnAvatar(
              imagePath: _avatarUrl,
              initials: initial,
              size: 84,
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.onPrimary,
              textStyle: AppTextStyles.displayLg.copyWith(
                color: AppColors.onPrimary,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          borderRadius: BorderRadius.circular(AppRadius.sm),
          onTap: _pickingPhoto ? null : _openPhotoPicker,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(AppIcons.camera, size: 16, color: AppColors.primary),
                const SizedBox(width: 6),
                Text(
                  'Ganti foto',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildField({
    required String label,
    required TextEditingController controller,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    bool enabled = true,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.caption.copyWith(color: AppColors.body),
        ),
        const SizedBox(height: 6),
        Container(
          height: 48,
          decoration: BoxDecoration(
            color: enabled ? AppColors.canvasSubtle : AppColors.hairline,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            enabled: enabled,
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              color: AppColors.ink,
            ),
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
              border: InputBorder.none,
              hintText: hint,
              hintStyle: const TextStyle(
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

  Widget _buildBioField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Bio',
          style: AppTextStyles.caption.copyWith(color: AppColors.body),
        ),
        const SizedBox(height: 6),
        Container(
          height: 100,
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: TextField(
            controller: _bioController,
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
              hintText: 'Tulis bio singkat tentang hobi atau pengalaman mendaki Anda',
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
}
