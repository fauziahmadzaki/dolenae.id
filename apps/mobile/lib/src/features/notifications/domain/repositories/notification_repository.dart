import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';

abstract interface class NotificationRepository {
  List<AppNotification> get notifications;

  void markRead(String id);

  void markAllRead();
}
