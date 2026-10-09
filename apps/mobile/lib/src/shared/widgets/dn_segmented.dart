import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';

/// Kontrol tersegmentasi (component `Segmented (Alam)`).
///
/// Segment aktif memakai isi `primary` dan teks `on-primary`, sama seperti
/// [DnChip] aktif, agar tidak ada aksen warna lain di luar `accent` untuk AI.
class DnSegmented<T> extends StatelessWidget {
  const DnSegmented({
    super.key,
    required this.segments,
    required this.value,
    required this.onChanged,
    this.height = 44,
    this.expand = true,
  });

  /// Pasangan nilai dan label, mis. `{(SupportCategory.penginapan, 'Penginapan')}`.
  final List<({T value, String label})> segments;
  final T value;
  final ValueChanged<T> onChanged;
  final double height;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final items = segments.map((segment) {
      final active = segment.value == value;
      return Expanded(
        flex: expand ? 1 : 0,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => onChanged(segment.value),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            height: height - 8,
            alignment: Alignment.center,
            padding: EdgeInsets.symmetric(
              horizontal: expand ? AppSpacing.s2 : AppSpacing.s4,
            ),
            decoration: BoxDecoration(
              color: active ? AppColors.primary : Colors.transparent,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Text(
              segment.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.labelSm.copyWith(
                color: active ? AppColors.onPrimary : AppColors.body,
              ),
            ),
          ),
        ),
      );
    }).toList();

    return Container(
      height: height,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: items),
    );
  }
}
