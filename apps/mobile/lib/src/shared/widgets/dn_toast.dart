import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

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
    final (fg, bg, fgIcon, fallbackIcon) = switch (type) {
      DnToastType.sukses => (
        AppColors.onPrimary,
        AppColors.success,
        AppColors.onPrimary,
        AppIcons.badgeCheck,
      ),
      DnToastType.info => (
        AppColors.onPrimary,
        AppColors.primary,
        AppColors.onPrimary,
        AppIcons.info,
      ),
      DnToastType.gagal => (
        AppColors.onPrimary,
        AppColors.danger,
        AppColors.onPrimary,
        AppIcons.alertCircle,
      ),
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
        ),
        child: Row(
          children: [
            Icon(icon ?? fallbackIcon, size: 20, color: fgIcon),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: Text(
                message,
                style: AppTextStyles.bodySm.copyWith(color: fg),
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
