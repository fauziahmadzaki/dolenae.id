import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';

/// Kolom kode OTP (component `OtpInput (Alam)`, state Kosong/Terisi/Error).
///
/// Satu [TextField] transparan yang menangkap kursor, lalu kotak dirender
/// sendiri supaya gaya konsisten di semua state.
class DnOtpInput extends StatefulWidget {
  const DnOtpInput({
    super.key,
    this.length = 4,
    this.boxWidth = 56,
    this.value = '',
    this.onChanged,
    this.errorText,
    this.enabled = true,
    this.autofocus = true,
  });

  final int length;

  /// Lebar tiap kotak; memakai 48px di layar verifikasi OTP.
  final double boxWidth;
  final String value;
  final ValueChanged<String>? onChanged;
  final String? errorText;
  final bool enabled;
  final bool autofocus;

  @override
  State<DnOtpInput> createState() => _DnOtpInputState();
}

class _DnOtpInputState extends State<DnOtpInput> {
  late final TextEditingController _controller = TextEditingController(
    text: widget.value,
  );

  @override
  void initState() {
    super.initState();
    _controller.addListener(() => widget.onChanged?.call(_controller.text));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText != null;
    final text = _controller.text;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Stack(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(widget.length, (index) {
                final char = index < text.length ? text[index] : '';
                return Container(
                  width: widget.boxWidth,
                  height: 64,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.canvasSubtle,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    border: Border.all(
                      color: hasError ? AppColors.danger : AppColors.hairline,
                    ),
                  ),
                  child: Text(
                    char,
                    style: AppTextStyles.displayMd.copyWith(fontSize: 22),
                  ),
                );
              }),
            ),
            Positioned.fill(
              child: Opacity(
                opacity: 0,
                child: TextField(
                  controller: _controller,
                  autofocus: widget.autofocus,
                  enabled: widget.enabled,
                  keyboardType: TextInputType.number,
                  maxLength: widget.length,
                  showCursor: true,
                  decoration: const InputDecoration(
                    counterText: '',
                    border: InputBorder.none,
                  ),
                ),
              ),
            ),
          ],
        ),
        if (hasError) ...[
          const SizedBox(height: AppSpacing.s2),
          Text(
            widget.errorText!,
            style: AppTextStyles.caption.copyWith(color: AppColors.danger),
          ),
        ],
      ],
    );
  }
}
