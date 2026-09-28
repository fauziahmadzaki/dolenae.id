import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';

/// Kolom pencarian. `focused` memakai garis `border-strong` 2px.
class DnSearchField extends StatelessWidget {
  const DnSearchField({
    super.key,
    required this.hint,
    this.value,
    this.focused = false,
    this.onTap,
    this.trailing,
  });

  final String hint;
  final String? value;
  final bool focused;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final text = value ?? hint;
    final showHint = value == null;
    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3 + 2),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(
              color: focused ? AppColors.borderStrong : AppColors.hairline,
              width: focused ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                AppIcons.search,
                size: 18,
                color: focused ? AppColors.primary : AppColors.body,
              ),
              const SizedBox(width: AppSpacing.s2 + 2),
              Expanded(
                child: Text(
                  text,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    color: showHint ? AppColors.body : AppColors.ink,
                  ),
                ),
              ),
              ?trailing,
            ],
          ),
        ),
      ),
    );
  }
}
