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
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Layar Notifikasi (Node Figma: 86:1808).
///
/// Dua grup: hari ini dan sebelumnya. Membuka notifikasi menandainya terbaca;
/// aksi di AppBar menandai semuanya terbaca sekaligus.
class NotificationsScreen extends StatefulWidget {
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
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && widget.items == null) {
        context.read<NotificationsController>().load();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<NotificationsController>();
    final all = widget.items ?? store.notifications;
    final today = all.where((item) => item.isToday).toList();
    final earlier = all.where((item) => !item.isToday).toList();
    final unread = all.where((item) => !item.read).length;
    final markAll = widget.onMarkAllRead ?? store.markAllNotificationsRead;

    Future<void> open(AppNotification notification) async {
      if (store.isLoading) return;
      final handler = widget.onOpen;
      if (handler != null) {
        handler(notification);
        return;
      }
      if (!notification.read) {
        final result = await store.markNotificationRead(notification.id);
        if (!context.mounted) return;
        if (result.isFailure) {
          showDnToast(context, result.failureOrNull!.message, type: DnToastType.gagal);
          return;
        }
      }
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
        onBack: widget.onBack ?? () => context.pop(),
        trailing: unread == 0
            ? null
            : TextButton(
                onPressed: store.isLoading ? null : markAll,
                child: Text(
                  'Tandai dibaca',
                  style: AppTextStyles.labelSm.copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ),
      ),
      body: SafeArea(
        top: false,
        child: Column(children: [
          if (widget.items == null && store.isLoading)
            const LinearProgressIndicator(),
          if (widget.items == null && store.failure != null)
            Padding(
              padding: const EdgeInsets.all(AppSpacing.s5),
              child: DnEmptyState(
                variant: DnEmptyVariant.gagal,
                body: store.failure!.message,
                onAction: store.isLoading ? null : store.load,
              ),
            ),
          Expanded(child: all.isEmpty && widget.items == null &&
                  (store.isLoading || store.failure != null)
              ? const SizedBox.shrink()
              : all.isEmpty
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
                  AppSpacing.s5,
                  AppSpacing.s4,
                  AppSpacing.s5,
                  AppSpacing.s5,
                ),
                children: [
                  if (unread > 0) ...[
                    Text('$unread belum dibaca', style: AppTextStyles.caption),
                    const SizedBox(height: AppSpacing.s3),
                  ],
                  if (today.isNotEmpty) ...[
                    Text('HARI INI', style: AppTextStyles.overline),
                    const SizedBox(height: AppSpacing.s2),
                    ...today.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.s2),
                        child: DnNotificationItem(
                          notification: item,
                          onTap: store.isLoading ? null : () => open(item),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s4),
                  ],
                  if (earlier.isNotEmpty) ...[
                    Text('SEBELUMNYA', style: AppTextStyles.overline),
                    const SizedBox(height: AppSpacing.s2),
                    ...earlier.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.s2),
                        child: DnNotificationItem(
                          notification: item,
                          onTap: store.isLoading ? null : () => open(item),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
          ),
        ]),
      ),
    );
  }
}
