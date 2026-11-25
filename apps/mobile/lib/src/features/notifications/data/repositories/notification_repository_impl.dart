import 'package:dolenae_mobile/src/features/notifications/data/data_sources/notification_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/repositories/notification_repository.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  NotificationRepositoryImpl()
    : _notifications = List.of(NotificationSeedData.items);

  final List<AppNotification> _notifications;

  @override
  List<AppNotification> get notifications =>
      List.unmodifiable(_notifications);

  @override
  void markRead(String id) {
    final index = _notifications.indexWhere((item) => item.id == id);
    if (index == -1 || _notifications[index].read) return;
    _notifications[index] = _notifications[index].copyWith(read: true);
  }

  @override
  void markAllRead() {
    for (var i = 0; i < _notifications.length; i++) {
      if (!_notifications[i].read) {
        _notifications[i] = _notifications[i].copyWith(read: true);
      }
    }
  }
}
