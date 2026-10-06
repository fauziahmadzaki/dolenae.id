import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';

/// Tab auth (component `AuthTabs (Alam)`, aktif Masuk/Daftar).
class DnAuthTabs extends StatelessWidget {
  const DnAuthTabs({
    super.key,
    required this.active,
    required this.onChanged,
    this.labels = const ['Masuk', 'Daftar'],
  });

  /// 0 untuk Masuk, 1 untuk Daftar.
  final int active;
  final ValueChanged<int> onChanged;
  final List<String> labels;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: List.generate(labels.length, (index) {
            final isActive = index == active;
            return Expanded(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => onChanged(index),
                child: Container(
                  padding: const EdgeInsets.only(bottom: AppSpacing.s3),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        color: isActive
                            ? AppColors.primary
                            : AppColors.hairline,
                        width: isActive ? 2 : 1,
                      ),
                    ),
                  ),
                  child: Text(
                    labels[index],
                    style: isActive
                        ? AppTextStyles.title.copyWith(color: AppColors.primary)
                        : AppTextStyles.title.copyWith(color: AppColors.body),
                  ),
                ),
              ),
            );
          }),
        ),
      ],
    );
  }
}
