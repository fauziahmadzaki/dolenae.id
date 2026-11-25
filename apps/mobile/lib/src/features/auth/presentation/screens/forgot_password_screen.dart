import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_input.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

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
  bool _loading = false;

  bool get _canSubmit => _email.text.trim().isNotEmpty && !_loading;

  Future<void> _submit() async {
    final email = _email.text.trim();
    if (email.isEmpty) {
      setState(() => _errorText = 'Masukkan email yang valid, contoh: nama@email.com');
      return;
    }
    setState(() => _errorText = null);

    // Tests and previews can observe the submitted email directly.
    final onSubmit = widget.onSubmit;
    if (onSubmit != null) {
      onSubmit(email);
      return;
    }

    final auth = context.read<AuthController?>();
    if (auth == null) return;

    setState(() => _loading = true);
    final result = await auth.requestPasswordReset(email);
    if (!mounted) return;
    setState(() => _loading = false);

    switch (result) {
      case Success(:final value):
        showDnToast(context, value, type: DnToastType.sukses);
      case Failure(:final failure):
        setState(() => _errorText = failure.message);
    }
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
                label: _loading ? 'Mengirim…' : 'Kirim tautan',
                onPressed: _canSubmit ? _submit : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
