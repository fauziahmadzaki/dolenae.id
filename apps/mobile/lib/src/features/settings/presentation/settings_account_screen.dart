import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../app/state/dolenae_store.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_text_styles.dart';
import '../../../shared/icons/app_icons.dart';
import '../../../shared/widgets/dn_buttons.dart';
import '../../../shared/widgets/dn_dialog.dart';
import '../../../shared/widgets/dn_toast.dart';
import '../widgets/settings_row.dart';
import 'settings_widgets.dart';

/// Layar Akun (Node Figma: 81:974).
///
/// Kartu informasi akun, grup keamanan, daftar perangkat aktif, dan kartu
/// hapus akun berwarna `danger` yang meminta konfirmasi lewat dialog.
class SettingsAccountScreen extends StatelessWidget {
  const SettingsAccountScreen({
    super.key,
    this.onEditProfile,
    this.onChangePassword,
    this.onOpenDevices,
    this.onDeleteAccount,
    this.onBack,
  });

  final VoidCallback? onEditProfile;
  final VoidCallback? onChangePassword;
  final VoidCallback? onOpenDevices;
  final VoidCallback? onDeleteAccount;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<DolenaeStore>().settings;

    return SettingsScaffold(
      title: 'Akun',
      onBack: onBack ?? () => context.pop(),
      cta: DnOutlineButton(
        label: 'Ubah profil',
        height: 48,
        onPressed: onEditProfile ?? () => context.push('/profile/edit'),
      ),
      children: [
        SettingsSummaryCard(
          rows: [
            (label: 'Nama', value: settings.accountName),
            (label: 'Email', value: settings.accountEmail),
            (label: 'Peran', value: settings.accountRole),
            (label: 'Bergabung', value: settings.memberSince),
          ],
        ),
        const SizedBox(height: AppSpacing.s5),
        SettingsGroup(
          label: 'KEAMANAN',
          children: [
            SettingsRowTile(
              label: 'Kata sandi',
              icon: AppIcons.lock,
              value: 'Diperbarui 3 bulan lalu',
              onTap:
                  onChangePassword ?? () => context.push('/auth/change-password'),
            ),
            SettingsRowTile(
              label: 'Perangkat aktif',
              icon: AppIcons.smartphone,
              value: '${settings.activeDevices.length} perangkat',
              onTap: onOpenDevices,
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.s5),
        SettingsGroup(
          label: 'ZONA BERBAHAYA',
          children: [
            SettingsRowTile(
              label: 'Hapus akun',
              icon: AppIcons.delete,
              foreground: AppColors.danger,
              onTap: () async {
                final confirmed = await showDnDialog(
                  context,
                  title: 'Hapus akun permanen?',
                  message:
                      'Semua rencana, checklist, dan usulan yang tersimpan akan '
                      'dihapus. Tindakan ini tidak bisa dibatalkan.',
                  type: DnDialogType.destruktif,
                  confirmLabel: 'Hapus',
                  icon: AppIcons.delete,
                );
                if (confirmed != true || !context.mounted) return;
                final remove = onDeleteAccount;
                if (remove != null) {
                  remove();
                } else {
                  showDnToast(
                    context,
                    'Permintaan hapus akun dicatat',
                    type: DnToastType.info,
                  );
                }
              },
            ),
          ],
        ),
        if (settings.activeDevices.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.s5),
          Text('PERANGKAT AKTIF', style: AppTextStyles.overline),
          const SizedBox(height: AppSpacing.s2),
          ...settings.activeDevices.map(
            (device) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.s2),
              child: SettingsRow(
                label: device.label,
                icon: device.current ? AppIcons.smartphone : AppIcons.laptop,
                subtitle: device.current
                    ? 'Perangkat ini'
                    : 'Terakhir aktif ${_relative(device.lastActiveAt)}',
              ),
            ),
          ),
        ],
      ],
    );
  }

  /// Waktu relatif sederhana untuk daftar perangkat.
  static String _relative(DateTime time) {
    final delta = DateTime.now().difference(time);
    if (delta.inMinutes < 60) return '${delta.inMinutes.clamp(1, 59)} menit lalu';
    if (delta.inHours < 24) return '${delta.inHours} jam lalu';
    return '${delta.inDays} hari lalu';
  }
}