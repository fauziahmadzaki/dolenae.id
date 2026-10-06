import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';

/// Baris sakelar berlabel (component `Switch (Alam)`, state Aktif/Nonaktif).
class DnSwitch extends StatelessWidget {
  const DnSwitch({
    super.key,
    this.label,
    this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final String? label;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool>? onChanged;

  @override
  Widget build(BuildContext context) {
    final text = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) Text(label!, style: AppTextStyles.body.copyWith(color: AppColors.ink)),
        if (subtitle != null) ...[
          const SizedBox(height: AppSpacing.s1),
          Text(subtitle!, style: AppTextStyles.caption),
        ],
      ],
    );

    return Row(
      children: [
        Expanded(child: label == null ? const SizedBox.shrink() : text),
        if (label != null) const SizedBox(width: AppSpacing.s4),
        Switch(
          value: value,
          onChanged: onChanged,
          activeThumbColor: AppColors.onPrimary,
          activeTrackColor: AppColors.primary,
          inactiveThumbColor: AppColors.onPrimary,
          inactiveTrackColor: AppColors.borderStrong,
        ),
      ],
    );
  }
}
