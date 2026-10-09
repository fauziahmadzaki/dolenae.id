import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';

/// Layar Edit Profil (Node Figma: 81:824).
///
/// Memungkinkan wisatawan memperbarui data diri, kontak,
/// kota domisili, bio perjalanan, serta mengganti foto profil.
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({
    super.key,
    this.initialName = 'Dimas',
    this.initialEmail = 'dimas@dolenae.id',
    this.initialPhone = '+62 812-3456-7890',
    this.initialCity = 'Yogyakarta',
    this.initialBio = 'Suka mendaki gunung dan camping di dataran tinggi.',
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

  void _saveChanges() {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nama tidak boleh kosong'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    widget.onSave?.call();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Perubahan profil berhasil disimpan!'),
        backgroundColor: AppColors.success,
      ),
    );

    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/profile');
    }
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
                      label: 'Simpan perubahan',
                      height: 48,
                      onPressed: _saveChanges,
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
        : 'D';

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
        InkWell(
          borderRadius: BorderRadius.circular(AppRadius.sm),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Pilih foto dari galeri atau kamera')),
            );
          },
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
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
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
