import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../shared/widgets/dn_buttons.dart';

/// Onboarding: hero pine, heading, indikator slide, CTA.
class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Container(
            height: 340,
            width: double.infinity,
            color: AppColors.primary,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: const BoxDecoration(
                    color: AppColors.primaryHover,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    AppIcons.mountainSnow,
                    size: 36,
                    color: AppColors.onPrimary,
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  'Dolenae.id',
                  style: AppTextStyles.title.copyWith(
                    color: AppColors.onPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Discover More, Prepare Better',
                  style: AppTextStyles.bodySm.copyWith(color: AppColors.canvas),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.s6,
                AppSpacing.s6,
                AppSpacing.s6,
                0,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'PERJALANAN ALAM',
                    style: AppTextStyles.overline.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s3),
                  Text(
                    'Temukan gunungmu, siapkan perjalanannya',
                    style: AppTextStyles.displayLg,
                  ),
                  const SizedBox(height: AppSpacing.s3),
                  Text(
                    'Informasi destinasi, akses, penginapan, sampai checklist persiapan dalam satu tempat.',
                    style: AppTextStyles.bodyLg,
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Row(
                    children: [
                      _Dot(active: true),
                      const SizedBox(width: 6),
                      _Dot(active: false),
                      const SizedBox(width: 6),
                      _Dot(active: false),
                    ],
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.s6,
              AppSpacing.s2,
              AppSpacing.s6,
              AppSpacing.s6,
            ),
            child: Column(
              children: [
                DnPrimaryButton(
                  label: 'Mulai Jelajah',
                  onPressed: () => context.go('/login'),
                ),
                DnGhostButton(
                  label: 'Lewati',
                  onPressed: () => context.go('/home'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  const _Dot({required this.active});

  final bool active;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: active ? 24 : 8,
      height: 4,
      decoration: BoxDecoration(
        color: active ? AppColors.primary : AppColors.hairline,
        borderRadius: BorderRadius.circular(99),
      ),
    );
  }
}
