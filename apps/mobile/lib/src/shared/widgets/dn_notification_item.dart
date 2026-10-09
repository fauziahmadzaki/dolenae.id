import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_radius.dart';
import '../../app/theme/app_spacing.dart';
import '../../app/theme/app_text_styles.dart';
import '../../data/models/app_notification.dart';
import '../icons/app_icons.dart';

/// Baris notifikasi (component `NotificationItem (Alam)`).
class DnNotificationItem extends StatelessWidget {
  const DnNotificationItem({
    super.key,
    required this.notification,
    this.onTap,
    this.showDate = false,
  });

  final AppNotification notification;
  final VoidCallback? onTap;
  final bool showDate;

  IconData get _icon => switch (notification.kind) {
    NotificationKind.rekomendasi => AppIcons.sparkles,
    NotificationKind.rencana => AppIcons.route,
    NotificationKind.checklist => AppIcons.squareCheck,
    NotificationKind.usulan => AppIcons.messageSquare,
    NotificationKind.sistem => AppIcons.info,
  };

  /// Label waktu ringkas, mis. "2 jam lalu".
  String get _timeLabel {
    final delta = DateTime.now().difference(notification.createdAt);
    if (delta.inMinutes < 60) {
      return '${delta.inMinutes.clamp(1, 59)} menit lalu';
    }
    if (delta.inHours < 24) return '${delta.inHours} jam lalu';
    if (delta.inDays < 30) return '${delta.inDays} hari lalu';
    return notification.kindLabel;
  }

  @override
  Widget build(BuildContext context) {
    final unread = !notification.read;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.s4),
        decoration: BoxDecoration(
          color: unread ? AppColors.canvasSubtle : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(
            color: unread ? AppColors.hairline : Colors.transparent,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.canvas,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Icon(_icon, size: 18, color: AppColors.primary),
            ),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: AppTextStyles.titleSm.copyWith(
                            color: unread ? AppColors.ink : AppColors.body,
                          ),
                        ),
                      ),
                      if (unread) ...[
                        const SizedBox(width: AppSpacing.s2),
                        Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.only(top: 6),
                          decoration: const BoxDecoration(
                            color: AppColors.accent,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s1),
                  Text(notification.body, style: AppTextStyles.bodySm),
                  const SizedBox(height: AppSpacing.s2),
                  Text(
                    showDate ? notification.kindLabel : _timeLabel,
                    style: AppTextStyles.overline,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
