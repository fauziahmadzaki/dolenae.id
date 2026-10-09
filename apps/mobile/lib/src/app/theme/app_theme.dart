import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_text_styles.dart';

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
      dividerTheme: const DividerThemeData(
        color: AppColors.hairline,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
