import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_dialog.dart';

/// Mencegah aplikasi tertutup tanpa konfirmasi saat tombol back ditekan di
/// halaman root.
///
/// Bila masih ada halaman lain di tumpukan navigasi, back tetap memanggil
/// `pop` seperti biasa. Konfirmasi hanya muncul ketika pengguna berada di
/// halaman paling dasar.
class DnExitGuard extends StatelessWidget {
  const DnExitGuard({super.key, required this.child});

  final Widget child;

  Future<void> _handleBack(BuildContext context) async {
    if (context.canPop()) {
      context.pop();
      return;
    }

    final shouldExit = await showDnDialog(
      context,
      title: 'Yakin ingin keluar?',
      message:
          'Kamu akan keluar dari Dolenae.id. Progres perjalananmu tetap '
          'tersimpan dan bisa dilanjutkan saat aplikasi dibuka lagi.',
      type: DnDialogType.destruktif,
      confirmLabel: 'Keluar',
      cancelLabel: 'Batal',
      icon: AppIcons.logOut,
    );

    if (shouldExit == true) {
      await SystemNavigator.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Kalau masih ada halaman sebelumnya, biarkan back normal (termasuk
    // swipe-back iOS). Guard hanya aktif di halaman paling dasar.
    final canPop = context.canPop();

    return PopScope<bool>(
      canPop: canPop,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _handleBack(context);
      },
      child: child,
    );
  }
}
