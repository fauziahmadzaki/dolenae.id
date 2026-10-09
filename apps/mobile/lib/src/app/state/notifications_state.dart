import 'package:flutter/foundation.dart';

import '../../data/models/app_notification.dart';
import '../../data/seed/seed_data.dart';

class NotificationsState extends ChangeNotifier {
  NotificationsState() : _notifications = List.of(SeedData.notifications);

  final List<AppNotification> _notifications;

  List<AppNotification> get notifications =>
      List<AppNotification>.unmodifiable(_notifications);

  List<AppNotification> get todayNotifications =>
      _notifications.where((notification) => notification.isToday).toList();

  List<AppNotification> get earlierNotifications =>
      _notifications.where((notification) => !notification.isToday).toList();

  int get unreadCount =>
      _notifications.where((notification) => !notification.read).length;

  void markNotificationRead(String id) {
    final index = _notifications.indexWhere((item) => item.id == id);
    if (index == -1 || _notifications[index].read) return;
    _notifications[index] = _notifications[index].copyWith(read: true);
    notifyListeners();
  }

  void markAllNotificationsRead() {
    var changed = false;
    for (var i = 0; i < _notifications.length; i++) {
      if (!_notifications[i].read) {
        _notifications[i] = _notifications[i].copyWith(read: true);
        changed = true;
      }
    }
    if (changed) notifyListeners();
  }
}
