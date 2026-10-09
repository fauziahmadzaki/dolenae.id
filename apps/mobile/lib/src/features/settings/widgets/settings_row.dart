import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_radius.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';

/// Baris dasar setelan: tinggi 56px, ikon dalam bulatan 32px `canvas`,
/// label, lalu nilai atau kontrol di kanan.
class SettingsRow extends StatelessWidget {
  const SettingsRow({
    super.key,
    required this.label,
    this.icon,
    this.subtitle,
    this.value,
    this.trailing,
    this.showChevron = false,
    this.foreground,
  });

  final String label;
  final IconData? icon;
  final String? subtitle;

  /// Nilai teks rata kanan, mis. tema aktif.
  final String? value;

  /// Kontrol di kanan, mis. sakelar.
  final Widget? trailing;
  final bool showChevron;

  /// Warna label, dipakai kartu "Keluar" dengan warna `danger`.
  final Color? foreground;

  @override
  Widget build(BuildContext context) {
    final labelColor = foreground ?? AppColors.ink;

    return Container(
      constraints: const BoxConstraints(minHeight: 56),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.s4,
        vertical: AppSpacing.s2,
      ),
      child: Row(
        children: [
          if (icon != null) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.canvas,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 16, color: labelColor),
            ),
            const SizedBox(width: AppSpacing.s3),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  style: AppTextStyles.body.copyWith(color: labelColor),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(subtitle!, style: AppTextStyles.caption),
                ],
              ],
            ),
          ),
          if (value != null && trailing == null) ...[
            const SizedBox(width: AppSpacing.s3),
            Flexible(
              child: Text(
                value!,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTextStyles.titleSm.copyWith(
                  color: foreground ?? AppColors.body,
                ),
              ),
            ),
          ],
          if (trailing != null) ...[
            const SizedBox(width: AppSpacing.s2),
            trailing!,
          ],
          if (showChevron) ...[
            const SizedBox(width: AppSpacing.s1),
            const Icon(
              Icons.chevron_right,
              size: 18,
              color: AppColors.borderStrong,
            ),
          ],
        ],
      ),
    );
  }
}

/// Kartu berisi beberapa baris, dipisah garis `hairline`.
class SettingsCard extends StatelessWidget {
  const SettingsCard({
    super.key,
    required this.children,
    this.foreground,
  });

  final List<Widget> children;
  final Color? foreground;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0)
              const Divider(
                height: 1,
                thickness: 1,
                color: AppColors.hairline,
                indent: AppSpacing.s4,
              ),
            children[i],
          ],
        ],
      ),
    );
  }
}