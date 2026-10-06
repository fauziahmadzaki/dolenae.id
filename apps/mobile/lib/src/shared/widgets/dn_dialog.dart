import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Tipe dialog (component `Dialog (Alam)`).
enum DnDialogType { konfirmasi, destruktif }

/// Dialog konfirmasi atau destruktif.
///
/// Permukaan memakai `surface` (bukan `canvas-subtle`) karena dialog adalah
/// overlay yang butuh kontras maksimum terhadap halaman di belakangnya.
class DnDialog extends StatelessWidget {
  const DnDialog({
    super.key,
    required this.title,
    required this.message,
    required this.type,
    this.confirmLabel = 'Lanjutkan',
    this.cancelLabel = 'Batal',
    this.icon,
  });

  final String title;
  final String message;
  final DnDialogType type;
  final String confirmLabel;
  final String cancelLabel;
  final IconData? icon;

  bool get isDestructive => type == DnDialogType.destruktif;

  @override
  Widget build(BuildContext context) {
    final accent = isDestructive ? AppColors.danger : AppColors.primary;

    return AlertDialog(
      backgroundColor: AppColors.surface,
      surfaceTintColor: Colors.transparent,
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      contentPadding: const EdgeInsets.all(AppSpacing.s5),
      titlePadding: const EdgeInsets.fromLTRB(
        AppSpacing.s5,
        AppSpacing.s5,
        AppSpacing.s5,
        0,
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon ?? (isDestructive ? AppIcons.alertTriangle : AppIcons.info),
                  size: 20,
                  color: accent,
                ),
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Text(title, style: AppTextStyles.title),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s3),
          Text(message, style: AppTextStyles.bodySm),
        ],
      ),
      actions: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.s5,
            AppSpacing.s3,
            AppSpacing.s5,
            AppSpacing.s2,
          ),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(48),
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.borderStrong),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                  ),
                  child: Text(cancelLabel, style: AppTextStyles.label),
                ),
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(48),
                    backgroundColor: accent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                  ),
                  child: Text(
                    confirmLabel,
                    style: AppTextStyles.label.copyWith(color: AppColors.onPrimary),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
      actionsPadding: EdgeInsets.zero,
    );
  }
}

/// Menampilkan [DnDialog] dan mengembalikan pilihan pengguna.
///
/// `null` bila ditutup tanpa memilih apa pun.
Future<bool?> showDnDialog(
  BuildContext context, {
  required String title,
  required String message,
  DnDialogType type = DnDialogType.konfirmasi,
  String confirmLabel = 'Lanjutkan',
  String cancelLabel = 'Batal',
  IconData? icon,
}) {
  return showDialog<bool>(
    context: context,
    builder: (_) => DnDialog(
      title: title,
      message: message,
      type: type,
      confirmLabel: confirmLabel,
      cancelLabel: cancelLabel,
      icon: icon,
    ),
  );
}
