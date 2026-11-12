import 'package:flutter/material.dart';

import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

/// Pengingat lembut agar wisatawan memverifikasi email (soft verification).
///
/// Akun tetap bisa dipakai; banner hanya memberi tahu bahwa tautan verifikasi
/// sudah dikirim dan menyediakan aksi "Kirim ulang".
class DnEmailVerificationBanner extends StatelessWidget {
  const DnEmailVerificationBanner({
    super.key,
    required this.email,
    required this.onResend,
    this.isSending = false,
    this.sent = false,
  });

  final String email;
  final VoidCallback onResend;
  final bool isSending;

  /// Tautan sudah dikirim ulang pada sesi ini.
  final bool sent;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s4,
        AppSpacing.s4,
        0,
      ),
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.35)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(AppIcons.mail, size: 20, color: AppColors.warning),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Verifikasi email kamu', style: AppTextStyles.titleSm),
                const SizedBox(height: 2),
                Text(
                  sent
                      ? 'Tautan sudah dikirim ulang ke $email. Cek inbox atau folder spam.'
                      : 'Kami mengirim tautan verifikasi ke $email. Buka tautannya agar notifikasi penting sampai.',
                  style: AppTextStyles.bodySm.copyWith(color: AppColors.body),
                ),
                const SizedBox(height: AppSpacing.s1),
                TextButton.icon(
                  onPressed: (isSending || sent) ? null : onResend,
                  icon: isSending
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Icon(
                          sent ? AppIcons.check : AppIcons.send,
                          size: 16,
                        ),
                  label: Text(sent ? 'Terkirim' : 'Kirim ulang'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.warning,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.s2,
                    ),
                    minimumSize: const Size(0, 44),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    textStyle: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
