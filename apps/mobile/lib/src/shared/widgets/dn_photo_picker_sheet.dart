import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_bottom_sheet.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_icon_circle.dart';

/// Aksi yang tersedia di bottom sheet pemilih foto.
enum PhotoPickerAction { camera, gallery, remove }

/// Menampilkan bottom sheet Alam untuk memilih sumber foto (kamera/galeri)
/// serta opsi hapus bila foto sudah ada.
Future<PhotoPickerAction?> showDnPhotoPickerSheet({
  required BuildContext context,
  required bool canRemove,
  String title = 'Pilih foto',
}) {
  return showDnBottomSheet<PhotoPickerAction>(
    context: context,
    title: title,
    type: DnSheetType.menu,
    builder: (sheetContext) {
      return Container(
        decoration: BoxDecoration(
          color: AppColors.canvasSubtle,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.hairline),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PhotoPickerOptionRow(
              icon: AppIcons.camera,
              label: 'Ambil dari kamera',
              onTap: () => Navigator.of(sheetContext).pop(PhotoPickerAction.camera),
            ),
            const Divider(height: 1, color: AppColors.hairline),
            _PhotoPickerOptionRow(
              icon: AppIcons.image,
              label: 'Pilih dari galeri',
              onTap: () => Navigator.of(sheetContext).pop(PhotoPickerAction.gallery),
            ),
            if (canRemove) ...[
              const Divider(height: 1, color: AppColors.hairline),
              _PhotoPickerOptionRow(
                icon: AppIcons.delete,
                label: 'Hapus foto',
                destructive: true,
                onTap: () =>
                    Navigator.of(sheetContext).pop(PhotoPickerAction.remove),
              ),
            ],
          ],
        ),
      );
    },
  );
}

class _PhotoPickerOptionRow extends StatelessWidget {
  const _PhotoPickerOptionRow({
    required this.icon,
    required this.label,
    required this.onTap,
    this.destructive = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final tint = destructive ? AppColors.danger : AppColors.primary;
    final textColor = destructive ? AppColors.danger : AppColors.ink;

    return Semantics(
      button: true,
      label: label,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.s3,
              vertical: AppSpacing.s3,
            ),
            child: Row(
              children: [
                DnIconCircle(
                  icon: icon,
                  size: 36,
                  iconSize: 18,
                  background: AppColors.canvas,
                  color: tint,
                ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(
                  child: Text(
                    label,
                    style: AppTextStyles.label.copyWith(color: textColor),
                  ),
                ),
                if (!destructive)
                  const Icon(
                    AppIcons.chevronRight,
                    size: 18,
                    color: AppColors.body,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
