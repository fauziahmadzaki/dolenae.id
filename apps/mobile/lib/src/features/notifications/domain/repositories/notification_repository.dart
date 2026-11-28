import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';

abstract interface class NotificationRepository {
  List<AppNotification> get notifications;

  Future<Result<List<AppNotification>>> load();

  void markRead(String id);

  void markAllRead();
}
