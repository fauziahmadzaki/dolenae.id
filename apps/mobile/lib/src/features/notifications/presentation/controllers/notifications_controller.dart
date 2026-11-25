import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/repositories/notification_repository.dart';

class NotificationsController extends ChangeNotifier {
  NotificationsController(this._repository);

  final NotificationRepository _repository;

  List<AppNotification> get notifications => _repository.notifications;

  List<AppNotification> get todayNotifications =>
      _repository.notifications.where((item) => item.isToday).toList();

  List<AppNotification> get earlierNotifications =>
      _repository.notifications.where((item) => !item.isToday).toList();

  int get unreadCount =>
      _repository.notifications.where((item) => !item.read).length;

  void markNotificationRead(String id) {
    _repository.markRead(id);
    notifyListeners();
  }

  void markAllNotificationsRead() {
    _repository.markAllRead();
    notifyListeners();
  }
}
