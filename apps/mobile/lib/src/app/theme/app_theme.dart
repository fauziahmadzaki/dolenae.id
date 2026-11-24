import 'package:flutter/cupertino.dart' show CupertinoPageTransitionsBuilder;
import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';

/// ThemeData aplikasi berdasarkan token tema "Alam".
abstract final class AppTheme {
  static ThemeData light() {
    const scheme = ColorScheme.light(
      primary: AppColors.primary,
      onPrimary: AppColors.onPrimary,
      primaryContainer: AppColors.primaryHover,
      secondary: AppColors.accent,
      onSecondary: AppColors.onAccent,
      surface: AppColors.surface,
      onSurface: AppColors.ink,
      error: AppColors.danger,
      onError: AppColors.surface,
      outline: AppColors.hairline,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.canvas,
      splashFactory: InkRipple.splashFactory,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
        elevation: 0,
        centerTitle: false,
      ),
      textTheme: TextTheme(
        displayLarge: AppTextStyles.displayXl,
        displayMedium: AppTextStyles.displayLg,
        displaySmall: AppTextStyles.displayMd,
        titleLarge: AppTextStyles.title,
        bodyLarge: AppTextStyles.bodyLg,
        bodyMedium: AppTextStyles.body,
        bodySmall: AppTextStyles.bodySm,
        labelLarge: AppTextStyles.label,
        labelSmall: AppTextStyles.overline,
      ),
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: _DnPageTransitionsBuilder(),
          TargetPlatform.fuchsia: _DnPageTransitionsBuilder(),
          TargetPlatform.linux: _DnPageTransitionsBuilder(),
          TargetPlatform.windows: _DnPageTransitionsBuilder(),
          // iOS/macOS tetap memakai transisi native agar gestur swipe-back
          // dari tepi layar tidak hilang.
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
        },
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.hairline,
        thickness: 1,
        space: 1,
      ),
    );
  }
}

/// Transisi halaman: geser halus + fade, dengan efek parallax tipis pada
/// halaman yang ditinggalkan.
class _DnPageTransitionsBuilder extends PageTransitionsBuilder {
  const _DnPageTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final enter = CurvedAnimation(
      parent: animation,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );
    final exit = CurvedAnimation(
      parent: secondaryAnimation,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );

    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0.08, 0),
        end: Offset.zero,
      ).animate(enter),
      child: FadeTransition(
        opacity: Tween<double>(begin: 0.6, end: 1).animate(enter),
        child: SlideTransition(
          position: Tween<Offset>(
            begin: Offset.zero,
            end: const Offset(-0.04, 0),
          ).animate(exit),
          child: child,
        ),
      ),
    );
  }
}
