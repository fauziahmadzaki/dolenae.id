import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import 'dn_progress_bar.dart';

/// Ukuran header progres (component `ProgressHeader (Alam)`).
enum DnProgressHeaderSize { halaman, kartu }

/// Header yang menggabungkan judul, angka progres, dan progress bar.
class DnProgressHeader extends StatelessWidget {
  const DnProgressHeader({
    super.key,
    required this.title,
    required this.completed,
    required this.total,
    this.size = DnProgressHeaderSize.kartu,
    this.caption,
  });

  final String title;
  final int completed;
  final int total;
  final DnProgressHeaderSize size;
  final String? caption;

  double get _progress => total > 0 ? completed / total : 0.0;

  @override
  Widget build(BuildContext context) {
    final isPage = size == DnProgressHeaderSize.halaman;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(isPage ? AppSpacing.s5 : AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(isPage ? AppRadius.xl : AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: isPage ? AppTextStyles.title : AppTextStyles.titleSm,
                ),
              ),
              Text(
                '$completed/$total',
                style: (isPage ? AppTextStyles.title : AppTextStyles.titleSm)
                    .copyWith(color: AppColors.primary),
              ),
            ],
          ),
          if (caption != null) ...[
            const SizedBox(height: AppSpacing.s1),
            Text(caption!, style: AppTextStyles.caption),
          ],
          const SizedBox(height: AppSpacing.s3),
          DnProgressBar(value: _progress),
        ],
      ),
    );
  }
}
