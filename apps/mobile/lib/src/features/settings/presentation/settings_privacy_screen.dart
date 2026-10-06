import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/dolenae_store.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_buttons.dart';
import 'settings_widgets.dart';

/// Layar Privasi dan Keamanan (Node Figma: 81:1180).
///
/// Tiga grup: keamanan akun, privasi, dan data saya. Sakelar privasi langsung
/// terikat ke [DolenaeStore].
class SettingsPrivacyScreen extends StatelessWidget {
  const SettingsPrivacyScreen({
    super.key,
    this.onChangePassword,
    this.onBack,
  });

  final VoidCallback? onChangePassword;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final store = context.watch<DolenaeStore>();
    final privacy = store.settings.privacy;

    return SettingsScaffold(
      title: 'Privasi dan keamanan',
      onBack: onBack ?? () => context.pop(),
      children: [
        SettingsGroup(
          label: 'KEAMANAN AKUN',
          children: [
            SettingsSwitchTile(
              label: 'Verifikasi dua langkah',
              subtitle: 'Minta OTP setiap kali masuk dari perangkat baru',
              value: privacy.twoFactor,
              onChanged: (value) => store.setPrivacyPreference(twoFactor: value),
            ),
            SettingsRowTile(
              label: 'Ganti kata sandi',
              icon: AppIcons.lock,
              onTap:
                  onChangePassword ?? () => context.push('/auth/change-password'),
            ),
          ],
        ),
        const SizedBox(height: 48),
        SettingsGroup(
          label: 'PRIVASI',
          children: [
            SettingsSwitchTile(
              label: 'Profil publik',
              subtitle: 'Pengguna lain bisa melihat profilmu',
              value: privacy.profilPublik,
              onChanged: (value) =>
                  store.setPrivacyPreference(profilPublik: value),
            ),
            SettingsSwitchTile(
              label: 'Bagikan aktivitas',
              subtitle: 'Tampilkan rencana dan checklist di profilmu',
              value: privacy.bagikanAktivitas,
              onChanged: (value) =>
                  store.setPrivacyPreference(bagikanAktivitas: value),
            ),
            SettingsSwitchTile(
              label: 'Analitik penggunaan',
              subtitle: 'Bantu kami menambah fitur yang paling dipakai',
              value: privacy.analitik,
              onChanged: (value) =>
                  store.setPrivacyPreference(analitik: value),
            ),
          ],
        ),
        const SizedBox(height: 48),
        SettingsGroup(
          label: 'DATA SAYA',
          footer: 'Kami memakai data untuk menyusun rekomendasi. Kami tidak '
              'menjual data pribadi ke pihak ketiga.',
          children: [
            Padding(
              padding: const EdgeInsets.all(AppSpacing.s4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        AppIcons.shield,
                        size: 18,
                        color: AppColors.success,
                      ),
                      const SizedBox(width: AppSpacing.s3),
                      Expanded(
                        child: Text(
                          'Data dipakai untuk menyelaraskan rekomendasi dan '
                          'menyusun itinerary. Kamu bisa menarik persetujuan '
                          'ini kapan saja.',
                          style: AppTextStyles.bodySm,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  DnOutlineButton(
                    label: 'Minta salinan data',
                    height: 44,
                    onPressed: () {},
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
