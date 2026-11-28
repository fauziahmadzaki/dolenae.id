import 'package:flutter/foundation.dart';

import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/repositories/notification_repository.dart';

class NotificationsController extends ChangeNotifier {
  NotificationsController(this._repository);

  final NotificationRepository _repository;
  bool _isLoading = false;
  Future<void>? _inFlight;

  bool get isLoading => _isLoading;

  List<AppNotification> get notifications => _repository.notifications;

  List<AppNotification> get todayNotifications =>
      _repository.notifications.where((item) => item.isToday).toList();

  List<AppNotification> get earlierNotifications =>
      _repository.notifications.where((item) => !item.isToday).toList();

  int get unreadCount =>
      _repository.notifications.where((item) => !item.read).length;

  Future<void> load() {
    final existing = _inFlight;
    if (existing != null) return existing;

    final future = _performLoad();
    _inFlight = future;
    return future;
  }

  Future<void> _performLoad() async {
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.load();
    } finally {
      _isLoading = false;
      _inFlight = null;
      notifyListeners();
    }
  }

  void markNotificationRead(String id) {
    _repository.markRead(id);
    notifyListeners();
  }

  void markAllNotificationsRead() {
    _repository.markAllRead();
    notifyListeners();
  }
}
