import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/notifications/domain/entities/app_notification.dart';

abstract interface class NotificationRepository {
  List<AppNotification> get notifications;
  void setSession(String? userId);
  Future<Result<void>> load();
  Future<Result<void>> markRead(String id);
  Future<Result<void>> markAllRead();
}
