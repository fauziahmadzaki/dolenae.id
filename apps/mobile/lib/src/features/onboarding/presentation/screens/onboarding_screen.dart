import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/core/state/app_navigation_store.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';

/// Onboarding: carousel 3 slide yang bisa digeser, indikator slide, dan CTA.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  static const _slides = <_OnboardingSlide>[
    _OnboardingSlide(
      icon: AppIcons.mountainSnow,
      eyebrow: 'JELAJAHI',
      title: 'Temukan gunung dan alam Indonesia',
      description:
          'Telusuri destinasi pegunungan, perbukitan, dan wisata alam '
          'pilihan — lengkap dengan informasi yang kamu butuhkan sebelum '
          'berangkat.',
    ),
    _OnboardingSlide(
      icon: AppIcons.route,
      eyebrow: 'PAHAMI PERJALANAN',
      title: 'Akses, rute, dan fasilitas jadi jelas',
      description:
          'Cek jalur menuju lokasi, tingkat kesulitan, penginapan, '
          'transportasi, sampai tempat makan di sekitar destinasi.',
    ),
    _OnboardingSlide(
      icon: AppIcons.squareCheck,
      eyebrow: 'SIAPKAN DIRI',
      title: 'Rencanakan tanpa ada yang terlewat',
      description:
          'Buat rencana perjalanan dan checklist persiapan, lalu simpan '
          'destinasi favoritmu dalam satu tempat.',
    ),
  ];

  final PageController _controller = PageController();
  int _page = 0;

  bool get _isLast => _page == _slides.length - 1;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _goTo(int index) {
    if (index == _page) return;
    _controller.animateToPage(
      index,
      duration: const Duration(milliseconds: 340),
      curve: Curves.easeOutCubic,
    );
  }

  void _next() {
    if (_isLast) {
      _finish('/login');
      return;
    }
    _goTo(_page + 1);
  }

  void _skip() => _finish('/home');

  void _finish(String location) {
    // Tandai selesai agar splash/onboarding tidak muncul lagi saat app dibuka.
    unawaited(context.read<AppNavigationStore>().markOnboardingSeen());
    context.go(location);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _controller,
              itemCount: _slides.length,
              physics: const PageScrollPhysics(),
              onPageChanged: (index) => setState(() => _page = index),
              itemBuilder: (_, index) =>
                  _OnboardingSlideView(slide: _slides[index]),
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.s6,
                AppSpacing.s2,
                AppSpacing.s6,
                AppSpacing.s4,
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      for (var i = 0; i < _slides.length; i++) ...[
                        if (i > 0) const SizedBox(width: AppSpacing.s2),
                        _Dot(active: i == _page, onTap: () => _goTo(i)),
                      ],
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnPrimaryButton(
                    label: _isLast ? 'Mulai Jelajah' : 'Selanjutnya',
                    icon: _isLast ? null : AppIcons.chevronRight,
                    onPressed: _next,
                  ),
                  DnGhostButton(label: 'Lewati', onPressed: _skip),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OnboardingSlideView extends StatelessWidget {
  const _OnboardingSlideView({required this.slide});

  final _OnboardingSlide slide;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          flex: 5,
          child: Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.vertical(
                bottom: Radius.circular(AppRadius.xl),
              ),
            ),
            child: SafeArea(
              bottom: false,
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.s6,
                    vertical: AppSpacing.s4,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 88,
                        height: 88,
                        decoration: const BoxDecoration(
                          color: AppColors.primaryHover,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          slide.icon,
                          size: 44,
                          color: AppColors.onPrimary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s4),
                      Text(
                        'Dolenae.id',
                        style: AppTextStyles.title.copyWith(
                          color: AppColors.onPrimary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s1),
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
            ),
          ),
        ),
        Expanded(
          flex: 4,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.s6,
              AppSpacing.s6,
              AppSpacing.s6,
              AppSpacing.s4,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  slide.eyebrow,
                  style: AppTextStyles.overline.copyWith(
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: AppSpacing.s3),
                Text(slide.title, style: AppTextStyles.displayLg),
                const SizedBox(height: AppSpacing.s3),
                Text(slide.description, style: AppTextStyles.bodyLg),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _OnboardingSlide {
  const _OnboardingSlide({
    required this.icon,
    required this.eyebrow,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final String eyebrow;
  final String title;
  final String description;
}

class _Dot extends StatelessWidget {
  const _Dot({required this.active, required this.onTap});

  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: active,
      label: active ? 'Slide aktif' : 'Pindah ke slide',
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.s2),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 280),
            curve: Curves.easeOutCubic,
            width: active ? 24 : 8,
            height: 4,
            decoration: BoxDecoration(
              color: active ? AppColors.primary : AppColors.hairline,
              borderRadius: BorderRadius.circular(AppRadius.pill),
            ),
          ),
        ),
      ),
    );
  }
}
