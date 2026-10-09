import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_text_styles.dart';

/// Splash / loading sebelum masuk onboarding.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer(const Duration(milliseconds: 1600), () {
      if (mounted) context.go('/onboarding');
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
              style: AppTextStyles.title.copyWith(color: AppColors.onPrimary),
            ),
            const SizedBox(height: 6),
            Text(
              'Discover More, Prepare Better',
              style: AppTextStyles.bodySm.copyWith(color: AppColors.canvas),
            ),
            const SizedBox(height: 32),
            const SizedBox(
              width: 22,
              height: 22,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AppColors.canvasSubtle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
