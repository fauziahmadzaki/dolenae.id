import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';

/// Onboarding: hero pine, heading, indikator slide, CTA.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  static const _slides = [
    (
      'PERJALANAN ALAM',
      'Temukan gunungmu, siapkan perjalanannya',
      'Informasi destinasi, akses, penginapan, sampai checklist persiapan dalam satu tempat.',
    ),
    (
      'RENCANAKAN PERJALANAN',
      'Rencanakan perjalananmu dalam satu tempat',
      'Susun rencana perjalanan, pilih destinasi dan fasilitas, lalu pantau checklist persiapanmu.',
    ),
    (
      'PERSIAPAN MATANG',
      'Siapkan semua kebutuhan sebelum berangkat',
      'Checklist perlengkapan, estimasi biaya, sampai rekomendasi AI yang membantumu lebih siap.',
    ),
  ];

  int _index = 0;
  final _scroll = ScrollController();

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final (label, title, body) = _slides[_index];
    final isLast = _index == _slides.length - 1;

    return Scaffold(
      body: ListView(
        controller: _scroll,
        padding: EdgeInsets.zero,
        children: [
          Container(
            constraints: const BoxConstraints(minHeight: 420),
            width: double.infinity,
            color: AppColors.primary,
            child: SafeArea(
              bottom: false,
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
                  const SizedBox(height: 18),
                  Text(
                    'Discover More, Prepare Better',
                    style: AppTextStyles.bodySm.copyWith(
                      color: AppColors.canvas,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.s6,
              AppSpacing.s8,
              AppSpacing.s6,
              AppSpacing.s4,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTextStyles.overline.copyWith(
                    color: AppColors.primary,
                    letterSpacing: 0,
                  ),
                ),
                const SizedBox(height: AppSpacing.s4),
                Text(title, style: AppTextStyles.displayLg),
                const SizedBox(height: AppSpacing.s4),
                Text(body, style: AppTextStyles.bodyLg),
                const SizedBox(height: AppSpacing.s6),
                Semantics(
                  label: 'Langkah ${_index + 1} dari ${_slides.length}',
                  child: Row(
                    spacing: 6,
                    children: [
                      for (var i = 0; i < _slides.length; i++)
                        _Dot(active: i == _index),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SafeArea(
            top: false,
            minimum: const EdgeInsets.fromLTRB(
              AppSpacing.s6,
              AppSpacing.s2,
              AppSpacing.s6,
              AppSpacing.s8,
            ),
            child: Column(
              spacing: 10,
              children: [
                DnPrimaryButton(
                  label: isLast ? 'Mulai Jelajah' : 'Lanjut',
                  onPressed: isLast
                      ? () => context.go('/login')
                      : () {
                          setState(() => _index++);
                          _scroll.jumpTo(0);
                        },
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
