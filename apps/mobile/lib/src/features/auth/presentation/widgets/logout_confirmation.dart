import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_dialog.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

Future<void> confirmLogout(
  BuildContext context, {
  VoidCallback? onLogout,
}) async {
  final confirmed = await showDnDialog(
    context,
    title: 'Keluar dari akun?',
    message: 'Kamu bisa masuk lagi kapan saja. Rencana dan checklist tetap tersimpan.',
    confirmLabel: 'Keluar',
    icon: AppIcons.logOut,
  );
  if (confirmed != true || !context.mounted) return;

  if (onLogout != null) {
    onLogout();
    return;
  }

  final failure = await context.read<AuthController>().logout();
  if (!context.mounted) return;
  if (failure != null) {
    showDnToast(context, failure.message, type: DnToastType.gagal);
  }
  context.go('/login');
}
