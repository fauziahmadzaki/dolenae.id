import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../shared/widgets/dn_app_bar.dart';

/// Placeholder untuk tab yang belum diimplementasi (AI/Rencana/Profil).
class ComingSoonScreen extends StatelessWidget {
  const ComingSoonScreen({super.key, required this.tabLabel});

  final String tabLabel;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: DnAppBar(title: tabLabel.isEmpty ? 'Segera hadir' : tabLabel),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(
                  color: AppColors.canvasSubtle,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  AppIcons.hourglass,
                  size: 30,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 14),
              Text('Segera hadir', style: AppTextStyles.title),
              const SizedBox(height: 6),
              Text(
                'Halaman ini sedang disiapkan.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodySm,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
