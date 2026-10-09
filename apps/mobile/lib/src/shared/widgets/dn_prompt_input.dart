import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Kotak prompt bebas untuk AI (component `PromptInput (Alam)`).
///
/// State Kosong/Terisi/Fokus ditangani oleh [TextField]; warna stroke mengikuti
/// aturan fokus `border-strong` yang sama seperti [DnInput].
///
/// Bila [suggestions] diisi, setiap chip menulis teks ke [value] sehingga
/// [_controller] ikut tersinkron di [didUpdateWidget].
class DnPromptInput extends StatefulWidget {
  const DnPromptInput({
    super.key,
    this.value = '',
    this.onChanged,
    this.hint = 'Ceritakan kebutuhanmu, mis. ingin sunrise 2 hari dengan budget 500rb',
    this.onSubmit,
    this.suggestions = const [],
    this.onSuggestionTap,
    this.minLines = 3,
    this.maxLines = 6,
    this.enabled = true,
  });

  final String value;
  final ValueChanged<String>? onChanged;
  final String hint;
  final VoidCallback? onSubmit;

  /// Chip saran di bawah kotak prompt; dikosongkan bila tidak dipakai.
  final List<String> suggestions;
  final ValueChanged<String>? onSuggestionTap;
  final int minLines;
  final int maxLines;
  final bool enabled;

  @override
  State<DnPromptInput> createState() => _DnPromptInputState();
}

class _DnPromptInputState extends State<DnPromptInput> {
  late final TextEditingController _controller = TextEditingController(
    text: widget.value,
  );

  @override
  void didUpdateWidget(DnPromptInput oldWidget) {
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

  bool get _canSubmit => _controller.text.trim().isNotEmpty && widget.enabled;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.s4),
          decoration: BoxDecoration(
            color: AppColors.canvasSubtle,
            borderRadius: BorderRadius.circular(AppRadius.xl),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              TextField(
                controller: _controller,
                onChanged: (value) {
                  setState(() {});
                  widget.onChanged?.call(value);
                },
                minLines: widget.minLines,
                maxLines: widget.maxLines,
                enabled: widget.enabled,
                cursorColor: AppColors.accent,
                keyboardType: TextInputType.multiline,
                style: AppTextStyles.body.copyWith(color: AppColors.ink),
                decoration: InputDecoration(
                  hintText: widget.hint,
                  hintStyle: AppTextStyles.body.copyWith(
                    color: AppColors.borderStrong,
                  ),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const SizedBox(height: AppSpacing.s2),
              InkWell(
                onTap: _canSubmit ? widget.onSubmit : null,
                borderRadius: BorderRadius.circular(AppRadius.pill),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: _canSubmit
                        ? AppColors.accent
                        : AppColors.canvasSubtle,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    AppIcons.send,
                    size: 20,
                    color: _canSubmit
                        ? AppColors.onAccent
                        : AppColors.borderStrong,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (widget.suggestions.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.s3),
          Wrap(
            spacing: AppSpacing.s2,
            runSpacing: AppSpacing.s2,
            children: widget.suggestions
                .map(
                  (suggestion) => GestureDetector(
                    onTap: () => widget.onSuggestionTap?.call(suggestion),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.s3,
                        vertical: AppSpacing.s2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.canvasSubtle,
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                        border: Border.all(color: AppColors.hairline),
                      ),
                      child: Text(
                        suggestion,
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.ink,
                        ),
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ],
    );
  }
}