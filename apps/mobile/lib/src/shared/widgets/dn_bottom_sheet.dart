import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';

/// Tipe bottom sheet (component `BottomSheet (Alam)`).
enum DnSheetType { menu, filter }

/// Kerangka bottom sheet dengan handle, judul, dan tombol tutup.
class DnBottomSheet extends StatelessWidget {
  const DnBottomSheet({
    super.key,
    required this.child,
    this.title,
    this.type = DnSheetType.menu,
    this.onClose,
  });

  final Widget child;
  final String? title;
  final DnSheetType type;
  final VoidCallback? onClose;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.s5,
          AppSpacing.s3,
          AppSpacing.s5,
          AppSpacing.s5,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.borderStrong,
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                ),
              ),
            ),
            if (title != null) ...[
              const SizedBox(height: AppSpacing.s4),
              Text(title!, style: AppTextStyles.title),
            ],
            const SizedBox(height: AppSpacing.s4),
            Flexible(child: child),
          ],
        ),
      ),
    );
  }
}

/// Menampilkan [DnBottomSheet] dan mengembalikan nilai dari [builder].
Future<T?> showDnBottomSheet<T>({
  required BuildContext context,
  required WidgetBuilder builder,
  String? title,
  DnSheetType type = DnSheetType.menu,
}) {
  return showModalBottomSheet<T>(
    context: context,
    backgroundColor: AppColors.surface,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
    ),
    builder: (sheetContext) => DnBottomSheet(
      title: title,
      type: type,
      child: builder(sheetContext),
    ),
  );
}
