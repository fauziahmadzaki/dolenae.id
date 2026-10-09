import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Kolom isian teks (component `Input (Alam)`, state Default/Fokus/Terisi/Error).
///
/// Permukaan tonal: isi `canvas-subtle`, stroke `hairline`, dan saat fokus
/// stroke `border-strong` 2px sesuai `DESIGN.md` §2.
///
/// Nilainya dikendalikan dari luar lewat [value]; [_DnInputState] menyinkronkan
/// controller setiap kali nilai itu berubah, jadi form bisa mengosongkan atau
/// mengisi ulang kolom tanpa kehilangan kursor.
class DnInput extends StatefulWidget {
  const DnInput({
    super.key,
    this.label,
    this.hint = '',
    this.value = '',
    this.onChanged,
    this.errorText,
    this.helperText,
    this.maxLines = 1,
    this.minLines,
    this.keyboardType,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.sentences,
    this.prefixIcon,
    this.suffix,
    this.enabled = true,
    this.focusNode,
    this.onSubmitted,
    this.maxLength,
    this.obscureText = false,
  });

  final String? label;
  final String hint;
  final String value;
  final ValueChanged<String>? onChanged;
  final String? errorText;
  final String? helperText;
  final int maxLines;
  final int? minLines;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final IconData? prefixIcon;
  final Widget? suffix;
  final bool enabled;
  final FocusNode? focusNode;
  final ValueChanged<String>? onSubmitted;
  final int? maxLength;

  /// Menyembunyikan teks; dipakai [DnPasswordField].
  final bool obscureText;

  @override
  State<DnInput> createState() => _DnInputState();
}

class _DnInputState extends State<DnInput> {
  late final TextEditingController _controller = TextEditingController(
    text: widget.value,
  );

  @override
  void didUpdateWidget(DnInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != _controller.text) {
      _controller.value = TextEditingValue(
        text: widget.value,
        selection: TextSelection.collapsed(offset: widget.value.length),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: AppTextStyles.caption.copyWith(color: AppColors.ink),
          ),
          const SizedBox(height: AppSpacing.s2),
        ],
        TextField(
          controller: _controller,
          onChanged: widget.onChanged,
          maxLines: widget.maxLines,
          minLines: widget.minLines,
          keyboardType: widget.keyboardType,
          textInputAction: widget.textInputAction,
          textCapitalization: widget.textCapitalization,
          enabled: widget.enabled,
          focusNode: widget.focusNode,
          onSubmitted: widget.onSubmitted,
          maxLength: widget.maxLength,
          obscureText: widget.obscureText,
          cursorColor: AppColors.primary,
          style: AppTextStyles.body.copyWith(color: AppColors.ink),
          decoration: InputDecoration(
            hintText: widget.hint.isEmpty ? null : widget.hint,
            hintStyle: AppTextStyles.body.copyWith(
              color: AppColors.borderStrong,
            ),
            errorText: widget.errorText,
            errorStyle: AppTextStyles.caption.copyWith(color: AppColors.danger),
            helperText: widget.helperText,
            helperStyle: AppTextStyles.caption,
            prefixIcon: widget.prefixIcon == null
                ? null
                : Icon(widget.prefixIcon, size: 20, color: AppColors.body),
            suffixIcon: widget.suffix,
            filled: true,
            fillColor: widget.enabled
                ? AppColors.canvasSubtle
                : AppColors.hairline,
            counterText: '',
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.s4,
              vertical: AppSpacing.s3,
            ),
            border: _outline(AppColors.hairline, 1),
            enabledBorder: _outline(AppColors.hairline, 1),
            focusedBorder: _outline(AppColors.borderStrong, 2),
            errorBorder: _outline(AppColors.danger, 1),
            focusedErrorBorder: _outline(AppColors.danger, 2),
            disabledBorder: _outline(AppColors.hairline, 1),
          ),
        ),
      ],
    );
  }

  OutlineInputBorder _outline(Color color, double width) {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppRadius.md),
      borderSide: BorderSide(color: color, width: width),
    );
  }
}

/// Kolom isian kata sandi (component `PasswordField (Alam)`).
///
/// Sama seperti [DnInput] dengan tambahan tombol lihat/sembunyikan.
class DnPasswordField extends StatefulWidget {
  const DnPasswordField({
    super.key,
    this.label = 'Kata sandi',
    this.hint = '',
    this.value = '',
    this.onChanged,
    this.errorText,
    this.helperText,
    this.enabled = true,
    this.textInputAction,
    this.onSubmitted,
  });

  final String label;
  final String hint;
  final String value;
  final ValueChanged<String>? onChanged;
  final String? errorText;
  final String? helperText;
  final bool enabled;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;

  @override
  State<DnPasswordField> createState() => _DnPasswordFieldState();
}

class _DnPasswordFieldState extends State<DnPasswordField> {
  bool _obscured = true;

  @override
  Widget build(BuildContext context) {
    return DnInput(
      label: widget.label,
      hint: widget.hint,
      value: widget.value,
      onChanged: widget.onChanged,
      errorText: widget.errorText,
      helperText: widget.helperText,
      enabled: widget.enabled,
      textInputAction: widget.textInputAction,
      onSubmitted: widget.onSubmitted,
      prefixIcon: AppIcons.lock,
      keyboardType: TextInputType.visiblePassword,
      obscureText: _obscured,
      suffix: IconButton(
        onPressed: () => setState(() => _obscured = !_obscured),
        icon: Icon(
          _obscured ? AppIcons.eye : AppIcons.eyeOff,
          size: 20,
          color: AppColors.body,
        ),
        tooltip: _obscured ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi',
      ),
    );
  }
}