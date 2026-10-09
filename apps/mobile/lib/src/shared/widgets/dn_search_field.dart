import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Kolom pencarian. `focused` memakai garis `border-strong` 2px.
///
/// Bila [onChanged] diisi, kolom ini menjadi field yang bisa diketik dan nilai
/// Bila [onChanged] diisi, kolom ini menjadi field yang bisa diketik dan
/// sebagai tombol (dipakai di Onboarding dan Masuk).
class DnSearchField extends StatefulWidget {
  const DnSearchField({
    super.key,
    required this.hint,
    this.value = '',
    this.focused = false,
    this.onTap,
    this.onChanged,
    this.onSubmitted,
    this.trailing,
    this.autofocus = false,
  });

  final String hint;
  final String value;

  /// Menyalakan garis 2px dan kursor di dalam kolom.
  final bool focused;
  final VoidCallback? onTap;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final Widget? trailing;
  final bool autofocus;

  @override
  State<DnSearchField> createState() => _DnSearchFieldState();
}

class _DnSearchFieldState extends State<DnSearchField> {
  late final TextEditingController _controller = TextEditingController(
    text: widget.value,
  );

  @override
  void didUpdateWidget(DnSearchField oldWidget) {
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

  bool get _editable => widget.onChanged != null;

  @override
  Widget build(BuildContext context) {
    final field = _editable
        ? TextField(
            controller: _controller,
            autofocus: widget.autofocus,
            onChanged: widget.onChanged,
            onSubmitted: widget.onSubmitted,
            textInputAction: TextInputAction.search,
            cursorColor: AppColors.primary,
            style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
            decoration: InputDecoration(
              hintText: widget.hint,
              hintStyle: AppTextStyles.bodySm.copyWith(
                color: AppColors.body,
              ),
              border: InputBorder.none,
              isDense: true,
              contentPadding: EdgeInsets.zero,
            ),
          )
        : Text(
            widget.value.isEmpty ? widget.hint : widget.value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.bodySm.copyWith(
              color: widget.value.isEmpty ? AppColors.body : AppColors.ink,
            ),
          );

    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        onTap: widget.onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3 + 2),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(
              color: widget.focused ? AppColors.borderStrong : AppColors.hairline,
              width: widget.focused ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                AppIcons.search,
                size: 18,
                color: widget.focused ? AppColors.primary : AppColors.body,
              ),
              const SizedBox(width: AppSpacing.s2 + 2),
              Expanded(child: field),
              ?widget.trailing,
            ],
          ),
        ),
      ),
    );
  }
}