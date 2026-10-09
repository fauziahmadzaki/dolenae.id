import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_input.dart';
import '../../../shared/widgets/dn_toast.dart';

/// Layar Lupa Kata Sandi (Node Figma: 80:203).
///
/// Satu field email dan CTA kirim tautan. Setelah dikirim, layar menampilkan
/// toast sukses berisi email tujuan.
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({
    super.key,
    this.initialEmail = '',
    this.onSubmit,
    this.onBack,
  });

  final String initialEmail;
  final ValueChanged<String>? onSubmit;
  final VoidCallback? onBack;

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  late final TextEditingController _email = TextEditingController(
    text: widget.initialEmail,
  );
  String? _errorText;

  bool get _canSubmit => _email.text.trim().isNotEmpty;

  void _submit() {
    final email = _email.text.trim();
    if (email.isEmpty) {
      setState(() => _errorText = 'Masukkan email yang valid, contoh: nama@email.com');
      return;
    }
    setState(() => _errorText = null);

    final onSubmit = widget.onSubmit;
    if (onSubmit != null) {
      onSubmit(email);
      return;
    }
    showDnToast(
      context,
      'Tautan atur ulang sudah dikirim ke $email',
      type: DnToastType.sukses,
    );
  }

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Atur ulang kata sandi',
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
                  Text(
                    'Atur ulang kata sandi',
                    style: AppTextStyles.displayMd,
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  Text(
                    'Masukkan email yang terdaftar. Kami kirim tautan untuk '
                    'membuat kata sandi baru.',
                    style: AppTextStyles.bodySm,
                  ),
                  const SizedBox(height: AppSpacing.s6),
                  DnInput(
                    hint: 'nama@email.com',
                    value: _email.text,
                    prefixIcon: AppIcons.mail,
                    keyboardType: TextInputType.emailAddress,
                    errorText: _errorText,
                    onChanged: (value) => setState(() => _email.text = value),
                    onSubmitted: (_) => _submit(),
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
                label: 'Kirim tautan',
                onPressed: _canSubmit ? _submit : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
