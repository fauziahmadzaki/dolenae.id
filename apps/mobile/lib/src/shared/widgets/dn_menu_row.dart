import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../app/theme/app_colors.dart';
import 'dn_icon_circle.dart';

/// Baris menu: ikon bulat + label + chevron.
class DnMenuRow extends StatelessWidget {
  const DnMenuRow({
    super.key,
    required this.icon,
    required this.label,
    this.onTap,
    this.showChevron = true,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool showChevron;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            DnIconCircle(icon: icon, size: 32, iconSize: 16),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(fontSize: 14, color: AppColors.ink),
              ),
            ),
            if (showChevron)
              const Icon(
                AppIcons.chevronRight,
                size: 18,
                color: AppColors.body,
              ),
          ],
        ),
      ),
    );
  }
}
