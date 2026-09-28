import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import 'dn_buttons.dart';

/// Keadaan kosong/error dengan microcopy kontekstual.
class DnEmptyState extends StatelessWidget {
  const DnEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.body,
    this.actionLabel,
    this.onAction,
    this.iconColor = AppColors.primary,
  });

  final IconData icon;
  final String title;
  final String body;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: const BoxDecoration(
            color: AppColors.canvasSubtle,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 32, color: iconColor),
        ),
        const SizedBox(height: 14),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          body,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 14,
            height: 1.4,
            color: AppColors.body,
          ),
        ),
        if (actionLabel != null) ...[
          const SizedBox(height: 18),
          DnPrimaryButton(label: actionLabel!, onPressed: onAction),
        ],
      ],
    );
  }
}
