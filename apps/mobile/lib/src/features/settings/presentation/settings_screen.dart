import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/settings_state.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../data/models/app_settings.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_dialog.dart';
import '../../../shared/widgets/dn_switch.dart';
import 'settings_widgets.dart';

/// Layar Pengaturan (Node Figma: 81:877).
///
/// Halaman indeks setelan tanpa BottomNav, jadi memakai AppBar Kembali.
/// Setiap baris membuka sub-layar lewat `context.push`; tiap baris juga punya
/// parameter callback agar layar bisa diuji tanpa router.
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({
    super.key,
    this.onOpenAccount,
    this.onOpenNotifications,
    this.onOpenTheme,
    this.onOpenPrivacy,
    this.onOpenFaq,
    this.onOpenFeedback,
    this.onLogout,
    this.onBack,
  });

  final VoidCallback? onOpenAccount;
  final VoidCallback? onOpenNotifications;
  final VoidCallback? onOpenTheme;
  final VoidCallback? onOpenPrivacy;
  final VoidCallback? onOpenFaq;
  final VoidCallback? onOpenFeedback;
  final VoidCallback? onLogout;
  final VoidCallback? onBack;

  static String themeLabel(ThemePreference theme) => switch (theme) {
    ThemePreference.terang => 'Terang',
    ThemePreference.sistem => 'Ikuti sistem',
    ThemePreference.gelap => 'Gelap',
  };

  void _open(BuildContext context, VoidCallback? override, String path) {
    if (override != null) {
      override();
    } else {
      context.push(path);
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<SettingsState>();
    final settings = store.settings;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: SettingsAppBar(
        title: 'Pengaturan',
        onBack: onBack ?? () => context.pop(),
      ),
      body: SafeArea(
        top: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.s5,
            AppSpacing.s4,
            AppSpacing.s5,
            AppSpacing.s5,
          ),
          children: [
            SettingsGroup(
              label: 'AKUN',
              children: [
                SettingsRowTile(
                  label: 'Akun',
                  icon: AppIcons.user,
                  value: settings.accountName,
                  onTap: () => _open(context, onOpenAccount, '/settings/account'),
                ),
                SettingsRowTile(
                  label: 'Notifikasi',
                  icon: AppIcons.bell,
                  onTap: () =>
                      _open(context, onOpenNotifications, '/settings/notifications'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.s5),
            SettingsGroup(
              label: 'APLIKASI',
              children: [
                SettingsRowTile(
                  label: 'Tema dan bahasa',
                  icon: AppIcons.palette,
                  value: themeLabel(settings.theme),
                  onTap: () => _open(context, onOpenTheme, '/settings/theme'),
                ),
                SettingsRowTile(
                  label: 'Privasi dan keamanan',
                  icon: AppIcons.shield,
                  onTap: () =>
                      _open(context, onOpenPrivacy, '/settings/privacy'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.s5),
            SettingsGroup(
              label: 'BANTUAN',
              children: [
                SettingsRowTile(
                  label: 'Bantuan dan FAQ',
                  icon: AppIcons.helpCircle,
                  onTap: () => _open(context, onOpenFaq, '/settings/faq'),
                ),
                SettingsRowTile(
                  label: 'Kirim masukan',
                  icon: AppIcons.messageSquare,
                  onTap: () =>
                      _open(context, onOpenFeedback, '/settings/feedback'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.s5),
            SettingsGroup(
              label: 'PREFERENSI',
              footer: 'Mode hemat data membuat gambar dimuat pada resolusi '
                  'lebih kecil untuk menghemat kuota.',
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.s4,
                    vertical: AppSpacing.s1,
                  ),
                  child: DnSwitch(
                    label: 'Mode hemat data',
                    subtitle: 'Muat gambar resolusi lebih kecil',
                    value: settings.dataSaver,
                    onChanged: store.setDataSaver,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.s5),
            SettingsGroup(
              label: 'SESI',
              children: [
                SettingsRowTile(
                  label: 'Keluar',
                  icon: AppIcons.logOut,
                  foreground: AppColors.danger,
                  onTap: () async {
                    final confirmed = await showDnDialog(
                      context,
                      title: 'Keluar dari akun?',
                      message:
                          'Kamu perlu masuk lagi untuk membuka rencana dan '
                          'checklist yang tersimpan.',
                      type: DnDialogType.destruktif,
                      confirmLabel: 'Keluar',
                      cancelLabel: 'Batal',
                      icon: AppIcons.logOut,
                    );
                    if (confirmed != true || !context.mounted) return;
                    final logout = onLogout;
                    if (logout != null) {
                      logout();
                    } else {
                      context.go('/login');
                    }
                  },
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.s5),
            Text(
              'Dolenae.id · versi 1.0.0',
              style: AppTextStyles.caption,
            ),
          ],
        ),
      ),
    );
  }
}