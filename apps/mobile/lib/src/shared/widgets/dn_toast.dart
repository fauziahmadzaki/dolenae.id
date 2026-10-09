import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../icons/app_icons.dart';

/// Tipe toast (component `Toast (Alam)`).
enum DnToastType { sukses, info, gagal }

/// Pesan singkat mengambang di atas navigasi.
class DnToast extends StatelessWidget {
  const DnToast({
    super.key,
    required this.message,
    this.type = DnToastType.info,
    this.icon,
    this.onTap,
  });

  final String message;
  final DnToastType type;
  final IconData? icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final (fg, bg, fallbackIcon) = switch (type) {
      DnToastType.sukses => (
        AppColors.success,
        AppColors.surface,
        AppIcons.badgeCheck,
      ),
      DnToastType.info => (AppColors.primary, AppColors.surface, AppIcons.info),
      DnToastType.gagal => (AppColors.danger, AppColors.surface, AppIcons.alertCircle),
    };

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.s4,
          vertical: AppSpacing.s3,
        ),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: fg.withValues(alpha: 0.35)),
        ),
        child: Row(
          children: [
            Icon(icon ?? fallbackIcon, size: 20, color: fg),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: Text(
                message,
                style: AppTextStyles.bodySm.copyWith(color: AppColors.ink),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Menampilkan [DnToast] melalui [ScaffoldMessenger].
///
/// Pesan yang sama berurutan akan menggantikan yang sebelumnya, supaya tidak
/// menumpuk ketika pengguna menekan tombol berkali-kali.
void showDnToast(
  BuildContext context,
  String message, {
  DnToastType type = DnToastType.info,
  IconData? icon,
  Duration duration = const Duration(seconds: 3),
  VoidCallback? onTap,
}) {
  final messenger = ScaffoldMessenger.of(context);
  messenger
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: Colors.transparent,
        elevation: 0,
        duration: duration,
        margin: const EdgeInsets.all(AppSpacing.s4),
        content: DnToast(message: message, type: type, icon: icon, onTap: onTap),
      ),
    );
}
