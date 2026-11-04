import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';

/// Layar Edit Profil (Node Figma: 81:824).
///
/// Hanya perubahan nama tersedia; atribut lain ditampilkan nonaktif.
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({
    super.key,
    this.initialName = '',
    this.initialEmail = '',
    this.initialPhone = '',
    this.initialCity = '',
    this.initialBio = '',
    this.onSave,
    this.onBack,
  });

  final String initialName;
  final String initialEmail;
  final String initialPhone;
  final String initialCity;
  final String initialBio;
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

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName);
    _emailController = TextEditingController(text: widget.initialEmail);
    _phoneController = TextEditingController(text: widget.initialPhone);
    _cityController = TextEditingController(text: widget.initialCity);
    _bioController = TextEditingController(text: widget.initialBio);
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
    final auth = context.read<AuthController>();
    final token = auth.token;
    final userId = auth.user?.id;
    final failure = await auth.updateProfile(_nameController.text);
    if (!mounted || auth.token != token || auth.user?.id != userId) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          failure?.message ?? 'Perubahan profil berhasil disimpan!',
        ),
        backgroundColor: failure == null ? AppColors.success : AppColors.danger,
      ),
    );
    if (failure != null) return;
    widget.onSave?.call();
    if (!mounted) return;
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/profile');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final canSave = auth.isAuthenticated && !auth.isUpdatingProfile;
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Edit profil',
        showBack: true,
        onBack:
            widget.onBack ??
            () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/profile');
              }
            },
        trailing: TextButton(
          onPressed: canSave ? _saveChanges : null,
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
                      enabled: canSave,
                      unavailable: false,
                    ),
                    const SizedBox(height: 12),
                    _buildField(
                      label: 'Email',
                      controller: _emailController,
                      hint: 'email@contoh.com',
                      keyboardType: TextInputType.emailAddress,
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
                      label: auth.isUpdatingProfile
                          ? 'Menyimpan...'
                          : 'Simpan perubahan',
                      height: 48,
                      onPressed: canSave ? _saveChanges : null,
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

  Widget _buildAvatarBlock(BuildContext context) {
    final initial = _nameController.text.trim().isNotEmpty
        ? _nameController.text.trim()[0].toUpperCase()
        : 'U';

    return Column(
      children: [
        Container(
          width: 84,
          height: 84,
          decoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            initial,
            style: AppTextStyles.displayLg.copyWith(
              color: AppColors.onPrimary,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        const SizedBox(height: 8),
        const Text('Foto profil: Belum tersedia'),
        TextButton(
          onPressed: null,
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
    bool enabled = false,
    bool unavailable = true,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.caption.copyWith(color: AppColors.body),
        ),
        if (unavailable) const Text('Belum tersedia'),
        const SizedBox(height: 6),
        Container(
          height: 48,
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
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
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 14,
              ),
              border: InputBorder.none,
              hintText: unavailable ? 'Belum tersedia' : hint,
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
        const Text('Belum tersedia'),
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
            enabled: false,
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
              hintText: 'Belum tersedia',
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
