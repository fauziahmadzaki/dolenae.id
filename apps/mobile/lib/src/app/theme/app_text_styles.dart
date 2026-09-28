import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// Skala tipografi — sumber: `DESIGN.md` §3.
///
/// Judul memakai Poppins, body memakai Inter. `static final` di Dart bersifat
/// lazy, sehingga aman memakai `GoogleFonts.*` di sini.
abstract final class AppTextStyles {
  static final displayXl = GoogleFonts.poppins(
    fontSize: 40,
    fontWeight: FontWeight.w800,
    height: 48 / 40,
    color: AppColors.ink,
  );

  static final displayLg = GoogleFonts.poppins(
    fontSize: 32,
    fontWeight: FontWeight.w800,
    height: 40 / 32,
    color: AppColors.ink,
  );

  static final displayMd = GoogleFonts.poppins(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    height: 32 / 24,
    color: AppColors.ink,
  );

  static final title = GoogleFonts.poppins(
    fontSize: 20,
    fontWeight: FontWeight.w700,
    height: 28 / 20,
    color: AppColors.ink,
  );

  static final bodyLg = GoogleFonts.inter(
    fontSize: 18,
    fontWeight: FontWeight.w400,
    height: 28 / 18,
    color: AppColors.body,
  );

  static final body = GoogleFonts.inter(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 24 / 16,
    color: AppColors.body,
  );

  static final bodySm = GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 20 / 14,
    color: AppColors.body,
  );

  static final caption = GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    height: 16 / 12,
    color: AppColors.body,
  );

  static final overline = GoogleFonts.inter(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    height: 14 / 11,
    letterSpacing: 0.4,
    color: AppColors.body,
  );

  /// Label penekanan (tombol, harga, chip aktif) — Inter Semi Bold eksplisit.
  static final label = GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: AppColors.ink,
  );

  static final labelSm = GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    color: AppColors.ink,
  );

  static final titleSm = GoogleFonts.inter(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.ink,
  );
}
