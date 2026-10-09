import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Akordeon tanya jawab (component `FaqAccordion (Alam)`).
class DnFaqAccordion extends StatefulWidget {
  const DnFaqAccordion({
    super.key,
    required this.question,
    required this.answer,
    this.initiallyOpen = false,
    this.trailingLabel,
  });

  final String question;
  final String answer;
  final bool initiallyOpen;

  /// Label kecil di kanan atas, mis. kategori.
  final String? trailingLabel;

  @override
  State<DnFaqAccordion> createState() => _DnFaqAccordionState();
}

class _DnFaqAccordionState extends State<DnFaqAccordion> {
  late bool _open = widget.initiallyOpen;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: () => setState(() => _open = !_open),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.s4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      widget.question,
                      style: AppTextStyles.titleSm,
                    ),
                  ),
                  if (widget.trailingLabel != null) ...[
                    const SizedBox(width: AppSpacing.s2),
                    Text(
                      widget.trailingLabel!,
                      style: AppTextStyles.overline,
                    ),
                  ],
                  const SizedBox(width: AppSpacing.s2),
                  AnimatedRotation(
                    turns: _open ? 0.5 : 0,
                    duration: const Duration(milliseconds: 180),
                    child: const Icon(
                      AppIcons.chevronDown,
                      size: 20,
                      color: AppColors.body,
                    ),
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            firstChild: const SizedBox(width: double.infinity),
            secondChild: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.s4,
                0,
                AppSpacing.s4,
                AppSpacing.s4,
              ),
              child: Text(widget.answer, style: AppTextStyles.bodySm),
            ),
            crossFadeState: _open
                ? CrossFadeState.showSecond
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 180),
            sizeCurve: Curves.easeOut,
          ),
        ],
      ),
    );
  }
}
