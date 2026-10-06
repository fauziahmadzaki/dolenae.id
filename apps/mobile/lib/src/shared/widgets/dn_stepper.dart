import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Penghitung jumlah (component `Stepper (Alam)`, state Default/Disabled).
class DnStepper extends StatelessWidget {
  const DnStepper({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 0,
    this.max = 99,
    this.suffix = '',
    this.enabled = true,
  });

  final int value;
  final ValueChanged<int>? onChanged;
  final int min;
  final int max;

  /// Teks satuan di samping angka, mis. `orang`.
  final String suffix;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final canDecrease = enabled && value > min;
    final canIncrease = enabled && value < max;

    return Container(
      height: 48,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: enabled ? AppColors.canvasSubtle : AppColors.hairline,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _StepButton(
            icon: AppIcons.minus,
            enabled: canDecrease,
            onTap: () => onChanged?.call(value - 1),
          ),
          SizedBox(
            width: 56,
            child: Text(
              suffix.isEmpty ? '$value' : '$value $suffix',
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.labelSm.copyWith(
                color: enabled ? AppColors.ink : AppColors.body,
              ),
            ),
          ),
          _StepButton(
            icon: AppIcons.plus,
            enabled: canIncrease,
            onTap: () => onChanged?.call(value + 1),
          ),
        ],
      ),
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({
    required this.icon,
    required this.enabled,
    required this.onTap,
  });

  final IconData icon;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: enabled ? onTap : null,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: enabled ? AppColors.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.hairline),
        ),
        child: Icon(
          icon,
          size: 18,
          color: enabled ? AppColors.primary : AppColors.borderStrong,
        ),
      ),
    );
  }
}
