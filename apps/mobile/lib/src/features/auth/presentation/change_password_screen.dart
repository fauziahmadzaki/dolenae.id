import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../shared/widgets/dn_app_bar.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_input.dart';
import '../../../shared/widgets/dn_toast.dart';

/// Layar Ubah Kata Sandi (Node Figma: 80:169).
///
/// Tiga [DnPasswordField] dengan label di atas field, karena ketiganya sejenis
/// dan perlu dibedakan.
class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({
    super.key,
    this.initialCurrent = '',
    this.initialNew = '',
    this.initialConfirm = '',
    this.onSubmit,
    this.onBack,
  });

  final String initialCurrent;
  final String initialNew;
  final String initialConfirm;
  final void Function(String current, String next, String confirm)? onSubmit;
  final VoidCallback? onBack;

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  late String _current = widget.initialCurrent;
  late String _next = widget.initialNew;
  late String _confirm = widget.initialConfirm;

  String? _currentError;
  String? _newError;
  String? _confirmError;

  bool get _canSubmit =>
      _current.isNotEmpty && _next.isNotEmpty && _confirm.isNotEmpty;

  void _submit() {
    var valid = true;
    setState(() {
      if (_current.length < 8) {
        _currentError = 'Kata sandi minimal 8 karakter.';
        valid = false;
      } else {
        _currentError = null;
      }

      if (_next.length < 8) {
        _newError = 'Kata sandi minimal 8 karakter, kombinasi huruf dan angka.';
        valid = false;
      } else {
        _newError = null;
      }

      if (_confirm != _next) {
        _confirmError = 'Konfirmasi kata sandi tidak cocok.';
        valid = false;
      } else {
        _confirmError = null;
      }
    });
    if (!valid) return;

    final onSubmit = widget.onSubmit;
    if (onSubmit != null) {
      onSubmit(_current, _next, _confirm);
      return;
    }
    showDnToast(context, 'Kata sandi berhasil diubah', type: DnToastType.sukses);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Ubah kata sandi',
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
                  DnPasswordField(
                    label: 'Kata sandi saat ini',
                    value: _current,
                    errorText: _currentError,
                    onChanged: (value) => setState(() => _current = value),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnPasswordField(
                    label: 'Kata sandi baru',
                    helperText: 'Minimal 8 karakter, kombinasi huruf dan angka.',
                    value: _next,
                    errorText: _newError,
                    onChanged: (value) => setState(() => _next = value),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnPasswordField(
                    label: 'Ulangi kata sandi baru',
                    value: _confirm,
                    errorText: _confirmError,
                    onChanged: (value) => setState(() => _confirm = value),
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
                label: 'Simpan kata sandi',
                onPressed: _canSubmit ? _submit : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
