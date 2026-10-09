import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_text_styles.dart';

/// App bar pine dengan tombol kembali opsional dan aksi kanan.
class DnAppBar extends StatelessWidget implements PreferredSizeWidget {
  const DnAppBar({
    super.key,
    required this.title,
    this.showBack = false,
    this.onBack,
    this.trailing,
  });

  final String title;
  final bool showBack;
  final VoidCallback? onBack;
  final Widget? trailing;

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: 56,
          child: Row(
            children: [
              if (showBack)
                IconButton(
                  onPressed: onBack ?? () => Navigator.of(context).maybePop(),
                  icon: const Icon(
                    AppIcons.arrowLeft,
                    size: 22,
                    color: AppColors.onPrimary,
                  ),
                  tooltip: 'Kembali',
                )
              else
                const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: AppTextStyles.title.copyWith(color: AppColors.onPrimary),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              ?trailing,
              const SizedBox(width: 8),
            ],
          ),
        ),
      ),
    );
  }
}
