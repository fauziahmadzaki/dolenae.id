import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/features/notifications/presentation/controllers/notifications_controller.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_app_bar.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_notification_item.dart';

/// Layar Notifikasi (Node Figma: 86:1808).
///
/// Dua grup: hari ini dan sebelumnya. Membuka notifikasi menandainya terbaca;
/// aksi di AppBar menandai semuanya terbaca sekaligus.
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({
    super.key,
    this.items,
    this.onOpen,
    this.onMarkAllRead,
    this.onBack,
  });

  /// Daftar notifikasi; bila null dibaca dari [NotificationsController].
  final List<AppNotification>? items;
  final ValueChanged<AppNotification>? onOpen;
  final VoidCallback? onMarkAllRead;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final store = context.watch<NotificationsController>();
    final all = items ?? store.notifications;
    final today = all.where((item) => item.isToday).toList();
    final earlier = all.where((item) => !item.isToday).toList();
    final unread = all.where((item) => !item.read).length;
    final markAll = onMarkAllRead ?? store.markAllNotificationsRead;

    void open(AppNotification notification) {
      final handler = onOpen;
      if (handler != null) {
        handler(notification);
        return;
      }
      store.markNotificationRead(notification.id);
      final href = notification.href;
      if (href == null) return;
      if (href == '/plan') {
        context.go('/plan');
      } else {
        context.push(href);
      }
    }

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: DnAppBar(
        title: 'Notifikasi',
        showBack: true,
        plainBack: true,
        onBack:
            onBack ??
            () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/home');
              }
            },
        trailing: unread == 0
            ? null
            : Tooltip(
                message: '$unread belum dibaca',
                child: TextButton(
                  onPressed: markAll,
                  child: Text(
                    'Tandai dibaca',
                    style: AppTextStyles.label.copyWith(
                      color: AppColors.onPrimary,
                    ),
                  ),
                ),
              ),
      ),
      body: SafeArea(
        top: false,
        child: all.isEmpty
            ? const Padding(
                padding: EdgeInsets.all(AppSpacing.s5),
                child: Center(
                  child: DnEmptyState(
                    variant: DnEmptyVariant.belumAdaData,
                    title: 'Belum ada notifikasi',
                    body:
                        'Pemberitahuan tentang rencana, checklist, dan '
                        'rekomendasi akan muncul di sini.',
                  ),
                ),
              )
            : ListView(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.s4,
                  AppSpacing.s4,
                  AppSpacing.s4,
                  AppSpacing.s5,
                ),
                children: [
                  if (today.isNotEmpty) ...[
                    Text('HARI INI', style: AppTextStyles.overline),
                    const SizedBox(height: AppSpacing.s3),
                    ...today.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.s3),
                        child: DnNotificationItem(
                          notification: item,
                          onTap: () => open(item),
                        ),
                      ),
                    ),
                  ],
                  if (earlier.isNotEmpty) ...[
                    Text('SEBELUMNYA', style: AppTextStyles.overline),
                    const SizedBox(height: AppSpacing.s3),
                    ...earlier.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.s2),
                        child: DnNotificationItem(
                          notification: item,
                          onTap: () => open(item),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
      ),
    );
  }
}
