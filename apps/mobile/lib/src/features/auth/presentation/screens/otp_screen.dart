import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_otp_input.dart';

/// Layar Verifikasi OTP (Node Figma: 80:144).
///
/// Enam kotak OTP, hitung mundur kirim ulang, dan CTA verifikasi.
class OtpScreen extends StatefulWidget {
  const OtpScreen({
    super.key,
    this.email = 'd***@mail.com',
    this.length = 6,
    this.resendSeconds = 45,
    this.onVerify,
    this.onResend,
    this.onBack,
  });

  /// Email ditampilkan dalam bentuk tersamar.
  final String email;
  final int length;
  final int resendSeconds;
  final ValueChanged<String>? onVerify;
  final VoidCallback? onResend;
  final VoidCallback? onBack;

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  String _code = '';
  String? _errorText;
  late int _secondsLeft = widget.resendSeconds;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (widget.onResend != null && _secondsLeft > 0) _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() => _secondsLeft -= 1);
      if (_secondsLeft <= 0) timer.cancel();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  bool get _canVerify => _code.length == widget.length;

  void _verify() {
    if (!_canVerify) {
      setState(() => _errorText = 'Masukkan ${widget.length} digit kode OTP.');
      return;
    }
    setState(() => _errorText = null);

    widget.onVerify?.call(_code);
  }

  void _resend() {
    final onResend = widget.onResend;
    if (_secondsLeft > 0 || onResend == null) return;
    if (widget.resendSeconds > 0) {
      setState(() => _secondsLeft = widget.resendSeconds);
      _startTimer();
    }
    onResend();
  }

  @override
  Widget build(BuildContext context) {
    final canResend = widget.onResend != null && _secondsLeft <= 0;
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Verifikasi',
        showBack: true,
        plainBack: true,
        onBack:
            widget.onBack ??
            () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/login');
              }
            },
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
                    widget.onVerify == null
                        ? 'Verifikasi lewat email'
                        : 'Masukkan kode',
                    style: AppTextStyles.displayMd,
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  Text(
                    widget.onVerify == null
                        ? 'Buka tautan verifikasi yang dikirim ke emailmu.'
                        : 'Kami mengirim ${widget.length} digit kode ke ${widget.email}.',
                    style: AppTextStyles.bodySm,
                  ),
                  const SizedBox(height: AppSpacing.s6),
                  Center(
                    child: DnOtpInput(
                      enabled: widget.onVerify != null,
                      length: widget.length,
                      boxWidth: 48,
                      value: _code,
                      errorText: _errorText,
                      onChanged: (value) {
                        setState(() {
                          _code = value;
                          if (value.length == widget.length) _errorText = null;
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Wrap(
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: AppSpacing.s1,
                    children: [
                      Text('Tidak menerima kode?', style: AppTextStyles.bodySm),
                      TextButton(
                        onPressed: canResend ? _resend : null,
                        child: Text(
                          widget.onResend != null && _secondsLeft > 0
                              ? 'Kirim ulang (0:${_secondsLeft.toString().padLeft(2, '0')})'
                              : 'Kirim ulang',
                          style: AppTextStyles.labelSm.copyWith(
                            color: canResend
                                ? AppColors.primary
                                : AppColors.borderStrong,
                          ),
                        ),
                      ),
                    ],
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
                label: 'Verifikasi',
                onPressed: _canVerify && widget.onVerify != null
                    ? _verify
                    : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
